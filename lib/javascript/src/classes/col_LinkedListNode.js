
// ae.collections.LinkedListNode<T>
class AEClassLinkedListNode extends AEClassJavaObject {
	
	_pp: {
		prev:    (ae.col.LinkedListNode | null);
		next:    (ae.col.LinkedListNode | null);
		content: (IObject               | null);
	}
	
	// public constructor //////////////////////////////////////////////////////
	
	constructor(content: (IObject | null) = null) {
		
		super();
		
		this._pp = {
			prev:    null,
			next:    null,
			content: content,
		};
		
		Object.freeze(this);
	}
	
	// public getters + setters ////////////////////////////////////////////////
	
	get prev(): (ae.col.LinkedListNode | null) {return this._pp.prev;}
	get next(): (ae.col.LinkedListNode | null) {return this._pp.next;}
	
	get content() : (IObject | null) {return this._pp.content;}
	
	set content(content: (IObject | null)) {this._pp.content = content;}
	
	// public methods //////////////////////////////////////////////////////////
	
	forEach(visitor: Visitor<ae.col.LinkedListNode>) {
		
		let node = this;
		
		while(node !== null) {
			visitor(node);
			node = node.next;
		}
	}
	
	forEachRev(visitor: Visitor<ae.col.LinkedListNode>) {
		
		let node = this;
		
		while(node !== null) {
			visitor(node);
			node = node.prev;
		}
	}
	
	insertAfter(node: (ae.col.LinkedListNode | null)): this {
		
		if(node === null) return this.resetListOnly();

		this._pp.prev = node;
		this._pp.next = node.next;
		node._pp.next = this;
		
		return this;
	}
	
	insertBefore(node: (ae.col.LinkedListNode | null)): this {
		
		if(node === null) return this.resetListOnly();
		
		this._pp.prev = node.prev;
		this._pp.next = node;
		node._pp.prev = this;
		
		return this;
	}
	
	remove(): this {
		
		if(this.prev !== null) this.prev._pp.next = this.next;
		if(this.next !== null) this.next._pp.prev = this.prev;
		
		return this;
	}

	reset(): this {
		
		this._pp.content              = null;
		this._pp.prev = this._pp.next = null;
		
		return this;
	}
	
	resetListOnly(): this {
		this._pp.prev = this._pp.next = null;
		return this;
	}
}
