
// ae.collections.DynamicPool
class AEClassDynamicPool<T: ae.JavaObject> extends AEClassPool<T> {
	
	_p: {
		capacity:         number;
		triedInsertCount: number;
		wasteCount:       number;
		pool:             Array<?T>;
		unusedStack:      Array<number>;
		unusedStackPos:   number;
	};
	
	maxHashCollisionCount: number;
	objectWastageAllowed:  boolean;
	
	// private getters + setters ///////////////////////////////////////////////
	
	get _pool            (): Array<?T>     {return this._p.pool;}
	get _triedInsertCount(): number        {return this._p.triedInsertCount;}
	get _unusedStack     (): Array<number> {return this._p.unusedStack;}
	get _unusedStackPos  (): number        {return this._p.unusedStackPos;}
	
	// private methods /////////////////////////////////////////////////////////
	
	_getInitialPosition(obj: T): number {
		return obj.hashCode % this._pool.length;
	}
	
	_insertObject(obj: T): number {
		
		let pos = this._getInitialPosition(obj);
		
		for(let i = 0; i <= this.maxHashCollisionCount && this._pool[pos]; i++)
			pos = (pos + 1) % this._pool.length;
		
		this._p.triedInsertCount++;
		
		if(this._pool[pos]) return -1;
		
		this._pool[pos] = obj;
		this._p.capacity++;
		
		return pos;
	}
	
	_popUnused(): T {
		return this._prepare(
			this._pool[this._unusedStack[this._p.unusedStackPos--]]);
	}
	
	_pushUnused(pos: number): void {
		this._finalize(this._pool[pos]);
		this._unusedStack[++this._p.unusedStackPos] = pos;
	}
	
	// public constructor //////////////////////////////////////////////////////
	
	constructor(
			allowObjectWastage:     boolean,
			creator:                Supplier<T>,
    		preparator:            ?Consumer<T> = null,
    		finalizer:             ?Consumer<T> = null,
			maxHashCollisionCount:  number      = 4,
			initialSize:            number      = 64) {
		
		super(creator, preparator, finalizer);
		
		this._p = {
			capacity:         0, // Number of objects in '_pool'
			triedInsertCount: 0,
			wasteCount:       0,
			pool:             Array(initialSize),
			unusedStack:      Array(initialSize),
			unusedStackPos:   -1 // No unused objects in the beginning
		}
		
		this.maxHashCollisionCount = maxHashCollisionCount;
		this.objectWastageAllowed  = allowObjectWastage;
		
		Object.freeze(this);
	}
	
	// public getters + setters ////////////////////////////////////////////////
	
	get capacity         (): number {return this._p.capacity;}
	get unusedObjectCount(): number {return this._p.unusedStackPos + 1;}
	get usedObjectCount  (): number {return this.capacity - this.unusedObjectCount;}
	get wasteCount       (): number {return this._p.wasteCount;}
	
	// public methods //////////////////////////////////////////////////////////
	
	/*
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
	*/
	static createNodePoolA(resetNodeContent: boolean):
		ae.col.DynamicPool<ae.col.LinkedListNode> {
		
		return new AEClassDynamicPool(
			true, () => new AEClassLinkedListNode(), (node) => node.resetListOnly(),
			resetNodeContent ? (node) => {node.content = null;} : null);
	}
	
	static createNodePoolB(
			maxHashCollisionCount: number,
    		initialSize:           number,
			resetNodeContent:      boolean): ae.col.DynamicPool<ae.col.LinkedListNode> {
		
		return new AEClassDynamicPool(
			true, () => new AEClassLinkedListNode(), (node) => node.resetListOnly(),
			resetNodeContent ? (node) => {node.content = null;} : null,
			maxHashCollisionCount, initialSize);
	}
	
	free(obj: ?T): boolean {
		
		if(!obj) return false;
		
		let pos = this._getInitialPosition(obj);
		
		// Try finding the object within the maximum collision count
		for(let i = 0; i < this.maxHashCollisionCount && this._pool[pos]; i++)
			pos = (pos + 1) % this._pool.length;
		
		if(this._pool[pos]) return false;
		
		this._pushUnused(pos);
		return true;
	}
	
	provide(): T {
		
		let overflowObject: ?T = null;
		
		// '_stackPos < 0': There is no unused object on the stack
		// '_triedInsertCount < _pool.length': There are free slots to try
		//  inserting a new object
		while(this._unusedStackPos < 0 &&
			this._triedInsertCount < this._pool.length) {
			
			const pos = this._insertObject(overflowObject = this._create());
			
			if(pos >= 0) {
				this._pushUnused(pos);
			} else {
				this._p.wasteCount++;
				if(!this.objectWastageAllowed) break;
			}
		}
		
		// If there is still no unused object, a resize is necessary
		if(this._unusedStackPos < 0) {
			
			const oldPool = this._pool;
			
			// Create new pools
			this._p.pool             = Array(2 * oldPool.length);
			this._p.unusedStack      = Array(2 * oldPool.length);
			this._p.capacity         = 0;
			this._p.triedInsertCount = 0;
			
			// Insert the object that didn't fit into the old pool
			if(overflowObject) {
				this._pushUnused(this._insertObject(overflowObject));
				this._p.wasteCount--;
			}
			
			// Rehash objects (stack doesn't need to be rehashed because it
			// doesn't contain any unused objects)
			for(let i = 0; i < oldPool.length; i++)
				if(oldPool[i]) this._insertObject(oldPool[i]);
			
			return this.provide();
			
		} else {
			
			return this._popUnused();
		}
	}
}