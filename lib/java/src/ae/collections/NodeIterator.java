package ae.collections;

import java.util.Iterator;
import java.util.NoSuchElementException;

public abstract class NodeIterator<T> implements Iterator<T> {
	
	private   boolean           _first = true;
	protected LinkedListNode<T> _node;
	
	protected NodeIterator() {}
	
	protected NodeIterator(final LinkedListNode<T> node) {
		_node = node;
	}

	// Should be overridden if the standard constructor is invoked
	protected void _moveToFirstNode() {}
	
	protected abstract void _moveToNextNode();
	
	@Override
	public final boolean hasNext() {
		
		if(_first) {
			_moveToFirstNode();
			_first = false;
		}
		
		return _node != null;
	}

	@Override
	public final T next() {
		
		if(!hasNext()) throw new NoSuchElementException();
		
		final T result = _node.content;
		_moveToNextNode();
		
		return result;
	}
}
