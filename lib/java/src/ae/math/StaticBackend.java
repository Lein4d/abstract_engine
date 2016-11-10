package ae.math;

public final class StaticBackend extends VectorBackend {
	
	private final float[] _data = new float[4];

	@Override
	protected final float _getElement(final int index) {return _data[index];}
	
	@Override
	protected final float _getX() {return _data[0];}
	@Override
	protected final float _getY() {return _data[1];}
	@Override
	protected final float _getZ() {return _data[2];}
	@Override
	protected final float _getW() {return _data[3];}
	
	@Override
	protected final void _setElement(
			final int   index,
			final float value) {
		
		_data[index] = value;
	}
	
	@Override
	protected final void _setX(final float x) {_data[0] = x;}
	@Override
	protected final void _setY(final float y) {_data[1] = y;}
	@Override
	protected final void _setZ(final float z) {_data[2] = z;}
	@Override
	protected final void _setW(final float w) {_data[3] = w;}

	public StaticBackend(
			final VectorBackend backend) {
		
		this(backend.getX(), backend.getY(), backend.getZ(), backend.getW());
	}
	
	public StaticBackend(
			final float x,
			final float y,
			final float z,
			final float w) {
		
		_data[0] = x;
		_data[1] = y;
		_data[2] = z;
		_data[3] = w;
	}
}
