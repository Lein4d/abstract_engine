package ae.material;

public final class MergeNode extends Node {
	
    private final int _componentCount;
	
	public MergeNode(
			final String     name,
			final String ... components) {
		
		super(name, components);
		_componentCount = components.length;
	}
	
	@Override
	public final void computeTypes() {
		
		int absComponentCount = 0;
		
		for(int i = 0; i < _componentCount; i++)
			absComponentCount += _getInputDimension(i);
		
		if(absComponentCount > 4)
			throw new UnsupportedOperationException();
		
		_addOutput(null, absComponentCount);
		_typingSuccessful();
	}
	
	@Override
	public final void toSourceString(final StringBuilder dst) {
		
		// TODO
	}
}
