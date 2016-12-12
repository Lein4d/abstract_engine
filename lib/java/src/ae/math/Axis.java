package ae.math;

public enum Axis {
	X(1, 0, 0), Y(0, 1, 0), Z(0, 0, 1);
	
	public final Vector3D v;
	
	private Axis(
			final float x,
			final float y,
			final float z) {
		
		v = Vector3D.createConst(x, y, z);
	}
}
