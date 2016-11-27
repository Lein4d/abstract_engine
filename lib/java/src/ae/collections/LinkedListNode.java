package ae.collections;

import java.util.Iterator;
import java.util.NoSuchElementException;

import ae.util.OrganizedObject;

public class LinkedListNode<T> extends OrganizedObject<LinkedListNode<T>> {
	
	static abstract class NodeIterator<T> implements Iterator<T> {
		
		protected LinkedListNode<T> _node;
		
		protected NodeIterator(final LinkedListNode<T> node) {
			_node = node;
		}

		protected abstract void moveToNext();
		
		@Override
		public final boolean hasNext() {
			return _node != null;
		}

		@Override
		public final T next() {
			
			if(!hasNext()) throw new NoSuchElementException();
			
			final T result = _node.content;
			moveToNext();
			
			return result;
		}
	}
	
	static final class NodeIteratorForward<T> extends NodeIterator<T> {

		public NodeIteratorForward(final LinkedListNode<T> node) {
			super(node);
		}

		@Override
		protected final void moveToNext() {
			_node = _node.next;
		}
	}

	static final class NodeIteratorReverse<T> extends NodeIterator<T> {

		public NodeIteratorReverse(final LinkedListNode<T> node) {
			super(node);
		}

		@Override
		protected final void moveToNext() {
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
