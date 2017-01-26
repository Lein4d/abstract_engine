/**       */

const ae = {};

ae.core = {};
ae.math = {};
ae.mesh = {};
ae.util = {};

ae.VERSION_MAJOR    = 0;
ae.VERSION_MINOR    = 9;
ae.VERSION_REVISION = 0;

ae.RAD_FACTOR = Math.PI / 180;
ae.DEG_FACTOR = 180 / Math.PI;

ae.AbstractEngine = class AbstractEngine {
	
	                          
	
	constructor(canvas                   ) {
		
		const glContext = canvas.getContext("webgl");
		
		if(!glContext) throw "No Web-GL context available";
		
		this.gl = glContext || new WebGLRenderingContext();
		
		// Wait for WebGLRenderingContext type in flow
		
		//this.gl.viewport(0, 0, canvas.width, canvas.height);
	}
};

                                            
                                                           

// I_Mij = index of entry in row i and column j
ae.I_M11 =  0;
ae.I_M12 =  4;
ae.I_M13 =  8;
ae.I_M14 = 12;
ae.I_M21 =  1;
ae.I_M22 =  5;
ae.I_M23 =  9;
ae.I_M24 = 13;
ae.I_M31 =  2;
ae.I_M32 =  6;
ae.I_M33 = 10;
ae.I_M34 = 14;
ae.I_M41 =  3;
ae.I_M42 =  7;
ae.I_M43 = 11;
ae.I_M44 = 15;

// I_NMij = index of entry in row i and column j (normal matrix)
ae.I_NM11 = 0;
ae.I_NM12 = 3;
ae.I_NM13 = 6;
ae.I_NM21 = 1;
ae.I_NM22 = 4;
ae.I_NM23 = 7;
ae.I_NM31 = 2;
ae.I_NM32 = 5;
ae.I_NM33 = 8;

ae.math.Matrix4D = class Matrix4D {
	
	                              
	                                                    
	                              
	                                         
	                                         

	_computeNormalMatrix(nmData               )                {

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

	_getColumnVector(cIndex        )                   {
		
		const vector =
			this._columnVectors[cIndex] ||
			new ae.math.Vector4D(
				new ae.math.MatrixVector(this, false, cIndex));
		
		this._columnVectors[cIndex] = vector;
		
		return vector;
	}
	
	_getRowVector(rIndex        )                   {
		
		const vector =
			this._rowVectors[rIndex] ||
			new ae.math.Vector4D(
				new ae.math.MatrixVector(this, true, rIndex));
		
		this._rowVectors[rIndex] = vector;
		
		return vector;
	}
	
	constructor() {
		
		this._data          = Array(16);
		this._auxArray          = Array(16);
		this._rowVectors    = Array(4);
		this._columnVectors = Array(4);
		
		this._nmDataCached = new ae.other.CachedObject(
			Array(9),
			(obj                ) => {
				return this._computeNormalMatrix(ae.util.assertNotNull(obj));
			});
		
		this.toIdentity();
	}
	
	get m11()         {return this._data[ae.I_M11];}
	get m12()         {return this._data[ae.I_M12];}
	get m13()         {return this._data[ae.I_M13];}
	get m14()         {return this._data[ae.I_M14];}
	get m21()         {return this._data[ae.I_M21];}
	get m22()         {return this._data[ae.I_M22];}
	get m23()         {return this._data[ae.I_M23];}
	get m24()         {return this._data[ae.I_M24];}
	get m31()         {return this._data[ae.I_M31];}
	get m32()         {return this._data[ae.I_M32];}
	get m33()         {return this._data[ae.I_M33];}
	get m34()         {return this._data[ae.I_M34];}
	get m41()         {return this._data[ae.I_M41];}
	get m42()         {return this._data[ae.I_M42];}
	get m43()         {return this._data[ae.I_M43];}
	get m44()         {return this._data[ae.I_M44];}
	
	get nm11()         {return this._nmDataCached.object[ae.I_NM11];}
	get nm12()         {return this._nmDataCached.object[ae.I_NM12];}
	get nm13()         {return this._nmDataCached.object[ae.I_NM13];}
	get nm21()         {return this._nmDataCached.object[ae.I_NM21];}
	get nm22()         {return this._nmDataCached.object[ae.I_NM22];}
	get nm23()         {return this._nmDataCached.object[ae.I_NM23];}
	get nm31()         {return this._nmDataCached.object[ae.I_NM31];}
	get nm32()         {return this._nmDataCached.object[ae.I_NM32];}
	get nm33()         {return this._nmDataCached.object[ae.I_NM33];}
	
	get c1()                   {return this._getColumnVector(0);}
	get c2()                   {return this._getColumnVector(1);}
	get c3()                   {return this._getColumnVector(2);}
	get c4()                   {return this._getColumnVector(3);}
	
	get r1()                   {return this._getRowVector(0);}
	get r2()                   {return this._getRowVector(1);}
	get r3()                   {return this._getRowVector(2);}
	get r4()                   {return this._getRowVector(3);}
	
	set m11(value        ) {this._data[ae.I_M11] = value;}
	set m12(value        ) {this._data[ae.I_M12] = value;}
	set m13(value        ) {this._data[ae.I_M13] = value;}
	set m14(value        ) {this._data[ae.I_M14] = value;}
	set m21(value        ) {this._data[ae.I_M21] = value;}
	set m22(value        ) {this._data[ae.I_M22] = value;}
	set m23(value        ) {this._data[ae.I_M23] = value;}
	set m24(value        ) {this._data[ae.I_M24] = value;}
	set m31(value        ) {this._data[ae.I_M31] = value;}
	set m32(value        ) {this._data[ae.I_M32] = value;}
	set m33(value        ) {this._data[ae.I_M33] = value;}
	set m34(value        ) {this._data[ae.I_M34] = value;}
	set m41(value        ) {this._data[ae.I_M41] = value;}
	set m42(value        ) {this._data[ae.I_M42] = value;}
	set m43(value        ) {this._data[ae.I_M43] = value;}
	set m44(value        ) {this._data[ae.I_M44] = value;}
	
	applyToDirVectorA(v                  )                   {
		
		v.getDataC(this._auxArray);
		this.applyToDirVectorB(this._auxArray);
		v.setDataC(this._auxArray);
		
		return v;
	}
	
	applyToDirVectorB(
			v                    ,
			offset         = 0)                {
		
		const nmData = this._nmDataCached.object;
		
		// Copy vector at temp array starting at position 3
		for(var i = 0; i < 3; i++) this._auxArray[3 + i] = v[offset + i];
		
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
	
	applyToOriginA(dst                  )                   {
		return dst.setDataC(this.applyToOriginD(this._auxArray, 3));
	}
	
	applyToOriginB(dst                  )                   {
		return dst.setDataC(this.applyToOriginD(this._auxArray, 4));
	}
	
	applyToOriginC(
			dst                  ,
			offset         = 0)                {
		
		return this.applyToOriginD(dst, dst.length - offset, offset);
	}
	
	applyToOriginD(
			dst                     ,
			dimension        ,
			offset            = 0)                {
		
		for(var i = 0; i < dimension; i++)
			dst[offset + i] = this.getElement(i, 3);
		
		return dst;
	}
	
	applyToPointA(p                  )                   {
		return p.setDataC(this.applyToPointD(p.getDataC(this._auxArray), 3));
	}
	
	applyToPointB(p                  )                   {
		return p.setDataC(this.applyToPointD(p.getDataC(this._auxArray), 4));
	}
	
	applyToPointC(
			p                    ,
			offset         = 0)                {
		
		return this.applyToPointD(p, p.length - offset, offset);
	}
	
	applyToPointD(
			p                       ,
			dimension        ,
			offset            = 0)                {
		
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
	
	getColumnA(cIndex        )                   {
		return this._getColumnVector(cIndex);
	}
	
	getColumnB(
			cIndex        ,
			dst                  ,
			offset         = 0)                {
		
		for(var i = 0; i < 4; i++) dst[offset + i] = this._data[cIndex * 4 + i];
		return dst;
	}
	
	getDataA(dst                  )                   {
		this.getDataB(dst._data);
		return dst;
	}
	
	getDataB(
			dst                  ,
			offset         = 0)                {
		
		for(var i = 0; i < 16; i++) dst[offset + i] = this._data[i];
		return dst;
	}
	
	getElement(
			rIndex         ,
			cIndex         )         {
		
		return this._data[cIndex * 4 + rIndex];
	}
	
	getNmData(
			dst                  ,
			offset         = 0)                {
		
		const nmData = this._nmDataCached.object;
		
		for(var i = 0; i < 9; i++) dst[offset + i] = nmData[i];
		return dst;
	}
	
	getRowA(rIndex        )                   {
		return this._getRowVector(rIndex);
	}
	
	getRowB(
			rIndex        ,
			dst                  ,
			offset         = 0)                {
		
		for(var i = 0; i < 4; i++) dst[offset + i] = this._data[i * 4 + rIndex];
		return dst;
	}
	
	multWithMatrix(m                  )                   {
		
		// this = this * m;

		this.getDataB(this._auxArray);
		
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
		
		return this;
	}
	
	projectOrthogonal(
			left          ,
			right         ,
			bottom        ,
			top           ,
			near          ,
			far           )                   {
	
		// /a 0 0 d\
		// |0 b 0 e|
		// |0 0 c f|
		// \0 0 0 1/
	
		const a         = 2 / (right - left);
		const b         = 2 / (top   - bottom);
		const c         = 2 / (near  - far);
		const d         = (right + left)   / (right - left);
		const e         = (top   + bottom) / (top   - bottom);
		const f         = (far   + near)   / (far   - near);
	
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
		
		return this;
	}

	projectOrthogonalSym(
			width         ,
			height        ,
			near          ,
			far           )                   {

		return this.projectOrthogonal(
			-width / 2, width / 2, -height / 2, height / 2, near, far);
	}

	projectPerspective(
			left          ,
			right         ,
			bottom        ,
			top           ,
			near          ,
			far            = 0)                   {
	
		// /a 0  c 0\
		// |0 b  d 0|
		// |0 0  e f|
		// \0 0 -1 0/

		const a         = 2 * near / (right - left);
		const b         = 2 * near / (top   - bottom);
		const c         = (right + left)   / (right - left);
		const d         = (top   + bottom) / (top   - bottom);
		
		this.getColumnB(2, this._auxArray);
		
		if(far < near) { // far-ClippingPlane at infinity (e=-1,f=-2*near)
		
			const f         = -2 * near;

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
		
			const e         = (near - far) / (far - near);
			const f         = 2 * far * near / (near - far);
		
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
		
		return this;
	}

	projectPerspectiveHorFOV(
			vpWidth         ,
			vpHeight        ,
			fov             ,
			near            ,
			far              = 0)                   {

		const width         = 2 * Math.tan(fov * Math.PI / 360) * near;
		
		return this.projectPerspectiveSym(
			width, width * vpHeight / vpWidth, near, far);
	}
	
	projectPerspectiveSym(
			width         ,
			height        ,
			near          ,
			far            = 0)                   {
		
		return this.projectPerspective(
			-width / 2, width / 2, -height / 2, height / 2, near, far);
	}

	projectPerspectiveVerFOV(
			vpWidth         ,
			vpHeight        ,
			fov             ,
			near            ,
			far              = 0)                   {

		const height         = 2 * Math.tan(fov * Math.PI / 360) * near;
		
		return this.projectPerspectiveSym(
			height * vpWidth / vpHeight, height, near, far);
	}

	rotateX(angle        )                   {
		
		const s         = Math.sin(angle * ae.RAD_FACTOR);
		const c         = Math.cos(angle * ae.RAD_FACTOR);
		
		// Copy column 2
		this.getColumnB(1, this._auxArray);
		
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
		
		return this;
	}

	rotateY(angle        )                   {

		const s         = Math.sin(angle * ae.RAD_FACTOR);
		const c         = Math.cos(angle * ae.RAD_FACTOR);
	
		// Copy column 1
		this.getColumnB(0, this._auxArray);
		
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
		
		return this;
	}

	rotateZ(angle        )                   {

		const s         = Math.sin(angle * ae.RAD_FACTOR);
		const c         = Math.cos(angle * ae.RAD_FACTOR);
	
		// Copy column 1
		this.getColumnB(0, this._auxArray);
		
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
		
		return this;
	}

	scaleA(value        )                   {
		return this.scaleB(value, value, value);
	}
	
	scaleB(
			x        ,
			y        ,
			z        )                   {
		
		this.m11 *= x; this.m12 *= y; this.m13 *= z;
		this.m21 *= x; this.m22 *= y; this.m23 *= z;
		this.m31 *= x; this.m32 *= y; this.m33 *= z;
		this.m41 *= x; this.m42 *= y; this.m43 *= z;
		
		return this;
	}
	
	setDataA(src                  )                   {
		return this.setDataB(src._data);
	}
	
	setDataB(
			src                  ,
			offset         = 0)                   {
		
		for(var i = 0; i < 16; i++) this._data[i] = src[offset + i];
		return this;
	}
	
	setDataC(
			m11        ,
    		m12        ,
    		m13        ,
    		m14        ,
    		m21        ,
    		m22        ,
    		m23        ,
    		m24        ,
    		m31        ,
    		m32        ,
    		m33        ,
    		m34        ,
    		m41        ,
    		m42        ,
    		m43        ,
    		m44        )                   {
		
		this.m11 = m11; this.m12 = m12; this.m13 = m13; this.m14 = m14;
		this.m21 = m21; this.m22 = m22; this.m23 = m23; this.m24 = m24;
		this.m31 = m31; this.m32 = m32; this.m33 = m33; this.m34 = m34;
		this.m41 = m41; this.m42 = m42; this.m43 = m43; this.m44 = m44;
		
		return this;
	}
	
	setElement(
			rIndex        ,
			cIndex        ,
			value         )                   {
		
		this._data[cIndex * 4 + rIndex] = value;
		return this;
	}

	toIdentity()                   {
		
		this.m11 = this.m22 = this.m33 = this.m44 = 1;

		this.m12 = this.m13 = this.m14 = this.m21 = this.m23 = this.m24 =
		this.m31 = this.m32 = this.m34 = this.m41 = this.m42 = this.m43 = 0;
		
		return this;
	}
	
	translate(
			x        ,
			y        ,
			z        )                   {

		this.m14 = this.m11 * x + this.m12 * y + this.m13 * z + this.m14;
		this.m24 = this.m21 * x + this.m22 * y + this.m23 * z + this.m24;
		this.m34 = this.m31 * x + this.m32 * y + this.m33 * z + this.m34;
		this.m44 = this.m41 * x + this.m42 * y + this.m43 * z + this.m44;

		return this;
	}
};

ae.math.Vector3D = class Vector3D {
	
	                                
	                           
	
	          
	          
	          
	
	constructor(backend                       ) {
		
		this.backend  = backend;
		this.readOnly = backend instanceof ae.math.ReadOnlyBackend ?
			this : new Vector3D(new ae.math.ReadOnlyBackend(backend));
		
		this.x = 0; this.y = 0; this.z = 0;
	}
	
	addA(value        )                   {
		
		this.backend.x += value;
		this.backend.y += value;
		this.backend.z += value;
		
		return this;
	}
	
	addB(v                  )                   {
		
		this.backend.x += v.backend.x;
		this.backend.y += v.backend.y;
		this.backend.z += v.backend.z;
		
		return this;
	}
	
	static angleDeg(
			v1                  ,
			v2                  )         {
		
		return Vector3D.angleRad(v1, v2) * ae.DEG_FACTOR;
	}
	
	static angleRad(
			v1                  ,
			v2                  )         {
		
		return Math.acos(
			Vector3D.dot(v1, v2) / (v1.computeLength() * v2.computeLength()));
	}
	
	cloneConst()                   {
		return new Vector3D(new ae.math.ReadOnlyBackend(
			new ae.math.StaticBackend(this.backend)));
	}
	
	cloneDeep()                   {
		return new Vector3D(this.backend);
	}
	
	cloneStatic()                   {
		return new Vector3D(new ae.math.StaticBackend(this.backend));
	}
	
	computeLength()         {
		this.copyStaticValues();
		return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
	}

	computeMean()         {
		return (this.backend.x + this.backend.y + this.backend.z) / 3;
	}

	copyStaticValues()                   {
		
		this.x = this.backend.x;
		this.y = this.backend.y;
		this.z = this.backend.z;
		
		return this;
	}

	static createConstA(grey         = 0)                   {
		return Vector3D.createConstB(grey, grey, grey);
	}

	static createConstB(
			x        ,
			y        ,
			z        )                   {
		
		return new Vector3D(new ae.math.ReadOnlyBackend(
			new ae.math.ConstBackend(x, y, z)));
	}

	static createStaticA(grey         = 0)                   {
		return Vector3D.createStaticB(grey, grey, grey);
	}

	static createStaticB(
			x        ,
			y        ,
			z        )                   {
		
		return new Vector3D(new ae.math.ReadOnlyBackend(
			new ae.math.StaticBackend(x, y, z)));
	}

	static cross(
			v1                   ,
			v2                   ,
			dst                  )                   {
		
		v1.copyStaticValues();
		v2.copyStaticValues();
		
		dst.backend.x = v1.y * v2.z - v1.z * v2.y;
		dst.backend.y = v1.z * v2.x - v1.x * v2.z;
		dst.backend.z = v1.x * v2.y - v1.y * v2.x;
		
		return dst;
	}
	
	divA(value        )                   {
		
		this.backend.x /= value;
		this.backend.y /= value;
		this.backend.z /= value;
		
		return this;
	}
	
	divB(v                  )                   {
		
		this.backend.x /= v.backend.x;
		this.backend.y /= v.backend.y;
		this.backend.z /= v.backend.z;
		
		return this;
	}
	
	static dot(
			v1                  ,
			v2                  )         {
		
		return (
			v1.backend.x * v2.backend.x + v1.backend.y * v2.backend.y +
			v1.backend.z * v2.backend.z);
	}
	
	getDataA(dst                  )                   {
		this.getDataB(dst.backend);
		return dst;
	}
	
	getDataB(dst                       )                        {
		
		dst.x = this.backend.x;
		dst.y = this.backend.y;
		dst.z = this.backend.z;
		
		return dst;
	}
	
	getDataC(
			dst                  ,
			offset         = 0)                {
		
		dst[offset + 0] = this.backend.x;
		dst[offset + 1] = this.backend.y;
		dst[offset + 2] = this.backend.z;
		
		return dst;
	}
	
	multA(value        )                   {
		
		this.backend.x *= value;
		this.backend.y *= value;
		this.backend.z *= value;
		
		return this;
	}
	
	multB(v                  )                   {
		
		this.backend.x *= v.backend.x;
		this.backend.y *= v.backend.y;
		this.backend.z *= v.backend.z;
		
		return this;
	}
	
	normalize()                   {
		return this.divA(this.computeLength());
	}
	
	setDataA(src                  )                   {
		return this.setDataB(src.backend);
	}
	
	setDataB(src                       )                   {
		return this.setDataD(src.x, src.y, src.z);
	}
	
	setDataC(
			src                  ,
			offset         = 0)                   {
		
		return this.setDataD(src[offset + 0], src[offset + 1], src[offset + 2]);
	}
	
	setDataD(
			x        ,
			y        ,
			z        )                   {
		
		this.backend.x = x; this.backend.y = y; this.backend.z = z;
		return this;
	}
	
	subA(value        )                   {
		
		this.backend.x -= value;
		this.backend.y -= value;
		this.backend.z -= value;
		
		return this;
	}
	
	subB(v                  )                   {
		
		this.backend.x -= v.backend.x;
		this.backend.y -= v.backend.y;
		this.backend.z -= v.backend.z;
		
		return this;
	}
	
	toZeroVector()                   {
		return this.setDataD(0, 0, 0);
	}
};

ae.math.Vector4D = class Vector4D {
	
	                                
	                           
	                           
	
	          
	          
	          
	          
	
	constructor(
			backend                        ,
			_xyz                      ) {
		
		if(backend instanceof ae.math.ReadOnlyBackend) {
			
			this.backend  = backend;
			this.xyz      = _xyz || new ae.math.Vector3D(backend);
			this.readOnly = this;
			
		} else {
			
			this.backend  = backend;
			this.xyz      = new ae.math.Vector3D(backend);
			this.readOnly = new Vector4D(
				new ae.math.ReadOnlyBackend(backend), this.xyz.readOnly);
		}
		
		this.x = 0;
		this.y = 0;
		this.z = 0;
		this.w = 0;
	}
	
	addA(value        )                   {
		
		this.backend.x += value;
		this.backend.y += value;
		this.backend.z += value;
		this.backend.w += value;
		
		return this;
	}
	
	addB(v                  )                   {
		
		this.backend.x += v.backend.x;
		this.backend.y += v.backend.y;
		this.backend.z += v.backend.z;
		this.backend.w += v.backend.w;
		
		return this;
	}
	
	cloneConst()                   {
		
		return new Vector4D(new ae.math.ReadOnlyBackend(
			new ae.math.StaticBackend(this.backend)));
	}
	
	cloneDeep()                   {
		
		return new Vector4D(this.backend);
	}
	
	cloneStatic()                   {
		
		return new Vector4D(new ae.math.StaticBackend(this.backend));
	}
	
	computeLength()         {
		this.copyStaticValues();
		return Math.sqrt(
			this.x * this.x + this.y * this.y +
			this.z * this.z + this.w * this.w);
	}

	computeMean()         {
		return (
			this.backend.x + this.backend.y +
			this.backend.z + this.backend.w) / 4;
	}

	copyStaticValues()                   {
		
		this.x = this.backend.x;
		this.y = this.backend.y;
		this.z = this.backend.z;
		this.w = this.backend.w;
		
		return this;
	}

	static createConstA(grey         = 0)                   {
		return Vector4D.createConstC(grey, grey, grey, grey);
	}

	static createConstB(
			grey         = 0,
			w            = 1)                   {
				
		return Vector4D.createConstC(grey, grey, grey, w);
	}

	static createConstC(
			x        ,
			y        ,
			z        ,
			w        )                   {
		
		return new Vector4D(new ae.math.ReadOnlyBackend(
			new ae.math.ConstBackend(x, y, z, w)));
	}

	static createStaticA(grey         = 0)                   {
		return Vector4D.createStaticC(grey, grey, grey, grey);
	}

	static createStaticB(
			grey         = 0,
			w            = 1)                   {
				
		return Vector4D.createStaticC(grey, grey, grey, w);
	}

	static createStaticC(
			x        ,
			y        ,
			z        ,
			w        )                   {
		
		return new Vector4D(new ae.math.ReadOnlyBackend(
			new ae.math.StaticBackend(x, y, z, w)));
	}

	divA(value        )                   {
		
		this.backend.x /= value;
		this.backend.y /= value;
		this.backend.z /= value;
		this.backend.w /= value;
		
		return this;
	}
	
	divB(v                  )                   {
		
		this.backend.x /= v.backend.x;
		this.backend.y /= v.backend.y;
		this.backend.z /= v.backend.z;
		this.backend.w /= v.backend.w;
		
		return this;
	}
	
	dot(v                  )         {
		
		return (
			this.backend.x * v.backend.x + this.backend.y * v.backend.y +
			this.backend.z * v.backend.z + this.backend.w * v.backend.w);
	}
	
	getDataA(dst                  )                   {
		this.getDataB(dst.backend);
		return dst;
	}
	
	getDataB(dst                       )                        {
		
		dst.x = this.backend.x;
		dst.y = this.backend.y;
		dst.z = this.backend.z;
		dst.w = this.backend.w;
		
		return dst;
	}
	
	getDataC(
			dst                  ,
			offset         = 0)                {
		
		dst[offset + 0] = this.backend.x;
		dst[offset + 1] = this.backend.y;
		dst[offset + 2] = this.backend.z;
		dst[offset + 3] = this.backend.w;
		
		return dst;
	}
	
	multA(value        )                   {
		
		this.backend.x *= value;
		this.backend.y *= value;
		this.backend.z *= value;
		this.backend.w *= value;
		
		return this;
	}
	
	multB(v                  )                   {
		
		this.backend.x *= v.backend.x;
		this.backend.y *= v.backend.y;
		this.backend.z *= v.backend.z;
		this.backend.w *= v.backend.w;
		
		return this;
	}
	
	setDataA(src                  )                   {
		return this.setDataB(src.backend);
	}
	
	setDataB(src                       )                   {
		return this.setDataD(src.x, src.y, src.z, src.w);
	}
	
	setDataC(
			src                  ,
			offset         = 0)                   {
		
		return this.setDataD(
			src[offset + 0], src[offset + 1], src[offset + 2], src[offset + 3]);
	}
	
	setDataD(
			x        ,
			y        ,
			z        ,
			w        )                   {
		
		this.backend.x = x;
		this.backend.y = y;
		this.backend.z = z;
		this.backend.w = w;
		
		return this;
	}
	
	subA(value        )                   {
		
		this.backend.x -= value;
		this.backend.y -= value;
		this.backend.z -= value;
		this.backend.w -= value;
		
		return this;
	}
	
	subB(v                  )                   {
		
		this.backend.x -= v.backend.x;
		this.backend.y -= v.backend.y;
		this.backend.z -= v.backend.z;
		this.backend.w -= v.backend.w;
		
		return this;
	}
	
	toZeroPoint()                   {
		return this.setDataD(0, 0, 0, 1);
	}
	
	toZeroVector()                   {
		return this.setDataD(0, 0, 0, 0);
	}
};

ae.math.VectorBackend = class VectorBackend {
	
	get x()         {return 0;}
	get y()         {return 0;}
	get z()         {return 0;}
	get w()         {return 0;}
	
	set x(x        )                        {return this;}
	set y(y        )                        {return this;}
	set z(z        )                        {return this;}
	set w(w        )                        {return this;}
	
	getElement(index        )         {
		
		switch(index) {
			case 0: return this.x;
			case 1: return this.y;
			case 2: return this.z;
			case 3: return this.w;
		}
		
		return 0;
	}
	
	setElement(
			index        ,
			value        )                        {
		
		switch(index) {
			case 0: this.x = value; break;
			case 1: this.y = value; break;
			case 2: this.z = value; break;
			case 3: this.w = value; break;
		}
		
		return this;
	}
};

ae.math.MatrixVector = class MatrixVector extends ae.math.VectorBackend {
	
	                           
	                  
	                 
	
	constructor(
			matrix                   ,
			isRow           ,
			rcIndex        ) {
		
		super();
		
		this._matrix  = matrix;
		this._isRow   = isRow;
		this._rcIndex = rcIndex;
	}

	get x()         {return this.getElement(0);}
	get y()         {return this.getElement(1);}
	get z()         {return this.getElement(2);}
	get w()         {return this.getElement(3);}
	
	set x(x        )                        {
		
		this.setElement(0, x);
		return this;
	}
	
	set y(y        )                        {
		
		this.setElement(1, y);
		return this;
	}
	
	set z(z        )                        {
		
		this.setElement(2, z);
		return this;
	}
	
	set w(w        )                        {
		
		this.setElement(3, w);
		return this;
	}
	
	getElement(index        )         {
		
		return this._isRow ?
			this._matrix.getElement(this._rcIndex, index) :
			this._matrix.getElement(index,         this._rcIndex);
	}

	setElement(
			index        ,
			value        )                        {
		
		this._matrix.setElement(
			this._isRow ? this._rcIndex : index,
			this._isRow ? index         : this._rcIndex,
			value);
		
		return this;
	}
};

ae.math.ReadOnlyBackend = class ReadOnlyBackend extends ae.math.VectorBackend {
	
	                                
	
	constructor(
			backend                       ) {
		
		super();
		
		this._backend = backend;
	}
	
	get x()         {return this._backend.x;}
	get y()         {return this._backend.y;}
	get z()         {return this._backend.z;}
	get w()         {return this._backend.w;}
	
	set x(x        )                        {return this;}
	set y(y        )                        {return this;}
	set z(z        )                        {return this;}
	set w(w        )                        {return this;}
	
	getElement(index        )         {
		
		return this._backend.getElement(index);
	}
	
	setElement(
			index        ,
			value        )                        {
		
		return this;
	}
};

ae.math.StaticBackend = class StaticBackend extends ae.math.VectorBackend {
	
	                     
	
	constructor(
			xOrBackend                                ,
			y                  = 0,
			z                  = 0,
			w                  = 0) {
		
		super();
		
		this._data = xOrBackend instanceof ae.math.VectorBackend ?
			[xOrBackend.x, xOrBackend.y, xOrBackend.z, xOrBackend.w] :
			[xOrBackend,   y,            z,            w];
	}
	
	get x()         {return this._data[0];}
	get y()         {return this._data[1];}
	get z()         {return this._data[2];}
	get w()         {return this._data[3];}
	
	set x(x        )                        {
		
		this._data[0] = x;
		return this;
	}
	
	set y(y        )                        {
		
		this._data[1] = y;
		return this;
	}
	
	set z(z        )                        {
		
		this._data[2] = z;
		return this;
	}
	
	set w(w        )                        {
		
		this._data[3] = w;
		return this;
	}
	
	getElement(index        )         {
		
		return this._data[index];
	}
	
	setElement(
			index        ,
			value        )                        {
		
		this._data[index] = value;
		
		return this;
	}
};

ae.mesh.Adjacency = class Adjacency {
		
	                                         
	                           
	
	constructor(mb                     ) {
		
		mb._assertTrianglesSealed();
		
		this._data              = Array(mb._vertices.length);
		this._maxAdjacencyCount = 0;
		
		const vertexCount    = mb.vertexCount;
		const adjacencyCount = Array(vertexCount);
		
		// Pass 1: Count the adjacency polygons for each vertex
		for(let i = 0; i < mb._triangles.length; i++)
			for(let j = 0; j < 3; j++)
				adjacencyCount[mb._triangles[i]._vIndices[j]]++;
		
		// Pass 2: Create the adjacency arrays
		for(let i = 0; i < vertexCount; i++) {
			this._data[i]           = Array(adjacencyCount[i]);
			this._maxAdjacencyCount =
				Math.max(this._maxAdjacencyCount, adjacencyCount[i]);
		}
		
		// Pass 3: Initialize the adjacency arrays
		// Use the previous computed adjacency count to determine the slot that
		// is written next by decrementing the counter each time
		for(let i = 0; i < mb._triangles.length; i++) {
			const vIndices = mb._triangles[i]._vIndices;
			for(let j = 0; j < 3; j++) {
				adjacencyCount[j]--;
				this._data[j][adjacencyCount[vIndices[j]]] = i;
			}
		}
	}
}

ae.mesh._QUAD_POSITIONS = [[0,0,0],[1,0,0],[1,0,1],[0,0,1]];
ae.mesh._QUAD_TEXCOORDS = [[0,0],[0,1],[1,1],[1,0]];
ae.mesh._QUAD_INDICES   = [[0,1,2,3],[3,2,1,0]];
	
ae.mesh._CUBE_POSITIONS = [
	[0,0,0],[0,1,0],[1,1,0],[1,0,0],  // front
	[1,0,0],[1,1,0],[1,1,1],[1,0,1],  // right
	[1,0,1],[1,1,1],[0,1,1],[0,0,1],  // back
	[0,0,1],[0,1,1],[0,1,0],[0,0,0],  // left
	[0,0,0],[1,0,0],[1,0,1],[0,0,1],  // bottom
	[0,1,0],[0,1,1],[1,1,1],[1,1,0]]; // top

ae.mesh._CUBE_TEXCOORDS = [
	[0,0],[0,1],[1,1],[1,0],
	[0,0],[0,1],[1,1],[1,0],
	[0,0],[0,1],[1,1],[1,0],
	[0,0],[0,1],[1,1],[1,0],
	[0,0],[0,1],[1,1],[1,0],
	[0,0],[0,1],[1,1],[1,0]];
/*
ae.mesh._computeCylinderShellData = function _computeCylinderShellData(
		subdivisions: number,
		iOffset:      number,
		vOffset:      number,
		indices:      Array<Array<number>>,
		positions:    Array<Array<number>>,
		normals:      Array<Array<number>>,
		texCoords:    Array<Array<number>>): void {
	
	const ringSize = subdivisions + 1;
	
	for(var i = 0; i < subdivisions; i++) {
		
		const iPos = iOffset + i;
		const vPos = vOffset + i;
		
		indices[iPos][0] = vPos;
		indices[iPos][1] = vPos + ringSize;
		indices[iPos][2] = vPos + ringSize + 1;
		indices[iPos][3] = vPos            + 1;
	}
	
	ae.mesh._computeDiscVertices(
		subdivisions, 0, vOffset,
		false, positions, normals, null);
	ae.mesh._computeDiscVertices(
		subdivisions, 1, vOffset + ringSize,
		false, positions, normals, null);
	
	for(var i = 0; i < ringSize; i++) {
		
		const vPos = vOffset + i;
		
		texCoords[vPos           ][0] = i / subdivisions;
		texCoords[vPos           ][1] = 0;
		texCoords[vPos + ringSize][0] = i / subdivisions;
		texCoords[vPos + ringSize][1] = 1;
	}
}

ae.mesh._computeDiscData = function _computeDiscData(
		subdivisions: number,
		posY1:        number,
		posY2:        number,
		iOffset:      number,
		vOffset:      number,
		indices:      Array<Array<number>>,
		positions:    Array<Array<number>>,
		normals:      Array<Array<number>>,
		texCoords:    Array<Array<number>>): void {
	
	const quadCount = ae.mesh._computeDiscQuadCount(subdivisions);
	
	// Indices of down-facing cap
	ae.mesh._computeDiscIndices(
		subdivisions, iOffset,             vOffset,
		true, false, indices);
	// Indices of up-facing cap
	ae.mesh._computeDiscIndices(
		subdivisions, iOffset + quadCount, vOffset + subdivisions,
		true, true,  indices);
	
	// Vertices of down-facing cap
	ae.mesh._computeDiscVertices(
		subdivisions, posY1, vOffset,
		true, positions, null, texCoords);
	// Vertices of up-facing cap
	ae.mesh._computeDiscVertices(
		subdivisions, posY2, vOffset + subdivisions,
		true, positions, null, texCoords);
	
	// Fill normal data
	for(var i = 0; i < subdivisions; i++) {
		ae.math.Y_NEG.getData(normals[vOffset                + i]);
		ae.math.Y_POS.getData(normals[vOffset + subdivisions + i]);
	}
}

ae.mesh._computeDiscIndices = function _computeDiscIndices(
		subdivisions: number,
		iOffset:      number,
		vOffset:      number,
		wrapIndices:  boolean,
		invert:       boolean,
		indices:      Array<Array<number>>): void {

	const ringSize  = subdivisions + (wrapIndices ? 0 : 1);
	const quadCount = this._computeDiscQuadCount(subdivisions);
	const offset1   = invert ? 3 : 1;
	const offset3   = invert ? 1 : 3;
	
	for(var i = 0; i < quadCount; i++) {
		
		const iPos = iOffset + i;
		
		indices[iPos][0] = vOffset;
		indices[iPos][1] = vOffset + (2 * i + offset1) % ringSize;
		indices[iPos][2] = vOffset +  2 * i + 2;
		indices[iPos][3] = vOffset + (2 * i + offset3) % ringSize;
	}
}

ae.mesh._computeDiscVertices = function _computeDiscVertices(
		subdivisions: number,
		posY:         number,
		vOffset:      number,
		wrapIndices:  boolean,
		positions:    Array<Array<number>>,
		normals:     ?Array<Array<number>>,
		texCoords:   ?Array<Array<number>>): void {
	
	const ringSize = subdivisions + (wrapIndices ? 0 : 1);
	
	for(var i = 0; i < ringSize; i++) {
		
		const angle = 2.0 * Math.PI * i / subdivisions;
		const x     =  Math.sin(angle);
		const z     = -Math.cos(angle);
		
		positions[vOffset + i][0] = x;
		positions[vOffset + i][1] = posY;
		positions[vOffset + i][2] = z;
		
		if(normals) {
			normals[vOffset + i][0] = x;
			normals[vOffset + i][1] = 0;
			normals[vOffset + i][2] = z;
		}
		
		if(texCoords) {
			texCoords[vOffset + i][0] = (x + 1) / 2;
			texCoords[vOffset + i][1] = (z + 1) / 2;
		}
	}
}

ae.mesh._computeDiscQuadCount = function _computeDiscQuadCount(
		subdivisions: number): number {
	
	return Math.ceil((subdivisions - 2.0) / 2.0);
}

ae.mesh.createCube = function createCube(): ae.mesh.MeshBuilder {
	
	const mb = new ae.mesh.MeshBuilder();
	
	mb.positions     = ae.util.cloneArray2D(ae.mesh._CUBE_POSITIONS);
	mb.texCoords     = ae.util.cloneArray2D(ae.mesh._CUBE_TEXCOORDS);
	mb.primitiveType = ae.mesh.PrimitiveType.QUAD;
	mb.cullFacing    = true;
	
	mb.computeNormals(true, true);
	
	return mb;
}

ae.mesh.createCubeEx = function createCubeEx(
		centered:    boolean = true,
		widthOrSize: number  = 1,
		height:     ?number  = null,
		length:     ?number  = null): ae.mesh.MeshBuilder {
	
	const t = centered ? -0.5 : 0;
	
	return ae.mesh.createCube().transformPositions(new ae.math.Matrix4D().
		scale(widthOrSize, height || widthOrSize, length || widthOrSize).
		translate(t, t, t));
}

ae.mesh.createCylinder = function createCylinder(
		subdivisions: number,
		flat:         boolean = false): ae.mesh.MeshBuilder {
	
	const mb = new ae.mesh.MeshBuilder();
	
	const ringSize  = subdivisions + 1;
	const quadCount = ae.mesh._computeDiscQuadCount(subdivisions);
	
	const indices   = mb.createIndexArray(
		2 * quadCount + subdivisions, ae.mesh.PrimitiveType.QUAD);
	const positions = mb.createPositionArray(
		2 * subdivisions + 2 * ringSize);
	const normals   = mb.createNormalArray();
	const texCoords = mb.createTexCoordArray();
	
	ae.mesh._computeDiscData(
		subdivisions, 0, 1, 0, 0, indices, positions, normals, texCoords);
	
	ae.mesh._computeCylinderShellData(
		subdivisions, 2 * quadCount, 2 * subdivisions,
		indices, positions, normals, texCoords);
	
	mb.cullFacing = true;
	
	return mb;
}

ae.mesh.createCylinderEx = function createCylinderEx(
		subdivisions: number,
		flat:         boolean = false,
		height:       number  = 1,
		rxOrRadius:   number  = 1,
		rz:          ?number  = null): ae.mesh.MeshBuilder {
	
	return ae.mesh.createCylinder(subdivisions, flat).
		transformPositions(
			new ae.math.Matrix4D().scale(rxOrRadius, height, rz || rxOrRadius));
}

ae.mesh.createCylinderShell = function createCylinderShell(
		subdivisions: number,
		flat:         boolean = false): ae.mesh.MeshBuilder {
	
	const mb = new ae.mesh.MeshBuilder();
	
	const ringSize = subdivisions + 1;
	
	const indices   = mb.createIndexArray(
		subdivisions, ae.mesh.PrimitiveType.QUAD);
	const positions = mb.createPositionArray(2 * ringSize);
	const normals   = mb.createNormalArray();
	const texCoords = mb.createTexCoordArray();
	
	ae.mesh._computeCylinderShellData(
		subdivisions, 0, 0, indices, positions, normals, texCoords);
	
	mb.cullFacing = true;
	
	return mb;
}

ae.mesh.createCylinderShellEx = function createCylinderShellEx(
		subdivisions: number,
		flat:         boolean = false,
		height:       number  = 1,
		rxOrRadius:   number  = 1,
		rz:          ?number  = null): ae.mesh.MeshBuilder {
	
	return ae.mesh.createCylinderShell(subdivisions, flat).
		transformPositions(
			new ae.math.Matrix4D().scale(rxOrRadius, height, rz || rxOrRadius));
}

ae.mesh.createDisc = function createDisc(
		subdivisions: number): ae.mesh.MeshBuilder {
	
	const mb = new ae.mesh.MeshBuilder();
	
	const quadCount = ae.mesh._computeDiscQuadCount(subdivisions);
	
	const indices   = mb.createIndexArray(
		2 * quadCount, ae.mesh.PrimitiveType.QUAD);
	const positions = mb.createPositionArray(2 * subdivisions);
	const normals   = mb.createNormalArray();
	const texCoords = mb.createTexCoordArray();
	
	ae.mesh._computeDiscData(
		subdivisions, 0, 0, 0, 0, indices, positions, normals, texCoords);
	
	mb.cullFacing = true;
	
	return mb;
}

ae.mesh.createDiscEx = function createDiscEx(
		subdivisions: number,
		rxOrRadius:   number = 1,
		rz:          ?number = null): ae.mesh.MeshBuilder {
	
	return ae.mesh.createDisc(subdivisions).transformPositions(
		new ae.math.Matrix4D().scale(rxOrRadius, 1, rz || rxOrRadius));
}

ae.mesh.createQuad = function createQuad(): ae.mesh.MeshBuilder {
	
	const mb = new ae.mesh.MeshBuilder();
	
	mb.indices       = ae.util.cloneArray2D(ae.mesh._QUAD_INDICES);
	mb.positions     = ae.util.cloneArray2D(ae.mesh._QUAD_POSITIONS);
	mb.texCoords     = ae.util.cloneArray2D(ae.mesh._QUAD_TEXCOORDS);
	mb.primitiveType = ae.mesh.PrimitiveType.QUAD;
	mb.cullFacing    = true;
	
	mb.computeNormals(true, true);
	
	return mb;
}

ae.mesh.createQuadEx = function createQuadEx(
		centered:    boolean = true,
		widthOrSize: number  = 1,
		length:     ?number  = null): ae.mesh.MeshBuilder {
	
	const t = centered ? -0.5 : 0;
	
	return ae.mesh.createQuad().transformPositions(new ae.math.Matrix4D().
		scale(widthOrSize, 1, length || widthOrSize).translate(t, t, t));
}

ae.mesh.createTorus = function createTorus(
		subdivisionsHor: number,
		subdivisionsVer: number,
		flat:            boolean = false,
		radius:          number  = 2): ae.mesh.MeshBuilder {
	
	const mb = new ae.mesh.MeshBuilder();
	
	const ringSizeHor = subdivisionsHor + 1;
	const ringSizeVer = subdivisionsVer + 1;
	
	const indices   = mb.createIndexArray(
		subdivisionsHor * subdivisionsVer, ae.mesh.PrimitiveType.QUAD);
	const positions = mb.createPositionArray(ringSizeHor * ringSizeVer);
	const normals   = flat ? null : mb.createNormalArray();
	const texCoords = mb.createTexCoordArray();
	
	for(var i = 0; i < subdivisionsVer; i++) {
		for(var j = 0; j < subdivisionsHor; j++) {
			
			const iPos = i * subdivisionsHor + j;
			
			indices[iPos][0] =  i      * ringSizeHor +  j;
			indices[iPos][1] = (i + 1) * ringSizeHor +  j;
			indices[iPos][2] = (i + 1) * ringSizeHor + (j + 1);
			indices[iPos][3] =  i      * ringSizeHor + (j + 1);
		}
	}
	
	for(var i = 0; i < ringSizeVer; i++) {
		for(var j = 0; j < ringSizeHor; j++) {
			
			const angleHor = 2.0 * Math.PI * j / subdivisionsHor;
			const angleVer = 2.0 * Math.PI * i / subdivisionsVer;
			
			const vPos = i * ringSizeHor + j;
			
			positions[vPos][0] =
				Math.sin(angleHor) * (radius - Math.cos(angleVer));
			positions[vPos][1] =
				Math.sin(angleVer);
			positions[vPos][2] =
				Math.cos(angleHor) * (radius - Math.cos(angleVer));
			
			// The normals are computed similary to the positions, except
			// that the radius is assumed as 0 and thus removed from the
			// formula
			if(normals) {
				normals[vPos][0] = Math.sin(angleHor) * -Math.cos(angleVer);
				normals[vPos][1] = Math.sin(angleVer);
				normals[vPos][2] = Math.cos(angleHor) * -Math.cos(angleVer);
			}
			
			texCoords[vPos][0] = j / subdivisionsHor;
			texCoords[vPos][1] = i / subdivisionsVer;
		}
	}
	
	if(flat) mb.computeNormals(true, true);
	
	mb.cullFacing = true;
	
	return mb;
}

ae.mesh.createTorusEx = function createTorusEx(
		subdivisionsHor: number,
		subdivisionsVer: number,
		flat:            boolean = false,
		R:               number  = 2,
		rHorOrRadius:    number  = 1,
		rVer:           ?number  = null): ae.mesh.MeshBuilder {
	
	// The radius is set to preserve the ratio R/rHor
	return ae.mesh.createTorus(
			subdivisionsHor, subdivisionsVer, flat, R / rHorOrRadius).
		transformPositions(new ae.math.Matrix4D().
			scale(rHorOrRadius, rVer || rHorOrRadius, rHorOrRadius));
}

ae.mesh.createUVSphere = function createUVSphere(
		subdivisionsHor: number,
		flat:            boolean = false,
		subdivisionsVer: number  = -1): ae.mesh.MeshBuilder {
	
	const mb = new ae.mesh.MeshBuilder();
	
	if(subdivisionsVer <= 0) subdivisionsVer = subdivisionsHor;
	
	const vertexCount = (subdivisionsHor + 1) * (subdivisionsVer + 1);

	const indices   = mb.createIndexArray(
		subdivisionsHor * subdivisionsVer, ae.mesh.PrimitiveType.QUAD);
	const positions = mb.createPositionArray(vertexCount);
	const normals   = mb.createNormalArray();
	const texCoords = mb.createTexCoordArray();

	for(var i = 0; i < subdivisionsVer; i++) {
		for(var j = 0; j < subdivisionsHor; j++) {
			
			const iPos = i * subdivisionsHor + j;

			indices[iPos][0] =  i      * (subdivisionsHor + 1) +  j;
			indices[iPos][1] = (i + 1) * (subdivisionsHor + 1) +  j;
			indices[iPos][2] = (i + 1) * (subdivisionsHor + 1) + (j + 1);
			indices[iPos][3] =  i      * (subdivisionsHor + 1) + (j + 1);
		}
	}

	for(var i = 0; i <= subdivisionsVer; i++) {
		for(var j = 0; j <= subdivisionsHor; j++) {
			
			const angleHor = 2.0 * Math.PI * j / subdivisionsHor;
			const angleVer = Math.PI * (i / subdivisionsVer - 0.5);
			const radius   = Math.cos(angleVer);
			const vPos     = i * (subdivisionsHor + 1) + j;

			const x =  Math.sin(angleHor) * radius;
			const y =  Math.sin(angleVer);
			const z = -Math.cos(angleHor) * radius;

			positions[vPos][0] = x;
			positions[vPos][1] = y;
			positions[vPos][2] = z;

			if(!flat) {
				normals[vPos][0] = x;
				normals[vPos][1] = y;
				normals[vPos][2] = z;
			}

			texCoords[vPos][0] = 2 * j / subdivisionsHor;
			texCoords[vPos][1] =     i / subdivisionsVer;
		}
	}
	
	if(flat) mb.computeNormals(true, true);
	
	mb.cullFacing = true;
	
	return mb;
}

ae.mesh.createUVSphereEx = function createUVSphereEx(
		subdivisionsHor: number,
		subdivisionsVer: number,
		flat:            boolean = false,
		rxOrRadius:      number  = 1,
		ry:             ?number  = null,
		rz:             ?number  = null) {
	
	return ae.mesh.createUVSphere(subdivisionsHor, flat, subdivisionsVer).
		transformPositions(new ae.math.Matrix4D().
			scale(rxOrRadius, ry || rxOrRadius, rz || rxOrRadius));
}
*/
ae.mesh.Mesh = class Mesh {
	
	//private static final float[] DEFAULT_NORMAL   = {0, 0, 0};
	//private static final float[] DEFAULT_TEXCOORD = {0, 0};

	//private final int _vbo;
	//private final int _ibo;
	//private final int _iboType;
	//private final int _vao;
	
	                      
	                      
	                                              
	                       
	                       
	                       
	
	// If the bounding box vertices are transformed as well,
	// the bounding box stays valid.
	//public readonly Rect3D BoundingBox = new Rect3D();
	/*
	private final int initIbo(
			final int[][] indices) {

		int iboType;
		int bufferPos = 0;

		glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, _ibo);

		// Determine the best format for the indeces

		if(vertexCount < 256) {
			iboType = GL_UNSIGNED_BYTE;
		} else if(vertexCount < 65536) {
			iboType = GL_UNSIGNED_SHORT;
		} else {
			iboType = GL_UNSIGNED_INT;
		}
		
		// Copy index data to ibo in the best format

		switch(iboType) {

			case GL_UNSIGNED_BYTE:
				
				final ByteBuffer iboData8 =
					ByteBuffer.allocateDirect(indexCount);
				
				for(int[] i : indices)
					for(int j : i) iboData8.put((byte)j);
				
				glBufferData(
					GL_ELEMENT_ARRAY_BUFFER,
					(ByteBuffer)iboData8.rewind(),
					GL_STATIC_DRAW);
				break;

			case GL_UNSIGNED_SHORT:

				final short[] iboData16 = new short[indexCount];

				for(int[] i : indices)
					for(int j : i) iboData16[bufferPos++] = (short)j;
				
				glBufferData(
					GL_ELEMENT_ARRAY_BUFFER, iboData16, GL_STATIC_DRAW);
				break;

			case GL_UNSIGNED_INT:
				
				final int[] iboData32 = new int[indexCount];

				for(int[] i : indices)
					for(int j : i) iboData32[bufferPos++] = j;
				
				glBufferData(
					GL_ELEMENT_ARRAY_BUFFER, iboData32, GL_STATIC_DRAW);
				break;
		}

		return iboType;
	}

	private final void initVbo(
			final float[][] positions,
			final float[][] normals,
			final float[][] texCoords) {

		final float[] vboData = new float[8 * vertexCount];
		
		// Die Daten "interleaved" in den Puffer kopieren
		for(int i = 0; i < vertexCount; i++) {
			
			System.arraycopy(positions[i], 0, vboData, i * 8, 3);
			
			System.arraycopy(
				normals   != null ? normals[i]   : DEFAULT_NORMAL,   0,
				vboData, i * 8 + 3, 3);
			
			System.arraycopy(
				texCoords != null ? texCoords[i] : DEFAULT_TEXCOORD, 0,
				vboData, i * 8 + 6, 2);
		}
		
		// Das VBO initialisieren
		glBindBuffer(GL_ARRAY_BUFFER, _vbo);
		glBufferData(GL_ARRAY_BUFFER, vboData, GL_STATIC_DRAW);
	}

	private final void setVertexAttributes() {
		
		final int vertexSize = (3 + 3 + 2) * AbstractEngine.SIZE_FLOAT;
		
		// Positions
		glEnableVertexAttribArray(0);
		glVertexAttribPointer(
			0, 3, GL_FLOAT, false, vertexSize, 0);
		
		// Normals
		glEnableVertexAttribArray(1);
		glVertexAttribPointer(
			1, 3, GL_FLOAT, false, vertexSize, 3 * AbstractEngine.SIZE_FLOAT);

		// Tex-coords
		glEnableVertexAttribArray(2);
		glVertexAttribPointer(
			2, 2, GL_FLOAT, false, vertexSize, 6 * AbstractEngine.SIZE_FLOAT);
	}
	*/
	constructor(
			indices                           ,
			positions                         ,
			normals                           ,
			texCoords                         ,
			autoNormals          ,
			cullFacing           ) {
		
		//_vbo = glGenBuffers();
		//_ibo = glGenBuffers();
		//_vao = glGenVertexArrays();
		
		this.primitiveType =
			ae.mesh.PrimitiveTypeEnumClass.fromPrimitiveSize(indices[0].length);
		this.vertexCount   = positions.length;
		this.indexCount    = indices.length * this.primitiveType.size;
		this.autoNormals   = autoNormals;
		this.textured      = texCoords != null;
		this.cullFacing    = cullFacing;
		
		// Init the vao
		//glBindVertexArray(_vao);
		
		// Fill the vbo
		//initVbo(positions, normals, texCoords);
		//setVertexAttributes();
		
		// Fill the ibo
		//_iboType = initIbo(indices);
		
		// Unbind all buffers to prevent them from changes
		//glBindVertexArray(0);
		//glBindBuffer(GL_ARRAY_BUFFER, 0);
		//glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, 0);
		
		// Assign Bounding Box
		//mesh.ComputeBoundingBox(BoundingBox);
	}
	/*
	public final void draw() {
		
		glBindVertexArray(_vao);
		glDrawElements(primitiveType._glMode, indexCount, _iboType, 0);
	}
	
	public final void finalize() {

		glDeleteBuffers(_vbo);
		glDeleteBuffers(_ibo);
		glDeleteVertexArrays(_vao);
	}
	*/
}

ae.mesh.MeshBuilder = class MeshBuilder {
	
	// The mesh is cached to be reused
	                                                   
	
	// Mesh data
	                                            
	                                              
	                                            
	                                              
	
	// Information data lists are used
	                          
	                          
	
	// Auxiliary vectors
	                         
	                         
	                         
	
	// Public meta information
	                    
	
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
	_ensureConsistentSmoothingGroups(adjacency                   )          {
		
		const smoothingGroups = Array(this._vertices.length);
		const auxArray        = Array(adjacency._maxAdjacencyCount);
		const vIndexMap       = Array(this._vertices.length);
		const oldVertices     = this._vertices;
		
		let newVertexCount = 0;
		
		for(let i = 0; i < this._vertices.length; i++) {
			smoothingGroups[i] = this._vertices[i]._collectSmoothingGroups(
				this, adjacency._data[i], auxArray);
			vIndexMap[i]       = newVertexCount;
			newVertexCount    += smoothingGroups[i].length;
		}
		
		// Abort if each vertex belongs to exactly one smoothing group
		if(newVertexCount == this._vertices.length) return true;
		
		this.allocateVertices(newVertexCount);
		
		// Copy the old vertices into the new array
		// (as often as it has smoothing groups)
		for(let i = 0; i < oldVertices.length; i++)
			for(let j = 0; j < smoothingGroups[i].length; j++)
				this._vertices[vIndexMap[i] + j]._assign(oldVertices[i]);
		
		// Map the vertex indices to the new created vertices
		this._mapVIndices((triangle, vIndex) =>
			vIndexMap[vIndex] +
			ae.mesh.MeshBuilder._getValuePos(
				smoothingGroups[vIndex], triangle._smoothingGroup));
		
		return false;
	}
	
	static _getValuePos(
			array               ,
			value        )         {
		
		for(let i = 0; i < array.length; i++) if(array[i] == value) return i;
		return -1;
	}
	
	_invalidateMesh()                      {
		this._lastValidMesh.invalidate();
		return this;
	}
	
	_mapVIndices(
			mapper                                                        ) {
		
		this.forEachTriangle((triangle, index) => {
			triangle._vIndices[0] = mapper(triangle, triangle._vIndices[0]);
			triangle._vIndices[1] = mapper(triangle, triangle._vIndices[1]);
			triangle._vIndices[2] = mapper(triangle, triangle._vIndices[2]);
		});
	}
	
	constructor() {
		//this._lastValidMesh = 
		this._dynVertices     = new ae.util.List();
		this._dynTriangles    = new ae.util.List();
		this._vertices        = [];
		this._triangles       = [];
		this._verticesSealed  = false;
		this._trianglesSealed = false;
		this._auxP            = ae.math.Vector3D.createStaticA();
		this._auxV1           = ae.math.Vector3D.createStaticA();
		this._auxV2           = ae.math.Vector3D.createStaticA();
		this.cullFacing       = true;
	}
	
	get mesh()               {return this._lastValidMesh.object};
	
	get triangleCount()         {
		return (this._triangles ? this._triangles : this._dynTriangles).length;
	};
	
	get vertexCount()         {
		return (this._vertices ? this._vertices : this._dynVertices).length;
	}
	
	activeCullFaceSupport()                      {
		this.cullFacing = true;
		return this;
	}
	
	addPolygon(
			smoothingGroup        ,
			... vIndices                 )                      {
		
		this._assertTrianglesNotSealed();
		
		for(let i = 2; i < vIndices.length; i++)
			this._dynTriangles.add(new ae.mesh.Triangle().
				setIndicesB      (vIndices[0], vIndices[i - 1], vIndices[i]).
				setSmoothingGroup(smoothingGroup));
		
		return this._invalidateMesh();
	}
	
	addVertex(vertex                )                      {
		
		this._assertVerticesNotSealed();
		
		this._dynVertices.add(vertex);
		return this._invalidateMesh();
	}

	allocateTriangles(triangleCount        )                      {
		
		this._triangles = Array(triangleCount);
		
		for(let i = 0; i < triangleCount; i++)
			this._triangles[i] = new ae.mesh.Triangle();
		
		return this._invalidateMesh();
	}
	
	allocateVertices(vertexCount        )                      {
		
		this._vertices = Array(vertexCount);
		
		for(let i = 0; i < vertexCount; i++)
			this._vertices[i] = new ae.mesh.Vertex();
		
		return this._invalidateMesh();
	}
	
	collapseSmoothingGroups()                      {
		
		const sgMap                          = {};
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
	
	computeNormals()                      {
		
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
		
		for(let i = 0; i < this._triangles.length; i++) {
			this._triangles[i]._computeNormal(this, flatNormals   [i]);
			this._triangles[i]._computeAngles(this, triangleAngles[i]);
		}
		
		for(let i = 0; i < this._vertices.length; i++) {
			
			const vertex       = this._vertices[i];
			const curAdjacency = adjacency._data[i];
			
			for(let j = 0; j < curAdjacency.length; j++)
				vertexAngles[j] = triangleAngles
					[curAdjacency[j]]
					[ae.mesh.MeshBuilder._getValuePos(
						this._triangles[curAdjacency[j]]._vIndices, i)];
			
			vertex._computeSmoothNormal(
				this, flatNormals, curAdjacency, vertexAngles);
		}
		
		return this._invalidateMesh();
	}

	createDefaultTriangles()                      {
		
		this.allocateTriangles(Math.floor(this._vertices.length / 3));
		
		for(let i = 0; i < this._triangles.length; i++) {
			const vIndices = this._triangles[i]._vIndices;
			for(let j = 0; j < 3; j++) vIndices[j] = i * 3 + j;
		}
		
		return this._invalidateMesh();
	}
	
	fillTriangleData(filler                                  ) 
                      {
		
		this._assertTrianglesSealed();
		for(let i = 0; i < this._triangles.length; i++)
			filler(this._triangles[i], i);
		
		return this._invalidateMesh();
	}
	
	fillVertexData(filler                                ) 
                      {
		
		this._assertVerticesSealed();
		for(let i = 0; i < this._vertices.length; i++)
			filler(this._vertices[i], i);
		
		return this._invalidateMesh();
	}
	
	forEachVertex(visitor                         )                      {
		
		const vertexCount = this.vertexCount;
		
		if(this._vertices) {
			for(let i = 0; i < vertexCount; i++)
				visitor(this._vertices[i]);
		} else {
			for(let i = 0; i < vertexCount; i++)
				visitor(this._dynVertices.get(i));
		}
		
		return this._invalidateMesh();
	}
	
	forEachTriangle(visitor                           )                      {
		
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
	
	getTriangle(tIndex        )                   {
		this._assertTrianglesSealed();
		return this._triangles[tIndex];
	}
	
	getVertex(vIndex        )                 {
		this._assertVerticesSealed();
		return this._vertices[vIndex];
	}
	
	invertFaceOrientation()                      {
		
		// Swap index order of each triangle
		this.forEachTriangle((triangle) => {
			const temp            = triangle._vIndices[1];
			triangle._vIndices[1] = triangle._vIndices[2];
			triangle._vIndices[2] = temp;
		});
		
		return this._invalidateMesh();
	}
	
	invertNormals()                      {
		
		this.forEachVertex((vertex) => {
			for(let i = 0; i < 3; i++) vertex._normal[i] *= -1;
		});
		
		return this._invalidateMesh();
	}
	
	makeFlat()                      {
		
		let curSGroup = 0;
		
		this.forEachTriangle(
			(triangle) => triangle._smoothingGroup = curSGroup++);
		
		return this._invalidateMesh();
	}
	
	makeSmooth()                      {
		this.forEachTriangle((triangle) => triangle._smoothingGroup = 0);
		return this._invalidateMesh();
	}
	
	static merge(... meshes                            )                      {

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

	seal()                      {
		return this.sealVertices().sealTriangles();
	}
	
	sealTriangles()                      {
		
		if(this._triangles) return this;
    	
		if(this._dynTriangles.empty) {
			this.createDefaultTriangles();
		} else {
			this._triangles = this._dynTriangles.array;
			this._dynTriangles.clear();
		}
		
		return this._invalidateMesh();
	}
	
	sealVertices()                      {
		
		if(this._vertices) return this;
		
    	this._vertices = this._dynVertices.array;
    	this._dynVertices.clear();
    	
    	return this._invalidateMesh();
	}

	setPolygon(
			startIndex            ,
			smoothingGroup        ,
			... vIndices                 )                      {
		
		this._assertTrianglesSealed();
		
		for(let i = 2; i < vIndices.length; i++)
			this._triangles[startIndex + i - 2].
				setIndicesB      (vIndices[0], vIndices[i - 1], vIndices[i]).
				setSmoothingGroup(smoothingGroup);
		
		return this._invalidateMesh();
	}
	
	spliceUnusedVertices()                      {

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
			if(indexMap[vIndex] == -1) indexMap[vIndex] = curMappedIndex++;
			return vIndex;
		});
		
		// Abort if all vertices are used
		if(curMappedIndex == this._vertices.length) return this;
		
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
	
	transformPositions(transform                  )                      {
		
		this.forEachVertex((vertex) => {
			transform.applyToPointC    (vertex._position);
			transform.applyToDirVectorB(vertex._normal);
    		transform.applyToDirVectorB(vertex._uTangent);
    		transform.applyToDirVectorB(vertex._vTangent);
		});
		
		return this._invalidateMesh();
	}

	transformTexCoords(transform                  )                      {
		this.forEachVertex(
			(vertex) => transform.applyToPointC(vertex._texCoord));
		return this._invalidateMesh();
	}
};

ae.mesh.PrimitiveTypeEnumClass = class PrimitiveTypeEnumClass {
	
	               
	               
	
	constructor(
			glMode        ,
			size          ) {
		
		this.glMode = glMode;
		this.size   = size;
		
		Object.freeze(this);
	}
	
	static fromPrimitiveSize(size        )                                 {
		
		switch(size) {
			case 3: return ae.mesh.PrimitiveType.TRIANGLE;
			case 4: return ae.mesh.PrimitiveType.QUAD;
		}
		
		throw "Size doesn't match a primitive type";
	}
};

ae.mesh.PrimitiveType = {
	TRIANGLE : new ae.mesh.PrimitiveTypeEnumClass(0, 3),
	QUAD     : new ae.mesh.PrimitiveTypeEnumClass(0, 4)
};

Object.freeze(ae.mesh.PrimitiveType);

ae.mesh.Triangle = class Triangle {
	
	                        
	                               
	
	_assign(t                  ) {
		this.setIndicesA      (t._vIndices);
		this.setSmoothingGroup(t._smoothingGroup);
	}
	
	_assignAuxVectors(
			mb                     ,
			p0        ,
			p1        ,
			p2        ) {
		
		mb._auxP .setDataC(mb._vertices[this._vIndices[p0]]._position);
		mb._auxV1.setDataC(mb._vertices[this._vIndices[p1]]._position).subB(mb._auxP);
		mb._auxV2.setDataC(mb._vertices[this._vIndices[p2]]._position).subB(mb._auxP);
	}
	
	// Computes the angle of the vectors p0p1 and p0p2 in radians
	_computeAngle(
			mb                     ,
			p0        ,
			p1        ,
			p2        )         {
		
		this._assignAuxVectors(mb, p0, p1, p2);
		return ae.math.Vector3D.angleRad(mb._auxV1, mb._auxV2);
	}
	
	_computeAngles(
			mb                      ,
			dst               ) {
		
		dst[0] = this._computeAngle(mb, 0, 1, 2);
		dst[1] = this._computeAngle(mb, 1, 2, 0);
		dst[2] = this._computeAngle(mb, 2, 0, 1);
	}
	
	_computeNormal(
			mb                      ,
			dst               ) {
		
		this._assignAuxVectors(mb, 0, 1, 2);
		ae.math.Vector3D.cross(mb._auxV1, mb._auxV2, mb._auxP).normalize().getDataC(dst);
	}
	
	constructor() {
		this._smoothingGroup = 0;
		this._vIndices       = [0, 0, 0];
	}
	
	setIndicesA(
			src                  ,
			offset         = 0)                   {
		
		this._vIndices[0] = src[offset + 0];
		this._vIndices[1] = src[offset + 1];
		this._vIndices[2] = src[offset + 2];
		
		return this;
	}
	
	setIndicesB(
			v1        ,
			v2        ,
			v3        )                   {
		
		this._vIndices[0] = v1;
		this._vIndices[1] = v2;
		this._vIndices[2] = v3;
		
		return this;
	}
	
	setSmoothingGroup(smoothingGroup        )                   {
		this._smoothingGroup = smoothingGroup;
		return this;
	}
}
ae.mesh.Vertex = class Vertex {

	                         
	                         
	                         
	                         
	                         
	
	_addSmoothingGroup(
			auxArray                     ,
			sgCount               ,
			smoothingGroup        )         {
		
		for(var i = 0; i < sgCount; i++)
			if(auxArray[i] == smoothingGroup) return sgCount;
		
		auxArray[sgCount] = smoothingGroup;
		
		return sgCount + 1;
	}
	
	_assign(v                ) {
		this.setPositionA(v._position);
		this.setNormalA  (v._normal);
		this.setUTangentA(v._uTangent);
		this.setVTangentA(v._vTangent);
		this.setTexCoordA(v._texCoord);
	}
	
	_collectSmoothingGroups(
			mb                            ,
			adjacency               ,
			auxArray                )                {
		
		var sgCount = 0;
		
		for(var i = 0; i < adjacency.length; i++)
			sgCount = this._addSmoothingGroup(
				auxArray, sgCount, mb._triangles[adjacency[i]]._smoothingGroup);
		
		return auxArray.slice(0, sgCount);
	}
	
	_computeSmoothNormal(
			mb                                     ,
			flatNormals                             ,
			adjacencyTriangles               ,
			adjacencyAngles                  ) {
		
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
			src                  ,
			offset         = 0)                 {
		
		this._normal[0] = src[offset + 0];
		this._normal[1] = src[offset + 1];
		this._normal[2] = src[offset + 2];
		
		return this;
	}
	
	setNormalB(
			nx        ,
			ny        ,
			nz        )                 {
		
		this._normal[0] = nx;
		this._normal[1] = ny;
		this._normal[2] = nz;
		
		return this;
	}
	
	setPositionA(
			src                  ,
			offset         = 0)                 {
		
		return this.setPositionB(
			src[offset + 0], src[offset + 1], src[offset + 2]);
	}
	
	setPositionB(
			x        ,
			y        ,
			z        )                 {
		
		this._position[0] = x;
		this._position[1] = y;
		this._position[2] = z;
		
		return this;
	}
	
	setTexCoordA(
			src                  ,
			offset         = 0)                 {
		
		return this.setTexCoordB(src[offset + 0], src[offset + 1]);
	}
	
	setTexCoordB(
			s        ,
			t        )                 {
		
		this._texCoord[0] = s;
		this._texCoord[1] = t;
		
		return this;
	}
	
	setUTangentA(
			src                  ,
			offset         = 0)                 {
		
		return this.setUTangentB(
			src[offset + 0], src[offset + 1], src[offset + 2]);
	}
	
	setUTangentB(
			ux        ,
			uy        ,
			uz        )                 {
		
		this._uTangent[0] = ux;
		this._uTangent[1] = uy;
		this._uTangent[2] = uz;
		
		return this;
	}
	
	setVTangentA(
			src                  ,
			offset         = 0)                 {
		
		return this.setVTangentB(
			src[offset + 0], src[offset + 1], src[offset + 2]);
	}
	
	setVTangentB(
			vx        ,
			vy        ,
			vz        )                 {
		
		this._vTangent[0] = vx;
		this._vTangent[1] = vy;
		this._vTangent[2] = vz;
		
		return this;
	}
}
ae.util.CachedObject = class CachedObject    {
	
	             
	                  
	                         
	
	constructor(
			object     ,
			updater                ) {
		
		this._object  = object;
		this._valid   = false;
		this._updater = updater;
	}
	
	get object()    {
		
		if(!this._valid || !this._object) {
			
			const newObject = this._updater(this._object);
			
			this._object = newObject;
			this._valid  = true;
			
			return newObject;
			
		} else {
			
			return this._object;
		}
	}
	
	invalidate()       {
		
		this._valid = false;
	}
};

ae.util.assert = function assert(
		cond         ,
		msg           = null) {
	
	if(!cond) throw "Assertion failed" + (msg ? ": " + msg : "");
}

ae.util.assertNotNull = function assertNotNull   (
		obj    ,
		msg          = null)    {
	
	if(obj) {
		return obj;
	} else {
		throw "Assertion failed: " + (msg ? msg : "Object is null");
	}
};

ae.util.assertNull = function assertNotNull(
		obj     ,
		msg          = null) {
	
	if(obj) throw "Assertion failed: " + (msg ? msg : "Object is not null");
};

ae.util.checkArrayCopyConsistency = function checkArrayCopyConsistency(
		src                  ,
		srcOffset        ,
		dst                  ,
		dstOffset        ,
		length           )          {
	
	if(length === 0) return false;
	
	if(srcOffset + length >= src.length) throw "Range exceeds source array";
	if(dstOffset + length >= dst.length)
		throw "Range exceeds destination array";
	
	return true;
};

ae.util.cloneArray1D = function cloneArray1D   (array          )           {
	
	return array.slice(0);
}

ae.util.cloneArray2D = function cloneArray2D   (
		array                 )                  {
	
	const newArray = array.slice(0);
	
	for(var i = 0; i < array.length; i++)
		newArray[i] = ae.util.cloneArray1D(array[i]);
	
	return array.slice(0);
}

ae.util.cloneArray3D = function cloneArray3D   (
		array                        )                         {
	
	const newArray = array.slice(0);
	
	for(var i = 0; i < array.length; i++)
		newArray[i] = ae.util.cloneArray2D(array[i]);
	
	return array.slice(0);
}

ae.util.copy1DimArray = function copy1DimArray   (
		src                ,
		srcOffset        ,
		dst                ,
		dstOffset        ,
		length           )           {
	
	if(!ae.util.checkArrayCopyConsistency(
		src, srcOffset, dst, dstOffset, length)) return dst;
	
	for(var i = 0; i < length; i++) dst[dstOffset + i] = src[srcOffset + i];
	
	return dst;
};

ae.util.copy2DimArray = function copy2DimArray   (
		src                       ,
		srcOffset        ,
		dst                       ,
		dstOffset        ,
		length           )                  {
	
	if(!ae.util.checkArrayCopyConsistency(
		src, srcOffset, dst, dstOffset, length)) return dst;
	
	for(var i = 0; i < length; i++) {
		
		const subSrc = src[srcOffset + i];
		const subDst = dst[dstOffset + i];
		
		if(subSrc.length != subDst.length)
			throw "Sub arrays of different length";
		
		ae.util.copy1DimArray(subSrc, 0, subDst, 0, subSrc.length);
	}
	
	return dst;
};

ae.util.create2DimArray = function create2DimArray   (
		dimSize1        ,
		dimSize2        )                  {
	
	const array = Array(dimSize1);
	
	for(let i = 0; i < dimSize1; i++) array[i] = Array(dimSize2);
	return array;
};

ae.util.create3DimArray = function create3DimArray   (
		dimSize1        ,
		dimSize2        ,
		dimSize3        )                         {
	
	const array = Array(dimSize1);
	
	for(let i = 0; i < dimSize1; i++)
		array[i] = ae.util.create2DimArray(dimSize2, dimSize3);
	
	return array;
};

ae.util.create2DimBooleanArray = function create2DimBooleanArray(
		dimSize1        ,
		dimSize2        )                        {
	
	const array = Array(dimSize1);
	
	for(var i = 0; i < dimSize2; i++) array[i] = Array(dimSize2);
	
	return array;
};

ae.util.create2DimNumberArray = function create2DimNumberArray(
		dimSize1        ,
		dimSize2        )                       {
	
	const array = Array(dimSize1);
	
	for(var i = 0; i < dimSize2; i++) array[i] = Array(dimSize2);
	
	return array;
};

ae.util.create3DimBooleanArray = function create3DimBooleanArray(
		dimSize1        ,
		dimSize2        ,
		dimSize3        )                               {
	
	const array = Array(dimSize1);
	
	for(var i = 0; i < dimSize2; i++)
		array[i] = ae.util.create2DimBooleanArray(dimSize2, dimSize3);
	
	return array;
};

ae.util.create3DimNumberArray = function create3DimNumberArray(
		dimSize1        ,
		dimSize2        ,
		dimSize3        )                              {
	
	const array = Array(dimSize1);
	
	for(var i = 0; i < dimSize2; i++)
		array[i] = ae.util.create2DimNumberArray(dimSize2, dimSize3);
	
	return array;
};

ae.util.List = class List    {
	
	                             
	                 
	
	_isInRange(index        )          {
		return index >= 0 && index < this._length;
	}
	
	constructor() {
		this._backend = {};
		this._length  = 0;
	}
	
	get array()           {
		
		const array = Array(this._length);
		
		for(var i = 0; i < this._length; i++) array[i] = this._backend[i];
		return array;
	}
	
	get empty ()          {return !this._length};
	get length()          {return  this._length};
	
	add(value   ) {
		this._backend[this._length] = value;
		this._length++;
	}
	
	clear() {
		// TODO
	}
	
	get(index        )    {
		if(this._isInRange(index)) throw "Index out of range";
		return this._backend[index];
	}
	
	set(
		index        ,
		value   ) {
		
		if(this._isInRange(index)) this._backend[index] = value;
	}
}

// Unit vectors defined as 3D vectors
ae.math.X_POS = ae.math.Vector3D.createConstB( 1,  0,  0);
ae.math.X_NEG = ae.math.Vector3D.createConstB(-1,  0,  0);
ae.math.Y_POS = ae.math.Vector3D.createConstB( 0,  1,  0);
ae.math.Y_NEG = ae.math.Vector3D.createConstB( 0, -1,  0);
ae.math.Z_POS = ae.math.Vector3D.createConstB( 0,  0,  1);
ae.math.Z_NEG = ae.math.Vector3D.createConstB( 0,  0, -1);

// Colors defined as 4D vectors
ae.math.BLACK  = ae.math.Vector4D.createConstB(0,    1);
ae.math.GREY   = ae.math.Vector4D.createConstB(0.5,  1);
ae.math.WHITE  = ae.math.Vector4D.createConstB(1,    1);
ae.math.RED    = ae.math.Vector4D.createConstC(1, 0, 0, 1);
ae.math.GREEN  = ae.math.Vector4D.createConstC(0, 1, 0, 1);
ae.math.BLUE   = ae.math.Vector4D.createConstC(0, 0, 1, 1);
ae.math.YELLOW = ae.math.Vector4D.createConstC(1, 1, 0, 1);
ae.math.PURPLE = ae.math.Vector4D.createConstC(1, 0, 1, 1);
ae.math.CYAN   = ae.math.Vector4D.createConstC(0, 1, 1, 1);

// Freeze all namespaces
Object.freeze(ae.core);
Object.freeze(ae.math);
Object.freeze(ae.mesh);
Object.freeze(ae.util);
Object.freeze(ae);
