
ae.mesh.MeshBuilder = class MeshBuilder {
	
	// The actual mesh will be cached
	_lastValidMesh: ae.util.CachedObject<ae.mesh.Mesh>;
	
	// Meta information
	_primitiveType:    ae.mesh.PrimitiveTypeEnumClass;
	_primitiveTypeSet: boolean;
	_autoNormals:      boolean;
	_precision:        number;
	
	// Geometry data
	_indices:   ?Array<Array<number>>;
	_positions: ?Array<Array<number>>;
	_normals:   ?Array<Array<number>>;
	_texCoords: ?Array<Array<number>>;
	
	// Public meta information
	cullFacing: boolean;
	
	_assertNewPositionArrayPossible(vertexCount: number): void {
		
		if(this._normals && this._normals.length != vertexCount)
			throw "Normal array with different size already specified";
		
		if(this._texCoords && this._texCoords.length != vertexCount)
			throw "Tex-coord array with different size already specified";
	}
	
	_assertIndicesNotNull(): Array<Array<number>> {
		
		return ae.util.assertNotNull(this._indices, "No indices specified");
	}
	
	_assertNormalsNotNull(): Array<Array<number>> {
		
		return ae.util.assertNotNull(this._normals, "No normals specified");
	}
	
	_assertPositionsNotNull(): Array<Array<number>> {
		
		return ae.util.assertNotNull(this._positions, "No positions specified");
	}
	
	_assertTexCoordsNotNull(): Array<Array<number>> {
		
		return ae.util.assertNotNull(
			this._texCoords, "No tex-coords specified");
	}
	
	_compareFloats(
			f1: number,
			f2: number): boolean {
		
		return Math.abs(f1 - f2) < this._precision;
	}
	
	_computeFlatNormals(normalize: boolean): void {
		
		const normal    = Array(3);
		const positions = this._assertPositionsNotNull();
		const normals   = this.createNormalArray();
		
		for(var i = 0; i < positions.length; i += this._primitiveType.size) {
			
			switch(this._primitiveType) {
				
				case ae.mesh.PrimitiveType.TRIANGLE:
					this._computeTriangleNormal(
						i, i + 1, i + 2, normal, normalize);
					break;
				
				case ae.mesh.PrimitiveType.QUAD:
					this._computeQuadNormal(
						i, i + 1, i + 2, i + 3, normal, normalize);
					break;
			}
			
			// Assign a copy of the normal to all vertices of the current
			// primitive
			for(var j = 0; j < this._primitiveType.size; j++)
				ae.util.copy1DimArray(normal, 0, normals[i + j], 0, 3);
		}
	}
	
	_computeQuadNormal(
    		iP0:       number,
    		iP1:       number,
    		iP2:       number,
    		iP3:       number,
    		n:         Array<number>,
    		normalize: boolean): Array<number> {
		
		const positions = this._assertPositionsNotNull();
		
		const p0 = positions[iP0];
		const p1 = positions[iP1];
		const p2 = positions[iP2];
		const p3 = positions[iP3];
		
		var equP0P1      = true;
		var equP1P2      = true;
		var equP2P3      = true;
		var equP3P0      = true;
		var allDifferent = false;
		
		for(var i = 0; i < 3 && !allDifferent; i++) {
			
			if(equP0P1) equP0P1 = this._compareFloats(p0[i], p1[i]);
			if(equP1P2) equP1P2 = this._compareFloats(p1[i], p2[i]);
			if(equP2P3) equP2P3 = this._compareFloats(p2[i], p3[i]);
			if(equP3P0) equP3P0 = this._compareFloats(p3[i], p0[i]);
			
			if(!equP0P1 && !equP1P2 && !equP2P3 && !equP3P0)
				allDifferent = true;
		}
		
		if(allDifferent || equP0P1) {
			ae.util.computeNormalFromPointArrays(p1, p2, p3, n, normalize);
		} else if(equP1P2) {
			ae.util.computeNormalFromPointArrays(p0, p2, p3, n, normalize);
		} else if(equP2P3) {
			ae.util.computeNormalFromPointArrays(p0, p1, p3, n, normalize);
		} else {
			ae.util.computeNormalFromPointArrays(p0, p1, p2, n, normalize);
		}
		
		return n;
	}
	
	_computeTriangleNormal(
			iP0:       number,
			iP1:       number,
			iP2:       number,
			n:         Array<number>,
			normalize: boolean): Array<number> {
		
		const positions = this._assertPositionsNotNull();
		
		return ae.util.computeNormalFromPointArrays(
			positions[iP0], positions[iP1], positions[iP2], n, normalize);
	}
	
	_createCachedMesh(): ae.mesh.Mesh {
		
		this._assertPositionsNotNull();
		
		return new ae.mesh.Mesh(
			this._indices || this._createDefaultIndices(),
			this._assertPositionsNotNull(), this._normals, this._texCoords,
			this._autoNormals, this.cullFacing);
	}
	
	_createDefaultIndices(): Array<Array<number>> {

		if(!this._primitiveTypeSet) throw "Primitive type not specified";
		
		const positions = this._assertPositionsNotNull();
		const indices   = ae.util.create2DimNumberArray(
			Math.floor(positions.length / this._primitiveType.size),
			this._primitiveType.size);
		
		for(var i = 0; i < indices.length; i++)
			for(var j = 0; j < this._primitiveType.size; j++)
				indices[i][j] = i * this._primitiveType.size + j;
		
		return indices;
	}
	
	_resetCompiled(
			oldValue: any,
			newValue: any): void {

		if(oldValue || newValue) this._lastValidMesh.invalidate();
	}
	
	constructor() {
		
		this._lastValidMesh = new ae.util.CachedObject(
			null, (obj: ?ae.mesh.Mesh) => {return this._createCachedMesh();});
		
		this._primitiveType    = ae.mesh.PrimitiveType.TRIANGLE;
		this._primitiveTypeSet = false;
		this._autoNormals      = false;
		this._precision        = 0.00001;
		
		this._indices   = null;
		this._positions = null;
		this._normals   = null;
		this._texCoords = null;
		
		this.cullFacing = false;
	}
	
	get indices():   ?Array<Array<number>> {return this._indices;}
	get normals():   ?Array<Array<number>> {return this._normals;}
	get positions(): ?Array<Array<number>> {return this._positions;}
	get texCoords(): ?Array<Array<number>> {return this._texCoords;}
	
	get mesh(): ae.mesh.Mesh {return this._lastValidMesh.object;}
	
	set primitiveType(type: ae.mesh.PrimitiveTypeEnumClass) {
		
		this._primitiveType    = type;
		this._primitiveTypeSet = true;
	}
	
	set indices(indices: ?Array<Array<number>>) {
		
		this._resetCompiled(this._indices, indices);
		this._indices = indices;
		
		if(indices)
			this.primitiveType =
				ae.mesh.PrimitiveTypeEnumClass.fromPrimitiveSize(
					indices[0].length);
	}
	
	set normals(normals: ?Array<Array<number>>) {
		
		if(normals && normals[0].length != 3)
			throw "A normal vector must consist of 3 components";
		
		if(normals && normals.length != this._assertPositionsNotNull().length)
			throw "Normal and position array must have the same length";
		
		this._resetCompiled(this._normals, normals);
		this._normals     = normals;
		this._autoNormals = false;
	}
	
	set positions(positions: ?Array<Array<number>>) {
		
		if(positions && positions[0].length != 3)
			throw "A position must consist of 3 components";
		
		if(positions) this._assertNewPositionArrayPossible(positions.length);
		
		this._resetCompiled(this._positions, positions);
		this._positions = positions;
	}
	
	set texCoords(texCoords: ?Array<Array<number>>) {
		
		if(texCoords && texCoords[0].length != 2)
			throw "A tex-coord must consist of 2 components";
		
		if(texCoords &&
			texCoords.length != this._assertPositionsNotNull().length)
			throw "Tex-coord and position array must have the same length";
		
		this._resetCompiled(this._texCoords, texCoords);
		this._texCoords = texCoords;
	}
	
	computeNormals(
			flat:      boolean,
			normalize: boolean): ae.mesh.MeshBuilder {

		this._assertPositionsNotNull();
		
		if(this._indices) this.unwrap();
		
		this._computeFlatNormals(normalize);
		
		this._autoNormals = true;

		return this;
	}
	
	createFlatCopy(): ae.mesh.MeshBuilder {
		
		const mesh = new MeshBuilder();
		
		mesh._indices     = this._indices;
		mesh._positions   = this._positions;
		mesh._normals     = this._normals;
		mesh._texCoords   = this._texCoords;
		mesh._autoNormals = this._autoNormals;
		mesh.cullFacing   = this.cullFacing;
		
		return mesh;
	}
	
	createIndexArray(
			polygonCount: number,
			type: ae.mesh.PrimitiveTypeEnumClass): Array<Array<number>> {
		
		const newIndices =
			ae.util.create2DimNumberArray(polygonCount, type.size);
		
		this._indices      = newIndices;
		this.primitiveType = type;
		
		return newIndices;
	}
	
	createNormalArray(): Array<Array<number>> {
		
		const newNormals = ae.util.create2DimNumberArray(
			this._assertPositionsNotNull().length, 3);
		
		this._normals = newNormals;
		
		return newNormals;
	}
	
	createPositionArray(vertexCount: number): Array<Array<number>> {
		
		this._assertNewPositionArrayPossible(vertexCount);
		
		const newPositions = ae.util.create2DimNumberArray(vertexCount, 3);
		
		this._positions = newPositions;
		
		return newPositions;
	}
	
	createTexCoordArray(): Array<Array<number>> {
		
		const newTexCoords = ae.util.create2DimNumberArray(
			this._assertPositionsNotNull().length, 2);
		
		this._texCoords = newTexCoords;
		
		return newTexCoords;
	}
	
	spliceUnusedVertices(): ae.mesh.MeshBuilder {
		
		// TODO
		
		return this;
	}
	
	transformPositions(transform: ae.math.Matrix4D): ae.mesh.MeshBuilder {
		
		const positions = this._assertPositionsNotNull();
		
		for(var i = 0; i < positions.length; i++)
			transform.applyToPoint(positions[i], 0, 3);
		
		if(this._normals)
			for(var i = 0; i < positions.length; i++)
				transform.applyToDirVector(this._normals[i]);

		return this;
	}

	transformTexCoords(transform: ae.math.Matrix4D): ae.mesh.MeshBuilder {
		
		const texCoords = this._assertTexCoordsNotNull();

		for(var i = 0; i < texCoords.length; i++)
			transform.applyToPoint(texCoords[i], 0, 2);

		return this;
	}
	
	unwrap(): ae.mesh.MeshBuilder {

		this._assertPositionsNotNull();
		
		const indices = this._assertIndicesNotNull();
		
		const oldPositions = this._positions;
		const oldNormals   = this._normals;
		const oldTexCoords = this._texCoords;
		
		this._positions = this._normals = this._texCoords = null;
		
		const positions = this.createPositionArray(indices.length * this._primitiveType.size);
		const normals   = oldNormals   ? this.createNormalArray()   : null;
		const texCoords = oldTexCoords ? this.createTexCoordArray() : null;
		
		for(var i = 0; i < indices.length; i++) {
			for(var j = 0; j < this._primitiveType.size; j++) {
				
				const vPosOld = indices[i][j];
				const vPosNew = i * this._primitiveType.size + j;
				
				if(oldPositions && positions)
					ae.util.copy1DimArray(
						oldPositions[vPosOld], 0, positions[vPosNew], 0, 3);
				
				if(oldNormals && normals)
					ae.util.copy1DimArray(
						oldNormals[vPosOld], 0, normals[vPosNew], 0, 3);
				
				if(oldTexCoords && texCoords)
					ae.util.copy1DimArray(
						oldTexCoords[vPosOld], 0, texCoords[vPosNew], 0, 2);
			}
		}
		
		this.indices = null;
		
		return this;
	}
};
