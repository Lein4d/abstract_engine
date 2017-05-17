
// ae.core.InputManager$KeyEvent
class AEClassIMKeyEvent extends AEClassEvent<AEClassIMKeyEvent> {
	
	_p: {
		key:     number;
		pressed: boolean;
	}
	
	host: _ae.core.InputManager;
	
	// internal constructor ////////////////////////////////////////////////////
	
	constructor(host: _ae.core.InputManager) {
		
		super();
		
		this._p   = {
			key:     0,
			pressed: false,
		};
		this.host = host;
		
		Object.freeze(this);
	}
	
	// internal methods ////////////////////////////////////////////////////////
	
	_fire(
			key:     number,
			pressed: boolean): void {
		
		this._p.key     = key;
		this._p.pressed = pressed;
		
		this.fire();
	}
	
	// public getters + setters ////////////////////////////////////////////////
	
	get key    (): number  {return this._p.key;}
	get pressed(): boolean {return this._p.pressed;}
}

// ae.core.InputManager$MouseButtonEvent
class AEClassIMMouseButtonEvent extends AEClassEvent<AEClassIMMouseButtonEvent> {

	_p: {
		button:  EnumMouseButton;
		pressed: boolean;
	}
	
	host: _ae.core.InputManager;
	
	// internal constructor ////////////////////////////////////////////////////
	
	constructor(host: _ae.core.InputManager) {
		
		super();
		
		this._p   = {
			button:  0,
			pressed: false,
		};
		this.host = host;
		
		Object.freeze(this);
	}
	
	// internal methods ////////////////////////////////////////////////////////
	
	_fire(
			button:  EnumMouseButton,
			pressed: boolean): void {
		
		this._p.button  = button;
		this._p.pressed = pressed;
		
		this.fire();
	}
	
	// public getters + setters ////////////////////////////////////////////////
	
	get button (): EnumMouseButton {return this._p.button;}
	get pressed(): boolean         {return this._p.pressed;}
}

// ae.core.InputManager$MouseMoveEvent
class AEClassIMMouseMoveEvent extends AEClassEvent<AEClassIMMouseMoveEvent> {

	_p: {
		dx: number;
		dy: number;
	}
	
	host: _ae.core.InputManager;
	
	// internal constructor ////////////////////////////////////////////////////
	
	constructor(host: _ae.core.InputManager) {
		
		super();
		
		this._p   = {
			dx: 0,
			dy: 0,
		};
		this.host = host;
		
		Object.freeze(this);
	}
	
	// internal methods ////////////////////////////////////////////////////////
	
	_fire(
			dx: number,
			dy: number): void {
		
		this._p.dx = dx;
		this._p.dy = dy;
		
		this.fire();
	}
	
	// public getters + setters ////////////////////////////////////////////////
	
	get dx(): number {return this._p.dx;}
	get dy(): number {return this._p.dy;}
}
