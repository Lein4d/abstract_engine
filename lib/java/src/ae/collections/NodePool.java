package ae.collections;

import java.util.function.Supplier;

public final class NodePool {
	
	private final ObjectPool<LinkedListNode<?>> _pool;
	
	public final boolean resetNodeContent;
	
	public NodePool(
			final int     maxHashCollisionCount,
			final boolean allowObjectWastage,
			final int     initialSize,
			final boolean resetNodeContent) {
		
		this(
			maxHashCollisionCount, allowObjectWastage, initialSize,
			resetNodeContent, () -> new LinkedListNode<>());
	}
	
	public NodePool(
			final int                         maxHashCollisionCount,
			final boolean                     allowObjectWastage,
			final int                         initialSize,
			final boolean                     resetNodeContent,
			final Supplier<LinkedListNode<?>> creator) {
		
		this._pool            = new ObjectPool<>(
			maxHashCollisionCount, allowObjectWastage, initialSize, creator);
		this.resetNodeContent = resetNodeContent;
	}
	
	public final <T> LinkedListNode<T> free(final LinkedListNode<T> node) {
		
		if(resetNodeContent) node.content = null;
		_pool.free(node);
		
		return node;
	}
	
	public final <T> LinkedListNode<T> provide() {
		
		@SuppressWarnings("unchecked")
		final LinkedListNode<T> node = (LinkedListNode<T>)_pool.provide();
		
		node.prev = node.next = null;
		return node;
	}
	
	public final <T> LinkedListNode<T> provide(final T content) {
		
		final LinkedListNode<T> node = provide();
		node.content                 = content;
		
		return node;
	}
}