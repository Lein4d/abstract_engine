package ae.entity;

import ae.core.SceneGraph;

public final class Camera extends Entity<Camera> {

	public final Attribute<Float> visibleRatio = new Attribute<Float>(1f);
	
	public Camera(
			final SceneGraph sceneGraph,
			final String     name) {
		
		super(sceneGraph, Type.CAMERA, name);
	}

	public final Camera setVisibleRatio(final float ratio) {
		visibleRatio.setInternalValue(ratio);
		return this;
	}
}
