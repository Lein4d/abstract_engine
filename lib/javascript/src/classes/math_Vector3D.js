
// ae.math.Vector3D
class AEClassVector3D extends AEClassJavaObject {
	
	backend:  ae.math.VectorBackend;
	readOnly: ae.math.Vector3D;
	
	x: number;
	y: number;
	z: number;
	
	constructor(backend: ae.math.VectorBackend) {
		
		super();
		
		this.backend  = backend;
		this.readOnly = backend instanceof AEClassReadOnlyBackend ?
			this : new AEClassVector3D(new AEClassReadOnlyBackend(backend));
		
		this.x = 0; this.y = 0; this.z = 0;
	}
	
	addA(value: number): this {
		
		this.backend.x += value;
		this.backend.y += value;
		this.backend.z += value;
		
		return this;
	}
	
	addB(v: ae.math.Vector3D): this {
		
		this.backend.x += v.backend.x;
		this.backend.y += v.backend.y;
		this.backend.z += v.backend.z;
		
		return this;
	}
	
	static angleDeg(
			v1: ae.math.Vector3D,
			v2: ae.math.Vector3D): number {
		
		return AEClassVector3D.angleRad(v1, v2) * ae.DEG_FACTOR;
	}
	
	static angleRad(
			v1: ae.math.Vector3D,
			v2: ae.math.Vector3D): number {
		
		return Math.acos(
			AEClassVector3D.dot(v1, v2) / (v1.computeLength() * v2.computeLength()));
	}
	
	cloneConst(): ae.math.Vector3D {
		return new AEClassVector3D(new ae.math.ReadOnlyBackend(
			new ae.math.StaticBackend(this.backend)));
	}
	
	cloneDeep(): ae.math.Vector3D {
		return new AEClassVector3D(this.backend);
	}
	
	cloneStatic(): ae.math.Vector3D {
		return new AEClassVector3D(new ae.math.StaticBackend(this.backend));
	}
	
	computeLength(): number {
		this.copyStaticValues();
		return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
	}

	computeMean(): number {
		return (this.backend.x + this.backend.y + this.backend.z) / 3;
	}

	copyStaticValues(): this {
		
		this.x = this.backend.x;
		this.y = this.backend.y;
		this.z = this.backend.z;
		
		return this;
	}

	static createConstA(grey: number = 0): ae.math.Vector3D {
		return AEClassVector3D.createConstB(grey, grey, grey);
	}

	static createConstB(
			x: number,
			y: number,
			z: number): ae.math.Vector3D {
		
		return new AEClassVector3D(new AEClassReadOnlyBackend(
			new AEClassStaticBackend(x, y, z)));
	}

	static createStaticA(grey: number = 0): ae.math.Vector3D {
		return AEClassVector3D.createStaticB(grey, grey, grey);
	}

	static createStaticB(
			x: number,
			y: number,
			z: number): ae.math.Vector3D {
		
		return new AEClassVector3D(new AEClassStaticBackend(x, y, z));
	}

	static cross(
			v1:  ae.math.Vector3D,
			v2:  ae.math.Vector3D,
			dst: ae.math.Vector3D): ae.math.Vector3D {
		
		v1.copyStaticValues();
		v2.copyStaticValues();
		
		dst.backend.x = v1.y * v2.z - v1.z * v2.y;
		dst.backend.y = v1.z * v2.x - v1.x * v2.z;
		dst.backend.z = v1.x * v2.y - v1.y * v2.x;
		
		return dst;
	}
	
	divA(value: number): this {
		
		this.backend.x /= value;
		this.backend.y /= value;
		this.backend.z /= value;
		
		return this;
	}
	
	divB(v: ae.math.Vector3D): this {
		
		this.backend.x /= v.backend.x;
		this.backend.y /= v.backend.y;
		this.backend.z /= v.backend.z;
		
		return this;
	}
	
	static dot(
			v1: ae.math.Vector3D,
			v2: ae.math.Vector3D): number {
		
		return (
			v1.backend.x * v2.backend.x + v1.backend.y * v2.backend.y +
			v1.backend.z * v2.backend.z);
	}
	
	getDataA(dst: ae.math.Vector3D): ae.math.Vector3D {
		this.getDataB(dst.backend);
		return dst;
	}
	
	getDataB(dst: ae.math.VectorBackend): ae.math.VectorBackend {
		
		dst.x = this.backend.x;
		dst.y = this.backend.y;
		dst.z = this.backend.z;
		
		return dst;
	}
	
	getDataC(
			dst:    Array<number>,
			offset: number = 0): Array<number> {
		
		dst[offset + 0] = this.backend.x;
		dst[offset + 1] = this.backend.y;
		dst[offset + 2] = this.backend.z;
		
		return dst;
	}
	
	multA(value: number): this {
		
		this.backend.x *= value;
		this.backend.y *= value;
		this.backend.z *= value;
		
		return this;
	}
	
	multB(v: ae.math.Vector3D): this {
		
		this.backend.x *= v.backend.x;
		this.backend.y *= v.backend.y;
		this.backend.z *= v.backend.z;
		
		return this;
	}
	
	normalize(): ae.math.Vector3D {
		return this.divA(this.computeLength());
	}
	
	setDataA(src: ae.math.Vector3D): ae.math.Vector3D {
		return this.setDataB(src.backend);
	}
	
	setDataB(src: ae.math.VectorBackend): ae.math.Vector3D {
		return this.setDataD(src.x, src.y, src.z);
	}
	
	setDataC(
			src:    Array<number>,
			offset: number = 0): ae.math.Vector3D {
		
		return this.setDataD(src[offset + 0], src[offset + 1], src[offset + 2]);
	}
	
	setDataD(
			x: number,
			y: number,
			z: number): this {
		
		this.backend.x = x; this.backend.y = y; this.backend.z = z;
		return this;
	}
	
	subA(value: number): this {
		
		this.backend.x -= value;
		this.backend.y -= value;
		this.backend.z -= value;
		
		return this;
	}
	
	subB(v: ae.math.Vector3D): this {
		
		this.backend.x -= v.backend.x;
		this.backend.y -= v.backend.y;
		this.backend.z -= v.backend.z;
		
		return this;
	}
	
	toZeroVector(): this {
		return this.setDataD(0, 0, 0);
	}
};
