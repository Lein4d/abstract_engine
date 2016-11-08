package ae.entity;

import ae.core.SceneGraph;
import ae.core.Texture;
import ae.math.Vector4D;
import ae.mesh.Mesh;

import static org.lwjgl.opengl.GL11.*;

public final class Model extends Entity<Model> {
	
	public final Attribute<Mesh>          mesh    = new Attribute<>();
	public final Attribute<Texture>       texture = new Attribute<>();
	public final ConstAttribute<Vector4D> color   =
		new ConstAttribute<>(Vector4D.WHITE.cloneStatic());
	
	public Model(
			final SceneGraph sceneGraph) {
		
		this(sceneGraph, null);
	}
	
	public Model(
			final SceneGraph sceneGraph,
			final String     name) {
		
		super(sceneGraph, Type.MODEL, name);
	}
	
	public final void draw() {
		
		final Mesh    activeMesh    = mesh.getActiveValue();
		final Texture activeTexture = texture.getActiveValue();
		
		if(activeMesh == null) return;
		
		if(activeMesh.textured && activeTexture != null) {
			activeTexture.use();
		} else {
			sceneGraph.getEngine().defaultTexture.use();
		}
		
		if(activeMesh.cullFacing) {
			glEnable(GL_CULL_FACE);
		} else {
			glDisable(GL_CULL_FACE);
		}
		
		activeMesh.draw();
	}
	
	public final Model setMesh(
			final Mesh mesh) {
		
		this.mesh.setInternalValue(mesh);
		
		return this;
	}
	
	public final Model setTexture(
			final Texture texture) {
		
		this.texture.setInternalValue(texture);
		
		return this;
	}
}
