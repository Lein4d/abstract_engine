package ae.scenegraph;

import java.io.PrintStream;
import java.util.Random;
import java.util.function.Consumer;

import ae.collections.LinkedListNode;
import ae.collections.ObjectPool;
import ae.collections.PooledHashMap;
import ae.collections.PooledLinkedList;
import ae.core.AbstractEngine;
import ae.math.Matrix4D;
import ae.scenegraph.entities.Camera;
import ae.scenegraph.entities.DynamicSpace;
import ae.scenegraph.entities.Marker;
import ae.scenegraph.entities.Model;
import ae.util.OrganizedObject;

public class SceneGraph {
	
	private final class UnrollError extends OrganizedObject<UnrollError> {
		
		private final PooledLinkedList<Instance> _instanceScope =
			new PooledLinkedList<>();
		
		private Entity<?> _entity;
		private Instance  _instance;
		private String    _msg;
		
		private final void _print() {
			
			_engine.err.println("\tERROR: " + _msg);
			_engine.err.println(
				"\t\tin entity '" + _entity.name + "' (" + _entity.type + ")");
			
			if(_instance != null) {
				
				_instance.getScope(_instanceScope);
				
				_engine.err.print("\t\tin instance [");
				for(Instance i : _instanceScope)
					_engine.err.print(
						i.getEntity().name + (i != _instance ? " -> " : ""));
				_engine.err.println("]");
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
	
	private final Random                           _random    = new Random();
	private final PooledHashMap<String, Entity<?>> _entities  =
		new PooledHashMap<>();
	private final ObjectPool<Instance>             _instances =
		new ObjectPool<>(() -> new Instance());
	
	// The errors during graph unrolling are stored here
	private final ObjectPool<UnrollError> _unrollErrors =
		new ObjectPool<>(() -> new UnrollError());
	
	// Some entities are stored in separate lists
	private final PooledLinkedList<Camera> _cameras = new PooledLinkedList<>();
	private final PooledLinkedList<Model>  _models  = new PooledLinkedList<>();
	private final PooledLinkedList<Marker> _markers = new PooledLinkedList<>();
	private final PooledLinkedList<DynamicSpace> _dynSpaces =
		new PooledLinkedList<>();
	
	// Some instances are stored in separate lists
	private final PooledLinkedList<Instance> _dirLightNodes   =
		new PooledLinkedList<>();
	private final PooledLinkedList<Instance> _pointLightNodes =
		new PooledLinkedList<>();
	
	private final Consumer<Instance> _instanceDeactivator =
		(instance) -> instance.deactivate();
	
	private final Consumer<Instance> _unrollPostProcessing =
		(instance) -> {
			
			instance.deriveProperties();
			
			final Entity<?> entity        = instance.getEntity();
			final Instance  parent        = instance.getParent();
			final int       oldErrorCount = _unrollErrors.getSize();
			
			if(entity.noInheritedTF && parent != null && !parent.isStatic())
				_unrollErrors.provideObject()._set(instance, _ERROR_NOT_STATIC);
			
			// Deactivate the instance in case of errors
			if(_unrollErrors.getSize() > oldErrorCount) instance.deactivate();
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
			final PrintStream out    = getEngine().out;
			
			for(int i = 0; i < instance.getLevel(); i++) out.print("|\t");
			
			out.print("[" + entity.type + "] " + entity.name);
			if(instance.isStatic()) out.print(" [S]");
			out.println();
		};

	// Used during scene graph unrolling
	private Instance _tempLatestNode;
	
	private AbstractEngine _engine       = null;
	private Instance       _rootInstance = null;
	
	// Node pool for the children linked list of an entity
	public final ObjectPool<LinkedListNode<Entity<?>>> nodePoolChildrenLL =
		PooledLinkedList.<Entity<?>>createNodePool();
	
	// Node pool for the children hashmap of an entity
	public final ObjectPool<LinkedListNode<PooledHashMap.KeyValuePair
			<String, Entity<?>>>> nodePoolChildrenHM =
		PooledHashMap.<String, Entity<?>>createNodePool();

	// Node pool for the instance list of an entity
	public final ObjectPool<LinkedListNode<Instance>> nodePoolInstances =
		PooledLinkedList.<Instance>createNodePool();
	
	// The root cannot be transformed, the matrix will be reseted to identity
	public final Entity<?> root;
	
	private final void _unrollGraph(
			final int    frameIndex,
			final double time) {
		
		if(_rootInstance != null) return;
		
		// Discard all previous instances
		_instances   .reset();
		_dirLightNodes  .removeAll();
		_pointLightNodes.removeAll();
		for(Entity<?> i : _entities.values) i.resetInstances();
		
		_unrollErrors.reset();
		
		// Start the recursive tree creation
		_rootInstance = _instantiateEntity(root, null, null, 0);
		
		// Check for graph related errors
		for(Entity<?> i : _entities.values) {
			
			final int oldErrorCount = _unrollErrors.getSize();
			
			if(i.getInstanceCount() > 1 && !i.multiInstance)
				_unrollErrors.provideObject()._set(i, _ERROR_MULTI_INSTANCE);
			
			// Check whether some errors occurred on this entity and deactivate
			// its instances
			if(_unrollErrors.getSize() > oldErrorCount)
				i.iterateInstances(_instanceDeactivator);
		}

		// Derive instance information in a post processing step
		_traversePrefix(_rootInstance, _unrollPostProcessing);
		
		// Abort if no errors occurred during unrolling
		if(_unrollErrors.getSize() == 0) return;
		
		_engine.err.println(
			_unrollErrors.getSize() +
			" errors occured during scene graph unrolling (frame " +
			frameIndex + ")");
		
		for(UnrollError i : _unrollErrors) i._print();
	}
	
	private final Instance _instantiateEntity(
			final Entity<?> entity,
			final Instance  parent,
			final Instance  nextSibling,
			final int       level) {
		
		final Instance node = _instances.provideObject();
		
		_tempLatestNode = null;
		
		// Die Kinder iterieren, die Sibling-Verweise sind genau andersrum wie
		// in der children-Liste gespeichert
		entity.iterateChildren((child) -> {
			_tempLatestNode =
				_instantiateEntity(child, node, _tempLatestNode, level + 1);
		});
		
		entity.addInstance(
			node.assign(entity, parent, _tempLatestNode, nextSibling));
		
		switch(entity.type) {
			case DIRECTIONAL_LIGHT: _dirLightNodes  .insertAtEnd(node); break;
			case POINT_LIGHT:       _pointLightNodes.insertAtEnd(node); break;
			default: break;
		}
		
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
	
	public final void draw(
			final Camera   camera,
			final Matrix4D projection) {
		
		final Matrix4D tfCameraInverse =
			camera.getInstance().tfToEyeSpace.invert();
		
		// Transform all entities into the current camera space
		for(Instance i : _instances)
			i.transformToCameraSpace(tfCameraInverse);
		
		// Render all solid models
		for(Model i : _models)
			i.drawInstances(projection, _dirLightNodes, _pointLightNodes);
	}
	
	public final void setEngine(final AbstractEngine engine) {
		_engine = engine;
	}
	
	public final void prepareForDrawing(
			final int    frameIndex,
    		final double time,
    		final double delta) {

		_unrollGraph(frameIndex, time);
		
		// Call the specific update callbacks for each entity instance
		for(PooledHashMap.KeyValuePair<String, Entity<?>> i : _entities)
			i.getValue().update(time, delta);
		
		// Reset the root transformation
		root.transformation.resetExternal();
		root.transformation.getValue().toIdentity();
		
		// Compute transformation matrices
		_traversePrefix(_rootInstance, _transformationUpdater);
		
		for(Marker       i : _markers)   i.invalidatePosition();
		for(DynamicSpace i : _dynSpaces) i.computeTransformation();
	}
	
	public SceneGraph() {
		root = Entity.makeRoot(this);
	}

	public final void addEntity(final Entity<?> entity) {
		
		if(_entities.hasKey(entity.name))
			throw new UnsupportedOperationException(
				"Entity with name '" + entity.name + "' already exists");
		
		_entities.setValue(entity.name, entity);

		switch(entity.type) {
			case CAMERA: _cameras.insertAtEnd((Camera)entity); break;
			case MODEL:  _models .insertAtEnd((Model) entity); break;
			case MARKER: _markers.insertAtEnd((Marker)entity); break;
			case DYNAMIC_SPACE:
				_dynSpaces.insertAtEnd((DynamicSpace)entity);
				break;
			default: break;
		}
	}
	
	public final String generateRandomEntityName() {
		
		String name;
		
		do {
			name = "entity_" + (_random.nextInt() & 0x7FFFFFFF);
		} while(_entities.hasKey(name));
		
		return name;
	}
	
	public final AbstractEngine getEngine() {
		return _engine;
	}
	
	public final void invalidateGraphStructure() {
		_rootInstance = null;
	}
	
	public final void print() {
		_unrollGraph(-1, -1);
		_traversePrefix(_rootInstance, _treePrinter);
	}
	
	public final boolean removeEntity(final Entity<?> entity) {
		
		if(entity.sceneGraph != this)
			throw new UnsupportedOperationException(
				"Entity belongs to different scene graph");
		
		return _entities.deleteKey(entity.name);
	}
}
