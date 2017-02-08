package ae.core;

import java.io.PrintStream;
import java.util.Random;
import java.util.function.Consumer;

import ae.collections.GrowingObjectPool;
import ae.collections.PooledHashMap;
import ae.collections.PooledLinkedList;
import ae.math.Matrix4D;
import ae.scenegraph.Entity;
import ae.scenegraph.Instance;
import ae.scenegraph.entities.Camera;
import ae.scenegraph.entities.DynamicSpace;
import ae.scenegraph.entities.Marker;
import ae.scenegraph.entities.Model;
import ae.util.Event;
import ae.util.OrganizedObject;

public class SceneGraph {
	
	private final class UnrollError extends OrganizedObject<UnrollError> {
		
		private final PooledLinkedList<Instance> _instanceScope =
			new PooledLinkedList<>();
		
		private Entity<?> _entity;
		private Instance  _instance;
		private String    _msg;
		
		private final void _print() {
			
			engine.err.println("\tERROR: " + _msg);
			engine.err.println(
				"\t\tin entity '" + _entity.name + "' (" + _entity.type + ")");
			
			if(_instance != null) {
				
				_instance.getScope(_instanceScope);
				
				engine.err.print("\t\tin instance [");
				for(Instance i : _instanceScope)
					engine.err.print(
						i.getEntity().name + (i != _instance ? " -> " : ""));
				engine.err.println("]");
			}
		}
		
		private final UnrollError _set(
				final Entity<?> entity,
				final String    msg) {
			
			_entity   = entity;
			_instance = null;
			_msg      = msg;
			
			return this;
		}
		
		private final UnrollError _set(
				final Instance instance,
				final String   msg) {
			
			_entity   = instance.getEntity();
			_instance = instance;
			_msg      = msg;
			
			return this;
		}
	}
	
	private static final String _ERROR_NOT_STATIC     = 
		"Scope transformations must be static";
	private static final String _ERROR_MULTI_INSTANCE =
		"Only one instance is allowed";
	
	private final Random   _random          = new Random();
	private final Matrix4D _tfCameraInverse = new Matrix4D();

	private final PooledHashMap<String, Entity<?>> _entities     =
		new PooledHashMap<>();
	private final PooledHashMap<Integer, Instance> _instances    =
		new PooledHashMap<>();
	private final GrowingObjectPool<Instance>             _instancePool =
		new GrowingObjectPool<>(() -> new Instance());
	
	// The errors during graph unrolling are stored here
	private final GrowingObjectPool<UnrollError> _unrollErrors =
		new GrowingObjectPool<>(() -> new UnrollError());
	
	// Some entities are stored in separate lists
	private final PooledLinkedList<Camera>       _cameras   =
		new PooledLinkedList<>();
	private final PooledLinkedList<Model>        _models    =
		new PooledLinkedList<>();
	private final PooledLinkedList<Marker>       _markers   =
		new PooledLinkedList<>();
	private final PooledLinkedList<DynamicSpace> _dynSpaces =
		new PooledLinkedList<>();
	
	// Some instances are stored in separate lists
	private final PooledLinkedList<Instance> _dirLightNodes   =
		new PooledLinkedList<>();
	private final PooledLinkedList<Instance> _pointLightNodes =
		new PooledLinkedList<>();
	
	private final Consumer<Instance> _unrollPostProcessor =
		(instance) -> {
			
			instance.deriveProperties();
			
			final Entity<?> entity        = instance.getEntity();
			final Instance  parent        = instance.getParent();
			final int       oldErrorCount = _unrollErrors.getUsedObjectCount();
			
			if(entity.noInheritedTF && parent != null && !parent.isFixed())
				_unrollErrors.provide()._set(instance, _ERROR_NOT_STATIC);
			
			// Deactivate the instance in case of errors
			if(_unrollErrors.getUsedObjectCount() > oldErrorCount)
				instance.deactivate();
			
			if(instance.isActive()) {
				switch(entity.type) {
					case DIRECTIONAL_LIGHT:
						_dirLightNodes  .insertAtEnd(instance); break;
					case POINT_LIGHT:
						_pointLightNodes.insertAtEnd(instance); break;
					default: break;
				}
			}
		};
	
	private final Consumer<Instance> _transformationUpdater =
		(node) -> {
			
			final Matrix4D transformation =
				node.getEntity().transformation.getActiveValue();
			
			if(node.getParent() != null) {
				node.tfToEyeSpace.
					setData       (node.getParent().tfToEyeSpace).
					multWithMatrix(transformation);
			} else {
				node.tfToEyeSpace.setData(transformation);
			}
		};
	
	private final Consumer<Instance> _treePrinter =
		(instance) -> {
			
			final Entity<?>   entity = instance.getEntity();
			final PrintStream out    = _getEngine().out;
			
			for(int i = 0; i < instance.getLevel(); i++) out.print("|\t");
			
			out.print("[" + entity.type + "] " + entity.name);
			if(instance.isFixed()) out.print(" [S]");
			out.println();
		};
	
	private Instance _rootInstance = null;
	
	public final AbstractEngine engine;
	public final Entity<?>      root;
	
	public final Event.Notify<SceneGraph> onNewTopology =
		new Event.Notify<>(this);
	
	private final String _generateRandomName(final String prefix) {
		
		String name;
		
		do {
			name = prefix + "_" + (_random.nextInt() & 0x7FFFFFFF);
		} while(_entities.hasKey(name));
		
		return name;
	}
	
	private final AbstractEngine _getEngine() {
		return engine;
	}
	
	private final void _unrollGraph(
			final PooledLinkedList<Instance> dirLights,
			final PooledLinkedList<Instance> pointLights) {
		
		if(_rootInstance != null) return;
		
		// Discard all previous instances
		_instancePool   .reset();
		_instances      .clear();
		_dirLightNodes  .clear();
		_pointLightNodes.clear();
		for(Entity<?> i : _entities.values) i.resetInstances();
		
		_unrollErrors.reset();
		
		// Start the recursive tree creation
		_rootInstance = _instantiateEntity(root, null, null, 0);
		
		// Check for graph related errors
		for(Entity<?> i : _entities.values) {
			
			final int oldErrorCount = _unrollErrors.getUsedObjectCount();
			
			if(i.getInstanceCount() > 1 && !i.multiInstance)
				_unrollErrors.provide()._set(i, _ERROR_MULTI_INSTANCE);
			
			// Check whether some errors occurred on this entity and deactivate
			// its instances
			if(_unrollErrors.getUsedObjectCount() > oldErrorCount)
				for(Instance j : i.getInstances()) j.deactivate();
		}

		// Derive instance information in a post processing step
		_traversePrefix(_rootInstance, _unrollPostProcessor);
		
		// Assign a unique ID to each instance
		int instanceId = 1;
		for(Instance i : _instancePool) {
			_instances.setValue(instanceId, i.setId(instanceId));
			instanceId++;
		}
		
		// Copy the light instances to the current frame
		dirLights  .clear();
		pointLights.clear();
		dirLights  .addAll(_dirLightNodes);
		pointLights.addAll(_pointLightNodes);
		
		// Don't print anything if there are no errors
		if(_unrollErrors.getUsedObjectCount() > 0) {
    		
    		engine.err.println(
    			_unrollErrors.getUsedObjectCount() +
    			" errors occured during scene graph unrolling (frame " +
    			engine.state.getFrameIndex() + ")");
    		
    		for(UnrollError i : _unrollErrors) i._print();
		}
		
		onNewTopology.fire();
	}
	
	private final Instance _instantiateEntity(
			final Entity<?> entity,
			final Instance  parent,
			final Instance  nextSibling,
			final int       level) {
		
		final Instance node = _instancePool.provide();
		
		Instance latestNode = null;
		
		// Die Kinder iterieren, die Sibling-Verweise sind genau andersrum wie
		// in der children-Liste gespeichert
		for(Entity<?> i : entity.getChildren())
			latestNode = _instantiateEntity(i, node, latestNode, level + 1);
		
		entity.addInstance(
			node.assign(entity, parent, latestNode, nextSibling));
		
		return node;
	}
	
	private final void _traversePrefix(
			final Instance           instance,
			final Consumer<Instance> consumer) {
		
		// Skip this instance and all its transitive children if it is marked as
		// inactive
		if(!instance.isActive()) return;
		
		consumer.accept(instance);
		
		Instance child = instance.getFirstChild();
		
		while(child != null) {
			_traversePrefix(child, consumer);
			child = child.getNextSibling();
		}
	}
	
	final void prepareRendering(
			final PooledLinkedList<Instance> dirLights,
			final PooledLinkedList<Instance> pointLights) {

		_unrollGraph(dirLights, pointLights);
		
		// Call the specific update callbacks for each entity instance
		for(Entity<?> i : _entities.values) i.update();
		
		// Reset the root transformation
		root.transformation.resetExternal();
		root.transformation.getValue().toIdentity();
		
		// Compute transformation matrices
		_traversePrefix(_rootInstance, _transformationUpdater);
		
		for(Marker       i : _markers)   i.invalidatePosition();
		for(DynamicSpace i : _dynSpaces) i.computeTransformation();
	}
	
	final void render(
			final Camera   camera,
			final Matrix4D projection,
			final boolean  useMaterial) {
		
		_tfCameraInverse.setData(camera.getInstance().tfToEyeSpace).invert();
		
		// Transform all entities into the current camera space
		for(Instance i : _instancePool)
			i.transformToCameraSpace(_tfCameraInverse);
		
		engine.state.newCamera(projection);
		
		// Render all solid models
		for(Model i : _models)
			i.drawInstances(projection, useMaterial);
	}

	public SceneGraph(final AbstractEngine engine) {
		this(engine, true);
	}
	
	public SceneGraph(
			final AbstractEngine engine,
			final boolean        addToEngine) {
		
		this.engine = engine;
		this.root   = Entity.makeRoot(this);
		
		if(addToEngine) engine.sceneGraph = this;
	}

	public final String addEntity(
			final Entity<?> entity,
			final String    tempName) {
		
		final String realName = tempName != null ?
			(_entities.hasKey(tempName) ?
				_generateRandomName(tempName) : tempName) :
			_generateRandomName("entity");
		
		_entities.setValue(realName, entity);
		
		switch(entity.type) {
			case CAMERA: _cameras.insertAtEnd((Camera)entity); break;
			case MODEL:  _models .insertAtEnd((Model) entity); break;
			case MARKER: _markers.insertAtEnd((Marker)entity); break;
			case DYNAMIC_SPACE:
				_dynSpaces.insertAtEnd((DynamicSpace)entity);
				break;
			default: break;
		}
		
		return realName;
	}
	
	public final Instance getInstance(final int id) {
		return _instances.getValue(id);
	}
	
	public final void invalidateGraphStructure() {
		_rootInstance = null;
	}
	
	public final void print() {
		if(_rootInstance != null) _traversePrefix(_rootInstance, _treePrinter);
	}
	
	public final void removeEntity(final Entity<?> entity) {
		
		if(entity.sceneGraph != this)
			throw new UnsupportedOperationException(
				"Entity belongs to different scene graph");
		
		_entities.deleteKey(entity.name);
	}
}
