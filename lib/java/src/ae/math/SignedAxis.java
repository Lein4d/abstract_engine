package ae.math;

public enum SignedAxis {
	X_POS(Axis.X,  1, 0, 0), Y_POS(Axis.Y, 0,  1, 0), Z_POS(Axis.Z, 0, 0,  1),
	X_NEG(Axis.X, -1, 0, 0), Y_NEG(Axis.Y, 0, -1, 0), Z_NEG(Axis.Z, 0, 0, -1);
	
	public final Axis     axis;
	public final boolean  positive;
	public final Vector3D v;
	
	private SignedAxis(
			final Axis  axis,
			final float x,
			final float y,
			final float z) {
		
		this.axis     = axis;
		this.positive = x + y + z > 0;
		this.v        = Vector3D.createConst(x, y, z);
	}
}
