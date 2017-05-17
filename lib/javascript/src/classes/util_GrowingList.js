
class AEClassGrowingList<T> {
	
	_backend: Map<number, T>;
	
	_isInRange(index: number): boolean {
		return index >= 0 && index < this.length;
	}
	
	constructor() {
		this._backend = new Map();
		Object.freeze(this);
	}
	
	get array(): Array<T> {
		
		const array = Array(this.length);
		
		for(let i = 0; i < array.length; i++) array[i] = this._backend.get(i);
		return array;
	}
	
	get empty (): boolean {return this.length === 0;}
	get length(): number  {return this._backend.size;}
	
	add(value: T) {
		this._backend.set(this.length, value);
	}
	
	clear() {
		this._backend.clear();
	}
	
	get(index: number): T {
		
		if(this._isInRange(index)) throw "Index out of range";
		
		const value = this._backend.get(index);
		
		if(value) {
			return value;
		} else {
			throw "";
		}
	}
	
	set(
		index: number,
		value: T) {
		
		if(this._isInRange(index)) this._backend.set(index, value);
	}
}
