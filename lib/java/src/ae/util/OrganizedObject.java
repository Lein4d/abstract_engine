package ae.util;

import java.util.function.Consumer;

import ae.collections.ObjectPool;
import ae.collections.PooledOrderedSet;

public abstract class OrganizedObject<This extends OrganizedObject<This>> {
	
	private static final ObjectPool<PooledOrderedSet<?>> _POS_POOL =
		new ObjectPool<PooledOrderedSet<?>>(() -> new PooledOrderedSet<>());
	
	@SuppressWarnings("unchecked")
	private final ObjectPool<PooledOrderedSet<Consumer<This>>> _pool =
		(ObjectPool<PooledOrderedSet<Consumer<This>>>)(Object)_POS_POOL;
	
	private ObjectPool.ListNode<This>        _poolNode  = null;
	private PooledOrderedSet<Consumer<This>> _listeners = null;
	
	@SuppressWarnings("unchecked")
	protected final void _propagateChange() {
		if(_listeners != null)
			for(Consumer<This> i : _listeners) i.accept((This)this);
	}
	
	public final void addListener(final Consumer<This> listener) {
		if(_listeners == null) _listeners = _pool.provide();
		_listeners.insertAtEnd(listener);
	}
	
	public final int getListenerCount() {
		return _listeners != null ? _listeners.getSize() : 0;
	}
	
	public final ObjectPool.ListNode<This> getPoolNode() {
		return _poolNode;
	}

	// Free resource like you would do in 'finalize()'
	// References should not be deleted as they may be used after freeing this
	// object
	public void pooledFinalize() {
		if(_listeners != null) _pool.free(_listeners);
	}
	
	// Initialize the members to make sure no references from its previous life
	// time are used
	public void pooledInit() {}
	
	public final void removeListener(final Consumer<This> listener) {
		if(_listeners != null) _listeners.remove(listener);
	}
	
	public final void setPoolNode(final ObjectPool.ListNode<This> poolNode) {
		_poolNode = poolNode;
	}
}
