
class AEClassPooledLinkedList<T> extends AEClassPooledCollection<T> {
	
	_pp: {
		first: ?ae.col.LinkedListNode;
		last:  ?ae.col.LinkedListNode;
	}
	
	// private getters + setters ///////////////////////////////////////////////
	
	get _first(): ?ae.col.LinkedListNode {return this._pp.first;}
	get _last (): ?ae.col.LinkedListNode {return this._pp.last;}
	
	// private methods /////////////////////////////////////////////////////////
	
	_insert(element: ?T): ae.col.LinkedListNode {
		
		const node = ae.col._p.LL_NODE_POOL.provide();
		
		node.content = element;
		
		this._p.size++;
		if(this.size == 1) this._pp.first = this._pp.last = node;
		
		return node;
	}
	
	// protected methods ///////////////////////////////////////////////////////
	
	_addSingle(element: ?T): boolean {
		this.insertAtEnd(element);
		return true;
	}
	
	_clear(): void {
		
		// Cannot reset the whole node pool, as there might be nodes used by
		// other collections
		let node = this._first;
		while(node) {
			ae.col._p.LL_NODE_POOL.free(node);
			node = node.next;
		}
		
		this._pp.first = this._pp.last = null;
		this._p. size  = 0;
	}
	
	// internal methods ////////////////////////////////////////////////////////
	
	_insertAfter(
			element: ?T,
			refNode: ae.col.LinkedListNode): ae.col.LinkedListNode {
		
		const newNode = this._insert(element);
		
		// Assume the list contains at least one element. Otherwise a reference
		// node cannot exist.
		newNode.insertAfter(refNode);
		if(refNode == this._last) this._pp.last = newNode;
		
		return newNode;
	}
	
	_insertBefore(
    		element: ?T,
    		refNode: ae.col.LinkedListNode): ae.col.LinkedListNode {

		const newNode = this._insert(element);
		
		// Assume the list contains at least one element. Otherwise a reference
		// node cannot exist.
		newNode.insertBefore(refNode);
		if(refNode == this._first) this._pp.first = newNode;
		
		return newNode;
	}
	
	_remove(node: ?ae.col.LinkedListNode): boolean {
		
		if(!node) return false;
		
		node.remove();
		
		if(node == this._first) this._pp.first = node.next;
		if(node == this._last)  this._pp.last  = node.prev;
		
		ae.col._p.LL_NODE_POOL.free(node);
		this._p.size--;
		
		return true;
	}
	
	// public constructor //////////////////////////////////////////////////////
	
	constructor() {
		
		super();
		
		this._pp = {
			first: null,
			last:  null
		}
		
		Object.freeze(this);
	}
	
	// public getters + setters ////////////////////////////////////////////////
	
	get first(): ?T {
		
		if(this.empty) throw "List is empty";
		
		// $CORRECT_CAST
		return this._first ? this._first.content : null;
	}
	
	get last(): ?T {
		
		if(this.empty) throw "List is empty";
		
		// $CORRECT_CAST
		return this._last  ? this._last .content : null;
	}
	
	// public methods //////////////////////////////////////////////////////////
	
	finalize(): void {
		this._clear();
	}
	
	forEach(visitor: Visitor<T>): void {
		// $NOT_NULL + CORRECT_CAST
		if(!this.empty) this._first.forEach((node) => visitor(node.content));
	}
	
	forEachRev(visitor: Visitor<T>): void {
		// $NOT_NULL + CORRECT_CAST
		if(!this.empty) this._last.forEachRev((node) => visitor(node.content));
	}
	
	insertAtEnd(element: ?T): ae.col.LinkedListNode {
		
		if(this.empty) {
			this._insert(element);
		} else {
			// $NOT_NULL
			this._insertAfter(element, this._last);
		}
		
		// $NOT_NULL
		return this._last;
	}
	
	insertAtFront(element: ?T): ae.col.LinkedListNode {
		
		if(this.empty) {
			this._insert(element);
		} else {
			// $NOT_NULL
			this._insertBefore(element, this._first);
		}
		
		// $NOT_NULL
		return this._first;
	}
	
	removeAll(element: ?T): boolean {
		
		let   node    = this._first;
		const oldSize = this.size;
		
		while(node) {
			if(node.content == element) this._remove(node);
			node = node.next;
		}
		
		return this.size < oldSize;
	}

	removeFirstA(): boolean {
		return this._remove(this._first);
	}
	
	removeFirstB(element: ?T): boolean {
		
		let node = this._first;
		
		while(node) {
			if(node.content == element) return this._remove(node);
			node = node.next;
		}
		
		return false;
	}

	removeLastA(): boolean {
		return this._remove(this._last);
	}
	
	removeLastB(element: ?T): boolean {
		
		let node = this._last;
		
		while(node) {
			if(node.content == element) return this._remove(node);
			node = node.prev;
		}
		
		return false;
	}
}
