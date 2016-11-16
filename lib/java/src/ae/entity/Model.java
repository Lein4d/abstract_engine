package ae.entity;

import ae.core.SceneGraph;
import ae.material.Material;
import ae.math.Matrix4D;
import ae.mesh.Mesh;

import static org.lwjgl.opengl.GL11.*;

public final class Model extends Entity<Model> {
	
	public final Attribute<Mesh>     mesh     = new Attribute<>();
	public final Attribute<Material> material = new Attribute<>();
	
	public Model(final SceneGraph sceneGraph) {
		this(sceneGraph, null);
	}
	
	public Model(
			final SceneGraph sceneGraph,
			final String     name) {
		
		super(sceneGraph, Type.MODEL, name);
	}
	
	public final void draw(final Matrix4D curTransformation) {
		
		final Mesh activeMesh = mesh.getActiveValue();
		
		if(activeMesh == null) return;
		
		if(activeMesh.cullFacing) {
			glEnable(GL_CULL_FACE);
		} else {
			glDisable(GL_CULL_FACE);
		}
		
		activeMesh.draw();
	}
	
	public final boolean isComplete() {
		return
			mesh.getActiveValue() != null && material.getActiveValue() != null;
	}
	
	public final Model setMesh(final Mesh mesh) {
		this.mesh.setInternalValue(mesh);
		return this;
	}
	
	public final Model setMaterial(final Material material) {
		this.material.setInternalValue(material);
		return this;
	}
}
