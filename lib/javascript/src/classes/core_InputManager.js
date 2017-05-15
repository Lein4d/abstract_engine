
// _ae.core.InputManager
class AEClassInputManager extends AEClassJavaObject {
	
	_p: {
		x:           number;
		y:           number;
		inCanvas:    boolean;
		button:      Array<boolean>;
		xOld:        number;
		yOld:        number;
		inCanvasOld: boolean;
		buttonOld:   Array<boolean>;
	}
	
	onKeyAction:          _ae.core.IMKeyEvent; // called first
	onKeyDown:            _ae.core.IMKeyEvent;
	onKeyUp:              _ae.core.IMKeyEvent;
	onMouseButtonAction:  _ae.core.IMMouseButtonEvent; // called first
	onMouseButtonDown:    _ae.core.IMMouseButtonEvent;
	onMouseButtonUp:      _ae.core.IMMouseButtonEvent;
	onMouseEnterCanvas:   _ae.core.IMMouseMoveEvent;
	onMouseEnterInstance: _ae.core.IMMouseMoveEvent;
	onMouseLeaveCanvas:   _ae.core.IMMouseMoveEvent;
	onMouseLeaveInstance: _ae.core.IMMouseMoveEvent;
	onMouseMove:          _ae.core.IMMouseMoveEvent;
	/*
	private final void _changePickedInstance(final Instance instance) {

		// Abort if the instance hasn't changed
		if(instance == _instance) return;
		
		final Instance oldInstance = _instance;
		
		// TODO: Richtige Koordinaten
		if(oldInstance != null) onMouseLeaveInstance._fire(0, 0);
		_instance = instance;
		if(instance    != null) onMouseEnterInstance._fire(0, 0);
	}
	*/
	// private methods /////////////////////////////////////////////////////////
	
	_processKeyEvent(
			event:   KeyboardEvent,
			pressed: boolean): void {
		
		if(event.repeat !== undefined && event.repeat) return;
		
		const code     = event.code;
		const spacePos = code.indexOf(' ');
		const key      = _aeEnumKeyString[
			spacePos >= 0 ? code.substr(0, spacePos) : code];
		
		this.onKeyAction._fire(key, pressed);
		
		if(pressed) {
			this.onKeyDown._fire(key, true);
		} else {
			this.onKeyUp  ._fire(key, false);
		}
	}
	
	_processMouseMoveEvent(
			event:     MouseEvent,
			inCanvas: (boolean | null)) {
		
		this._p.x = event.clientX;
		this._p.y = event.clientY;
		
		if(inCanvas !== null) this._p.inCanvas = inCanvas;
	}
	
	_wasButtonPressed(button: EnumMouseButton) {
		return this._p.buttonOld[button];
	}
	
	// internal constructor ////////////////////////////////////////////////////
	
	constructor(
			canvas:        HTMLCanvasElement,
			display:       _ae.core.Screen,
			entityPicking: boolean) {
		
		super();
		
		this._p = {
			x:           -1,
			y:           -1,
			inCanvas:    false,
			button:      [false, false, false],
			xOld:        -1,
			yOld:        -1,
			inCanvasOld: false,
			buttonOld:   [false, false, false],
		};
		
		this.onKeyAction          = new AEClassIMKeyEvent        (this);
		this.onKeyDown            = new AEClassIMKeyEvent        (this);
		this.onKeyUp              = new AEClassIMKeyEvent        (this);
		this.onMouseButtonAction  = new AEClassIMMouseButtonEvent(this);
		this.onMouseButtonDown    = new AEClassIMMouseButtonEvent(this);
		this.onMouseButtonUp      = new AEClassIMMouseButtonEvent(this);
		this.onMouseEnterCanvas   = new AEClassIMMouseMoveEvent  (this);
		this.onMouseEnterInstance = new AEClassIMMouseMoveEvent  (this);
		this.onMouseLeaveCanvas   = new AEClassIMMouseMoveEvent  (this);
		this.onMouseLeaveInstance = new AEClassIMMouseMoveEvent  (this);
		this.onMouseMove          = new AEClassIMMouseMoveEvent  (this);
		
		document.addEventListener(
			"keydown",
			(event: KeyboardEvent) => this._processKeyEvent(event, true));
		document.addEventListener(
			"keyup",
			(event: KeyboardEvent) => this._processKeyEvent(event, false));
		
		canvas.addEventListener(
			"mousemove",
			(event: MouseEvent) => this._processMouseMoveEvent(event, null));
		canvas.addEventListener(
			"mouseenter",
			(event: MouseEvent) => this._processMouseMoveEvent(event, true));
		canvas.addEventListener(
			"mouseleave",
			(event: MouseEvent) => this._processMouseMoveEvent(event, false));
		
		canvas.addEventListener(
			"mousedown",
			(event: MouseEvent) => this._p.button[event.button] = true);
		canvas.addEventListener(
			"mouseup",
			(event: MouseEvent) => this._p.button[event.button] = false);
		
		Object.freeze(this);
	}
	
	// internal methods ////////////////////////////////////////////////////////
	
	_processInput(): void {
		
		const dx = this.x - this._p.xOld;
		const dy = this.y - this._p.yOld;
		
		if(dx !== 0 && dy !== 0) this.onMouseMove._fire(dx, dy);
		
		if(!this._p.inCanvasOld &&  this._p.inCanvas)
			this.onMouseEnterCanvas._fire(dx, dy);
		if( this._p.inCanvasOld && !this._p.inCanvas)
			this.onMouseLeaveCanvas._fire(dx, dy);
		
		for(let i = 0; i < 3; i++) {
			
			// $CORRECT_CAST
			const btn: EnumMouseButton = i;
			
			if(!this._wasButtonPressed(btn) &&  this.isBtnPressed(btn)) {
				this.onMouseButtonAction._fire(btn, true);
				this.onMouseButtonDown  ._fire(btn, true);
			}
			
			if( this._wasButtonPressed(btn) && !this.isBtnPressed(btn)) {
				this.onMouseButtonAction._fire(btn, false);
				this.onMouseButtonDown  ._fire(btn, false);
			}
			
			this._p.buttonOld[btn] = this._p.button[btn];
		}
		
		this._p.xOld        = this.x;
		this._p.yOld        = this.y;
		this._p.inCanvasOld = this.inCanvas;
	}
	
	// public getters + setters ////////////////////////////////////////////////
	
	get inCanvas(): boolean {return this._p.inCanvas;}
	get left    (): boolean {return this._p.button[_aeEnumMouseButton.LEFT];}
	get middle  (): boolean {return this._p.button[_aeEnumMouseButton.MIDDLE];}
	get right   (): boolean {return this._p.button[_aeEnumMouseButton.RIGHT];}
	get x       (): number  {return this._p.x;}
	get y       (): number  {return this._p.y;}
	
	// public methods //////////////////////////////////////////////////////////
	
	isBtnPressed(button: EnumMouseButton): boolean {
		return this._p.button[button];
	}
}
