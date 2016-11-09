
ae.math.Vector3D = class Vector3D {
	
	backend:  ae.math.VectorBackend;
	readOnly: ae.math.Vector3D;
	
	x: number;
	y: number;
	z: number;
	
	constructor(backend: ae.math.VectorBackend) {
		
		this.backend  = backend;
		this.readOnly = backend instanceof ae.math.ReadOnlyBackend ?
			this : new Vector3D(new ae.math.ReadOnlyBackend(backend));
		
		this.x = 0;
		this.y = 0;
		this.z = 0;
	}
	
	add(v: ae.math.Vevtor3D): ae.math.Vevtor3D {
		
		this.backend.x += v.backend.x;
		this.backend.y += v.backend.y;
		this.backend.z += v.backend.z;
		
		return this;
	}
	
	cloneConst(): ae.math.Vevtor3D {
		
		return new Vector3D(new ae.math.ReadOnlyBackend(
			new ae.math.StaticBackend(this.backend)));
	}
	
	cloneDeep(): ae.math.Vevtor3D {
		
		return new Vector3D(this.backend);
	}
	
	cloneStatic(): ae.math.Vevtor3D {
		
		return new Vector3D(new ae.math.StaticBackend(this.backend));
	}
	
	computeLength(): number {
		
		this.copyStaticValues();
		
		return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
	}

	computeMean(): number {
		
		return (this.backend.x + this.backend.y + this.backend.z) / 3;
	}

	copyStaticValues(): ae.math.Vevtor3D {
		
		this.x = this.backend.x;
		this.y = this.backend.y;
		this.z = this.backend.z;
		
		return this;
	}

	static createConst(
			xOrGrey:  number,
			y:       ?number,
			z:       ?number): ae.math.Vector3D {
		
		y = y || xOrGrey;
		z = z || xOrGrey;
		
		return new Vector3D(new ae.math.ReadOnlyBackend(
			new ae.math.StaticBackend(xOrGrey, y, z)));
	}

	static createStatic(
			xOrGrey:  number,
			y:       ?number,
			z:       ?number): ae.math.Vector3D {
		
		y = y || xOrGrey;
		z = z || xOrGrey;
		
		return new Vector3D(new ae.math.StaticBackend(xOrGrey, y, z));
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
	
	div(factor: number): ae.math.Vector3D {
		
		this.backend.x /= factor;
		this.backend.y /= factor;
		this.backend.z /= factor;
		
		return this;
	}

	dot(v: ae.math.Vector3D): number {
		
		return (
			this.backend.x * v.backend.x + this.backend.y * v.backend.y +
			this.backend.z * v.backend.z);
	}
	
	getData(
			dst:    (ae.math.VectorBackend|ae.math.Vector3D|Array<number>),
			offset: number = 0):
			(ae.math.VectorBackend|ae.math.Vector3D|Array<number>) {
		
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
	
	mult(factorOrV: (number|ae.math.Vector3D)): ae.math.Vector3D {
		
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
			xOrSrc: (ae.math.VectorBackend|ae.math.Vector3D|Array<number>|number),
			yOrOffset: number = 0,
			z:         number = 0): ae.math.Vector3D {
		
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
	
	sub(v: ae.math.Vector3D): ae.math.Vector3D {
		
		this.backend.x -= v.backend.x;
		this.backend.y -= v.backend.y;
		this.backend.z -= v.backend.z;
		
		return this;
	}
	
	toZeroVector(): ae.math.Vector3D {
		
		return this.setData(0, 0, 0);
	}
};
