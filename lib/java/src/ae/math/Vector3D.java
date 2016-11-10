package ae.math;

import ae.util.OrganizedObject;

public final class Vector3D extends OrganizedObject<Vector3D> {
	
	public static final Vector3D X_POS = createConst( 1,  0,  0);
	public static final Vector3D X_NEG = createConst(-1,  0,  0);
	public static final Vector3D Y_POS = createConst( 0,  1,  0);
	public static final Vector3D Y_NEG = createConst( 0, -1,  0);
	public static final Vector3D Z_POS = createConst( 0,  0,  1);
	public static final Vector3D Z_NEG = createConst( 0,  0, -1);
	
	public final VectorBackend backend;
	public final Vector3D      readOnly;
	
	public float x, y, z;

	public Vector3D(
			final ReadOnlyBackend backend) {
		
		this.backend  = backend;
		this.readOnly = this;
		
		backend.addListener(obj -> _propagateChange());
	}

	public Vector3D(
			final VectorBackend backend) {
		
		this.backend  = backend;
		this.readOnly = new Vector3D(new ReadOnlyBackend(backend));
		
		backend.addListener(obj -> _propagateChange());
	}

	public final Vector3D add(
			final Vector3D v) {
		
		backend.setX(backend.getX() + v.backend.getX());
		backend.setY(backend.getY() + v.backend.getY());
		backend.setZ(backend.getZ() + v.backend.getZ());
		
		return this;
	}

	public final Vector3D cloneConst() {
		
		return new Vector3D(new ReadOnlyBackend(new StaticBackend(backend)));
	}
	
	public final Vector3D cloneDeep() {
		
		return new Vector3D(backend);
	}
	
	public final Vector3D cloneStatic() {
		
		return new Vector3D(new StaticBackend(backend));
	}
	
	public final Vector3D copyStaticValues() {
		
		x = backend.getX();
		y = backend.getY();
		z = backend.getZ();
		
		return this;
	}
	
	public final float computeLength() {
		
		copyStaticValues();
		
		return (float)Math.sqrt(x * x + y * y + z * z);
	}

	public final float computeMean() {
		
		return (backend.getX() + backend.getY() + backend.getZ()) / 4;
	}

	public static final Vector3D createConst(
			final float x,
			final float y,
			final float z) {
		
		return new Vector3D(new ReadOnlyBackend(new StaticBackend(x, y, z, 1)));
	}
	
	public static final Vector3D createStatic(
			final float x,
			final float y,
			final float z) {
		
		return new Vector3D(new StaticBackend(x, y, z, 1));
	}
	
	public static final Vector3D cross(
			final Vector3D v1,
			final Vector3D v2,
			final Vector3D dst) {
		
		v1.copyStaticValues();
		v2.copyStaticValues();
		
		dst.backend.setX(v1.y * v2.z - v1.z * v2.y);
		dst.backend.setY(v1.z * v2.x - v1.x * v2.z);
		dst.backend.setX(v1.x * v2.y - v1.y * v2.x);
		
		return dst;
	}
	
	public final Vector3D div(
			final float factor) {
		
		backend.setX(backend.getX() / factor);
		backend.setY(backend.getY() / factor);
		backend.setZ(backend.getZ() / factor);
		
		return this;
	}

	public final float dot(
			final Vector3D v) {
		
		return
			backend.getX() * v.backend.getX() +
			backend.getY() * v.backend.getY() +
			backend.getZ() * v.backend.getZ();
	}
	
	public final VectorBackend getData(
			final VectorBackend dst) {
		
		dst.setX(backend.getX());
		dst.setY(backend.getY());
		dst.setZ(backend.getZ());
		
		return dst;
	}
	
	public final Vector3D getData(
			final Vector3D dst) {
		
		return dst.setData(backend);
	}
	
	public final float[] getData(
			final float[] dst) {
		
		dst[0] = backend.getX();
		dst[1] = backend.getY();
		dst[2] = backend.getZ();
		
		return dst;
	}
	
	public final float[] getData(
			final float[] dst,
			final int     offset) {
		
		dst[offset    ] = backend.getX();
		dst[offset + 1] = backend.getY();
		dst[offset + 2] = backend.getZ();
		
		return dst;
	}

	public final Vector3D mult(
			final float factor) {
		
		backend.setX(backend.getX() * factor);
		backend.setY(backend.getY() * factor);
		backend.setZ(backend.getZ() * factor);
		
		return this;
	}
	
	public final Vector3D mult(
			final Vector3D v) {
		
		backend.setX(backend.getX() * v.backend.getX());
		backend.setY(backend.getY() * v.backend.getY());
		backend.setZ(backend.getZ() * v.backend.getZ());
		
		return this;
	}
	
	public final Vector3D setData(
			final VectorBackend src) {
		
		backend.setX(src.getX());
		backend.setY(src.getY());
		backend.setZ(src.getZ());
		
		return this;
	}
	
	public final Vector3D setData(
			final Vector3D src) {
		
		return setData(src.backend);
	}

	public final Vector3D setData(
			final float x,
			final float y,
			final float z) {
		
		backend.setX(x).setY(y).setZ(z);
		
		return this;
	}
	
	public final Vector3D setData(
    		final float[] src) {
    	
    	return setData(src[0], src[1], src[2]);
    }
	
	public final Vector3D setData(
			final float[] src,
			final int     offset) {

		return setData(src[offset], src[offset + 1], src[offset + 2]);
	}
	
	public final Vector3D toZeroVector() {
		
		return setData(0, 0, 0);
	}
}
