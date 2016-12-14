package ae.collections;

import java.util.Iterator;
import java.util.NoSuchElementException;

public final class PooledLinkedList<T> extends PooledCollection<T, T> {
	
	private LinkedListNode<T> _first = null;
	private LinkedListNode<T> _last  = null;
	
	private final LinkedListNode<T> _insert(final T element) {
		
		final LinkedListNode<T> node = _provideNode();
		
		node.content = element;
		if(getSize() == 1) _first = _last = node;
		
		return node;
	}
	
	final LinkedListNode<T> insertAfter(
			final T                 element,
			final LinkedListNode<T> refNode) {
		
		final LinkedListNode<T> newNode = _insert(element);
		
		// Assume the list contains at least one element. Otherwise a reference
		// node cannot exist.
		newNode.insertAfter(refNode);
		if(refNode == _last) _last = newNode;
		
		return newNode;
	}
	
	final LinkedListNode<T> insertBefore(
    		final T                 element,
    		final LinkedListNode<T> refNode) {

		final LinkedListNode<T> newNode = _insert(element);
		
		// Assume the list contains at least one element. Otherwise a reference
		// node cannot exist.
		newNode.insertBefore(refNode);
		if(refNode == _first) _first = newNode;
		
		return newNode;
	}
	
	final boolean remove(final LinkedListNode<T> node) {
		
		if(node == null) return false;
		
		node.remove();
		
		if(node == _first) _first = node.next;
		if(node == _last)  _last  = node.prev;
		
		_freeNode(node);
		
		return true;
	}

	public PooledLinkedList() {
		this(LinkedListNode.<T>createObjectPool(), false);
	}
	
	public PooledLinkedList(
			final ObjectPool<LinkedListNode<T>> nodePool,
			final boolean                       poolSharing) {
		
		super(nodePool, poolSharing);
	}
	
	public PooledLinkedList(final Iterable<T> elements) {
		this(elements, LinkedListNode.<T>createObjectPool(), false);
	}
	
	public PooledLinkedList(
			final Iterable<T>                   elements,
			final ObjectPool<LinkedListNode<T>> nodePool,
			final boolean                       poolSharing) {
		
		super(LinkedListNode.<T>createObjectPool(), false);
		for(T i : elements) insertAtEnd(i);
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
	
	public final LinkedListNode<T> insertAtEnd(final T element) {
		
		if(isEmpty()) {
			_insert(element);
		} else {
			insertAfter(element, _last);
		}
		
		return _last;
	}
	
	public final LinkedListNode<T> insertAtFront(final T element) {
		
		if(isEmpty()) {
			_insert(element);
		} else {
			insertBefore(element, _first);
		}
		
		return _first;
	}
	
	@Override
	public final Iterator<T> iterator() {
		// TODO: Hier wird ein neues Objekt angelegt
		return new LinkedListNode.NodeIteratorForward<T>(_first);
	}

	public final boolean removeAll() {
		
		if(isEmpty()) return false;
		
		// Cannot reset the whole node pool, as there might be nodes used by
		// other collections
		LinkedListNode<T> node = _first;
		while(node != null) node = _freeNode(node).next;
		
		_first = _last = null;
		
		return true;
	}
	
	public final boolean removeAll(final T element) {
		
		LinkedListNode<T> node    = _first;
		final int         oldSize = getSize();
		
		while(node != null) {
			if(node.content == element) remove(node);
			node = node.next;
		}
		
		return getSize() < oldSize;
	}

	public final boolean removeFirst() {
		return remove(_first);
	}
	
	public final boolean removeFirst(final T element) {
		
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
	
	public final boolean removeLast(final T element) {
		
		LinkedListNode<T> node = _last;
		
		while(node != null) {
			if(node.content == element) return remove(node);
			node = node.prev;
		}
		
		return false;
	}
}
