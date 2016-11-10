package ae.util;

import ae.collections.ObjectPool;

public abstract class OrganizedObject<T extends OrganizedObject<T>> {
	
	private ObjectPool.ListNode<T> _poolNode;
	private MonitoredObject<T>     _objectMonitor;
	
	protected final void propagateChange() {
		
		if(_objectMonitor != null) _objectMonitor.notifyChange();
	}
	
	public final MonitoredObject<T> getObjectMonitor() {
		
		return _objectMonitor;
	}
	
	public final ObjectPool.ListNode<T> getPoolNode() {
		
		return _poolNode;
	}
	
	public final void setObjectMonitor(
			final MonitoredObject<T> objectMonitor) {
		
		_objectMonitor = objectMonitor;
	}
	
	public final void setPoolNode(
			final ObjectPool.ListNode<T> poolNode) {
		
		_poolNode = poolNode;
	}
}
