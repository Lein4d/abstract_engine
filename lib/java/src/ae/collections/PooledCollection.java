package ae.collections;

import java.util.Iterator;

public abstract class PooledCollection<T> implements Iterable<T> {
	
	private final ObjectPool<LinkedListNode<T>> _nodePool;
	
	// The size needs to be stored separately as the node pool may be shared
	// between multiple collections
	private int _size = 0;
	
	public final Iterable<T>                   reverse;
	public final ObjectPool<LinkedListNode<T>> sharedNodePool;
	
	protected PooledCollection(
    		final ObjectPool<LinkedListNode<T>> nodePool,
    		final boolean                       poolSharing) {
		
		this._nodePool      = nodePool;
		this.reverse        = () -> _getReverseIterator();
		this.sharedNodePool = poolSharing ? nodePool : null;
	}
	
	// Doesn't need to be overridden if the standard clear method is overridden
	protected void _clear() {}
	
	protected final LinkedListNode<T> _freeNode(final LinkedListNode<T> node) {
		
		_size--;
		_nodePool.free(node);
		
		return node;
	}
	
	protected abstract Iterator<T> _getReverseIterator();
	
	protected final LinkedListNode<T> _provideNode() {
		_size++;
		return _nodePool.provide();
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
