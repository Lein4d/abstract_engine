
// ae.core.SceneGraph
class AEClassSceneGraph extends AEClassJavaObject {
	
	_p: {
		rootInstance: (ae.sg.Instance | null);
	}
	
	_tfCameraInverse: ae.math.Matrix4D;
	
	_entities:     ae.col.PooledHashMap<ae.util.String,  ae.sg.Entity>;
	_instances:    ae.col.PooledHashMap<ae.util.Integer, ae.sg.Instance>;
	_instancePool: ae.col.GrowingPool  <ae.sg.Instance>;
	
	// The errors during graph unrolling are stored here
	_unrollErrors: ae.col.GrowingPool<ae.core._p.UnrollError>;
	
	// Some entities are stored in separate lists
	_cameras:   ae.col.PooledLinkedList<ae.sg.Camera>;
	_models:    ae.col.PooledLinkedList<ae.sg.Model>;
	//_markers:   ae.col.PooledLinkedList<ae.sg.Marker>;
	//_dynSpaces: ae.col.PooledLinkedList<ae.sg.DynSpace>;
	
	// Some instances are stored in separate lists
	_dirLightNodes:   ae.col.PooledLinkedList<ae.sg.Instance>;
	_pointLightNodes: ae.col.PooledLinkedList<ae.sg.Instance>;
	
	_unrollPostProcessor:   Consumer<ae.sg.Instance>;
	_transformationUpdater: Consumer<ae.sg.Instance>;
	_treePrinter:           Consumer<ae.sg.Instance>;
	
	engine:        ae.core.AbstractEngine;
	root:          ae.sg.Entity;
	onNewTopology: ae.event.NotifyEvent;
	
	// private getters + setters ///////////////////////////////////////////////
	
	get _rootInstance(): (ae.sg.Instance | null) {return this._p.rootInstance;}
	
	// private methods /////////////////////////////////////////////////////////
	
	_generateRandomName(prefix: string): ae.util.String {
		
		let name = null;
		
		do {
			name = new ae.util.String(prefix + "_" + aeFuncRandInt(0, 10000));
		} while(this._entities.hasKey(name));
		
		return name;
	}
	
	_instantiateEntity(
			entity:       ae.sg.Entity,
			parent:      (ae.sg.Instance | null),
			nextSibling: (ae.sg.Instance | null),
			level:        number): ae.sg.Instance {
		
		const node       = this._instancePool.provide();
		let   latestNode = null;
		
		// Die Kinder iterieren, die Sibling-Verweise sind genau andersrum wie
		// in der children-Liste gespeichert
		entity.children.forEach((child) => {
			latestNode =
				this._instantiateEntity(child, node, latestNode, level + 1);
		});
		
		entity.addInstance(
			node.assign(entity, parent, latestNode, nextSibling));
		
		return node;
	}
	
	_traversePrefix(
			instance: ae.sg.Instance,
			consumer: Consumer<ae.sg.Instance>): void {
		
		// Skip this instance and all its transitive children if it is marked as
		// inactive
		if(!instance.active) return;
		
		consumer(instance);
		
		let child = instance.firstChild;
		
		while(child !== null) {
			this._traversePrefix(child, consumer);
			child = child.nextSibling;
		}
	}
	
	_unrollGraph(
			dirLights:   ae.col.PooledLinkedList<ae.sg.Instance>,
			pointLights: ae.col.PooledLinkedList<ae.sg.Instance>): void {
		
		if(this._rootInstance !== null) return;
		
		// Discard all previous instances
		this._instancePool   .reset();
		this._instances      .clear();
		this._dirLightNodes  .clear();
		this._pointLightNodes.clear();
		// $NOT_NULL: 'entity'
		this._entities.values.forEach((entity) => entity.resetInstances());
		
		this._unrollErrors.reset();
		
		// Start the recursive tree creation
		this._p.rootInstance =
			this._instantiateEntity(this.root, null, null, 0);
		
		// Check for graph related errors
		this._entities.values.forEach((entity) => {
			
			// $NOT_NULL: 'entity'
			const entityNN: ae.sg.Entity = entity;
			const oldErrorCount          = this._unrollErrors.usedObjectCount;
			
			if(entityNN.instanceCount > 1 && !entityNN.multiInstance)
				this._unrollErrors.provide()._setA(
					entityNN, _ae.SG_ERROR_MULTI_INSTANCE);
			
			// Check whether some errors occurred on this entity and deactivate
			// its instances
			if(this._unrollErrors.usedObjectCount > oldErrorCount)
				entityNN.instances.forEach((instance) => instance.deactivate());
		});

		// Derive instance information in a post processing step
		// $NOT_NULL: '_rootInstance'
		this._traversePrefix(this._rootInstance, this._unrollPostProcessor);
		
		// Assign a unique ID to each instance
		let instanceId = 1;
		this._instancePool.forEach((instance) => {
			this._instances.setValue(new AEClassInteger(instanceId), instance.setId(instanceId));
			instanceId++;
		});
		
		// Copy the light instances to the current frame
		dirLights  .clear();
		pointLights.clear();
		dirLights  .addAll(this._dirLightNodes);
		pointLights.addAll(this._pointLightNodes);
		
		// Don't print anything if there are no errors
		if(this._unrollErrors.usedObjectCount > 0) {
    		
    		//engine.err.println(
    		//	_unrollErrors.getUsedObjectCount() +
    		//	" errors occured during scene graph unrolling (frame " +
    		//	engine.state.getFrameIndex() + ")");
    		
    		//for(UnrollError i : _unrollErrors) i._print();
		}
		
		this.onNewTopology.fire();
	}
	
	// internal methods ////////////////////////////////////////////////////////
	
	_addEntity(
			entity:    ae.sg.Entity,
			tempName: (string | null)): ae.util.String {
		
		let realName;
		
		if(tempName !== null) {
			const tempNameBoxed = new AEClassString(tempName); 
			realName            = this._entities.hasKey(tempNameBoxed) ?
				this._generateRandomName(tempName) : tempNameBoxed;
		} else {
			realName = this._generateRandomName("entity");
		}
		
		this._entities.setValue(realName, entity);
		
		switch(entity.type) {
			case _ae.EntityType.CAMERA:
				// $CORRECT_CAST: 'entity'
				this._cameras.insertAtEnd(entity);
				break;
			case _ae.EntityType.MODEL:
				// $CORRECT_CAST: 'entity'
				this._models.insertAtEnd(entity);
				break;
			//case _ae.EntityType.MODEL:  _models .insertAtEnd((Model) entity); break;
			//case _ae.EntityType.MARKER: _markers.insertAtEnd((Marker)entity); break;
			//case _ae.EntityType.DYNAMIC_SPACE:
			//	_dynSpaces.insertAtEnd(entity);
			//	break;
			//default: break;
		}
		
		return realName;
	}
	
	_getInstance(id: number): ae.sg.Instance {
		// $NOT_NULL: 'getValue()'
		return this._instances.getValue(id);
	}
	
	_invalidateGraphStructure(): void {
		this._p.rootInstance = null;
	}
	
	_prepareRendering(
			dirLights:   ae.col.PooledLinkedList<ae.sg.Instance>,
			pointLights: ae.col.PooledLinkedList<ae.sg.Instance>): void {
		
		this._unrollGraph(dirLights, pointLights);
		
		// Call the specific update callbacks for each entity instance
		// $NOT_NULL: 'entity'
		this._entities.values.forEach((entity) => entity.update());
		
		// Reset the root transformation
		this.root.transformation.resetExternal();
		this.root.transformation.valueNN.toIdentity();
		
		// Compute transformation matrices
		// $NOT_NULL: 'this._rootInstance'
		this._traversePrefix(this._rootInstance, this._transformationUpdater);
		
		//for(Marker       i : _markers)   i.invalidatePosition();
		//for(DynamicSpace i : _dynSpaces) i.computeTransformation();
	}
	
	_removeEntity(entity: ae.sg.Entity): void {
		
		if(entity.sceneGraph !== this)
			throw "Entity belongs to different scene graph";
		
		this._entities.deleteKey(entity.name);
	}
	
	_render(
			gl:          WebGLRenderingContext,
			camera:      ae.sg.Camera,
			projection:  ae.math.Matrix4D,
			useMaterial: boolean): void {
		
		// $NOT_NULL: 'camera.instance'
		this._tfCameraInverse.setDataA(camera.instance.tfToEyeSpace).invert();
		
		// Transform all entities into the current camera space
		this._instancePool.forEach((instance) =>
			instance.transformToCameraSpace(this._tfCameraInverse));
		
		this.engine.state._newCamera(projection);
		
		// TODO: Remove
		projection.applyToShader(this.engine.gl, this.engine.uniLocProjection);
		
		// Render all solid models
		this._models.forEach(
			(model) => model.drawInstances(gl, projection, useMaterial));
	}
	
	// public constructor //////////////////////////////////////////////////////
	
	constructor(
			engine:      ae.core.AbstractEngine,
			addToEngine: boolean = true) {
		
		super();
		
		this.engine           = engine;
		this._tfCameraInverse = new AEClassMatrix4D();
		this._entities        = new AEClassPooledHashMap();
		this._instances       = new AEClassPooledHashMap();
		this._instancePool    = new AEClassGrowingPool(() => new AEClassInstance(), null, null);
		this._unrollErrors    = new AEClassGrowingPool(() => new AEClassUnrollError(this), null, null);
		this._cameras         = new AEClassPooledLinkedList();
		this._models          = new AEClassPooledLinkedList();
		//this._markers         = new AEClassPooledLinkedList();
		//this._dynSpaces       = new AEClassPooledLinkedList();
		this._dirLightNodes   = new AEClassPooledLinkedList();
		this._pointLightNodes = new AEClassPooledLinkedList();
		this.root             = AEClassEntity.makeRoot(this);
		this.onNewTopology    = new AEClassNotifyEvent(this);
		this._p = {
			rootInstance: null
		};
		
		this._unrollPostProcessor = (instance) => {
			
			instance.deriveProperties();
			
			const entity        = instance.entity;
			const parent        = instance.parent;
			const oldErrorCount = this._unrollErrors.usedObjectCount;
			
			if(entity.noInheritedTF && parent != null && !parent.fixed)
				this._unrollErrors.provide()._setB(
					instance, _ae.SG_ERROR_NOT_STATIC);
			
			// Deactivate the instance in case of errors
			if(this._unrollErrors.usedObjectCount > oldErrorCount)
				instance.deactivate();
			
			if(instance.active) {
				switch(entity.type) {
					case _ae.EntityType.DIRECTIONAL_LIGHT:
						//_dirLightNodes  .insertAtEnd(instance); break;
					case _ae.EntityType.POINT_LIGHT:
						//_pointLightNodes.insertAtEnd(instance); break;
					default: break;
				}
			}
		};
		
		this._transformationUpdater = (instance) => {
			
			// $NOT_NULL
			const transformation: ae.math.Matrix4D =
				instance.entity.transformation.activeValue;
			
			if(instance.parent !== null) {
				instance.tfToEyeSpace.
					setDataA      (instance.parent.tfToEyeSpace).
					multWithMatrix(transformation);
			} else {
				instance.tfToEyeSpace.setDataA(transformation);
			}
		};
	
		this._treePrinter = (instance) => {
			
			const entity = instance.entity;
			let   line   = "";
			
			// We have to concatenate strings as the line must be logged in one
			// step to prevent line breaking
			
			for(let i = 0; i < instance.level; i++) line += "|\t";
			
			line +=
				"[" + entity.type + "] " + entity.name.str +
				(instance.fixed ? " [S]" : "");
			
			console.log(line);
		};
		
		if(addToEngine) engine.sceneGraph = this;
	}
	
	// public methods
	
	print(): void {
		if(this._rootInstance !== null)
			this._traversePrefix(this._rootInstance, this._treePrinter);
	}
}
