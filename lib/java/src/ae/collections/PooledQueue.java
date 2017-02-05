package ae.collections;

public final class PooledQueue<T> {
	
	private final PooledLinkedList<T> _list = new PooledLinkedList<>();

	public final T getNext() {
		return _list.getFirst();
	}
	
	public final boolean hasNext() {
		return !_list.isEmpty();
	}
	
	public final T pop() {
		
		final T element = _list.getFirst();
		
		_list.removeFirst();
		
		return element;
	}
	
	public final void push(final T element) {
		_list.insertAtEnd(element);
	}
}
