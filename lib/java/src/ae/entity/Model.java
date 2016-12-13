package ae.entity;

import ae.collections.PooledLinkedList;
import ae.core.SceneGraph;
import ae.core.Texture;
import ae.material.Material;
import ae.material.StandardMaterials;
import ae.math.Matrix4D;
import ae.math.Vector3D;
import ae.math.Vector4D;
import ae.mesh.Mesh;

import static org.lwjgl.opengl.GL11.*;

public final class Model extends Entity<Model> {
	
	// Attributes neccessary for each model
	public final Attribute<Mesh>     mesh     = new Attribute<>();
	public final Attribute<Material> material = new Attribute<>();
	
	// Optional attributes for ease use with standard materials
	public final ConstAttribute<StandardMaterials.Textures> textures  =
		new ConstAttribute<>(new StandardMaterials.Textures(null, null, null));
	public final ConstAttribute<Vector3D>                   colorMask =
		new ConstAttribute<>(Vector4D.WHITE.xyz.cloneStatic());
	
	public Model(final SceneGraph sceneGraph) {
		this(sceneGraph, null);
	}
	
	public Model(
			final SceneGraph sceneGraph,
			final String     name) {
		
		super(sceneGraph, Type.MODEL, name, false, false, true);
	}
	
	public final void drawInstances(
			final Matrix4D                          projection,
			final PooledLinkedList<Entity.Instance> dirLights,
			final PooledLinkedList<Entity.Instance> pointLights) {
		
		final Mesh     activeMesh     = mesh    .getActiveValue();
		final Material activeMaterial = material.getActiveValue();
		
		// Sanity check to ensure the model is complete and can be rendered
		if(activeMesh == null || activeMaterial == null) return;
		
		// This command will be ignored if the material is no standard material
		sceneGraph.getEngine().standardMaterials.setMaterialData(
			activeMaterial,
			textures .getActiveValue(),
			colorMask.getActiveValue());

		if(activeMesh.cullFacing) {
			glEnable(GL_CULL_FACE);
		} else {
			glDisable(GL_CULL_FACE);
		}
		
		iterateInstances((instance) -> {
			
			// Pass the global scene data to the material shader
			activeMaterial.use(
				instance.tfToCameraSpace, projection, dirLights, pointLights);

			activeMesh.draw();
		});
	}
	
	public final boolean isComplete() {
		return
			mesh.getActiveValue() != null && material.getActiveValue() != null;
	}

	public final Model setColorMask(final Vector3D mask) {
		colorMask.getValue().setData(mask);
		return this;
	}

	public final Model setColorMask(
			final float red,
			final float green,
			final float blue) {
		
		colorMask.getValue().setData(red, green, blue);
		return this;
	}
	
	public final Model setDiffuseTexture(final Texture texture) {
		textures.getValue().diffuse = texture;
		return this;
	}

	public final Model setEmissiveTexture(final Texture texture) {
		textures.getValue().emissive = texture;
		return this;
	}
	
	public final Model setNormalMapTexture(final Texture texture) {
		textures.getValue().normalMap = texture;
		return this;
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
