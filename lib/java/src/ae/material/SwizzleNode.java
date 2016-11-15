package ae.material;

public final class SwizzleNode extends Node {
	
	public final String swizzleMask;
	
	public SwizzleNode(
			final String name,
			final String input,
			final String swizzleMask) {
		
		super(name, input);
		this.swizzleMask = swizzleMask;
	}

	@Override
	public final void computeTypes() {
		_addOutput(null, swizzleMask.length());
		_typingSuccessful();
	}
	
	@Override
	public final void toSourceString(final StringBuilder dst) {
		_getInputNode(0).toSourceString(dst);
		dst.append('.').append(swizzleMask);
	}
}
