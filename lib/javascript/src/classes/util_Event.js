
// 'T' is the type of the event that inherits from this class
ae.util.Event = class Event<T, H> {
	
	_listeners: ae.util.List<Consumer<T>>;
	
	host: H;
	
	constructor(host: H) {
		this.host = host;
		Object.freeze(this);
	}
	
	addListener(listener: Consumer<T>) {
		this._listeners.add(listener);
		//_listeners.insertAtEnd(listener);
	}
	
	fire() {
		for(let i = 0; i  < this._listeners.length; i++)
			// $IGNORE: This is a correct downcast to T
			this._listeners.get(i)(this);
	}
	
	removeListener(listener: Consumer<T>) {
		//_listeners.remove(listener);
	}
}
