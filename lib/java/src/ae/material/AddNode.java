package ae.material;

public final class AddNode extends Node {
	
	public AddNode(
    		final String name,
    		final String op1,
    		final String op2) {
		
		super(name, op1, op2);
	}

	@Override
	public final void computeTypes() {
		
		final int dimOp1 = _getInputDimension(0);
		final int dimOp2 = _getInputDimension(1);
		
		if(dimOp1 != dimOp2) throw new UnsupportedOperationException();
		
		_addOutput(null, dimOp1);
		
		_typingSuccessful();
	}
	
	@Override
	public final void toSourceString(final StringBuilder dst) {
		
		dst.append('(');
		_getInputNode(0).toSourceString(dst);
		dst.append(" + ");
		_getInputNode(1).toSourceString(dst);
		dst.append(')');
	}
}
