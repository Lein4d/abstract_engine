package ae.mesh;

import java.util.LinkedList;
import java.util.List;
import java.util.function.Consumer;

import ae.core.SceneGraph;
import ae.scenegraph.Entity;
import ae.scenegraph.entities.Model;
import ae.util.NameDomain;

public final class ModelNode {
	
	private final List<ModelNode> _children = new LinkedList<>();
	
	public final String                name;
	public final NameDomain<ModelNode> domain;
	public final MeshBuilder           mesh;
	
	public ModelNode(
			final String                name,
			final NameDomain<ModelNode> domain) {

		this.domain = domain != null ? domain : new NameDomain<>("part_");
		this.name   = this.domain.isNameAvailable(name) ?
			this.domain.addObject(this, name) : this.domain.addObject(this);
		this.mesh   = new MeshBuilder();
	}
	
	public ModelNode(
			final ModelNode parent,
			final String    name) {
		
		this(name, parent.domain);
		parent._children.add(this);
	}
	
	public final boolean hasValidMesh() {
		return true;
		//return mesh.getPositions() != null;
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
			final Consumer<Model> setupCallback) {
		
		Entity<? extends Entity<?>> entity;
		
		if(hasValidMesh()) {
			
			final Model model =
				new Model(sceneGraph, name).setMesh(mesh.createMesh());
			
			setupCallback.accept(model);
			entity = model;
			
		} else {
			
			entity = new Entity<Entity<?>>(sceneGraph, name, true);
		}
		
		for(ModelNode i : _children)
			entity.addChild(i.toNestedEntity(sceneGraph, setupCallback));
		
		return entity;
	}
	
	public final Model toSingleModel(final SceneGraph sceneGraph) {
		
		if(isNested())
			throw new UnsupportedOperationException("Model is nested");
		
		return new Model(sceneGraph, name).setMesh(mesh.createMesh());
	}
}
