package ae.collections;

import ae.util.OrganizedObject;

public class LinkedListNode<T> extends OrganizedObject<LinkedListNode<T>> {
	
	static final class NodeIteratorForward<T> extends NodeIterator<T> {

		public NodeIteratorForward(final LinkedListNode<T> node) {
			super(node);
		}

		@Override
		protected final void _moveToNextNode() {
			_node = _node.next;
		}
	}

	static final class NodeIteratorReverse<T> extends NodeIterator<T> {

		public NodeIteratorReverse(final LinkedListNode<T> node) {
			super(node);
		}

		@Override
		protected final void _moveToNextNode() {
			_node = _node.prev;
		}
	}
	
	LinkedListNode<T> prev = null;
	LinkedListNode<T> next = null;
	
	public T content = null;

	// Note: linked list nodes will have uninitialized content
	public static final <T> ObjectPool<LinkedListNode<T>> createObjectPool() {
		return new ObjectPool<LinkedListNode<T>>(() -> new LinkedListNode<>());
	}
	
	LinkedListNode() {}
	
	LinkedListNode(final T content) {
		this.content = content;
	}
	
	final LinkedListNode<T> insertAfter(final LinkedListNode<T> node) {
		
		if(node == null) return resetList();

		prev      = node;
		next      = node.next;
		node.next = this;
		
		return this;
	}
	
	final LinkedListNode<T> insertBefore(final LinkedListNode<T> node) {
		
		if(node == null) return resetList();
		
		prev      = node.prev;
		next      = node;
		node.prev = this;
		
		return this;
	}
	
	final LinkedListNode<T> remove() {
		
		if(prev != null) prev.next = next;
		if(next != null) next.prev = prev;
		
		return this;
	}

	final LinkedListNode<T> reset() {
		
		content     = null;
		prev = next = null;
		
		return this;
	}
	
	final LinkedListNode<T> resetContent() {
		content = null;
		return this;
	}
	
	final LinkedListNode<T> resetList() {
		prev = next = null;
		return this;
	}
}
