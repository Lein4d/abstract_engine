package ae.collections;

import java.util.Iterator;

public abstract class PooledCollection<T> implements Iterable<T> {
	
	// The size needs to be stored separately as the node pool may be shared
	// between multiple collections
	private int _size = 0;

	public final ObjectPool<LinkedListNode<T>> nodePool;
	public final Iterable<T>                   reverse;
	
	protected PooledCollection(final ObjectPool<LinkedListNode<T>> nodePool) {
		this.nodePool = nodePool;
		this.reverse  = () -> _getReverseIterator();
	}
	
	protected abstract boolean _addSingle(final T element);
	
	// Doesn't need to be overridden if the standard clear method is overridden
	protected void _clear() {}
	
	protected final LinkedListNode<T> _freeNode(final LinkedListNode<T> node) {
		
		_size--;
		nodePool.free(node);
		
		return node;
	}
	
	protected abstract Iterator<T> _getReverseIterator();
	
	protected final LinkedListNode<T> _provideNode() {
		_size++;
		return nodePool.provide();
	}
	
	// True if the collection has changed somehow
	public final boolean addAll(final Iterable<T> src) {
		
		boolean changed = false;
		
		for(T i : src) if(_addSingle(i)) changed = true;
		return changed;
	}
	
	public boolean clear() {
		
		if(isEmpty()) {
			return false;
		} else {
			_clear();
			return true;
		}
	}
	
	public int getSize() {
		return _size;
	}
	
	public boolean isEmpty() {
		return getSize() == 0;
	}
}
