package ae.scenegraph;

import java.util.function.Consumer;

import ae.collections.PooledLinkedList;
import ae.core.RenderState;
import ae.core.SceneGraph;
import ae.math.Matrix4D;

public class Entity<T> {
	
	public enum Type {
		NONE, CAMERA, MODEL, DIRECTIONAL_LIGHT, POINT_LIGHT, MARKER,
		DYNAMIC_SPACE
	}
	
	private final PooledLinkedList<Entity<?>> _children  =
		new PooledLinkedList<>();
	private final PooledLinkedList<Instance>  _instances =
		new PooledLinkedList<>();
	
	public final String     name;
	public final Type       type;
	public final T          downCasted;
	public final SceneGraph sceneGraph;
	public final boolean    noTF;
	public final boolean    noInheritedTF;
	public final boolean    multiInstance;
	
	public final RenderState.UpdateEvent<T> onUpdate;
	
	// The ...Rec values will affect the children in a recursive manner and
	// override the children's attributes
	public boolean rendered    = true;
	public boolean renderedRec = true;
	public boolean pickable    = true;
	public boolean pickableRec = true;
	
	// Attributes
	public final ConstAttribute<Matrix4D> transformation =
		new ConstAttribute<>(new Matrix4D());
	
	@SuppressWarnings("unchecked")
	protected Entity(
			final SceneGraph sceneGraph,
			final Type       type,
			final String     name,
			final boolean    noTF,
			final boolean    noInheritedTF,
			final boolean    multiInstance) {
		
		this.type          = type;
		this.name          = sceneGraph.addEntity(this, name);
		this.downCasted    = (T)this;
		this.sceneGraph    = sceneGraph;
		this.noTF          = noTF;
		this.noInheritedTF = noInheritedTF;
		this.multiInstance = multiInstance;
		this.onUpdate      =
			sceneGraph.engine.state.createUpdateEvent(downCasted);
	}
	
	public Entity(
			final SceneGraph sceneGraph,
			final String     name,
			final boolean    hasTransformation) {
		
		this(sceneGraph, Type.NONE, name, !hasTransformation, false, true);
	}
	
	public final void addChild(final Entity<?> entity) {
		
		if(entity.sceneGraph != sceneGraph)
			throw new UnsupportedOperationException(
				"Entity belongs to different scene graph");
		
		_children .insertAtEnd(entity);
		sceneGraph.invalidateGraphStructure();
	}
	
	public final Instance addInstance(final Instance instance) {
		_instances.insertAtEnd(instance);
		return instance;
	}
	
	@Override
	public final boolean equals(final Object obj) {
		if(!(obj instanceof Entity<?>)) return false;
		return name.equals(((Entity<?>)obj).name);
	}

	public final int getChildCount() {
		return _children.getSize();
	}

	public final Iterable<Entity<?>> getChildren() {
		return _children;
	}

	public final Instance getInstance() {
		
		if(multiInstance || _instances.isEmpty()) return null;
		
		final Instance instance = _instances.getFirst();
		return instance.isActive() ? instance : null;
	}

	public final int getInstanceCount() {
		return _instances.getSize();
	}

	public final Iterable<Instance> getInstances() {
		return _instances;
	}
	
	public static final Entity<?> group(
			final String        name,
			final boolean       hasTransformation,
			final Entity<?> ... children) {
		
		final Entity<?> entity =
			new Entity<>(children[0].sceneGraph, name, hasTransformation);
		
		for(Entity<?> i : children) entity.addChild(i);
		
		return entity;
	}

	@Override
	public final int hashCode() {
		return name.hashCode();
	}
	
	public static final Entity<?> makeRoot(final SceneGraph sceneGraph) {
		return new Entity<Entity<?>>(
			sceneGraph, Type.NONE, "root", true, true, false);
	}

	public final void resetInstances() {
		_instances.clear();
	}
	
	public final T setUpdateCallback(
			final Consumer<RenderState.UpdateEvent<T>> callback) {
		
		onUpdate.addListener(callback);
		return downCasted;
	}
	
	public final void update() {
		onUpdate.fire();
		if(noTF) transformation.resetExternal();
	}
}
