
// ae.mesh.MeshBuilder
class AEClassMeshBuilder extends AEClassJavaObject {
	
	// The mesh is cached to be reused
	_lastValidMesh: ae.util.CachedObject<ae.mesh.Mesh>;
	
	// Mesh data
	_dynVertices:  ae.util.GrowingList<ae.mesh.Vertex>;
	_dynTriangles: ae.util.GrowingList<ae.mesh.Triangle>;
	_vertices:     Array              <ae.mesh.Vertex>;
	_triangles:    Array              <ae.mesh.Triangle>;
	
	// Information data lists are used
	_verticesSealed:  boolean;
	_trianglesSealed: boolean;
	
	_tempGL: WebGLRenderingContext;
	
	// Public meta information
	cullFacing: boolean;
	
	_assertTrianglesNotSealed() {
		ae.util.assert(!this._trianglesSealed, "Triangles are already sealed");
	}

	_assertTrianglesSealed() {
		ae.util.assert(this._trianglesSealed, "Triangles are not sealed yet");
	}

	_assertVerticesNotSealed() {
		ae.util.assert(!this._verticesSealed, "Vertices are already sealed");
	}
	
	_assertVerticesSealed() {
		ae.util.assert(this._verticesSealed, "Vertices are not sealed yet");
	}
	
	// The function checks whether there are vertices that belong to triangles
	// with different smoothing groups. These vertices are split into new
	// vertices.
	_ensureConsistentSmoothingGroups(adjacency: ae.mesh.Adjacency): boolean {
		
		const smoothingGroups = Array(this._vertices.length);
		const auxArray        = Array(adjacency._maxAdjacencyCount);
		const vIndexMap       = Array(this._vertices.length);
		const oldVertices     = this._vertices;
		
		let newVertexCount = 0;
		
		for(let i = 0; i < this._vertices.length; i++) {
			smoothingGroups[i] = this._vertices[i]._collectSmoothingGroups(
				adjacency._data[i], auxArray);
			vIndexMap[i]       = newVertexCount;
			newVertexCount    += smoothingGroups[i].length;
		}
		
		// Abort if each vertex belongs to exactly one smoothing group
		if(newVertexCount === this._vertices.length) return true;
		
		this.allocateVertices(newVertexCount);
		
		// Copy the old vertices into the new array
		// (as often as it has smoothing groups)
		for(let i = 0; i < oldVertices.length; i++)
			for(let j = 0; j < smoothingGroups[i].length; j++)
				this._vertices[vIndexMap[i] + j]._assign(oldVertices[i]);
		
		// Map the vertex indices to the new created vertices
		this._mapVIndices((triangle, vIndex) =>
			vIndexMap[vIndex] +
			AEClassMeshBuilder._getValuePos(
				smoothingGroups[vIndex], triangle._smoothingGroup));
		
		return false;
	}
	
	static _getValuePos(
			array: Array<number>,
			value: number): number {
		
		for(let i = 0; i < array.length; i++) if(array[i] === value) return i;
		return -1;
	}
	
	_invalidateMesh(): ae.mesh.MeshBuilder {
		this._lastValidMesh.invalidate();
		return this;
	}
	
	_mapVIndices(
			mapper: (triangle: ae.mesh.Triangle, vIndex: number) => number) {
		
		this.forEachTriangle((triangle, index) => {
			triangle._vIndices[0] = mapper(triangle, triangle._vIndices[0]);
			triangle._vIndices[1] = mapper(triangle, triangle._vIndices[1]);
			triangle._vIndices[2] = mapper(triangle, triangle._vIndices[2]);
		});
	}
	
	constructor() {
		
		super();
		
		this._lastValidMesh   = new ae.util.CachedObject(
			null, (object) => new ae.mesh.Mesh(this._tempGL, this));
		this._dynVertices     = new ae.util.GrowingList();
		this._dynTriangles    = new ae.util.GrowingList();
		this._vertices        = [];
		this._triangles       = [];
		this._verticesSealed  = false;
		this._trianglesSealed = false;
		this.cullFacing       = true;
	}
	
	get triangleCount(): number {
		return (this._triangles ? this._triangles : this._dynTriangles).length;
	}
	
	get vertexCount(): number {
		return (this._vertices ? this._vertices : this._dynVertices).length;
	}
	
	activeCullFaceSupport(): ae.mesh.MeshBuilder {
		this.cullFacing = true;
		return this;
	}
	
	addPolygonA(
			smoothingGroup: number,
			vIndices:       Array<number>): ae.mesh.MeshBuilder {
		
		this._assertTrianglesNotSealed();
		
		for(let i = 2; i < vIndices.length; i++)
			this._dynTriangles.add(new ae.mesh.Triangle(this).
				setIndicesB      (vIndices[0], vIndices[i - 1], vIndices[i]).
				setSmoothingGroup(smoothingGroup));
		
		return this._invalidateMesh();
	}
	
	addPolygonB(
			smoothingGroup: number,
			... vIndices:   Array<number>): ae.mesh.MeshBuilder {
		
		return this.addPolygonA(smoothingGroup, vIndices);
	}
	
	addVertex(vertex: ae.mesh.Vertex): ae.mesh.MeshBuilder {
		
		this._assertVerticesNotSealed();
		
		this._dynVertices.add(vertex);
		return this._invalidateMesh();
	}

	allocateTriangles(triangleCount: number): ae.mesh.MeshBuilder {
		
		this._triangles       = Array(triangleCount);
		this._trianglesSealed = true;
		
		for(let i = 0; i < triangleCount; i++)
			this._triangles[i] = new ae.mesh.Triangle(this);
		
		return this._invalidateMesh();
	}
	
	allocateVertices(vertexCount: number): ae.mesh.MeshBuilder {
		
		this._vertices       = Array(vertexCount);
		this._verticesSealed = true;
		
		for(let i = 0; i < vertexCount; i++)
			this._vertices[i] = new ae.mesh.Vertex(this);
		
		return this._invalidateMesh();
	}
	
	collapseSmoothingGroups(): ae.mesh.MeshBuilder {
		
		const sgMap: {[key: number]: number} = {};
		let   curSG                          = 0;
		
		// Fill the smoothing group mapping
		this.forEachTriangle((triangle, index) => {
			if(!(triangle._smoothingGroup in sgMap))
				sgMap[triangle._smoothingGroup] = curSG++;
		});
		
		// Apply the smoothing group mapping
		this.forEachTriangle((triangle, index) => {
			triangle._smoothingGroup = sgMap[triangle._smoothingGroup];
		});
		
		return this._invalidateMesh();
	}
	
	computeNormals(): ae.mesh.MeshBuilder {
		
		this._assertVerticesSealed();
		
		let adjacency = new ae.mesh.Adjacency(this);
		
		// If the vertex data has changed due to inconsistent smoothing groups,
		// a new adjacency is computed
		if(!this._ensureConsistentSmoothingGroups(adjacency))
			adjacency = new ae.mesh.Adjacency(this);
		
		const flatNormals    =
			ae.util.create2DimArray(this._triangles.length, 3);
		const triangleAngles =
			ae.util.create2DimArray(this._triangles.length, 3);
		const vertexAngles   = Array(adjacency._maxAdjacencyCount);
		
		for(let i = 0; i < this._triangles.length; i++)
			this._triangles[i]._computeNormalAndAngles(
				flatNormals[i], triangleAngles[i]);
		
		for(let i = 0; i < this._vertices.length; i++) {
			
			const vertex       = this._vertices[i];
			const curAdjacency = adjacency._data[i];
			
			for(let j = 0; j < curAdjacency.length; j++)
				vertexAngles[j] = triangleAngles
					[curAdjacency[j]]
					[AEClassMeshBuilder._getValuePos(
						this._triangles[curAdjacency[j]]._vIndices, i)];
			
			vertex._computeSmoothNormal(
				flatNormals, curAdjacency, vertexAngles);
		}
		
		return this._invalidateMesh();
	}

	createMesh(gl: WebGLRenderingContext): ae.mesh.Mesh {
		this._tempGL = gl;
		return this._lastValidMesh.object;
	}
	
	createDefaultPolygons(degree: number): ae.mesh.MeshBuilder {
		
		ae.util.assert(
			degree >= 3, "Polygon must consist of at least 3 vertices");
		
		this._assertVerticesSealed();
		
		const polygonCount    = (this._vertices.length / degree);
		const polygonTriCount = degree - 2;
		
		this.allocateTriangles(polygonCount * polygonTriCount);
		
		for(let i = 0; i < polygonCount; i++) {
			for(let j = 0; j < polygonTriCount; j++) {
				
				const vIndices =
					this._triangles[i * polygonTriCount + j]._vIndices;
				
				vIndices[0] = i * degree;
				vIndices[1] = i * degree + j + 1;
				vIndices[2] = i * degree + j + 2;
			}
		}
		
		return this;
	}

	createDefaultQuads(): ae.mesh.MeshBuilder {
		return this.createDefaultPolygons(4);
	}
	
	createDefaultTriangles(): ae.mesh.MeshBuilder {
		return this.createDefaultPolygons(3);
	}
	
	fillTriangleData(filler: IndexedVisitor<ae.mesh.Triangle>):
		ae.mesh.MeshBuilder {
		
		this._assertTrianglesSealed();
		for(let i = 0; i < this._triangles.length; i++)
			filler(this._triangles[i], i);
		
		return this._invalidateMesh();
	}
	
	fillVertexData(filler: IndexedVisitor<ae.mesh.Vertex>):
		ae.mesh.MeshBuilder {
		
		this._assertVerticesSealed();
		for(let i = 0; i < this._vertices.length; i++)
			filler(this._vertices[i], i);
		
		return this._invalidateMesh();
	}
	
	forEachVertex(visitor: Visitor<ae.mesh.Vertex>): ae.mesh.MeshBuilder {
		
		const vertexCount = this.vertexCount;
		
		if(this._vertices) {
			this._vertices.forEach(visitor);
		} else {
			for(let i = 0; i < vertexCount; i++)
				visitor(this._dynVertices.get(i));
		}
		
		return this._invalidateMesh();
	}
	
	forEachTriangle(visitor: Visitor<ae.mesh.Triangle>): ae.mesh.MeshBuilder {
		
		const triangleCount = this.triangleCount;
		
		if(this._triangles) {
			for(let i = 0; i < triangleCount; i++)
				visitor(this._triangles[i]);
		} else {
			for(let i = 0; i < triangleCount; i++)
				visitor(this._dynTriangles.get(i));
		}
		
		return this._invalidateMesh();
	}
	
	getTriangle(tIndex: number): ae.mesh.Triangle {
		this._assertTrianglesSealed();
		return this._triangles[tIndex];
	}
	
	getVertex(vIndex: number): ae.mesh.Vertex {
		this._assertVerticesSealed();
		return this._vertices[vIndex];
	}
	
	invertFaceOrientation(): ae.mesh.MeshBuilder {
		
		// Swap index order of each triangle
		this.forEachTriangle((triangle) => {
			const temp            = triangle._vIndices[1];
			triangle._vIndices[1] = triangle._vIndices[2];
			triangle._vIndices[2] = temp;
		});
		
		return this._invalidateMesh();
	}
	
	invertNormals(): ae.mesh.MeshBuilder {
		
		this.forEachVertex((vertex) => {
			for(let i = 0; i < 3; i++) vertex._normal[i] *= -1;
		});
		
		return this._invalidateMesh();
	}
	
	makeFlat(): ae.mesh.MeshBuilder {
		
		let curSGroup = 0;
		
		this.forEachTriangle(
			(triangle) => triangle._smoothingGroup = curSGroup++);
		
		return this._invalidateMesh();
	}
	
	makeSmooth(): ae.mesh.MeshBuilder {
		this.forEachTriangle((triangle) => triangle._smoothingGroup = 0);
		return this._invalidateMesh();
	}
	
	static merge(... meshes: Array<ae.mesh.MeshBuilder>): ae.mesh.MeshBuilder {

		const mesh          = new ae.mesh.MeshBuilder();
		const vIndexOffsets = Array(meshes.length);
		
		let vertexCount   = 0;
		let triangleCount = 0;
		let vIndex        = 0;
		let tIndex        = 0;
		
		for(let i = 0; i < meshes.length; i++) {
			vIndexOffsets[i] = vertexCount;
			vertexCount     += meshes[i].vertexCount;
			triangleCount   += meshes[i].triangleCount;
		}
		
		mesh.allocateVertices (vertexCount);
		mesh.allocateTriangles(triangleCount);
		
		for(let i = 0; i < meshes.length; i++)
			meshes[i].
				forEachVertex(
					(vertex)   => mesh._vertices [vIndex++]._assign(vertex)).
				forEachTriangle(
					(triangle) => mesh._triangles[tIndex++]._assign(triangle));
		
		return mesh;
	}

	seal(): ae.mesh.MeshBuilder {
		return this.sealVertices().sealTriangles();
	}
	
	sealTriangles(): ae.mesh.MeshBuilder {
		
		if(this._triangles) return this;
    	
		if(this._dynTriangles.empty) {
			this.createDefaultTriangles();
		} else {
			this._triangles = this._dynTriangles.array;
			this._dynTriangles.clear();
		}
		
		return this._invalidateMesh();
	}
	
	sealVertices(): ae.mesh.MeshBuilder {
		
		if(this._vertices) return this;
		
    	this._vertices = this._dynVertices.array;
    	this._dynVertices.clear();
    	
    	return this._invalidateMesh();
	}

	setPolygon(
			startIndex:     number,
			smoothingGroup: number,
			... vIndices:   Array<number>): ae.mesh.MeshBuilder {
		
		this._assertTrianglesSealed();
		
		for(let i = 2; i < vIndices.length; i++)
			this._triangles[startIndex + i - 2].
				setIndicesB      (vIndices[0], vIndices[i - 1], vIndices[i]).
				setSmoothingGroup(smoothingGroup);
		
		return this._invalidateMesh();
	}
	
	spliceUnusedVertices(): ae.mesh.MeshBuilder {

		this._assertVerticesSealed();
		
		// The index map assigns each vertex a mapped index
		const oldVertices    = this._vertices;
		const indexMap       = Array(this._vertices.length);
		let   curMappedIndex = 0;
		
		// Initialize the map with -1, saying that all vertices should be
		// spliced
		for(let i = 0; i < indexMap.length; i++) indexMap[i] = -1;
		
		// After having looped all indices, 'curMappedIndex' contains the number
		// of actual referenced vertices
		this._mapVIndices((triangle, vIndex) => {
			if(indexMap[vIndex] === -1) indexMap[vIndex] = curMappedIndex++;
			return vIndex;
		});
		
		// Abort if all vertices are used
		if(curMappedIndex === this._vertices.length) return this;
		
		this.allocateVertices(curMappedIndex);
		
		// Set the new indices based on the previous computed mapping
		this._mapVIndices((triangle, vIndex) => indexMap[vIndex]);
		
		// Copy all vertices to their new positions if the index map entry is
		// not -1
		for(let i = 0; i < oldVertices.length; i++)
			if(indexMap[i] >= 0)
				this._vertices[indexMap[i]]._assign(oldVertices[i]);
		
		return this._invalidateMesh();
	}
	
	transformPositions(transform: ae.math.Matrix4D): ae.mesh.MeshBuilder {
		
		this.forEachVertex((vertex) => {
			transform.applyToPointArray    (vertex._position);
			transform.applyToDirVectorArray(vertex._normal);
    		transform.applyToDirVectorArray(vertex._uTangent);
    		transform.applyToDirVectorArray(vertex._vTangent);
		});
		
		return this._invalidateMesh();
	}

	transformTexCoords(transform: ae.math.Matrix4D): ae.mesh.MeshBuilder {
		this.forEachVertex(
			(vertex) => transform.applyToPointArray(vertex._texCoord));
		return this._invalidateMesh();
	}
}
