package ae.math;

import ae.util.OrganizedObject;

public final class Vector4D extends OrganizedObject<Vector4D> {

	public interface UnaryOperator {
		float applyToComponent(float x);
	}
	
	public static final Vector4D BLACK  = createConst(0,    1);
	public static final Vector4D GREY   = createConst(0.5f, 1);
	public static final Vector4D WHITE  = createConst(1,    1);
	public static final Vector4D RED    = createConst(1, 0, 0, 1);
	public static final Vector4D GREEN  = createConst(0, 1, 0, 1);
	public static final Vector4D BLUE   = createConst(0, 0, 1, 1);
	public static final Vector4D YELLOW = createConst(1, 1, 0, 1);
	public static final Vector4D PURPLE = createConst(1, 0, 1, 1);
	public static final Vector4D CYAN   = createConst(0, 1, 1, 1);
	
	public final VectorBackend backend;
	public final Vector3D      xyz;
	public final Vector4D      readOnly;
	
	public float x, y, z, w;
	
	private Vector4D(
			final ReadOnlyBackend backend,
			final Vector3D        xyz) {
		
		this.backend  = backend;
		this.xyz      = xyz;
		this.readOnly = this;
		
		backend.addListener((obj) -> _propagateChange());
	}
	
	public Vector4D(final ReadOnlyBackend backend) {
		
		this(backend, new Vector3D(backend));
	}
	
	public Vector4D(final VectorBackend backend) {
		
		this.backend  = backend;
		this.xyz      = new Vector3D(backend);
		this.readOnly =
			new Vector4D(new ReadOnlyBackend(backend), xyz.readOnly);
		
		backend.addListener((obj) -> _propagateChange());
	}
	
	public final Vector4D add(
			final Vector4D v) {
		
		backend.setX(backend.getX() + v.backend.getX());
		backend.setY(backend.getY() + v.backend.getY());
		backend.setZ(backend.getZ() + v.backend.getZ());
		backend.setW(backend.getW() + v.backend.getW());
		
		return this;
	}

	public final Vector4D applyUnaryOp(final UnaryOperator op) {
		
		backend.setX(op.applyToComponent(backend.getX()));
		backend.setY(op.applyToComponent(backend.getY()));
		backend.setZ(op.applyToComponent(backend.getZ()));
		backend.setW(op.applyToComponent(backend.getW()));
		
		return this;
	}
	
	public final Vector4D cloneConst() {
		
		return new Vector4D(new ReadOnlyBackend(new StaticBackend(backend)));
	}
	
	public final Vector4D cloneDeep() {
		
		return new Vector4D(backend);
	}
	
	public final Vector4D cloneStatic() {
		
		return new Vector4D(new StaticBackend(backend));
	}
	
	public final float computeLength() {
		
		copyStaticValues();
		
		return (float)Math.sqrt(x * x + y * y + z * z + w * w);
	}

	public final float computeMean() {
		
		return
			(backend.getX() + backend.getY() +
			 backend.getZ() + backend.getW()) / 4;
	}

	public final Vector4D copyStaticValues() {
		
		x = backend.getX();
		y = backend.getY();
		z = backend.getZ();
		w = backend.getW();
		
		return this;
	}

	public static final Vector4D createConst(
			final float grey) {
		
		return createConst(grey, grey, grey, grey);
	}
	
	public static final Vector4D createConst(
			final float grey,
			final float w) {
		
		return createConst(grey, grey, grey, w);
	}
	
	public static final Vector4D createConst(
			final float x,
			final float y,
			final float z,
			final float w) {
		
		return new Vector4D(new ReadOnlyBackend(new StaticBackend(x, y, z, w)));
	}

	public static final Vector4D createStatic(
			final float grey) {
		
		return createStatic(grey, grey, grey, grey);
	}
	
	public static final Vector4D createStatic(
			final float grey,
			final float w) {
		
		return createStatic(grey, grey, grey, w);
	}
	
	public static final Vector4D createStatic(
			final float x,
			final float y,
			final float z,
			final float w) {
		
		return new Vector4D(new StaticBackend(x, y, z, w));
	}
	
	public final Vector4D div(
			final float factor) {
		
		backend.setX(backend.getX() / factor);
		backend.setY(backend.getY() / factor);
		backend.setZ(backend.getZ() / factor);
		backend.setW(backend.getW() / factor);
		
		return this;
	}

	public final float dot(
			final Vector4D v) {
		
		return
			backend.getX() * v.backend.getX() +
			backend.getY() * v.backend.getY() +
			backend.getZ() * v.backend.getZ() +
			backend.getW() * v.backend.getW();
	}
	
	public final VectorBackend getData(
			final VectorBackend dst) {
		
		dst.setX(backend.getX());
		dst.setY(backend.getY());
		dst.setZ(backend.getZ());
		dst.setW(backend.getW());
		
		return dst;
	}
	
	public final Vector4D getData(
			final Vector4D dst) {
		
		return dst.setData(backend);
	}
	
	public final float[] getData(
			final float[] dst) {
		
		dst[0] = backend.getX();
		dst[1] = backend.getY();
		dst[2] = backend.getZ();
		dst[3] = backend.getW();
		
		return dst;
	}
	
	public final float[] getData(
			final float[] dst,
			final int     offset) {
		
		dst[offset    ] = backend.getX();
		dst[offset + 1] = backend.getY();
		dst[offset + 2] = backend.getZ();
		dst[offset + 3] = backend.getW();
		
		return dst;
	}

	public final Vector4D mult(
			final float factor) {
		
		backend.setX(backend.getX() * factor);
		backend.setY(backend.getY() * factor);
		backend.setZ(backend.getZ() * factor);
		backend.setW(backend.getW() * factor);
		
		return this;
	}
	
	public final Vector4D mult(
			final Vector4D v) {
		
		backend.setX(backend.getX() * v.backend.getX());
		backend.setY(backend.getY() * v.backend.getY());
		backend.setZ(backend.getZ() * v.backend.getZ());
		backend.setW(backend.getW() * v.backend.getW());
		
		return this;
	}
	
	public final Vector4D setData(
			final VectorBackend src) {
		
		backend.setX(src.getX());
		backend.setY(src.getY());
		backend.setZ(src.getZ());
		backend.setW(src.getW());
		
		return this;
	}
	
	public final Vector4D setData(
			final Vector4D src) {
		
		return setData(src.backend);
	}

	public final Vector4D setData(
			final float x,
			final float y,
			final float z,
			final float w) {
		
		backend.setX(x).setY(y).setZ(z).setW(w);
		
		return this;
	}
	
	public final Vector4D setData(
    		final float[] src) {
    	
    	return setData(src[0], src[1], src[2], src[3]);
    }
	
	public final Vector4D setData(
			final float[] src,
			final int     offset) {

		return setData(
			src[offset], src[offset + 1], src[offset + 2], src[offset + 3]);
	}

	public final Vector4D sub(
			final Vector4D v) {
		
		backend.setX(backend.getX() - v.backend.getX());
		backend.setY(backend.getY() - v.backend.getY());
		backend.setZ(backend.getZ() - v.backend.getZ());
		backend.setW(backend.getW() - v.backend.getW());
		
		return this;
	}
	
	public final Vector4D toZeroPoint() {
		
		return setData(0, 0, 0, 1);
	}
	
	public final Vector4D toZeroVector() {
		
		return setData(0, 0, 0, 0);
	}
}
