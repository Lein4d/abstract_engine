package ae.entity;

import ae.core.SceneGraph;
import ae.math.Vector3D;
import ae.math.Vector4D;

public class DirectionalLight extends Entity<DirectionalLight> {

	public final ConstAttribute<Vector3D> color     =
		new ConstAttribute<>(Vector4D.WHITE.xyz.cloneStatic());	
	public final ConstAttribute<Vector3D> direction =
		new ConstAttribute<>(Vector3D.createStatic(0, 1, 0));
	public final ConstAttribute<float[]>  dotBias   =
		new ConstAttribute<>(new float[]{1, 0});

	public DirectionalLight(final SceneGraph sceneGraph) {
		this(sceneGraph, null);
	}
	
	public DirectionalLight(
			final SceneGraph sceneGraph,
			final String     name) {
		
		super(sceneGraph, Type.DIRECTIONAL_LIGHT, name);
	}
	
	public final DirectionalLight makeAmbient() {
		
		dotBias.getValue()[0] = 0.5f;
		dotBias.getValue()[1] = 0.5f;
		
		return this;
	}

	public final DirectionalLight makeSpot() {
		
		dotBias.getValue()[0] = 1;
		dotBias.getValue()[1] = 0;
		
		return this;
	}
}
