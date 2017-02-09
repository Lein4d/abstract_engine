package ae.collections;

import java.util.Iterator;
import java.util.NoSuchElementException;
import java.util.function.Consumer;
import java.util.function.Supplier;

public final class GrowingPool<T> extends Pool<T> implements Iterable<T> {
	
	private final class PoolIterator implements Iterator<T> {

		private int _pos = 0;
		
		@Override
		public final boolean hasNext() {
			return _pos < _freePos;
		}

		@Override
		@SuppressWarnings("unchecked")
		public final T next() {
			if(!hasNext()) throw new NoSuchElementException();
			return (T)_pool[_pos++];
		}
	}
	
	private Object[] _pool;
	private int      _freePos     = 0;
	private int      _objectCount = 0;
	
	public GrowingPool(
    		final Supplier<T> creator,
    		final Consumer<T> preparator,
    		final Consumer<T> finalizer) {
		
		this(64, creator, preparator, finalizer);
	}
	
	public GrowingPool(
			final int         initialCapacity,
			final Supplier<T> creator,
			final Consumer<T> preparator,
			final Consumer<T> finalizer) {
		
		super(creator, preparator, finalizer);
		this._pool = new Object[initialCapacity];
	}
	
	@Override
	public final int getCapacity() {
		return _pool.length;
	}

	@Override
	public final int getUnusedObjectCount() {
		return _objectCount - getUsedObjectCount();
	}

	@Override
	public final int getUsedObjectCount() {
		return _freePos;
	}

	@Override
	public final Iterator<T> iterator() {
		return new PoolIterator();
	}

	@Override
	public final T provide() {
		
		// Check whether there are free slots left and resize if not
		if(_freePos == _pool.length) {
			
			final Object[] oldPool = _pool;
			_pool                  = new Object[2 * oldPool.length];
			
			// Copy the old elements to the new pool array
			for(int i = 0; i < oldPool.length; i++) _pool[i] = oldPool[i];
		}
		
		// Ensure the current slot contains an object
		if(_pool[_freePos] == null) {
			_pool[_freePos] = _create();
			_objectCount++;
		}
		
		return _prepare(_pool[_freePos++]);
	}
	
	@Override
	public final void reset() {
		for(Object i : _pool) if(i != null) _finalize(i);
		_freePos = 0;
	}
}
