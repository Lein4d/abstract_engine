package ae.collections;

import java.util.Iterator;
import java.util.NoSuchElementException;

public final class PooledLinkedList<T> extends PooledCollection<T, T> {
	
	private LinkedListNode<T> _first = null;
	private LinkedListNode<T> _last  = null;
	
	private final LinkedListNode<T> insert(
			final T element) {
		
		final LinkedListNode<T> node = _nodePool.provideObject();
		
		node.content = element;
		_size++;
		
		if(_size == 1) _first = _last = node;
		
		return node;
	}
	
	private final boolean remove(
			final LinkedListNode<T> node) {
		
		if(node == null) return false;
		
		node.remove();
		
		if(node == _first) _first = node.next;
		if(node == _last)  _last  = node.prev;
		
		_nodePool.free(node);
		_size--;
		
		return true;
	}

	public PooledLinkedList() {
		
		super(LinkedListNode.<T>createObjectPool(), false);
	}
	
	public PooledLinkedList(
			final ObjectPool<LinkedListNode<T>> nodePool,
			final boolean                       poolSharing) {
		
		super(nodePool, poolSharing);
	}
	
	public static final <T> ObjectPool<LinkedListNode<T>> createNodePool() {
		
		return LinkedListNode.<T>createObjectPool();
	}
	
	public final T getFirst() {
		
		if(isEmpty()) throw new NoSuchElementException();
		
		return _first.content;
	}

	public final T getLast() {

		if(isEmpty()) throw new NoSuchElementException();
		
		return _last.content;
	}
	
	public final void insertAtEnd(
			final T element) {
		
		final LinkedListNode<T> refNode = _last;
		
		_last = insert(element);
		
		if(_size > 1) _last.insertAfter(refNode);
	}
	
	public final void insertAtFront(
			final T element) {
		
		final LinkedListNode<T> refNode = _first;
		
		insert(element).insertAfter(refNode);
	}
	
	@Override
	public final Iterator<T> iterator() {
		
		// TODO: Hier wird ein neues Objekt angelegt
		return new LinkedListNode.NodeIteratorForward<T>(_first);
	}

	public final boolean removeAll() {
		
		if(isEmpty()) return false;
		/*
		_nodePool.reset();
		_first = _last = null;
		
		return true;
		*/
		throw new UnsupportedOperationException();
	}
	
	public final boolean removeAll(
			final T element) {
		
		LinkedListNode<T> node    = _first;
		final int         oldSize = _size;
		
		while(node != null) {
			if(node.content == element) remove(node);
			node = node.next;
		}
		
		return _size < oldSize;
	}

	public final boolean removeFirst() {
		
		return remove(_first);
	}
	
	public final boolean removeFirst(
			final T element) {
		
		LinkedListNode<T> node = _first;
		
		while(node != null) {
			if(node.content == element) return remove(node);
			node = node.next;
		}
		
		return false;
	}

	public final boolean removeLast() {
    	
		return remove(_last);
    }
	
	public final boolean removeLast(
    		final T element) {
    	
		LinkedListNode<T> node = _last;
		
		while(node != null) {
			if(node.content == element) return remove(node);
			node = node.prev;
		}
		
		return false;
    }
}
