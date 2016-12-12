package ae.math;

public enum SignedAxis {
	X_POS( 1, 0, 0), Y_POS(0,  1, 0), Z_POS(0, 0,  1),
	X_NEG(-1, 0, 0), Y_NEG(0, -1, 0), Z_NEG(0, 0, -1);
	
	public final Vector3D v;
	
	private SignedAxis(
			final float x,
			final float y,
			final float z) {
		
		v = Vector3D.createConst(x, y, z);
	}
}
