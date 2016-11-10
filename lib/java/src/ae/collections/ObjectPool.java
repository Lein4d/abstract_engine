package ae.collections;

import java.util.Iterator;

import ae.util.OrganizedObject;

// Gepoolte Objekte werden in zwei verketteten Listen gehalten
// Neue Objekte werden immer am Anfang der Liste eingefügt
public final class ObjectPool<T extends OrganizedObject<T>>
		implements Iterable<T> {
	
	public interface ObjectCreator<T extends OrganizedObject<T>> {
		T createObject();
	}

	public static final class ListNode<T extends OrganizedObject<T>>
			extends LinkedListNode<T> {
		
		private ListNode(final ObjectCreator<T> creator) {
			content = creator.createObject();
			content.setPoolNode(this);
		}
	}
	
	public final class ListIterator implements Iterator<T> {
		
		private ListNode<T> node = _used;
		
		@Override
		public final boolean hasNext() {
			return node != null;
		}
		
		@Override
		public final T next() {
			
			if(!hasNext()) throw new IndexOutOfBoundsException();
			
			node = (ListNode<T>)node.next;
			
			// Es wird das Objekt des alten Knotens zurückgegeben
			return node.prev.content;
		}
	}
	
	private final ObjectCreator<T> _creator;
	
	private ListNode<T> _free = null;
	private ListNode<T> _used = null;

	private int _size     = 0;
	private int _capacity = 0;

	public ObjectPool(final ObjectCreator<T> creator) {
		_creator = creator;
	}
	
	public final void free(T object) {
		
		final ListNode<T> node = object.getPoolNode();
		
		node.remove();
		
		if(node == _used) _used = (ListNode<T>)node.next;
		
		_free = (ListNode<T>)node.insertBefore(_free);
		_size--;
	}
	
	public final int getCapacity() {
		return _capacity;
	}
	
	public final int getSize() {
		return _size;
	}
	
	@Override
	public final Iterator<T> iterator() {
		// TODO: Hier wird ein neues Objekt angelegt
		return new LinkedListNode.NodeIteratorForward<T>(_used);
	}
	
	public final T provideObject() {
		
		ListNode<T> node;
		
		if(_free != null) {
			node  = _free;
			_free = (ListNode<T>)node.remove().next;
		} else {
			node = new ListNode<T>(_creator);
			_capacity++;
		}
		
		_used = (ListNode<T>)node.insertBefore(_used);
		_size++;
		
		return node.content;
	}
	
	public final void reset() {
		
		ListNode<T> node;
		
		while(_used != null) {
			node  = _used;
			_used = (ListNode<T>)node.remove().next;
			_free = (ListNode<T>)node.insertBefore(_free);
		}
		
		_size = 0;
	}
}
