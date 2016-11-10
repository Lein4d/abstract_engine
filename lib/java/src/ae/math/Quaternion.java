package ae.math;

import ae.util.OrganizedObject;

public final class Quaternion extends OrganizedObject<Quaternion> {
	
	public final VectorBackend backend;
	
	public float a, b, c, d;
	
	public Quaternion(final VectorBackend backend) {
		this.backend = backend;
		backend.addListener(obj -> _propagateChange());
	}

	public final Quaternion copyStaticValues() {
		
		a = backend.getX();
		b = backend.getY();
		c = backend.getZ();
		d = backend.getW();
		
		return this;
	}
}
