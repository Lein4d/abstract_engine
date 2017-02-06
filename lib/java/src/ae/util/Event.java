package ae.util;

public class Event<T extends Event<T, H>, H> extends OrganizedObject<T> {
	
	public static final class Notify<H> extends Event<Notify<H>, H> {
		public Notify(final H host) {
			super(host);
		}
	}
	
	public final H host;
	
	public Event(final H host) {
		this.host = host;
	}
	
	public void fire() {
		_propagateChange();
	}
}
