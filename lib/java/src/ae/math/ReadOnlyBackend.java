package ae.math;

public final class ReadOnlyBackend extends VectorBackend {
	
	private final VectorBackend _backend;
	
	@Override
	protected final float _getElement(final int index) {
		return _backend.getElement(index);
	}
	
	@Override
	protected final float _getX() {return _backend.getX();}
	@Override
	protected final float _getY() {return _backend.getY();}
	@Override
	protected final float _getZ() {return _backend.getZ();}
	@Override
	protected final float _getW() {return _backend.getW();}

	@Override
	protected final void _setElement(
		final int   index,
		final float value) {}
	
	@Override
	protected final void _setX(final float x) {}
	@Override
	protected final void _setY(final float y) {}
	@Override
	protected final void _setZ(final float z) {}
	@Override
	protected final void _setW(final float w) {}

	public ReadOnlyBackend(
			final VectorBackend backend) {
		
		_backend = backend;
	}
}
