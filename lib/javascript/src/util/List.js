
ae.util.List = class List<T> {
	
	_backend: {[key: number]: T};
	_length:  number;
	
	_isInRange(index: number): boolean {
		return index >= 0 && index < this._length;
	}
	
	constructor() {
		this._backend = {};
		this._length  = 0;
	}
	
	get array(): Array<T> {
		
		const array = Array(this._length);
		
		for(var i = 0; i < this._length; i++) array[i] = this._backend[i];
		return array;
	}
	
	get empty (): boolean {return !this._length};
	get length(): number  {return  this._length};
	
	add(value: T) {
		this._backend[this._length] = value;
		this._length++;
	}
	
	clear() {
		// TODO
	}
	
	get(index: number): T {
		if(this._isInRange(index)) throw "Index out of range";
		return this._backend[index];
	}
	
	set(
		index: number,
		value: T) {
		
		if(this._isInRange(index)) this._backend[index] = value;
	}
}
