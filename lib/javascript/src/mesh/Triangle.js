
ae.mesh.Triangle = class Triangle {
	
	_smoothingGroup: number;
	_vIndices:       Array<number>;
	
	_assign(t: ae.mesh.Triangle) {
		this.setIndicesA      (t._vIndices);
		this.setSmoothingGroup(t._smoothingGroup);
	}
	
	_assignAuxVectors(
			mb: ae.mesh.MeshBuilder,
			p0: number,
			p1: number,
			p2: number) {
		
		mb._auxP .setDataC(mb._vertices[this._vIndices[p0]]._position);
		mb._auxV1.setDataC(mb._vertices[this._vIndices[p1]]._position).subB(mb._auxP);
		mb._auxV2.setDataC(mb._vertices[this._vIndices[p2]]._position).subB(mb._auxP);
	}
	
	// Computes the angle of the vectors p0p1 and p0p2 in radians
	_computeAngle(
			mb: ae.mesh.MeshBuilder,
			p0: number,
			p1: number,
			p2: number): number {
		
		this._assignAuxVectors(mb, p0, p1, p2);
		return ae.math.Vector3D.angleRad(mb._auxV1, mb._auxV2);
	}
	
	_computeAngles(
			mb:  ae.mesh.MeshBuilder,
			dst: Array<number>) {
		
		dst[0] = this._computeAngle(mb, 0, 1, 2);
		dst[1] = this._computeAngle(mb, 1, 2, 0);
		dst[2] = this._computeAngle(mb, 2, 0, 1);
	}
	
	_computeNormal(
			mb:  ae.mesh.MeshBuilder,
			dst: Array<number>) {
		
		this._assignAuxVectors(mb, 0, 1, 2);
		ae.math.Vector3D.cross(mb._auxV1, mb._auxV2, mb._auxP).normalize().getDataC(dst);
	}
	
	constructor() {
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