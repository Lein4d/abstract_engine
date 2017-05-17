
// ae.math.ReadOnlyBackend
class AEClassReadOnlyBackend extends AEClassVectorBackend {
	
	_backend: ae.math.VectorBackend;
	
	constructor(
			backend: ae.math.VectorBackend) {
		
		super();
		this._backend = backend;
	}
	
	get x(): number {return this._backend.x;}
	get y(): number {return this._backend.y;}
	get z(): number {return this._backend.z;}
	get w(): number {return this._backend.w;}
	
	set x(x: number): ae.math.VectorBackend {return this;}
	set y(y: number): ae.math.VectorBackend {return this;}
	set z(z: number): ae.math.VectorBackend {return this;}
	set w(w: number): ae.math.VectorBackend {return this;}
	
	getElement(index: number): number {
		
		return this._backend.getElement(index);
	}
	
	setElement(
			index: number,
			value: number): ae.math.VectorBackend {
		
		return this;
	}
}
