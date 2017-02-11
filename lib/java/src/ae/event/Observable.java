package ae.event;

public interface Observable {
	
	default void reactToSignalChange() {}
	
	SignalEndPoint createSignalEndPoint();
}
