package ae.math;

public abstract class VectorBackend {
	
	public float getElement(
			final int index) {
		
		switch(index) {
			case 0: return getX();
			case 1: return getY();
			case 2: return getZ();
			case 3: return getW();
		}
		
		throw new IndexOutOfBoundsException();
	}
	
	public abstract float getX();
	public abstract float getY();
	public abstract float getZ();
	public abstract float getW();

	public VectorBackend setElement(
			final int   index,
			final float value) {
		
		switch(index) {
			case 0: return setX(value);
			case 1: return setY(value);
			case 2: return setZ(value);
			case 3: return setW(value);
		}
		
		throw new IndexOutOfBoundsException();
	}
	
	public abstract VectorBackend setX(final float x);
	public abstract VectorBackend setY(final float y);
	public abstract VectorBackend setZ(final float z);
	public abstract VectorBackend setW(final float w);
}
