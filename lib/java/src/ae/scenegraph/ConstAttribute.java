package ae.scenegraph;

public class ConstAttribute<T> {

	private T                 _extValueDir;
	private ConstAttribute<T> _extValueTrans;
	
	protected T _value;
	
	public ConstAttribute(final T internalValue) {
		_value = internalValue;
	}
	
	public final T getActiveValue() {
		
		T activeValue = null;
		
		if(_extValueTrans != null)
			activeValue = _extValueTrans.getActiveValue();
		
		return activeValue != null ?
			activeValue : (_extValueDir != null ? _extValueDir : _value);
	}
	
	public final T getValue() {
		return _value;
	}
	
	public final void resetExternal() {
		_extValueDir   = null;
		_extValueTrans = null;
	}
	
	public final void setExternalValue(final T externalValue) {
		_extValueDir = externalValue;
	}
	
	public final void setExternalValue(
			final ConstAttribute<T> externalValue) {
		
		_extValueTrans = externalValue;
	}
}
