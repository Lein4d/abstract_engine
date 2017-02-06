package ae.collections;

import java.util.Iterator;

public final class PooledOrderedSet<T>
	extends PooledCollection<PooledOrderedSet<T>, T> {
	
	private final PooledHashMap<T, LinkedListNode<T>> _hashMap;
	private final PooledLinkedList<T>                 _list;
	
	@SuppressWarnings("unchecked")
	private final LinkedListNode<T>[] _tempNode = new LinkedListNode[1];

	@Override
	protected final boolean _addSingle(final T element) {
		return insertAtEnd(element);
	}
	
	@Override
	protected final Iterator<T> _getReverseIterator() {
		return _list.reverse.iterator();
	}
	
	public PooledOrderedSet() {
		this(new PooledHashMap<>(), new PooledLinkedList<>());
	}
	
	public PooledOrderedSet(
			final PooledHashMap<T, LinkedListNode<T>> backendSet,
			final PooledLinkedList<T>                 backendList) {
		
		super(null);
		
		_hashMap = backendSet;
		_list    = backendList;
	}
	
	@Override
	public final boolean clear() {
		_hashMap.clear();
		return _list.clear();
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
		return _list.getSize();
	}
	
	public final boolean insertAfter(
			final T element,
			final T refElement) {
		
		final boolean exists = _hashMap.tryGetValue(element, _tempNode);
		
		if(exists) _list.remove(_tempNode[0]);
		
		_hashMap.setValue(
			element,
			_list.insertAfter(element, _hashMap.getValue(refElement)));
		
		return !exists;
	}

	public final boolean insertAtEnd(final T element) {
		
		final boolean exists = _hashMap.tryGetValue(element, _tempNode);
		
		if(exists) _list.remove(_tempNode[0]);
		_hashMap.setValue(element, _list.insertAtEnd(element));
		
		return !exists;
	}

	public final boolean insertAtFront(final T element) {
		
		if(!_hashMap.hasKey(element)) {
			_hashMap.setValue(element, _list.insertAtFront(element));
			return true;
		} else {
			return false;
		}
	}

	public final boolean insertBefore(
			final T element,
			final T refElement) {
		
		final boolean exists = _hashMap.tryGetValue(element, _tempNode);
		
		if(exists) _list.remove(_tempNode[0]);
		
		_hashMap.setValue(
			element,
			_list.insertBefore(element, _hashMap.getValue(refElement)));
		
		return !exists;
	}

	@Override
	public final boolean isEmpty() {
		return _list.isEmpty();
	}
	
	@Override
	public Iterator<T> iterator() {
		return _list.iterator();
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

	public final boolean tryInsertAfter(
			final T element,
			final T refElement) {
		
		if(!_hashMap.hasKey(element)) {
			_hashMap.setValue(
				element,
				_list.insertAfter(element, _hashMap.getValue(refElement)));
			return true;
		} else {
			return false;
		}
	}
	
	public final boolean tryInsertAtEnd(final T element) {
		
		if(!_hashMap.hasKey(element)) {
			_hashMap.setValue(element, _list.insertAtEnd(element));
			return true;
		} else {
			return false;
		}
	}

	public final boolean tryInsertAtFront(final T element) {
		
		if(!_hashMap.hasKey(element)) {
			_hashMap.setValue(element, _list.insertAtFront(element));
			return true;
		} else {
			return false;
		}
	}
	
	public final boolean tryInsertBefore(
			final T element,
			final T refElement) {
		
		if(!_hashMap.hasKey(element)) {
			_hashMap.setValue(
				element,
				_list.insertBefore(element, _hashMap.getValue(refElement)));
			return true;
		} else {
			return false;
		}
	}
}
