package ae.collections;

import java.util.Iterator;
import java.util.NoSuchElementException;

public final class PooledHashMap<K, V>
	extends PooledCollection<PooledHashMap.KeyValuePair<K, V>> {
	
	private abstract class HmIterator<T> implements Iterator<T> {
		
		private int _pos = -1;
		
		protected HmIterator() {
			_moveToNext();
		}
		
		private final void _moveToNext() {
			while(++_pos < _keys.length && _keys[_pos] == null) {}
		}

		protected abstract T _getValue(final int pos);
		
		@Override
		public final boolean hasNext() {
			return _pos < _keys.length;
		}
		
		@Override
		public final T next() {
			
			if(!hasNext()) throw new NoSuchElementException();
			
			final T result = _getValue(_pos);
			_moveToNext();
			
			return result;
		}
	}

	private final class KeyIterator extends HmIterator<K> {
		@SuppressWarnings("unchecked")
		protected final K _getValue(final int pos) {
			return (K)_keys[pos];
		}
	}

	private final class KvpIterator extends HmIterator<KeyValuePair<K, V>> {
		
		private KeyValuePair<K, V> _kvp = null;
		
		@SuppressWarnings("unchecked")
		protected final KeyValuePair<K, V> _getValue(final int pos) {
			
			if(_kvp == null || _kvp._keepReference)
				_kvp = (KeyValuePair<K, V>)_KVP_POOL.provide();
			
			_kvp.key   = (K)_keys  [pos];
			_kvp.value = (V)_values[pos];
			
			return _kvp;
		}
		
		@Override
		public final void finalize() {
			if(_kvp != null && !_kvp._keepReference) _KVP_POOL.free(_kvp);
		}
	}

	private final class ValueIterator extends HmIterator<V> {
		@SuppressWarnings("unchecked")
		protected final V _getValue(final int pos) {
			return (V)_values[pos];
		}
	}

	public static final class KeyValuePair<K, V> {
		
		private boolean _keepReference = false;
		
		public K key;
		public V value;
		
		public final KeyValuePair<K, V> freeReference() {
			if(_keepReference) _KVP_POOL.free(this);
			return this;
		}
		
		public final KeyValuePair<K, V> keepReference() {
			_keepReference = true;
			return this;
		}
	}
	
	private static final DynamicPool<KeyValuePair<?, ?>> _KVP_POOL =
		new DynamicPool<>(true, () -> new KeyValuePair<>(), null, null);
	
	private Object [] _keys;
	private Object [] _values;
	private boolean[] _used;
	@SuppressWarnings("unused")
	private int       _usedCount;
	
	public final double maxLoadFactor;
	public final int    resizeFactor;
	
	public final Iterable<K> keys   = () -> new KeyIterator();
	public final Iterable<V> values = () -> new ValueIterator();
	
	private final boolean _areKeysEqual(
			final Object key1,
			final Object key2) {
		
		return key1 == null || key2 == null ? key1 == key2 : key1.equals(key2);
	}
	
	private final void _createArrays(final int size) {
		_keys      = new Object [size];
		_values    = new Object [size];
		_used      = new boolean[size];
		_size      = 0;
		_usedCount = 0;
	}
	
	private final int _getInitialPosition(final Object key) {
		return (key.hashCode() & 0x7FFFFFFF) % _keys.length;
	}
	
	private final int _getKeyPosition(final Object key) {
		
		int pos    = _getInitialPosition(key);
		int newPos = -1;
		
		// Find the position of the key
		while(_used[pos] && !_areKeysEqual(key, _keys[pos])) {
			
			// If there's a slot, marked as 'used' but without a key-value-pair,
			// it is stored to optimize the key position later on
			if(_keys[pos] == null && newPos == -1) newPos = pos;
			
			pos = (pos + 1) % _keys.length;
		}
		
		// Abort if the key couldn't be found
		if(!_used[pos]) return -1;
		
		// Abort if the position is already the optimal position
		if(newPos == -1) return pos;
		
		// Copy the key-value-pair to a better position
		_keys  [newPos] = _keys  [pos];
		_values[newPos] = _values[pos];
		
		final int nextPos = (pos + 1) % _keys.length;
		
		// If the slot after the current position is not marked as 'used', the
		// mark can also be removed from the current one, so subsequent
		// attempts finding a key will be faster
		if(!_used[nextPos]) _used[pos] = false;
		
		return newPos;
	}
	
	private final double _getLoadFactor(final double size) {
		return size / _keys.length;
	}

	@Override
	protected final boolean _addSingle(final KeyValuePair<K, V> element) {
		return setValue(element.key, element.value);
	}
	
	@Override
	protected final void _clear() {
		
		for(int i = 0; i < _keys.length; i++) {
			_keys[i] = _values[i] = null;
			_used[i] = false;
		}
		
		_size = _usedCount = 0;
	}

	@Override
	protected final Iterator<KeyValuePair<K, V>> _getReverseIterator() {
		return new KvpIterator();
	}
	
	private final boolean _setValue(
    		final Object key,
    		final Object value) {
    	
		if(key == null) return false;
		
    	int pos = _getInitialPosition(key);
    
    	// Search an empty slot
    	while(_keys[pos] != null && !_areKeysEqual(key, _keys[pos]))
    		pos = (pos + 1) % _keys.length;
    	
    	if(_keys[pos] != null) {
    		_values[pos] = value;
    		return false;
    	}
    	
    	if(_getLoadFactor(_size + 1) > maxLoadFactor) {
    		
    		final Object[] oldKeys   = _keys;
    		final Object[] oldValues = _values;
    		
    		_createArrays(_keys.length * resizeFactor);
    		
    		for(int i = 0; i < oldKeys.length; i++)
    			_setValue(oldKeys[i], oldValues[i]);
    		
    		_setValue(key, value);
    		
    	} else {
    		
    		_keys  [pos] = key;
    		_values[pos] = value;
    		_used  [pos] = true;
    		_size++;
    	}
    	
    	return true;
    }
	
	public PooledHashMap() {
		this(16);
	}

	public PooledHashMap(final int bucketCount) {
		this(bucketCount, 0.75, 2);
	}
	
	public PooledHashMap(
			final int    bucketCount,
			final double maxLoadFactor,
			final int    resizeFactor) {
		
		_createArrays(bucketCount);
		
		this.maxLoadFactor = maxLoadFactor;
		this.resizeFactor  = resizeFactor;
	}
	
	public final boolean deleteKey(final K key) {
		
		int pos = key.hashCode() % _keys.length;
		
		// Search position of the key
		while(_keys[pos] != key || _used[pos]) pos = (pos + 1) % _keys.length;
		
		if(_keys[pos] != key) return false;
		
		_keys  [pos] = null;
		_values[pos] = null;
		_size--;
		
		return true;
	}
	
	public final double getLoadFactor() {
		return _getLoadFactor(_size);
	}
	
	public final V getValue(final K key) {
		return getValue(key, null);
	}
	
	@SuppressWarnings("unchecked")
	public final V getValue(
			final K key,
			final V defaultValue) {
		
		final int pos = _getKeyPosition(key);
		return pos >= 0 ? (V)_values[pos] : defaultValue;
	}
	
	public final boolean hasKey(final K key) {
		return _getKeyPosition(key) >= 0;
	}

	@Override
	public final Iterator<KeyValuePair<K, V>> iterator() {
		return new KvpIterator();
	}
	
	// Returns 'true' when a new key has been inserted
	public final boolean setValue(
			final K key,
			final V value) {
		
		return _setValue(key, value);
	}
	
	@SuppressWarnings("unchecked")
	public final boolean tryGetValue(
			final K   key,
			final V[] value) {
		
		final int pos = _getKeyPosition(key);
		
		if(pos >= 0) {
			value[0] = (V)_values[pos];
			return true;
		} else {
			return false;
		}
	}
}
