
// (Boxing type for a consumer)
class AEClassListener<T> extends AEClassJavaObject {
	
	callback: Consumer<T>;
	
	constructor(callback: Consumer<T>) {
		
		super();
		
		this.callback = callback;
		Object.freeze(this);
	}
}

// ae.event.Event<This,H> (the host is member of derived classed)
class AEClassEvent<This> extends AEClassJavaObject {
	
	_listeners: ae.col.PooledOrderedSet<ae.event.Listener<This>>;
	
	// public constructor //////////////////////////////////////////////////////
	
	constructor() {
		super();
		this._listeners = new AEClassPooledOrderedSet();
	}
	
	// public getters + setters ////////////////////////////////////////////////
	
	get listenerCount(): number {return this._listeners.size;}
	
	// public methods //////////////////////////////////////////////////////////
	
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

class AEClassNotifyEvent<H> extends AEClassEvent<AEClassNotifyEvent<H>> {
	
	host: H;
	
	constructor(host: H) {
		super();
		this.host = host;
		Object.freeze(this);
	}
}
