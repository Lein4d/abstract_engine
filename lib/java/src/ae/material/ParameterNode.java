package ae.material;

public final class ParameterNode extends Node {
	
	public final int dimension;
	
	public ParameterNode(
    		final String name,
    		final int    dimension) {
		
		super(name);
		this.dimension = dimension;
	}
	
	@Override
	public final void computeTypes() {
		_addOutput(null, dimension);
		_typingSuccessful();
	}
	
	@Override
	public final void toSourceString(final StringBuilder dst) {
		
		// TODO
	}
}
