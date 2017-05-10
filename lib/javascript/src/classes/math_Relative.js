
// ae.math.RelativePoint
class AEClassRelativePoint extends AEClassJavaObject {
	
	_p: {
		marker:   (ae.sg.Marker     | null);
		absolute: (ae.math.Vector3D | null);
		state:    EnumRPState;
	}
	
	_position: ae.math.Vector3D;
	
	// public constructor //////////////////////////////////////////////////////
	
	constructor() {
		
		super();
		
		this._position = AEClassVector3D.createStaticA();
		this._p        = {
			marker:   null,
			absolute: null,
			state:    _aeEnumRPState.ZERO,
		};
		
		Object.freeze(this);
	}
	
	// public methods //////////////////////////////////////////////////////////
	
	getPosition(dst: (ae.math.Vector3D | null) = null): ae.math.Vector3D {
		
		const dstNN = dst !== null ? dst : this._position;
		
		switch(this._p.state) {
			case _aeEnumRPState.ZERO:
				return dstNN.toZeroVector();
			case _aeEnumRPState.ABSOLUTE:
				// $NOT_NULL: 'this._p.marker.absolute'
				return dstNN.setDataA(this._p.absolute);
			case _aeEnumRPState.RELATIVE:
				// $NOT_NULL: 'this._p.marker.position'
				return dstNN.setDataA(this._p.marker.position);
		}
		
		throw "Impossible error";
	}
	
	setMarker(marker: ae.sg.Marker): this {
		
		this._p.marker = marker;
		this._p.state  = _aeEnumRPState.RELATIVE;
		
		return this;
	}

	setPosition(position: ae.math.Vector3D): this {
		
		this._p.absolute = position;
		this._p.state    = _aeEnumRPState.ABSOLUTE;
		
		return this;
	}
	
	setToZero(): this {
		this._p.state = _aeEnumRPState.ZERO;
		return this;
	}
}

// ae.math.RelativeVector
class AEClassRelativeVector extends AEClassJavaObject {
	
	_direction: ae.math.Vector3D;
	
	p1: ae.math.RelativePoint;
	p2: ae.math.RelativePoint;
	
	// public constructor //////////////////////////////////////////////////////
	
	constructor() {
		
		super();
		
		this._direction = AEClassVector3D.createStaticA();
		this. p1        = new AEClassRelativePoint();
		this. p2        = new AEClassRelativePoint();
		
		Object.freeze(this);
	}
	
	// public methods //////////////////////////////////////////////////////////
	
	getDirection(dst: (ae.math.Vector3D | null) = null): ae.math.Vector3D {
		const directionNN = dst !== null ? dst : this._direction;
		return this.p2.getPosition(directionNN).subB(this.p1.getPosition());
	}
	
	setDirection(direction: ae.math.Vector3D): this {
		
		this.p1.setToZero();
		this.p2.setPosition(direction);
		
		return this;
	}
}
