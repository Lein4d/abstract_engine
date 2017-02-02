
ae.mesh.Triangle = class Triangle {
	
	_mb:             ae.mesh.MeshBuilder;
	_smoothingGroup: number;
	_vIndices:       Array<number>;
	
	_assign(t: ae.mesh.Triangle) {
		this.setIndicesA      (t._vIndices);
		this.setSmoothingGroup(t._smoothingGroup);
	}
	
	_computeNormalAndAngles(
			normal: Array<number>,
			angles: Array<number>) {
		
		const p1 = this._mb._vertices[this._vIndices[0]]._position;
		const p2 = this._mb._vertices[this._vIndices[1]]._position;
		const p3 = this._mb._vertices[this._vIndices[2]]._position;
		
		const p1x = p1[0], p1y = p1[1], p1z = p1[2];
		const p2x = p2[0], p2y = p2[1], p2z = p2[2];
		const p3x = p3[0], p3y = p3[1], p3z = p3[2];
		
		const d1x = p2x - p1x, d1y = p2y - p1y, d1z = p2z - p1z;
		const d2x = p3x - p1x, d2y = p3y - p1y, d2z = p3z - p1z;
		const d3x = p3x - p2x, d3y = p3y - p2y, d3z = p3z - p2z;
		
		const l1 = Math.sqrt(d1x * d1x + d1y * d1y + d1z * d1z);
		const l2 = Math.sqrt(d2x * d2x + d2y * d2y + d2z * d2z);
		const l3 = Math.sqrt(d3x * d3x + d3y * d3y + d3z * d3z);
		
		const nx = d1y * d2z - d1z * d2y;
		const ny = d1z * d2x - d1x * d2z;
		const nz = d1x * d2y - d1y * d2x;
		
		const ln = Math.sqrt(nx * nx + ny * ny + nz * nz);
		
		normal[0] = nx / ln;
		normal[1] = ny / ln;
		normal[2] = nz / ln;
		
		angles[0] = ae.mesh._ACOS.sampleLinear(
			 (d1x * d2x + d1y * d2y + d1z * d2z) / (l1 * l2));
		angles[1] = ae.mesh._ACOS.sampleLinear(
			-(d1x * d3x + d1y * d3y + d1z * d3z) / (l1 * l3));
		angles[2] = ae.mesh._ACOS.sampleLinear(
			 (d2x * d3x + d2y * d3y + d2z * d3z) / (l2 * l3));
	}
	
	constructor(mb: ae.mesh.MeshBuilder) {
		this._mb             = mb;
		this._smoothingGroup = 0;
		this._vIndices       = [0, 0, 0];
	}
	
	setIndicesA(
			src:    Array<number>,
			offset: number = 0): ae.mesh.Triangle {
		
		this._vIndices[0] = src[offset + 0];
		this._vIndices[1] = src[offset + 1];
		this._vIndices[2] = src[offset + 2];
		
		return this;
	}
	
	setIndicesB(
			v1: number,
			v2: number,
			v3: number): ae.mesh.Triangle {
		
		this._vIndices[0] = v1;
		this._vIndices[1] = v2;
		this._vIndices[2] = v3;
		
		return this;
	}
	
	setSmoothingGroup(smoothingGroup: number): ae.mesh.Triangle {
		this._smoothingGroup = smoothingGroup;
		return this;
	}
}