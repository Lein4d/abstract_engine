package ae.core;

import java.util.Random;
import java.util.function.Consumer;

import ae.collections.LinkedListNode;
import ae.collections.ObjectPool;
import ae.collections.PooledHashMap;
import ae.collections.PooledLinkedList;
import ae.entity.Camera;
import ae.entity.DynamicSpace;
import ae.entity.Entity;
import ae.entity.Marker;
import ae.entity.Model;
import ae.math.Matrix4D;
import ae.math.Vector3D;

public class SceneGraph {
	
	private final Random                           _random   = new Random();
	private final PooledHashMap<String, Entity<?>> _entities =
		new PooledHashMap<>();
	private final ObjectPool<Entity.Instance> _treeNodePool =
		new ObjectPool<>(() -> new Entity.Instance());
	
	// Some entities are stored in separate lists
	private final PooledLinkedList<Camera> _cameras = new PooledLinkedList<>();
	private final PooledLinkedList<Model>  _models  = new PooledLinkedList<>();
	private final PooledLinkedList<Marker> _markers = new PooledLinkedList<>();
	private final PooledLinkedList<DynamicSpace> _dynSpaces =
		new PooledLinkedList<>();
	
	// Some instances are stored in separate lists
	private final PooledLinkedList<Entity.Instance> _dirLightNodes   =
		new PooledLinkedList<>();
	private final PooledLinkedList<Entity.Instance> _pointLightNodes =
		new PooledLinkedList<>();
	
	// Used in scene graph to tree conversion
	private Entity.Instance _tempLatestNode;
	
	private final Consumer<Entity.Instance> _transformationUpdater =
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

			if(node.getEntity().name.equals("marker_t")) {
				final Vector3D pos = node.tfToEyeSpace.applyToOrigin(Vector3D.createStatic());
				//final Vector3D pos = node.tfToEyeSpace.getColumn(3).xyz;
				pos.copyStaticValues();
				//System.out.println(pos.x + " " + pos.y + " " + pos.z);
			}
		};
	
	private final Consumer<Entity.Instance> _treePrinter =
		(instance) -> {
			for(int i = 0; i < instance.getLevel(); i++)
				getEngine().out.print('\t');
			getEngine().out.println(instance.getEntity().name);
		};
	
	private AbstractEngine  _engine       = null;
	private Entity.Instance _rootInstance = null;
	
	// Node pool for the children linked list of an entity
	public final ObjectPool<LinkedListNode<Entity<?>>> nodePoolChildrenLL =
		PooledLinkedList.<Entity<?>>createNodePool();
	
	// Node pool for the children hashmap of an entity
	public final ObjectPool<LinkedListNode<PooledHashMap.KeyValuePair
			<String, Entity<?>>>> nodePoolChildrenHM =
		PooledHashMap.<String, Entity<?>>createNodePool();

	// Node pool for the instance list of an entity
	public final ObjectPool<LinkedListNode<Entity.Instance>> nodePoolInstances =
		PooledLinkedList.<Entity.Instance>createNodePool();
	
	public final Entity<?> root;
	
	private final void _unrollGraph() {
		
		if(_rootInstance != null) return;
			
		// Discard all previous instances
		_treeNodePool   .reset();
		_dirLightNodes  .removeAll();
		_pointLightNodes.removeAll();
		for(Entity<?> i : _entities.values) i.resetInstances();
		
		// Start the recursive tree creation
		_rootInstance = _instantiateEntity(root, null, null, 0);
	}
	
	private final Entity.Instance _instantiateEntity(
			final Entity<?>       entity,
			final Entity.Instance parent,
			final Entity.Instance nextSibling,
			final int             level) {
		
		final Entity.Instance node = _treeNodePool.provideObject();
		
		_tempLatestNode = null;
		
		// Die Kinder iterieren, die Sibling-Verweise sind genau andersrum wie
		// in der children-Liste gespeichert
		entity.iterateChildren((child) -> {
			_tempLatestNode =
				_instantiateEntity(child, node, _tempLatestNode, level + 1);
		});
		
		entity.addInstance(node, parent, _tempLatestNode, nextSibling, level);
		
		switch(entity.type) {
			case DIRECTIONAL_LIGHT: _dirLightNodes  .insertAtEnd(node); break;
			case POINT_LIGHT:       _pointLightNodes.insertAtEnd(node); break;
			default: break;
		}
		
		return node;
	}
	
	private final void _traversePrefix(
			final Entity.Instance           instance,
			final Consumer<Entity.Instance> consumer) {
		
		consumer.accept(instance);
		
		Entity.Instance child = instance.getFirstChild();
		
		while(child != null) {
			_traversePrefix(child, consumer);
			child = child.getNextSibling();
		}
	}
	
	final void draw(
			final Camera   camera,
			final Matrix4D projection) {
		
		final Matrix4D tfCameraInverse =
			camera.getInstance().tfToEyeSpace.invert();
		
		// Transform all entities into the current camera space
		for(Entity.Instance i : _treeNodePool)
			i.transformToCameraSpace(tfCameraInverse);
		
		// Render all solid models
		for(Model i : _models)
			i.drawInstances(projection, _dirLightNodes, _pointLightNodes);
	}
	
	final void setEngine(final AbstractEngine engine) {
		_engine = engine;
	}
	
	final void prepareForDrawing(
    		final double time,
    		final double delta) {

		// Call the specific update callbacks for each entity instance
		for(PooledHashMap.KeyValuePair<String, Entity<?>> i : _entities)
			i.getValue().update(time, delta);
		
		_unrollGraph();
		
		// Compute transformation matrices
		_traversePrefix(_rootInstance, _transformationUpdater);
		
		for(Marker       i : _markers)   i.invalidatePosition();
		for(DynamicSpace i : _dynSpaces) i.computeTransformation();
	}
	
	public SceneGraph() {
		root = new Entity<Entity<?>>(this, "root");
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
		_unrollGraph();
		_traversePrefix(_rootInstance, _treePrinter);
	}
	
	public final boolean removeEntity(final Entity<?> entity) {
		
		if(entity.sceneGraph != this)
			throw new UnsupportedOperationException(
				"Entity belongs to different scene graph");
		
		return _entities.deleteKey(entity.name);
	}
}
