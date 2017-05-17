
// ae.collections.PooledHashMap$KeyValuePair<K,V>
class AEClassKeyValuePair extends AEClassJavaObject {
	
	_p: {
		key:           IObject;
		value:         IObject;
		referenceKept: boolean;
	}
	
	// internal constructor ////////////////////////////////////////////////////
	
	constructor() {
		
		super();
		
		this._p = {
			key:           null,
			value:         null,
			referenceKept: false,
		};
		
		Object.freeze(this);
	}
	
	// public getters + setters ////////////////////////////////////////////////
	
	get key          (): IObject {return this._p.key;}
	get value        (): IObject {return this._p.value;}
	get referenceKept(): boolean {return this._p.referenceKept;}
	
	set key  (key:   IObject) {this._p.key   = key;}
	set value(value: IObject) {this._p.value = value;}
	
	// public methods //////////////////////////////////////////////////////////
	
	freeReference(): this {
		if(this._p.referenceKept) ae.col._p.HM_KVP_POOL.free(this);
		return this;
	}
	
	keepReference(): this {
		this._p.referenceKept = true;
		return this;
	}
}