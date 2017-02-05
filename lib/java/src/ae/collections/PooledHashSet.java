package ae.collections;

import java.util.Iterator;

public final class PooledHashSet<T> extends PooledCollection<T> {

	// Die Value-Komponente wird immer auf 'null' gesetzt
	private final PooledHashMap<T, Object> _hashMap;

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
		super(null);
		_hashMap = backend;
	}
	
	public final boolean clear() {
		return _hashMap.clear();
	}
	
	public final boolean exists(final T element) {
		return _hashMap.hasKey(element);
	}

	public final float getLoadFactor() {
		return _hashMap.getLoadFactor();
	}
	
	public final float getMaxLoadFactor() {
		return _hashMap.getMaxLoadFactor();
	}
	
	public final int getResizeFactor() {
		return _hashMap.getResizeFactor();
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

	public final void setMaxLoadFactor(final float maxLoadFactor) {
		_hashMap.setMaxLoadFactor(maxLoadFactor);
	}
	
	public final void setResizeFactor(final int resizeFactor) {
		_hashMap.setResizeFactor(resizeFactor);
	}

	@Override
	public Iterator<T> iterator() {
		return _hashMap.keys.iterator();
	}
}
