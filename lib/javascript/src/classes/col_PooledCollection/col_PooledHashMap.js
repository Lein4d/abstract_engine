
// ae.collections.PooledHashMap
class AEClassPooledHashMap<K: ae.JavaObject, V>
	extends AEClassPooledCollection<ae.col.KeyValuePair> {
	
	_pp: {
		keys:            Array<(K | null)>;
		values:          Array<V | null>;
		used:            Array<boolean>;
		usedCount:       number;
		latestAccessPos: number;
	}
	
	maxLoadFactor: number;
	resizeFactor:  number;
	keys:          ae.col._p.HMKeyIterator  <K, V>;
	values:        ae.col._p.HMValueIterator<K, V>;
	
	// private getters + setters ///////////////////////////////////////////////
	
	get _keys  (): Array<(K | null)> {return this._pp.keys;}
	get _values(): Array<V | null>   {return this._pp.values;}
	get _used  (): Array<boolean>    {return this._pp.used;}
	
	// We need this getter to satisfy the type checker and we need the local
	// variable to prevent a spurious 'undefined' error durng runtime
	get _valuesNN(): Array<V> {
		
		// $CORRECT_CAST
		const values: Array<V> = this._pp.values;
		
		return values;
	}
	
	// private static methods //////////////////////////////////////////////////
	
	static _areKeysEqual(
			key1: (ae.JavaObject | null),
			key2: (ae.JavaObject | null)): boolean {
		
		// The condition ensures that the 'equals()' method is only called if
		// both keys are not null
		return key1 === null || key2 === null ?
			key1 === key2 : key1.equals(key2);
	}
	
	// private methods /////////////////////////////////////////////////////////
	
	_createArrays(size: number): void {
		this._pp.keys      = Array(size);
		this._pp.values    = Array(size);
		this._pp.used      = Array(size);
		this._p .size      = 0;
		this._pp.usedCount = 0;
	}
	
	_getInitialPosition(key: K): number {
		return key.hashCode % this._keys.length;
	}
	
	_getKeyPosition(key: (K | null)): number {
		
		if(key === null) return -1;
		
		let pos    = this._getInitialPosition(key);
		let newPos = -1;
		
		// Find the position of the key
		while(this._used[pos] &&
			!AEClassPooledHashMap._areKeysEqual(key, this._keys[pos])) {
			
			// If there's a slot, marked as 'used' but without a key-value-pair,
			// it is stored to optimize the key position later on
			if(!this._keys[pos] && newPos === -1) newPos = pos;
			
			pos = (pos + 1) % this._keys.length;
		}
		
		// Abort if the key couldn't be found
		if(!this._used[pos]) return -1;
		
		// Abort if the position is already the optimal position
		if(newPos === -1) return pos;
		
		// Copy the key-value-pair to a better position
		this._keys  [newPos] = this._keys  [pos];
		this._values[newPos] = this._values[pos];
		
		const nextPos = (pos + 1) % this._keys.length;
		
		// If the slot after the current position is not marked as 'used', the
		// mark can also be removed from the current one, so subsequent
		// attempts finding a key will be faster
		if(!this._used[nextPos]) this._used[pos] = false;
		
		return newPos;
	}
	
	_getLoadFactor(size: number): number {
		return this.size / this._keys.length;
	}
	
	_setValue(
    		key:   K,
    		value: V): boolean {
    	
    	let pos = this._getInitialPosition(key);
    
    	// Search an empty slot
    	while(this._keys[pos] &&
			!AEClassPooledHashMap._areKeysEqual(key, this._keys[pos]))
    		pos = (pos + 1) % this._keys.length;
    	
    	if(this._keys[pos]) {
    		this._values[pos] = value;
    		return false;
    	}
    	
    	if(this._getLoadFactor(this.size + 1) > this.maxLoadFactor) {
    		
    		const oldKeys   = this._keys;
    		const oldValues = this._values;
    		
    		this._createArrays(this._keys.length * this.resizeFactor);
    		
    		for(let i = 0; i < oldKeys.length; i++)
    			if(oldKeys[i] !== null)
					// $NOT_NULL: 'oldValues[i]'
					this._setValue(oldKeys[i], oldValues[i]);
    		
    		this._setValue(key, value);
    		
    	} else {
    		
    		this._pp.keys  [pos] = key;
    		this._pp.values[pos] = value;
    		this._pp.used  [pos] = true;
    		this._p .size++;
    	}
    	
    	return true;
    }
	
	// protected methods ///////////////////////////////////////////////////////
	
	_addSingle(element: ae.col.KeyValuePair): boolean {
		// $CORRECT_CAST
		return this.setValue(element.key, element.value);
	}
	
	_clear(): void {
		
		for(let i = 0; i < this._keys.length; i++) {
			this._keys  [i] = null;
			this._values[i] = null;
			this._used  [i] = false;
		}
		
		this._p.size = this._pp.usedCount = 0;
	}

	// public constructor //////////////////////////////////////////////////////
	
	constructor(
			bucketCount:   number = 16,
			maxLoadFactor: number = 0.75,
			resizeFactor:  number = 2) {
		
		super();
		
		this._pp = {
			keys:            Array(bucketCount),
			values:          Array(bucketCount),
			used:            Array(bucketCount),
			usedCount:       0,
			latestAccessPos: -1,
		}
		
		this.maxLoadFactor = maxLoadFactor;
		this.resizeFactor  = resizeFactor;
		this.keys          = new AEClassHMKeyIterator(this);
		this.values        = new AEClassHMValueIterator(this);
	}
	
	// public getters + setters ////////////////////////////////////////////////
	
	get bufferSize(): number {return this._pp.keys.length;}
	get loadFactor(): number {return this._getLoadFactor(this.size);}
	
	get requestedValue(): V {
		
		const pos = this._pp.latestAccessPos;
		
		if(pos < 0) throw "No requested value available";
		return this._valuesNN[pos];
	}
	
	// public methods //////////////////////////////////////////////////////////
	
	deleteKey(key: K): boolean {
		
		let pos = this._getInitialPosition(key);
		
		// Search position of the key
		while(this._keys[pos] !== key || this._used[pos])
			pos = (pos + 1) % this._keys.length;
		
		if(this._keys[pos] !== key) return false;
		
		this._pp.keys  [pos] = null;
		this._pp.values[pos] = null;
		this._p .size--;
		
		return true;
	}
	
	forEach(visitor: Visitor<ae.col.KeyValuePair>) {
		
		let kvp = null;
		
		for(let i = 0; i < this.bufferSize; i++) {
			
			if(!this._used[i])                    continue;
			if(kvp === null || kvp.keepReference) kvp = ae.col._p.HM_KVP_POOL.provide();
			
			kvp.key   = this._keys[i];
			kvp.value = this._values[i];
		}
		
		if(kvp !== null && !kvp.keepReference) ae.col._p.HM_KVP_POOL.free(kvp);
	}
	
	getValueA(key: K): V {
		
		const pos = this._getKeyPosition(key);
		
		if(pos < 0) throw "Key doesn't exist";
		return this._valuesNN[pos];
	}
	
	getValueB(
			key:          K,
			defaultValue: V): V {
		
		const pos = this._getKeyPosition(key);
		
		// NOT_NULL: 'this._values[pos]'
		return pos >= 0 ? this._valuesNN[pos] : defaultValue;
	}
	
	hasKey(key: K): boolean {
		return this._getKeyPosition(key) >= 0;
	}
	
	// Returns 'true' when a new key has been inserted
	setValue(
			key:   K,
			value: V): boolean {
		
		return this._setValue(key, value);
	}
	
	// If no destination array is passed, the value can be read using the
	// 'requestedValue' member immediatly after the invocation
	tryGetValue(
			key:  K,
			dst: (Array<V> | null) = null): boolean {
		
		this._pp.latestAccessPos = this._getKeyPosition(key);
		
		if(dst !== null)
			dst[0] = this.requestedValue;
		
		return this._pp.latestAccessPos >= 0;
	}
}