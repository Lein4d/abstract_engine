package ae.scenegraph;

import java.util.function.Consumer;

import ae.collections.PooledHashMap;
import ae.collections.PooledLinkedList;
import ae.math.Matrix4D;

public class Entity<T> {
	
	public enum Type {
		NONE, CAMERA, MODEL, DIRECTIONAL_LIGHT, POINT_LIGHT, MARKER,
		DYNAMIC_SPACE
	}
	
	public interface Updater<T> {
		void update(T entity, double time, double delta);
	}
	
	private final PooledLinkedList<Entity<?>>      _childrenByOrder;
	private final PooledHashMap<String, Entity<?>> _childrenByName;
	private final PooledLinkedList<Instance>       _instances;
	
	private Updater<T> _updater = null;
	
	public final String     name;
	public final Type       type;
	public final T          downCasted;
	public final SceneGraph sceneGraph;
	public final boolean    noTF;
	public final boolean    noInheritedTF;
	public final boolean    multiInstance;
	
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
		
		this.name          =
			name != null ? name : sceneGraph.generateRandomEntityName();
		this.type          = type;
		this.downCasted    = (T)this;
		this.sceneGraph    = sceneGraph;
		this.noTF          = noTF;
		this.noInheritedTF = noInheritedTF;
		this.multiInstance = multiInstance;
		
		sceneGraph.addEntity(this);
		
		_childrenByOrder =
			new PooledLinkedList<>(sceneGraph.nodePoolChildrenLL, false);
		_childrenByName  =
			new PooledHashMap   <>(sceneGraph.nodePoolChildrenHM, false);
		_instances       =
			new PooledLinkedList<>(sceneGraph.nodePoolInstances,  false);
	}
	
	public final void addChild(final Entity<?> entity) {
		
		if(entity.sceneGraph != sceneGraph)
			throw new UnsupportedOperationException(
				"Entity belongs to different scene graph");
		
		_childrenByOrder.insertAtEnd(entity);
		_childrenByName .setValue(entity.name, entity);
		
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
		return _childrenByOrder.getSize();
	}
	
	public final Instance getInstance() {
		
		if(multiInstance || _instances.isEmpty()) return null;
		
		final Instance instance = _instances.getFirst();
		return instance.isActive() ? instance : null;
	}

	public final int getInstanceCount() {
		return _instances.getSize();
	}
	
	public static final Entity<?> group(
			final String        name,
			final boolean       hasTransformation,
			final Entity<?> ... children) {
		
		final Entity<?> entity = new Entity<Entity<?>>(
			children[0].sceneGraph, Type.NONE, name,
			!hasTransformation, false, true);
		
		for(Entity<?> i : children) entity.addChild(i);
		
		return entity;
	}

	@Override
	public final int hashCode() {
		return name.hashCode();
	}
	
	public final void iterateChildren(final Consumer<Entity<?>> worker) {
		for(Entity<?> i : _childrenByOrder) worker.accept(i);
	}
	
	public final void iterateInstances(final Consumer<Instance> worker) {
		for(Instance i : _instances) if(i.isActive()) worker.accept(i);
	}

	public static final Entity<?> makeRoot(final SceneGraph sceneGraph) {
		return new Entity<Entity<?>>(
			sceneGraph, Type.NONE, "root", true, true, false);
	}

	public final void resetInstances() {
		_instances.removeAll();
	}
	
	public final T setUpdater(final Updater<T> updater) {
		_updater = updater;
		return downCasted;
	}
	
	public final void update(
			final double time,
			final double delta) {
		
		if(_updater == null) return;
		
		_updater.update(downCasted, time, delta);
		if(noTF) transformation.resetExternal();
	}
}