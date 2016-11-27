package ae.collections;

import java.util.Iterator;

public final class PooledOrderedSet<T> extends PooledCollection<T, T> {
	
	private final PooledHashMap<T, LinkedListNode<T>> _hashMap;
	private final PooledLinkedList<T>                 _list;
	
	@SuppressWarnings("unchecked")
	private final LinkedListNode<T>[] _tempNode = new LinkedListNode[1];
	
	private final boolean _ignoreMultiInsert;
	
	public PooledOrderedSet(final boolean ignoreMultiInsert) {
		this(
			ignoreMultiInsert, new PooledHashMap<>(), new PooledLinkedList<>());
	}
	
	public PooledOrderedSet(
			final boolean                             ignoreMultiInsert,
			final PooledHashMap<T, LinkedListNode<T>> backendSet,
			final PooledLinkedList<T>                 backendList) {
		
		super(null, false);
		
		_hashMap           = backendSet;
		_list              = backendList;
		_ignoreMultiInsert = ignoreMultiInsert;
	}
	
	public PooledOrderedSet(
			final boolean     ignoreMultiInsert,
			final Iterable<T> elements) {
		
		this(
			ignoreMultiInsert, elements,
			new PooledHashMap<>(), new PooledLinkedList<>());
	}
	
	public PooledOrderedSet(
			final boolean                             ignoreMultiInsert,
			final Iterable<T>                         elements,
			final PooledHashMap<T, LinkedListNode<T>> backendSet,
			final PooledLinkedList<T>                 backendList) {
		
		super(null, false);
		
		_hashMap           = backendSet;
		_list              = backendList;
		_ignoreMultiInsert = ignoreMultiInsert;
		
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
	
	// Returns 'true' if the order list has changed either by inserting a new
	// value or by reinserting an existing value
	public final boolean insert(final T element) {
		
		boolean insert = false;
		
		if(_hashMap.tryGetValue(element, _tempNode)) {
			
			if(!_ignoreMultiInsert) {
				_list.remove(_tempNode[0]);
				insert = true;
			}
			
		} else {
			insert = true;
		}
		
		// Insert the element with a new node in the list and store this node
		// in the map
		if(insert) _hashMap.setValue(element, _list.insertAtEnd(element));
		
		return _hashMap.setValue(element, null);
	}
	
	public final boolean remove(final T element) {
		
		final boolean keyExists = _hashMap.tryGetValue(element, _tempNode);
		
		if(keyExists) {
			_hashMap.deleteKey(element);
			_list   .remove(_tempNode[0]);
		}
		
		return keyExists;
	}

	public final void setMaxLoadFactor(final float maxLoadFactor) {
		_hashMap.setMaxLoadFactor(maxLoadFactor);
	}
	
	public final void setResizeFactor(final int resizeFactor) {
		_hashMap.setResizeFactor(resizeFactor);
	}

	@Override
	public Iterator<T> iterator() {
		return _list.iterator();
	}
}
