
// ae.math.Vector4D
class AEClassVector4D extends AEClassJavaObject {
	
	backend:  ae.math.VectorBackend;
	xyz:      ae.math.Vector3D;
	readOnly: ae.math.Vector4D;
	
	x: number;
	y: number;
	z: number;
	w: number;
	
	constructor(
			backend:  ae.math.VectorBackend,
			_xyz:    ?ae.math.Vector3D) {
		
		super();
		
		if(backend instanceof AEClassReadOnlyBackend) {
			
			this.backend  = backend;
			this.xyz      = _xyz || new AEClassVector3D(backend);
			this.readOnly = this;
			
		} else {
			
			this.backend  = backend;
			this.xyz      = new AEClassVector3D(backend);
			this.readOnly = new AEClassVector4D(
				new AEClassReadOnlyBackend(backend), this.xyz.readOnly);
		}
		
		this.x = 0;
		this.y = 0;
		this.z = 0;
		this.w = 0;
	}
	
	addA(value: number): this {
		
		this.backend.x += value;
		this.backend.y += value;
		this.backend.z += value;
		this.backend.w += value;
		
		return this;
	}
	
	addB(v: ae.math.Vector4D): this {
		
		this.backend.x += v.backend.x;
		this.backend.y += v.backend.y;
		this.backend.z += v.backend.z;
		this.backend.w += v.backend.w;
		
		return this;
	}
	
	cloneConst(): ae.math.Vector4D {
		
		return new AEClassVector4D(new AEClassReadOnlyBackend(
			new AEClassStaticBackend(this.backend)));
	}
	
	cloneDeep(): ae.math.Vector4D {
		return new AEClassVector4D(this.backend);
	}
	
	cloneStatic(): ae.math.Vector4D {
		return new AEClassVector4D(new AEClassStaticBackend(this.backend));
	}
	
	computeLength(): number {
		this.copyStaticValues();
		return Math.sqrt(
			this.x * this.x + this.y * this.y +
			this.z * this.z + this.w * this.w);
	}

	computeMean(): number {
		return (
			this.backend.x + this.backend.y +
			this.backend.z + this.backend.w) / 4;
	}

	copyStaticValues(): this {
		
		this.x = this.backend.x;
		this.y = this.backend.y;
		this.z = this.backend.z;
		this.w = this.backend.w;
		
		return this;
	}

	static createConstA(grey: number = 0): ae.math.Vector4D {
		return AEClassVector4D.createConstC(grey, grey, grey, grey);
	}

	static createConstB(
			grey: number = 0,
			w:    number = 1): ae.math.Vector4D {
				
		return AEClassVector4D.createConstC(grey, grey, grey, w);
	}

	static createConstC(
			x: number,
			y: number,
			z: number,
			w: number): ae.math.Vector4D {
		
		return new AEClassVector4D(new AEClassReadOnlyBackend(
			new AEClassStaticBackend(x, y, z, w)));
	}

	static createStaticA(grey: number = 0): ae.math.Vector4D {
		return AEClassVector4D.createStaticC(grey, grey, grey, grey);
	}

	static createStaticB(
			grey: number = 0,
			w:    number = 1): ae.math.Vector4D {
				
		return AEClassVector4D.createStaticC(grey, grey, grey, w);
	}

	static createStaticC(
			x: number,
			y: number,
			z: number,
			w: number): ae.math.Vector4D {
		
		return new AEClassVector4D(new AEClassStaticBackend(x, y, z, w));
	}

	divA(value: number): this {
		
		this.backend.x /= value;
		this.backend.y /= value;
		this.backend.z /= value;
		this.backend.w /= value;
		
		return this;
	}
	
	divB(v: ae.math.Vector4D): this {
		
		this.backend.x /= v.backend.x;
		this.backend.y /= v.backend.y;
		this.backend.z /= v.backend.z;
		this.backend.w /= v.backend.w;
		
		return this;
	}
	
	dot(v: ae.math.Vector4D): number {
		
		return (
			this.backend.x * v.backend.x + this.backend.y * v.backend.y +
			this.backend.z * v.backend.z + this.backend.w * v.backend.w);
	}
	
	getData(dst: ae.math.Vector4D): ae.math.Vector4D {
		this.getDataBackend(dst.backend);
		return dst;
	}
	
	getDataArray(
			dst:    Float32Array,
			offset: number = 0): Float32Array {
		
		dst[offset + 0] = this.backend.x;
		dst[offset + 1] = this.backend.y;
		dst[offset + 2] = this.backend.z;
		dst[offset + 3] = this.backend.w;
		
		return dst;
	}
	
	getDataBackend(dst: ae.math.VectorBackend): ae.math.VectorBackend {
		
		dst.x = this.backend.x;
		dst.y = this.backend.y;
		dst.z = this.backend.z;
		dst.w = this.backend.w;
		
		return dst;
	}
	
	multA(value: number): ae.math.Vector4D {
		
		this.backend.x *= value;
		this.backend.y *= value;
		this.backend.z *= value;
		this.backend.w *= value;
		
		return this;
	}
	
	multB(v: ae.math.Vector4D): ae.math.Vector4D {
		
		this.backend.x *= v.backend.x;
		this.backend.y *= v.backend.y;
		this.backend.z *= v.backend.z;
		this.backend.w *= v.backend.w;
		
		return this;
	}
	
	setData(src: ae.math.Vector4D): this {
		return this.setDataBackend(src.backend);
	}
	
	setDataArray(
			src:    (Array<number> | Float32Array),
			offset:  number = 0): this {
		
		return this.setDataDirect(
			src[offset + 0], src[offset + 1], src[offset + 2], src[offset + 3]);
	}
	
	setDataBackend(src: ae.math.VectorBackend): this {
		return this.setDataDirect(src.x, src.y, src.z, src.w);
	}
	
	setDataDirect(
			x: number,
			y: number,
			z: number,
			w: number): this {
		
		this.backend.x = x;
		this.backend.y = y;
		this.backend.z = z;
		this.backend.w = w;
		
		return this;
	}
	
	subA(value: number): this {
		
		this.backend.x -= value;
		this.backend.y -= value;
		this.backend.z -= value;
		this.backend.w -= value;
		
		return this;
	}
	
	subB(v: ae.math.Vector4D): this {
		
		this.backend.x -= v.backend.x;
		this.backend.y -= v.backend.y;
		this.backend.z -= v.backend.z;
		this.backend.w -= v.backend.w;
		
		return this;
	}
	
	toZeroPoint(): this {
		return this.setDataDirect(0, 0, 0, 1);
	}
	
	toZeroVector(): this {
		return this.setDataDirect(0, 0, 0, 0);
	}
};
