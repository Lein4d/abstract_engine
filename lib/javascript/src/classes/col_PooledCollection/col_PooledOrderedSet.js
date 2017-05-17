
// ae.collections.PooledOrderedSet
class AEClassPooledOrderedSet<T: ae.JavaObject> extends AEClassPooledCollection<T> {
	
	_hashMap: ae.col.PooledHashMap<T, ae.col.LinkedListNode>;
	_list:    ae.col.PooledLinkedList<T>;
	
	maxLoadFactor: number;
	resizeFactor:  number;
	
	// private methods /////////////////////////////////////////////////////////
	
	// returns 'true' if removal took place
	_removeIfNecessary(element: T): boolean {
		
		const exists = this._hashMap.tryGetValue(element);
		
		if(exists) this._list._remove(this._hashMap.requestedValue);
		return exists;
	}
	
	// protected methods ///////////////////////////////////////////////////////
	
	_addSingle(element: T): boolean {
		return this.insertAtEnd(element);
	}
	
	// public constructor //////////////////////////////////////////////////////
	
	constructor(
			backendSet:  ae.col.PooledHashMap<T, ae.col.LinkedListNode> =
				new AEClassPooledHashMap(),
			backendList: ae.col.PooledLinkedList<T>                     =
				new AEClassPooledLinkedList()) {
		
		super();
		
		this._hashMap      = backendSet;
		this._list         = backendList;
		this.maxLoadFactor = backendSet.maxLoadFactor;
		this.resizeFactor  = backendSet.resizeFactor;
		
		Object.freeze(this);
	}
	
	// public getters + setters ////////////////////////////////////////////////
	
	get empty     (): boolean {return this._list   .empty;}
	get loadFactor(): number  {return this._hashMap.loadFactor;}
	get size      (): number  {return this._list   .size;}
	
	// public methods //////////////////////////////////////////////////////////
	
	clear(): boolean {
		this._hashMap.clear();
		return this._list.clear();
	}
	
	exists(element: T): boolean {
		return this._hashMap.hasKey(element);
	}
	
	forEach(visitor: Visitor<T>) {
		this._list.forEach(visitor);
	}
	
	forEachRev(visitor: Visitor<T>) {
		this._list.forEachRev(visitor);
	}
	
	insertAfter(
			element:    T,
			refElement: T): boolean {
		
		const replace = this._removeIfNecessary(element);
		
		this._hashMap.setValue(
			element,
			this._list._insertAfter(
				element, this._hashMap.getValueA(refElement)));
		
		return !replace;
	}

	insertAtEnd(element: T): boolean {
		
		const replace = this._removeIfNecessary(element);
		
		this._hashMap.setValue(element, this._list.insertAtEnd(element));
		return !replace;
	}

	insertAtFront(element: T): boolean {
		
		const replace = this._removeIfNecessary(element);
		
		this._hashMap.setValue(element, this._list.insertAtFront(element));
		return !replace;
	}

	insertBefore(
			element:    T,
			refElement: T): boolean {
		
		const replace = this._removeIfNecessary(element);
		
		this._hashMap.setValue(
			element,
			this._list._insertBefore(
				element, this._hashMap.getValueA(refElement)));
		
		return !replace;
	}

	remove(element: T): boolean {
		
		const exists = this._hashMap.tryGetValue(element);
		
		if(exists) {
			this._hashMap.deleteKey(element);
			this._list   ._remove  (this._hashMap.requestedValue);
		}
		
		return exists;
	}
	
	tryInsertAfter(
			element:    T,
			refElement: T): boolean {
		
		if(!this._hashMap.hasKey(element)) {
			this._hashMap.setValue(
				element,
				this._list._insertAfter(
					element, this._hashMap.getValueA(refElement)));
			return true;
		} else {
			return false;
		}
	}
	
	tryInsertAtEnd(element: T): boolean {
		
		if(!this._hashMap.hasKey(element)) {
			this._hashMap.setValue(element, this._list.insertAtEnd(element));
			return true;
		} else {
			return false;
		}
	}

	tryInsertAtFront(element: T): boolean {
		
		if(!this._hashMap.hasKey(element)) {
			this._hashMap.setValue(element, this._list.insertAtFront(element));
			return true;
		} else {
			return false;
		}
	}
	
	tryInsertBefore(
			element:    T,
			refElement: T): boolean {
		
		if(!this._hashMap.hasKey(element)) {
			this._hashMap.setValue(
				element,
				this._list._insertBefore(
					element, this._hashMap.getValueA(refElement)));
			return true;
		} else {
			return false;
		}
	}
}
