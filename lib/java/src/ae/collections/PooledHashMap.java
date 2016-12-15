package ae.collections;

import java.util.Iterator;

public final class PooledHashMap<K, V>
		extends PooledCollection<PooledHashMap.KeyValuePair<K, V>> {
	
	public static final class KeyValuePair<K, V> {
		
		private K _key;
		private V _value;
		
		public final K getKey() {
			
			return _key;
		}
		
		public final V getValue() {
			
			return _value;
		}
	}
	
	private final class KeyIterator implements Iterator<K> {

		private final Iterator<KeyValuePair<K, V>> _kvpIterator = iterator();
		
		@Override
		public final boolean hasNext() {
			return _kvpIterator.hasNext();
		}

		@Override
		public final K next() {
			return _kvpIterator.next().getKey();
		}
	}
	
	private final class KvpIterator extends NodeIterator<KeyValuePair<K, V>> {

		private int _bucketPos = -1;
		
		private final void _findNextNonEmptyBucket() {
			while(_node == null && _bucketPos < _buckets.length - 1)
				_node = _buckets[++_bucketPos];
		}
		
		@Override
		protected final void _moveToFirstNode() {
			_findNextNonEmptyBucket();
		}
		
		@Override
		protected final void _moveToNextNode() {
			
			// Zuerst wird vesucht innerhalb des Buckets einen Knoten zu finden
			_node = _node.next;
			
			// Anschließend wird nach dem nächsten vollen Bucket gesucht
			_findNextNonEmptyBucket();
		}

		public KvpIterator() {}
	}

	private final class ValueIterator implements Iterator<V> {

		private final Iterator<KeyValuePair<K, V>> _kvpIterator = iterator();
		
		@Override
		public final boolean hasNext() {
			return _kvpIterator.hasNext();
		}

		@Override
		public final V next() {
			return _kvpIterator.next().getValue();
		}
	}

	private LinkedListNode<KeyValuePair<K, V>>[] _buckets;
	private float                                _maxLoadFactor = 0.5f;
	private int                                  _resizeFactor  = 2;
	
	public final Iterable<K> keys   = () -> new KeyIterator();
	public final Iterable<V> values = () -> new ValueIterator();
	
	private final boolean _areKeysEqual(
			final K key1,
			final K key2) {
		
		return key1 == null || key2 == null ? key1 == key2 : key1.equals(key2);
	}
	
	private final KeyValuePair<K, V> _getKeyValuePair(final K key) {
		
		LinkedListNode<KeyValuePair<K, V>> node = _buckets[_getBufferPos(key)];
		
		while(node != null && !_areKeysEqual(node.content._key, key))
			node = node.next;
		
		return node != null ? node.content : null;
	}
	
	private final int _getBufferPos(final K key) {
		return
			key != null ? (key.hashCode() & 0x7FFFFFFF) % _buckets.length : 0;
	}
	
	private final float _getLoadFactor(final float kvpCount) {
		return kvpCount / _buckets.length;
	}

	@Override
	protected final void _clear() {
		
		for(int i = 0; i < _buckets.length; i++) {
			
			LinkedListNode<KeyValuePair<K, V>> node = _buckets[i];
			
			while(node != null) node = _freeNode(node).next;
			_buckets[i] = null;
		}
	}

	@Override
	protected final Iterator<KeyValuePair<K, V>> _getReverseIterator() {
		// TODO: A new object is created
		return new KvpIterator();
	}
	
	public PooledHashMap() {
		this(10);
	}
	
	public PooledHashMap(final int bucketCount) {
		this(PooledHashMap.<K, V>createNodePool(), false, bucketCount);
	}

	public PooledHashMap(
			final ObjectPool<LinkedListNode<KeyValuePair<K, V>>> nodePool,
			final boolean                                        poolSharing) {
		
		this(nodePool, poolSharing, 10);
	}

	@SuppressWarnings("unchecked")
	public PooledHashMap(
			final ObjectPool<LinkedListNode<KeyValuePair<K, V>>> nodePool,
			final boolean                                        poolSharing,
			final int                                            bucketCount) {
		
		super(nodePool, poolSharing);
		
		_buckets = (LinkedListNode<KeyValuePair<K, V>>[])
			new LinkedListNode<?>[bucketCount];
	}

	public static final <K, V>
			ObjectPool<LinkedListNode<KeyValuePair<K, V>>> createNodePool() {
		
		return
			new ObjectPool<>(() -> new LinkedListNode<>(new KeyValuePair<>()));
	}
	
	public final boolean deleteKey(final K key) {
		
		final int                          bufferPos = _getBufferPos(key);
		LinkedListNode<KeyValuePair<K, V>> node      = _buckets[bufferPos];
		
		if(node == null) return false;
		
		// Prüfen, ob der Knoten der erste in der Liste ist
		if(node.content.equals(key)) {
			
			_buckets[bufferPos] = node.next;
			
		} else {
			
			// Suche in der Liste nach dem richtigen Knoten
			while(node != null && !node.content._key.equals(key))
				node = node.next;
		}
		
		// Falls der Schlüssel existiert, wird der Knoten gelöscht
		if(node != null) {
			_freeNode(node.remove());
			return true;
		} else {
			return false;
		}
	}
	
	public final float getLoadFactor() {
		return _getLoadFactor(getSize());
	}
	
	public final float getMaxLoadFactor() {
		return _maxLoadFactor;
	}
	
	public final int getResizeFactor() {
		return _resizeFactor;
	}

	public final V getValue(final K key) {
		final KeyValuePair<K, V> kvp = _getKeyValuePair(key);
		return kvp != null ? kvp._value : null;
	}
	
	public final boolean hasKey(final K key) {
		return _getKeyValuePair(key) != null;
	}

	@Override
	public final Iterator<KeyValuePair<K, V>> iterator() {
		// TODO: Hier wird ein neues Objekt angelegt
		return new KvpIterator();
	}
	
	@SuppressWarnings("unchecked")
	public final void rehash(final int newBufferSize) {
		
		if(newBufferSize <= _buckets.length)
			throw new IllegalArgumentException();
		
		final LinkedListNode<KeyValuePair<K, V>>[] oldBuffer = _buckets;
		
		_buckets = (LinkedListNode<KeyValuePair<K, V>>[])
			new LinkedListNode<?>[newBufferSize];
		
		for(LinkedListNode<KeyValuePair<K, V>> i : oldBuffer) {
			
			LinkedListNode<KeyValuePair<K, V>> node = i;
			
			while(node != null) {
				
				// Use the public method to insert the node at the correct
				// position in the new bucket array
				setValue(node.content._key, node.content._value);
				
				// Free the old node and move to the next in the current bucket
				node = _freeNode(node).next;
			}
		}
	}
	
	public final void setMaxLoadFactor(final float maxLoadFactor) {
		
		if(maxLoadFactor <= 0 || maxLoadFactor >= 1)
			throw new IllegalArgumentException();
		
		_maxLoadFactor = maxLoadFactor;
	}
	
	public final void setResizeFactor(final int resizeFactor) {
		
		if(resizeFactor <= 1) throw new IllegalArgumentException();
		
		_resizeFactor = resizeFactor;
	}
	
	// Returns 'true' when a new key has been inserted
	public final boolean setValue(
			final K key,
			final V value) {
		
		KeyValuePair<K, V> kvp     = _getKeyValuePair(key);
		final boolean      replace = kvp != null;
		
		if(!replace) {
			
			// If a new node is created, check whether the hash map should be
			// enlarged
			if(_getLoadFactor(getSize() + 1) > _maxLoadFactor)
				rehash(_buckets.length * _resizeFactor);
			
			final int                           bufferPos = _getBufferPos(key);
			final LinkedListNode<KeyValuePair<K, V>> node = _provideNode();
			
			// The new node is inserted at the beginning of the list
			_buckets[bufferPos] = node.insertBefore(_buckets[bufferPos]);
			
			kvp = node.content;
		}
		
		kvp._key   = key;
		kvp._value = value;
		
		return !replace;
	}
	
	public final boolean tryGetValue(
			final K   key,
			final V[] value) {
		
		final KeyValuePair<K, V> kvp = _getKeyValuePair(key);
		
		value[0] = kvp != null ? kvp._value : null;
		
		return kvp != null;
	}
}
