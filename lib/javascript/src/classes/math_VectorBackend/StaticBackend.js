
ae.math.StaticBackend = class StaticBackend extends ae.math.VectorBackend {
	
	_data: Array<number>;
	
	constructor(
			xOrBackend: (number|ae.math.VectorBackend),
			y:          number = 0,
			z:          number = 0,
			w:          number = 0) {
		
		super();
		
		this._data = xOrBackend instanceof ae.math.VectorBackend ?
			[xOrBackend.x, xOrBackend.y, xOrBackend.z, xOrBackend.w] :
			[xOrBackend,   y,            z,            w];
	}
	
	get x(): number {return this._data[0];}
	get y(): number {return this._data[1];}
	get z(): number {return this._data[2];}
	get w(): number {return this._data[3];}
	
	set x(x: number): ae.math.VectorBackend {
		
		this._data[0] = x;
		return this;
	}
	
	set y(y: number): ae.math.VectorBackend {
		
		this._data[1] = y;
		return this;
	}
	
	set z(z: number): ae.math.VectorBackend {
		
		this._data[2] = z;
		return this;
	}
	
	set w(w: number): ae.math.VectorBackend {
		
		this._data[3] = w;
		return this;
	}
	
	getElement(index: number): number {
		
		return this._data[index];
	}
	
	setElement(
			index: number,
			value: number): ae.math.VectorBackend {
		
		this._data[index] = value;
		
		return this;
	}
};
