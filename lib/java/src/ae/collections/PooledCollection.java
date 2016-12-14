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
	
	protected final LinkedListNode<P> _freeNode(final LinkedListNode<P> node) {
		
		_size--;
		_nodePool.free(node);
		
		return node;
	}
	
	protected final LinkedListNode<P> _provideNode() {
		_size++;
		return _nodePool.provide();
	}
	
	public final int getSize() {
		return _size;
	}
	
	public final boolean isEmpty() {
		return _size == 0;
	}
}
