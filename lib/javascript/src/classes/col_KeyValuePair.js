
// ae.collections.PooledHashMap$KeyValuePair<K,V>
class AEClassKeyValuePair extends AEClassJavaObject {
	
	_p: {
		key:           IObject;
		value:         IObject;
		keepReference: boolean;
	}
	
	// internal constructor ////////////////////////////////////////////////////
	
	constructor() {
		
		super();
		
		this._p = {
			key:           null,
			value:         null,
			keepReference: false,
		};
		
		Object.freeze(this);
	}
	
	// public getters + setters ////////////////////////////////////////////////
	
	get key          (): IObject {return this._p.key;}
	get value        (): IObject {return this._p.value;}
	get keepReference(): boolean {return this._p.keepReference;}
	
	set key  (key:   IObject) {this._p.key   = key;}
	set value(value: IObject) {this._p.value = value;}
	
	// public methods //////////////////////////////////////////////////////////
	
	freeReference(): this {
		if(this._p.keepReference) ae.col._p.HM_KVP_POOL.free(this);
		return this;
	}
	
	keepReference(): this {
		this._p.keepReference = true;
		return this;
	}
}