package ae.scenegraph.entities;

import ae.core.SceneGraph;
import ae.math.Vector3D;
import ae.math.Vector4D;
import ae.scenegraph.ConstAttribute;
import ae.scenegraph.Entity;

public class PointLight extends Entity<PointLight> {

	public final ConstAttribute<Vector3D> color       =
		new ConstAttribute<>(Vector4D.WHITE.xyz.cloneStatic());
	public final ConstAttribute<float[]>  attenuation =
		new ConstAttribute<>(new float[]{1, 1});
	
	public PointLight(final SceneGraph sceneGraph) {
		this(sceneGraph, null);
	}
	
	public PointLight(
			final SceneGraph sceneGraph,
			final String     name) {
		
		super(sceneGraph, Type.POINT_LIGHT, name, false, false, true);
	}
	
	public final PointLight makeLinear() {
		return setAttenuationExponent(1);
	}

	public final PointLight makeQuadratic() {
		return setAttenuationExponent(2);
	}
	
	public final PointLight setAttenuationExponent(final float exponent) {
		attenuation.getValue()[1] = exponent;
		return this;
	}
	
	public final PointLight setRange(final float range) {
		attenuation.getValue()[0] = range;
		return this;
	}
}
