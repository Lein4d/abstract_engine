package ae.math;

public final class StaticBackend extends VectorBackend {
	
	private final float[] _data = new float[4];

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
	
	@Override
	public final float getElement(
			final int index) {
		
		return _data[index];
	}
	
	@Override
	public final float getX() {
		
		return _data[0];
	}

	@Override
	public final float getY() {
		
		return _data[1];
	}

	@Override
	public final float getZ() {
		
		return _data[2];
	}

	@Override
	public final float getW() {
		
		return _data[3];
	}

	@Override
	public final VectorBackend setElement(
			final int   index,
			final float value) {
		
		_data[index] = value;
		
		return this;
	}
	
	@Override
	public final VectorBackend setX(
			final float x) {
		
		_data[0] = x;
		
		return this;
	}

	@Override
	public final VectorBackend setY(
			final float y) {
		
		_data[1] = y;
		
		return this;
	}

	@Override
	public final VectorBackend setZ(
			final float z) {
		
		_data[2] = z;
		
		return this;
	}

	@Override
	public final VectorBackend setW(
			final float w) {
		
		_data[3] = w;
		
		return this;
	}
}
