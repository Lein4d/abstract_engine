package ae.collections;

public final class PooledHashSet<T> {

	// Die Value-Komponente wird immer auf 'null' gesetzt
	private final PooledHashMap<T, Object> _hashMap = new PooledHashMap<>();
	
	public final boolean exists(
			final T element) {
		
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
	
	public final boolean insert(
			final T element) {
		
		return _hashMap.setValue(element, null);
	}
	
	public final boolean remove(
			final T element) {
		
		return _hashMap.deleteKey(element);
	}

	public final void setMaxLoadFactor(
			final float maxLoadFactor) {
		
		_hashMap.setMaxLoadFactor(maxLoadFactor);
	}
	
	public final void setResizeFactor(
			final int resizeFactor) {
		
		_hashMap.setResizeFactor(resizeFactor);
	}
}
