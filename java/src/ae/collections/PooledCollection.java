package ae.collections;

public abstract class PooledCollection<T, P> implements Iterable<T> {
	
	protected final ObjectPool<LinkedListNode<P>> _nodePool;
	
	protected int _size = 0;
	
	public final ObjectPool<LinkedListNode<P>> sharedNodePool;
	
	protected PooledCollection(
    		final ObjectPool<LinkedListNode<P>> nodePool,
    		final boolean                       poolSharing) {
		
		_nodePool      = nodePool;
		sharedNodePool = poolSharing ? nodePool : null;
	}
	
	public final int getSize() {
		
		return _size;
	}
	
	public final boolean isEmpty() {
		
		return _size == 0;
	}
}
