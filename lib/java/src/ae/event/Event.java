package ae.event;

import java.util.function.Consumer;

import ae.collections.PooledOrderedSet;

public class Event<This, H> {
	
	public static final class Notify<H> extends Event<Notify<H>, H> {
		public Notify(final H host) {
			super(host);
		}
	}
	
	private final PooledOrderedSet<Consumer<This>> _listeners =
		new PooledOrderedSet<>();
	
	public final H host;
	
	public Event(final H host) {
		this.host = host;
	}
	
	public final void addListener(final Consumer<This> listener) {
		_listeners.insertAtEnd(listener);
	}
	
	@SuppressWarnings("unchecked")
	public void fire() {
		for(Consumer<This> i : _listeners) i.accept((This)this);
	}
	
	public final int getListenerCount() {
		return _listeners.getSize();
	}
	
	public final void removeListener(final Consumer<This> listener) {
		_listeners.remove(listener);
	}
}
