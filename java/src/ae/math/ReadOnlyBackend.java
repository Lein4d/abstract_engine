package ae.math;

public final class ReadOnlyBackend extends VectorBackend {
	
	private final VectorBackend _backend;
	
	public ReadOnlyBackend(
			final VectorBackend backend) {
		
		_backend = backend;
	}

	@Override
	public final float getElement(
			final int index) {
		
		return _backend.getElement(index);
	}
	
	@Override
	public final float getX() {
		
		return _backend.getX();
	}

	@Override
	public final float getY() {
		
		return _backend.getY();
	}

	@Override
	public final float getZ() {
		
		return _backend.getZ();
	}

	@Override
	public final float getW() {
		
		return _backend.getW();
	}

	@Override
	public final VectorBackend setElement(
			final int   index,
			final float value) {
		
		return this;
	}
	
	@Override
	public final VectorBackend setX(
			final float x) {
		
		return this;
	}

	@Override
	public final VectorBackend setY(
			final float y) {
		
		return this;
	}

	@Override
	public final VectorBackend setZ(
			final float z) {
		
		return this;
	}

	@Override
	public final VectorBackend setW(
			final float w) {
		
		return this;
	}
}
