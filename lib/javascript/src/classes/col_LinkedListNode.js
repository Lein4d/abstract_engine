
// ae.collections.LinkedListNode<T>
class AEClassLinkedListNode extends AEClassJavaObject {
	
	_pp: {
		prev:    ?ae.col.LinkedListNode;
		next:    ?ae.col.LinkedListNode;
		content: ?IObject;
	}
	
	// public constructor //////////////////////////////////////////////////////
	
	constructor(content: ?IObject = null) {
		
		super();
		
		this._pp = {
			prev:    null,
			next:    null,
			content: content
		}
		
		Object.freeze(this);
	}
	
	// public getters + setters ////////////////////////////////////////////////
	
	get prev(): ?ae.col.LinkedListNode {return this._pp.prev;}
	get next(): ?ae.col.LinkedListNode {return this._pp.next;}
	
	get content() : IObject {return this._pp.content;}
	
	set content(content: ?IObject) {this._pp.content = content;}
	
	// public methods //////////////////////////////////////////////////////////
	
	forEach(visitor: Visitor<ae.col.LinkedListNode>) {
		
		let node = this;
		
		while(node) {
			visitor(node);
			node = node.next;
		}
	}
	
	forEachRev(visitor: Visitor<ae.col.LinkedListNode>) {
		
		let node = this;
		
		while(node) {
			visitor(node);
			node = node.prev;
		}
	}
	
	insertAfter(node: ?ae.col.LinkedListNode): ae.col.LinkedListNode {
		
		if(!node) return this.resetListOnly();

		this._pp.prev = node;
		this._pp.next = node.next;
		node._pp.next = this;
		
		return this;
	}
	
	insertBefore(node: ?ae.col.LinkedListNode):
		ae.col.LinkedListNode {
		
		if(!node) return this.resetListOnly();
		
		this._pp.prev = node.prev;
		this._pp.next = node;
		node._pp.prev = this;
		
		return this;
	}
	
	remove(): ae.col.LinkedListNode {
		
		if(this.prev) this.prev._pp.next = this.next;
		if(this.next) this.next._pp.prev = this.prev;
		
		return this;
	}

	reset(): ae.col.LinkedListNode {
		
		this._pp.content              = null;
		this._pp.prev = this._pp.next = null;
		
		return this;
	}
	
	resetListOnly(): ae.col.LinkedListNode {
		this._pp.prev = this._pp.next = null;
		return this;
	}
}
