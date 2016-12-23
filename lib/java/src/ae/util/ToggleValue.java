package ae.util;

public final class ToggleValue {
	
	public interface Callback {
		void updateToggleValue(boolean state);
	}
	
	private final Callback _cbFalseToTrue;
	private final Callback _cbTrueToFalse;
	
	private boolean _state;
	
	public ToggleValue(final Callback cbToggle) {
		this(cbToggle, cbToggle);
	}
	
	public ToggleValue(
			final Callback cbFalseToTrue,
			final Callback cbTrueToFalse) {
		
		_cbFalseToTrue = cbFalseToTrue;
		_cbTrueToFalse = cbTrueToFalse;
	}
	
	public final boolean activate() {
		return setState(true);
	}

	public final boolean deactivate() {
		return setState(false);
	}
	
	public final boolean getState() {
		return _state;
	}
	
	public final boolean setState(final boolean state) {
		
		if(!_state &&  state) _cbFalseToTrue.updateToggleValue(true);
		if( _state && !state) _cbTrueToFalse.updateToggleValue(false);
		
		return _state = state;
	}
	
	public final boolean toggle() {
		return setState(!_state);
	}
}
