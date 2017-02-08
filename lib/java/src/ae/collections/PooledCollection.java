package ae.collections;

import java.util.Iterator;

public abstract class PooledCollection<T> implements Iterable<T> {
	
	protected int _size = 0;
	
	public final Iterable<T> reverse = () -> _getReverseIterator();
	
	protected abstract boolean _addSingle(final T element);
	
	// Doesn't need to be overridden if the standard clear method is overridden
	protected void _clear() {}
	
	protected abstract Iterator<T> _getReverseIterator();
	
	// True if the collection has changed somehow
	public final boolean addAll(final Iterable<T> src) {
		
		boolean changed = false;
		for(T i : src) if(_addSingle(i)) changed = true;
		
		return changed;
	}
	
	public boolean clear() {
		
		if(isEmpty()) {
			return false;
		} else {
			_clear();
			return true;
		}
	}
	
	@Override
	public void finalize() {
		clear();
	}
	
	// Can be overridden to provide an own definition for the size
	public int getSize() {
		return _size;
	}
	
	public boolean isEmpty() {
		return _size == 0;
	}
}
