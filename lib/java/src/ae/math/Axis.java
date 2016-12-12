package ae.math;

public enum Axis {
	X(0, 1, 0, 0), Y(1, 0, 1, 0), Z(2, 0, 0, 1);
	
	public final int      index;
	public final Vector3D v;
	
	private Axis(
			final int   index,
			final float x,
			final float y,
			final float z) {
		
		this.index = index;
		this.v     = Vector3D.createConst(x, y, z);
	}
}
