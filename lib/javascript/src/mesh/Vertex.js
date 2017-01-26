
ae.mesh.Vertex = class Vertex {

	_position: Array<number>;
	_normal:   Array<number>;
	_uTangent: Array<number>;
	_vTangent: Array<number>;
	_texCoord: Array<number>;
	
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
			mb:        ae.mesh.MeshBuilder,
			adjacency: Array<number>,
			auxArray:  Array<number>): Array<number> {
		
		var sgCount = 0;
		
		for(var i = 0; i < adjacency.length; i++)
			sgCount = this._addSmoothingGroup(
				auxArray, sgCount, mb._triangles[adjacency[i]]._smoothingGroup);
		
		return auxArray.slice(0, sgCount);
	}
	
	_computeSmoothNormal(
			mb:                 ae.mesh.MeshBuilder,
			flatNormals:        Array<Array<number>>,
			adjacencyTriangles: Array<number>,
			adjacencyAngles:    Array<number>) {
		
		var fullAngle = 0;
		for(var i = 0; i < adjacencyAngles.length; i++)
			fullAngle += adjacencyAngles[i];
		
		this.setNormalB(0, 0, 0);
		
		for(var i = 0; i < adjacencyTriangles.length; i++)
			for(var j = 0; j < 3; j++)
				this._normal[j] +=
					(adjacencyAngles[i] / fullAngle) *     // weight
					flatNormals[adjacencyTriangles[i]][j]; // normal vector
		
		mb._auxV1.setDataC(this._normal).normalize().getDataC(this._normal);
	}
	
	constructor() {
		this._position = [0, 0, 0];
		this._normal   = [0, 0, 0];
		this._uTangent = [0, 0, 0];
		this._vTangent = [0, 0, 0];
		this._texCoord = [0, 0];
	}
	
	setNormalA(
			src:    Array<number>,
			offset: number = 0): ae.mesh.Vertex {
		
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
			src:    Array<number>,
			offset: number = 0): ae.mesh.Vertex {
		
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
			src:    Array<number>,
			offset: number = 0): ae.mesh.Vertex {
		
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
			src:    Array<number>,
			offset: number = 0): ae.mesh.Vertex {
		
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
			src:    Array<number>,
			offset: number = 0): ae.mesh.Vertex {
		
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