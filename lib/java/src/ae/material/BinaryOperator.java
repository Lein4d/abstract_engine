package ae.material;


public final class BinaryOperator extends Node {
	
	public final char operator;
	
	private BinaryOperator(
			final String name,
			final char   operator,
			final String op1,
			final String op2) {
		
		super(name, op1, op2);
		this.operator = operator;
	}

	public static final BinaryOperator add(
    		final String name,
    		final String op1,
    		final String op2) {
		
		return new BinaryOperator(name, '+', op1, op2);
	}
	
	@Override
	public final void computeTypes() {
		
		final int dimOp1 = _getInputDimension(0);
		final int dimOp2 = _getInputDimension(1);
		
		if(dimOp2 != dimOp1 && dimOp2 != 1)
			throw new UnsupportedOperationException();
		
		_outputDim = dimOp1;
	}

	public static final BinaryOperator div(
    		final String name,
    		final String op1,
    		final String op2) {
		
		return new BinaryOperator(name, '/', op1, op2);
	}

	public static final BinaryOperator mod(
    		final String name,
    		final String op1,
    		final String op2) {
		
		return new BinaryOperator(name, '%', op1, op2);
	}
	
	public static final BinaryOperator mult(
    		final String name,
    		final String op1,
    		final String op2) {
		
		return new BinaryOperator(name, '*', op1, op2);
	}
	
	public static final BinaryOperator sub(
    		final String name,
    		final String op1,
    		final String op2) {
		
		return new BinaryOperator(name, '-', op1, op2);
	}
	
	@Override
	public final void toSourceString(final StringBuilder dst) {
		
		dst.append('(');
		_getInputNode(0).toSourceString(dst);
		dst.append(' ').append(operator).append(' ');
		_getInputNode(1).toSourceString(dst);
		dst.append(')');
	}
}
