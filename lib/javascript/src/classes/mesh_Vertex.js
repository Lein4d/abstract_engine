
// ae.mesh.MeshBuilder$Vertex
class AEClassVertex {

	_mb:       ae.mesh.MeshBuilder;
	_position: Float32Array;
	_normal:   Float32Array;
	_uTangent: Float32Array;
	_vTangent: Float32Array;
	_texCoord: Float32Array;
	
	_addSmoothingGroup(
			auxArray:       Array<number>,
			sgCount:        number,
			smoothingGroup: number): number {
		
		for(var i = 0; i < sgCount; i++)
			if(auxArray[i] == smoothingGroup) return sgCount;
		
		auxArray[sgCount] = smoothingGroup;
		
		return sgCount + 1;
	}
	
	_assign(v: ae.mesh.Vertex) {
		this.setPositionA(v._position);
		this.setNormalA  (v._normal);
		this.setUTangentA(v._uTangent);
		this.setVTangentA(v._vTangent);
		this.setTexCoordA(v._texCoord);
	}
	
	_collectSmoothingGroups(
			adjacency: Array<number>,
			auxArray:  Array<number>): Array<number> {
		
		var sgCount = 0;
		
		for(var i = 0; i < adjacency.length; i++)
			sgCount = this._addSmoothingGroup(
				auxArray,
				sgCount,
				this._mb._triangles[adjacency[i]]._smoothingGroup);
		
		return auxArray.slice(0, sgCount);
	}
	
	_computeSmoothNormal(
			flatNormals:        Array<Array<number>>,
			adjacencyTriangles: Array<number>,
			adjacencyAngles:    Array<number>) {
		
		let nx = 0, ny = 0, nz = 0;
		
		for(let i = 0; i < adjacencyTriangles.length; i++) {
			
			const angle      = adjacencyTriangles[i];
			const flatNormal = flatNormals[adjacencyTriangles[i]];
			
			nx += angle * flatNormal[0];
			ny += angle * flatNormal[1];
			nz += angle * flatNormal[2];
		}
		
		const length = Math.sqrt(nx * nx + ny * ny + nz * nz);
		
		this._normal[0] = nx / length;
		this._normal[1] = ny / length;
		this._normal[2] = nz / length;
	}
	
	constructor(mb: ae.mesh.MeshBuilder) {
		this._mb       = mb;
		this._position = new Float32Array([0, 0, 0]);
		this._normal   = new Float32Array([0, 0, 0]);
		this._uTangent = new Float32Array([0, 0, 0]);
		this._vTangent = new Float32Array([0, 0, 0]);
		this._texCoord = new Float32Array([0, 0]);
	}
	
	setNormalA(
			src:    (Array<number> | Float32Array),
			offset:  number = 0): ae.mesh.Vertex {
		
		this._normal[0] = src[offset + 0];
		this._normal[1] = src[offset + 1];
		this._normal[2] = src[offset + 2];
		
		return this;
	}
	
	setNormalB(
			nx: number,
			ny: number,
			nz: number): ae.mesh.Vertex {
		
		this._normal[0] = nx;
		this._normal[1] = ny;
		this._normal[2] = nz;
		
		return this;
	}
	
	setPositionA(
			src:    (Array<number> | Float32Array),
			offset:  number = 0): ae.mesh.Vertex {
		
		return this.setPositionB(
			src[offset + 0], src[offset + 1], src[offset + 2]);
	}
	
	setPositionB(
			x: number,
			y: number,
			z: number): ae.mesh.Vertex {
		
		this._position[0] = x;
		this._position[1] = y;
		this._position[2] = z;
		
		return this;
	}
	
	setTexCoordA(
			src:    (Array<number> | Float32Array),
			offset:  number = 0): ae.mesh.Vertex {
		
		return this.setTexCoordB(src[offset + 0], src[offset + 1]);
	}
	
	setTexCoordB(
			s: number,
			t: number): ae.mesh.Vertex {
		
		this._texCoord[0] = s;
		this._texCoord[1] = t;
		
		return this;
	}
	
	setUTangentA(
			src:    (Array<number> | Float32Array),
			offset:  number = 0): ae.mesh.Vertex {
		
		return this.setUTangentB(
			src[offset + 0], src[offset + 1], src[offset + 2]);
	}
	
	setUTangentB(
			ux: number,
			uy: number,
			uz: number): ae.mesh.Vertex {
		
		this._uTangent[0] = ux;
		this._uTangent[1] = uy;
		this._uTangent[2] = uz;
		
		return this;
	}
	
	setVTangentA(
			src:    (Array<number> | Float32Array),
			offset:  number = 0): ae.mesh.Vertex {
		
		return this.setVTangentB(
			src[offset + 0], src[offset + 1], src[offset + 2]);
	}
	
	setVTangentB(
			vx: number,
			vy: number,
			vz: number): ae.mesh.Vertex {
		
		this._vTangent[0] = vx;
		this._vTangent[1] = vy;
		this._vTangent[2] = vz;
		
		return this;
	}
}