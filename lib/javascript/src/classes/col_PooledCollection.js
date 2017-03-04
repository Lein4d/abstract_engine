
class AEClassPooledCollection<T> {
	
	_p: {
		// The size needs to be stored separately as the node pool may be shared
		// between multiple collections
		size: number;
	}
	
	// protected constructor ///////////////////////////////////////////////////
	
	constructor() {
		
		this._p = {
			size: 0
		}
		
		// Will be freezed in sub class
	}
	
	// protected methods ///////////////////////////////////////////////////////
	
	_addSingle(element: ?T): boolean {throw ae.EXCEPTION_ABSTRACT_METHOD;}
	
	// Doesn't need to be overridden if the standard clear method is overridden
	_clear(): void {}
	
	// public getters + setters ////////////////////////////////////////////////
	
	get empty(): boolean {return !this._p.size;}
	get size (): number  {return  this._p.size;}
	
	// public methods //////////////////////////////////////////////////////////
	
	// True if the col has changed somehow
	addAll(src: Iterable<T>): boolean {
		
		let changed = false;
		
		src.forEach((element) => {
			if(this._addSingle(element)) changed = true;
		})
		
		return changed;
	}
	
	clear(): boolean {
		
		if(this.empty) {
			return false;
		} else {
			this._clear();
			return true;
		}
	}
	
	forEach   (visitor: Visitor<T>): void {throw ae.EXCEPTION_ABSTRACT_METHOD;}
	forEachRev(visitor: Visitor<T>): void {this.forEach(visitor);}
}