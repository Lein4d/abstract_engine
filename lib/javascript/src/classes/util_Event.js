
class AEClassEvent<T, H> {
	
	_listeners: Set<Consumer<T>>;
	host:       H;
	
	constructor(host: H) {
		
		this._listeners = new Set();
		this.host       = host;
		
		Object.freeze(this);
	}
	
	addListener(listener: Consumer<T>) {
		this._listeners.add(listener);
	}
	
	fire() {
		this._listeners.forEach((listener) => {
			// $CORRECT_CAST
			listener(this);
		});
	}
	
	removeListener(listener: Consumer<T>) {
		this._listeners.delete(listener);
	}
}
