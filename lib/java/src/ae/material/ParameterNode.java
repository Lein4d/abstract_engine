package ae.material;

import static org.lwjgl.opengl.GL20.*;

public final class ParameterNode extends Node {
	
	private int     _uniLocation = -1;
	private float[] _value       = null;
	
	public final int    dimension;
	public final String uniType;
	public final String uniName;
	
	public ParameterNode(
    		final String name,
    		final int    dimension) {
		
		super(name);
		
		this.dimension = dimension;
		this.uniType   = dimension == 1 ? "float" : "vec" + dimension;
		this.uniName   = "u_const_" + name;
	}
	
	public final void applyToShaderProgram() {
		
		if(_value == null) return;
		
		switch(dimension) {
			case 1: glUniform1fv(_uniLocation, _value); break;
			case 2: glUniform2fv(_uniLocation, _value); break;
			case 3: glUniform3fv(_uniLocation, _value); break;
			case 4: glUniform4fv(_uniLocation, _value); break;
		}
	}
	
	@Override
	public final void computeTypes() {
		_outputDim = dimension;
	}

	public final ParameterNode setUniformLocation(final int location) {
		if(_uniLocation == -1 && location != -1) _uniLocation = location;
		return this;
	}

	public final ParameterNode setValue(final float ... value) {
		
		if(value.length != dimension)
			throw new UnsupportedOperationException(
				"New value has invalid dimension");
		
		_value = value;
		
		return this;
	}
	
	@Override
	public final void toSourceString(final StringBuilder dst) {
		dst.append(uniName);
	}
}
