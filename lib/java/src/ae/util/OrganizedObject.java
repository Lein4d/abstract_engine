package ae.util;

import ae.collections.ObjectPool;
import ae.collections.PooledHashSet;

public abstract class OrganizedObject<T extends OrganizedObject<T>> {
	
	public interface Listener<T extends OrganizedObject<T>> {
		
		void onObjectChange(OrganizedObject<T> obj);
	}
	
	private ObjectPool.ListNode<T>     _poolNode  = null;
	private PooledHashSet<Listener<T>> _listeners = null;
	
	protected final void _propagateChange() {
		if(_listeners != null)
			for(Listener<T> i : _listeners) i.onObjectChange(this);
	}
	
	public final void addListener(final Listener<T> listener) {
		if(_listeners == null) _listeners = new PooledHashSet<>();
		_listeners.insert(listener);
	}
	
	public final ObjectPool.ListNode<T> getPoolNode() {
		return _poolNode;
	}
	
	public final void removeListener(final Listener<T> listener) {
		if(_listeners != null) _listeners.remove(listener);
	}
	
	public final void setPoolNode(final ObjectPool.ListNode<T> poolNode) {
		_poolNode = poolNode;
	}
}
