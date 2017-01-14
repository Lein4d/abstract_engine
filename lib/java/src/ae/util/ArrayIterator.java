package ae.util;

import java.util.Iterator;
import java.util.NoSuchElementException;

public final class ArrayIterator<T> implements Iterator<T> {

	private final T[] _array;
	private       int _pos = 0;
	
	public ArrayIterator(final T[] array) {
		_array = array;
	}
	
	@Override
	public boolean hasNext() {
		return _pos < _array.length;
	}

	@Override
	public T next() {
		if(!hasNext()) throw new NoSuchElementException();
		return _array[_pos++];
	}
}
