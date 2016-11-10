package ae.collections;

import java.util.Iterator;
import java.util.NoSuchElementException;

import ae.util.OrganizedObject;

public class LinkedListNode<T> extends OrganizedObject<LinkedListNode<T>> {
	
	public static abstract class NodeIterator<T> implements Iterator<T> {
		
		protected LinkedListNode<T> _node;
		
		protected NodeIterator(
				final LinkedListNode<T> node) {
			
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
	
	public static final class NodeIteratorForward<T> extends NodeIterator<T> {

		public NodeIteratorForward(
				final LinkedListNode<T> node) {
			
			super(node);
		}

		@Override
		protected final void moveToNext() {
			
			_node = _node.next;
		}
	}

	public static final class NodeIteratorReverse<T> extends NodeIterator<T> {

		public NodeIteratorReverse(
				final LinkedListNode<T> node) {
			
			super(node);
		}

		@Override
		protected final void moveToNext() {
			
			_node = _node.prev;
		}
	}
	
	public T                 content = null;
	public LinkedListNode<T> prev    = null;
	public LinkedListNode<T> next    = null;

	// Note: linked list nodes will have uninitialized content
	public static final <T> ObjectPool<LinkedListNode<T>> createObjectPool() {
		
		return new ObjectPool<LinkedListNode<T>>(() -> new LinkedListNode<>());
	}
	
	public LinkedListNode() {}
	
	public LinkedListNode(
			final T content) {
		
		this.content = content;
	}
	
	public final LinkedListNode<T> insertAfter(
			final LinkedListNode<T> node) {
		
		if(node == null) return resetList();

		prev      = node;
		next      = node.next;
		node.next = this;
		
		return this;
	}
	
	public final LinkedListNode<T> insertBefore(
			final LinkedListNode<T> node) {
		
		if(node == null) return resetList();
		
		prev      = node.prev;
		next      = node;
		node.prev = this;
		
		return this;
	}
	
	public final LinkedListNode<T> remove() {
		
		if(prev != null) prev.next = next;
		if(next != null) next.prev = prev;
		
		return this;
	}

	public final LinkedListNode<T> reset() {
		
		content     = null;
		prev = next = null;
		
		return this;
	}
	
	public final LinkedListNode<T> resetContent() {
		
		content = null;
		
		return this;
	}
	
	public final LinkedListNode<T> resetList() {
		
		prev = next = null;
		
		return this;
	}
}
