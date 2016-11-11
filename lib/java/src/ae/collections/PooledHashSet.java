package ae.collections;

import java.util.Iterator;

public final class PooledHashSet<T> extends PooledCollection<T, T> {

	private final class ElementIterator implements Iterator<T> {
		
		private final Iterator<PooledHashMap.KeyValuePair<T, Object>> _it =
			_hashMap.iterator();
		
		@Override
		public final boolean hasNext() {
			return _it.hasNext();
		}

		@Override
		public final T next() {
			return _it.next().getKey();
		}
	}
	
	// Die Value-Komponente wird immer auf 'null' gesetzt
	private final PooledHashMap<T, Object> _hashMap;
	
	public PooledHashSet() {
		this(new PooledHashMap<>());
	}
	
	public PooledHashSet(final PooledHashMap<T, Object> backend) {
		super(null, false);
		_hashMap = backend;
	}
	
	public PooledHashSet(final Iterable<T> elements){
		this(elements, new PooledHashMap<>());
	}
	
	public PooledHashSet(
			final Iterable<T>              elements,
			final PooledHashMap<T, Object> backend) {
		
		super(null, false);
		
		_hashMap = backend;
		for(T i : elements) insert(i);
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
	
	public final boolean insert(final T element) {
		return _hashMap.setValue(element, null);
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

		// TODO: Hier wird ein neues Objekt angelegt
		return new ElementIterator();
	}
}
