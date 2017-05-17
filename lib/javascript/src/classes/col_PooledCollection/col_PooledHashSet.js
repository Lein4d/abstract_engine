
// ae.collections.PooledHashSet
class AEClassPooledHashSet<T: ae.JavaObject> extends AEClassPooledCollection<T> {
	
	// The value-component is always set to 'null'
	_hashMap: ae.col.PooledHashMap<T, IObject>;
	
	maxLoadFactor: number;
	resizeFactor:  number;
	
	_addSingle(element: T): boolean {
		return this.insert(element);
	}
	
	constructor(backend: (ae.col.PooledHashMap<T, IObject> | null) = null) {
		
		super();
		
		this._hashMap      =
			backend !== null ? backend : new AEClassPooledHashMap();
		this.maxLoadFactor = this._hashMap.maxLoadFactor;
		this.resizeFactor  = this._hashMap.resizeFactor;
		
		Object.freeze(this);
	}
	
	get empty     (): boolean {return this._hashMap.empty;}
	get loadFactor(): number  {return this._hashMap.loadFactor;}
	get size      (): number  {return this._hashMap.size;}
	
	clear(): boolean {
		return this._hashMap.clear();
	}
	
	exists(element: T): boolean {
		return this._hashMap.hasKey(element);
	}

	forEach(visitor: Visitor<T>): void {
		this._hashMap.keys.forEach(visitor);
	}
	
	insert(element: T): boolean {
		return this._hashMap.setValue(element, null);
	}

	remove(element: T): boolean {
		return this._hashMap.deleteKey(element);
	}
}