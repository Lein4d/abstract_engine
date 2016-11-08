package ae.other;

public class CachedObject<T> {
	
	public interface Updater<T> {
		
		// It may create a new object or renew the existing object
		T update(T object);
	}
	
	private final Updater<T> _updater;

	private T       _object;
	private boolean _valid = false;
	
	public CachedObject(
			final T          object,
			final Updater<T> updater) {
		
		_object  = object;
		_updater = updater;
	}
	
	public final T getObject() {
		
		if(!_valid) {
			_object = _updater.update(_object);
			_valid  = true;
		}
		
		return _object;
	}
	
	public final void invalidate() {
		
		_valid = false;
	}
}
