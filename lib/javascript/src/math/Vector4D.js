
ae.math.Vector4D = class Vector4D {
	
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
	
	add(v: ae.math.Vevtor4D): ae.math.Vevtor4D {
		
		this.backend.x += v.backend.x;
		this.backend.y += v.backend.y;
		this.backend.z += v.backend.z;
		this.backend.w += v.backend.w;
		
		return this;
	}
	
	cloneConst(): ae.math.Vevtor4D {
		
		return new Vector4D(new ae.math.ReadOnlyBackend(
			new ae.math.StaticBackend(this.backend)));
	}
	
	cloneDeep(): ae.math.Vevtor4D {
		
		return new Vector4D(this.backend);
	}
	
	cloneStatic(): ae.math.Vevtor4D {
		
		return new Vector4D(new ae.math.StaticBackend(this.backend));
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

	copyStaticValues(): ae.math.Vevtor4D {
		
		this.x = this.backend.x;
		this.y = this.backend.y;
		this.z = this.backend.z;
		this.w = this.backend.w;
		
		return this;
	}

	static createConst(
			xOrGrey:  number,
			yOrW:    ?number,
			z:       ?number,
			w:       ?number): ae.math.Vector4D {
		
		w    = w    || yOrW || xOrGrey;
		z    = z    ||         xOrGrey;
		yOrW =         yOrW || xOrGrey;
		
		return new Vector4D(new ae.math.ReadOnlyBackend(
			new ae.math.StaticBackend(xOrGrey, yOrW, z, w)));
	}

	static createStatic(
			xOrGrey:  number,
			yOrW:    ?number,
			z:       ?number,
			w:       ?number): ae.math.Vector4D {
		
		w    = w    || yOrW || xOrGrey;
		z    = z    ||         xOrGrey;
		yOrW =         yOrW || xOrGrey;
		
		return new Vector4D(new ae.math.StaticBackend(xOrGrey, yOrW, z, w));
	}
	
	div(factor: number): ae.math.Vector4D {
		
		this.backend.x /= factor;
		this.backend.y /= factor;
		this.backend.z /= factor;
		this.backend.w /= factor;
		
		return this;
	}

	dot(v: ae.math.Vector4D): number {
		
		return (
			this.backend.x * v.backend.x + this.backend.y * v.backend.y +
			this.backend.z * v.backend.z + this.backend.w * v.backend.w);
	}
	
	getData(
			dst:    (ae.math.VectorBackend|ae.math.Vector4D|Array<number>),
			offset: number = 0):
			(ae.math.VectorBackend|ae.math.Vector4D|Array<number>) {
		
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
	
	mult(factorOrV: (number|ae.math.Vector4D)): ae.math.Vector4D {
		
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
			xOrSrc: (ae.math.VectorBackend|ae.math.Vector4D|Array<number>|number),
			yOrOffset: number = 0,
			z:         number = 0,
			w:         number = 0): ae.math.Vector4D {
		
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
	
	sub(v: ae.math.Vector4D): ae.math.Vector4D {
		
		this.backend.x -= v.backend.x;
		this.backend.y -= v.backend.y;
		this.backend.z -= v.backend.z;
		this.backend.w -= v.backend.w;
		
		return this;
	}
	
	toZeroPoint(): ae.math.Vector4D {
		
		return this.setData(0, 0, 0, 1);
	}
	
	toZeroVector(): ae.math.Vector4D {
		
		return this.setData(0, 0, 0, 0);
	}
};
