package ae.scenegraph;

public final class Attribute<T> extends ConstAttribute<T> {

	public Attribute() {
		this(null);
	}
	
	public Attribute(final T internalValue) {
		super(internalValue);
	}
	
	public final void setInternalValue(final T interalvalue) {
		_value = interalvalue;
	}
}
