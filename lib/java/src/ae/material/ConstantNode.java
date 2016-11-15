package ae.material;

public final class ConstantNode extends Node {
	
	private final float[] _values;
	
	public ConstantNode(
			final String    name,
			final float ... values) {
		
		super(name);
		_values = values;
	}
	
	@Override
	public final void computeTypes() {
		_addOutput(null, _values.length);
		_typingSuccessful();
	}

	@Override
	public final void toSourceString(final StringBuilder dst) {
		
		if(_values.length == 1) {
			dst.append(_values[0]);
		} else {
			dst.append("vec").append(_values.length).append('(');
			for(float i : _values) dst.append(i).append(',');
			dst.setLength(dst.length() - 1);
			dst.append(')');
		}
	}
}
