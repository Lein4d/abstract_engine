
// ae.scenegraph.ConstAttribute<T>
class AEClassConstAttribute<T> extends AEClassJavaObject {

	_p: {
		extValueDir:   (T                       | null);
		extValueTrans: (ae.sg.ConstAttribute<T> | null);
		value:         (T                       | null);
	}
	
	get _extValueDir(): (T | null) {return this._p.extValueDir;}
	
	get _extValueTrans(): (ae.sg.ConstAttribute<T> | null) {
		return this._p.extValueTrans;
	}
	
	constructor(internalValue: (T | null)) {
		
		super();
		
		this._p = {
			extValueDir:   null,
			extValueTrans: null,
			value:         internalValue
		}
		
		Object.freeze(this);
	}
	
	get activeValue(): (T | null) {
		
		let activeValue = null;
		
		if(this._extValueTrans !== null)
			activeValue = this._extValueTrans.activeValue;
		
		return activeValue !== null ?
			activeValue :
			(this._extValueDir !== null ? this._extValueDir : this.value);
	}
	
	get activeValueNN(): T {
		// $NOT_NULL
		return this.activeValue;
	}
	
	get value(): (T | null) {return this._p.value;}
	
	get valueNN(): T {
		// $NOT_NULL
		return this.value;
	}
	
	set externalValueDir(externalValue: (T | null)): void {
		this._p.extValueDir = externalValue;
	}
	
	set externalValueTrans(
			externalValue: (ae.sg.ConstAttribute<T> | null)): void {
		this._p.extValueTrans = externalValue;
	}
	
	resetExternal(): void {
		this._p.extValueDir   = null;
		this._p.extValueTrans = null;
	}
}

// ae.scenegraph.Attribute<T>
class AEClassAttribute<T> extends AEClassConstAttribute<T> {
	
	constructor(internalValue: (T | null) = null) {
		super(internalValue);
	}
	
	set internalValue(interalvalue: (T | null)): void {
		this._p.value = interalvalue;
	}
}
