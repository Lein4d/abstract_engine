package ae.mesh;

import java.util.LinkedList;
import java.util.List;
import java.util.function.Consumer;

import ae.core.SceneGraph;
import ae.scenegraph.Entity;
import ae.scenegraph.entities.Model;

public final class ModelNode {
	
	private final List<ModelNode> _children = new LinkedList<>();
	
	public final MeshBuilder mesh = new MeshBuilder();
	public       String      name = null;
	
	public ModelNode() {
		this(null);
	}
	
	public ModelNode(final ModelNode parent) {
		if(parent != null) parent._children.add(this);
	}
	
	public final boolean hasValidMesh() {
		return mesh.getVertexCount() > 0;
	}
	
	public final boolean isNested() {
		return !_children.isEmpty();
	}
	
	public final ModelNode simplify() {
		
		final List<ModelNode> filteredChildren = new LinkedList<>();
		ModelNode             simpleMN;
		
		// Simplify each child
		for(ModelNode i : _children)
			if((simpleMN = i.simplify()) != null)
				filteredChildren.add(simpleMN);
		
		if(filteredChildren.isEmpty()) {
			return hasValidMesh() ? this : null;
		} else if(filteredChildren.size() == 1) {
			return hasValidMesh() ? this : filteredChildren.get(0);
		} else {
			return this;
		}
	}
	
	public final Entity<? extends Entity<?>> toNestedEntity(
			final SceneGraph      sceneGraph,
			final String          rootName,
			final Consumer<Model> setupCallback) {
		
		Entity<? extends Entity<?>> entity;
		
		final String entityName = rootName + (name != null ? "_" + name : "");
		
		if(hasValidMesh()) {
			
			final Model model =
				new Model(sceneGraph, entityName).setMesh(mesh.createMesh());
			
			setupCallback.accept(model);
			entity = model;
			
		} else {
			
			entity = new Entity<Entity<?>>(sceneGraph, entityName, true);
		}
		
		for(ModelNode i : _children)
			entity.addChild(
				i.toNestedEntity(sceneGraph, rootName, setupCallback));
		
		return entity;
	}
	
	public final Model toSingleModel(final SceneGraph sceneGraph) {
		
		if(isNested())
			throw new UnsupportedOperationException("Model is nested");
		
		return new Model(sceneGraph, name).setMesh(mesh.createMesh());
	}
}
