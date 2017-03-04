
class AEClassGrowingPool<T: ae.JavaObject> extends AEClassPool<T> {
	
	_p: {
		pool:        Array<?T>;
		freePos:     number;
		objectCount: number;
	}
	
	backingPool: ?ae.col.DynamicPool<T>;
	
	// private getters + setters ///////////////////////////////////////////////
	
	get _freePos    (): number    {return this._p.freePos;}
	get _objectCount(): number    {return this._p.objectCount;}
	get _pool       (): Array<?T> {return this._p.pool;}
	
	// public constructor //////////////////////////////////////////////////////
	
	constructor(
			creator:         Supplier<T>,
    		preparator:     ?Consumer<T>           = null,
    		finalizer:      ?Consumer<T>           = null,
			initialCapacity: number                = 64,
			backingPool:    ?ae.col.DynamicPool<T> = null,) {
		
		super(creator, preparator, finalizer);
		
		this._p = {
			pool:        Array(initialCapacity),
			freePos:     0,
			objectCount: 0
		};
		
		this.backingPool = backingPool;
		
		Object.freeze(this);
	}
	
	// public getters + setters ////////////////////////////////////////////////
	
	get capacity       (): number {return this._pool.length;}
	get usedObjectCount(): number {return this._freePos;}
	
	get unusedObjectCount(): number {
		return this._objectCount - this.usedObjectCount;
	}
	
	// public methods //////////////////////////////////////////////////////////
	
	finalize() {
		if(this.backingPool)
			// $NOT_NULL
			this.forEach((object) => this.backingPool.free(object));
	}
	
	forEach(visitor: Visitor<T>): void {
		// $NOT_NULL
		for(let i = 0; i < this._freePos; i++) visitor(this._pool[i]);
	}
	
	provide(): T {
		
		// Check whether there are free slots left and resize if not
		if(this._freePos == this._pool.length) {
			
			const oldPool = this._pool;
			this._p.pool  = Array(2 * oldPool.length);
			
			// Copy the old elements to the new pool array
			for(let i = 0; i < oldPool.length; i++) this._pool[i] = oldPool[i];
		}
		
		// Ensure the current slot contains an object
		if(!this._pool[this._freePos]) {
			this._pool[this._freePos] =
				this.backingPool ? this.backingPool.provide() : this._create();
			this._p.objectCount++;
		}
		
		return this._prepare(this._pool[this._p.freePos++]);
	}
	
	reset(): void {
		this.forEach((object) => this._finalize(object));
		this._p.freePos = 0;
	}
}