
// TODO: Pendant
class AEClassSizeChangeEvent<H>
	extends AEClassEvent<AEClassSizeChangeEvent<H>> {
	
	_p: {
		x:      number;
		y:      number;
		width:  number;
		height: number;
	}
	
	host: H;
	
	// internal constructor ////////////////////////////////////////////////////
	
	constructor(host: H) {
		
		super();
		
		this._p   = {
			x:      -1,
			y:      -1,
			width:  -1,
			height: -1,
		};
		this.host = host;
		
		Object.freeze(this);
	}
	
	// internal methods ////////////////////////////////////////////////////////
	
	_setPosition(
			width:  number,
			height: number): boolean {
		
		return this._setRect(this._p.x, this._p.y, width, height);
	}
	
	_setRect(
			x:      number,
			y:      number,
			width:  number,
			height: number): boolean {
		
		if(x === this._p.x && y === this._p.y &&
			width === this._p.width && height === this._p.height) return false;
		
		this._p.x      = x;
		this._p.y      = y;
		this._p.width  = width;
		this._p.height = height;
		
		this.fire();
		
		return true;
	}
	
	_setSize(
			x: number,
			y: number): boolean {
		
		return this._setRect(x, y, this._p.width, this._p.height);
	}
}