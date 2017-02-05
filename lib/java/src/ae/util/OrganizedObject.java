package ae.util;

import java.util.HashSet;
import java.util.Set;

import ae.collections.ObjectPool;

public abstract class OrganizedObject<T extends OrganizedObject<T>> {
	
	public interface Listener<T extends OrganizedObject<T>> {
		void onObjectChange(OrganizedObject<T> obj);
	}
	
	private ObjectPool.ListNode<T> _poolNode  = null;
	private Set<Listener<T>>       _listeners = null;
	
	protected final void _propagateChange() {
		if(_listeners != null)
			for(Listener<T> i : _listeners) i.onObjectChange(this);
	}
	
	public final void addListener(final Listener<T> listener) {
		
		if(_listeners == null) _listeners = new HashSet<>();
		_listeners.add(listener);
	}
	
	public void finalizePooled() {
		//_listeners.re
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
