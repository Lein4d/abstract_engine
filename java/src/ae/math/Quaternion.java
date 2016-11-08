package ae.math;

public final class Quaternion {
	
	public final VectorBackend backend;
	
	public float a, b, c, d;
	
	public Quaternion(
			final VectorBackend backend) {
		
		this.backend = backend;
	}

	public final Quaternion copyStaticValues() {
		
		a = backend.getX();
		b = backend.getY();
		c = backend.getZ();
		d = backend.getW();
		
		return this;
	}
}
