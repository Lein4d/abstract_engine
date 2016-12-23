package ae.core;

import java.util.function.Consumer;

import ae.collections.PooledOrderedSet;

public class Event<T extends Event<T, H>, H> {
	
	public static final class Notify<H> extends Event<Notify<H>, H> {
		public Notify(final H host) {
			super(host);
		}
	}
	
	private final PooledOrderedSet<Consumer<T>> _listeners =
		new PooledOrderedSet<>();
	
	public final H host;
	
	public Event(final H host) {
		this.host = host;
	}
	
	public final void addListener(final Consumer<T> listener) {
		_listeners.insertAtEnd(listener);
	}
	
	@SuppressWarnings("unchecked")
	public void fire() {
		for(Consumer<T> i : _listeners) i.accept((T)this);
	}
	
	public final void removeListener(final Consumer<T> listener) {
		_listeners.remove(listener);
	}
}
