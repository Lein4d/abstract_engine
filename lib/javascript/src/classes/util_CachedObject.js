
class AEClassCachedObject<T> {
	
	_object:  ?T;
	_valid:   boolean;
	_updater: (obj: ?T) => T;
	
	constructor(
			object:  ?T,
			updater: (obj: ?T) => T) {
		
		this._object  = object;
		this._valid   = false;
		this._updater = updater;
	}
	
	get object(): T {
		
		if(!this._valid || !this._object) {
			
			const newObject = this._updater(this._object);
			
			this._object = newObject;
			this._valid  = true;
			
			return newObject;
			
		} else {
			
			return this._object;
		}
	}
	
	invalidate(): void {
		
		this._valid = false;
	}
};
