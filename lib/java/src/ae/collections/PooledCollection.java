package ae.collections;

public abstract class PooledCollection<T, P> implements Iterable<T> {
	
	private final ObjectPool<LinkedListNode<P>> _nodePool;
	
	// The size needs to be stored separately as the node pool may be shared
	// between multiple collections
	private int _size = 0;
	
	public final ObjectPool<LinkedListNode<P>> sharedNodePool;
	
	protected PooledCollection(
    		final ObjectPool<LinkedListNode<P>> nodePool,
    		final boolean                       poolSharing) {
		
		_nodePool      = nodePool;
		sharedNodePool = poolSharing ? nodePool : null;
	}
	
	// Doesn't need to be overridden if the standard clear method is overridden
	protected void _clear() {}
	
	protected final LinkedListNode<P> _freeNode(final LinkedListNode<P> node) {
		
		_size--;
		_nodePool.free(node);
		
		return node;
	}
	
	protected final LinkedListNode<P> _provideNode() {
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
