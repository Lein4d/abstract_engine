package ae.entity;

import java.util.function.Consumer;

import ae.collections.PooledHashMap;
import ae.collections.PooledLinkedList;
import ae.core.SceneGraph;
import ae.math.Matrix4D;
import ae.util.OrganizedObject;

public class Entity<T> {
	
	public enum Type {
		NONE, CAMERA, MODEL, DIRECTIONAL_LIGHT, POINT_LIGHT
	}
	
	public interface Updater<T> {
		void update(T entity, double time, double delta);
	}
	
	public static class ConstAttribute<T> {
		
		private T                 _extValueDir;
		private ConstAttribute<T> _extValueTrans;
		
		protected T _value;
		
		public ConstAttribute(final T internalValue) {
			_value = internalValue;
		}
		
		public final T getActiveValue() {
			
			T activeValue = null;
			
			if(_extValueTrans != null)
				activeValue = _extValueTrans.getActiveValue();
			
			return activeValue != null ?
				activeValue : (_extValueDir != null ? _extValueDir : _value);
		}
		
		public final T getValue() {
			return _value;
		}
		
		public final void setExternalValue(final T externalValue) {
			_extValueDir = externalValue;
		}
		
		public final void setExternalValue(
				final ConstAttribute<T> externalValue) {
			
			_extValueTrans = externalValue;
		}
	}
	
	public static final class Attribute<T> extends ConstAttribute<T> {
		
		public Attribute() {
			this(null);
		}
		
		public Attribute(final T internalValue) {
			super(internalValue);
		}
		
		public final void setInternalValue(final T interalvalue) {
			_value = interalvalue;
		}
	}
	
	public static final class Instance extends OrganizedObject<Instance> {
		
		public final Matrix4D tfToEyeSpace    = new Matrix4D();
		public final Matrix4D tfToCameraSpace = new Matrix4D();
		
		private Entity<?> _entity;
		private int       _level;
		
		// 'null', falls Knoten zur Wurzel gehört
		private Instance _parent;
		
		// 'null', falls keine Kinder vorhanden
		private Instance _firstChild;
		
		// 'null', falls keine weiteren Geschwister vorhanden
		private Instance _nextSibling;
		
		public final Entity<?> getEntity() {
			return _entity;
		}
		
		public final Instance getFirstChild() {
			return _firstChild;
		}
		
		public final int getLevel() {
			return _level;
		}
		
		public final Instance getNextSibling() {
			return _nextSibling;
		}
		
		public final Instance getParent() {
			return _parent;
		}
		
		public final Instance transformToCameraSpace(
				final Matrix4D tfCameraInverse) {
			
			tfToCameraSpace.setData(tfCameraInverse);
			tfToCameraSpace.multWithMatrix(tfToEyeSpace);
			
			return this;
		}
	}
	
	private final PooledLinkedList<Entity<?>>      _childrenByOrder;
	private final PooledHashMap<String, Entity<?>> _childrenByName;
	private final PooledLinkedList<Instance>       _instances;
	
	private Updater<T> _updater = null;
	
	public final String     name;
	public final Type       type;
	public final T          downCasted;
	public final SceneGraph sceneGraph;
	public final boolean    multiInstance;
	
	// Attributes
	public final ConstAttribute<Matrix4D> transformation =
		new ConstAttribute<>(new Matrix4D());
	
	@SuppressWarnings("unchecked")
	protected Entity(
			final SceneGraph sceneGraph,
			final Type       type,
			final String     name,
			final boolean    multiInstance) {
		
		this.name          =
			name != null ? name : sceneGraph.generateRandomEntityName();
		this.type          = type;
		this.downCasted    = (T)this;
		this.sceneGraph    = sceneGraph;
		this.multiInstance = multiInstance;
		
		sceneGraph.addEntity(this);
		
		_childrenByOrder =
			new PooledLinkedList<>(sceneGraph.nodePoolChildrenLL, false);
		_childrenByName  =
			new PooledHashMap<>(sceneGraph.nodePoolChildrenHM, false);
		_instances       =
			new PooledLinkedList<>(sceneGraph.nodePoolInstances, false);
	}
	
	public Entity(
    		final SceneGraph sceneGraph,
    		final String     name) {
		
		this(sceneGraph, Type.NONE, name, true);
	}
	
	public final void addChild(final Entity<?> entity) {
		
		if(entity.sceneGraph != sceneGraph)
			throw new UnsupportedOperationException(
				"Entity belongs to different scene graph");
		
		_childrenByOrder.insertAtEnd(entity);
		_childrenByName .setValue(entity.name, entity);
		
		sceneGraph.invalidateGraphStructure();
	}
	
	public final Instance addInstance(
			final Instance instance,
			final Instance parent,
			final Instance firstChild,
			final Instance nextSibling,
			final int      level) {
		
		instance._entity      = this;
		instance._parent      = parent;
		instance._firstChild  = firstChild;
		instance._nextSibling = nextSibling;
		instance._level       = level;
		
		_instances.insertAtEnd(instance);
		
		return instance;
	}
	
	@Override
	public final boolean equals(final Object obj) {
		if(!(obj instanceof Entity<?>)) return false;
		return name.equals(((Entity<?>)obj).name);
	}
	
	public final Instance getInstance() {
		return multiInstance || _instances.isEmpty() ?
			null : _instances.getFirst();
	}
	
	public static final Entity<?> group(
			final String        name,
			final Entity<?> ... children) {
		
		final Entity<?> entity =
			new Entity<Entity<?>>(children[0].sceneGraph, name);
		
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
		for(Instance i : _instances) worker.accept(i);
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
		
		if(_updater != null) _updater.update(downCasted, time, delta);
	}
}
