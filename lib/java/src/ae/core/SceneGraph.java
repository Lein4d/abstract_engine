package ae.core;

import java.util.Random;
import java.util.function.Consumer;

import ae.collections.LinkedListNode;
import ae.collections.ObjectPool;
import ae.collections.PooledHashMap;
import ae.collections.PooledLinkedList;
import ae.entity.Entity;
import ae.entity.Model;
import ae.math.Matrix4D;

public class SceneGraph {
	
	private final Random                           _random   = new Random();
	private final PooledHashMap<String, Entity<?>> _entities =
		new PooledHashMap<>();
	private final ObjectPool<Entity.Instance> _treeNodePool =
		new ObjectPool<>(() -> new Entity.Instance());

	private final PooledLinkedList<Entity.Instance> _models =
		new PooledLinkedList<>();
	private final PooledLinkedList<Entity.Instance> _dirLights =
		new PooledLinkedList<>();
	private final PooledLinkedList<Entity.Instance> _pointLights =
		new PooledLinkedList<>();
	
	private final Consumer<Entity.Instance> _transformationUpdater =
		(node) -> {
			
			final Matrix4D transformation =
				node.getEntity().transformation.getActiveValue();
			
			if(node.getParent() != null) {
				node.transformation.
					setData       (node.getParent().transformation).
					multWithMatrix(transformation);
			} else {
				node.transformation.setData(transformation);
			}
		};
	
	private AbstractEngine  _engine       = null;
	private Entity.Instance _rootInstance = null;
	
	// Node pool für die verketteten Listen der Entities
	public final ObjectPool<LinkedListNode<Entity<?>>> nodePoolLinkedList =
		PooledLinkedList.<Entity<?>>createNodePool();
	
	// Node pool für die Hashmaps der Entities
	public final ObjectPool<LinkedListNode<PooledHashMap.KeyValuePair
			<String, Entity<?>>>> nodePoolHashMap =
		PooledHashMap.<String, Entity<?>>createNodePool();
	
	public static final int KEEP_TRANSFORMATION = 0x01;
	public static final int KEEP_COLOR          = 0x02;
	
	public final Entity<?> root;
	
	private final Entity.Instance _instantiateEntity(
			final Entity<?>       entity,
			final Entity.Instance parent,
			final Entity.Instance nextSibling,
			final int             level) {
		
		final Entity.Instance node       = _treeNodePool.provideObject();
		Entity.Instance       latestNode = null;
		
		// Die Kinder iterieren, die Sibling-Verweise sind genau andersrum wie
		// in der children-Liste gespeichert
		for(Entity<?> i : entity.getChildren())
			latestNode = _instantiateEntity(i, node, latestNode, level + 1);
		
		entity.assignInstance(node, parent, latestNode, nextSibling, level);
		
		switch(entity.type) {
			case NONE:                                              break;
			case MODEL:             _models     .insertAtEnd(node); break;
			case DIRECTIONAL_LIGHT: _dirLights  .insertAtEnd(node); break;
			case POINT_LIGHT:       _pointLights.insertAtEnd(node); break;
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
			final double time,
			final double delta) {
		
		// Call the specific update callbacks for each entity instance
		for(PooledHashMap.KeyValuePair<String, Entity<?>> i : _entities)
			i.getValue().update(time, delta);
		
		if(_rootInstance == null) {
			// Discard all previous instancesS
			_treeNodePool.reset();
			_models     .removeAll();
			_dirLights  .removeAll();
			_pointLights.removeAll();
			// Start the recursive tree creation
			_rootInstance = _instantiateEntity(root, null, null, 0);
		}
		
		// Compute transformation matrices
		_traversePrefix(_rootInstance, _transformationUpdater);
		
		// Render all solid models
		for(Entity.Instance i : _models)
			((Model)i.getEntity()).draw(
				i.transformation, getEngine().projection,
				_dirLights, _pointLights);
	}
	
	final void setEngine(final AbstractEngine engine) {
		_engine = engine;
	}
	
	public SceneGraph() {
		root = new Entity<Entity<?>>(this, "root");
	}

	public final void addEntity(final Entity<?> entity) {
		
		if(_entities.hasKey(entity.name))
			throw new UnsupportedOperationException(
				"Entity with name '" + entity.name + "' already exists");
		
		_entities.setValue(entity.name, entity);
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
	
	public final void ivalidateGraphStructure() {
		_rootInstance = null;
	}
	
	public final boolean removeEntity(final Entity<?> entity) {
		
		if(entity.sceneGraph != this)
			throw new UnsupportedOperationException(
				"Entity belongs to different scene graph");
		
		return _entities.deleteKey(entity.name);
	}
}
