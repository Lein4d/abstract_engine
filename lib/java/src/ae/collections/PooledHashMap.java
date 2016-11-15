package ae.collections;

import java.util.Iterator;
import java.util.NoSuchElementException;

public final class PooledHashMap<K, V>
		extends PooledCollection<
			PooledHashMap.KeyValuePair<K, V>,
			PooledHashMap.KeyValuePair<K, V>> {
	
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
	
	private final class KvpIterator implements Iterator<KeyValuePair<K, V>> {

		private int                                _bucketPos = -1;
		private LinkedListNode<KeyValuePair<K, V>> _node      = null;
		
		private final void moveToNextBucket() {
			while(_node == null && _bucketPos < _buckets.length - 1)
				_node = _buckets[++_bucketPos];
		}
		
		public KvpIterator() {
			moveToNextBucket();
		}
		
		@Override
		public final boolean hasNext() {
			return _node != null;
		}

		@Override
		public final KeyValuePair<K, V> next() {
			
			if(!hasNext()) throw new NoSuchElementException();
			
			final KeyValuePair<K, V> result = _node.content;
			
			// Zuerst wird vesucht innerhalb des Buckets einen Knoten zu finden
			_node = _node.next;
			
			// Anschließend wird nach dem nächsten vollen Bucket gesucht
			moveToNextBucket();
			
			return result;
		}
	}
	
	private LinkedListNode<KeyValuePair<K, V>>[] _buckets;
	private float                                _maxLoadFactor = 0.5f;
	private int                                  _resizeFactor  = 2;
	
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
			_nodePool.free(node.remove());
			_size--;
			return true;
		} else {
			return false;
		}
	}
	
	public final float getLoadFactor() {
		return _getLoadFactor(_nodePool.getSize());
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
		LinkedListNode<KeyValuePair<K, V>>         node;
		
		_buckets = (LinkedListNode<KeyValuePair<K, V>>[])
			new LinkedListNode<?>[newBufferSize];
		
		for(int i = 0; i < oldBuffer.length; i++) {
			
			node = oldBuffer[i];
			
			while(node != null) {
				
				// Die öffentliche Methoed nutzen, um den Knoten wieder in den
				// neuen Puffer einzufügen
				setValue(node.content._key, node.content._value);

				_nodePool.free(node);
				
				node = node.next;
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
	
	public final boolean setValue(
			final K key,
			final V value) {
		
		KeyValuePair<K, V> kvp     = _getKeyValuePair(key);
		final boolean      replace = kvp != null;
		
		if(!replace) {
			
			// If a new node is created, check whether the hash map should be
			// enlarged
			if(_getLoadFactor(_nodePool.getSize() + 1) > _maxLoadFactor)
				rehash(_buckets.length * _resizeFactor);
			
			final int                           bufferPos = _getBufferPos(key);
			final LinkedListNode<KeyValuePair<K, V>> node =
				_nodePool.provideObject(); 
			
			// The new node is inserted at the beginning of the list
			_buckets[bufferPos] = node.insertBefore(_buckets[bufferPos]);
			
			kvp = node.content;
			_size++;
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
