
class AEClassListener<T> extends AEClassJavaObject {
	
	callback: Consumer<T>;
	
	constructor(callback: Consumer<T>) {
		
		super();
		
		this.callback = callback;
		Object.freeze(this);
	}
}

class AEClassEvent<This, H> {
	
	_listeners: ae.col.PooledOrderedSet<ae.event.Listener<This>>;
	
	host: H;
	
	constructor(host: H) {
		this._listeners = new AEClassPooledOrderedSet();
		this.host       = host;
	}
	
	get listenerCount(): number {return this._listeners.size;}
	
	addListener(listener: Consumer<This>): ae.event.Listener<This> {
		
		const wrappedListener = new AEClassListener(listener);
		this._listeners.insertAtEnd(wrappedListener);
		
		return wrappedListener;
	}
	
	fire(): void {
		// $CORRECT_CAST
		this._listeners.forEach((listener) => listener.callback(this));
	}
	
	removeListener(listener: ae.event.Listener<This>): void {
		this._listeners.remove(listener);
	}
}

class AEClassNotifyEvent<H> extends AEClassEvent<AEClassNotifyEvent<H>, H> {
	
	constructor(host: H) {
		super(host);
	}
}
