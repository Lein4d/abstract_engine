
// ae.math.Matrix4D
class AEClassMatrix4D extends AEClassJavaObject implements Observable {
	
	_signal:        ae.event.SignalSource<ae.math.Matrix4D>;
	_data:          Float32Array;
	_nmDataCached:  ae.util.CachedObject<Float32Array>;
	_auxArray:      Float32Array;
	_rowVectors:    Array<?ae.math.Vector4D>;
	_columnVectors: Array<?ae.math.Vector4D>;

	_fireSignal(invalidateNm: boolean): this {
		
		if(invalidateNm) this._nmDataCached.invalidate();
		this._signal.fire();
		
		return this;
	}
	
	_computeNormalMatrix(nmData: Float32Array): Float32Array {

		// The normal matrix is the inverse of the upper transposed 3x3 matrix
		
		const a0 = this.m11, a3 = this.m21, a6 = this.m31;
		const a1 = this.m12, a4 = this.m22, a7 = this.m32;
		const a2 = this.m13, a5 = this.m23, a8 = this.m33;
	
		const d =
			a0 * a4 * a8 + a3 * a7 * a2 + a6 * a1 * a5 -
			a2 * a4 * a6 - a5 * a7 * a0 - a8 * a1 * a3;
	
		nmData[ae.I_NM11] = (a4 * a8 - a5 * a7) / d;
		nmData[ae.I_NM12] = (a5 * a6 - a3 * a8) / d;
		nmData[ae.I_NM13] = (a3 * a7 - a6 * a4) / d;
		
		nmData[ae.I_NM21] = (a2 * a7 - a1 * a8) / d;
		nmData[ae.I_NM22] = (a0 * a8 - a2 * a6) / d;
		nmData[ae.I_NM23] = (a1 * a6 - a0 * a7) / d;
		
		nmData[ae.I_NM31] = (a1 * a5 - a2 * a4) / d;
		nmData[ae.I_NM32] = (a2 * a3 - a0 * a5) / d;
		nmData[ae.I_NM33] = (a0 * a4 - a1 * a3) / d;
		
		return nmData;
	}

	_getColumnVector(cIndex: number): ae.math.Vector4D {
		
		const vector =
			this._columnVectors[cIndex] ||
			new ae.math.Vector4D(
				new ae.math.MatrixVector(this, false, cIndex));
		
		this._columnVectors[cIndex] = vector;
		
		return vector;
	}
	
	_getRowVector(rIndex: number): ae.math.Vector4D {
		
		const vector =
			this._rowVectors[rIndex] ||
			new ae.math.Vector4D(
				new ae.math.MatrixVector(this, true, rIndex));
		
		this._rowVectors[rIndex] = vector;
		
		return vector;
	}
	
	constructor() {
		
		super();
		
		this._signal        = new AEClassSignalSource(this, 1);
		this._data          = new Float32Array(16);
		this._auxArray      = new Float32Array(16);
		this._rowVectors    = Array(4);
		this._columnVectors = Array(4);
		
		this._nmDataCached = new ae.util.CachedObject(
			new Float32Array(9),
			(obj) => {
				return this._computeNormalMatrix(ae.util.assertNotNull(obj));
			});
		
		this.toIdentity();
		
		Object.freeze(this);
	}
	
	get m11(): number {return this._data[ae.I_M11];}
	get m12(): number {return this._data[ae.I_M12];}
	get m13(): number {return this._data[ae.I_M13];}
	get m14(): number {return this._data[ae.I_M14];}
	get m21(): number {return this._data[ae.I_M21];}
	get m22(): number {return this._data[ae.I_M22];}
	get m23(): number {return this._data[ae.I_M23];}
	get m24(): number {return this._data[ae.I_M24];}
	get m31(): number {return this._data[ae.I_M31];}
	get m32(): number {return this._data[ae.I_M32];}
	get m33(): number {return this._data[ae.I_M33];}
	get m34(): number {return this._data[ae.I_M34];}
	get m41(): number {return this._data[ae.I_M41];}
	get m42(): number {return this._data[ae.I_M42];}
	get m43(): number {return this._data[ae.I_M43];}
	get m44(): number {return this._data[ae.I_M44];}
	
	get nm11(): number {return this._nmDataCached.object[ae.I_NM11];}
	get nm12(): number {return this._nmDataCached.object[ae.I_NM12];}
	get nm13(): number {return this._nmDataCached.object[ae.I_NM13];}
	get nm21(): number {return this._nmDataCached.object[ae.I_NM21];}
	get nm22(): number {return this._nmDataCached.object[ae.I_NM22];}
	get nm23(): number {return this._nmDataCached.object[ae.I_NM23];}
	get nm31(): number {return this._nmDataCached.object[ae.I_NM31];}
	get nm32(): number {return this._nmDataCached.object[ae.I_NM32];}
	get nm33(): number {return this._nmDataCached.object[ae.I_NM33];}
	
	get c1(): ae.math.Vector4D {return this._getColumnVector(0);}
	get c2(): ae.math.Vector4D {return this._getColumnVector(1);}
	get c3(): ae.math.Vector4D {return this._getColumnVector(2);}
	get c4(): ae.math.Vector4D {return this._getColumnVector(3);}
	
	get r1(): ae.math.Vector4D {return this._getRowVector(0);}
	get r2(): ae.math.Vector4D {return this._getRowVector(1);}
	get r3(): ae.math.Vector4D {return this._getRowVector(2);}
	get r4(): ae.math.Vector4D {return this._getRowVector(3);}
	
	set m11(value: number) {this._data[ae.I_M11] = value;}
	set m12(value: number) {this._data[ae.I_M12] = value;}
	set m13(value: number) {this._data[ae.I_M13] = value;}
	set m14(value: number) {this._data[ae.I_M14] = value;}
	set m21(value: number) {this._data[ae.I_M21] = value;}
	set m22(value: number) {this._data[ae.I_M22] = value;}
	set m23(value: number) {this._data[ae.I_M23] = value;}
	set m24(value: number) {this._data[ae.I_M24] = value;}
	set m31(value: number) {this._data[ae.I_M31] = value;}
	set m32(value: number) {this._data[ae.I_M32] = value;}
	set m33(value: number) {this._data[ae.I_M33] = value;}
	set m34(value: number) {this._data[ae.I_M34] = value;}
	set m41(value: number) {this._data[ae.I_M41] = value;}
	set m42(value: number) {this._data[ae.I_M42] = value;}
	set m43(value: number) {this._data[ae.I_M43] = value;}
	set m44(value: number) {this._data[ae.I_M44] = value;}
	
	applyNmToShader(
			gl:          WebGLRenderingContext,
			uniLocation: WebGLUniformLocation): this {
		
		gl.uniformMatrix3fv(uniLocation, false, this._nmDataCached.object);
		return this;
	}
	
	applyToDirVector(v: ae.math.Vector3D): ae.math.Vector3D {
		
		v.getDataArray(this._auxArray);
		this.applyToDirVectorArray(this._auxArray);
		v.setDataArray(this._auxArray);
		
		return v;
	}
	
	applyToDirVectorArray(
			v:      Float32Array,
			offset: number = 0): Float32Array {
		
		const nmData = this._nmDataCached.object;
		
		// Copy vector at temp array starting at position 3
		for(let i = 0; i < 3; i++) this._auxArray[3 + i] = v[offset + i];
		
		v[offset + 0] =
			nmData[ae.I_NM11] * this._auxArray[3] +
			nmData[ae.I_NM12] * this._auxArray[4] +
			nmData[ae.I_NM13] * this._auxArray[5];
		v[offset + 1] =
			nmData[ae.I_NM21] * this._auxArray[3] +
			nmData[ae.I_NM22] * this._auxArray[4] +
			nmData[ae.I_NM23] * this._auxArray[5];
		v[offset + 2] =
			nmData[ae.I_NM31] * this._auxArray[3] +
			nmData[ae.I_NM32] * this._auxArray[4] +
			nmData[ae.I_NM33] * this._auxArray[5];
		
		return v;
	}
	
	applyToOrigin3D(dst: ae.math.Vector3D): ae.math.Vector3D {
		return dst.setDataArray(this.applyToOriginArray(this._auxArray, 3));
	}
	
	applyToOrigin4D(dst: ae.math.Vector4D): ae.math.Vector4D {
		return dst.setDataArray(this.applyToOriginArray(this._auxArray, 4));
	}
	
	applyToOriginArray(
			dst:    Float32Array,
			offset: number = 0): Float32Array {
		
		return this.applyToOriginArrayExt(dst, dst.length - offset, offset);
	}
	
	applyToOriginArrayExt(
			dst:       Float32Array,
			dimension: number,
			offset:    number = 0): Float32Array {
		
		for(let i = 0; i < dimension; i++)
			dst[offset + i] = this.getElement(i, 3);
		
		return dst;
	}
	
	applyToPoint3D(p: ae.math.Vector3D): ae.math.Vector3D {
		return p.setDataArray(
			this.applyToPointArray(p.getDataArray(this._auxArray), 3));
	}
	
	applyToPoint4D(p: ae.math.Vector4D): ae.math.Vector4D {
		return p.setDataArray(
			this.applyToPointArray(p.getDataArray(this._auxArray), 4));
	}
	
	applyToPointArray(
			p:      Float32Array,
			offset: number = 0): Float32Array {
		
		return this.applyToPointArrayExt(p, p.length - offset, offset);
	}
	
	applyToPointArrayExt(
			p:         Float32Array,
			dimension: number,
			offset:    number = 0): Float32Array {
		
		const x = dimension >= 1 ? p[offset + 0] : 0;
		const y = dimension >= 2 ? p[offset + 1] : 0;
		const z = dimension >= 3 ? p[offset + 2] : 0;
		const w = dimension >= 4 ? p[offset + 3] : 1;
		
		if(dimension >= 1)
			p[offset + 0] =
				this.m11 * x + this.m12 * y + this.m13 * z + this.m14 * w;
		
		if(dimension >= 2)
			p[offset + 1] =
				this.m21 * x + this.m22 * y + this.m23 * z + this.m24 * w;
		
		if(dimension >= 3)
			p[offset + 2] =
				this.m31 * x + this.m32 * y + this.m33 * z + this.m34 * w;
		
		if(dimension >= 4)
			p[offset + 3] =
				this.m41 * x + this.m42 * y + this.m43 * z + this.m44 * w;
		
		return p;
	}
	
	applyToShader(
			gl:          WebGLRenderingContext,
			uniLocation: WebGLUniformLocation): this {
		
		gl.uniformMatrix4fv(uniLocation, false, this._data);
		return this;
	}
	
	computeDeterminant(): number {

		return (
			this.m14 * this.m23 * this.m32 * this.m41 -
			this.m13 * this.m24 * this.m32 * this.m41 -
			this.m14 * this.m22 * this.m33 * this.m41 +
			this.m12 * this.m24 * this.m33 * this.m41 +
			this.m13 * this.m22 * this.m34 * this.m41 -
			this.m12 * this.m23 * this.m34 * this.m41 -
			this.m14 * this.m23 * this.m31 * this.m42 +
			this.m13 * this.m24 * this.m31 * this.m42 +
			this.m14 * this.m21 * this.m33 * this.m42 -
			this.m11 * this.m24 * this.m33 * this.m42 -
			this.m13 * this.m21 * this.m34 * this.m42 +
			this.m11 * this.m23 * this.m34 * this.m42 +
			this.m14 * this.m22 * this.m31 * this.m43 -
			this.m12 * this.m24 * this.m31 * this.m43 -
			this.m14 * this.m21 * this.m32 * this.m43 +
			this.m11 * this.m24 * this.m32 * this.m43 +
			this.m12 * this.m21 * this.m34 * this.m43 -
			this.m11 * this.m22 * this.m34 * this.m43 -
			this.m13 * this.m22 * this.m31 * this.m44 +
			this.m12 * this.m23 * this.m31 * this.m44 +
			this.m13 * this.m21 * this.m32 * this.m44 -
			this.m11 * this.m23 * this.m32 * this.m44 -
			this.m12 * this.m21 * this.m33 * this.m44 +
			this.m11 * this.m22 * this.m33 * this.m44);
	}

	createSignalEndPoint(): ae.event.SignalEndPoint {
		return this._signal.createEndPoint();
	}

	getColumn(cIndex: number): ae.math.Vector4D {
		return this._getColumnVector(cIndex);
	}
	
	getColumnArray(
			cIndex: number,
			dst:    Float32Array,
			offset: number = 0): Float32Array {
		
		for(let i = 0; i < 4; i++) dst[offset + i] = this._data[cIndex * 4 + i];
		return dst;
	}
	
	getData(dst: ae.math.Matrix4D): ae.math.Matrix4D {
		return dst.setData(this);
	}
	
	getDataArray(
			dst:    Float32Array,
			offset: number = 0): Float32Array {
		
		dst.set(this._data, offset);
		return dst;
	}
	
	getElement(
			rIndex : number,
			cIndex : number): number {
		
		return this._data[cIndex * 4 + rIndex];
	}
	
	getNmData(
			dst:    Float32Array,
			offset: number = 0): Float32Array {
		
		dst.set(this._nmDataCached.object, offset);
		return dst;
	}
	
	getRow(rIndex: number): ae.math.Vector4D {
		return this._getRowVector(rIndex);
	}
	
	getRowArray(
			rIndex: number,
			dst:    Float32Array,
			offset: number = 0): Float32Array {
		
		for(let i = 0; i < 4; i++) dst[offset + i] = this._data[i * 4 + rIndex];
		return dst;
	}
	
	invert(): this {

		const det = this.computeDeterminant();

		// Zeile 1
		this._auxArray[ 0] = (
			this.m23 * this.m34 * this.m42 -
			this.m24 * this.m33 * this.m42 +
			this.m24 * this.m32 * this.m43 -
			this.m22 * this.m34 * this.m43 -
			this.m23 * this.m32 * this.m44 +
			this.m22 * this.m33 * this.m44) / det;
		this._auxArray[ 4] = (
			this.m14 * this.m33 * this.m42 -
			this.m13 * this.m34 * this.m42 -
			this.m14 * this.m32 * this.m43 +
			this.m12 * this.m34 * this.m43 +
			this.m13 * this.m32 * this.m44 -
			this.m12 * this.m33 * this.m44) / det;
		this._auxArray[ 8] = (
			this.m13 * this.m24 * this.m42 -
			this.m14 * this.m23 * this.m42 +
			this.m14 * this.m22 * this.m43 -
			this.m12 * this.m24 * this.m43 -
			this.m13 * this.m22 * this.m44 +
			this.m12 * this.m23 * this.m44) / det;
		this._auxArray[12] = (
			this.m14 * this.m23 * this.m32 -
			this.m13 * this.m24 * this.m32 -
			this.m14 * this.m22 * this.m33 +
			this.m12 * this.m24 * this.m33 +
			this.m13 * this.m22 * this.m34 -
			this.m12 * this.m23 * this.m34) / det;
		
		// Zeile 2
		this._auxArray[ 1] = (
			this.m24 * this.m33 * this.m41 -
			this.m23 * this.m34 * this.m41 -
			this.m24 * this.m31 * this.m43 +
			this.m21 * this.m34 * this.m43 +
			this.m23 * this.m31 * this.m44 -
			this.m21 * this.m33 * this.m44) / det;
		this._auxArray[ 5] = (
			this.m13 * this.m34 * this.m41 -
			this.m14 * this.m33 * this.m41 +
			this.m14 * this.m31 * this.m43 -
			this.m11 * this.m34 * this.m43 -
			this.m13 * this.m31 * this.m44 +
			this.m11 * this.m33 * this.m44) / det;
		this._auxArray[ 9] = (
			this.m14 * this.m23 * this.m41 -
			this.m13 * this.m24 * this.m41 -
			this.m14 * this.m21 * this.m43 +
			this.m11 * this.m24 * this.m43 +
			this.m13 * this.m21 * this.m44 -
			this.m11 * this.m23 * this.m44) / det;
		this._auxArray[13] = (
			this.m13 * this.m24 * this.m31 -
			this.m14 * this.m23 * this.m31 +
			this.m14 * this.m21 * this.m33 -
			this.m11 * this.m24 * this.m33 -
			this.m13 * this.m21 * this.m34 +
			this.m11 * this.m23 * this.m34) / det;

		// Zeile 3
		this._auxArray[ 2] = (
			this.m22 * this.m34 * this.m41 -
			this.m24 * this.m32 * this.m41 +
			this.m24 * this.m31 * this.m42 -
			this.m21 * this.m34 * this.m42 -
			this.m22 * this.m31 * this.m44 +
			this.m21 * this.m32 * this.m44) / det;
		this._auxArray[ 6] = (
			this.m14 * this.m32 * this.m41 -
			this.m12 * this.m34 * this.m41 -
			this.m14 * this.m31 * this.m42 +
			this.m11 * this.m34 * this.m42 +
			this.m12 * this.m31 * this.m44 -
			this.m11 * this.m32 * this.m44) / det;
		this._auxArray[10] = (
			this.m12 * this.m24 * this.m41 -
			this.m14 * this.m22 * this.m41 +
			this.m14 * this.m21 * this.m42 -
			this.m11 * this.m24 * this.m42 -
			this.m12 * this.m21 * this.m44 +
			this.m11 * this.m22 * this.m44) / det;
		this._auxArray[14] = (
			this.m14 * this.m22 * this.m31 -
			this.m12 * this.m24 * this.m31 -
			this.m14 * this.m21 * this.m32 +
			this.m11 * this.m24 * this.m32 +
			this.m12 * this.m21 * this.m34 -
			this.m11 * this.m22 * this.m34) / det;

		// Zeile 4
		this._auxArray[ 3] = (
			this.m23 * this.m32 * this.m41 -
			this.m22 * this.m33 * this.m41 -
			this.m23 * this.m31 * this.m42 +
			this.m21 * this.m33 * this.m42 +
			this.m22 * this.m31 * this.m43 -
			this.m21 * this.m32 * this.m43) / det;
		this._auxArray[ 7] = (
			this.m12 * this.m33 * this.m41 -
			this.m13 * this.m32 * this.m41 +
			this.m13 * this.m31 * this.m42 -
			this.m11 * this.m33 * this.m42 -
			this.m12 * this.m31 * this.m43 +
			this.m11 * this.m32 * this.m43) / det;
		this._auxArray[11] = (
			this.m13 * this.m22 * this.m41 -
			this.m12 * this.m23 * this.m41 -
			this.m13 * this.m21 * this.m42 +
			this.m11 * this.m23 * this.m42 +
			this.m12 * this.m21 * this.m43 -
			this.m11 * this.m22 * this.m43) / det;
		this._auxArray[15] = (
			this.m12 * this.m23 * this.m31 -
			this.m13 * this.m22 * this.m31 +
			this.m13 * this.m21 * this.m32 -
			this.m11 * this.m23 * this.m32 -
			this.m12 * this.m21 * this.m33 +
			this.m11 * this.m22 * this.m33) / det;
		
		return this.setDataArray(this._auxArray);
	}
	
	multWithMatrix(m: ae.math.Matrix4D): this {
		
		// this = this * m;

		this.getDataArray(this._auxArray);
		
		// Row 1
		this.m11 =
			this._auxArray[ 0] * m.m11 + this._auxArray[ 4] * m.m21 +
			this._auxArray[ 8] * m.m31 + this._auxArray[12] * m.m41;
		this.m12 =
			this._auxArray[ 0] * m.m12 + this._auxArray[ 4] * m.m22 +
			this._auxArray[ 8] * m.m32 + this._auxArray[12] * m.m42;
		this.m13 =
			this._auxArray[ 0] * m.m13 + this._auxArray[ 4] * m.m23 +
			this._auxArray[ 8] * m.m33 + this._auxArray[12] * m.m43;
		this.m14 =
			this._auxArray[ 0] * m.m14 + this._auxArray[ 4] * m.m24 +
			this._auxArray[ 8] * m.m34 + this._auxArray[12] * m.m44;
		
		// Row 2
		this.m21 =
			this._auxArray[ 1] * m.m11 + this._auxArray[ 5] * m.m21 +
			this._auxArray[ 9] * m.m31 + this._auxArray[13] * m.m41;
		this.m22 =
			this._auxArray[ 1] * m.m12 + this._auxArray[ 5] * m.m22 +
			this._auxArray[ 9] * m.m32 + this._auxArray[13] * m.m42;
		this.m23 =
			this._auxArray[ 1] * m.m13 + this._auxArray[ 5] * m.m23 +
			this._auxArray[ 9] * m.m33 + this._auxArray[13] * m.m43;
		this.m24 =
			this._auxArray[ 1] * m.m14 + this._auxArray[ 5] * m.m24 +
			this._auxArray[ 9] * m.m34 + this._auxArray[13] * m.m44;
		
		// Row 3
		this.m31 =
			this._auxArray[ 2] * m.m11 + this._auxArray[ 6] * m.m21 +
			this._auxArray[10] * m.m31 + this._auxArray[14] * m.m41;
		this.m32 =
			this._auxArray[ 2] * m.m12 + this._auxArray[ 6] * m.m22 +
			this._auxArray[10] * m.m32 + this._auxArray[14] * m.m42;
		this.m33 =
			this._auxArray[ 2] * m.m13 + this._auxArray[ 6] * m.m23 +
			this._auxArray[10] * m.m33 + this._auxArray[14] * m.m43;
		this.m34 =
			this._auxArray[ 2] * m.m14 + this._auxArray[ 6] * m.m24 +
			this._auxArray[10] * m.m34 + this._auxArray[14] * m.m44;
		
		// Row 4
		this.m41 =
			this._auxArray[ 3] * m.m11 + this._auxArray[ 7] * m.m21 +
			this._auxArray[11] * m.m31 + this._auxArray[15] * m.m41;
		this.m42 =
			this._auxArray[ 3] * m.m12 + this._auxArray[ 7] * m.m22 +
			this._auxArray[11] * m.m32 + this._auxArray[15] * m.m42;
		this.m43 =
			this._auxArray[ 3] * m.m13 + this._auxArray[ 7] * m.m23 +
			this._auxArray[11] * m.m33 + this._auxArray[15] * m.m43;
		this.m44 =
			this._auxArray[ 3] * m.m14 + this._auxArray[ 7] * m.m24 +
			this._auxArray[11] * m.m34 + this._auxArray[15] * m.m44;
		
		return this._fireSignal(true);
	}
	
	projectOrthogonal(
			left:   number,
			right:  number,
			bottom: number,
			top:    number,
			near:   number,
			far:    number): this {
	
		// /a 0 0 d\
		// |0 b 0 e|
		// |0 0 c f|
		// \0 0 0 1/
	
		const a: number = 2 / (right - left);
		const b: number = 2 / (top   - bottom);
		const c: number = 2 / (near  - far);
		const d: number = (right + left)   / (right - left);
		const e: number = (top   + bottom) / (top   - bottom);
		const f: number = (far   + near)   / (far   - near);
	
		// Compute column 4 first -> no temp variables
		this.m14 = this.m11 * d + this.m12 * e + this.m13 * f + this.m14;
		this.m24 = this.m21 * d + this.m22 * e + this.m23 * f + this.m24;
		this.m34 = this.m31 * d + this.m32 * e + this.m33 * f + this.m34;
		this.m44 = this.m41 * d + this.m42 * e + this.m43 * f + this.m44;
		
		// Compute rows 1-3
		this.m11 *= a; this.m12 *= b; this.m13 *= c;
		this.m21 *= a; this.m22 *= b; this.m23 *= c;
		this.m31 *= a; this.m32 *= b; this.m33 *= c;
		this.m41 *= a; this.m42 *= b; this.m43 *= c;
		
		return this._fireSignal(true);
	}

	projectOrthogonalSym(
			width:  number,
			height: number,
			near:   number,
			far:    number): this {

		return this.projectOrthogonal(
			-width / 2, width / 2, -height / 2, height / 2, near, far);
	}

	projectPerspective(
			left:   number,
			right:  number,
			bottom: number,
			top:    number,
			near:   number,
			far:    number = 0): this {
	
		// /a 0  c 0\
		// |0 b  d 0|
		// |0 0  e f|
		// \0 0 -1 0/

		const a: number = 2 * near / (right - left);
		const b: number = 2 * near / (top   - bottom);
		const c: number = (right + left)   / (right - left);
		const d: number = (top   + bottom) / (top   - bottom);
		
		this.getColumnArray(2, this._auxArray);
		
		if(far < near) { // far-ClippingPlane at infinity (e=-1,f=-2*near)
		
			const f: number = -2 * near;

			// Compute column 3 first -> less temp variables
			this.m13 = this.m11 * c + this.m12 * d - this._auxArray[0] - this.m14;
			this.m23 = this.m21 * c + this.m22 * d - this._auxArray[1] - this.m24;
			this.m33 = this.m31 * c + this.m32 * d - this._auxArray[2] - this.m34;
			this.m43 = this.m41 * c + this.m42 * d - this._auxArray[3] - this.m44;
			
			// Compute columns 1,2,4
			this.m11 *= a; this.m12 *= b; this.m14 = f * this._auxArray[0];
			this.m21 *= a; this.m22 *= b; this.m24 = f * this._auxArray[1];
			this.m31 *= a; this.m32 *= b; this.m34 = f * this._auxArray[2];
			this.m41 *= a; this.m42 *= b; this.m44 = f * this._auxArray[3];
			
		} else { // normal projection matrix
		
			const e: number = (near - far) / (far - near);
			const f: number = 2 * far * near / (near - far);
		
			// Compute column 3 first -> less temp variables
			this.m13 =
				this.m11 * c + this.m12 * d + e * this._auxArray[0] - this.m14;
			this.m23 =
				this.m21 * c + this.m22 * d + e * this._auxArray[1] - this.m24;
			this.m33 =
				this.m31 * c + this.m32 * d + e * this._auxArray[2] - this.m34;
			this.m43 =
				this.m41 * c + this.m42 * d + e * this._auxArray[3] - this.m44;
			
			// Compute columns 1,2,4
			this.m11 *= a; this.m12 *= b; this.m14 = f * this._auxArray[0];
			this.m21 *= a; this.m22 *= b; this.m24 = f * this._auxArray[1];
			this.m31 *= a; this.m32 *= b; this.m34 = f * this._auxArray[2];
			this.m41 *= a; this.m42 *= b; this.m44 = f * this._auxArray[3];
		}
		
		return this._fireSignal(true);
	}

	projectPerspectiveHorFOV(
			vpWidth:  number,
			vpHeight: number,
			fov:      number,
			near:     number,
			far:      number = 0): this {

		const width: number = 2 * Math.tan(fov * Math.PI / 360) * near;
		
		return this.projectPerspectiveSym(
			width, width * vpHeight / vpWidth, near, far);
	}
	
	projectPerspectiveSym(
			width:  number,
			height: number,
			near:   number,
			far:    number = 0): this {
		
		return this.projectPerspective(
			-width / 2, width / 2, -height / 2, height / 2, near, far);
	}

	projectPerspectiveVerFOV(
			vpWidth:  number,
			vpHeight: number,
			fov:      number,
			near:     number,
			far:      number = 0): this {

		const height: number = 2 * Math.tan(fov * Math.PI / 360) * near;
		
		return this.projectPerspectiveSym(
			height * vpWidth / vpHeight, height, near, far);
	}

	reactToSignalChange(): void {}
	
	rotateX(angle: number): this {
		
		const s: number = Math.sin(angle * ae.RAD_FACTOR);
		const c: number = Math.cos(angle * ae.RAD_FACTOR);
		
		// Copy column 2
		this.getColumnArray(1, this._auxArray);
		
		// Compute column 2
		this.m12 = this._auxArray[0] * c + this.m13 * s;
		this.m22 = this._auxArray[1] * c + this.m23 * s;
		this.m32 = this._auxArray[2] * c + this.m33 * s;
		this.m42 = this._auxArray[3] * c + this.m43 * s;
		
		// Compute column 3
		this.m13 = this.m13 * c - this._auxArray[0] * s;
		this.m23 = this.m23 * c - this._auxArray[1] * s;
		this.m33 = this.m33 * c - this._auxArray[2] * s;
		this.m43 = this.m43 * c - this._auxArray[3] * s;
		
		return this._fireSignal(true);
	}

	rotateY(angle: number): this {

		const s: number = Math.sin(angle * ae.RAD_FACTOR);
		const c: number = Math.cos(angle * ae.RAD_FACTOR);
	
		// Copy column 1
		this.getColumnArray(0, this._auxArray);
		
		// Compute column 1
		this.m11 = this._auxArray[0] * c - this.m13 * s;
		this.m21 = this._auxArray[1] * c - this.m23 * s;
		this.m31 = this._auxArray[2] * c - this.m33 * s;
		this.m41 = this._auxArray[3] * c - this.m43 * s;
		
		// Compute column 3
		this.m13 = this._auxArray[0] * s + this.m13 * c;
		this.m23 = this._auxArray[1] * s + this.m23 * c;
		this.m33 = this._auxArray[2] * s + this.m33 * c;
		this.m43 = this._auxArray[3] * s + this.m43 * c;
		
		return this._fireSignal(true);
	}

	rotateZ(angle: number): this {

		const s: number = Math.sin(angle * ae.RAD_FACTOR);
		const c: number = Math.cos(angle * ae.RAD_FACTOR);
	
		// Copy column 1
		this.getColumnArray(0, this._auxArray);
		
		// Compute column 1
		this.m11 = this._auxArray[0] * c + this.m12 * s;
		this.m21 = this._auxArray[1] * c + this.m22 * s;
		this.m31 = this._auxArray[2] * c + this.m32 * s;
		this.m41 = this._auxArray[3] * c + this.m42 * s;
		
		// Compute column 2
		this.m12 = this.m12 * c - this._auxArray[0] * s;
		this.m22 = this.m22 * c - this._auxArray[1] * s;
		this.m32 = this.m32 * c - this._auxArray[2] * s;
		this.m42 = this.m42 * c - this._auxArray[3] * s;
		
		return this._fireSignal(true);
	}

	scaleA(value: number): this {
		return this.scaleB(value, value, value);
	}
	
	scaleB(
			x: number,
			y: number,
			z: number): this {
		
		this.m11 *= x; this.m12 *= y; this.m13 *= z;
		this.m21 *= x; this.m22 *= y; this.m23 *= z;
		this.m31 *= x; this.m32 *= y; this.m33 *= z;
		this.m41 *= x; this.m42 *= y; this.m43 *= z;
		
		return this._fireSignal(true);
	}
	
	setData(src: ae.math.Matrix4D): this {
		this._data.set(src._data);
		return this._fireSignal(true);
	}
	
	setDataArray(
			src:    (Array<number> | Float32Array),
			offset:  number = 0): this {
		
		for(let i = 0; i < 16; i++) this._data[i] = src[offset + i];
		return this._fireSignal(true);
	}
	
	setDataDirect(
			m11: number,
    		m12: number,
    		m13: number,
    		m14: number,
    		m21: number,
    		m22: number,
    		m23: number,
    		m24: number,
    		m31: number,
    		m32: number,
    		m33: number,
    		m34: number,
    		m41: number,
    		m42: number,
    		m43: number,
    		m44: number): this {
		
		this.m11 = m11; this.m12 = m12; this.m13 = m13; this.m14 = m14;
		this.m21 = m21; this.m22 = m22; this.m23 = m23; this.m24 = m24;
		this.m31 = m31; this.m32 = m32; this.m33 = m33; this.m34 = m34;
		this.m41 = m41; this.m42 = m42; this.m43 = m43; this.m44 = m44;
		
		return this._fireSignal(true);
	}
	
	setElement(
			rIndex: number,
			cIndex: number,
			value:  number): this {
		
		this._data[cIndex * 4 + rIndex] = value;
		return this._fireSignal(rIndex < 3 && cIndex < 3);
	}

	toIdentity(): this {
		
		this.m11 = this.m22 = this.m33 = this.m44 = 1;

		this.m12 = this.m13 = this.m14 = this.m21 = this.m23 = this.m24 =
		this.m31 = this.m32 = this.m34 = this.m41 = this.m42 = this.m43 = 0;
		
		return this._fireSignal(true);
	}
	
	translate(
			x: number,
			y: number,
			z: number): this {

		this.m14 = this.m11 * x + this.m12 * y + this.m13 * z + this.m14;
		this.m24 = this.m21 * x + this.m22 * y + this.m23 * z + this.m24;
		this.m34 = this.m31 * x + this.m32 * y + this.m33 * z + this.m34;
		this.m44 = this.m41 * x + this.m42 * y + this.m43 * z + this.m44;

		return this._fireSignal(false);
	}
}
