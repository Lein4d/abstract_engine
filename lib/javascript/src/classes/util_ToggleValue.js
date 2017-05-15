
// ae.util.ToggleValue
class AEClassToggleValue extends AEClassJavaObject {
	
	_p: {
		state: boolean;
	}
	
	_cbFalseToTrue: Consumer<boolean>;
	_cbTrueToFalse: Consumer<boolean>;
	
	// public constructor //////////////////////////////////////////////////////
	
	constructor(
			cbFalseToTrue:  Consumer<boolean>,
			cbTrueToFalse: (Consumer<boolean> | null) = null) {
		
		super();
		
		this._cbFalseToTrue = cbFalseToTrue;
		this._cbTrueToFalse = cbTrueToFalse || cbFalseToTrue;
		this._p             = {
			state: false,
		};
		
		Object.freeze(this);
	}
	
	// public getters + setters ////////////////////////////////////////////////
	
	get state():               boolean {return this._p.state;}
	set state(state: boolean): void    {this.setState(state);}
	
	// public methods //////////////////////////////////////////////////////////
	
	activate(): boolean {
		return this.setState(true);
	}

	deactivate(): boolean {
		return this.setState(false);
	}
	
	setState(state: boolean): boolean {
		
		if(!this.state &&  state) this._cbFalseToTrue(true);
		if( this.state && !state) this._cbTrueToFalse(false);
		
		return this._p.state = state;
	}
	
	toggle(): boolean {
		return this.setState(!this.state);
	}
}