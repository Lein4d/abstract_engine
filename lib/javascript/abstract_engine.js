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
		this._temp          = Array(16);
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
	
	applyToDirVector(
			v                                       ,
			offset         = 0)                                   {
		
		if(v instanceof ae.math.Vector3D) {
			
			v.getData(this._temp);
			this.applyToDirVector();
			v.setData(this._temp);
			
		} else {
			
			const nmData = this._nmDataCached.object;
			
			// Copy vector at temp array starting at position 3
			for(var i = 0; i < 3; i++) this._temp[3 + i] = v[offset + i];
			
			v[offset + 0] =
				nmData[ae.I_NM11] * this._temp[3] +
				nmData[ae.I_NM12] * this._temp[4] +
				nmData[ae.I_NM13] * this._temp[5];
			v[offset + 1] =
				nmData[ae.I_NM21] * this._temp[3] +
				nmData[ae.I_NM22] * this._temp[4] +
				nmData[ae.I_NM23] * this._temp[5];
			v[offset + 2] =
				nmData[ae.I_NM31] * this._temp[3] +
				nmData[ae.I_NM32] * this._temp[4] +
				nmData[ae.I_NM33] * this._temp[5];
		}
		
		return v;
	}
	
	applyToPoint(
			p                                                           ,
			offset            = 0,
			dimension         = 3) 
                                                     {
		
		if(p instanceof ae.math.Vector4D) {
			
			p.getData(this._temp);
			this.applyToPoint(this._temp, 0, 4);
			p.setData(this._temp);
			
		} else if(p instanceof ae.math.vector3D) {
			
			p.getData(this._temp);
			this.applyToPoint(this._temp, 0, 3);
			p.setData(this._temp);
			
		} else {
			
			const x = dimension >= 1 ? p[offset + 0] : 0;
			const y = dimension >= 2 ? p[offset + 1] : 0;
			const z = dimension >= 3 ? p[offset + 2] : 0;
			const w = dimension >= 4 ? p[offset + 3] : 1;
			
			if(dimension >= 1)
				p[offset + 0] =
					this.m11 * x + this.m12 * y +
					this.m13 * z + this.m14 * w;
			
			if(dimension >= 2)
				p[offset + 1] =
					this.m21 * x + this.m22 * y +
					this.m23 * z + this.m24 * w;
			
			if(dimension >= 3)
				p[offset + 2] =
					this.m31 * x + this.m32 * y +
					this.m33 * z + this.m34 * w;
			
			if(dimension >= 4)
				p[offset + 3] =
					this.m41 * x + this.m42 * y +
					this.m43 * z + this.m44 * w;
		}
		
		return p;
	}
	
	getColumn(
			cIndex        ,
			dst                    = null,
			offset                 = 0)                                   {
		
		if(dst) {
		
			for(var i = 0; i < 4; i++)
				dst[offset + i] = this._data[cIndex * 4 + i];
			
			return dst;
			
		} else {
			
			return this._getColumnVector(cIndex);
		}
	}
	
	getData(
			dst                                     ,
			offset         = 0)                                   {
		
		if(dst instanceof Matrix4D) {
			
			dst.setData(this);
			
		} else {
		
			for(var i = 0; i < 16; i++)
				dst[offset + i] = this._data[i];
		}
		
		return dst;
	}
	
	getElement(
			rIndex         ,
			cIndex         )         {
		
		return this._data[cIndex * 4 + rIndex];
	}
	
	getNmData(
			dst                  ,
			offset         = 0) {
		
		const nmData = this._nmDataCached.object;
		
		for(var i = 0; i < 9; i++) dst[offset + i] = nmData[i];
		
		return dst;
	}
	
	getRow(
			rIndex        ,
			dst                    = null,
			offset                 = 0)                                   {
		
		if(dst) {
			
			for(var i = 0; i < 4; i++)
				dst[offset + i] = this._data[i * 4 + rIndex];
			
			return dst
			
		} else {
			
			return this._getRowVector(rIndex);
		}
	}
	
	multWithMatrix(m                  )                   {
		
		// this = this * m;

		this.getData(this._temp);
		
		// Row 1
		this.m11 =
			this._temp[ 0] * m.m11 + this._temp[ 4] * m.m21 +
			this._temp[ 8] * m.m31 + this._temp[12] * m.m41;
		this.m12 =
			this._temp[ 0] * m.m12 + this._temp[ 4] * m.m22 +
			this._temp[ 8] * m.m32 + this._temp[12] * m.m42;
		this.m13 =
			this._temp[ 0] * m.m13 + this._temp[ 4] * m.m23 +
			this._temp[ 8] * m.m33 + this._temp[12] * m.m43;
		this.m14 =
			this._temp[ 0] * m.m14 + this._temp[ 4] * m.m24 +
			this._temp[ 8] * m.m34 + this._temp[12] * m.m44;
		
		// Row 2
		this.m21 =
			this._temp[ 1] * m.m11 + this._temp[ 5] * m.m21 +
			this._temp[ 9] * m.m31 + this._temp[13] * m.m41;
		this.m22 =
			this._temp[ 1] * m.m12 + this._temp[ 5] * m.m22 +
			this._temp[ 9] * m.m32 + this._temp[13] * m.m42;
		this.m23 =
			this._temp[ 1] * m.m13 + this._temp[ 5] * m.m23 +
			this._temp[ 9] * m.m33 + this._temp[13] * m.m43;
		this.m24 =
			this._temp[ 1] * m.m14 + this._temp[ 5] * m.m24 +
			this._temp[ 9] * m.m34 + this._temp[13] * m.m44;
		
		// Row 3
		this.m31 =
			this._temp[ 2] * m.m11 + this._temp[ 6] * m.m21 +
			this._temp[10] * m.m31 + this._temp[14] * m.m41;
		this.m32 =
			this._temp[ 2] * m.m12 + this._temp[ 6] * m.m22 +
			this._temp[10] * m.m32 + this._temp[14] * m.m42;
		this.m33 =
			this._temp[ 2] * m.m13 + this._temp[ 6] * m.m23 +
			this._temp[10] * m.m33 + this._temp[14] * m.m43;
		this.m34 =
			this._temp[ 2] * m.m14 + this._temp[ 6] * m.m24 +
			this._temp[10] * m.m34 + this._temp[14] * m.m44;
		
		// Row 4
		this.m41 =
			this._temp[ 3] * m.m11 + this._temp[ 7] * m.m21 +
			this._temp[11] * m.m31 + this._temp[15] * m.m41;
		this.m42 =
			this._temp[ 3] * m.m12 + this._temp[ 7] * m.m22 +
			this._temp[11] * m.m32 + this._temp[15] * m.m42;
		this.m43 =
			this._temp[ 3] * m.m13 + this._temp[ 7] * m.m23 +
			this._temp[11] * m.m33 + this._temp[15] * m.m43;
		this.m44 =
			this._temp[ 3] * m.m14 + this._temp[ 7] * m.m24 +
			this._temp[11] * m.m34 + this._temp[15] * m.m44;
		
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
		
		this.getColumn(2, this._temp);
		
		if(far < near) { // far-ClippingPlane at infinity (e=-1,f=-2*near)
		
			const f         = -2 * near;

			// Compute column 3 first -> less temp variables
			this.m13 = this.m11 * c + this.m12 * d - this._temp[0] - this.m14;
			this.m23 = this.m21 * c + this.m22 * d - this._temp[1] - this.m24;
			this.m33 = this.m31 * c + this.m32 * d - this._temp[2] - this.m34;
			this.m43 = this.m41 * c + this.m42 * d - this._temp[3] - this.m44;
			
			// Compute columns 1,2,4
			this.m11 *= a; this.m12 *= b; this.m14 = f * this._temp[0];
			this.m21 *= a; this.m22 *= b; this.m24 = f * this._temp[1];
			this.m31 *= a; this.m32 *= b; this.m34 = f * this._temp[2];
			this.m41 *= a; this.m42 *= b; this.m44 = f * this._temp[3];
			
		} else { // normal projection matrix
		
			const e         = (near - far) / (far - near);
			const f         = 2 * far * near / (near - far);
		
			// Compute column 3 first -> less temp variables
			this.m13 =
				this.m11 * c + this.m12 * d + e * this._temp[0] - this.m14;
			this.m23 =
				this.m21 * c + this.m22 * d + e * this._temp[1] - this.m24;
			this.m33 =
				this.m31 * c + this.m32 * d + e * this._temp[2] - this.m34;
			this.m43 =
				this.m41 * c + this.m42 * d + e * this._temp[3] - this.m44;
			
			// Compute columns 1,2,4
			this.m11 *= a; this.m12 *= b; this.m14 = f * this._temp[0];
			this.m21 *= a; this.m22 *= b; this.m24 = f * this._temp[1];
			this.m31 *= a; this.m32 *= b; this.m34 = f * this._temp[2];
			this.m41 *= a; this.m42 *= b; this.m44 = f * this._temp[3];
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
		this.getColumn(1, this._temp);
		
		// Compute column 2
		this.m12 = this._temp[0] * c + this.m13 * s;
		this.m22 = this._temp[1] * c + this.m23 * s;
		this.m32 = this._temp[2] * c + this.m33 * s;
		this.m42 = this._temp[3] * c + this.m43 * s;
		
		// Compute column 3
		this.m13 = this.m13 * c - this._temp[0] * s;
		this.m23 = this.m23 * c - this._temp[1] * s;
		this.m33 = this.m33 * c - this._temp[2] * s;
		this.m43 = this.m43 * c - this._temp[3] * s;
		
		return this;
	}

	rotateY(angle        )                   {

		const s         = Math.sin(angle * ae.RAD_FACTOR);
		const c         = Math.cos(angle * ae.RAD_FACTOR);
	
		// Copy column 1
		this.getColumn(0, this._temp);
		
		// Compute column 1
		this.m11 = this._temp[0] * c - this.m13 * s;
		this.m21 = this._temp[1] * c - this.m23 * s;
		this.m31 = this._temp[2] * c - this.m33 * s;
		this.m41 = this._temp[3] * c - this.m43 * s;
		
		// Compute column 3
		this.m13 = this._temp[0] * s + this.m13 * c;
		this.m23 = this._temp[1] * s + this.m23 * c;
		this.m33 = this._temp[2] * s + this.m33 * c;
		this.m43 = this._temp[3] * s + this.m43 * c;
		
		return this;
	}

	rotateZ(angle        )                   {

		const s         = Math.sin(angle * ae.RAD_FACTOR);
		const c         = Math.cos(angle * ae.RAD_FACTOR);
	
		// Copy column 1
		this.getColumn(0, this._temp);
		
		// Compute column 1
		this.m11 = this._temp[0] * c + this.m12 * s;
		this.m21 = this._temp[1] * c + this.m22 * s;
		this.m31 = this._temp[2] * c + this.m32 * s;
		this.m41 = this._temp[3] * c + this.m42 * s;
		
		// Compute column 2
		this.m12 = this.m12 * c - this._temp[0] * s;
		this.m22 = this.m22 * c - this._temp[1] * s;
		this.m32 = this.m32 * c - this._temp[2] * s;
		this.m42 = this.m42 * c - this._temp[3] * s;
		
		return this;
	}

	scale(
			x         ,
			y         ,
			z         )                   {
		
		y = y || x;
		z = z || x;
		
		this.m11 *= x; this.m12 *= y; this.m13 *= z;
		this.m21 *= x; this.m22 *= y; this.m23 *= z;
		this.m31 *= x; this.m32 *= y; this.m33 *= z;
		this.m41 *= x; this.m42 *= y; this.m43 *= z;
		
		return this;
	}
	
	setData(
			m11OrSrc                                            ,
    		m12OrOffset         = 0,
    		m13                 = 0,
    		m14                 = 0,
    		m21                 = 0,
    		m22                 = 0,
    		m23                 = 0,
    		m24                 = 0,
    		m31                 = 0,
    		m32                 = 0,
    		m33                 = 0,
    		m34                 = 0,
    		m41                 = 0,
    		m42                 = 0,
    		m43                 = 0,
    		m44                 = 0)                   {
		
		if(m11OrSrc instanceof Matrix4D) {
			
			this.setData(m11OrSrc._data);
			
		} else if(typeof(m11OrSrc) === "number") {
			
			this.m11 = m11OrSrc; this.m12 = m12OrOffset;
			this.m13 = m13; this.m14 = m14;
			
			this.m21 = m21; this.m22 = m22; this.m23 = m23; this.m24 = m24;
			this.m31 = m31; this.m32 = m32; this.m33 = m33; this.m34 = m34;
			this.m41 = m41; this.m42 = m42; this.m43 = m43; this.m44 = m44;
			
		} else {
			
			for(var i = 0; i < 16; i++)
				this._data[i] = m11OrSrc[m12OrOffset + i];
		}
		
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
		this.scale(0, 0);
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
		
		this.x = 0;
		this.y = 0;
		this.z = 0;
	}
	
	add(v                  )                   {
		
		this.backend.x += v.backend.x;
		this.backend.y += v.backend.y;
		this.backend.z += v.backend.z;
		
		return this;
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

	static createConst(
			xOrGrey         ,
			y               ,
			z               )                   {
		
		y = y || xOrGrey;
		z = z || xOrGrey;
		
		return new Vector3D(new ae.math.ReadOnlyBackend(
			new ae.math.StaticBackend(xOrGrey, y, z)));
	}

	static createStatic(
			xOrGrey         ,
			y               ,
			z               )                   {
		
		y = y || xOrGrey;
		z = z || xOrGrey;
		
		return new Vector3D(new ae.math.StaticBackend(xOrGrey, y, z));
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
	
	div(factor        )                   {
		
		this.backend.x /= factor;
		this.backend.y /= factor;
		this.backend.z /= factor;
		
		return this;
	}

	dot(v                  )         {
		
		return (
			this.backend.x * v.backend.x + this.backend.y * v.backend.y +
			this.backend.z * v.backend.z);
	}
	
	getData(
			dst                                                           ,
			offset         = 0) 
                                                          {
		
		if(dst instanceof Vector3D) {
			
			dst.setData(this.backend);
			
		} else if(dst instanceof ae.math.VectorBackend) {
			
			dst.x = this.backend.x;
			dst.y = this.backend.y;
			dst.z = this.backend.z;
			
		} else {
			
			dst[offset + 0] = this.backend.x;
			dst[offset + 1] = this.backend.y;
			dst[offset + 2] = this.backend.z;
		}
		
		return dst;
	}
	
	mult(factorOrV                           )                   {
		
		if(factorOrV instanceof Vector3D) {
			
			this.backend.x *= factorOrV.backend.x;
			this.backend.y *= factorOrV.backend.y;
			this.backend.z *= factorOrV.backend.z;
			
		} else {
			
			this.backend.x *= factorOrV;
			this.backend.y *= factorOrV;
			this.backend.z *= factorOrV;
		}
		
		return this;
	}
	
	setData(
			xOrSrc                                                               ,
			yOrOffset         = 0,
			z                 = 0)                   {
		
		if(xOrSrc instanceof Vector3D) {
			
			this.setData(this.backend);
			
		} else if(xOrSrc instanceof ae.math.VectorBackend) {
			
			this.backend.x = xOrSrc.x;
			this.backend.y = xOrSrc.y;
			this.backend.z = xOrSrc.z;
			
		} else if(typeof(xOrSrc) === "number") {
			
			this.backend.x = xOrSrc;
			this.backend.y = yOrOffset;
			this.backend.z = z;
			
		} else {
			
			this.backend.x = xOrSrc[yOrOffset + 0];
			this.backend.y = xOrSrc[yOrOffset + 1];
			this.backend.z = xOrSrc[yOrOffset + 2];
		}
		
		return this;
	}
	
	sub(v                  )                   {
		
		this.backend.x -= v.backend.x;
		this.backend.y -= v.backend.y;
		this.backend.z -= v.backend.z;
		
		return this;
	}
	
	toZeroVector()                   {
		
		return this.setData(0, 0, 0);
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
	
	add(v                  )                   {
		
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

	static createConst(
			xOrGrey         ,
			yOrW            ,
			z               ,
			w               )                   {
		
		w    = w    || yOrW || xOrGrey;
		z    = z    ||         xOrGrey;
		yOrW =         yOrW || xOrGrey;
		
		return new Vector4D(new ae.math.ReadOnlyBackend(
			new ae.math.StaticBackend(xOrGrey, yOrW, z, w)));
	}

	static createStatic(
			xOrGrey         ,
			yOrW            ,
			z               ,
			w               )                   {
		
		w    = w    || yOrW || xOrGrey;
		z    = z    ||         xOrGrey;
		yOrW =         yOrW || xOrGrey;
		
		return new Vector4D(new ae.math.StaticBackend(xOrGrey, yOrW, z, w));
	}
	
	div(factor        )                   {
		
		this.backend.x /= factor;
		this.backend.y /= factor;
		this.backend.z /= factor;
		this.backend.w /= factor;
		
		return this;
	}

	dot(v                  )         {
		
		return (
			this.backend.x * v.backend.x + this.backend.y * v.backend.y +
			this.backend.z * v.backend.z + this.backend.w * v.backend.w);
	}
	
	getData(
			dst                                                           ,
			offset         = 0) 
                                                          {
		
		if(dst instanceof Vector4D) {
			
			dst.setData(this.backend);
			
		} else if(dst instanceof ae.math.VectorBackend) {
			
			dst.x = this.backend.x;
			dst.y = this.backend.y;
			dst.z = this.backend.z;
			dst.w = this.backend.w;
			
		} else {
			
			dst[offset + 0] = this.backend.x;
			dst[offset + 1] = this.backend.y;
			dst[offset + 2] = this.backend.z;
			dst[offset + 3] = this.backend.w;
		}
		
		return dst;
	}
	
	mult(factorOrV                           )                   {
		
		if(factorOrV instanceof Vector4D) {
			
			this.backend.x *= factorOrV.backend.x;
			this.backend.y *= factorOrV.backend.y;
			this.backend.z *= factorOrV.backend.z;
			this.backend.w *= factorOrV.backend.w;
			
		} else {
			
			this.backend.x *= factorOrV;
			this.backend.y *= factorOrV;
			this.backend.z *= factorOrV;
			this.backend.w *= factorOrV;
		}
		
		return this;
	}
	
	setData(
			xOrSrc                                                               ,
			yOrOffset         = 0,
			z                 = 0,
			w                 = 0)                   {
		
		if(xOrSrc instanceof Vector4D) {
			
			this.setData(this.backend);
			
		} else if(xOrSrc instanceof ae.math.VectorBackend) {
			
			this.backend.x = xOrSrc.x;
			this.backend.y = xOrSrc.y;
			this.backend.z = xOrSrc.z;
			this.backend.w = xOrSrc.w;
			
		} else if(typeof(xOrSrc) === "number") {
			
			this.backend.x = xOrSrc;
			this.backend.y = yOrOffset;
			this.backend.z = z;
			this.backend.w = w;
			
		} else {
			
			this.backend.x = xOrSrc[yOrOffset + 0];
			this.backend.y = xOrSrc[yOrOffset + 1];
			this.backend.z = xOrSrc[yOrOffset + 2];
			this.backend.w = xOrSrc[yOrOffset + 3];
		}
		
		return this;
	}
	
	sub(v                  )                   {
		
		this.backend.x -= v.backend.x;
		this.backend.y -= v.backend.y;
		this.backend.z -= v.backend.z;
		this.backend.w -= v.backend.w;
		
		return this;
	}
	
	toZeroPoint()                   {
		
		return this.setData(0, 0, 0, 1);
	}
	
	toZeroVector()                   {
		
		return this.setData(0, 0, 0, 0);
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

ae.mesh._computeCylinderShellData = function _computeCylinderShellData(
		subdivisions        ,
		iOffset             ,
		vOffset             ,
		indices                           ,
		positions                         ,
		normals                           ,
		texCoords                         )       {
	
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
		subdivisions        ,
		posY1               ,
		posY2               ,
		iOffset             ,
		vOffset             ,
		indices                           ,
		positions                         ,
		normals                           ,
		texCoords                         )       {
	
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
		subdivisions        ,
		iOffset             ,
		vOffset             ,
		wrapIndices          ,
		invert               ,
		indices                           )       {

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
		subdivisions        ,
		posY                ,
		vOffset             ,
		wrapIndices          ,
		positions                         ,
		normals                           ,
		texCoords                         )       {
	
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
		subdivisions        )         {
	
	return Math.ceil((subdivisions - 2.0) / 2.0);
}

ae.mesh.createCube = function createCube()                      {
	
	const mb = new ae.mesh.MeshBuilder();
	
	mb.positions     = ae.util.cloneArray2D(ae.mesh._CUBE_POSITIONS);
	mb.texCoords     = ae.util.cloneArray2D(ae.mesh._CUBE_TEXCOORDS);
	mb.primitiveType = ae.mesh.PrimitiveType.QUAD;
	mb.cullFacing    = true;
	
	mb.computeNormals(true, true);
	
	return mb;
}

ae.mesh.createCubeEx = function createCubeEx(
		centered             = true,
		widthOrSize          = 1,
		height               = null,
		length               = null)                      {
	
	const t = centered ? -0.5 : 0;
	
	return ae.mesh.createCube().transformPositions(new ae.math.Matrix4D().
		scale(widthOrSize, height || widthOrSize, length || widthOrSize).
		translate(t, t, t));
}

ae.mesh.createCylinder = function createCylinder(
		subdivisions        ,
		flat                  = false)                      {
	
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
		subdivisions        ,
		flat                  = false,
		height                = 1,
		rxOrRadius            = 1,
		rz                    = null)                      {
	
	return ae.mesh.createCylinder(subdivisions, flat).
		transformPositions(
			new ae.math.Matrix4D().scale(rxOrRadius, height, rz || rxOrRadius));
}

ae.mesh.createCylinderShell = function createCylinderShell(
		subdivisions        ,
		flat                  = false)                      {
	
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
		subdivisions        ,
		flat                  = false,
		height                = 1,
		rxOrRadius            = 1,
		rz                    = null)                      {
	
	return ae.mesh.createCylinderShell(subdivisions, flat).
		transformPositions(
			new ae.math.Matrix4D().scale(rxOrRadius, height, rz || rxOrRadius));
}

ae.mesh.createDisc = function createDisc(
		subdivisions        )                      {
	
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
		subdivisions        ,
		rxOrRadius           = 1,
		rz                   = null)                      {
	
	return ae.mesh.createDisc(subdivisions).transformPositions(
		new ae.math.Matrix4D().scale(rxOrRadius, 1, rz || rxOrRadius));
}

ae.mesh.createQuad = function createQuad()                      {
	
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
		centered             = true,
		widthOrSize          = 1,
		length               = null)                      {
	
	const t = centered ? -0.5 : 0;
	
	return ae.mesh.createQuad().transformPositions(new ae.math.Matrix4D().
		scale(widthOrSize, 1, length || widthOrSize).translate(t, t, t));
}

ae.mesh.createTorus = function createTorus(
		subdivisionsHor        ,
		subdivisionsVer        ,
		flat                     = false,
		radius                   = 2)                      {
	
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
		subdivisionsHor        ,
		subdivisionsVer        ,
		flat                     = false,
		R                        = 2,
		rHorOrRadius             = 1,
		rVer                     = null)                      {
	
	// The radius is set to preserve the ratio R/rHor
	return ae.mesh.createTorus(
			subdivisionsHor, subdivisionsVer, flat, R / rHorOrRadius).
		transformPositions(new ae.math.Matrix4D().
			scale(rHorOrRadius, rVer || rHorOrRadius, rHorOrRadius));
}

ae.mesh.createUVSphere = function createUVSphere(
		subdivisionsHor        ,
		flat                     = false,
		subdivisionsVer          = -1)                      {
	
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
		subdivisionsHor        ,
		subdivisionsVer        ,
		flat                     = false,
		rxOrRadius               = 1,
		ry                       = null,
		rz                       = null) {
	
	return ae.mesh.createUVSphere(subdivisionsHor, flat, subdivisionsVer).
		transformPositions(new ae.math.Matrix4D().
			scale(rxOrRadius, ry || rxOrRadius, rz || rxOrRadius));
}

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
	
	// The actual mesh will be cached
	                                                   
	
	// Meta information
	                                                  
	                           
	                           
	                          
	
	// Geometry data
	                                  
	                                  
	                                  
	                                  
	
	// Public meta information
	                    
	
	_assertNewPositionArrayPossible(vertexCount        )       {
		
		if(this._normals && this._normals.length != vertexCount)
			throw "Normal array with different size already specified";
		
		if(this._texCoords && this._texCoords.length != vertexCount)
			throw "Tex-coord array with different size already specified";
	}
	
	_assertIndicesNotNull()                       {
		
		return ae.util.assertNotNull(this._indices, "No indices specified");
	}
	
	_assertNormalsNotNull()                       {
		
		return ae.util.assertNotNull(this._normals, "No normals specified");
	}
	
	_assertPositionsNotNull()                       {
		
		return ae.util.assertNotNull(this._positions, "No positions specified");
	}
	
	_assertTexCoordsNotNull()                       {
		
		return ae.util.assertNotNull(
			this._texCoords, "No tex-coords specified");
	}
	
	_compareFloats(
			f1        ,
			f2        )          {
		
		return Math.abs(f1 - f2) < this._precision;
	}
	
	_computeFlatNormals(normalize         )       {
		
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
    		iP0              ,
    		iP1              ,
    		iP2              ,
    		iP3              ,
    		n                       ,
    		normalize         )                {
		
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
			iP0              ,
			iP1              ,
			iP2              ,
			n                       ,
			normalize         )                {
		
		const positions = this._assertPositionsNotNull();
		
		return ae.util.computeNormalFromPointArrays(
			positions[iP0], positions[iP1], positions[iP2], n, normalize);
	}
	
	_createCachedMesh()               {
		
		this._assertPositionsNotNull();
		
		return new ae.mesh.Mesh(
			this._indices || this._createDefaultIndices(),
			this._assertPositionsNotNull(), this._normals, this._texCoords,
			this._autoNormals, this.cullFacing);
	}
	
	_createDefaultIndices()                       {

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
			oldValue     ,
			newValue     )       {

		if(oldValue || newValue) this._lastValidMesh.invalidate();
	}
	
	constructor() {
		
		this._lastValidMesh = new ae.util.CachedObject(
			null, (obj               ) => {return this._createCachedMesh();});
		
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
	
	get indices()                          {return this._indices;}
	get normals()                          {return this._normals;}
	get positions()                        {return this._positions;}
	get texCoords()                        {return this._texCoords;}
	
	get mesh()               {return this._lastValidMesh.object;}
	
	set primitiveType(type                                ) {
		
		this._primitiveType    = type;
		this._primitiveTypeSet = true;
	}
	
	set indices(indices                       ) {
		
		this._resetCompiled(this._indices, indices);
		this._indices = indices;
		
		if(indices)
			this.primitiveType =
				ae.mesh.PrimitiveTypeEnumClass.fromPrimitiveSize(
					indices[0].length);
	}
	
	set normals(normals                       ) {
		
		if(normals && normals[0].length != 3)
			throw "A normal vector must consist of 3 components";
		
		if(normals && normals.length != this._assertPositionsNotNull().length)
			throw "Normal and position array must have the same length";
		
		this._resetCompiled(this._normals, normals);
		this._normals     = normals;
		this._autoNormals = false;
	}
	
	set positions(positions                       ) {
		
		if(positions && positions[0].length != 3)
			throw "A position must consist of 3 components";
		
		if(positions) this._assertNewPositionArrayPossible(positions.length);
		
		this._resetCompiled(this._positions, positions);
		this._positions = positions;
	}
	
	set texCoords(texCoords                       ) {
		
		if(texCoords && texCoords[0].length != 2)
			throw "A tex-coord must consist of 2 components";
		
		if(texCoords &&
			texCoords.length != this._assertPositionsNotNull().length)
			throw "Tex-coord and position array must have the same length";
		
		this._resetCompiled(this._texCoords, texCoords);
		this._texCoords = texCoords;
	}
	
	computeNormals(
			flat              ,
			normalize         )                      {

		this._assertPositionsNotNull();
		
		if(this._indices) this.unwrap();
		
		this._computeFlatNormals(normalize);
		
		this._autoNormals = true;

		return this;
	}
	
	createFlatCopy()                      {
		
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
			polygonCount        ,
			type                                )                       {
		
		const newIndices =
			ae.util.create2DimNumberArray(polygonCount, type.size);
		
		this._indices      = newIndices;
		this.primitiveType = type;
		
		return newIndices;
	}
	
	createNormalArray()                       {
		
		const newNormals = ae.util.create2DimNumberArray(
			this._assertPositionsNotNull().length, 3);
		
		this._normals = newNormals;
		
		return newNormals;
	}
	
	createPositionArray(vertexCount        )                       {
		
		this._assertNewPositionArrayPossible(vertexCount);
		
		const newPositions = ae.util.create2DimNumberArray(vertexCount, 3);
		
		this._positions = newPositions;
		
		return newPositions;
	}
	
	createTexCoordArray()                       {
		
		const newTexCoords = ae.util.create2DimNumberArray(
			this._assertPositionsNotNull().length, 2);
		
		this._texCoords = newTexCoords;
		
		return newTexCoords;
	}
	
	spliceUnusedVertices()                      {
		
		// TODO
		
		return this;
	}
	
	transformPositions(transform                  )                      {
		
		const positions = this._assertPositionsNotNull();
		
		for(var i = 0; i < positions.length; i++)
			transform.applyToPoint(positions[i], 0, 3);
		
		if(this._normals)
			for(var i = 0; i < positions.length; i++)
				transform.applyToDirVector(this._normals[i]);

		return this;
	}

	transformTexCoords(transform                  )                      {
		
		const texCoords = this._assertTexCoordsNotNull();

		for(var i = 0; i < texCoords.length; i++)
			transform.applyToPoint(texCoords[i], 0, 2);

		return this;
	}
	
	unwrap()                      {

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

ae.util.assertNotNull = function assertNotNull   (
		obj    ,
		msg          = null)    {
	
	if(obj) {
		return obj;
	} else if(msg) {
		throw msg;
	} else {
		throw "Object is null";
	}
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

ae.util.cloneArray2D = function cloneArray1D   (
		array                 )                  {
	
	const newArray = array.slice(0);
	
	for(var i = 0; i < array.length; i++)
		newArray[i] = ae.util.cloneArray1D(array[i]);
	
	return array.slice(0);
}

ae.util.cloneArray3D = function cloneArray1D   (
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

ae.util.computeNormalDirect = function computeNormalDirect(
		p0x              ,
		p0y              ,
		p0z              ,
		p1x              ,
		p1y              ,
		p1z              ,
		p2x              ,
		p2y              ,
		p2z              ,
		n                       ,
		normalize          = true)                {
	
	// Create the auxiliary vectors a,b for the vector product
	
	const ax = p1x - p0x;
	const ay = p1y - p0y;
	const az = p1z - p0z;
	const bx = p2x - p0x;
	const by = p2y - p0y;
	const bz = p2z - p0z;

	// Compute the vector product a x b
	
	n[0] = ay * bz - az * by;
	n[1] = az * bx - ax * bz;
	n[2] = ax * by - ay * bx;
	
	if(!normalize) return n;

	// Normalize the vector
	
	const length = Math.sqrt(n[0] * n[0] + n[1] * n[1] + n[2] * n[2]);

	n[0] /= length;
	n[1] /= length;
	n[2] /= length;
	
	return n;
};

ae.util.computeNormalFromPointArrays = function computeNormalFromPointArrays(
		p0                      ,
		p1                      ,
		p2                      ,
		n                       ,
		normalize          = true) {
	
	return ae.util.computeNormalDirect(
		p0[0], p0[1], p0[2], p1[0], p1[1], p1[2], p2[0], p2[1], p2[2],
		n, normalize);
};

// Unit vectors defined as 3D vectors
ae.math.X_POS = ae.math.Vector3D.createConst( 1,  0,  0);
ae.math.X_NEG = ae.math.Vector3D.createConst(-1,  0,  0);
ae.math.Y_POS = ae.math.Vector3D.createConst( 0,  1,  0);
ae.math.Y_NEG = ae.math.Vector3D.createConst( 0, -1,  0);
ae.math.Z_POS = ae.math.Vector3D.createConst( 0,  0,  1);
ae.math.Z_NEG = ae.math.Vector3D.createConst( 0,  0, -1);

// Colors defined as 4D vectors
ae.math.BLACK  = ae.math.Vector4D.createConst(0,    1);
ae.math.GREY   = ae.math.Vector4D.createConst(0.5,  1);
ae.math.WHITE  = ae.math.Vector4D.createConst(1,    1);
ae.math.RED    = ae.math.Vector4D.createConst(1, 0, 0, 1);
ae.math.GREEN  = ae.math.Vector4D.createConst(0, 1, 0, 1);
ae.math.BLUE   = ae.math.Vector4D.createConst(0, 0, 1, 1);
ae.math.YELLOW = ae.math.Vector4D.createConst(1, 1, 0, 1);
ae.math.PURPLE = ae.math.Vector4D.createConst(1, 0, 1, 1);
ae.math.CYAN   = ae.math.Vector4D.createConst(0, 1, 1, 1);

// Freeze all namespaces
Object.freeze(ae.core);
Object.freeze(ae.math);
Object.freeze(ae.mesh);
Object.freeze(ae.util);
Object.freeze(ae);
