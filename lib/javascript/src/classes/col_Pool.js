
// ae.collections.Pool<T>
class AEClassPool<T> extends AEClassJavaObject {
	
	creator:    Supplier<T>;
	preparator: Consumer<T>;
	finalizer:  Consumer<T>;
	
	// protected constructor ///////////////////////////////////////////////////
	
	constructor(
    		creator:    ?Supplier<T>,
    		preparator: ?Consumer<T>,
    		finalizer:  ?Consumer<T>) {
		
		super();
		
		this.creator    = creator    ? creator    : () => {throw "";};
		this.preparator = preparator ? preparator : (obj) => {};
		this.finalizer  = finalizer  ? finalizer  : (obj) => {};
	}
	
	// protected methods ///////////////////////////////////////////////////////
	
	_create(): T {
		return this.creator();
	}
	
	_finalize(obj: IObject): void {
		// $CORRECT_CAST
		this.finalizer(obj);
	}
	
	_prepare(obj: IObject): T {
		
		// $CORRECT_CAST
		const casted: T = obj;
		
		this.preparator(casted);
		return casted;
	}
	
	// public getters + setters ////////////////////////////////////////////////
	
	get capacity         (): number {throw ae.EXCEPTION_ABSTRACT_METHOD;}
	get unusedObjectCount(): number {throw ae.EXCEPTION_ABSTRACT_METHOD;}
	get usedObjectCount  (): number {throw ae.EXCEPTION_ABSTRACT_METHOD;}
	
	// public methods //////////////////////////////////////////////////////////
	
	provide(): T {throw ae.EXCEPTION_ABSTRACT_METHOD;}
}