
// ae.math.MatrixVector
class AEClassMatrixVector extends AEClassVectorBackend {
	
	_matrix:  ae.math.Matrix4D;
	_isRow:   boolean;
	_rcIndex: number;
	
	constructor(
			matrix:  ae.math.Matrix4D,
			isRow:   boolean,
			rcIndex: number) {
		
		super();
		
		this._matrix  = matrix;
		this._isRow   = isRow;
		this._rcIndex = rcIndex;
	}

	get x(): number {return this.getElement(0);}
	get y(): number {return this.getElement(1);}
	get z(): number {return this.getElement(2);}
	get w(): number {return this.getElement(3);}
	
	set x(x: number): ae.math.VectorBackend {
		
		this.setElement(0, x);
		return this;
	}
	
	set y(y: number): ae.math.VectorBackend {
		
		this.setElement(1, y);
		return this;
	}
	
	set z(z: number): ae.math.VectorBackend {
		
		this.setElement(2, z);
		return this;
	}
	
	set w(w: number): ae.math.VectorBackend {
		
		this.setElement(3, w);
		return this;
	}
	
	getElement(index: number): number {
		
		return this._isRow ?
			this._matrix.getElement(this._rcIndex, index) :
			this._matrix.getElement(index,         this._rcIndex);
	}

	setElement(
			index: number,
			value: number): ae.math.VectorBackend {
		
		this._matrix.setElement(
			this._isRow ? this._rcIndex : index,
			this._isRow ? index         : this._rcIndex,
			value);
		
		return this;
	}
};
