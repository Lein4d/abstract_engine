package ae.collections;

import java.util.Iterator;

public final class PooledHashSet<T> extends PooledCollection<T> {

	// The value-component is always set to 'null'
	private final PooledHashMap<T, Object> _hashMap;

	public final double maxLoadFactor;
	public final int    resizeFactor;
	
	@Override
	protected final boolean _addSingle(final T element) {
		return insert(element);
	}
	
	@Override
	protected final Iterator<T> _getReverseIterator() {
		return _hashMap.keys.iterator();
	}
	
	public PooledHashSet() {
		this(new PooledHashMap<>());
	}
	
	public PooledHashSet(final PooledHashMap<T, Object> backend) {
		_hashMap      = backend;
		maxLoadFactor = backend.maxLoadFactor;
		resizeFactor  = backend.resizeFactor;
	}
	
	@Override
	public final boolean clear() {
		return _hashMap.clear();
	}
	
	public final boolean exists(final T element) {
		return _hashMap.hasKey(element);
	}

	public final double getLoadFactor() {
		return _hashMap.getLoadFactor();
	}
	
	@Override
	public final int getSize() {
		return _hashMap.getSize();
	}
	
	public final boolean insert(final T element) {
		return _hashMap.setValue(element, null);
	}

	@Override
	public final boolean isEmpty() {
		return _hashMap.isEmpty();
	}
	
	public final boolean remove(final T element) {
		return _hashMap.deleteKey(element);
	}

	@Override
	public Iterator<T> iterator() {
		return _hashMap.keys.iterator();
	}
}
