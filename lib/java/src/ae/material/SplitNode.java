package ae.material;

public final class SplitNode extends Node {
	
	public SplitNode(
    		final String name,
    		final String input) {
    	
    	super(name, input);
    }
	
	@Override
	public final void computeTypes() {
		
		final int inputDim = _getInputDimension(0);
		
		if(inputDim >= 1) _addOutput("x", 1);
		if(inputDim >= 2) _addOutput("y", 1);
		if(inputDim >= 3) _addOutput("z", 1);
		if(inputDim >= 4) _addOutput("w", 1);
		
		_typingSuccessful();
	}
	
	@Override
	public final void toSourceString(final StringBuilder dst) {
		
		// TODO
	}
}
