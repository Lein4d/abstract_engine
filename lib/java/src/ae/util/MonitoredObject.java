package ae.util;

public final class MonitoredObject<T extends OrganizedObject<T>> {
	
	public interface Receiver {
		
	}
	
	public final T object;
	
	public MonitoredObject(
			final T object) {
		
		this.object = object;
		
		object.setObjectMonitor(this);
	}
	
	final void notifyChange() {
		
		
	}
}
