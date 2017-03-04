
class AEClassPooledQueue<T> {
	
	_list: AEClassPooledLinkedList<T>;
	
	constructor() {
		this._list = new AEClassPooledLinkedList();
		Object.freeze(this);
	}
	
	get hasNext(): boolean {return !this._list.empty;}
	get next(): ?T {return this._list.first;}
	
	pop(): ?T {
		
		const element = this._list.first;
		
		this._list.removeFirstA();
		return element;
	}
	
	push(element: ?T): void {
		this._list.insertAtEnd(element);
	}
}