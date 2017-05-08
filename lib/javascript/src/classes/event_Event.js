
// (Boxing type for a consumer)
class AEClassListener<T> extends AEClassJavaObject {
	
	callback: Consumer<T>;
	
	constructor(callback: Consumer<T>) {
		
		super();
		
		this.callback = callback;
		Object.freeze(this);
	}
}

// ae.event.Event<This,H>
class AEClassEvent<This> extends AEClassJavaObject {
	
	_listeners: ae.col.PooledOrderedSet<ae.event.Listener<This>>;
	
	host: ae.JavaObject;
	
	constructor(host: ae.JavaObject) {
		
		super();
		
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
		//console.log("id: " + this.hashCode + "   #" + this.listenerCount);
		// $CORRECT_CAST
		this._listeners.forEach((listener) => listener.callback(this));
	}
	
	removeListener(listener: ae.event.Listener<This>): void {
		this._listeners.remove(listener);
	}
}

// ae.event.Event$Notify<H>
class AEClassNotifyEvent extends AEClassEvent<AEClassNotifyEvent> {
	
	constructor(host: ae.JavaObject) {
		super(host);
	}
}
