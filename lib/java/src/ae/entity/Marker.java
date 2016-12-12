package ae.entity;

import ae.core.SceneGraph;
import ae.math.Vector3D;
import ae.util.CachedObject;

public final class Marker extends Entity<Marker> {

	private final CachedObject<Vector3D> _position = new CachedObject<>(
		Vector3D.createStatic(0, 0, 0),
		(pos) -> {
			final Instance instance = getInstance();
			return instance != null ?
				instance.tfToEyeSpace.applyToOrigin(pos) : pos;
		});
	
	public Marker(
			final SceneGraph sceneGraph,
			final String     name) {
		
		super(sceneGraph, Type.MARKER, name, false);
	}

	public final Vector3D getPosition() {
		return _position.getObject();
	}
	
	public final void invalidatePosition() {
		_position.invalidate();
	}
}
