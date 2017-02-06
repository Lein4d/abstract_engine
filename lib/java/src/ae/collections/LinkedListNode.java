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
	
	public static final ObjectPool<LinkedListNode<?>> POOL =
		new ObjectPool<LinkedListNode<?>>(() -> new LinkedListNode<>());
	
	public T content = null;
	
	LinkedListNode() {}
	
	LinkedListNode(final T content) {
		this.content = content;
	}
	
	final LinkedListNode<T> insertAfter(final LinkedListNode<T> node) {
		
		if(node == null) return resetListOnly();

		prev      = node;
		next      = node.next;
		node.next = this;
		
		return this;
	}
	
	final LinkedListNode<T> insertBefore(final LinkedListNode<T> node) {
		
		if(node == null) return resetListOnly();
		
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
	
	final LinkedListNode<T> resetListOnly() {
		prev = next = null;
		return this;
	}
	
	@Override
	public final void pooledInit() {
		super.pooledInit();
		resetListOnly();
	}
}
