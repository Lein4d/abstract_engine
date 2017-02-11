package ae.collections;

import java.util.function.Consumer;
import java.util.function.Supplier;

public final class DynamicPool<T> extends Pool<T> {
	
	private int      _capacity         = 0;  // Number of objects in '_pool'
	private int      _triedInsertCount = 0;
	private int      _wasteCount       = 0;
	private Object[] _pool;
	private int[]    _unusedStack;
	private int      _unusedStackPos   = -1; // No unused objects in the beginning
	
	public final int     maxHashCollisionCount;
	public final boolean objectWastageAllowed;
	
	private final int _getInitialPosition(final Object obj) {
		return (obj.hashCode() & 0x7FFFFFFF) % _pool.length;
	}
	
	private final int _insertObject(final Object obj) {
		
		int pos = _getInitialPosition(obj);
		
		for(int i = 0; i <= maxHashCollisionCount && _pool[pos] != null; i++)
			pos = (pos + 1) % _pool.length;
		
		_triedInsertCount++;
		
		if(_pool[pos] != null) return -1;
		
		_pool[pos] = obj;
		_capacity++;
		
		return pos;
	}
	
	private final T _popUnused() {
		return _prepare(_pool[_unusedStack[_unusedStackPos--]]);
	}
	
	private final void _pushUnused(final int pos) {
		_finalize(_pool[pos]);
		_unusedStack[++_unusedStackPos] = pos;
	}
	
	public DynamicPool(
			final boolean     allowObjectWastage,
			final Supplier<T> creator,
    		final Consumer<T> preparator,
    		final Consumer<T> finalizer) {
		
		this(4, allowObjectWastage, 64, creator, preparator, finalizer);
	}
	
	public DynamicPool(
			final int         maxHashCollisionCount,
			final boolean     allowObjectWastage,
			final int         initialSize,
			final Supplier<T> creator,
    		final Consumer<T> preparator,
    		final Consumer<T> finalizer) {
		
		super(creator, preparator, finalizer);
		
		this.maxHashCollisionCount = maxHashCollisionCount;
		this.objectWastageAllowed  = allowObjectWastage;
		
		_pool        = new Object[initialSize];
		_unusedStack = new int   [initialSize];
	}
	
	public static final <C extends PooledCollection<?>> DynamicPool<C>
		createCollectionPool(Supplier<C> creator) {
		
		return new DynamicPool<C>(
			false, creator, (col) -> col.clear(), (col) -> col.clear());
	}

	public static final <C extends PooledCollection<?>> DynamicPool<C>
		createCollectionPool(
			final int         maxHashCollisionCount,
			final int         initialSize,
			final Supplier<C> creator) {
		
		return new DynamicPool<C>(
			maxHashCollisionCount, false, initialSize,
			creator, (col) -> col.clear(), (col) -> col.clear());
	}
	
	public static final <N extends LinkedListNode<?>> DynamicPool<N>
		createNodePool(
			final boolean     resetNodeContent,
    		final Supplier<N> creator) {
		
		return new DynamicPool<>(
			true, creator, (node) -> node.resetListOnly(),
			resetNodeContent ? (node) -> {node.content = null;} : null);
	}
	
	public static final <N extends LinkedListNode<?>> DynamicPool<N>
    	createNodePool(
    		final int         maxHashCollisionCount,
    		final int         initialSize,
    		final boolean     resetNodeContent,
    		final Supplier<N> creator) {
    	
    	return new DynamicPool<>(
    		maxHashCollisionCount, true, initialSize,
    		creator, (node) -> node.resetListOnly(),
    		resetNodeContent ? (node) -> {node.content = null;} : null);
    }
	
	public final boolean free(final T obj) {
		
		if(obj == null) return false;
		
		int pos = _getInitialPosition(obj);
		
		// Try finding the object within the maximum collision count
		for(int i = 0; i < maxHashCollisionCount && _pool[pos] != obj; i++)
			pos = (pos + 1) % _pool.length;
		
		if(_pool[pos] != obj) return false;
		
		_pushUnused(pos);
		return true;
	}

	@Override
	public final int getCapacity() {
		return _capacity;
	}

	@Override
	public final int getUnusedObjectCount() {
		return _unusedStackPos + 1;
	}

	@Override
	public final int getUsedObjectCount() {
		return getCapacity() - getUnusedObjectCount();
	}
	
	public final int getWasteCount() {
		return _wasteCount;
	}

	@Override
	public final T provide() {
		
		Object overflowObject = null;
		
		// '_stackPos < 0': There is no unused object on the stack
		// '_triedInsertCount < _pool.length': There are free slots to try
		//  inserting a new object
		while(_unusedStackPos < 0 && _triedInsertCount < _pool.length) {
			
			final int pos = _insertObject(overflowObject = _create());
			
			if(pos >= 0) {
				_pushUnused(pos);
			} else {
				_wasteCount++;
				if(!objectWastageAllowed) break;
			}
		}
		
		// If there is still no unused object, a resize is necessary
		if(_unusedStackPos < 0) {
			
			final Object[] oldPool = _pool;
			
			// Create new pools
			_pool             = new Object[2 * oldPool.length];
			_unusedStack      = new int   [2 * oldPool.length];
			_capacity         = 0;
			_triedInsertCount = 0;
			
			// Insert the object that didn't fit into the old pool
			if(overflowObject != null) {
				_pushUnused(_insertObject(overflowObject));
				_wasteCount--;
			}
			
			// Rehash objects (stack doesn't need to be rehashed because it
			// doesn't contain any unused objects)
			for(Object i : oldPool) if(i != null) _insertObject(i);
			
			return provide();
			
		} else {
			
			return _popUnused();
		}
	}
}
