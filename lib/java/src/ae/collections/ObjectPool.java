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
		
		object.finalizePooled();
		node  .remove();
		
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
	
	public final T provide() {
		
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
		
		while(_used != null) {
			
			final ListNode<T> node = _used;
			
			_used = (ListNode<T>)node.remove().next;
			_free = (ListNode<T>)node.insertBefore(_free);
		}
		
		_size = 0;
	}
}
