/**       */

                    

let aeVarHashCounter = 0;

class AEClassJavaObject {
	
	                 
	
	constructor() {
		this.hashCode = aeVarHashCounter++;
	}
	
	equals(obj         )          {return this === obj;}
	
	finalize()       {}
}

                                                  

                                                           
                                                           
                                                           

                                    
                                    

                       
                                    
 

                         
                                       
                                       
 

                      
                                                 
                              
 

// ae.collections.PooledHashMap<K,V>$KeyIterator
class AEClassHMKeyIterator                      extends AEClassJavaObject {
	
	                                    
	
	constructor(hashMap                            ) {
		super();
		this.hashMap = hashMap;
	}
	
	forEach(visitor            ) {
		for(let i = 0; i < this.hashMap.bufferSize; i++)
			if(this.hashMap._keys[i]) visitor(this.hashMap._keys[i]);
	}
	
	forEachRev(visitor            ) {this.forEach(visitor);}
}

// ae.collections.PooledHashMap<K,V>$ValueIterator
class AEClassHMValueIterator                      extends AEClassJavaObject {
	
	                                    
	
	constructor(hashMap                            ) {
		super();
		this.hashMap = hashMap;
	}
	
	forEach(visitor            ) {
		for(let i = 0; i < this.hashMap.bufferSize; i++)
			if(this.hashMap._used[i])
				// $NOT_NULL: 'this.hashMap._values[i]'
				visitor(this.hashMap._values[i]);
	}
	
	forEachRev(visitor            ) {this.forEach(visitor);}
}

// ae.collections.PooledHashMap$KeyValuePair<K,V>
class AEClassKeyValuePair extends AEClassJavaObject {
	
	     
                         
                         
                         
  
	
	// internal constructor ////////////////////////////////////////////////////
	
	constructor() {
		
		super();
		
		this._p = {
			key:           null,
			value:         null,
			keepReference: false,
		};
		
		Object.freeze(this);
	}
	
	// public getters + setters ////////////////////////////////////////////////
	
	get key          ()          {return this._p.key;}
	get value        ()          {return this._p.value;}
	get keepReference()          {return this._p.keepReference;}
	
	set key  (key           ) {this._p.key   = key;}
	set value(value         ) {this._p.value = value;}
	
	// public methods //////////////////////////////////////////////////////////
	
	freeReference()       {
		if(this._p.keepReference) ae.col._p.HM_KVP_POOL.free(this);
		return this;
	}
	
	keepReference()       {
		this._p.keepReference = true;
		return this;
	}
}
// ae.collections.LinkedListNode<T>
class AEClassLinkedListNode extends AEClassJavaObject {
	
	      
                                          
                                          
                                          
  
	
	// public constructor //////////////////////////////////////////////////////
	
	constructor(content                   = null) {
		
		super();
		
		this._pp = {
			prev:    null,
			next:    null,
			content: content,
		}
		
		Object.freeze(this);
	}
	
	// public getters + setters ////////////////////////////////////////////////
	
	get prev()                                 {return this._pp.prev;}
	get next()                                 {return this._pp.next;}
	
	get content()                    {return this._pp.content;}
	
	set content(content                  ) {this._pp.content = content;}
	
	// public methods //////////////////////////////////////////////////////////
	
	forEach(visitor                                ) {
		
		let node = this;
		
		while(node !== null) {
			visitor(node);
			node = node.next;
		}
	}
	
	forEachRev(visitor                                ) {
		
		let node = this;
		
		while(node !== null) {
			visitor(node);
			node = node.prev;
		}
	}
	
	insertAfter(node                                )       {
		
		if(node === null) return this.resetListOnly();

		this._pp.prev = node;
		this._pp.next = node.next;
		node._pp.next = this;
		
		return this;
	}
	
	insertBefore(node                                )       {
		
		if(node === null) return this.resetListOnly();
		
		this._pp.prev = node.prev;
		this._pp.next = node;
		node._pp.prev = this;
		
		return this;
	}
	
	remove()       {
		
		if(this.prev !== null) this.prev._pp.next = this.next;
		if(this.next !== null) this.next._pp.prev = this.prev;
		
		return this;
	}

	reset()       {
		
		this._pp.content              = null;
		this._pp.prev = this._pp.next = null;
		
		return this;
	}
	
	resetListOnly()       {
		this._pp.prev = this._pp.next = null;
		return this;
	}
}

// ae.collections.Pool<T>
class AEClassPool    extends AEClassJavaObject {
	
	                        
	                        
	                        
	
	// protected constructor ///////////////////////////////////////////////////
	
	constructor(
    		creator                 ,
    		preparator              ,
    		finalizer               ) {
		
		super();
		
		this.creator    = creator    ? creator    : () => {throw "";};
		this.preparator = preparator ? preparator : (obj) => {};
		this.finalizer  = finalizer  ? finalizer  : (obj) => {};
	}
	
	// protected methods ///////////////////////////////////////////////////////
	
	_create()    {
		return this.creator();
	}
	
	_finalize(obj         )       {
		// $CORRECT_CAST
		this.finalizer(obj);
	}
	
	_prepare(obj         )    {
		
		// $CORRECT_CAST
		const casted    = obj;
		
		this.preparator(casted);
		return casted;
	}
	
	// public getters + setters ////////////////////////////////////////////////
	
	get capacity         ()         {throw ae.EXCEPTION_ABSTRACT_METHOD;}
	get unusedObjectCount()         {throw ae.EXCEPTION_ABSTRACT_METHOD;}
	get usedObjectCount  ()         {throw ae.EXCEPTION_ABSTRACT_METHOD;}
	
	// public methods //////////////////////////////////////////////////////////
	
	provide()    {throw ae.EXCEPTION_ABSTRACT_METHOD;}
}
// ae.collections.PooledCollection<T>
class AEClassPooledCollection    {
	
	     
                                                                          
                                 
               
  
	
	// protected constructor ///////////////////////////////////////////////////
	
	constructor() {
		
		this._p = {
			size: 0
		}
		
		// Will be freezed in sub class
	}
	
	// protected methods ///////////////////////////////////////////////////////
	
	_addSingle(element   )          {throw ae.EXCEPTION_ABSTRACT_METHOD;}
	
	// Doesn't need to be overridden if the standard clear method is overridden
	_clear()       {}
	
	// public getters + setters ////////////////////////////////////////////////
	
	get empty()          {return !this._p.size;}
	get size ()          {return  this._p.size;}
	
	// public methods //////////////////////////////////////////////////////////
	
	// True if the col has changed somehow
	addAll(src             )          {
		
		let changed = false;
		
		src.forEach((element) => {
			if(this._addSingle(element)) changed = true;
		})
		
		return changed;
	}
	
	clear()          {
		
		if(this.empty) {
			return false;
		} else {
			this._clear();
			return true;
		}
	}
	
	forEach   (visitor            )       {throw ae.EXCEPTION_ABSTRACT_METHOD;}
	forEachRev(visitor            )       {this.forEach(visitor);}
}
// ae.collections.PooledQueue<T>
class AEClassPooledQueue    {
	
	                                  
	
	constructor() {
		this._list = new AEClassPooledLinkedList();
		Object.freeze(this);
	}
	
	get hasNext()          {return !this._list.empty;}
	get next   ()          {return  this._list.first;}
	
	pop()    {
		
		const element = this._list.first;
		
		this._list.removeFirstA();
		return element;
	}
	
	push(element   )       {
		this._list.insertAtEnd(element);
	}
}
function aeFuncRenderLoopCallback(engine                        ) {
	
	window.requestAnimationFrame(
		function() {aeFuncRenderLoopCallback(engine)});
	
	engine._render();
}

// ae.core.AbstractEngine
class AEClassAbstractEngine {
	
	     
                                          
                                          
  
	
	                              
	
	                                  
	                                   
	                             
	
	// only temporary
	                                       
	                                       
	
	// internal methods ////////////////////////////////////////////////////////
	
	_addMaterial(material                 ) {
		// TODO
	}
	
	_render() {
		
		this.state._beginNextFrame(1, this.sceneGraph);
		
		this.background.copyStaticValues();
		this.gl.clearColor(
			this.background.x, this.background.y, this.background.z, 1.0);
		this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
		
		if(this.sceneGraph !== null && this.camera !== null)
			this.sceneGraph._render(
				this.gl, 
				this.camera,
				this.camera.createProjectionMatrix(1, 1, this._projection),
				true);
	}
	
	// public constructor //////////////////////////////////////////////////////
	
	constructor(
			canvas                             ,
			uniLocProjection                      ,
			uniLocModelView                       ) {
		
		const tempGL = canvas.getContext("webgl");
		
		if(!tempGL) throw "No WebGL context available";
		
		this._projection = new AEClassMatrix4D();
		this.gl         = tempGL;
		this.state      = new ae.core._p.RenderState();
		this.background = ae.math.BLACK.xyz.cloneStatic();
		this._p         = {
			sceneGraph: null,
			camera:     null
		};
		
		this.uniLocProjection = uniLocProjection;
		this.uniLocModelView  = uniLocModelView;
		
		this.gl.viewport(0, 0, canvas.width, canvas.height);
		
		//this.gl.clearColor(1.0, 0.0, 0.0, 1.0);
		//this.gl.clear(this.gl.COLOR_BUFFER_BIT);
		
		Object.freeze(this);
	}
	
	// public getters + setters ////////////////////////////////////////////////
	
	get camera    ()                              {return this._p.camera;}
	get sceneGraph()                              {return this._p.sceneGraph;}
	
	set camera(camera                       )       {
		this._p.camera = camera;
	}
	
	set sceneGraph(sceneGraph                             )       {
		this._p.sceneGraph = sceneGraph;
	}
	
	// public methods //////////////////////////////////////////////////////////
	
	start() {
		
		this.gl.clearDepth(1);
		this.gl.depthFunc(this.gl.LEQUAL);
		this.gl.enable   (this.gl.DEPTH_TEST);
		//this.gl.enable(this.gl.SCISSOR_TEST);
		
		aeFuncRenderLoopCallback(this);
	}
};

// ae.core.GlslShader
class AEClassGlslShader extends AEClassJavaObject {
	
	                       
	
	                                                   
	                                                   
	                                                   
	                                                   
	                                                   
	                                                   
	                                                   
	                                                   
	
	                               
	
	// private methods /////////////////////////////////////////////////////////
	
	_createShader(
			gl                                 ,
			shaderType          ,
			typeName            ,
			program                   ,
			shaderSource        )          {
		
		const shader = this.engine.gl.createShader(shaderType);
		
		gl.shaderSource (shader, shaderSource);
		gl.compileShader(shader);
		console.log(gl.getShaderInfoLog(shader));
		
		// Abort if the shader has not been compiled
		if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return false;
		
		gl.attachShader(program, shader);
		gl.deleteShader(shader);
		
		return true;
	}
	/*
	private final void _printLog(
			final String name,
			final String log) {
		
		int cutPosition = log.length() - 1;
		
		while(
			cutPosition >= 0 &&
			Character.isWhitespace(log.charAt(cutPosition))) cutPosition--;
		
		// Print nothing if the log contains only whitespace characters
		if(cutPosition < 0) return;
		
		engine.out.println("> " + name + " info log:");
		engine.out.println(log.substring(0, cutPosition + 1));
	}
	*/
	// internal constructor ////////////////////////////////////////////////////
	
	constructor(
			engine                                        ,
			name                          ,
			vsSource                      ,
			fsSource                      ,
			uniNameMatModelView           ,
			uniNameMatProjection          ,
			uniNameMatNormal              ,
			uniNameObjectId               ,
			uniNameDirLights              ,
			uniNameDirLightCount          ,
			uniNamePointLights            ,
			uniNamePointLightCount        ,
			attributeNames                              ) {
		
		super();
		
		this._program = engine.gl.createProgram();
		this.engine = engine;
	
		console.log("Creating shader program '" + name + "'");
		
		// Create the shader components
		const vsSuccess = this._createShader(
			engine.gl, engine.gl.VERTEX_SHADER,
			"Vertex shader",   this._program, vsSource);
		const fsSuccess = this._createShader(
			engine.gl, engine.gl.FRAGMENT_SHADER,
			"Fragment shader", this._program, fsSource);
		
		// If one of shader components failed, no program will be used
		if(!vsSuccess || !fsSuccess) {
			
			console.log("Aborting program creation");
			
			if(!vsSuccess)
				console.log("\tVertex shader not compiled");
			if(!fsSuccess)
				console.log("\tFragment shader not compiled");
			
			this._program = 0;
			
		} else {
				
			// Bind the vertex attribute locations
			for(let i = 0; i < attributeNames.length; i++)
				if(attributeNames[i] !== null)
					engine.gl.bindAttribLocation(this._program, i, attributeNames[i]);
			
			// Bind fragment data locations (not available in WebGL)
			// engine.gl.bindFragDataLocation(this._program, 0, fragDataName);
	
			// Link the whole program
			engine.gl.linkProgram(this._program);
			//this._printLog("Program", engine.gl.getProgramInfoLog(this._program));
			
			// If the linking has failed, no program will be used
			if(engine.gl.getProgramParameter(this._program, engine.gl.LINK_STATUS) === engine.gl.FALSE) {
				this._program = 0;
			} else {
				console.log("Program creation successful");
			}
		}
		
		engine.gl.useProgram(this._program);
		
		this._uniMatModelView    = engine.gl.getUniformLocation(this._program, uniNameMatModelView);
		this._uniMatProjection   = engine.gl.getUniformLocation(this._program, uniNameMatProjection);
		this._uniMatNormal       = engine.gl.getUniformLocation(this._program, uniNameMatNormal);
		this._uniObjectId        = engine.gl.getUniformLocation(this._program, uniNameObjectId);
		this._uniDirLights       = engine.gl.getUniformLocation(this._program, uniNameDirLights);
		this._uniDirLightCount   = engine.gl.getUniformLocation(this._program, uniNameDirLightCount);
		this._uniPointLights     = engine.gl.getUniformLocation(this._program, uniNamePointLights);
		this._uniPointLightCount = engine.gl.getUniformLocation(this._program, uniNamePointLightCount);
		
		Object.freeze(this);
	}

	// internal methods ////////////////////////////////////////////////////////
	
	_bind()       {
		this.engine.gl.useProgram(this._program);
	}
	
	_getUniformLocation(uniName        )                                {
		return this._program !== 0 ?
			this.engine.gl.getUniformLocation(this._program, uniName) : null;
	}
}
// ae.core.RenderState
class AEClassRenderState extends AEClassJavaObject {
	
	     
                     
                     
                     
                     
                                          
                                  
  
	
	                                 
	                                 
	                                 
	                                 
	                                 
	
	                                                      
	                                                      
	
	                                 
	
	constructor() {
		
		super();
		
		this._matModelViewData   = new Float32Array(16);
		this._matProjectionData  = new Float32Array(16);
		this._matNormalData      = new Float32Array(9);
		this._dirLightData       = new Float32Array(8); // TODO
		this._pointLightData     = new Float32Array(8); // TODO
		
		this._dirLights   = new AEClassPooledLinkedList();
		this._pointLights = new AEClassPooledLinkedList();
		
		// $NOT_NULL: 'shader'
		this._p = {
			frameIndex: -1,
			absTime:    0,
			time:       0,
			timeDelta:  0,
			sceneGraph: null,
			shader:     null,
		};
		
		this.onNewFrame = new AEClassNotifyEvent(this);
		
		Object.freeze(this);
	}
	
	get frameIndex()         {return this._p.frameIndex;}
	get absTime   ()         {return this._p.absTime;}
	get time      ()         {return this._p.time;}
	get timeDelta ()         {return this._p.timeDelta;}
	
	get sceneGraph()                              {return this._p.sceneGraph;}
	
	// internal methods ////////////////////////////////////////////////////////
	
	_applyUniformsToShader(gl                       )       {
		
		gl.uniformMatrix4fv(this._p.shader._uniMatModelView,  false, this._matModelViewData);
		gl.uniformMatrix4fv(this._p.shader._uniMatProjection, false, this._matProjectionData);
		gl.uniformMatrix3fv(this._p.shader._uniMatNormal,     false, this._matNormalData);
		
		//glUniform1f(_shader.uniObjectId, _objectId);
		
		//glUniform4fv(_shader.uniDirLights,   _dirLightData);
		//glUniform4fv(_shader.uniPointLights, _pointLightData);
		
		//glUniform1i(_shader.uniDirLightCount,   _dirLights  .getSize());
		//glUniform1i(_shader.uniPointLightCount, _pointLights.getSize());
	}
	
	_beginNextFrame(
			speed              ,
			sceneGraph                             ) {
		
		const absTimeNew = Date.now();
		
		if(this.frameIndex == -1) {
			
			// Prevent a huge timeDelta in the first frame
			this._p.absTime = absTimeNew;
			
			//for(let i = 0; i < _fpsCounters.length; i++)
			//	_fpsCounters[i] =
			//		new FpsCounter((i * 1000) / _fpsCounters.length);
		}
		
		this._p.frameIndex++;
		this._p.timeDelta  = speed * (absTimeNew - this.absTime);
		this._p.time       = this.frameIndex == 0 ? 0 : this.time + this.timeDelta;
		this._p.absTime    = absTimeNew;
		this._p.sceneGraph = sceneGraph;
		
		this.onNewFrame.fire();
		
		if(this.sceneGraph !== null)
			this.sceneGraph._prepareRendering(
				this._dirLights, this._pointLights);
	}
	
	_newCamera(projection                  )       {
		
		projection.getDataC(this._matProjectionData);
		
		//_setDirLightData();
		//_setPointLightData();
	}
	
	_newGlslShader(glslShader                     )       {
		this._p.shader = glslShader;
	}
	
	_newModelInstance(instance                )       {
		
		//_objectId = instance.getId();
		
		instance.tfToCameraSpace.getDataC  (this._matModelViewData);
		instance.tfToCameraSpace.getNmDataB(this._matNormalData);
	}
	
	createUpdateEvent(host               )                         {
		return new AEClassUpdateEvent(this, host);
	}
}

// ae.core.SceneGraph
class AEClassSceneGraph extends AEClassJavaObject {
	
	     
                                        
  
	
	                                   
	
	                                                                   
	                                                                     
	                                                    
	
	// The errors during graph unrolling are stored here
	                                                          
	
	// Some entities are stored in separate lists
	                                                  
	                                                 
	//_markers:   ae.col.PooledLinkedList<ae.sg.Marker>;
	//_dynSpaces: ae.col.PooledLinkedList<ae.sg.DynSpace>;
	
	// Some instances are stored in separate lists
	                                                          
	                                                          
	
	                                                 
	                                                 
	                                                 
	
	                                      
	                            
	                                    
	
	// private getters + setters ///////////////////////////////////////////////
	
	get _rootInstance()                          {return this._p.rootInstance;}
	
	// private methods /////////////////////////////////////////////////////////
	
	_generateRandomName(prefix        )                 {
		
		let name = null;
		
		do {
			name = new ae.util.String(prefix + "_" + aeFuncRandInt(0, 10000));
		} while(this._entities.hasKey(name));
		
		return name;
	}
	
	_instantiateEntity(
			entity                    ,
			parent                              ,
			nextSibling                         ,
			level               )                 {
		
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
			instance                ,
			consumer                          )       {
		
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
			dirLights                                           ,
			pointLights                                         )       {
		
		if(this._rootInstance !== null) return;
		
		// Discard all previous instances
		this._instancePool   .reset();
		this._instances      .clear();
		this._dirLightNodes  .clear();
		this._pointLightNodes.clear();
		this._entities.values.forEach((entity) => entity.resetInstances());
		
		this._unrollErrors.reset();
		
		// Start the recursive tree creation
		this._p.rootInstance =
			this._instantiateEntity(this.root, null, null, 0);
		
		// Check for graph related errors
		this._entities.values.forEach((entity) => {
			
			const entityNN               = entity;
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
			entity                 ,
			tempName                 )                 {
		
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
	
	_getInstance(id        )                 {
		// $NOT_NULL: 'getValue()'
		return this._instances.getValue(id);
	}
	
	_invalidateGraphStructure()       {
		this._p.rootInstance = null;
	}
	
	_prepareRendering(
			dirLights                                           ,
			pointLights                                         )       {
		
		this._unrollGraph(dirLights, pointLights);
		
		// Call the specific update callbacks for each entity instance
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
	
	_removeEntity(entity              )       {
		
		if(entity.sceneGraph !== this)
			throw "Entity belongs to different scene graph";
		
		this._entities.deleteKey(entity.name);
	}
	
	_render(
			gl                                ,
			camera                   ,
			projection                   ,
			useMaterial         )       {
		
		// $NOT_NULL: 'camera.instance'
		this._tfCameraInverse.setDataA(camera.instance.tfToEyeSpace).invert();
		
		// Transform all entities into the current camera space
		this._instancePool.forEach((instance) =>
			instance.transformToCameraSpace(this._tfCameraInverse));
		
		this.engine.state._newCamera(projection);
		
		// TODO: Remove
		//projection.applyToShader(this.engine.gl, this.engine.uniLocProjection);
		
		// Render all solid models
		this._models.forEach(
			(model) => model.drawInstances(gl, projection, useMaterial));
	}
	
	// public constructor //////////////////////////////////////////////////////
	
	constructor(
			engine                             ,
			addToEngine          = true) {
		
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
			const transformation                   =
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
	
	print()       {
		if(this._rootInstance !== null)
			this._traversePrefix(this._rootInstance, this._treePrinter);
	}
}

// ae.core.SceneGraph$UnrollError
class AEClassUnrollError extends AEClassJavaObject {
	
	     
                          
                            
                    
  
	
	                                   
	                                                        
	
	constructor(sg                    ) {
		
		super();
		
		this._sg            = sg;
		this._instanceScope = new AEClassPooledLinkedList();
		// $NOT_NULL
		this._p             = {
			entity:   null,
			instance: null,
			msg:      null,
		};
	}
	
	_print()       {
		/*
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
		*/
	}
	
	_setA(
			entity              ,
			msg           )       {
		
		this._p.entity   = entity;
		this._p.instance = null;
		this._p.msg      = msg;
		
		return this;
	}
	
	_setB(
			instance                ,
			msg             )       {
		
		this._p.entity   = instance.entity;
		this._p.instance = instance;
		this._p.msg      = msg;
		
		return this;
	}
}
// (Boxing type for a consumer)
class AEClassListener    extends AEClassJavaObject {
	
	                      
	
	constructor(callback             ) {
		
		super();
		
		this.callback = callback;
		Object.freeze(this);
	}
}

// ae.event.Event<This,H>
class AEClassEvent       extends AEClassJavaObject {
	
	                                                             
	
	                    
	
	constructor(host               ) {
		
		super();
		
		this._listeners = new AEClassPooledOrderedSet();
		this.host       = host;
	}
	
	get listenerCount()         {return this._listeners.size;}
	
	addListener(listener                )                          {
		
		const wrappedListener = new AEClassListener(listener);
		this._listeners.insertAtEnd(wrappedListener);
		
		return wrappedListener;
	}
	
	fire()       {
		//console.log("id: " + this.hashCode + "   #" + this.listenerCount);
		// $CORRECT_CAST
		this._listeners.forEach((listener) => listener.callback(this));
	}
	
	removeListener(listener                         )       {
		this._listeners.remove(listener);
	}
}

// ae.event.Event$Notify<H>
class AEClassNotifyEvent extends AEClassEvent                     {
	
	constructor(host               ) {
		super(host);
	}
}

// ae.event.SignalEndPoint
class AEClassSignalEndPoint extends AEClassJavaObject {
	
	                                  
	
	                      
	
	constructor(
			source                             ,
			flagCount        ) {
		
		super();
		
		this._source = source;
		this.flags   = Array(flagCount);
		
		Object.freeze(this);
	}
	
	finalize()       {
		this._source.removeEndPoint(this);
	}
	
	hasChanged()          {
		this._source._collectChanges();
		return this.flags[0];
	}
	
	reset()       {
		for(let i = 0; i < this.flags.length; i++) this.flags[i] = false;
	}
}

// ae.event.SignalSource<H extends Observable>
class AEClassSignalSource                {
	
	                                                   
	     
                                                            
  
	
	             
	                  
	
	get _endPoints()                                                 {
		return this._p.endPoints;
	}
	
	_collectChanges()       {
		
		if(this._forwardedSignals && this._endPoints) {
			
			for(let i = 0; i < this.flagCount; i++) {
				
				let flag = false;
				
				for(let j = 0; j < this._forwardedSignals.length; j++) {
					if(this._forwardedSignals[j].flags[i]) {
						flag = true;
						break;
					}
				}
				
				if(flag)
					this._endPoints.forEach(
						(endPoint) => {endPoint.flags[i] = true;});
			}
		}
		
		this.host.reactToSignalChange();
	}
	
	constructor(
			host                   ,
			flagCount                   ,
			... forwardedSignals                                ) {
		
		if(flagCount < 1) throw "'flagCount' must be greater than 0";
		
		forwardedSignals.forEach((endPoint) => {
			if(endPoint.flags.length != flagCount)
				throw "Flag count of forwarded signal must match 'flagCount'";
		});
		
		this.host              = host;
		this.flagCount         = flagCount;
		this._forwardedSignals = forwardedSignals.length > 0 ?
			aeFuncCopy1DimArray(
				forwardedSignals, 0, Array(forwardedSignals.length), 0,
				forwardedSignals.length) :
			null;
		this._p                = {endPoints: null};
		
		Object.freeze(this);
	}
	
	createEndPoint()                          {
		
		const endPoint = new AEClassSignalEndPoint(this, this.flagCount);
		
		if(!this._endPoints) this._p.endPoints = new AEClassPooledHashSet();
		// $NOT_NULL
		this._endPoints.insert(endPoint);
		
		return endPoint;
	}
	
	fire(... changeFlagIndices               )       {
		
		if(!this._endPoints) return;
		
		this._endPoints.forEach((endPoint) => {
			endPoint.flags[0] = true;
			for(let i = 0; i < changeFlagIndices.length; i++)
				endPoint.flags[i] = true;
		});
	}

	removeEndPoint(endPoint                         )       {
		if(this._endPoints) this._endPoints.remove(endPoint);
	}
}

// ae.math.Matrix4D
class AEClassMatrix4D extends AEClassJavaObject {
	
	                             
	                                                   
	                              
	                                         
	                                         

	_computeNormalMatrix(nmData              )               {

		// The normal matrix is the inverse of the upper transposed 3x3 matrix
		
		const a0 = this.m11, a3 = this.m21, a6 = this.m31;
		const a1 = this.m12, a4 = this.m22, a7 = this.m32;
		const a2 = this.m13, a5 = this.m23, a8 = this.m33;
	
		const d =
			a0 * a4 * a8 + a3 * a7 * a2 + a6 * a1 * a5 -
			a2 * a4 * a6 - a5 * a7 * a0 - a8 * a1 * a3;
	
		nmData[ae.I_NM11] = (a4 * a8 - a5 * a7) / d;
		nmData[ae.I_NM12] = (a5 * a6 - a3 * a8) / d;
		nmData[ae.I_NM13] = (a3 * a7 - a6 * a4) / d;
		
		nmData[ae.I_NM21] = (a2 * a7 - a1 * a8) / d;
		nmData[ae.I_NM22] = (a0 * a8 - a2 * a6) / d;
		nmData[ae.I_NM23] = (a1 * a6 - a0 * a7) / d;
		
		nmData[ae.I_NM31] = (a1 * a5 - a2 * a4) / d;
		nmData[ae.I_NM32] = (a2 * a3 - a0 * a5) / d;
		nmData[ae.I_NM33] = (a0 * a4 - a1 * a3) / d;
		
		return nmData;
	}

	_getColumnVector(cIndex        )                   {
		
		const vector =
			this._columnVectors[cIndex] ||
			new ae.math.Vector4D(
				new ae.math.MatrixVector(this, false, cIndex));
		
		this._columnVectors[cIndex] = vector;
		
		return vector;
	}
	
	_getRowVector(rIndex        )                   {
		
		const vector =
			this._rowVectors[rIndex] ||
			new ae.math.Vector4D(
				new ae.math.MatrixVector(this, true, rIndex));
		
		this._rowVectors[rIndex] = vector;
		
		return vector;
	}
	
	constructor() {
		
		super();
		
		this._data          = new Float32Array(16);
		this._auxArray      = Array(16);
		this._rowVectors    = Array(4);
		this._columnVectors = Array(4);
		
		this._nmDataCached = new ae.util.CachedObject(
			new Float32Array(9),
			(obj) => {
				return this._computeNormalMatrix(ae.util.assertNotNull(obj));
			});
		
		this.toIdentity();
		
		Object.freeze(this);
	}
	
	get m11()         {return this._data[ae.I_M11];}
	get m12()         {return this._data[ae.I_M12];}
	get m13()         {return this._data[ae.I_M13];}
	get m14()         {return this._data[ae.I_M14];}
	get m21()         {return this._data[ae.I_M21];}
	get m22()         {return this._data[ae.I_M22];}
	get m23()         {return this._data[ae.I_M23];}
	get m24()         {return this._data[ae.I_M24];}
	get m31()         {return this._data[ae.I_M31];}
	get m32()         {return this._data[ae.I_M32];}
	get m33()         {return this._data[ae.I_M33];}
	get m34()         {return this._data[ae.I_M34];}
	get m41()         {return this._data[ae.I_M41];}
	get m42()         {return this._data[ae.I_M42];}
	get m43()         {return this._data[ae.I_M43];}
	get m44()         {return this._data[ae.I_M44];}
	
	get nm11()         {return this._nmDataCached.object[ae.I_NM11];}
	get nm12()         {return this._nmDataCached.object[ae.I_NM12];}
	get nm13()         {return this._nmDataCached.object[ae.I_NM13];}
	get nm21()         {return this._nmDataCached.object[ae.I_NM21];}
	get nm22()         {return this._nmDataCached.object[ae.I_NM22];}
	get nm23()         {return this._nmDataCached.object[ae.I_NM23];}
	get nm31()         {return this._nmDataCached.object[ae.I_NM31];}
	get nm32()         {return this._nmDataCached.object[ae.I_NM32];}
	get nm33()         {return this._nmDataCached.object[ae.I_NM33];}
	
	get c1()                   {return this._getColumnVector(0);}
	get c2()                   {return this._getColumnVector(1);}
	get c3()                   {return this._getColumnVector(2);}
	get c4()                   {return this._getColumnVector(3);}
	
	get r1()                   {return this._getRowVector(0);}
	get r2()                   {return this._getRowVector(1);}
	get r3()                   {return this._getRowVector(2);}
	get r4()                   {return this._getRowVector(3);}
	
	set m11(value        ) {this._data[ae.I_M11] = value;}
	set m12(value        ) {this._data[ae.I_M12] = value;}
	set m13(value        ) {this._data[ae.I_M13] = value;}
	set m14(value        ) {this._data[ae.I_M14] = value;}
	set m21(value        ) {this._data[ae.I_M21] = value;}
	set m22(value        ) {this._data[ae.I_M22] = value;}
	set m23(value        ) {this._data[ae.I_M23] = value;}
	set m24(value        ) {this._data[ae.I_M24] = value;}
	set m31(value        ) {this._data[ae.I_M31] = value;}
	set m32(value        ) {this._data[ae.I_M32] = value;}
	set m33(value        ) {this._data[ae.I_M33] = value;}
	set m34(value        ) {this._data[ae.I_M34] = value;}
	set m41(value        ) {this._data[ae.I_M41] = value;}
	set m42(value        ) {this._data[ae.I_M42] = value;}
	set m43(value        ) {this._data[ae.I_M43] = value;}
	set m44(value        ) {this._data[ae.I_M44] = value;}
	
	applyNmToShader(
			gl                                ,
			uniLocation                      )       {
		
		gl.uniformMatrix3fv(uniLocation, false, this._nmDataCached.object);
		return this;
	}
	
	applyToDirVectorA(v                  )                   {
		
		v.getDataC(this._auxArray);
		this.applyToDirVectorB(this._auxArray);
		v.setDataC(this._auxArray);
		
		return v;
	}
	
	applyToDirVectorB(
			v                    ,
			offset         = 0)                {
		
		const nmData = this._nmDataCached.object;
		
		// Copy vector at temp array starting at position 3
		for(let i = 0; i < 3; i++) this._auxArray[3 + i] = v[offset + i];
		
		v[offset + 0] =
			nmData[ae.I_NM11] * this._auxArray[3] +
			nmData[ae.I_NM12] * this._auxArray[4] +
			nmData[ae.I_NM13] * this._auxArray[5];
		v[offset + 1] =
			nmData[ae.I_NM21] * this._auxArray[3] +
			nmData[ae.I_NM22] * this._auxArray[4] +
			nmData[ae.I_NM23] * this._auxArray[5];
		v[offset + 2] =
			nmData[ae.I_NM31] * this._auxArray[3] +
			nmData[ae.I_NM32] * this._auxArray[4] +
			nmData[ae.I_NM33] * this._auxArray[5];
		
		return v;
	}
	
	applyToOriginA(dst                  )                   {
		return dst.setDataC(this.applyToOriginD(this._auxArray, 3));
	}
	
	applyToOriginB(dst                  )                   {
		return dst.setDataC(this.applyToOriginD(this._auxArray, 4));
	}
	
	applyToOriginC(
			dst                  ,
			offset         = 0)                {
		
		return this.applyToOriginD(dst, dst.length - offset, offset);
	}
	
	applyToOriginD(
			dst                     ,
			dimension        ,
			offset            = 0)                {
		
		for(let i = 0; i < dimension; i++)
			dst[offset + i] = this.getElement(i, 3);
		
		return dst;
	}
	
	applyToPointA(p                  )                   {
		return p.setDataC(this.applyToPointD(p.getDataC(this._auxArray), 3));
	}
	
	applyToPointB(p                  )                   {
		return p.setDataC(this.applyToPointD(p.getDataC(this._auxArray), 4));
	}
	
	applyToPointC(
			p                    ,
			offset         = 0)                {
		
		return this.applyToPointD(p, p.length - offset, offset);
	}
	
	applyToPointD(
			p                       ,
			dimension        ,
			offset            = 0)                {
		
		const x = dimension >= 1 ? p[offset + 0] : 0;
		const y = dimension >= 2 ? p[offset + 1] : 0;
		const z = dimension >= 3 ? p[offset + 2] : 0;
		const w = dimension >= 4 ? p[offset + 3] : 1;
		
		if(dimension >= 1)
			p[offset + 0] =
				this.m11 * x + this.m12 * y + this.m13 * z + this.m14 * w;
		
		if(dimension >= 2)
			p[offset + 1] =
				this.m21 * x + this.m22 * y + this.m23 * z + this.m24 * w;
		
		if(dimension >= 3)
			p[offset + 2] =
				this.m31 * x + this.m32 * y + this.m33 * z + this.m34 * w;
		
		if(dimension >= 4)
			p[offset + 3] =
				this.m41 * x + this.m42 * y + this.m43 * z + this.m44 * w;
		
		return p;
	}
	
	applyToShader(
			gl                                ,
			uniLocation                      )       {
		
		gl.uniformMatrix4fv(uniLocation, false, this._data);
		return this;
	}
	
	computeDeterminant()         {

		return (
			this.m14 * this.m23 * this.m32 * this.m41 -
			this.m13 * this.m24 * this.m32 * this.m41 -
			this.m14 * this.m22 * this.m33 * this.m41 +
			this.m12 * this.m24 * this.m33 * this.m41 +
			this.m13 * this.m22 * this.m34 * this.m41 -
			this.m12 * this.m23 * this.m34 * this.m41 -
			this.m14 * this.m23 * this.m31 * this.m42 +
			this.m13 * this.m24 * this.m31 * this.m42 +
			this.m14 * this.m21 * this.m33 * this.m42 -
			this.m11 * this.m24 * this.m33 * this.m42 -
			this.m13 * this.m21 * this.m34 * this.m42 +
			this.m11 * this.m23 * this.m34 * this.m42 +
			this.m14 * this.m22 * this.m31 * this.m43 -
			this.m12 * this.m24 * this.m31 * this.m43 -
			this.m14 * this.m21 * this.m32 * this.m43 +
			this.m11 * this.m24 * this.m32 * this.m43 +
			this.m12 * this.m21 * this.m34 * this.m43 -
			this.m11 * this.m22 * this.m34 * this.m43 -
			this.m13 * this.m22 * this.m31 * this.m44 +
			this.m12 * this.m23 * this.m31 * this.m44 +
			this.m13 * this.m21 * this.m32 * this.m44 -
			this.m11 * this.m23 * this.m32 * this.m44 -
			this.m12 * this.m21 * this.m33 * this.m44 +
			this.m11 * this.m22 * this.m33 * this.m44);
	}

	getColumnA(cIndex        )                   {
		return this._getColumnVector(cIndex);
	}
	
	getColumnB(
			cIndex        ,
			dst                  ,
			offset         = 0)                {
		
		for(let i = 0; i < 4; i++) dst[offset + i] = this._data[cIndex * 4 + i];
		return dst;
	}
	
	getDataA(dst                  )                   {
		return dst.setDataA(this);
	}
	
	getDataB(
			dst                  ,
			offset         = 0)                {
		
		for(let i = 0; i < 16; i++) dst[offset + i] = this._data[i];
		return dst;
	}
	
	getDataC(dst              )               {
		dst.set(this._data);
		return dst;
	}
	
	getElement(
			rIndex         ,
			cIndex         )         {
		
		return this._data[cIndex * 4 + rIndex];
	}
	
	// TODO: Namen ändern
	getNmData(
			dst                  ,
			offset         = 0)                {
		
		const nmData = this._nmDataCached.object;
		
		for(let i = 0; i < 9; i++) dst[offset + i] = nmData[i];
		return dst;
	}
	
	getNmDataB(dst              )               {
		dst.set(this._nmDataCached.object);
		return dst;
	}
	
	getRowA(rIndex        )                   {
		return this._getRowVector(rIndex);
	}
	
	getRowB(
			rIndex        ,
			dst                  ,
			offset         = 0)                {
		
		for(let i = 0; i < 4; i++) dst[offset + i] = this._data[i * 4 + rIndex];
		return dst;
	}
	
	invert()       {

		const det = this.computeDeterminant();

		// Zeile 1
		this._auxArray[ 0] = (
			this.m23 * this.m34 * this.m42 -
			this.m24 * this.m33 * this.m42 +
			this.m24 * this.m32 * this.m43 -
			this.m22 * this.m34 * this.m43 -
			this.m23 * this.m32 * this.m44 +
			this.m22 * this.m33 * this.m44) / det;
		this._auxArray[ 4] = (
			this.m14 * this.m33 * this.m42 -
			this.m13 * this.m34 * this.m42 -
			this.m14 * this.m32 * this.m43 +
			this.m12 * this.m34 * this.m43 +
			this.m13 * this.m32 * this.m44 -
			this.m12 * this.m33 * this.m44) / det;
		this._auxArray[ 8] = (
			this.m13 * this.m24 * this.m42 -
			this.m14 * this.m23 * this.m42 +
			this.m14 * this.m22 * this.m43 -
			this.m12 * this.m24 * this.m43 -
			this.m13 * this.m22 * this.m44 +
			this.m12 * this.m23 * this.m44) / det;
		this._auxArray[12] = (
			this.m14 * this.m23 * this.m32 -
			this.m13 * this.m24 * this.m32 -
			this.m14 * this.m22 * this.m33 +
			this.m12 * this.m24 * this.m33 +
			this.m13 * this.m22 * this.m34 -
			this.m12 * this.m23 * this.m34) / det;
		
		// Zeile 2
		this._auxArray[ 1] = (
			this.m24 * this.m33 * this.m41 -
			this.m23 * this.m34 * this.m41 -
			this.m24 * this.m31 * this.m43 +
			this.m21 * this.m34 * this.m43 +
			this.m23 * this.m31 * this.m44 -
			this.m21 * this.m33 * this.m44) / det;
		this._auxArray[ 5] = (
			this.m13 * this.m34 * this.m41 -
			this.m14 * this.m33 * this.m41 +
			this.m14 * this.m31 * this.m43 -
			this.m11 * this.m34 * this.m43 -
			this.m13 * this.m31 * this.m44 +
			this.m11 * this.m33 * this.m44) / det;
		this._auxArray[ 9] = (
			this.m14 * this.m23 * this.m41 -
			this.m13 * this.m24 * this.m41 -
			this.m14 * this.m21 * this.m43 +
			this.m11 * this.m24 * this.m43 +
			this.m13 * this.m21 * this.m44 -
			this.m11 * this.m23 * this.m44) / det;
		this._auxArray[13] = (
			this.m13 * this.m24 * this.m31 -
			this.m14 * this.m23 * this.m31 +
			this.m14 * this.m21 * this.m33 -
			this.m11 * this.m24 * this.m33 -
			this.m13 * this.m21 * this.m34 +
			this.m11 * this.m23 * this.m34) / det;

		// Zeile 3
		this._auxArray[ 2] = (
			this.m22 * this.m34 * this.m41 -
			this.m24 * this.m32 * this.m41 +
			this.m24 * this.m31 * this.m42 -
			this.m21 * this.m34 * this.m42 -
			this.m22 * this.m31 * this.m44 +
			this.m21 * this.m32 * this.m44) / det;
		this._auxArray[ 6] = (
			this.m14 * this.m32 * this.m41 -
			this.m12 * this.m34 * this.m41 -
			this.m14 * this.m31 * this.m42 +
			this.m11 * this.m34 * this.m42 +
			this.m12 * this.m31 * this.m44 -
			this.m11 * this.m32 * this.m44) / det;
		this._auxArray[10] = (
			this.m12 * this.m24 * this.m41 -
			this.m14 * this.m22 * this.m41 +
			this.m14 * this.m21 * this.m42 -
			this.m11 * this.m24 * this.m42 -
			this.m12 * this.m21 * this.m44 +
			this.m11 * this.m22 * this.m44) / det;
		this._auxArray[14] = (
			this.m14 * this.m22 * this.m31 -
			this.m12 * this.m24 * this.m31 -
			this.m14 * this.m21 * this.m32 +
			this.m11 * this.m24 * this.m32 +
			this.m12 * this.m21 * this.m34 -
			this.m11 * this.m22 * this.m34) / det;

		// Zeile 4
		this._auxArray[ 3] = (
			this.m23 * this.m32 * this.m41 -
			this.m22 * this.m33 * this.m41 -
			this.m23 * this.m31 * this.m42 +
			this.m21 * this.m33 * this.m42 +
			this.m22 * this.m31 * this.m43 -
			this.m21 * this.m32 * this.m43) / det;
		this._auxArray[ 7] = (
			this.m12 * this.m33 * this.m41 -
			this.m13 * this.m32 * this.m41 +
			this.m13 * this.m31 * this.m42 -
			this.m11 * this.m33 * this.m42 -
			this.m12 * this.m31 * this.m43 +
			this.m11 * this.m32 * this.m43) / det;
		this._auxArray[11] = (
			this.m13 * this.m22 * this.m41 -
			this.m12 * this.m23 * this.m41 -
			this.m13 * this.m21 * this.m42 +
			this.m11 * this.m23 * this.m42 +
			this.m12 * this.m21 * this.m43 -
			this.m11 * this.m22 * this.m43) / det;
		this._auxArray[15] = (
			this.m12 * this.m23 * this.m31 -
			this.m13 * this.m22 * this.m31 +
			this.m13 * this.m21 * this.m32 -
			this.m11 * this.m23 * this.m32 -
			this.m12 * this.m21 * this.m33 +
			this.m11 * this.m22 * this.m33) / det;
		
		return this.setDataB(this._auxArray);
	}
	
	multWithMatrix(m                  )       {
		
		// this = this * m;

		this.getDataB(this._auxArray);
		
		// Row 1
		this.m11 =
			this._auxArray[ 0] * m.m11 + this._auxArray[ 4] * m.m21 +
			this._auxArray[ 8] * m.m31 + this._auxArray[12] * m.m41;
		this.m12 =
			this._auxArray[ 0] * m.m12 + this._auxArray[ 4] * m.m22 +
			this._auxArray[ 8] * m.m32 + this._auxArray[12] * m.m42;
		this.m13 =
			this._auxArray[ 0] * m.m13 + this._auxArray[ 4] * m.m23 +
			this._auxArray[ 8] * m.m33 + this._auxArray[12] * m.m43;
		this.m14 =
			this._auxArray[ 0] * m.m14 + this._auxArray[ 4] * m.m24 +
			this._auxArray[ 8] * m.m34 + this._auxArray[12] * m.m44;
		
		// Row 2
		this.m21 =
			this._auxArray[ 1] * m.m11 + this._auxArray[ 5] * m.m21 +
			this._auxArray[ 9] * m.m31 + this._auxArray[13] * m.m41;
		this.m22 =
			this._auxArray[ 1] * m.m12 + this._auxArray[ 5] * m.m22 +
			this._auxArray[ 9] * m.m32 + this._auxArray[13] * m.m42;
		this.m23 =
			this._auxArray[ 1] * m.m13 + this._auxArray[ 5] * m.m23 +
			this._auxArray[ 9] * m.m33 + this._auxArray[13] * m.m43;
		this.m24 =
			this._auxArray[ 1] * m.m14 + this._auxArray[ 5] * m.m24 +
			this._auxArray[ 9] * m.m34 + this._auxArray[13] * m.m44;
		
		// Row 3
		this.m31 =
			this._auxArray[ 2] * m.m11 + this._auxArray[ 6] * m.m21 +
			this._auxArray[10] * m.m31 + this._auxArray[14] * m.m41;
		this.m32 =
			this._auxArray[ 2] * m.m12 + this._auxArray[ 6] * m.m22 +
			this._auxArray[10] * m.m32 + this._auxArray[14] * m.m42;
		this.m33 =
			this._auxArray[ 2] * m.m13 + this._auxArray[ 6] * m.m23 +
			this._auxArray[10] * m.m33 + this._auxArray[14] * m.m43;
		this.m34 =
			this._auxArray[ 2] * m.m14 + this._auxArray[ 6] * m.m24 +
			this._auxArray[10] * m.m34 + this._auxArray[14] * m.m44;
		
		// Row 4
		this.m41 =
			this._auxArray[ 3] * m.m11 + this._auxArray[ 7] * m.m21 +
			this._auxArray[11] * m.m31 + this._auxArray[15] * m.m41;
		this.m42 =
			this._auxArray[ 3] * m.m12 + this._auxArray[ 7] * m.m22 +
			this._auxArray[11] * m.m32 + this._auxArray[15] * m.m42;
		this.m43 =
			this._auxArray[ 3] * m.m13 + this._auxArray[ 7] * m.m23 +
			this._auxArray[11] * m.m33 + this._auxArray[15] * m.m43;
		this.m44 =
			this._auxArray[ 3] * m.m14 + this._auxArray[ 7] * m.m24 +
			this._auxArray[11] * m.m34 + this._auxArray[15] * m.m44;
		
		return this;
	}
	
	projectOrthogonal(
			left          ,
			right         ,
			bottom        ,
			top           ,
			near          ,
			far           )       {
	
		// /a 0 0 d\
		// |0 b 0 e|
		// |0 0 c f|
		// \0 0 0 1/
	
		const a         = 2 / (right - left);
		const b         = 2 / (top   - bottom);
		const c         = 2 / (near  - far);
		const d         = (right + left)   / (right - left);
		const e         = (top   + bottom) / (top   - bottom);
		const f         = (far   + near)   / (far   - near);
	
		// Compute column 4 first -> no temp variables
		this.m14 = this.m11 * d + this.m12 * e + this.m13 * f + this.m14;
		this.m24 = this.m21 * d + this.m22 * e + this.m23 * f + this.m24;
		this.m34 = this.m31 * d + this.m32 * e + this.m33 * f + this.m34;
		this.m44 = this.m41 * d + this.m42 * e + this.m43 * f + this.m44;
		
		// Compute rows 1-3
		this.m11 *= a; this.m12 *= b; this.m13 *= c;
		this.m21 *= a; this.m22 *= b; this.m23 *= c;
		this.m31 *= a; this.m32 *= b; this.m33 *= c;
		this.m41 *= a; this.m42 *= b; this.m43 *= c;
		
		return this;
	}

	projectOrthogonalSym(
			width         ,
			height        ,
			near          ,
			far           )       {

		return this.projectOrthogonal(
			-width / 2, width / 2, -height / 2, height / 2, near, far);
	}

	projectPerspective(
			left          ,
			right         ,
			bottom        ,
			top           ,
			near          ,
			far            = 0)       {
	
		// /a 0  c 0\
		// |0 b  d 0|
		// |0 0  e f|
		// \0 0 -1 0/

		const a         = 2 * near / (right - left);
		const b         = 2 * near / (top   - bottom);
		const c         = (right + left)   / (right - left);
		const d         = (top   + bottom) / (top   - bottom);
		
		this.getColumnB(2, this._auxArray);
		
		if(far < near) { // far-ClippingPlane at infinity (e=-1,f=-2*near)
		
			const f         = -2 * near;

			// Compute column 3 first -> less temp variables
			this.m13 = this.m11 * c + this.m12 * d - this._auxArray[0] - this.m14;
			this.m23 = this.m21 * c + this.m22 * d - this._auxArray[1] - this.m24;
			this.m33 = this.m31 * c + this.m32 * d - this._auxArray[2] - this.m34;
			this.m43 = this.m41 * c + this.m42 * d - this._auxArray[3] - this.m44;
			
			// Compute columns 1,2,4
			this.m11 *= a; this.m12 *= b; this.m14 = f * this._auxArray[0];
			this.m21 *= a; this.m22 *= b; this.m24 = f * this._auxArray[1];
			this.m31 *= a; this.m32 *= b; this.m34 = f * this._auxArray[2];
			this.m41 *= a; this.m42 *= b; this.m44 = f * this._auxArray[3];
			
		} else { // normal projection matrix
		
			const e         = (near - far) / (far - near);
			const f         = 2 * far * near / (near - far);
		
			// Compute column 3 first -> less temp variables
			this.m13 =
				this.m11 * c + this.m12 * d + e * this._auxArray[0] - this.m14;
			this.m23 =
				this.m21 * c + this.m22 * d + e * this._auxArray[1] - this.m24;
			this.m33 =
				this.m31 * c + this.m32 * d + e * this._auxArray[2] - this.m34;
			this.m43 =
				this.m41 * c + this.m42 * d + e * this._auxArray[3] - this.m44;
			
			// Compute columns 1,2,4
			this.m11 *= a; this.m12 *= b; this.m14 = f * this._auxArray[0];
			this.m21 *= a; this.m22 *= b; this.m24 = f * this._auxArray[1];
			this.m31 *= a; this.m32 *= b; this.m34 = f * this._auxArray[2];
			this.m41 *= a; this.m42 *= b; this.m44 = f * this._auxArray[3];
		}
		
		return this;
	}

	projectPerspectiveHorFOV(
			vpWidth         ,
			vpHeight        ,
			fov             ,
			near            ,
			far              = 0)       {

		const width         = 2 * Math.tan(fov * Math.PI / 360) * near;
		
		return this.projectPerspectiveSym(
			width, width * vpHeight / vpWidth, near, far);
	}
	
	projectPerspectiveSym(
			width         ,
			height        ,
			near          ,
			far            = 0)       {
		
		return this.projectPerspective(
			-width / 2, width / 2, -height / 2, height / 2, near, far);
	}

	projectPerspectiveVerFOV(
			vpWidth         ,
			vpHeight        ,
			fov             ,
			near            ,
			far              = 0)       {

		const height         = 2 * Math.tan(fov * Math.PI / 360) * near;
		
		return this.projectPerspectiveSym(
			height * vpWidth / vpHeight, height, near, far);
	}

	rotateX(angle        )       {
		
		const s         = Math.sin(angle * ae.RAD_FACTOR);
		const c         = Math.cos(angle * ae.RAD_FACTOR);
		
		// Copy column 2
		this.getColumnB(1, this._auxArray);
		
		// Compute column 2
		this.m12 = this._auxArray[0] * c + this.m13 * s;
		this.m22 = this._auxArray[1] * c + this.m23 * s;
		this.m32 = this._auxArray[2] * c + this.m33 * s;
		this.m42 = this._auxArray[3] * c + this.m43 * s;
		
		// Compute column 3
		this.m13 = this.m13 * c - this._auxArray[0] * s;
		this.m23 = this.m23 * c - this._auxArray[1] * s;
		this.m33 = this.m33 * c - this._auxArray[2] * s;
		this.m43 = this.m43 * c - this._auxArray[3] * s;
		
		return this;
	}

	rotateY(angle        )       {

		const s         = Math.sin(angle * ae.RAD_FACTOR);
		const c         = Math.cos(angle * ae.RAD_FACTOR);
	
		// Copy column 1
		this.getColumnB(0, this._auxArray);
		
		// Compute column 1
		this.m11 = this._auxArray[0] * c - this.m13 * s;
		this.m21 = this._auxArray[1] * c - this.m23 * s;
		this.m31 = this._auxArray[2] * c - this.m33 * s;
		this.m41 = this._auxArray[3] * c - this.m43 * s;
		
		// Compute column 3
		this.m13 = this._auxArray[0] * s + this.m13 * c;
		this.m23 = this._auxArray[1] * s + this.m23 * c;
		this.m33 = this._auxArray[2] * s + this.m33 * c;
		this.m43 = this._auxArray[3] * s + this.m43 * c;
		
		return this;
	}

	rotateZ(angle        )       {

		const s         = Math.sin(angle * ae.RAD_FACTOR);
		const c         = Math.cos(angle * ae.RAD_FACTOR);
	
		// Copy column 1
		this.getColumnB(0, this._auxArray);
		
		// Compute column 1
		this.m11 = this._auxArray[0] * c + this.m12 * s;
		this.m21 = this._auxArray[1] * c + this.m22 * s;
		this.m31 = this._auxArray[2] * c + this.m32 * s;
		this.m41 = this._auxArray[3] * c + this.m42 * s;
		
		// Compute column 2
		this.m12 = this.m12 * c - this._auxArray[0] * s;
		this.m22 = this.m22 * c - this._auxArray[1] * s;
		this.m32 = this.m32 * c - this._auxArray[2] * s;
		this.m42 = this.m42 * c - this._auxArray[3] * s;
		
		return this;
	}

	scaleA(value        )       {
		return this.scaleB(value, value, value);
	}
	
	scaleB(
			x        ,
			y        ,
			z        )       {
		
		this.m11 *= x; this.m12 *= y; this.m13 *= z;
		this.m21 *= x; this.m22 *= y; this.m23 *= z;
		this.m31 *= x; this.m32 *= y; this.m33 *= z;
		this.m41 *= x; this.m42 *= y; this.m43 *= z;
		
		return this;
	}
	
	setDataA(src                  )       {
		this._data.set(src._data);
		return this;
	}
	
	setDataB(
			src                  ,
			offset         = 0)       {
		
		for(let i = 0; i < 16; i++) this._data[i] = src[offset + i];
		return this;
	}
	
	setDataC(
			m11        ,
    		m12        ,
    		m13        ,
    		m14        ,
    		m21        ,
    		m22        ,
    		m23        ,
    		m24        ,
    		m31        ,
    		m32        ,
    		m33        ,
    		m34        ,
    		m41        ,
    		m42        ,
    		m43        ,
    		m44        )       {
		
		this.m11 = m11; this.m12 = m12; this.m13 = m13; this.m14 = m14;
		this.m21 = m21; this.m22 = m22; this.m23 = m23; this.m24 = m24;
		this.m31 = m31; this.m32 = m32; this.m33 = m33; this.m34 = m34;
		this.m41 = m41; this.m42 = m42; this.m43 = m43; this.m44 = m44;
		
		return this;
	}
	
	setElement(
			rIndex        ,
			cIndex        ,
			value         )       {
		
		this._data[cIndex * 4 + rIndex] = value;
		return this;
	}

	toIdentity()       {
		
		this.m11 = this.m22 = this.m33 = this.m44 = 1;

		this.m12 = this.m13 = this.m14 = this.m21 = this.m23 = this.m24 =
		this.m31 = this.m32 = this.m34 = this.m41 = this.m42 = this.m43 = 0;
		
		return this;
	}
	
	translate(
			x        ,
			y        ,
			z        )       {

		this.m14 = this.m11 * x + this.m12 * y + this.m13 * z + this.m14;
		this.m24 = this.m21 * x + this.m22 * y + this.m23 * z + this.m24;
		this.m34 = this.m31 * x + this.m32 * y + this.m33 * z + this.m34;
		this.m44 = this.m41 * x + this.m42 * y + this.m43 * z + this.m44;

		return this;
	}
};

// ae.math.Vector3D
class AEClassVector3D extends AEClassJavaObject {
	
	                                
	                           
	
	          
	          
	          
	
	constructor(backend                       ) {
		
		super();
		
		this.backend  = backend;
		this.readOnly = backend instanceof AEClassReadOnlyBackend ?
			this : new AEClassVector3D(new AEClassReadOnlyBackend(backend));
		
		this.x = 0; this.y = 0; this.z = 0;
	}
	
	addA(value        )       {
		
		this.backend.x += value;
		this.backend.y += value;
		this.backend.z += value;
		
		return this;
	}
	
	addB(v                  )       {
		
		this.backend.x += v.backend.x;
		this.backend.y += v.backend.y;
		this.backend.z += v.backend.z;
		
		return this;
	}
	
	static angleDeg(
			v1                  ,
			v2                  )         {
		
		return AEClassVector3D.angleRad(v1, v2) * ae.DEG_FACTOR;
	}
	
	static angleRad(
			v1                  ,
			v2                  )         {
		
		return Math.acos(
			AEClassVector3D.dot(v1, v2) / (v1.computeLength() * v2.computeLength()));
	}
	
	cloneConst()                   {
		return new AEClassVector3D(new ae.math.ReadOnlyBackend(
			new ae.math.StaticBackend(this.backend)));
	}
	
	cloneDeep()                   {
		return new AEClassVector3D(this.backend);
	}
	
	cloneStatic()                   {
		return new AEClassVector3D(new ae.math.StaticBackend(this.backend));
	}
	
	computeLength()         {
		this.copyStaticValues();
		return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
	}

	computeMean()         {
		return (this.backend.x + this.backend.y + this.backend.z) / 3;
	}

	copyStaticValues()       {
		
		this.x = this.backend.x;
		this.y = this.backend.y;
		this.z = this.backend.z;
		
		return this;
	}

	static createConstA(grey         = 0)                   {
		return AEClassVector3D.createConstB(grey, grey, grey);
	}

	static createConstB(
			x        ,
			y        ,
			z        )                   {
		
		return new AEClassVector3D(new AEClassReadOnlyBackend(
			new AEClassStaticBackend(x, y, z)));
	}

	static createStaticA(grey         = 0)                   {
		return AEClassVector3D.createStaticB(grey, grey, grey);
	}

	static createStaticB(
			x        ,
			y        ,
			z        )                   {
		
		return new AEClassVector3D(new AEClassStaticBackend(x, y, z));
	}

	static cross(
			v1                   ,
			v2                   ,
			dst                  )                   {
		
		v1.copyStaticValues();
		v2.copyStaticValues();
		
		dst.backend.x = v1.y * v2.z - v1.z * v2.y;
		dst.backend.y = v1.z * v2.x - v1.x * v2.z;
		dst.backend.z = v1.x * v2.y - v1.y * v2.x;
		
		return dst;
	}
	
	divA(value        )       {
		
		this.backend.x /= value;
		this.backend.y /= value;
		this.backend.z /= value;
		
		return this;
	}
	
	divB(v                  )       {
		
		this.backend.x /= v.backend.x;
		this.backend.y /= v.backend.y;
		this.backend.z /= v.backend.z;
		
		return this;
	}
	
	static dot(
			v1                  ,
			v2                  )         {
		
		return (
			v1.backend.x * v2.backend.x + v1.backend.y * v2.backend.y +
			v1.backend.z * v2.backend.z);
	}
	
	getDataA(dst                  )                   {
		this.getDataB(dst.backend);
		return dst;
	}
	
	getDataB(dst                       )                        {
		
		dst.x = this.backend.x;
		dst.y = this.backend.y;
		dst.z = this.backend.z;
		
		return dst;
	}
	
	getDataC(
			dst                  ,
			offset         = 0)                {
		
		dst[offset + 0] = this.backend.x;
		dst[offset + 1] = this.backend.y;
		dst[offset + 2] = this.backend.z;
		
		return dst;
	}
	
	multA(value        )       {
		
		this.backend.x *= value;
		this.backend.y *= value;
		this.backend.z *= value;
		
		return this;
	}
	
	multB(v                  )       {
		
		this.backend.x *= v.backend.x;
		this.backend.y *= v.backend.y;
		this.backend.z *= v.backend.z;
		
		return this;
	}
	
	normalize()                   {
		return this.divA(this.computeLength());
	}
	
	setDataA(src                  )                   {
		return this.setDataB(src.backend);
	}
	
	setDataB(src                       )                   {
		return this.setDataD(src.x, src.y, src.z);
	}
	
	setDataC(
			src                  ,
			offset         = 0)                   {
		
		return this.setDataD(src[offset + 0], src[offset + 1], src[offset + 2]);
	}
	
	setDataD(
			x        ,
			y        ,
			z        )       {
		
		this.backend.x = x; this.backend.y = y; this.backend.z = z;
		return this;
	}
	
	subA(value        )       {
		
		this.backend.x -= value;
		this.backend.y -= value;
		this.backend.z -= value;
		
		return this;
	}
	
	subB(v                  )       {
		
		this.backend.x -= v.backend.x;
		this.backend.y -= v.backend.y;
		this.backend.z -= v.backend.z;
		
		return this;
	}
	
	toZeroVector()       {
		return this.setDataD(0, 0, 0);
	}
};

// ae.math.Vector4D
class AEClassVector4D extends AEClassJavaObject {
	
	                                
	                           
	                           
	
	          
	          
	          
	          
	
	constructor(
			backend                        ,
			_xyz                      ) {
		
		super();
		
		if(backend instanceof AEClassReadOnlyBackend) {
			
			this.backend  = backend;
			this.xyz      = _xyz || new AEClassVector3D(backend);
			this.readOnly = this;
			
		} else {
			
			this.backend  = backend;
			this.xyz      = new AEClassVector3D(backend);
			this.readOnly = new AEClassVector4D(
				new AEClassReadOnlyBackend(backend), this.xyz.readOnly);
		}
		
		this.x = 0;
		this.y = 0;
		this.z = 0;
		this.w = 0;
	}
	
	addA(value        )       {
		
		this.backend.x += value;
		this.backend.y += value;
		this.backend.z += value;
		this.backend.w += value;
		
		return this;
	}
	
	addB(v                  )       {
		
		this.backend.x += v.backend.x;
		this.backend.y += v.backend.y;
		this.backend.z += v.backend.z;
		this.backend.w += v.backend.w;
		
		return this;
	}
	
	cloneConst()                   {
		
		return new AEClassVector4D(new AEClassReadOnlyBackend(
			new AEClassStaticBackend(this.backend)));
	}
	
	cloneDeep()                   {
		return new AEClassVector4D(this.backend);
	}
	
	cloneStatic()                   {
		return new AEClassVector4D(new AEClassStaticBackend(this.backend));
	}
	
	computeLength()         {
		this.copyStaticValues();
		return Math.sqrt(
			this.x * this.x + this.y * this.y +
			this.z * this.z + this.w * this.w);
	}

	computeMean()         {
		return (
			this.backend.x + this.backend.y +
			this.backend.z + this.backend.w) / 4;
	}

	copyStaticValues()       {
		
		this.x = this.backend.x;
		this.y = this.backend.y;
		this.z = this.backend.z;
		this.w = this.backend.w;
		
		return this;
	}

	static createConstA(grey         = 0)                   {
		return AEClassVector4D.createConstC(grey, grey, grey, grey);
	}

	static createConstB(
			grey         = 0,
			w            = 1)                   {
				
		return AEClassVector4D.createConstC(grey, grey, grey, w);
	}

	static createConstC(
			x        ,
			y        ,
			z        ,
			w        )                   {
		
		return new AEClassVector4D(new AEClassReadOnlyBackend(
			new AEClassStaticBackend(x, y, z, w)));
	}

	static createStaticA(grey         = 0)                   {
		return AEClassVector4D.createStaticC(grey, grey, grey, grey);
	}

	static createStaticB(
			grey         = 0,
			w            = 1)                   {
				
		return AEClassVector4D.createStaticC(grey, grey, grey, w);
	}

	static createStaticC(
			x        ,
			y        ,
			z        ,
			w        )                   {
		
		return new AEClassVector4D(new AEClassStaticBackend(x, y, z, w));
	}

	divA(value        )       {
		
		this.backend.x /= value;
		this.backend.y /= value;
		this.backend.z /= value;
		this.backend.w /= value;
		
		return this;
	}
	
	divB(v                  )       {
		
		this.backend.x /= v.backend.x;
		this.backend.y /= v.backend.y;
		this.backend.z /= v.backend.z;
		this.backend.w /= v.backend.w;
		
		return this;
	}
	
	dot(v                  )         {
		
		return (
			this.backend.x * v.backend.x + this.backend.y * v.backend.y +
			this.backend.z * v.backend.z + this.backend.w * v.backend.w);
	}
	
	getDataA(dst                  )                   {
		this.getDataB(dst.backend);
		return dst;
	}
	
	getDataB(dst                       )                        {
		
		dst.x = this.backend.x;
		dst.y = this.backend.y;
		dst.z = this.backend.z;
		dst.w = this.backend.w;
		
		return dst;
	}
	
	getDataC(
			dst                  ,
			offset         = 0)                {
		
		dst[offset + 0] = this.backend.x;
		dst[offset + 1] = this.backend.y;
		dst[offset + 2] = this.backend.z;
		dst[offset + 3] = this.backend.w;
		
		return dst;
	}
	
	multA(value        )                   {
		
		this.backend.x *= value;
		this.backend.y *= value;
		this.backend.z *= value;
		this.backend.w *= value;
		
		return this;
	}
	
	multB(v                  )                   {
		
		this.backend.x *= v.backend.x;
		this.backend.y *= v.backend.y;
		this.backend.z *= v.backend.z;
		this.backend.w *= v.backend.w;
		
		return this;
	}
	
	setDataA(src                  )       {
		return this.setDataB(src.backend);
	}
	
	setDataB(src                       )       {
		return this.setDataD(src.x, src.y, src.z, src.w);
	}
	
	setDataC(
			src                  ,
			offset         = 0)       {
		
		return this.setDataD(
			src[offset + 0], src[offset + 1], src[offset + 2], src[offset + 3]);
	}
	
	setDataD(
			x        ,
			y        ,
			z        ,
			w        )       {
		
		this.backend.x = x;
		this.backend.y = y;
		this.backend.z = z;
		this.backend.w = w;
		
		return this;
	}
	
	subA(value        )       {
		
		this.backend.x -= value;
		this.backend.y -= value;
		this.backend.z -= value;
		this.backend.w -= value;
		
		return this;
	}
	
	subB(v                  )       {
		
		this.backend.x -= v.backend.x;
		this.backend.y -= v.backend.y;
		this.backend.z -= v.backend.z;
		this.backend.w -= v.backend.w;
		
		return this;
	}
	
	toZeroPoint()       {
		return this.setDataD(0, 0, 0, 1);
	}
	
	toZeroVector()       {
		return this.setDataD(0, 0, 0, 0);
	}
};

// ae.math.VectorBackend
class AEClassVectorBackend extends AEClassJavaObject {
	
	get x()         {return 0;}
	get y()         {return 0;}
	get z()         {return 0;}
	get w()         {return 0;}
	
	set x(x        )                        {return this;}
	set y(y        )                        {return this;}
	set z(z        )                        {return this;}
	set w(w        )                        {return this;}
	
	getElement(index        )         {
		
		switch(index) {
			case 0: return this.x;
			case 1: return this.y;
			case 2: return this.z;
			case 3: return this.w;
		}
		
		return 0;
	}
	
	setElement(
			index        ,
			value        )                        {
		
		switch(index) {
			case 0: this.x = value; break;
			case 1: this.y = value; break;
			case 2: this.z = value; break;
			case 3: this.w = value; break;
		}
		
		return this;
	}
};

// ae.material.GlslType
class AEClassGlslType extends AEClassJavaObject {
	
	                               
	                     
	                     
	                                     
	
	// internal constructor ////////////////////////////////////////////////////
	
	constructor(
			baseType                   ,
			dimension        ,
			glslName         ) {
		
		super();
		
		this.baseType     = baseType;
		this.dimension    = dimension;
		this.glslName     = glslName;
		this.varSignature = new AEClassCustomSignature(this, []);
	}
	
	// public getters + setters ////////////////////////////////////////////////
	
	get defined()          {
		return this !== _aeEnumGlslType.UNDEF;
	}
	
	get scalar()          {
		return this.dimension == 1;
	}
}

// ae.material.GlslsType$get
function aeFuncGetGlslType(
		baseType                   ,
		dimension        )                  {
	
	switch(baseType) {
		
		case _aeEnumGlslTypeBase.BOOLEAN:
			switch(dimension) {
				case 1: return _aeEnumGlslType.BOOL;
				case 2: return _aeEnumGlslType.BOOL2;
				case 3: return _aeEnumGlslType.BOOL3;
				case 4: return _aeEnumGlslType.BOOL4;
			}
			break;
		
		case _aeEnumGlslTypeBase.INTEGER:
			switch(dimension) {
				case 1: return _aeEnumGlslType.INT;
				case 2: return _aeEnumGlslType.INT2;
				case 3: return _aeEnumGlslType.INT3;
				case 4: return _aeEnumGlslType.INT4;
			}
			break;
		
		case _aeEnumGlslTypeBase.FLOAT:
			switch(dimension) {
				case 1: return _aeEnumGlslType.FLOAT;
				case 2: return _aeEnumGlslType.FLOAT2;
				case 3: return _aeEnumGlslType.FLOAT3;
				case 4: return _aeEnumGlslType.FLOAT4;
			}
			break;
		
		case _aeEnumGlslTypeBase.TEXTURE:
			switch(dimension) {
				case 1: return _aeEnumGlslType.TEX1;
				case 2: return _aeEnumGlslType.TEX2;
				case 3: return _aeEnumGlslType.TEX3;
			}
			break;
		
		case _aeEnumGlslType.UNDEF: return _aeEnumGlslType.UNDEF;
	}
	
	return _aeEnumGlslType.UNDEF;
}

// ae.material.Material
class AEClassMaterial extends AEClassJavaObject {
	
	                               
	
	                                                                         
	                                                                       
	
	                                 
	                                 

	constructor(
			engine                           ,
			name             ,
			variables                                                  ,
			functions                                                  ,
			params                                     ,
			textures                                     ,
			values                                              ,
			color                 ) {
	
		super();
	
		const components     = new AEClassPooledHashSet();
		const valueVariables = new AEClassPooledLinkedList();

		engine._addMaterial(this);
		
		this.engine   = engine;
		this.onUpdate = engine.state.createUpdateEvent(this);
		this._textures = new AEClassPooledHashMap();
		this._params = new AEClassPooledHashMap();
		
		variables.forEach((i) => components    .insert     (i._component));
		functions.forEach((i) => components    .insert     (i._function));
		params   .forEach((i) => components    .insert     (i._uniform));
		textures .forEach((i) => components    .insert     (i._uniform));
		values   .forEach((i) => valueVariables.insertAtEnd(i._lVariable));
		
		const program = new AEClassShaderProgram(
			engine, name, components, valueVariables, color);
		
		this._glslShader = program._glslShader;
		/*
		for(CustomParam i : params) {
			i._location = program.getUniformLocation(i._uniform);
			_params.setValue(i._uniform.name, i);
		}
		
		for(CustomTexture i : textures) {
			i._location = program.getUniformLocation(i._uniform);
			_textures.setValue(i._uniform.name, i);
		}
		*/
		
		Object.freeze(this);
	}
	
	setParam(
			name                     ,
			... value               )                  {
		
		// $NOT_NULL: TODO: Safety check
		this._params.getValue(name)._value = value;
		return this;
	}
	/*
	public final Material setTexture(
			final String  name,
			final Texture texture) {
		
		_textures.getValue(name)._texture = texture;
		return this;
	}
	*/
	update()       {
		this.onUpdate.fire();
	}
	
	_use()       {
		
		this._glslShader._bind();
		
		this.engine.state._newGlslShader(this._glslShader);
		this.engine.state._applyUniformsToShader(this.engine.gl);
		
		let curSlot = 0;
		//for(CustomParam   i : _params  .values) i._useParam();
		//for(CustomTexture i : _textures.values) i._useTexture(curSlot++);
	}
}

// ae.material.Material$CustomParam
class AEClassMatCustomParam extends AEClassJavaObject {
	
	     
                                 
                                   
  
	
	                       
	                                
	
	// internal constructor ////////////////////////////////////////////////////
	
	constructor(
			name        ,
			type                  ) {
		
		super();
		
		this._uniform = new AEClassSPCustomParam(name, type);
		this._p       = {
			location: -1,
			value:    null,
		};
		
		this._node = AEClassNode._createFromType(this._uniform._glslName, type);
		
		Object.freeze(this);
	}
	
	// internal methods ////////////////////////////////////////////////////////
	
	_useParam(gl                       )       {

		if(this._p.value === null) return;
		
		switch(this._p.value.length) {
			case 1: gl.uniform1fv(this._p.location, this._p.value); break;
			case 2: gl.uniform2fv(this._p.location, this._p.value); break;
			case 3: gl.uniform3fv(this._p.location, this._p.value); break;
			case 4: gl.uniform4fv(this._p.location, this._p.value); break;
		}
	}
}

// ae.material.Material$CustomTexture
class AEClassMatCustomTexture extends AEClassJavaObject {
	
	     
                                 
                     
  
	
	                       
	                                  
	
	// internal constructor ////////////////////////////////////////////////////
	
	constructor(name        ) {
		
		super();
		
		this._uniform = new AEClassSPCustomTexture(name);
		this._node    = AEClassNode._createFromType(this._uniform._glslName, _aeEnumGlslType.TEX2);
		this._p       = {
			location: -1,
		};
		
		Object.freeze(this);
	}
	
	// internal methods ////////////////////////////////////////////////////////
	
	_useTexture(
			gl                         ,
			slot        )       {
		/*
		gl.activeTexture(gl.TEXTURE0 + slot);
		
		if(_texture != null) {
			_texture.use();
		} else {
			glBindTexture(GL_TEXTURE_2D, 0);
		}
		
		glUniform1i(_location, slot);
		*/
	}
}

// ae.material.Material$BuiltInFunction
class AEClassMatBuiltInFunction extends AEClassJavaObject {
	
	                                    
	                                  
	
	// internal constructor ////////////////////////////////////////////////////
	
	constructor(func                    ) {
		
		super();
		
		this._nodeTemplate = func._createNodeTemplate();
		this._function     = func;
		
		Object.freeze(this);
	}
}

// ae.material.Material$BuiltInVariable
class AEClassMatBuiltInVariable extends AEClassJavaObject {
	
	                         
	                                
	
	// internal constructor ////////////////////////////////////////////////////
	
	constructor(variable                                               ) {
		
		super();
		
		this._node = AEClassNode._createFromType(variable._glslName, variable._type);
		this._component = variable;
		
		Object.freeze(this);
	}
}

// ae.material.Material$Value
class AEClassMatValue extends AEClassJavaObject {
	
	                         
	                                    
	
	// internal constructor ////////////////////////////////////////////////////
	
	constructor(
			name              ,
			type                        ,
			definition              ) {
		
		super();
		
		this._lVariable = new AEClassSPLocalVariable(
			"var_" + name,
			type,
			type.glslName + " var_" + name + " = " +
				definition._toSourceString() + ";");
		
		this._node = AEClassNode._createFromType(this._lVariable._glslName, type);
		
		Object.freeze(this);
	}
}

// ae.material.MaterialBuilder
class AEClassMaterialBuilder extends AEClassJavaObject {
	
	     
                              
  
	
	                                                                               
	                                                                             
	                                                          
	                                                                       
	                                                                 
	                                                                 
	
	// private methods /////////////////////////////////////////////////////////
	
	static _createFuncTemplate(
			name              ,
			signatures                   )                      {
		
		const paramCount = signatures[0].getParamCount();
		const sepStrings = Array(paramCount + 1);
		
		sepStrings[0]          = name + "(";
		for(let i = 1; i < paramCount; i++) sepStrings[i] = ", ";
		sepStrings[paramCount] = ")";
		
		return new AEClassNodeTemplate(paramCount, signatures, sepStrings);
	}
	
	static _createMultiOpOperatorNode(
			operator        ,
			ops                         )              {
		
		if(ops.length === 1) return ops[0];
		
		const isOpScalar = Array(ops.length);
		const sepStrings = Array(ops.length + 1);
		
		for(let i = 0; i < ops.length; i++) isOpScalar[i] = ops[i].type.scalar;
		
		sepStrings[0] = "(";
		for(let i = 1; i < ops.length; i++)
			sepStrings[i] = " " + operator + " ";
		sepStrings[ops.length] = ")";
		
		return new AEClassNodeTemplate(
			ops.length,
			[AEClassSignatureGroup.createWithUniqueBase(
				ops[0].type.baseType, false, isOpScalar)],
			sepStrings)._createNode(ops);
	}
	
	// internal getters + setters //////////////////////////////////////////////
	
	get color()                       {return this._p.color;}
	
	// public constructor //////////////////////////////////////////////////////
	
	constructor() {
		
		super();
		
		this._textures      = new AEClassPooledHashMap();
		this._parameters    = new AEClassPooledHashMap();
		this._valuesOrdered = new AEClassPooledLinkedList();
		this._valuesByName  = new AEClassPooledHashMap();
		this._variables     = new AEClassPooledHashSet();
		this._functions     = new AEClassPooledHashSet();
		this._p             = {
			color: null,
		};
		
		Object.freeze(this);
	}
	
	// public methods //////////////////////////////////////////////////////////
	
	abs(x             )              {
		return _AE_NT_FUNC_ABS._createNode([x]);
	}

	acos(x             )              {
		return _AE_NT_FUNC_ACOS._createNode([x]);
	}
	
	add(... ops                    )              {
		return AEClassMaterialBuilder._createMultiOpOperatorNode('+', ops);
	}
	/*
	public final MaterialBuilder addParameter(
			final String   name,
			final GlslType type) {
		
		if(_parameters.containsKey(name))
			throw new UnsupportedOperationException(
				"A parameter with name '" + name + "' already exists");
		
		_parameters.put(name, new Material.CustomParam(name, type));
		
		return this;
	}
	
	public final MaterialBuilder addTexture(final String name) {
		
		if(_textures.containsKey(name))
			throw new UnsupportedOperationException(
				"A texture with name '" + name + "' already exists");
		
		_textures.put(name, new Material.CustomTexture(name));
		
		return this;
	}
	
	public final MaterialBuilder addValue(
    		final String   name,
    		final GlslType type,
    		final Node     definition) {
		
		final Material.Value var = new Material.Value(name, type, definition);
		
		_valuesOrdered.add(var);
		_valuesByName .put(name, var);
		
		return this;
	}
	*/
	asin(x             )              {
		return _AE_NT_FUNC_ASIN._createNode([x]);
	}

	atan(x             )              {
		return _AE_NT_FUNC_ATAN._createNode([x]);
	}

	ceil(x             )              {
		return _AE_NT_FUNC_CEIL._createNode([x]);
	}

	clamp(
			x               ,
			min             ,
			max             )              {
		
		return _AE_NT_FUNC_CLAMP._createNode([x, min, max]);
	}
	
	constF(... values               )              {
		
		const nodes = Array(values.length);
		
		for(let i = 0; i < values.length; i++)
			nodes[i] =
				AEClassNode._createFromType(values[i].toString(), _aeEnumGlslType.FLOAT);
		
		return this.merge(nodes);
	}

	constI(... values               )              {
		
		const nodes = Array(values.length);
		
		for(let i = 0; i < values.length; i++)
			nodes[i] =
				AEClassNode._createFromType(Math.round(values[i]).toString(), _aeEnumGlslType.INT);
		
		return this.merge(nodes);
	}
	
	cos(x             )              {
		return _AE_NT_FUNC_COS._createNode([x]);
	}
	
	createMaterial(
			engine                        ,
			name          )                  {
		
		if(this._p.color === null) throw "Color term undefined";
		
		return new AEClassMaterial(
			engine, name,
			this._variables, this._functions,
			this._parameters.values, this._textures.values, this._valuesOrdered,
			this._p.color);
	}
	
	cross(
			v1             ,
			v2             )              {
		
		return _AE_NT_FUNC_CROSS._createNode([v1, v2]);
	}
	
	degrees(x             )              {
		return _AE_NT_FUNC_DEGREES._createNode([x]);
	}
	
	distance(
			p1             ,
			p2             )              {
		
		return _AE_NT_FUNC_DISTANCE._createNode([p1, p2]);
	}
	
	div(
			op1             ,
			op2             )              {
		
		return _AE_NT_BIN_OP_DIV._createNode([op1, op2]);
	}
	
	dot(
			v1             ,
			v2             )              {
		
		return _AE_NT_FUNC_DOT._createNode([v1, v2]);
	}
	
	exp(x             )              {
		return _AE_NT_FUNC_EXP._createNode([x]);
	}

	exp2(x             )              {
		return _AE_NT_FUNC_EXP2._createNode([x]);
	}
	
	eye()              {
		this._variables.insert(_AE_MAT_BUILTIN_VAR_EYE);
		return _AE_MAT_BUILTIN_VAR_EYE._node;
	}
	
	faceforward(
			n                ,
			i                ,
			nRef             )              {
		
		return _AE_NT_FUNC_FACEFORWARD._createNode([n, i, nRef]);
	}
	
	floor(x             )              {
		return _AE_NT_FUNC_FLOOR._createNode([x]);
	}

	fract(x             )              {
		return _AE_NT_FUNC_FRACT._createNode([x]);
	}

	inversesqrt(x             )              {
		return _AE_NT_FUNC_INVERSESQRT._createNode([x]);
	}

	length(x             )              {
		return _AE_NT_FUNC_LENGTH._createNode([x]);
	}

	log(x             )              {
		return _AE_NT_FUNC_LOG._createNode([x]);
	}

	log2(x             )              {
		return _AE_NT_FUNC_LOG2._createNode([x]);
	}

	max(
			x1             ,
			x2             )              {
		
		return _AE_NT_FUNC_MAX._createNode([x1, x2]);
	}
	
	merge(nodes                    )              {
		
		if(nodes.length === 1) return nodes[0];
		
		const paramTypes = Array(nodes.length);
		const sepStrings = Array(nodes.length + 1);
		
		let baseType  = _aeEnumGlslTypeBase.UNDEF;
		let dimension = 0;
		
		for(let i = 0; i < nodes.length; i++) {
			
			paramTypes[i] = nodes[i].type;
			dimension    += nodes[i].type.dimension;
			
			// Check the base type consistency
			if(i > 0) {
				if(paramTypes[i].baseType !== baseType)
					throw "Nodes have different base types";
			} else {
				baseType = paramTypes[i].baseType;
			}
		}
		
		if(dimension > 4) throw "Dimension greater than 4";
		
		const mergedType = aeFuncGetGlslType(baseType, dimension);
		
		sepStrings[0]            = mergedType.glslName + "(";
		sepStrings[nodes.length] = ")";
		
		for(let i = 1; i < nodes.length; i++) sepStrings[i] = ", ";
		
		return new AEClassNodeTemplate(
			nodes.length,
			[new AEClassCustomSignature(mergedType, paramTypes)],
			sepStrings)._createNode(nodes);
	}
	
	min(
			x1             ,
			x2             )              {
		
		return _AE_NT_FUNC_MIN._createNode([x1, x2]);
	}
	
	mix(
			op1             ,
			op2             ,
			x               )              {
		
		return _AE_NT_FUNC_MIX._createNode([op1, op2, x]);
	}
	
	mod(
			x             ,
			y             )              {
		
		return _AE_NT_FUNC_MOD._createNode([x, y]);
	}
	
	mult(... ops                    )              {
		return AEClassMaterialBuilder._createMultiOpOperatorNode('*', ops);
	}
	
	negate(x             )              {
		return _AE_NT_UNARY_OP_NEGATE._createNode([x]);
	}
	
	normal()              {
		this._variables.insert(_AE_MAT_BUILTIN_VAR_NORMAL);
		return _AE_MAT_BUILTIN_VAR_NORMAL._node;
	}
	
	normalize(x             )              {
		return _AE_NT_FUNC_NORMALIZE._createNode([x]);
	}
	
	param(name        )              {
		// TODO: bessere Abfrage
		return this._parameters.getValueA(new AEClassString(name))._node;
	}
	
	phongA()              {
		return this.phongC(this.position(), this.normal());
	}
	
	phongB(normal             )              {
		return this.phongC(this.position(), normal);
	}
	
	phongC(
			position             ,
			normal               )              {
		
		this._functions.insert(_AE_MAT_BUILTIN_FUNC_PHONG);
		
		return _AE_MAT_BUILTIN_FUNC_PHONG._nodeTemplate._createNode(
			[position, normal]);
	}
	
	position()              {
		this._variables.insert(_AE_MAT_BUILTIN_VAR_POSITION);
		return _AE_MAT_BUILTIN_VAR_POSITION._node;
	}
	
	pow(
			x             ,
			y             )              {
		
		return _AE_NT_FUNC_POW._createNode([x, y]);
	}
	
	radians(x             )              {
		return _AE_NT_FUNC_RADIANS._createNode([x]);
	}
	/*
	public final Node rawTexture(final String name) {
		return _textures.get(name).node;
	}
	*/
	reflect(
			i             ,
			n             )              {
		
		return _AE_NT_FUNC_REFLECT._createNode([i, n]);
	}
	
	refract(
			i               ,
			n               ,
			eta             )              {
		
		return _AE_NT_FUNC_REFRACT._createNode([i, n, eta]);
	}
	/*
	public final Node rim() {
		return sub(constF(1), dot(normal(), eye()));
	}

	// 'angle' is the width of the rim, 0� <= angle <= 90�
	public final Node rim(final float angle) {
		return sub(
			constF(1),
			div(
				dot(normal(), eye()),
				constF((float)Math.cos(Math.toRadians(90 - angle)))));
	}
	*/
	setColor(color             )       {
		
		if(color.type !== _aeEnumGlslType.FLOAT3) throw "No Float3";
		
		this._p.color = color;
		return this;
	}
	
	sign(x             )              {
		return _AE_NT_FUNC_SIGN._createNode([x]);
	}

	sin(x             )              {
		return _AE_NT_FUNC_SIN._createNode([x]);
	}

	smoothstep(
			edge1             ,
			edge2             ,
			x                 )              {
		
		return _AE_NT_FUNC_SMOOTHSTEP._createNode([edge1, edge2, x]);
	}
	
	sqrt(x             )              {
		return _AE_NT_FUNC_SQRT._createNode([x]);
	}

	step(
			edge             ,
			x                )              {
		
		return _AE_NT_FUNC_STEP._createNode([edge, x]);
	}
	
	sub(... ops                    )              {
		return AEClassMaterialBuilder._createMultiOpOperatorNode('-', ops);
	}
	
	swizzle(
			input             ,
			mask         )              {
		
		if(mask.length > 4) throw "Swizzle mask is too long";
		
		return new AEClassNodeTemplate(
			1,
			[new AEClassCustomSignature(
				aeFuncGetGlslType(input.type.baseType, mask.length),
				[input.type])],
			["", "." + mask])._createNode([input]);
	}
	
	tan(x             )              {
		return _AE_NT_FUNC_TAN._createNode([x]);
	}
	/*
	public final Node texCoord() {
		_variables.add(Material.BUILTIN_VAR_TEXCOORD);
		return Material.BUILTIN_VAR_TEXCOORD.node;
	}
	
	public final Node texture(final String name) {
		return texture(name, texCoord());
	}
	
	public final Node texture(
			final String name,
			final Node   texCoord) {
		
		return _FUNC_TEXTURE.createNode(rawTexture(name), texCoord);
	}

	public final Node textureA(final String name) {
		return textureA(name, texCoord());
	}
	
	public final Node textureA(
			final String name,
			final Node   texCoord) {
		
		return swizzle(texture(name, texCoord), "a");
	}

	public final Node textureRGB(final String name) {
		return textureRGB(name, texCoord());
	}
	
	public final Node textureRGB(
			final String name,
			final Node   texCoord) {
		
		return swizzle(texture(name, texCoord), "rgb");
	}
	*/
	value(name        )              {
		
		const boxedName = new AEClassString(name);
		
		if(!this._valuesByName.hasKey(boxedName))
			throw "variable '" + name + "' doesn't exist";
		
		return this._valuesByName.getValueA(boxedName)._node;
	}
}

// ae.material.Node
class AEClassNode extends AEClassJavaObject {
	
	                               
	                              
	
	// internal
	                      
	
	// internal constructor ////////////////////////////////////////////////////
	
	constructor(
			template                     ,
			type                     ,
			inputs                      ) {
		
		super();
		
		this._template = template;
		this._inputs   = inputs;
		this.type      = type;
		
		Object.freeze(this);
	}
	
	// internal methods ////////////////////////////////////////////////////////
	
	static _createFromType(
			name        ,
			type                 )              {
		
		return new AEClassNode(
			new AEClassNodeTemplate(0, [type.varSignature], [name]), type, []);
	}
	
	_toSourceString()         {
		
		let sourceString = "";
		
		for(let i = 0; i < this._inputs.length; i++)
			sourceString +=
				this._template._getSepString(i) +
				this._inputs[i]._toSourceString();
		
		return sourceString + this._template._getLastSepString();
	}
}
// ae.material.NodeTemplate
class AEClassNodeTemplate extends AEClassJavaObject {
	
	                    
	                               
	                           
	
	// internal constructor ////////////////////////////////////////////////////
	
	constructor(
    		inputCount        ,
    		signatures                   ,
    		sepStrings               ) {
		
		super();
		
		if(sepStrings.length - 1 !== inputCount)
			throw "Mismatch between sep-string count and input count";
		
		this._inputCount = inputCount;
		this._signatures = signatures;
		this._sepStrings = sepStrings;
		
		Object.freeze(this);
	}
	
	// internal methods ////////////////////////////////////////////////////////
	
	_createNode(inputs                    )              {
		
		if(inputs.length !== this._inputCount)
			throw "Actual input count doesn't match expected input count";
		
		const signature  = Array(this._inputCount);
		let   outputType = _aeEnumGlslType.UNDEF;
		
		// Initialize the signature
		for(let i = 0; i < this._inputCount; i++) signature[i] = inputs[i].type;
		
		// Try finding a matching signature
		for(let i = 0; i < this._signatures.length; i++) {
			outputType = this._signatures[i].resolveSignature(signature);
			if(outputType.defined) break;
		}
		
		if(!outputType.defined) throw "No valid signature found";
		
		return new AEClassNode(this, outputType, inputs);
	}
	
	_getLastSepString()         {
		return this._sepStrings[this._inputCount];
	}
	
	_getSepString(index        )         {
		return this._sepStrings[index];
	}
}
// ae.material.ShaderProgram
class AEClassShaderProgram extends AEClassJavaObject {
	
	                                                                            
	                                   
	
	// private methods /////////////////////////////////////////////////////////
	
	static _assembleFragmentShaderSource(
			uniformsFS                                    ,
			uniformParams                                   ,
    		uniformTextures                                   ,
			varyings                                    ,
			lVariables                                        ,
    		customLVariables                                  ,
			functions                                    ,
			color                        )         {
		
		const source = Array(0);
		
		uniformsFS.forEach((uniform) => source.push(uniform._glslLine));
		source.push("");
		
		uniformTextures.forEach((uniform) => source.push(uniform._glslLine));
		source.push("");
		
		uniformParams.forEach((uniform) => source.push(uniform._glslLine));
		source.push("");
		
		varyings.forEach((varying) => source.push(varying._glslLineDeclFS));
		source.push("");

		functions.forEach((func) => {
			
			const lines = func._glslLines;
			
			for(let i = 0; i < lines.length; i++) source.push(i);
			source.push("");
		});
		
		source.push("void main() {", "");
		
		lVariables.forEach(
			(variable) => source.push('\t' + variable._glslLine));
		source.push("");
		
		customLVariables.forEach(
			(variable) => source.push('\t' + variable._glslLine));
		source.push("");
		
		source.push(
			"\tgl_FragColor = vec4(" + color._toSourceString() + ", 1);",
			"}",
			"");
		
		//console.log(source.join('\n'));
		
		return source.join('\n');
	}
	
	static _assembleVertexShaderSource(
    		uniformsVS                              ,
    		attributes                              ,
    		varyings                              )         {
		
		const source = Array(0);
		
		uniformsVS.forEach((uniform) => source.push(uniform._glslLine));
		source.push("");
		
		attributes.forEach((attribute) => source.push(attribute._glslLine));
		source.push("");
		
		varyings.forEach((varying) => source.push(varying._glslLineDeclVS));
		source.push("");
		
		source.push(
			"void main() {",
			"",
			"\thighp vec4 eyePos = u_matModelView * vec4(in_position, 1);",
			"");
		
		varyings.forEach((varying) => source.push(varying._glslLineInit));
		source.push("");
		
		source.push(
			"\tgl_Position = u_matProjection * eyePos;",
			"}",
			"");
		
		//console.log(source.join('\n'));
		
		return source.join('\n');
	}
	
	static _computeTransDependentShaderComponents(
			components                                           )       {
		
		components.insert(_AE_SP_UNI_MAT_MODELVIEW);
		components.insert(_AE_SP_UNI_MAT_PROJECTION);
		components.insert(_AE_SP_ATTR_POSITION);

		if(components.exists(_AE_SP_FUNC_PHONG)) {
			components.insert(_AE_SP_UNI_DIR_LIGHTS);
			components.insert(_AE_SP_UNI_DIR_LIGHT_COUNT);
			components.insert(_AE_SP_UNI_POINT_LIGHTS);
			components.insert(_AE_SP_UNI_POINT_LIGHT_COUNT);
		}
		
		if(components.exists(_AE_SP_LVAR_EYE))
			components.insert(_AE_SP_VARY_POSITION);
		
		if(components.exists(_AE_SP_LVAR_NORMAL))
			components.insert(_AE_SP_VARY_NORMAL);
		
		if(components.exists(_AE_SP_VARY_POSITION))
			components.insert(_AE_SP_ATTR_POSITION);
		
		if(components.exists(_AE_SP_VARY_NORMAL)) {
			components.insert(_AE_SP_UNI_MAT_NORMAL);
			components.insert(_AE_SP_ATTR_NORMAL);
		}
		
		if(components.exists(_AE_SP_VARY_TEXCOORD))
			components.insert(_AE_SP_ATTR_TEXCOORD);
	}

	static _createShaderProgram(
			engine                                  ,
			name                    ,
			uniformsVS                                     ,
			uniformsFS                                     ,
			uniformParams                                    ,
    		uniformTextures                                    ,
    		attributes                                     ,
			varyings                                     ,
			lVariables                                         ,
    		customLVariables                                   ,
			functions                                     ,
			color                        )                    {

		const attributeNames = [null, null, null];
		
		attributes.forEach((attribute) => {
			attributeNames[attribute._index] = attribute._name;
		});
		
		return new AEClassGlslShader(
			engine,
			"[Material] " + name,
			AEClassShaderProgram._assembleVertexShaderSource(uniformsVS, attributes, varyings),
			AEClassShaderProgram._assembleFragmentShaderSource(
				uniformsFS, uniformParams, uniformTextures,
				varyings, lVariables, customLVariables, functions, color),
			_AE_SP_UNI_MAT_MODELVIEW    ._glslName,
			_AE_SP_UNI_MAT_PROJECTION   ._glslName,
			_AE_SP_UNI_MAT_NORMAL       ._glslName,
			"TODO",
			_AE_SP_UNI_DIR_LIGHTS       ._glslName,
			_AE_SP_UNI_DIR_LIGHT_COUNT  ._glslName,
			_AE_SP_UNI_POINT_LIGHTS     ._glslName,
			_AE_SP_UNI_POINT_LIGHT_COUNT._glslName,
			attributeNames);
	}
	
	constructor(
    		engine                        ,
    		name        ,
    		components                                           ,
    		customLVariables                                                  ,
    		color             ) {
		
		super();
		
		const uniforms        = new AEClassPooledLinkedList();
		const uniformsVS      = new AEClassPooledLinkedList();
		const uniformsFS      = new AEClassPooledLinkedList();
		const uniformParams   = new AEClassPooledLinkedList();
		const uniformTextures = new AEClassPooledLinkedList();
		const attributes      = new AEClassPooledLinkedList();
		const varyings        = new AEClassPooledLinkedList();
		const lVariables      = new AEClassPooledLinkedList();
		const functions       = new AEClassPooledLinkedList();
		
		AEClassShaderProgram._computeTransDependentShaderComponents(components);
		
		components.forEach((comp) => {
			
			// For some reason we have to use else-if concatenation instead of
			// multiple independent if-statements to satisfy the type checker
			if(       comp instanceof AEClassSPUniformVS    ) {
				uniformsVS   .insertAtEnd(comp);
			} else if(comp instanceof AEClassSPUniformFS    ) {
				uniformsFS   .insertAtEnd(comp);
			} else if(comp instanceof AEClassSPAttribute    ) {
				attributes   .insertAtEnd(comp);
			} else if(comp instanceof AEClassSPVarying      ) {
				varyings     .insertAtEnd(comp);
			} else if(comp instanceof AEClassSPLocalVariable) {
				lVariables   .insertAtEnd(comp);
			} else if(comp instanceof AEClassSPFunction     ) {
				functions    .insertAtEnd(comp);
			} else if(comp instanceof AEClassSPCustomParam  ) {
				uniformParams.insertAtEnd(comp);
			} else if(comp instanceof AEClassSPCustomTexture) {
				uniformTextures.insertAtEnd(comp);
			}
		});
		
		this._glslShader   = AEClassShaderProgram._createShaderProgram(
			engine, name,
			uniformsVS, uniformsFS, uniformParams, uniformTextures,
			attributes, varyings, lVariables, customLVariables, functions,
			color);
		this._uniLocations = new AEClassPooledHashMap();
		
		uniforms.addAll(uniformsVS);
		uniforms.addAll(uniformsFS);
		uniforms.addAll(uniformParams);
		uniforms.addAll(uniformTextures);
		uniforms.forEach((uniform) => this._uniLocations.setValue(uniform, this._glslShader._getUniformLocation(uniform._glslName)));
		
		Object.freeze(this);
	}
	
	getUniformLocation(uniform                  )                       {
		return this._uniLocations.hasKey(uniform) ?
			this._uniLocations.getValueA(uniform) : -1;
	}
}

// ae.material.ShaderProgram$ShaderComponent (marker class)
class AEClassSPComponent extends AEClassJavaObject {
	
	// protected constructor ///////////////////////////////////////////////////
	
	constructor() {
		super();
	}
}

// ae.material.ShaderProgram$Attribute
class AEClassSPAttribute extends AEClassSPComponent {
	
	                  
	                  
	                  
	
	// internal constructor ////////////////////////////////////////////////////
	
	constructor(
			name            ,
			index           ,
			glslLine        ) {
		
		super();
		
		this._name     = name;
		this._index    = index;
		this._glslLine = glslLine;
		
		Object.freeze(this);
	}
}

// ae.material.ShaderProgram$Function
class AEClassSPFunction extends AEClassSPComponent {

	                             
	                                    
	                           
	                    
	
	// internal constructor ////////////////////////////////////////////////////
	
	constructor(
			name                 ,
			returnType                    ,
			paramTypes                           ,
			... glslLines               ) {
		
		super();
		
		this._returnType = returnType;
		this._paramTypes = paramTypes;
		this._glslLines  = glslLines;
		this._glslName   = name;
		
		Object.freeze(this);
	}
	
	// internal methods ////////////////////////////////////////////////////////
	
	_createNodeTemplate()                      {
		
		const sepStrings = Array(this._paramTypes.length + 1);
		
		sepStrings[0]                  = this._glslName + "(";
		for(let i = 1; i < this._paramTypes.length; i++) sepStrings[i] = ", ";
		sepStrings[this._paramTypes.length] = ")";
		
		return new AEClassNodeTemplate(
			this._paramTypes.length,
			[new AEClassCustomSignature(this._returnType, this._paramTypes)],
			sepStrings);
	}
}

// ae.material.ShaderProgram$LocalVariable
class AEClassSPLocalVariable extends AEClassSPComponent {
	
	                  
	                  
	                           
	
	// internal constructor ////////////////////////////////////////////////////
	
	constructor(
			name            ,
			type                     ,
			glslLine        ) {
		
		super();
		
		this._glslLine = glslLine;
		this._glslName = name;
		this._type     = type;
		
		Object.freeze(this);
	}
}

// ae.material.ShaderProgram$Uniform
class AEClassSPUniform extends AEClassSPComponent {
	
	                  
	                  

	// protected constructor ///////////////////////////////////////////////////
	
	constructor(
			glslName        ,
			glslLine        ) {
		
		super();
		
		this._glslName = glslName;
		this._glslLine = glslLine;
	}

	// internal methods ////////////////////////////////////////////////////////
	
	_getCurrentLocation(
			gl                            ,
			program              )                       {
		
		return gl.getUniformLocation(program, this._glslName);
	}
}

// ae.material.ShaderProgram$CustomUniformParam
class AEClassSPCustomParam extends AEClassSPUniform {
	
	              
	                       
	
	// internal constructor ////////////////////////////////////////////////////
	
	constructor(
			name        ,
			type                 ) {
		
		super(
			"u_par_" + name,
			"uniform highp " + type.glslName + " u_par_" + name + ";");
		
		this._name = name;
		this._type = type;
		
		Object.freeze(this);
	}
}

// ae.material.ShaderProgram$CustomUniformTexture
class AEClassSPCustomTexture extends AEClassSPUniform {
	
	              
	
	// internal constructor ////////////////////////////////////////////////////
	
	constructor(name        ) {
		
		super("u_s2D_" + name, "uniform sampler2D u_s2D_" + name + ";");
		
		this._name = name;
		Object.freeze(this);
	}
}

// ae.material.ShaderProgram$UniformFS
class AEClassSPUniformFS extends AEClassSPUniform {
	
	// internal constructor ////////////////////////////////////////////////////
	
	constructor(
			name            ,
			glslLine        ) {
		
		super(name, glslLine);
		Object.freeze(this);
	}
}

// ae.material.ShaderProgram$UniformVS
class AEClassSPUniformVS extends AEClassSPUniform {
	
	// internal constructor ////////////////////////////////////////////////////
	
	constructor(
			name            ,
			glslLine        ) {
		
		super(name, glslLine);
		Object.freeze(this);
	}
}

// ae.material.ShaderProgram$Varying
class AEClassSPVarying extends AEClassSPComponent {
	
	                        
	                        
	                        
	                        
	                                 
	
	// internal constructor ////////////////////////////////////////////////////
	
	constructor(
			name        ,
			type                 ,
			glslLineDecl        ,
			glslLineInit        ) {
		
		super();
		
		this._glslLineDeclVS = "varying " + glslLineDecl;
		this._glslLineDeclFS = "varying " + glslLineDecl;
		this._glslLineInit   = glslLineInit;
		this._glslName       = name;
		this._type           = type;
		
		Object.freeze(this);
	}
}

// ae.material.Signature
                      
                         
                                                                      
 

// ae.material.CustomSignature
class AEClassCustomSignature extends AEClassJavaObject                       {
	
	                             
	                                    
	
	// public constructor //////////////////////////////////////////////////////
	
	constructor(
			returnType                 ,
			paramTypes                        ) {
		
		super();
		
		this._returnType = returnType;
		this._paramTypes = paramTypes;
		
		Object.freeze(this);
	}

	// public methods //////////////////////////////////////////////////////////
	
	getParamCount()         {
		return this._paramTypes.length;
	}
	
	resolveSignature(signature                        )                  {

		if(signature.length !== this.getParamCount())
			return _aeEnumGlslType.UNDEF;
		
		for(let i = 0; i < signature.length; i++)
			if(signature[i] !== this._paramTypes[i])
				return _aeEnumGlslType.UNDEF;
		
		return this._returnType;
	}
}

class AEClassSignatureGroup extends AEClassJavaObject                       {
	
	                                  
	                         
	                                         
	                                
	
	// public constructor //////////////////////////////////////////////////////

	constructor(
			returnBaseType                  ,
			isReturnScalar         ,
			paramBaseTypes                         ,
			isParamScalar                 ) {
		
		super();
		
		this._returnBaseType = returnBaseType;
		this._isReturnScalar = isReturnScalar;
		this._paramBaseTypes = paramBaseTypes;
		this._isParamScalar  = isParamScalar;
		
		Object.freeze(this);
	}

	// public methods //////////////////////////////////////////////////////////
	
	static createWithUniqueBase(
			baseType                        ,
			isReturnScalar         ,
			isParamScalar                 )                        {
		
		const paramCount = isParamScalar.length;
		const sigGroup   = new AEClassSignatureGroup(
			baseType,          isReturnScalar,
			Array(paramCount), isParamScalar);
		
		// Set all param base types to the overall base type
		for(let i = 0; i < paramCount; i++)
			sigGroup._paramBaseTypes[i] = baseType;
		
		return sigGroup;
	}
	
	getParamCount()         {
		return this._paramBaseTypes.length;
	}
	
	resolveSignature(signature                        )                  {
		
		if(signature.length !== this.getParamCount())
			return _aeEnumGlslType.UNDEF;
		
		let dimension = 0;
		
		for(let i = 0; i < signature.length; i++) {
			
			// Check the base type
			if(signature[i].baseType != this._paramBaseTypes[i])
				return _aeEnumGlslType.UNDEF;
			
			// Check the dimension
			if(this._isParamScalar[i]) {
				if(!signature[i].scalar) return _aeEnumGlslType.UNDEF;
			} else if(dimension > 0) {
				if(signature[i].dimension !== dimension)
					return _aeEnumGlslType.UNDEF;
			} else {
				dimension = signature[i].dimension;
			}
		}
		
		return aeFuncGetGlslType(
			this._returnBaseType,
			this._isReturnScalar || dimension == 0 ? 1 : dimension);
	}
}

// ae.mesh.MeshBuilder$Adjacency
class AEClassAdjacency extends AEClassJavaObject {
		
	                                         
	                           
	
	constructor(mb                     ) {
		
		super();
		
		mb._assertTrianglesSealed();
		
		this._data              = Array(mb._vertices.length);
		this._maxAdjacencyCount = 0;
		
		const vertexCount    = mb.vertexCount;
		const adjacencyCount = Array(vertexCount);
		
		// Pass 1: Count the adjacency polygons for each vertex
		for(let i = 0; i < mb._triangles.length; i++)
			for(let j = 0; j < 3; j++)
				adjacencyCount[mb._triangles[i]._vIndices[j]]++;
		
		// Pass 2: Create the adjacency arrays
		for(let i = 0; i < vertexCount; i++) {
			this._data[i]           = Array(adjacencyCount[i]);
			this._maxAdjacencyCount =
				Math.max(this._maxAdjacencyCount, adjacencyCount[i]);
		}
		
		// Pass 3: Initialize the adjacency arrays
		// Use the previous computed adjacency count to determine the slot that
		// is written next by decrementing the counter each time
		for(let i = 0; i < mb._triangles.length; i++) {
			const vIndices = mb._triangles[i]._vIndices;
			for(let j = 0; j < 3; j++) {
				adjacencyCount[j]--;
				this._data[j][adjacencyCount[vIndices[j]]] = i;
			}
		}
	}
}

// ae.mesh.Mesh
class AEClassMesh extends AEClassJavaObject {
	
	                      
	                      
	                 
	
	                    
	                    
	                     
	                     
	
	_initIbo(
			gl                       ,
			mb                     ) {
		
		let iboData;
		let tIndex = 0;
		
		if(this.vertexCount < 256) {
			this._iboType = gl.UNSIGNED_BYTE;
			iboData       = new Uint8Array(this.indexCount);
		} else if(this.vertexCount < 65536) {
			this._iboType = gl.UNSIGNED_SHORT;
			iboData       = new Uint16Array(this.indexCount);
		} else {
			
			if(!gl.getExtension("OES_element_index_uint"))
				throw "Extension 'OES_element_index_uint' not supported"
			
			this._iboType = gl.UNSIGNED_INT;
			iboData       = new Uint32Array(this.indexCount);
		}
		
		mb.forEachTriangle((triangle) => {
			iboData.set(triangle._vIndices, tIndex * 3);
			tIndex++;
		});
		
		// Initialize the IBO
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._ibo);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, iboData, gl.STATIC_DRAW);
	}

	_initVbo(
			gl                       ,
			mb                     ) {
		
		const vboData = new Float32Array(this.vertexCount * 8);
		let   vIndex  = 0;
		
		// Pack the data interleaved into the VBO buffer
		mb.forEachVertex((vertex) => {
			
			vboData.set(vertex._position, vIndex * 8 + 0);
			vboData.set(vertex._normal,   vIndex * 8 + 3);
			vboData.set(vertex._texCoord, vIndex * 8 + 6);
			
			vIndex++;
		});
		
		// Initialize the VBO
		gl.bindBuffer(gl.ARRAY_BUFFER, this._vbo);
		gl.bufferData(gl.ARRAY_BUFFER, vboData, gl.STATIC_DRAW);
	}

	constructor(
			gl                       ,
			mb                     ) {
		
		super();
		
		this._vbo = gl.createBuffer();
		this._ibo = gl.createBuffer();
		
		this.vertexCount = mb.vertexCount;
		this.indexCount  = mb.triangleCount * 3;
		this.textured    = true;
		this.cullFacing  = mb.cullFacing;
		
		this._initVbo(gl, mb);
		this._initIbo(gl, mb);
		
		// Unbind all buffers to prevent them from changes
		gl.bindBuffer(gl.ARRAY_BUFFER,         null);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
	}
	
	draw(gl                       ) {
		
		// TODO: vertexAttribPointer may be outsourced to initialization
		
		gl.bindBuffer(gl.ARRAY_BUFFER, this._vbo);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._ibo);
		
		// positions
		gl.enableVertexAttribArray(0);
		gl.vertexAttribPointer(
			0, 3, gl.FLOAT, false, ae.mesh._VERTEX_SIZE, 0);
		
		// normals
		gl.enableVertexAttribArray(1);
		gl.vertexAttribPointer(
			1, 3, gl.FLOAT, false, ae.mesh._VERTEX_SIZE, 12);

		// tex-coords
		gl.enableVertexAttribArray(2);
		gl.vertexAttribPointer(
			2, 2, gl.FLOAT, false, ae.mesh._VERTEX_SIZE, 24);
		
		gl.drawElements(gl.TRIANGLES, this.indexCount, this._iboType, 0);
		
		gl.disableVertexAttribArray(0);
		gl.disableVertexAttribArray(1);
		gl.disableVertexAttribArray(2);
	}
	/*
	finalize() {
		glDeleteBuffers(_vbo);
		glDeleteBuffers(_ibo);
	}
	*/
}

// ae.mesh.MeshBuilder
class AEClassMeshBuilder extends AEClassJavaObject {
	
	// The mesh is cached to be reused
	                                                   
	
	// Mesh data
	                                                   
	                                                     
	                                                   
	                                                     
	
	// Information data lists are used
	                          
	                          
	
	                               
	
	// Public meta information
	                    
	
	_assertTrianglesNotSealed() {
		ae.util.assert(!this._trianglesSealed, "Triangles are already sealed");
	}

	_assertTrianglesSealed() {
		ae.util.assert(this._trianglesSealed, "Triangles are not sealed yet");
	}

	_assertVerticesNotSealed() {
		ae.util.assert(!this._verticesSealed, "Vertices are already sealed");
	}
	
	_assertVerticesSealed() {
		ae.util.assert(this._verticesSealed, "Vertices are not sealed yet");
	}
	
	// The function checks whether there are vertices that belong to triangles
	// with different smoothing groups. These vertices are split into new
	// vertices.
	_ensureConsistentSmoothingGroups(adjacency                   )          {
		
		const smoothingGroups = Array(this._vertices.length);
		const auxArray        = Array(adjacency._maxAdjacencyCount);
		const vIndexMap       = Array(this._vertices.length);
		const oldVertices     = this._vertices;
		
		let newVertexCount = 0;
		
		for(let i = 0; i < this._vertices.length; i++) {
			smoothingGroups[i] = this._vertices[i]._collectSmoothingGroups(
				adjacency._data[i], auxArray);
			vIndexMap[i]       = newVertexCount;
			newVertexCount    += smoothingGroups[i].length;
		}
		
		// Abort if each vertex belongs to exactly one smoothing group
		if(newVertexCount == this._vertices.length) return true;
		
		this.allocateVertices(newVertexCount);
		
		// Copy the old vertices into the new array
		// (as often as it has smoothing groups)
		for(let i = 0; i < oldVertices.length; i++)
			for(let j = 0; j < smoothingGroups[i].length; j++)
				this._vertices[vIndexMap[i] + j]._assign(oldVertices[i]);
		
		// Map the vertex indices to the new created vertices
		this._mapVIndices((triangle, vIndex) =>
			vIndexMap[vIndex] +
			AEClassMeshBuilder._getValuePos(
				smoothingGroups[vIndex], triangle._smoothingGroup));
		
		return false;
	}
	
	static _getValuePos(
			array               ,
			value        )         {
		
		for(let i = 0; i < array.length; i++) if(array[i] == value) return i;
		return -1;
	}
	
	_invalidateMesh()                      {
		this._lastValidMesh.invalidate();
		return this;
	}
	
	_mapVIndices(
			mapper                                                        ) {
		
		this.forEachTriangle((triangle, index) => {
			triangle._vIndices[0] = mapper(triangle, triangle._vIndices[0]);
			triangle._vIndices[1] = mapper(triangle, triangle._vIndices[1]);
			triangle._vIndices[2] = mapper(triangle, triangle._vIndices[2]);
		});
	}
	
	constructor() {
		
		super();
		
		this._lastValidMesh   = new ae.util.CachedObject(
			null, (object) => new ae.mesh.Mesh(this._tempGL, this));
		this._dynVertices     = new ae.util.GrowingList();
		this._dynTriangles    = new ae.util.GrowingList();
		this._vertices        = [];
		this._triangles       = [];
		this._verticesSealed  = false;
		this._trianglesSealed = false;
		this.cullFacing       = true;
	}
	
	get triangleCount()         {
		return (this._triangles ? this._triangles : this._dynTriangles).length;
	};
	
	get vertexCount()         {
		return (this._vertices ? this._vertices : this._dynVertices).length;
	}
	
	activeCullFaceSupport()                      {
		this.cullFacing = true;
		return this;
	}
	
	addPolygonA(
			smoothingGroup        ,
			vIndices                     )                      {
		
		this._assertTrianglesNotSealed();
		
		for(let i = 2; i < vIndices.length; i++)
			this._dynTriangles.add(new ae.mesh.Triangle(this).
				setIndicesB      (vIndices[0], vIndices[i - 1], vIndices[i]).
				setSmoothingGroup(smoothingGroup));
		
		return this._invalidateMesh();
	}
	
	addPolygonB(
			smoothingGroup        ,
			... vIndices                 )                      {
		
		return this.addPolygonA(smoothingGroup, vIndices);
	}
	
	addVertex(vertex                )                      {
		
		this._assertVerticesNotSealed();
		
		this._dynVertices.add(vertex);
		return this._invalidateMesh();
	}

	allocateTriangles(triangleCount        )                      {
		
		this._triangles       = Array(triangleCount);
		this._trianglesSealed = true;
		
		for(let i = 0; i < triangleCount; i++)
			this._triangles[i] = new ae.mesh.Triangle(this);
		
		return this._invalidateMesh();
	}
	
	allocateVertices(vertexCount        )                      {
		
		this._vertices       = Array(vertexCount);
		this._verticesSealed = true;
		
		for(let i = 0; i < vertexCount; i++)
			this._vertices[i] = new ae.mesh.Vertex(this);
		
		return this._invalidateMesh();
	}
	
	collapseSmoothingGroups()                      {
		
		const sgMap                          = {};
		let   curSG                          = 0;
		
		// Fill the smoothing group mapping
		this.forEachTriangle((triangle, index) => {
			if(!(triangle._smoothingGroup in sgMap))
				sgMap[triangle._smoothingGroup] = curSG++;
		});
		
		// Apply the smoothing group mapping
		this.forEachTriangle((triangle, index) => {
			triangle._smoothingGroup = sgMap[triangle._smoothingGroup];
		});
		
		return this._invalidateMesh();
	}
	
	computeNormals()                      {
		
		this._assertVerticesSealed();
		
		let adjacency = new ae.mesh.Adjacency(this);
		
		// If the vertex data has changed due to inconsistent smoothing groups,
		// a new adjacency is computed
		if(!this._ensureConsistentSmoothingGroups(adjacency))
			adjacency = new ae.mesh.Adjacency(this);
		
		const flatNormals    =
			ae.util.create2DimArray(this._triangles.length, 3);
		const triangleAngles =
			ae.util.create2DimArray(this._triangles.length, 3);
		const vertexAngles   = Array(adjacency._maxAdjacencyCount);
		
		for(let i = 0; i < this._triangles.length; i++)
			this._triangles[i]._computeNormalAndAngles(
				flatNormals[i], triangleAngles[i]);
		
		for(let i = 0; i < this._vertices.length; i++) {
			
			const vertex       = this._vertices[i];
			const curAdjacency = adjacency._data[i];
			
			for(let j = 0; j < curAdjacency.length; j++)
				vertexAngles[j] = triangleAngles
					[curAdjacency[j]]
					[AEClassMeshBuilder._getValuePos(
						this._triangles[curAdjacency[j]]._vIndices, i)];
			
			vertex._computeSmoothNormal(
				flatNormals, curAdjacency, vertexAngles);
		}
		
		return this._invalidateMesh();
	}

	createMesh(gl                       )               {
		this._tempGL = gl;
		return this._lastValidMesh.object;
	}
	
	createDefaultPolygons(degree        )                      {
		
		ae.util.assert(
			degree >= 3, "Polygon must consist of at least 3 vertices");
		
		this._assertVerticesSealed();
		
		const polygonCount    = (this._vertices.length / degree);
		const polygonTriCount = degree - 2;
		
		this.allocateTriangles(polygonCount * polygonTriCount);
		
		for(let i = 0; i < polygonCount; i++) {
			for(let j = 0; j < polygonTriCount; j++) {
				
				const vIndices =
					this._triangles[i * polygonTriCount + j]._vIndices;
				
				vIndices[0] = i * degree;
				vIndices[1] = i * degree + j + 1;
				vIndices[2] = i * degree + j + 2;
			}
		}
		
		return this;
	}

	createDefaultQuads()                      {
		return this.createDefaultPolygons(4);
	}
	
	createDefaultTriangles()                      {
		return this.createDefaultPolygons(3);
	}
	
	fillTriangleData(filler                                  ) 
                      {
		
		this._assertTrianglesSealed();
		for(let i = 0; i < this._triangles.length; i++)
			filler(this._triangles[i], i);
		
		return this._invalidateMesh();
	}
	
	fillVertexData(filler                                ) 
                      {
		
		this._assertVerticesSealed();
		for(let i = 0; i < this._vertices.length; i++)
			filler(this._vertices[i], i);
		
		return this._invalidateMesh();
	}
	
	forEachVertex(visitor                         )                      {
		
		const vertexCount = this.vertexCount;
		
		if(this._vertices) {
			this._vertices.forEach(visitor);
		} else {
			for(let i = 0; i < vertexCount; i++)
				visitor(this._dynVertices.get(i));
		}
		
		return this._invalidateMesh();
	}
	
	forEachTriangle(visitor                           )                      {
		
		const triangleCount = this.triangleCount;
		
		if(this._triangles) {
			for(let i = 0; i < triangleCount; i++)
				visitor(this._triangles[i]);
		} else {
			for(let i = 0; i < triangleCount; i++)
				visitor(this._dynTriangles.get(i));
		}
		
		return this._invalidateMesh();
	}
	
	getTriangle(tIndex        )                   {
		this._assertTrianglesSealed();
		return this._triangles[tIndex];
	}
	
	getVertex(vIndex        )                 {
		this._assertVerticesSealed();
		return this._vertices[vIndex];
	}
	
	invertFaceOrientation()                      {
		
		// Swap index order of each triangle
		this.forEachTriangle((triangle) => {
			const temp            = triangle._vIndices[1];
			triangle._vIndices[1] = triangle._vIndices[2];
			triangle._vIndices[2] = temp;
		});
		
		return this._invalidateMesh();
	}
	
	invertNormals()                      {
		
		this.forEachVertex((vertex) => {
			for(let i = 0; i < 3; i++) vertex._normal[i] *= -1;
		});
		
		return this._invalidateMesh();
	}
	
	makeFlat()                      {
		
		let curSGroup = 0;
		
		this.forEachTriangle(
			(triangle) => triangle._smoothingGroup = curSGroup++);
		
		return this._invalidateMesh();
	}
	
	makeSmooth()                      {
		this.forEachTriangle((triangle) => triangle._smoothingGroup = 0);
		return this._invalidateMesh();
	}
	
	static merge(... meshes                            )                      {

		const mesh          = new ae.mesh.MeshBuilder();
		const vIndexOffsets = Array(meshes.length);
		
		let vertexCount   = 0;
		let triangleCount = 0;
		let vIndex        = 0;
		let tIndex        = 0;
		
		for(let i = 0; i < meshes.length; i++) {
			vIndexOffsets[i] = vertexCount;
			vertexCount     += meshes[i].vertexCount;
			triangleCount   += meshes[i].triangleCount;
		}
		
		mesh.allocateVertices (vertexCount);
		mesh.allocateTriangles(triangleCount);
		
		for(let i = 0; i < meshes.length; i++)
			meshes[i].
				forEachVertex(
					(vertex)   => mesh._vertices [vIndex++]._assign(vertex)).
				forEachTriangle(
					(triangle) => mesh._triangles[tIndex++]._assign(triangle));
		
		return mesh;
	}

	seal()                      {
		return this.sealVertices().sealTriangles();
	}
	
	sealTriangles()                      {
		
		if(this._triangles) return this;
    	
		if(this._dynTriangles.empty) {
			this.createDefaultTriangles();
		} else {
			this._triangles = this._dynTriangles.array;
			this._dynTriangles.clear();
		}
		
		return this._invalidateMesh();
	}
	
	sealVertices()                      {
		
		if(this._vertices) return this;
		
    	this._vertices = this._dynVertices.array;
    	this._dynVertices.clear();
    	
    	return this._invalidateMesh();
	}

	setPolygon(
			startIndex            ,
			smoothingGroup        ,
			... vIndices                 )                      {
		
		this._assertTrianglesSealed();
		
		for(let i = 2; i < vIndices.length; i++)
			this._triangles[startIndex + i - 2].
				setIndicesB      (vIndices[0], vIndices[i - 1], vIndices[i]).
				setSmoothingGroup(smoothingGroup);
		
		return this._invalidateMesh();
	}
	
	spliceUnusedVertices()                      {

		this._assertVerticesSealed();
		
		// The index map assigns each vertex a mapped index
		const oldVertices    = this._vertices;
		const indexMap       = Array(this._vertices.length);
		let   curMappedIndex = 0;
		
		// Initialize the map with -1, saying that all vertices should be
		// spliced
		for(let i = 0; i < indexMap.length; i++) indexMap[i] = -1;
		
		// After having looped all indices, 'curMappedIndex' contains the number
		// of actual referenced vertices
		this._mapVIndices((triangle, vIndex) => {
			if(indexMap[vIndex] == -1) indexMap[vIndex] = curMappedIndex++;
			return vIndex;
		});
		
		// Abort if all vertices are used
		if(curMappedIndex == this._vertices.length) return this;
		
		this.allocateVertices(curMappedIndex);
		
		// Set the new indices based on the previous computed mapping
		this._mapVIndices((triangle, vIndex) => indexMap[vIndex]);
		
		// Copy all vertices to their new positions if the index map entry is
		// not -1
		for(let i = 0; i < oldVertices.length; i++)
			if(indexMap[i] >= 0)
				this._vertices[indexMap[i]]._assign(oldVertices[i]);
		
		return this._invalidateMesh();
	}
	
	transformPositions(transform                  )                      {
		
		this.forEachVertex((vertex) => {
			transform.applyToPointC    (vertex._position);
			transform.applyToDirVectorB(vertex._normal);
    		transform.applyToDirVectorB(vertex._uTangent);
    		transform.applyToDirVectorB(vertex._vTangent);
		});
		
		return this._invalidateMesh();
	}

	transformTexCoords(transform                  )                      {
		this.forEachVertex(
			(vertex) => transform.applyToPointC(vertex._texCoord));
		return this._invalidateMesh();
	}
};

// ae.mesh.MeshBuilder$Triangle
class AEClassTriangle {
	
	                                     
	                        
	                               
	
	_assign(t                  ) {
		this.setIndicesA      (t._vIndices);
		this.setSmoothingGroup(t._smoothingGroup);
	}
	
	_computeNormalAndAngles(
			normal               ,
			angles               ) {
		
		const p1 = this._mb._vertices[this._vIndices[0]]._position;
		const p2 = this._mb._vertices[this._vIndices[1]]._position;
		const p3 = this._mb._vertices[this._vIndices[2]]._position;
		
		const p1x = p1[0], p1y = p1[1], p1z = p1[2];
		const p2x = p2[0], p2y = p2[1], p2z = p2[2];
		const p3x = p3[0], p3y = p3[1], p3z = p3[2];
		
		const d1x = p2x - p1x, d1y = p2y - p1y, d1z = p2z - p1z;
		const d2x = p3x - p1x, d2y = p3y - p1y, d2z = p3z - p1z;
		const d3x = p3x - p2x, d3y = p3y - p2y, d3z = p3z - p2z;
		
		const l1 = Math.sqrt(d1x * d1x + d1y * d1y + d1z * d1z);
		const l2 = Math.sqrt(d2x * d2x + d2y * d2y + d2z * d2z);
		const l3 = Math.sqrt(d3x * d3x + d3y * d3y + d3z * d3z);
		
		const nx = d1y * d2z - d1z * d2y;
		const ny = d1z * d2x - d1x * d2z;
		const nz = d1x * d2y - d1y * d2x;
		
		const ln = Math.sqrt(nx * nx + ny * ny + nz * nz);
		
		normal[0] = nx / ln;
		normal[1] = ny / ln;
		normal[2] = nz / ln;
		
		angles[0] = ae.mesh._p.ACOS.sampleLinear(
			 (d1x * d2x + d1y * d2y + d1z * d2z) / (l1 * l2));
		angles[1] = ae.mesh._p.ACOS.sampleLinear(
			-(d1x * d3x + d1y * d3y + d1z * d3z) / (l1 * l3));
		angles[2] = ae.mesh._p.ACOS.sampleLinear(
			 (d2x * d3x + d2y * d3y + d2z * d3z) / (l2 * l3));
	}
	
	constructor(mb                     ) {
		this._mb             = mb;
		this._smoothingGroup = 0;
		this._vIndices       = [0, 0, 0];
	}
	
	setIndicesA(
			src                  ,
			offset         = 0)                   {
		
		this._vIndices[0] = src[offset + 0];
		this._vIndices[1] = src[offset + 1];
		this._vIndices[2] = src[offset + 2];
		
		return this;
	}
	
	setIndicesB(
			v1        ,
			v2        ,
			v3        )                   {
		
		this._vIndices[0] = v1;
		this._vIndices[1] = v2;
		this._vIndices[2] = v3;
		
		return this;
	}
	
	setSmoothingGroup(smoothingGroup        )                   {
		this._smoothingGroup = smoothingGroup;
		return this;
	}
}
// ae.mesh.MeshBuilder$Vertex
class AEClassVertex {

	                               
	                         
	                         
	                         
	                         
	                         
	
	_addSmoothingGroup(
			auxArray                     ,
			sgCount               ,
			smoothingGroup        )         {
		
		for(var i = 0; i < sgCount; i++)
			if(auxArray[i] == smoothingGroup) return sgCount;
		
		auxArray[sgCount] = smoothingGroup;
		
		return sgCount + 1;
	}
	
	_assign(v                ) {
		this.setPositionA(v._position);
		this.setNormalA  (v._normal);
		this.setUTangentA(v._uTangent);
		this.setVTangentA(v._vTangent);
		this.setTexCoordA(v._texCoord);
	}
	
	_collectSmoothingGroups(
			adjacency               ,
			auxArray                )                {
		
		var sgCount = 0;
		
		for(var i = 0; i < adjacency.length; i++)
			sgCount = this._addSmoothingGroup(
				auxArray,
				sgCount,
				this._mb._triangles[adjacency[i]]._smoothingGroup);
		
		return auxArray.slice(0, sgCount);
	}
	
	_computeSmoothNormal(
			flatNormals                             ,
			adjacencyTriangles               ,
			adjacencyAngles                  ) {
		
		let nx = 0, ny = 0, nz = 0;
		
		for(let i = 0; i < adjacencyTriangles.length; i++) {
			
			const angle      = adjacencyTriangles[i];
			const flatNormal = flatNormals[adjacencyTriangles[i]];
			
			nx += angle * flatNormal[0];
			ny += angle * flatNormal[1];
			nz += angle * flatNormal[2];
		}
		
		const length = Math.sqrt(nx * nx + ny * ny + nz * nz);
		
		this._normal[0] = nx / length;
		this._normal[1] = ny / length;
		this._normal[2] = nz / length;
	}
	
	constructor(mb                     ) {
		this._mb       = mb;
		this._position = [0, 0, 0];
		this._normal   = [0, 0, 0];
		this._uTangent = [0, 0, 0];
		this._vTangent = [0, 0, 0];
		this._texCoord = [0, 0];
	}
	
	setNormalA(
			src                  ,
			offset         = 0)                 {
		
		this._normal[0] = src[offset + 0];
		this._normal[1] = src[offset + 1];
		this._normal[2] = src[offset + 2];
		
		return this;
	}
	
	setNormalB(
			nx        ,
			ny        ,
			nz        )                 {
		
		this._normal[0] = nx;
		this._normal[1] = ny;
		this._normal[2] = nz;
		
		return this;
	}
	
	setPositionA(
			src                  ,
			offset         = 0)                 {
		
		return this.setPositionB(
			src[offset + 0], src[offset + 1], src[offset + 2]);
	}
	
	setPositionB(
			x        ,
			y        ,
			z        )                 {
		
		this._position[0] = x;
		this._position[1] = y;
		this._position[2] = z;
		
		return this;
	}
	
	setTexCoordA(
			src                  ,
			offset         = 0)                 {
		
		return this.setTexCoordB(src[offset + 0], src[offset + 1]);
	}
	
	setTexCoordB(
			s        ,
			t        )                 {
		
		this._texCoord[0] = s;
		this._texCoord[1] = t;
		
		return this;
	}
	
	setUTangentA(
			src                  ,
			offset         = 0)                 {
		
		return this.setUTangentB(
			src[offset + 0], src[offset + 1], src[offset + 2]);
	}
	
	setUTangentB(
			ux        ,
			uy        ,
			uz        )                 {
		
		this._uTangent[0] = ux;
		this._uTangent[1] = uy;
		this._uTangent[2] = uz;
		
		return this;
	}
	
	setVTangentA(
			src                  ,
			offset         = 0)                 {
		
		return this.setVTangentB(
			src[offset + 0], src[offset + 1], src[offset + 2]);
	}
	
	setVTangentB(
			vx        ,
			vy        ,
			vz        )                 {
		
		this._vTangent[0] = vx;
		this._vTangent[1] = vy;
		this._vTangent[2] = vz;
		
		return this;
	}
}
// ae.scenegraph.ConstAttribute<T>
class AEClassConstAttribute    extends AEClassJavaObject {

	     
                                                  
                                                  
                                                  
  
	
	get _extValueDir()             {return this._p.extValueDir;}
	
	get _extValueTrans()                                   {
		return this._p.extValueTrans;
	}
	
	constructor(internalValue            ) {
		
		super();
		
		this._p = {
			extValueDir:   null,
			extValueTrans: null,
			value:         internalValue
		}
		
		Object.freeze(this);
	}
	
	get activeValue()             {
		
		let activeValue = null;
		
		if(this._extValueTrans !== null)
			activeValue = this._extValueTrans.activeValue;
		
		return activeValue !== null ?
			activeValue :
			(this._extValueDir !== null ? this._extValueDir : this.value);
	}
	
	get activeValueNN()    {
		// $NOT_NULL
		return this.activeValue;
	}
	
	get value()             {return this._p.value;}
	
	get valueNN()    {
		// $NOT_NULL
		return this.value;
	}
	
	set externalValueDir(externalValue            )       {
		this._p.extValueDir = externalValue;
	}
	
	set externalValueTrans(
			externalValue                                  )       {
		this._p.extValueTrans = externalValue;
	}
	
	resetExternal()       {
		this._p.extValueDir   = null;
		this._p.extValueTrans = null;
	}
}

// ae.scenegraph.Attribute<T>
class AEClassAttribute    extends AEClassConstAttribute    {
	
	constructor(internalValue             = null) {
		super(internalValue);
	}
	
	set internalValue(interalvalue            )       {
		this._p.value = interalvalue;
	}
}

// ae.scenegraph.Entity<This>
class AEClassEntity extends AEClassJavaObject {
	
	// The ...Rec values are only relevant if rendered/pickable is false. Then
	// they define whether these values are forced onto the children, too.
	     
                       
                       
                       
                       
  
	
	                                                  
	                                                    
	
	                              
	                              
	                                  
	                                        
	                                          
	                       
	                       
	                       
	                                      
	
	// Attributes
	                                                       
	
	// protected constructor ///////////////////////////////////////////////////
	
	constructor(
			sceneGraph                        ,
			type                          ,
			name                          ,
			noTF                   ,
			noInheritedTF          ,
			multiInstance          ) {
		
		super();
		
		this.type           = type;
		this.name           = sceneGraph._addEntity(this, name);
		this.hashCode       = this.name.hashCode;
		this.sceneGraph     = sceneGraph;
		this.noTF           = noTF;
		this.noInheritedTF  = noInheritedTF;
		this.multiInstance  = multiInstance;
		this.onUpdate       =
			sceneGraph.engine.state.createUpdateEvent(this);
		this.transformation = new AEClassConstAttribute(new AEClassMatrix4D());
		this._children      = new AEClassPooledLinkedList();
		this. children      = this._children;
		this._instances     = new AEClassPooledLinkedList();
		this. instances     = this._instances;
		this._p             = {
			rendered:    true,
			renderedRec: true,
			pickable:    true,
			pickableRec: true,
		};
		
		// Will be frozen in derived classed or outside the constructor
	}
	
	get childCount()         {return this._children.size;}
	
	get instance()                  {
		
		if(this.multiInstance || this._instances.empty) return null;
		
		const instance = this._instances.first;
		return instance.active ? instance : null;
	}
	
	get instanceCount()          {return this._instances.size;}
	get pickable     ()          {return this._p.pickable;}
	get pickableRec  ()          {return this._p.pickableRec;}
	get rendered     ()          {return this._p.rendered;}
	get renderedRec  ()          {return this._p.renderedRec;}
	
	set pickable(pickable         )       {
		this._p.pickable = pickable;
	}
	
	set pickableRec(pickableRec         )       {
		this._p.pickableRec = pickableRec;
	}
	
	set rendered(rendered         )       {
		this._p.rendered = rendered;
	}
	
	set renderedRec(renderedRec         )       {
		this._p.renderedRec = renderedRec;
	}
	
	static create(
			sceneGraph                            ,
			name                              ,
			hasTransformation          )               {
		
		const entity = new AEClassEntity(
			sceneGraph, _ae.EntityType.NONE, name,
			!hasTransformation, false, true);
		
		Object.freeze(entity);
		
		return entity;
	}
	
	static makeRoot(sceneGraph                    )               {
		return new AEClassEntity(
			sceneGraph, _ae.EntityType.NONE, "root", true, true, false);
	}

	addChild(entity              )       {
		
		if(entity.sceneGraph !== this.sceneGraph)
			throw "Entity belongs to different scene graph";
		
		this._children .insertAtEnd(entity);
		this.sceneGraph._invalidateGraphStructure();
	}
	
	addInstance(instance                )                 {
		this._instances.insertAtEnd(instance);
		return instance;
	}
	
	equals(obj         ) {
		if(!(obj instanceof AEClassEntity)) return false;
		return this.name.equals(obj.name);
	}
	
	static group(
			name                              ,
			hasTransformation          ,
			... children                           )               {
		
		const entity = AEClassEntity.create(
			children[0].sceneGraph, name, hasTransformation);
		
		children.forEach((child) => entity.addChild(child));
		
		Object.freeze(entity);
		return entity;
	}

	resetInstances()       {
		this._instances.clear();
	}
	
	setUpdateCallback(callback                                  )       {
		this.onUpdate.addListener(callback);
		return this;
	}
	
	update()       {
		//console.log(this.name.str + ": " + this.onUpdate.hashCode);
		this.onUpdate.fire();
		if(this.noTF) this.transformation.resetExternal();
	}
}

// ae.scenegraph.Instance
class AEClassInstance extends AEClassJavaObject {
	
	     
  
                                                               
                
                       

                                          
             
  
                                                             
                 
  
                                                         
                                                                                 
                                                                          
                                                                               
  
                       
                      
                       
                       
                       
                       
                       
  
	
	                                  
	                                  
	
	get _pickableRec()          {return this._p.pickableRec;}
	get _renderedRec()          {return this._p.renderedRec;}
	get _valid      ()          {return this._p.valid;}
	
	constructor() {
		
		super();
		
		this.tfToEyeSpace    = new AEClassMatrix4D();  
		this.tfToCameraSpace = new AEClassMatrix4D();
		// $NOT_NULL: 'entity'
		this._p              = {
			entity:      null,
			id:          0,
			valid:       false,
			parent:      null,
			firstChild:  null,
			nextSibling: null,
			level:       0,
			fixed:       false,
			rendered:    false,
			renderedRec: false,
			pickable:    false,
			pickableRec: false,
		};
		
		Object.freeze(this);
	}
	
	assign(
			entity                    ,
    		parent                              ,
    		firstChild                          ,
    		nextSibling                         )       {
    	
    	this._p.entity      = entity;
    	this._p.valid       = true;
    	this._p.parent      = parent;
    	this._p.firstChild  = firstChild;
    	this._p.nextSibling = nextSibling;
		
		return this;
	}
	
	deactivate()       {
		this._p.valid = false;
		return this;
	}

	deriveProperties()       {
		
		if(this.parent !== null) {
	    	
			this._p.valid = this.parent._valid && this._valid;
			this._p.level = this.parent.level + 1;
			this._p.fixed = this.parent.fixed  && this.entity.noTF;
			
			this._p.rendered = this._valid && this.parent._renderedRec && this.entity.rendered;
			this._p.pickable = this._valid && this.parent._pickableRec && this.entity.pickable;
			
			// Derive the recursive properties
			this._p.renderedRec = this.rendered || this.entity.renderedRec;
			this._p.pickableRec = this.pickable || this.entity.pickableRec;
			
		} else {
			
			this._p.level       = 0; // Root is always on level 0
			this._p.fixed       = this._p.entity.noTF;
			this._p.renderedRec = this._p.entity.renderedRec;
			this._p.pickableRec = this._p.entity.pickableRec;
			this._p.rendered    = this._p.entity.rendered;
			this._p.pickable    = this._p.entity.pickable;
		}
	}
	
	getScope(dst                                         ) 
                                          {
		
		let instance = this;
		
		dst.clear();
		
		while(instance !== null) {
			dst.insertAtFront(instance);
			instance = instance.parent;
		}
		
		return dst;
	}
	
	get active     ()                          {return this._p.valid;}
	get entity     ()                          {return this._p.entity;}
	get firstChild ()                          {return this._p.firstChild;}
	get fixed      ()                          {return this._p.fixed;}
	get id         ()                          {return this._p.id;}
	get level      ()                          {return this._p.level;}
	get nextSibling()                          {return this._p.nextSibling;}
	get parent     ()                          {return this._p.parent;}
	get pickable   ()                          {return this._p.pickable;}
	get rendered   ()                          {return this._p.rendered;}
	
	setId(id        )       {
    	this._p.id = id;
		return this;
	}
	
	transformToCameraSpace(tfCameraInverse                  )       {
		
		this.tfToCameraSpace.setDataA      (tfCameraInverse);
		this.tfToCameraSpace.multWithMatrix(this.tfToEyeSpace);
		
		return this;
	}
}

class AEClassInteger extends AEClassJavaObject {
	
	              
	
	constructor(value         = 0) {
		
		super();
		
		this.hashCode = Math.abs(value);
		this.value    = value;	
		
		Object.freeze(this);
	}
	
	equals(obj         ) {
		if(!(obj instanceof AEClassInteger)) return false;
		return this.value === obj.value;
	}
}

class AEClassString extends AEClassJavaObject {
	
	            
	
	constructor(str         = "") {
		
		super();
		
		this.hashCode = 0;
		this.str      = str;	
		
		// Java-implementation for hash value calculation
		if(str.length !== 0) {
			
			for(let i = 0; i < str.length; i++) {
				
				const chr = str.charCodeAt(i);
				
				this.hashCode  = ((this.hashCode << 5) - this.hashCode) + chr;
				this.hashCode |= 0; // Convert to 32bit integer
			}
			
			this.hashCode = Math.abs(this.hashCode);
		}
		
		Object.freeze(this);
	}
	
	equals(obj         ) {
		if(!(obj instanceof AEClassString)) return false;
		return this.str === obj.str;
	}
}

class AEClassCachedObject    {
	
	             
	                  
	                         
	
	constructor(
			object     ,
			updater                ) {
		
		this._object  = object;
		this._valid   = false;
		this._updater = updater;
	}
	
	get object()    {
		
		if(!this._valid || !this._object) {
			
			const newObject = this._updater(this._object);
			
			this._object = newObject;
			this._valid  = true;
			
			return newObject;
			
		} else {
			
			return this._object;
		}
	}
	
	invalidate()       {
		
		this._valid = false;
	}
};

class AEClassGrowingList    {
	
	                         
	
	_isInRange(index        )          {
		return index >= 0 && index < this.length;
	}
	
	constructor() {
		this._backend = new Map();
		Object.freeze(this);
	}
	
	get array()           {
		
		const array = Array(this.length);
		
		for(let i = 0; i < array.length; i++) array[i] = this._backend.get(i);
		return array;
	}
	
	get empty ()          {return !this.length};
	get length()          {return  this._backend.size};
	
	add(value   ) {
		this._backend.set(this.length, value);
	}
	
	clear() {
		this._backend.clear();
	}
	
	get(index        )    {
		
		if(this._isInRange(index)) throw "Index out of range";
		
		const value = this._backend.get(index);
		
		if(value) {
			return value;
		} else {
			throw "";
		}
	}
	
	set(
		index        ,
		value   ) {
		
		if(this._isInRange(index)) this._backend.set(index, value);
	}
}

class AEClassSampledFunction {
	
	                          
	                          
	                          
	                                 
	                          
	                          
	
	constructor(
			intervalCount        ,
			begin                ,
			end                  ,
			func                                ) {
		
		this._begin            = begin;
		this._end              = end;
		this._intervalCount    = intervalCount;
		this._samples          = Array(intervalCount + 1);
		this._nearestPrecision = 0;
		this._linearPrecision  = 0;
		
		for(let i = 0; i <= intervalCount; i++)
			this._samples[i] = func(aeFuncMix(begin, end, i / intervalCount));
		
		for(let i = 0; i < intervalCount; i++) {
			
			const x         = (2 * i + 1) / (2 * intervalCount);
			const realValue = func(x);
			
			this._nearestPrecision = Math.max(
				this._nearestPrecision,
				Math.abs(this.sampleNearest(x) - realValue));
			this._linearPrecision  = Math.max(
				this._linearPrecision,
				Math.abs(this.sampleLinear (x) - realValue));
		}
	}
	
	get nearestPrecision() {return this._nearestPrecision}
	get linearPrecision () {return this._linearPrecision}
	
	sampleLinear(x        )         {
		
		const fPos =
			aeFuncMixRev(this._begin, this._end, x) * this._intervalCount;
		const iPos = Math.floor(fPos);
		
		if(iPos < 0) return this._samples[0];
		
		if(iPos >= this._intervalCount)
			return this._samples[this._intervalCount];
		
		return aeFuncMix(
			this._samples[iPos], this._samples[iPos + 1], fPos - iPos);
	}
	
	sampleNearest(x        )         {
		
		return this._samples[aeFuncClampArrayAccess(
			Math.round(
				aeFuncMixRev(this._begin, this._end, x) *
				this._intervalCount),
			this._samples.length)];
	}
}

// ae.collections.DynamicPool
class AEClassDynamicPool                   extends AEClassPool    {
	
	     
                           
                           
                           
                              
                                  
                           
   
	
	                              
	                               
	
	// private getters + setters ///////////////////////////////////////////////
	
	get _pool            ()                {return this._p.pool;}
	get _triedInsertCount()                {return this._p.triedInsertCount;}
	get _unusedStack     ()                {return this._p.unusedStack;}
	get _unusedStackPos  ()                {return this._p.unusedStackPos;}
	
	// private methods /////////////////////////////////////////////////////////
	
	_getInitialPosition(obj   )         {
		return obj.hashCode % this._pool.length;
	}
	
	_insertObject(obj   )         {
		
		let pos = this._getInitialPosition(obj);
		
		for(let i = 0; i <= this.maxHashCollisionCount && this._pool[pos]; i++)
			pos = (pos + 1) % this._pool.length;
		
		this._p.triedInsertCount++;
		
		if(this._pool[pos]) return -1;
		
		this._pool[pos] = obj;
		this._p.capacity++;
		
		return pos;
	}
	
	_popUnused()    {
		return this._prepare(
			this._pool[this._unusedStack[this._p.unusedStackPos--]]);
	}
	
	_pushUnused(pos        )       {
		this._finalize(this._pool[pos]);
		this._unusedStack[++this._p.unusedStackPos] = pos;
	}
	
	// public constructor //////////////////////////////////////////////////////
	
	constructor(
			allowObjectWastage             ,
			creator                            ,
    		preparator                          = null,
    		finalizer                           = null,
			maxHashCollisionCount               = 4,
			initialSize                         = 64) {
		
		super(creator, preparator, finalizer);
		
		this._p = {
			capacity:         0, // Number of objects in '_pool'
			triedInsertCount: 0,
			wasteCount:       0,
			pool:             Array(initialSize),
			unusedStack:      Array(initialSize),
			unusedStackPos:   -1 // No unused objects in the beginning
		}
		
		this.maxHashCollisionCount = maxHashCollisionCount;
		this.objectWastageAllowed  = allowObjectWastage;
		
		Object.freeze(this);
	}
	
	// public getters + setters ////////////////////////////////////////////////
	
	get capacity         ()         {return this._p.capacity;}
	get unusedObjectCount()         {return this._p.unusedStackPos + 1;}
	get usedObjectCount  ()         {return this.capacity - this.unusedObjectCount;}
	get wasteCount       ()         {return this._p.wasteCount;}
	
	// public methods //////////////////////////////////////////////////////////
	
	/*
	public static final <C extends PooledCollection<?>> DynamicPool<C>
		createCollectionPool(Supplier<C> creator) {
		
		return new DynamicPool<C>(
			false, creator, (col) -> col.clear(), (col) -> col.clear());
	}

	public static final <C extends PooledCollection<?>> DynamicPool<C>
		createCollectionPool(
			final int         maxHashCollisionCount,
			final int         initialSize,
			final Supplier<C> creator) {
		
		return new DynamicPool<C>(
			maxHashCollisionCount, false, initialSize,
			creator, (col) -> col.clear(), (col) -> col.clear());
	}
	*/
	static createNodePoolA(resetNodeContent         ) 
                                            {
		
		return new AEClassDynamicPool(
			true, () => new AEClassLinkedListNode(), (node) => node.resetListOnly(),
			resetNodeContent ? (node) => {node.content = null;} : null);
	}
	
	static createNodePoolB(
			maxHashCollisionCount        ,
    		initialSize                  ,
			resetNodeContent              )                                            {
		
		return new AEClassDynamicPool(
			true, () => new AEClassLinkedListNode(), (node) => node.resetListOnly(),
			resetNodeContent ? (node) => {node.content = null;} : null,
			maxHashCollisionCount, initialSize);
	}
	
	free(obj    )          {
		
		if(!obj) return false;
		
		let pos = this._getInitialPosition(obj);
		
		// Try finding the object within the maximum collision count
		for(let i = 0; i < this.maxHashCollisionCount && this._pool[pos]; i++)
			pos = (pos + 1) % this._pool.length;
		
		if(this._pool[pos]) return false;
		
		this._pushUnused(pos);
		return true;
	}
	
	provide()    {
		
		let overflowObject     = null;
		
		// '_stackPos < 0': There is no unused object on the stack
		// '_triedInsertCount < _pool.length': There are free slots to try
		//  inserting a new object
		while(this._unusedStackPos < 0 &&
			this._triedInsertCount < this._pool.length) {
			
			const pos = this._insertObject(overflowObject = this._create());
			
			if(pos >= 0) {
				this._pushUnused(pos);
			} else {
				this._p.wasteCount++;
				if(!this.objectWastageAllowed) break;
			}
		}
		
		// If there is still no unused object, a resize is necessary
		if(this._unusedStackPos < 0) {
			
			const oldPool = this._pool;
			
			// Create new pools
			this._p.pool             = Array(2 * oldPool.length);
			this._p.unusedStack      = Array(2 * oldPool.length);
			this._p.capacity         = 0;
			this._p.triedInsertCount = 0;
			
			// Insert the object that didn't fit into the old pool
			if(overflowObject) {
				this._pushUnused(this._insertObject(overflowObject));
				this._p.wasteCount--;
			}
			
			// Rehash objects (stack doesn't need to be rehashed because it
			// doesn't contain any unused objects)
			for(let i = 0; i < oldPool.length; i++)
				if(oldPool[i]) this._insertObject(oldPool[i]);
			
			return this.provide();
			
		} else {
			
			return this._popUnused();
		}
	}
}
// ae.collections.GrowingPool
class AEClassGrowingPool                   extends AEClassPool    {
	
	     
                         
                      
                      
  
	
	                                    
	
	// private getters + setters ///////////////////////////////////////////////
	
	get _freePos    ()            {return this._p.freePos;}
	get _objectCount()            {return this._p.objectCount;}
	get _pool       ()            {return this._p.pool;}
	
	// public constructor //////////////////////////////////////////////////////
	
	constructor(
			creator                     ,
    		preparator                             = null,
    		finalizer                              = null,
			initialCapacity                        = 64,
			backingPool                            = null,) {
		
		super(creator, preparator, finalizer);
		
		this._p = {
			pool:        Array(initialCapacity),
			freePos:     0,
			objectCount: 0
		};
		
		this.backingPool = backingPool;
		
		Object.freeze(this);
	}
	
	// public getters + setters ////////////////////////////////////////////////
	
	get capacity       ()         {return this._pool.length;}
	get usedObjectCount()         {return this._freePos;}
	
	get unusedObjectCount()         {
		return this._objectCount - this.usedObjectCount;
	}
	
	// public methods //////////////////////////////////////////////////////////
	
	finalize() {
		if(this.backingPool)
			// $NOT_NULL
			this.forEach((object) => this.backingPool.free(object));
	}
	
	forEach(visitor            )       {
		// $NOT_NULL
		for(let i = 0; i < this._freePos; i++) visitor(this._pool[i]);
	}
	
	provide()    {
		
		// Check whether there are free slots left and resize if not
		if(this._freePos == this._pool.length) {
			
			const oldPool = this._pool;
			this._p.pool  = Array(2 * oldPool.length);
			
			// Copy the old elements to the new pool array
			for(let i = 0; i < oldPool.length; i++) this._pool[i] = oldPool[i];
		}
		
		// Ensure the current slot contains an object
		if(!this._pool[this._freePos]) {
			this._pool[this._freePos] =
				this.backingPool ? this.backingPool.provide() : this._create();
			this._p.objectCount++;
		}
		
		return this._prepare(this._pool[this._p.freePos++]);
	}
	
	reset()       {
		this.forEach((object) => this._finalize(object));
		this._p.freePos = 0;
	}
}
// ae.collections.PooledHashMap
class AEClassPooledHashMap                     
	extends AEClassPooledCollection                      {
	
	      
                                     
                                   
                                  
                          
                          
  
	
	                      
	                      
	                                               
	                                               
	
	// private getters + setters ///////////////////////////////////////////////
	
	get _keys  ()                    {return this._pp.keys;}
	get _values()                  {return this._pp.values;}
	get _used  ()                    {return this._pp.used;}
	
	get _valuesNN()           {
		// $CORRECT_CAST
		return this._pp._values;
	}
	
	// private static methods //////////////////////////////////////////////////
	
	static _areKeysEqual(
			key1                        ,
			key2                        )          {
		
		// The condition ensures that the 'equals()' method is only called if
		// both keys are not null
		return key1 === null || key2 === null ?
			key1 === key2 : key1.equals(key2);
	}
	
	// private methods /////////////////////////////////////////////////////////
	
	_createArrays(size        )       {
		this._pp.keys      = Array(size);
		this._pp.values    = Array(size);
		this._pp.used      = Array(size);
		this._p .size      = 0;
		this._pp.usedCount = 0;
	}
	
	_getInitialPosition(key   )         {
		return key.hashCode % this._keys.length;
	}
	
	_getKeyPosition(key            )         {
		
		if(key === null) return -1;
		
		let pos    = this._getInitialPosition(key);
		let newPos = -1;
		
		// Find the position of the key
		while(this._used[pos] &&
			!AEClassPooledHashMap._areKeysEqual(key, this._keys[pos])) {
			
			// If there's a slot, marked as 'used' but without a key-value-pair,
			// it is stored to optimize the key position later on
			if(!this._keys[pos] && newPos === -1) newPos = pos;
			
			pos = (pos + 1) % this._keys.length;
		}
		
		// Abort if the key couldn't be found
		if(!this._used[pos]) return -1;
		
		// Abort if the position is already the optimal position
		if(newPos === -1) return pos;
		
		// Copy the key-value-pair to a better position
		this._keys  [newPos] = this._keys  [pos];
		this._values[newPos] = this._values[pos];
		
		const nextPos = (pos + 1) % this._keys.length;
		
		// If the slot after the current position is not marked as 'used', the
		// mark can also be removed from the current one, so subsequent
		// attempts finding a key will be faster
		if(!this._used[nextPos]) this._used[pos] = false;
		
		return newPos;
	}
	
	_getLoadFactor(size        )         {
		return this.size / this._keys.length;
	}
	
	_setValue(
    		key     ,
    		value   )          {
    	
    	let pos = this._getInitialPosition(key);
    
    	// Search an empty slot
    	while(this._keys[pos] &&
			!AEClassPooledHashMap._areKeysEqual(key, this._keys[pos]))
    		pos = (pos + 1) % this._keys.length;
    	
    	if(this._keys[pos]) {
    		this._values[pos] = value;
    		return false;
    	}
    	
    	if(this._getLoadFactor(this.size + 1) > this.maxLoadFactor) {
    		
    		const oldKeys   = this._keys;
    		const oldValues = this._values;
    		
    		this._createArrays(this._keys.length * this.resizeFactor);
    		
    		for(let i = 0; i < oldKeys.length; i++)
    			if(oldKeys[i] !== null)
					// $NOT_NULL: 'oldValues[i]'
					this._setValue(oldKeys[i], oldValues[i]);
    		
    		this._setValue(key, value);
    		
    	} else {
    		
    		this._pp.keys  [pos] = key;
    		this._pp.values[pos] = value;
    		this._pp.used  [pos] = true;
    		this._p .size++;
    	}
    	
    	return true;
    }
	
	// protected methods ///////////////////////////////////////////////////////
	
	_addSingle(element                     )          {
		// $CORRECT_CAST
		return this.setValue(element.key, element.value);
	}
	
	_clear()       {
		
		for(let i = 0; i < this._keys.length; i++) {
			this._keys  [i] = null;
			this._values[i] = null;
			this._used  [i] = false;
		}
		
		this._p.size = this._pp.usedCount = 0;
	}

	// public constructor //////////////////////////////////////////////////////
	
	constructor(
			bucketCount           = 16,
			maxLoadFactor         = 0.75,
			resizeFactor          = 2) {
		
		super();
		
		this._pp = {
			keys:            Array(bucketCount),
			values:          Array(bucketCount),
			used:            Array(bucketCount),
			usedCount:       0,
			latestAccessPos: -1,
		}
		
		this.maxLoadFactor = maxLoadFactor;
		this.resizeFactor  = resizeFactor;
		this.keys          = new AEClassHMKeyIterator(this);
		this.values        = new AEClassHMValueIterator(this);
	}
	
	// public getters + setters ////////////////////////////////////////////////
	
	get bufferSize()         {return this._pp.keys.length;}
	get loadFactor()         {return this._getLoadFactor(this.size);}
	
	get requestedValue()    {
		
		const pos = this._pp.latestAccessPos;
		
		if(pos < 0) throw "No requested value available";
		return this._valuesNN[pos];
	}
	
	// public methods //////////////////////////////////////////////////////////
	
	deleteKey(key   )          {
		
		let pos = this._getInitialPosition(key);
		
		// Search position of the key
		while(this._keys[pos] !== key || this._used[pos])
			pos = (pos + 1) % this._keys.length;
		
		if(this._keys[pos] !== key) return false;
		
		this._pp.keys  [pos] = null;
		this._pp.values[pos] = null;
		this._p .size--;
		
		return true;
	}
	
	forEach(visitor                              ) {
		
		let kvp = null;
		
		for(let i = 0; i < this.bufferSize; i++) {
			
			if(!this._used[i])                    continue;
			if(kvp === null || kvp.keepReference) kvp = ae.col._p.HM_KVP_POOL.provide();
			
			kvp.key   = this._keys[i];
			kvp.value = this._values[i];
		}
		
		if(kvp !== null && !kvp.keepReference) ae.col._p.HM_KVP_POOL.free(kvp);
	}
	
	getValueA(key   )    {
		
		const pos = this._getKeyPosition(key);
		
		if(pos < 0) throw "Key doesn't exist";
		return this._valuesNN[pos];
	}
	
	getValueB(
			key            ,
			defaultValue   )    {
		
		const pos = this._getKeyPosition(key);
		
		// NOT_NULL: 'this._values[pos]'
		return pos >= 0 ? this._valuesNN[pos] : defaultValue;
	}
	
	hasKey(key   )          {
		return this._getKeyPosition(key) >= 0;
	}
	
	// Returns 'true' when a new key has been inserted
	setValue(
			key     ,
			value   )          {
		
		return this._setValue(key, value);
	}
	
	// If no destination array is passed, the value can be read using the
	// 'requestedValue' member immediatly after the invocation
	tryGetValue(
			key    ,
			dst                    = null)          {
		
		this._pp.latestAccessPos = this._getKeyPosition(key);
		
		if(dst !== null)
			dst[0] = this.requestedValue;
		
		return this._pp.latestAccessPos >= 0;
	}
}
// ae.collections.PooledHashSet
class AEClassPooledHashSet                  
	extends AEClassPooledCollection    {
	
	// The value-component is always set to 'null'
	                                           
	
	                      
	                      
	
	_addSingle(element   )          {
		return this.insert(element);
	}
	
	constructor(backend                                            = null) {
		
		super();
		
		this._hashMap      =
			backend !== null ? backend : new AEClassPooledHashMap();
		this.maxLoadFactor = this._hashMap.maxLoadFactor;
		this.resizeFactor  = this._hashMap.resizeFactor;
		
		Object.freeze(this);
	}
	
	get empty     ()          {return this._hashMap.empty;}
	get loadFactor()          {return this._hashMap.loadFactor;}
	get size      ()          {return this._hashMap.size;}
	
	clear()          {
		return this._hashMap.clear();
	}
	
	exists(element   )          {
		return this._hashMap.hasKey(element);
	}

	forEach(visitor            )       {
		this._hashMap.keys.forEach(visitor);
	}
	
	insert(element   )          {
		return this._hashMap.setValue(element, null);
	}

	remove(element   )          {
		return this._hashMap.deleteKey(element);
	}
}
// ae.collections.PooledLinkedList
class AEClassPooledLinkedList    extends AEClassPooledCollection    {
	
	      
                                        
                                        
  
	
	// private getters + setters ///////////////////////////////////////////////
	
	get _first()                                 {return this._pp.first;}
	get _last ()                                 {return this._pp.last;}
	
	// private methods /////////////////////////////////////////////////////////
	
	_insert(element   )                        {
		
		const node = ae.col._p.LL_NODE_POOL.provide();
		
		node.content = element;
		
		this._p.size++;
		if(this.size === 1) this._pp.first = this._pp.last = node;
		
		return node;
	}
	
	// protected methods ///////////////////////////////////////////////////////
	
	_addSingle(element   )          {
		this.insertAtEnd(element);
		return true;
	}
	
	_clear()       {
		
		// Cannot reset the whole node pool, as there might be nodes used by
		// other collections
		let node = this._first;
		while(node !== null) {
			ae.col._p.LL_NODE_POOL.free(node);
			node = node.next;
		}
		
		this._pp.first = this._pp.last = null;
		this._p. size  = 0;
	}
	
	// internal methods ////////////////////////////////////////////////////////
	
	_insertAfter(
			element   ,
			refNode                       )                        {
		
		const newNode = this._insert(element);
		
		// Assume the list contains at least one element. Otherwise a reference
		// node cannot exist.
		newNode.insertAfter(refNode);
		if(refNode === this._last) this._pp.last = newNode;
		
		return newNode;
	}
	
	_insertBefore(
    		element   ,
    		refNode                       )                        {

		const newNode = this._insert(element);
		
		// Assume the list contains at least one element. Otherwise a reference
		// node cannot exist.
		newNode.insertBefore(refNode);
		if(refNode === this._first) this._pp.first = newNode;
		
		return newNode;
	}
	
	_remove(node                                )          {
		
		if(node === null) return false;
		
		node.remove();
		
		if(node === this._first) this._pp.first = node.next;
		if(node === this._last)  this._pp.last  = node.prev;
		
		ae.col._p.LL_NODE_POOL.free(node);
		this._p.size--;
		
		return true;
	}
	
	// public constructor //////////////////////////////////////////////////////
	
	constructor() {
		
		super();
		
		this._pp = {
			first: null,
			last:  null
		}
		
		Object.freeze(this);
	}
	
	// public getters + setters ////////////////////////////////////////////////
	
	get first()    {
		
		if(this.empty) throw "List is empty";
		
		// $CORRECT_CAST
		return this._first.content;
	}
	
	get last()     {
		
		if(this.empty) throw "List is empty";
		
		// $CORRECT_CAST
		return this._last.content;
	}
	
	// public methods //////////////////////////////////////////////////////////
	
	finalize()       {
		this._clear();
	}
	
	forEach(visitor            )       {
		// $NOT_NULL: 'this._first' & CORRECT_CAST
		if(!this.empty) this._first.forEach((node) => visitor(node.content));
	}
	
	forEachRev(visitor            )       {
		// $NOT_NULL: 'this._last' & CORRECT_CAST
		if(!this.empty) this._last.forEachRev((node) => visitor(node.content));
	}
	
	insertAtEnd(element   )                        {
		
		if(this.empty) {
			this._insert(element);
		} else {
			// $NOT_NULL: 'this._last'
			this._insertAfter(element, this._last);
		}
		
		// $NOT_NULL: 'this._last'
		return this._last;
	}
	
	insertAtFront(element   )                        {
		
		if(this.empty) {
			this._insert(element);
		} else {
			// $NOT_NULL: 'this._first'
			this._insertBefore(element, this._first);
		}
		
		// $NOT_NULL: 'this._first'
		return this._first;
	}
	
	removeAll(element   )          {
		
		let   node    = this._first;
		const oldSize = this.size;
		
		while(node !== null) {
			if(node.content === element) this._remove(node);
			node = node.next;
		}
		
		return this.size < oldSize;
	}

	removeFirstA()          {
		return this._remove(this._first);
	}
	
	removeFirstB(element   )          {
		
		let node = this._first;
		
		while(node !== null) {
			if(node.content === element) return this._remove(node);
			node = node.next;
		}
		
		return false;
	}

	removeLastA()          {
		return this._remove(this._last);
	}
	
	removeLastB(element   )          {
		
		let node = this._last;
		
		while(node !== null) {
			if(node.content === element) return this._remove(node);
			node = node.prev;
		}
		
		return false;
	}
}

// ae.collections.PooledOrderedSet
class AEClassPooledOrderedSet                  
	extends AEClassPooledCollection    {
	
	                                                         
	                                     
	
	                      
	                      
	
	// private methods /////////////////////////////////////////////////////////
	
	// returns 'true' if removal took place
	_removeIfNecessary(element   )          {
		
		const exists = this._hashMap.tryGetValue(element);
		
		if(exists) this._list._remove(this._hashMap.requestedValue);
		return exists;
	}
	
	// protected methods ///////////////////////////////////////////////////////
	
	_addSingle(element   )          {
		return this.insertAtEnd(element);
	}
	
	// public constructor //////////////////////////////////////////////////////
	
	constructor(
			backendSet                                                  =
				new AEClassPooledHashMap(),
			backendList                                                 =
				new AEClassPooledLinkedList()) {
		
		super();
		
		this._hashMap      = backendSet;
		this._list         = backendList;
		this.maxLoadFactor = backendSet.maxLoadFactor;
		this.resizeFactor  = backendSet.resizeFactor;
		
		Object.freeze(this);
	}
	
	// public getters + setters ////////////////////////////////////////////////
	
	get empty     ()          {return this._list   .empty;}
	get loadFactor()          {return this._hashMap.loadFactor;}
	get size      ()          {return this._list   .size;}
	
	// public methods //////////////////////////////////////////////////////////
	
	clear()          {
		this._hashMap.clear();
		return this._list.clear();
	}
	
	exists(element   )          {
		return this._hashMap.hasKey(element);
	}
	
	forEach(visitor            ) {
		this._list.forEach(visitor);
	}
	
	forEachRev(visitor            ) {
		this._list.forEachRev(visitor);
	}
	
	insertAfter(
			element      ,
			refElement   )          {
		
		const replace = this._removeIfNecessary(element);
		
		this._hashMap.setValue(
			element,
			this._list._insertAfter(
				element, this._hashMap.getValueA(refElement)));
		
		return !replace;
	}

	insertAtEnd(element   )          {
		
		const replace = this._removeIfNecessary(element);
		
		this._hashMap.setValue(element, this._list.insertAtEnd(element));
		return !replace;
	}

	insertAtFront(element   )          {
		
		const replace = this._removeIfNecessary(element);
		
		this._hashMap.setValue(element, this._list.insertAtFront(element));
		return !replace;
	}

	insertBefore(
			element      ,
			refElement   )          {
		
		const replace = this._removeIfNecessary(element);
		
		this._hashMap.setValue(
			element,
			this._list._insertBefore(
				element, this._hashMap.getValueA(refElement)));
		
		return !replace;
	}

	remove(element   )          {
		
		const exists = this._hashMap.tryGetValue(element);
		
		if(exists) {
			this._hashMap.deleteKey(element);
			this._list   ._remove  (this._hashMap.requestedValue);
		}
		
		return exists;
	}
	
	tryInsertAfter(
			element      ,
			refElement   )          {
		
		if(!this._hashMap.hasKey(element)) {
			this._hashMap.setValue(
				element,
				this._list._insertAfter(
					element, this._hashMap.getValueA(refElement)));
			return true;
		} else {
			return false;
		}
	}
	
	tryInsertAtEnd(element   )          {
		
		if(!this._hashMap.hasKey(element)) {
			this._hashMap.setValue(element, this._list.insertAtEnd(element));
			return true;
		} else {
			return false;
		}
	}

	tryInsertAtFront(element   )          {
		
		if(!this._hashMap.hasKey(element)) {
			this._hashMap.setValue(element, this._list.insertAtFront(element));
			return true;
		} else {
			return false;
		}
	}
	
	tryInsertBefore(
			element      ,
			refElement   )          {
		
		if(!this._hashMap.hasKey(element)) {
			this._hashMap.setValue(
				element,
				this._list._insertBefore(
					element, this._hashMap.getValueA(refElement)));
			return true;
		} else {
			return false;
		}
	}
}

// ae.core.RenderState$UpdateEvent
class AEClassUpdateEvent extends AEClassEvent                     {
	
	                              
	
	constructor(
			state                        ,
			host                ) {
		
		super(host);
		
		this.state = state;
		Object.freeze(this);
	}
	
	get time     ()         {return this.state.time;}
	get timeDelta()         {return this.state.timeDelta;}
}
// ae.math.MatrixVector
class AEClassMatrixVector extends AEClassVectorBackend {
	
	                           
	                  
	                 
	
	constructor(
			matrix                   ,
			isRow           ,
			rcIndex        ) {
		
		super();
		
		this._matrix  = matrix;
		this._isRow   = isRow;
		this._rcIndex = rcIndex;
	}

	get x()         {return this.getElement(0);}
	get y()         {return this.getElement(1);}
	get z()         {return this.getElement(2);}
	get w()         {return this.getElement(3);}
	
	set x(x        )                        {
		
		this.setElement(0, x);
		return this;
	}
	
	set y(y        )                        {
		
		this.setElement(1, y);
		return this;
	}
	
	set z(z        )                        {
		
		this.setElement(2, z);
		return this;
	}
	
	set w(w        )                        {
		
		this.setElement(3, w);
		return this;
	}
	
	getElement(index        )         {
		
		return this._isRow ?
			this._matrix.getElement(this._rcIndex, index) :
			this._matrix.getElement(index,         this._rcIndex);
	}

	setElement(
			index        ,
			value        )                        {
		
		this._matrix.setElement(
			this._isRow ? this._rcIndex : index,
			this._isRow ? index         : this._rcIndex,
			value);
		
		return this;
	}
};

// ae.math.ReadOnlyBackend
class AEClassReadOnlyBackend extends AEClassVectorBackend {
	
	                                
	
	constructor(
			backend                       ) {
		
		super();
		this._backend = backend;
	}
	
	get x()         {return this._backend.x;}
	get y()         {return this._backend.y;}
	get z()         {return this._backend.z;}
	get w()         {return this._backend.w;}
	
	set x(x        )                        {return this;}
	set y(y        )                        {return this;}
	set z(z        )                        {return this;}
	set w(w        )                        {return this;}
	
	getElement(index        )         {
		
		return this._backend.getElement(index);
	}
	
	setElement(
			index        ,
			value        )                        {
		
		return this;
	}
};

// ae.math.StaticBackend
class AEClassStaticBackend extends AEClassVectorBackend {
	
	                     
	
	constructor(
			xOrBackend                                ,
			y                  = 0,
			z                  = 0,
			w                  = 0) {
		
		super();
		
		this._data = xOrBackend instanceof AEClassVectorBackend ?
			[xOrBackend.x, xOrBackend.y, xOrBackend.z, xOrBackend.w] :
			[xOrBackend,   y,            z,            w];
	}
	
	get x()         {return this._data[0];}
	get y()         {return this._data[1];}
	get z()         {return this._data[2];}
	get w()         {return this._data[3];}
	
	set x(x        )                        {
		
		this._data[0] = x;
		return this;
	}
	
	set y(y        )                        {
		
		this._data[1] = y;
		return this;
	}
	
	set z(z        )                        {
		
		this._data[2] = z;
		return this;
	}
	
	set w(w        )                        {
		
		this._data[3] = w;
		return this;
	}
	
	getElement(index        )         {
		
		return this._data[index];
	}
	
	setElement(
			index        ,
			value        )                        {
		
		this._data[index] = value;
		
		return this;
	}
};

// ae.scenegraph.Camera
class AEClassCamera extends AEClassEntity {
	
	                               
	                               
	                                    
	
	// public constructor //////////////////////////////////////////////////////
	
	constructor(
    		sceneGraph                         ,
    		name                            = null,
    		projectionMode                  = new AEClassCModeAdaptiveFOV()) {
		
		super(sceneGraph, _ae.EntityType.CAMERA, name, false, false, false);
		
		this.near = new AEClassAttribute(1);
		this.far  = new AEClassAttribute(0);
		this.mode = new AEClassAttribute(projectionMode);
		
		Object.freeze(this);
	}
	
	// public methods //////////////////////////////////////////////////////////
	
	createProjectionMatrix(
			width         ,
			height        ,
			matrix                  )                   {
		
		this.mode.activeValueNN._computeProjectionMatrix(
			width / height, matrix.toIdentity(),
			this.near.activeValueNN, this.far.activeValueNN);
		
		return matrix;
	}
	
	setFarClipDistance(clipFar        )       {
		// TODO: Exception
		this.far.internalValue = clipFar;
		return this;
	}
	
	setFarClipDistanceToInfinity()       {
		this.far.internalValue = 0;
		return this;
	}
	
	setNearClipDistance(clipNear        )       {
		// TODO: Exception
		this.near.internalValue = clipNear;
		return this;
	}
	
	setProjectionMode(projectionMode             )       {
		this.mode.internalValue = projectionMode;
		return this;
	}
}

// ae.scenegraph.Camera$Mode
                       
                                                                
                          
                
                          
                
                       
 

// ae.scenegraph.Camera$AdaptiveFOV
class AEClassCModeAdaptiveFOV {
	
	     
                                                 
                       
                       
  
	
	// intenal methods /////////////////////////////////////////////////////////
	
	_computeProjectionMatrix(
			ratio        ,
			dst                    ,
			near         ,
			far          )       {
		
		if(ratio > this.visibleRatio) {
			dst.projectPerspectiveVerFOV(ratio, 1, this.minVerFOV, near, far);
		} else {
			dst.projectPerspectiveHorFOV(ratio, 1, this.minHorFOV, near, far);
		}
	}
	
	// public constructor //////////////////////////////////////////////////////
	
	constructor() {
		
		this._p = {
			visibleRatio: 1,
			minHorFOV:    45,
			minVerFOV:    45,
		}
		
		Object.freeze(this);
	}
	
	// public getters + setters ////////////////////////////////////////////////
	
	get minHorFOV   ()         {return this._p.minHorFOV;}
	get minVerFOV   ()         {return this._p.minVerFOV;}
	get visibleRatio()         {return this._p.visibleRatio;}
	
	// public methods //////////////////////////////////////////////////////////
	
	setFOV(
			minHorFOV        ,
			minVerFOV        )       {
		
		this._p.minHorFOV = minHorFOV;
		this._p.minVerFOV = minVerFOV;
		
		this._p.visibleRatio =
			Math.tan(aeFuncToRadians(minHorFOV) / 2) /
			Math.tan(aeFuncToRadians(minVerFOV) / 2);
		
		return this;
	}
	
	setMinHorFOV(
			visibleRatio        ,
			minHorFOV           )       {
		
		this._p.visibleRatio = visibleRatio;
		this._p.minHorFOV    = minHorFOV;
		
		// 2 * atan(tan(fov / 2) / r)
		this._p.minVerFOV =
			aeFuncToDegrees(2 * Math.atan(
			Math.tan(aeFuncToRadians(minHorFOV) / 2) / visibleRatio));
		
		return this;
	}
	
	setMinVerFOV(
			visibleRatio        ,
			minVerFOV           )       {
		
		this._p.visibleRatio = visibleRatio;
		this._p.minVerFOV    = minVerFOV;
		
		// 2 * atan(tan(fov / 2) * r)
		this._p.minHorFOV =
			aeFuncToDegrees(2 * Math.atan(
			Math.tan(aeFuncToRadians(minVerFOV) / 2) * visibleRatio));
		
		return this;
	}
}

// ae.scenegraph.Camera$FixedFOV
class AEClassCModeFixedFOV {
	
	     
              
  
	
	// proteced constructor ////////////////////////////////////////////////////
	
	constructor(fov        ) {
		this._p = {fov: fov};
		Object.freeze(this);
	}
	
	// public getters + setters ////////////////////////////////////////////////
	
	get fov()         {return this._p.fov;}
	
	// public methods //////////////////////////////////////////////////////////
	
	setFOV(fov        )       {
		// TODO: Exception
		this._p.fov = fov;
		return this;
	}
}

// ae.scenegraph.Camera$FixedHorFOV
class AEClassCModeFixedHorFOV extends AEClassCModeFixedFOV {
	
	// intenal methods /////////////////////////////////////////////////////////
	
	_computeProjectionMatrix(
			ratio        ,
			dst                    ,
			near         ,
			far          )       {
		
		dst.projectPerspectiveHorFOV(ratio, 1, this.fov, near, far);
	}
	
	// public constructor //////////////////////////////////////////////////////
	
	constructor(fov        ) {
		super(fov);
	}
}

// ae.scenegraph.Camera$FixedVerFOV
class AEClassCModeFixedVerFOV extends AEClassCModeFixedFOV {

	// intenal methods /////////////////////////////////////////////////////////
	
	_computeProjectionMatrix(
			ratio        ,
			dst                    ,
			near         ,
			far          )       {
		
		dst.projectPerspectiveVerFOV(ratio, 1, this.fov, near, far);
	}
	
	// public constructor //////////////////////////////////////////////////////
	
	constructor(fov        ) {
		super(fov);
	}
}

// ae.scenegraph.Model
class AEClassModel extends AEClassEntity {
	
	// Attributes neccessary for each model
	                                        
	                                           
	
	// Optional attributes for ease use with standard materials
	//public final ConstAttribute<StandardMaterials.Textures> textures  =
	//	new ConstAttribute<>(new StandardMaterials.Textures(null, null, null));
	                                                  
	
	constructor(
			sceneGraph                    ,
			name                        = null) {
		
		super(sceneGraph, _ae.EntityType.MODEL, name, false, false, true);
		
		this.mesh      = new AEClassAttribute();
		this.material  = new AEClassAttribute();
		this.colorMask = new AEClassConstAttribute(ae.math.WHITE.xyz.cloneStatic());
		
		Object.freeze(this);
	}
	
	drawInstances(
			gl                                ,
			projection                   ,
			useMaterial         )       {
		
		const activeMesh     = this.mesh    .activeValue;
		const activeMaterial = this.material.activeValue;
		
		// Sanity check to ensure the model is complete and can be rendered
		if(activeMesh === null || activeMaterial === null) return;
		
		// This command will be ignored if the material is no standard material
		//sceneGraph.engine.standardMaterials.setMaterialData(
		//	activeMaterial,
		//	textures .getActiveValue(),
		//	colorMask.getActiveValue());

		if(activeMesh.cullFacing) {
			gl.enable(gl.CULL_FACE);
		} else {
			gl.disable(gl.CULL_FACE);
		}
		
		if(useMaterial) activeMaterial._use();
		
		this.instances.forEach((instance) => {
			
			this.sceneGraph.engine.state._newModelInstance(instance);
			this.sceneGraph.engine.state._applyUniformsToShader(gl);
			
			// TODO: Remove
			//instance.tfToCameraSpace.applyToShader(gl, this.sceneGraph.engine.uniLocModelView);
			
			activeMesh.draw(gl);
		});
	}
	
	get complete()          {
		return this.mesh.activeValue !== null &&
			this.material.activeValue !== null;
	}

	setColorMaskA(mask                  )       {
		// $NOT_NULL: 'value'
		this.colorMask.value.setDataA(mask);
		return this;
	}

	setColorMaskB(
			red          ,
			green        ,
			blue         )       {
		
		// $NOT_NULL: 'value'
		this.colorMask.value.setDataD(red, green, blue);
		return this;
	}
	/*
	public final Model setDiffuseTexture(final Texture texture) {
		textures.getValue().diffuse = texture;
		return this;
	}

	public final Model setEmissiveTexture(final Texture texture) {
		textures.getValue().emissive = texture;
		return this;
	}
	
	public final Model setNormalMapTexture(final Texture texture) {
		textures.getValue().normalMap = texture;
		return this;
	}
	*/
	setMesh(mesh              )       {
		this.mesh.internalValue = mesh;
		return this;
	}
	
	setMaterial(material                          )       {
		this.material.internalValue = material;
		return this;
	}
}

function aeFuncComputeCylinderShellData(
		subdivisions        ,
		vOffset             ,
		mb                               ) {
	
	const ringSize = subdivisions + 1;
	
	for(let i = 0; i < subdivisions; i++) {
		const vPos = vOffset + i;
		mb.addPolygonB(
			0,
			vPos,
			vPos            + 1,
			vPos + ringSize + 1,
			vPos + ringSize);
	}
	
	ae.mesh._p.computeDiscVertices(subdivisions, 0, vOffset,            false, mb);
	ae.mesh._p.computeDiscVertices(subdivisions, 1, vOffset + ringSize, false, mb);
	
	for(let i = 0; i < ringSize; i++) {
		mb.getVertex(vOffset            + i).setTexCoordB(i / subdivisions, 0);
		mb.getVertex(vOffset + ringSize + i).setTexCoordB(i / subdivisions, 1);
	}
}

function aeFuncComputeDiscData(
		subdivisions        ,
		posY1               ,
		posY2               ,
		vOffset             ,
		mb                               ) {
	
	// Indices of down-facing cap
	ae.mesh._p.computeDiscIndices(
		subdivisions, vOffset,                true, false, mb);
	// Indices of up-facing cap
	ae.mesh._p.computeDiscIndices(
		subdivisions, vOffset + subdivisions, true, true,  mb);
	
	// Vertices of down-facing cap
	ae.mesh._p.computeDiscVertices(
		subdivisions, posY1, vOffset,                true, mb);
	// Vertices of up-facing cap
	ae.mesh._p.computeDiscVertices(
		subdivisions, posY2, vOffset + subdivisions, true, mb);
	
	// Fill TBN data
	for(let i = 0; i < subdivisions; i++) {
		mb.getVertex(vOffset                + i).
			setNormalB(0, -1, 0).setUTangentB(1, 0, 0).setVTangentB(0, 0, 1);
		mb.getVertex(vOffset + subdivisions + i).
			setNormalB(0,  1, 0).setUTangentB(1, 0, 0).setVTangentB(0, 0, 1);
	}
}

function aeFuncComputeDiscIndices(
		subdivisions        ,
		vOffset             ,
		wrapIndices          ,
		invert               ,
		mb                               ) {

	const ringSize = subdivisions + (wrapIndices ? 0 : 1);
	const indices  = Array(subdivisions + 1);
	
	for(let i = 0; i < indices.length; i++)
		indices[i] = vOffset + (invert ? subdivisions - i : i) % ringSize;
	
	mb.addPolygonA(0, indices);
}

function aeFuncComputeDiscVertices(
		subdivisions        ,
		posY                ,
		vOffset             ,
		wrapIndices          ,
		mb                               ) {
	
	const ringSize = subdivisions + (wrapIndices ? 0 : 1);
	
	for(let i = 0; i < ringSize; i++) {
		
		const angle = 2.0 * Math.PI * i / subdivisions;
		const x     = Math.sin(angle);
		const z     = Math.cos(angle);
		
		mb.getVertex(vOffset + i).
			setPositionB(x, posY, z).
			setNormalB  (x, 0,    z).
			setUTangentB(Math.cos(angle), 0, -Math.sin(angle)).
			setVTangentB(0, 1, 0).
			setTexCoordB((x + 1) / 2, (z + 1) / 2);
	}
}

function aeFuncComputeTorusIndices(
		subdivisionsHor        ,
		subdivisionsVer        ,
		mb                                  ) {
	
	const ringSizeHor = subdivisionsHor + 1;
	
	for(let i = 0; i < subdivisionsVer; i++)
		for(let j = 0; j < subdivisionsHor; j++)
			mb.addPolygonB(
				0,
				 i      * ringSizeHor +  j,
				(i + 1) * ringSizeHor +  j,
				(i + 1) * ringSizeHor + (j + 1),
				 i      * ringSizeHor + (j + 1));
}

function aeFuncComputeTorusVertices(
		subdivisionsHor        ,
		subdivisionsVer        ,
		radius                 ,
		mb                                  ) {
	
	const ringSizeHor = subdivisionsHor + 1;
	const ringSizeVer = subdivisionsVer + 1;
	
	for(let i = 0; i < ringSizeVer; i++) {
		for(let j = 0; j < ringSizeHor; j++) {
			
			const angleHor = 2.0 * Math.PI * j / subdivisionsHor;
			const angleVer = 2.0 * Math.PI * i / subdivisionsVer;
			
			// The normals are computed similar to the positions, except
			// that the radius is assumed as 0 and thus removed from the
			// formula
			
			mb.getVertex(i * ringSizeHor + j).
				setPositionB(
					Math.sin(angleHor) * (radius - Math.cos(angleVer)),
					Math.sin(angleVer),
					Math.cos(angleHor) * (radius - Math.cos(angleVer))).
				setNormalB(
					Math.sin(angleHor) * -Math.cos(angleVer),
					Math.sin(angleVer),
					Math.cos(angleHor) * -Math.cos(angleVer)).
				setUTangentB(Math.cos(angleHor), 0, -Math.sin(angleHor)).
				setVTangentB(
					Math.sin(angleHor) * Math.sin(angleVer),
					Math.cos(angleVer),
					Math.cos(angleHor) * Math.sin(angleVer)).
				setTexCoordB(j / subdivisionsHor, i / subdivisionsVer);
		}
	}
}

function aeFuncComputeUVSphereIndices(
		subdivisionsHor        ,
		subdivisionsVer        ,
		mb                                  ) {
	
	for(let i = 0; i < subdivisionsVer; i++)
		for(let j = 0; j < subdivisionsHor; j++)
			mb.addPolygonB(
				0,
				 i      * (subdivisionsHor + 1) +  j,
				 i      * (subdivisionsHor + 1) + (j + 1),
				(i + 1) * (subdivisionsHor + 1) + (j + 1),
				(i + 1) * (subdivisionsHor + 1) +  j);
}

function aeFuncComputeUVSphereVertices(
		subdivisionsHor        ,
		subdivisionsVer        ,
		mb                                  ) {
	
	for(let i = 0; i <= subdivisionsVer; i++) {
		for(let j = 0; j <= subdivisionsHor; j++) {
			
			const angleHor = 2.0 * Math.PI *  j / subdivisionsHor;
			const angleVer =       Math.PI * (i / subdivisionsVer - 0.5);

			const x = Math.cos(angleVer) * Math.sin(angleHor);
			const y = Math.sin(angleVer);
			const z = Math.cos(angleVer) * Math.cos(angleHor);

			mb.getVertex(i * (subdivisionsHor + 1) + j).
				setPositionB(x, y, z).
				setNormalB  (x, y, z).
				setUTangentB(Math.cos(angleHor), 0, -Math.sin(angleHor)).
				setVTangentB(
					Math.sin(angleVer) * -Math.sin(angleHor),
					Math.cos(angleVer),
					Math.sin(angleVer) * -Math.cos(angleHor)).
				setTexCoordB(2 * j / subdivisionsHor, i / subdivisionsVer);
		}
	}
}

function aeFuncCreateRoundMesh(
		vertexCount        ,
		flat                ,
		initializer                               )                      {
	
	const mb = new ae.mesh.MeshBuilder().allocateVertices(vertexCount);
	
	initializer(mb);
	
	if(flat) mb.makeFlat().computeNormals();
	mb.cullFacing = true;
	
	return mb.seal();
}

function aeFuncCreateCubeA(... _r             )                      {
	
	return new ae.mesh.MeshBuilder().
		allocateVertices     (ae.mesh._p.CUBE_POSITIONS.length).
		allocateTriangles    (12).
		activeCullFaceSupport().
		fillVertexData       ((vertex, index) => vertex.
			setPositionA(ae.mesh._p.CUBE_POSITIONS[index]).
			setNormalA  (ae.mesh._p.CUBE_NORMALS  [index]).
			setUTangentA(ae.mesh._p.CUBE_UTANGENTS[index]).
			setVTangentA(ae.mesh._p.CUBE_VTANGENTS[index]).
			setTexCoordA(ae.mesh._p.CUBE_TEXCOORDS[index])).
		createDefaultQuads();
}

function aeFuncCreateCubeB(
		size            ,
		centered         )                      {
	
	return ae.mesh.createCubeC(size, size, size, centered);
}

function aeFuncCreateCubeC(
		width           ,
		height          ,
		length          ,
		centered         )                      {
	
	const t = centered ? -0.5 : 0;
	
	return ae.mesh.createCubeA().
		transformPositions(new ae.math.Matrix4D().
			scaleB(width, height, length).
			translate(t, t, t));
}

function aeFuncCreateCylinderA(
		subdivisions        ,
		flat                 )                      {
	
	return ae.mesh._p.createRoundMesh(
		2 * subdivisions + 2 * (subdivisions + 1), flat, (mb) => {
			ae.mesh._p.computeDiscData         (subdivisions, 0, 1, 0,          mb);
			ae.mesh._p.computeCylinderShellData(subdivisions, 2 * subdivisions, mb);
		});
}

function aeFuncCreateCylinderB(
		subdivisions        ,
		radius              ,
		height              ,
		flat                 )                      {
	
	return ae.mesh.createCylinderC(subdivisions, radius, radius, height, flat);
}

function aeFuncCreateCylinderC(
		subdivisions        ,
		rx                  ,
		rz                  ,
		height              ,
		flat                 )                      {
	
	return ae.mesh.createCylinderA(subdivisions, flat).
		transformPositions(new ae.math.Matrix4D().scaleB(rx, height, rz));
}

function aeFuncCreateCylinderShellA(
		subdivisions        ,
		flat                 )                      {
	
	return ae.mesh._p.createRoundMesh(
		2 * (subdivisions + 1), flat,
		(mb) => ae.mesh._p.computeCylinderShellData(subdivisions, 0, mb));
}

function aeFuncCreateCylinderShellB(
		subdivisions        ,
		radius              ,
		height              ,
		flat                 )                      {
	
	return ae.mesh.createCylinderShellC(
		subdivisions, radius, radius, height, flat);
}

function aeFuncCreateCylinderShellC(
		subdivisions        ,
		rx                  ,
		rz                  ,
		height              ,
		flat                 )                      {
	
	return ae.mesh.createCylinderShellA(subdivisions, flat).
		transformPositions(new ae.math.Matrix4D().scaleB(rx, height, rz));
}

function aeFuncCreateDiscA(subdivisions        ) {
	return ae.mesh._p.createRoundMesh(
		2 * subdivisions, false,
		(mb) => ae.mesh._p.computeDiscData(subdivisions, 0, 0, 0, mb));
}

function aeFuncCreateDiscB(
		subdivisions        ,
		radius              )                      {
	
	return ae.mesh.createDiscC(subdivisions, radius, radius);
}

function aeFuncCreateDiscC(
		subdivisions        ,
		rx                  ,
		rz                  )                      {
	
	return ae.mesh.createDiscA(subdivisions).
		transformPositions(new ae.math.Matrix4D().scaleB(rx, 1, rz));
}

function aeFuncCreateQuadA()                      {
	
	return new ae.mesh.MeshBuilder().
		allocateVertices     (ae.mesh._p.QUAD_POSITIONS.length).
		allocateTriangles    (4).
		activeCullFaceSupport().
		fillVertexData       ((vertex, index) => vertex.
			setPositionA(ae.mesh._p.QUAD_POSITIONS[index]).
			setNormalA  (ae.mesh._p.QUAD_NORMALS  [index]).
			setUTangentA(ae.mesh._p.QUAD_UTANGENTS[index]).
			setVTangentA(ae.mesh._p.QUAD_VTANGENTS[index]).
			setTexCoordA(ae.mesh._p.QUAD_TEXCOORDS[index])).
		createDefaultQuads();
}

function aeFuncCreateQuadB(
		size            ,
		centered         )                      {
	
	return ae.mesh.createQuadC(size, size, centered);
}

function aeFuncCreateQuadC(
		width           ,
		length          ,
		centered         )                      {
	
	const t = centered ? -0.5 : 0;
	
	return ae.mesh.createQuadA().transformPositions(
		new ae.math.Matrix4D().scaleB(width, 1, length).translate(t, 0, t));
}

function aeFuncCreateTorusA(
		subdivisionsHor        ,
		subdivisionsVer        ,
		flat                    )                      {
	
	return ae.mesh.createTorusB(subdivisionsHor, subdivisionsVer, 2, flat);
}

function aeFuncCreateTorusB(
		subdivisionsHor        ,
		subdivisionsVer        ,
		radius                 ,
		flat                    )                      {
	
	return ae.mesh._p.createRoundMesh(
		(subdivisionsHor + 1) * (subdivisionsVer + 1), flat, (mb) => {
			ae.mesh._p.computeTorusIndices (
				subdivisionsHor, subdivisionsVer,         mb);
			ae.mesh._p.computeTorusVertices(
				subdivisionsHor, subdivisionsVer, radius, mb);
	});
}

function aeFuncCreateTorusC(
		subdivisionsHor        ,
		subdivisionsVer        ,
		R                      ,
		rHor                   ,
		rVer                   ,
		flat                    )                      {
	
	// The radius is set to preserve the ratio R/rHor
	return ae.mesh.createTorusB(
			subdivisionsHor, subdivisionsVer, R / rHor, flat).
		transformPositions(new ae.math.Matrix4D().scaleB(rHor, rVer, rHor));
}

function aeFuncCreateUVSphereA(
		subdivisions        ,
		flat                 )                      {
	
	return ae.mesh.createUVSphereB(subdivisions, subdivisions / 2, flat);
}

function aeFuncCreateUVSphereB(
		subdivisionsHor        ,
		subdivisionsVer        ,
		flat                    )                      {
	
	return ae.mesh._p.createRoundMesh(
		(subdivisionsHor + 1) * (subdivisionsVer + 1), flat, (mb) => {
			ae.mesh._p.computeUVSphereIndices (
				subdivisionsHor, subdivisionsVer, mb);
			ae.mesh._p.computeUVSphereVertices(
				subdivisionsHor, subdivisionsVer, mb);
		});
}

function aeFuncCreateUVSphereC(
		subdivisions        ,
		radius              ,
		flat                 )                      {
	
	return ae.mesh.createUVSphereD(subdivisions, radius, radius, radius, flat);
}

function aeFuncCreateUVSphereD(
		subdivisions        ,
		rx                  ,
		ry                  ,
		rz                  ,
		flat                 )                      {
	
	return ae.mesh.createUVSphereA(subdivisions, flat).
		transformPositions(new ae.math.Matrix4D().scaleB(rx, ry, rz));
}

function aeFuncCreateUVSphereE(
		subdivisionsHor        ,
		subdivisionsVer        ,
		radius                 ,
		flat                    )                      {
	
	return ae.mesh.createUVSphereF(
		subdivisionsHor, subdivisionsVer, radius, radius, radius, flat);
}

function aeFuncCreateUVSphereF(
		subdivisionsHor        ,
		subdivisionsVer        ,
		rx                     ,
		ry                     ,
		rz                     ,
		flat                    )                      {
	
	return ae.mesh.createUVSphereB(subdivisionsHor, subdivisionsVer, flat).
		transformPositions(new ae.math.Matrix4D().scaleB(rx, ry, rz));
}
function aeFuncAssert(
		cond         ,
		msg           = null) {
	
	if(!cond) throw "Assertion failed" + (msg ? ": " + msg : "");
}

function aeFuncAssertNotNull   (
		obj    ,
		msg          = null)    {
	
	if(obj) {
		return obj;
	} else {
		throw "Assertion failed: " + (msg ? msg : "Object is null");
	}
};

function aeFuncAssertNull(
		obj     ,
		msg          = null) {
	
	if(obj) throw "Assertion failed: " + (msg ? msg : "Object is not null");
};

function aeFuncCheckArrayCopyConsistency(
		src                  ,
		srcOffset        ,
		dst                  ,
		dstOffset        ,
		length           )          {
	
	if(length === 0) return false;
	
	if(srcOffset + length >= src.length) throw "Range exceeds source array";
	if(dstOffset + length >= dst.length)
		throw "Range exceeds destination array";
	
	return true;
};

function aeFuncClamp(
		value        ,
		min          ,
		max          )         {
	
	return value < min ? min : (value > max ? max : value);
}

function aeFuncClampArrayAccess(
		index         ,
		length        ) {
	
	return index < 0 ? 0 : (index >= length ? length - 1 : index);
}

function aeFuncCloneArray1D   (array          )           {
	
	return array.slice(0);
}

function aeFuncCloneArray2D   (
		array                 )                  {
	
	const newArray = array.slice(0);
	
	for(let i = 0; i < array.length; i++)
		newArray[i] = ae.util.cloneArray1D(array[i]);
	
	return array.slice(0);
}

function aeFuncCloneArray3D   (
		array                        )                         {
	
	const newArray = array.slice(0);
	
	for(let i = 0; i < array.length; i++)
		newArray[i] = ae.util.cloneArray2D(array[i]);
	
	return array.slice(0);
}

function aeFuncCopy1DimArray   (
		src                ,
		srcOffset        ,
		dst                ,
		dstOffset        ,
		length           )           {
	
	if(!ae.util.checkArrayCopyConsistency(
		src, srcOffset, dst, dstOffset, length)) return dst;
	
	for(let i = 0; i < length; i++) dst[dstOffset + i] = src[srcOffset + i];
	
	return dst;
};

function aeFuncCopy2DimArray   (
		src                       ,
		srcOffset        ,
		dst                       ,
		dstOffset        ,
		length           )                  {
	
	if(!ae.util.checkArrayCopyConsistency(
		src, srcOffset, dst, dstOffset, length)) return dst;
	
	for(let i = 0; i < length; i++) {
		
		const subSrc = src[srcOffset + i];
		const subDst = dst[dstOffset + i];
		
		if(subSrc.length != subDst.length)
			throw "Sub arrays of different length";
		
		ae.util.copy1DimArray(subSrc, 0, subDst, 0, subSrc.length);
	}
	
	return dst;
};

function aeFuncCreate2DimArray   (
		dimSize1        ,
		dimSize2        )                  {
	
	const array = Array(dimSize1);
	
	for(let i = 0; i < dimSize1; i++) array[i] = Array(dimSize2);
	return array;
};

function aeFuncCreate3DimArray   (
		dimSize1        ,
		dimSize2        ,
		dimSize3        )                         {
	
	const array = Array(dimSize1);
	
	for(let i = 0; i < dimSize1; i++)
		array[i] = ae.util.create2DimArray(dimSize2, dimSize3);
	
	return array;
};

function aeFuncMap(
		x             ,
		srcMin        ,
		srcMax        ,
		dstMin        ,
		dstMax        )         {
	
	return (x - srcMin) / (srcMax - srcMin) * (dstMax - dstMin) + dstMin;
}

function aeFuncMix(
		x1           ,
		x2           ,
		ratio        ) {
	
	return (1 - ratio) * x1 + ratio * x2;
}

function aeFuncMixRev(
		x1           ,
		x2           ,
		value        ) {
	
	return (value - x1) / (x2 - x1);
}

function aeFuncRandInt(
		min        ,
		max        )         {
	
	return Math.floor(aeFuncMap(Math.random(), 0, 1, min, max));
}

function aeFuncToDegrees(angle        )         {
	return angle * 180 / Math.PI;
}

function aeFuncToRadians(angle        )         {
	return angle * Math.PI / 180;
}

// Enum types

const _aeEnumGlslTypeBase = {
	UNDEF:   0,
	BOOLEAN: 1,
	INTEGER: 2,
	FLOAT:   3,
	TEXTURE: 4,
};
                                          
Object.freeze(_aeEnumGlslTypeBase);

const _aeEnumGlslType = {
	UNDEF:  new AEClassGlslType(_aeEnumGlslTypeBase.UNDEF,   0, ""),
	BOOL:   new AEClassGlslType(_aeEnumGlslTypeBase.BOOLEAN, 1, "bool"),
	BOOL2:  new AEClassGlslType(_aeEnumGlslTypeBase.BOOLEAN, 2, "bvec2"),
	BOOL3:  new AEClassGlslType(_aeEnumGlslTypeBase.BOOLEAN, 3, "bvec3"),
	BOOL4:  new AEClassGlslType(_aeEnumGlslTypeBase.BOOLEAN, 4, "bvec4"),
	INT:    new AEClassGlslType(_aeEnumGlslTypeBase.INTEGER, 1, "int"),
	INT2:   new AEClassGlslType(_aeEnumGlslTypeBase.INTEGER, 2, "ivec2"),
	INT3:   new AEClassGlslType(_aeEnumGlslTypeBase.INTEGER, 3, "ivec3"),
	INT4:   new AEClassGlslType(_aeEnumGlslTypeBase.INTEGER, 4, "ivec4"),
	FLOAT:  new AEClassGlslType(_aeEnumGlslTypeBase.FLOAT,   1, "float"),
	FLOAT2: new AEClassGlslType(_aeEnumGlslTypeBase.FLOAT,   2, "vec2"),
	FLOAT3: new AEClassGlslType(_aeEnumGlslTypeBase.FLOAT,   3, "vec3"),
	FLOAT4: new AEClassGlslType(_aeEnumGlslTypeBase.FLOAT,   4, "vec4"),
	TEX1:   new AEClassGlslType(_aeEnumGlslTypeBase.TEXTURE, 1, "sampler1D"),
	TEX2:   new AEClassGlslType(_aeEnumGlslTypeBase.TEXTURE, 2, "sampler2D"),
	TEX3:   new AEClassGlslType(_aeEnumGlslTypeBase.TEXTURE, 3, "sampler3D"),
};
Object.freeze(_aeEnumGlslType);

// Default signature groups

const _AE_SG_FLOAT_N_IN_N_OUT  = AEClassSignatureGroup.createWithUniqueBase(_aeEnumGlslTypeBase.FLOAT, false, [false]);
const _AE_SG_FLOAT_N_IN_1_OUT  = AEClassSignatureGroup.createWithUniqueBase(_aeEnumGlslTypeBase.FLOAT, true,  [false]);
const _AE_SG_FLOAT_2N_IN_N_OUT = AEClassSignatureGroup.createWithUniqueBase(_aeEnumGlslTypeBase.FLOAT, false, [false, false]);
const _AE_SG_FLOAT_2N_IN_1_OUT = AEClassSignatureGroup.createWithUniqueBase(_aeEnumGlslTypeBase.FLOAT, true,  [false, false]);
const _AE_SG_FLOAT_3N_IN_N_OUT = AEClassSignatureGroup.createWithUniqueBase(_aeEnumGlslTypeBase.FLOAT, false, [false, false, false]);
const _AE_SG_FLOAT_3N_IN_1_OUT = AEClassSignatureGroup.createWithUniqueBase(_aeEnumGlslTypeBase.FLOAT, true,  [false, false, false]);

// Node templates for functions with standard signatures

const _AE_NT_FUNC_ABS         = AEClassMaterialBuilder._createFuncTemplate("abs",         [_AE_SG_FLOAT_N_IN_N_OUT ]);
const _AE_NT_FUNC_ACOS        = AEClassMaterialBuilder._createFuncTemplate("acos",        [_AE_SG_FLOAT_N_IN_N_OUT ]);
const _AE_NT_FUNC_ASIN        = AEClassMaterialBuilder._createFuncTemplate("asin",        [_AE_SG_FLOAT_N_IN_N_OUT ]);
const _AE_NT_FUNC_ATAN        = AEClassMaterialBuilder._createFuncTemplate("atan",        [_AE_SG_FLOAT_N_IN_N_OUT ]);
const _AE_NT_FUNC_CEIL        = AEClassMaterialBuilder._createFuncTemplate("ceil",        [_AE_SG_FLOAT_N_IN_N_OUT ]);
const _AE_NT_FUNC_CLAMP       = AEClassMaterialBuilder._createFuncTemplate("clamp",       [_AE_SG_FLOAT_3N_IN_N_OUT]);
const _AE_NT_FUNC_COS         = AEClassMaterialBuilder._createFuncTemplate("cos",         [_AE_SG_FLOAT_N_IN_N_OUT ]);
const _AE_NT_FUNC_DEGREES     = AEClassMaterialBuilder._createFuncTemplate("degrees",     [_AE_SG_FLOAT_N_IN_N_OUT ]);
const _AE_NT_FUNC_DISTANCE    = AEClassMaterialBuilder._createFuncTemplate("distance",    [_AE_SG_FLOAT_2N_IN_1_OUT]);
const _AE_NT_FUNC_DOT         = AEClassMaterialBuilder._createFuncTemplate("dot",         [_AE_SG_FLOAT_2N_IN_1_OUT]);
const _AE_NT_FUNC_EXP         = AEClassMaterialBuilder._createFuncTemplate("exp",         [_AE_SG_FLOAT_N_IN_N_OUT ]);
const _AE_NT_FUNC_EXP2        = AEClassMaterialBuilder._createFuncTemplate("exp2",        [_AE_SG_FLOAT_N_IN_N_OUT ]);
const _AE_NT_FUNC_FACEFORWARD = AEClassMaterialBuilder._createFuncTemplate("faceforward", [_AE_SG_FLOAT_3N_IN_N_OUT]);
const _AE_NT_FUNC_FLOOR       = AEClassMaterialBuilder._createFuncTemplate("floor",       [_AE_SG_FLOAT_N_IN_N_OUT ]);
const _AE_NT_FUNC_FRACT       = AEClassMaterialBuilder._createFuncTemplate("fract",       [_AE_SG_FLOAT_N_IN_N_OUT ]);
const _AE_NT_FUNC_INVERSESQRT = AEClassMaterialBuilder._createFuncTemplate("inversesqrt", [_AE_SG_FLOAT_N_IN_N_OUT ]);
const _AE_NT_FUNC_LENGTH      = AEClassMaterialBuilder._createFuncTemplate("length",      [_AE_SG_FLOAT_N_IN_1_OUT ]);
const _AE_NT_FUNC_LOG         = AEClassMaterialBuilder._createFuncTemplate("log",         [_AE_SG_FLOAT_N_IN_N_OUT ]);
const _AE_NT_FUNC_LOG2        = AEClassMaterialBuilder._createFuncTemplate("log2",        [_AE_SG_FLOAT_N_IN_N_OUT ]);
const _AE_NT_FUNC_MAX         = AEClassMaterialBuilder._createFuncTemplate("max",         [_AE_SG_FLOAT_2N_IN_N_OUT]);
const _AE_NT_FUNC_MIN         = AEClassMaterialBuilder._createFuncTemplate("min",         [_AE_SG_FLOAT_2N_IN_N_OUT]);
const _AE_NT_FUNC_MOD         = AEClassMaterialBuilder._createFuncTemplate("mod",         [_AE_SG_FLOAT_2N_IN_N_OUT]);
const _AE_NT_FUNC_NORMALIZE   = AEClassMaterialBuilder._createFuncTemplate("normalize",   [_AE_SG_FLOAT_N_IN_N_OUT ]);
const _AE_NT_FUNC_REFLECT     = AEClassMaterialBuilder._createFuncTemplate("reflect",     [_AE_SG_FLOAT_2N_IN_N_OUT]);
const _AE_NT_FUNC_REFRACT     = AEClassMaterialBuilder._createFuncTemplate("refract",     [_AE_SG_FLOAT_3N_IN_N_OUT]);
const _AE_NT_FUNC_RADIANS     = AEClassMaterialBuilder._createFuncTemplate("radians",     [_AE_SG_FLOAT_N_IN_N_OUT ]);
const _AE_NT_FUNC_SIGN        = AEClassMaterialBuilder._createFuncTemplate("sign",        [_AE_SG_FLOAT_N_IN_N_OUT ]);
const _AE_NT_FUNC_SIN         = AEClassMaterialBuilder._createFuncTemplate("sin",         [_AE_SG_FLOAT_N_IN_N_OUT ]);
const _AE_NT_FUNC_SQRT        = AEClassMaterialBuilder._createFuncTemplate("sqrt",        [_AE_SG_FLOAT_N_IN_N_OUT ]);
const _AE_NT_FUNC_TAN         = AEClassMaterialBuilder._createFuncTemplate("tan",         [_AE_SG_FLOAT_N_IN_N_OUT ]);

// Node templates for functions with more complex signatures

const _AE_NT_FUNC_CROSS      = AEClassMaterialBuilder._createFuncTemplate(
	"cross",
	[new AEClassCustomSignature(_aeEnumGlslType.FLOAT3, [_aeEnumGlslType.FLOAT3, _aeEnumGlslType.FLOAT3])]);

const _AE_NT_FUNC_MIX        = AEClassMaterialBuilder._createFuncTemplate(
	"mix",
	[_AE_SG_FLOAT_3N_IN_N_OUT,
	 AEClassSignatureGroup.createWithUniqueBase(_aeEnumGlslTypeBase.FLOAT, false, [false, false, true])]);

const _AE_NT_FUNC_POW        = AEClassMaterialBuilder._createFuncTemplate(
	"pow",
	[AEClassSignatureGroup.createWithUniqueBase(_aeEnumGlslTypeBase.FLOAT, false, [false, true])]);

const _AE_NT_FUNC_SMOOTHSTEP = AEClassMaterialBuilder._createFuncTemplate(
	"smoothstep",
	[_AE_SG_FLOAT_3N_IN_N_OUT,
	 AEClassSignatureGroup.createWithUniqueBase(_aeEnumGlslTypeBase.FLOAT, false, [true, true, false])]);

const _AE_NT_FUNC_STEP       = AEClassMaterialBuilder._createFuncTemplate(
	"step",
	[_AE_SG_FLOAT_2N_IN_N_OUT,
	 AEClassSignatureGroup.createWithUniqueBase(_aeEnumGlslTypeBase.FLOAT, false, [true, false])]);

const _AE_NT_FUNC_TEXTURE    = AEClassMaterialBuilder._createFuncTemplate(
	"texture",
	[new AEClassCustomSignature(_aeEnumGlslType.FLOAT4, [_aeEnumGlslType.TEX2, _aeEnumGlslType.FLOAT2])]);
	
// Node template for the negation

const _AE_NT_UNARY_OP_NEGATE = new AEClassNodeTemplate(1, [_AE_SG_FLOAT_N_IN_N_OUT], ["-", ""]);

// Node template for the division

const _AE_NT_BIN_OP_DIV = new AEClassNodeTemplate(
	2,
	[AEClassSignatureGroup.createWithUniqueBase(_aeEnumGlslTypeBase.FLOAT, false, [true,  false]),
	 AEClassSignatureGroup.createWithUniqueBase(_aeEnumGlslTypeBase.FLOAT, false, [false, true ]),
	 AEClassSignatureGroup.createWithUniqueBase(_aeEnumGlslTypeBase.FLOAT, false, [false, false])],
	["(", " / ", ")"]);

// Attributes

const _AE_SP_ATTR_POSITION = new AEClassSPAttribute("in_position", 0, "attribute highp   vec3 in_position;");
const _AE_SP_ATTR_NORMAL   = new AEClassSPAttribute("in_normal",   1, "attribute mediump vec3 in_normal;");
const _AE_SP_ATTR_TEXCOORD = new AEClassSPAttribute("in_texCoord", 2, "attribute mediump vec2 in_texCoord;");

// Internal uniforms in vertex shader

const _AE_SP_UNI_MAT_MODELVIEW  = new AEClassSPUniformVS("u_matModelView",  "uniform highp mat4 u_matModelView;");
const _AE_SP_UNI_MAT_PROJECTION = new AEClassSPUniformVS("u_matProjection", "uniform highp mat4 u_matProjection;");
const _AE_SP_UNI_MAT_NORMAL     = new AEClassSPUniformVS("u_matNormal",     "uniform highp mat3 u_matNormal;");

// Internal uniforms in fragment shader

const _AE_SP_UNI_DIR_LIGHTS        = new AEClassSPUniformFS("u_dirLights",       "uniform highp vec4 u_dirLights[16];");
const _AE_SP_UNI_DIR_LIGHT_COUNT   = new AEClassSPUniformFS("u_dirLightCount",   "uniform lowp  int  u_dirLightCount;");
const _AE_SP_UNI_POINT_LIGHTS      = new AEClassSPUniformFS("u_pointLights",     "uniform highp vec4 u_pointLights[16];");
const _AE_SP_UNI_POINT_LIGHT_COUNT = new AEClassSPUniformFS("u_pointLightCount", "uniform lowp  int  u_pointLightCount;");

// Varying variables

const _AE_SP_VARY_POSITION = new AEClassSPVarying("var_pos",      _aeEnumGlslType.FLOAT3, "highp   vec3 var_pos;",      "var_pos      = eyePos.xyz;");
const _AE_SP_VARY_NORMAL   = new AEClassSPVarying("var_normal",   _aeEnumGlslType.FLOAT3, "mediump vec3 var_normal;",   "var_normal   = normalize(u_matNormal * in_normal);");
const _AE_SP_VARY_TEXCOORD = new AEClassSPVarying("var_texCoord", _aeEnumGlslType.FLOAT2, "mediump vec2 var_texCoord;", "var_texCoord = in_texCoord;");

// Local variables in the FS main-function

const _AE_SP_LVAR_EYE    = new AEClassSPLocalVariable("eye",    _aeEnumGlslType.FLOAT3, "mediump vec3 eye    = normalize(-var_pos);");
const _AE_SP_LVAR_NORMAL = new AEClassSPLocalVariable("normal", _aeEnumGlslType.FLOAT3, "mediump vec3 normal = normalize(var_normal);");

// Function for phong shading

const _AE_SP_FUNC_PHONG = new AEClassSPFunction(
	"phong",
	_aeEnumGlslType.FLOAT3,
	[_aeEnumGlslType.FLOAT3, _aeEnumGlslType.FLOAT3],
	
	"vec3 phong(",
	"\t\tin vec3 pos,",
	"\t\tin vec3 normal) {",
	"",
	"\tlowp    int  i;",
	"\thighp   vec4 l1;",
	"\tlowp    vec4 l2;",
	"\tmediump vec3 lightVec;",
	"\tlowp    vec3 intensity = vec3(0, 0, 0);",
	"",
	"\tfor(i = 0; i < u_dirLightCount; i++) {",
	"\t\tl1         = u_dirLights[2 * i];",
	"\t\tl2         = u_dirLights[2 * i + 1];",
	"\t\tintensity += l2.rgb * max(dot(normal, l1.xyz) * l1.w + l2.w, 0);",
	"\t}",
	"",
	"\tfor(i = 0; i < u_pointLightCount; i++) {",
	"\t\tl1         = u_pointLights[2 * i];",
	"\t\tl2         = u_pointLights[2 * i + 1];",
	"\t\tlightVec   = l1.xyz - pos;",
	"\t\tintensity +=",
	"\t\t\tl2.rgb *",                                           // Basic color
	"\t\t\tpow(max(1.0 - length(lightVec) / l1.w, 0), l2.a) *", // Attenuation
	"\t\t\tmax(dot(normalize(lightVec), normal), 0.0);",        // Intensity
	"\t}",
	"",
	"\treturn intensity;",
	"}");

// Material builtin objects

const _AE_MAT_BUILTIN_VAR_POSITION = new AEClassMatBuiltInVariable(_AE_SP_VARY_POSITION);
const _AE_MAT_BUILTIN_VAR_EYE      = new AEClassMatBuiltInVariable(_AE_SP_LVAR_EYE);
const _AE_MAT_BUILTIN_VAR_NORMAL   = new AEClassMatBuiltInVariable(_AE_SP_LVAR_NORMAL);
const _AE_MAT_BUILTIN_VAR_TEXCOORD = new AEClassMatBuiltInVariable(_AE_SP_VARY_TEXCOORD);
const _AE_MAT_BUILTIN_FUNC_PHONG   = new AEClassMatBuiltInFunction(_AE_SP_FUNC_PHONG);
	/*
type EntityType = 0 | 1 | 2 | 3 | 4 | 5 | 6;

ae.scenegraph.EntityType = {
	NONE:              0,
	CAMERA:            1,
	MODEL:             2,
	DIRECTIONAL_LIGHT: 3,
	POINT_LIGHT:       4,
	MARKER:            5,
	DYNAMIC_SPACE:     6
}
*/
const _ae = {
	
	core: {
		
		// Classes
		GlslShader: AEClassGlslShader,
	},
	
	mat: {
		
		
		
		// Classes
		GlslType:           AEClassGlslType,
		MatCustomParam:     AEClassMatCustomParam,
		MatCustomTexture:   AEClassMatCustomTexture,
		MatBuiltInFunction: AEClassMatBuiltInFunction,
		MatBuiltInVariable: AEClassMatBuiltInVariable,
		MatValue:           AEClassMatValue,
		SPAttribute:        AEClassSPAttribute,
		SPCustomParam:      AEClassSPCustomParam,
		SPCustomTexture:    AEClassSPCustomTexture,
		SPFunction:         AEClassSPFunction,
		SPLocalVariable:    AEClassSPLocalVariable,
		SPComponent:        AEClassSPComponent,
		SPUniform:          AEClassSPUniform,
		SPUniformFS:        AEClassSPUniformFS,
		SPUniformVS:        AEClassSPUniformVS,
		SPVarying:          AEClassSPVarying,
	},
	
	EntityType: {
		NONE:              0,
		CAMERA:            1,
		MODEL:             2,
		DIRECTIONAL_LIGHT: 3,
		POINT_LIGHT:       4,
		MARKER:            5,
		DYNAMIC_SPACE:     6
	},
	
	SG_ERROR_NOT_STATIC:     "Scope transformations must be static",
	SG_ERROR_MULTI_INSTANCE: "Only one instance is allowed",
};
Object.freeze(_ae);

const ae = {
	
	JavaObject: AEClassJavaObject,
	
	col: {
		
		_p: {
			
			HMKeyIterator:   AEClassHMKeyIterator,
			HMValueIterator: AEClassHMValueIterator,
			
			LL_NODE_POOL: AEClassDynamicPool.createNodePoolA(true),
			HM_KVP_POOL:
				new AEClassDynamicPool(true, () => new AEClassKeyValuePair()),
		},
		
		// Classes
		DynamicPool:      AEClassDynamicPool,
		GrowingPool:      AEClassGrowingPool,
		KeyValuePair:     AEClassKeyValuePair,
		LinkedListNode:   AEClassLinkedListNode,
		Pool:             AEClassPool,
		PooledCollection: AEClassPooledCollection,
		PooledHashMap:    AEClassPooledHashMap,
		PooledHashSet:    AEClassPooledHashSet,
		PooledLinkedList: AEClassPooledLinkedList,
		PooledOrderedSet: AEClassPooledOrderedSet,
		PooledQueue:      AEClassPooledQueue,
	},
	
	core: {
		
		_p: {
			RenderState: AEClassRenderState,
			UnrollError: AEClassUnrollError,
			UpdateEvent: AEClassUpdateEvent,
		},
		
		AbstractEngine: AEClassAbstractEngine,
		SceneGraph:     AEClassSceneGraph,
	},
	
	event: {
		
		Event:          AEClassEvent,
		Listener:       AEClassListener, // implemented in Event.js
		NotifyEvent:    AEClassNotifyEvent,
		SignalEndPoint: AEClassSignalEndPoint,
		SignalSource:   AEClassSignalSource,
	},
	
	mat: {
		
		// Classes
		CustomSignature: AEClassCustomSignature,
		Material:        AEClassMaterial,
		MaterialBuilder: AEClassMaterialBuilder,
		Node:            AEClassNode,
		NodeTemplate:    AEClassNodeTemplate,
		SignatureGroup:  AEClassSignatureGroup,
		
		// Enums
		GlslType:     _aeEnumGlslType,
		GlslTypeBase: _aeEnumGlslTypeBase,
		
		// Functions
		getGlslType: aeFuncGetGlslType,
		
		// Constants
		SIG_GROUP_FLOAT_N_IN_N_OUT:  _AE_SG_FLOAT_N_IN_N_OUT,
		SIG_GROUP_FLOAT_N_IN_1_OUT:  _AE_SG_FLOAT_N_IN_1_OUT,
		SIG_GROUP_FLOAT_2N_IN_N_OUT: _AE_SG_FLOAT_2N_IN_N_OUT,
		SIG_GROUP_FLOAT_2N_IN_1_OUT: _AE_SG_FLOAT_2N_IN_1_OUT,
		SIG_GROUP_FLOAT_3N_IN_N_OUT: _AE_SG_FLOAT_3N_IN_N_OUT,
		SIG_GROUP_FLOAT_3N_IN_1_OUT: _AE_SG_FLOAT_3N_IN_1_OUT,
	},
	
	math: {
		
		// Classes
		Matrix4D:        AEClassMatrix4D,
		MatrixVector:    AEClassMatrixVector,
		ReadOnlyBackend: AEClassReadOnlyBackend,
		StaticBackend:   AEClassStaticBackend,
		Vector3D:        AEClassVector3D,
		Vector4D:        AEClassVector4D,
		VectorBackend:   AEClassVectorBackend,
		
		// Unit vectors defined as 3D vectors
		X_POS: AEClassVector3D.createConstB( 1,  0,  0),
		X_NEG: AEClassVector3D.createConstB(-1,  0,  0),
		Y_POS: AEClassVector3D.createConstB( 0,  1,  0),
		Y_NEG: AEClassVector3D.createConstB( 0, -1,  0),
		Z_POS: AEClassVector3D.createConstB( 0,  0,  1),
		Z_NEG: AEClassVector3D.createConstB( 0,  0, -1),

		// Colors defined as 4D vectors
		BLACK : AEClassVector4D.createConstB(0,       1),
		GREY  : AEClassVector4D.createConstB(0.5,     1),
		WHITE : AEClassVector4D.createConstB(1,       1),
		RED   : AEClassVector4D.createConstC(1, 0, 0, 1),
		GREEN : AEClassVector4D.createConstC(0, 1, 0, 1),
		BLUE  : AEClassVector4D.createConstC(0, 0, 1, 1),
		YELLOW: AEClassVector4D.createConstC(1, 1, 0, 1),
		PURPLE: AEClassVector4D.createConstC(1, 0, 1, 1),
		CYAN  : AEClassVector4D.createConstC(0, 1, 1, 1),
	},
	
	mesh: {
		
		_p: {
			
			// Private functions
			computeCylinderShellData: aeFuncComputeCylinderShellData,
			computeDiscData:          aeFuncComputeDiscData,
			computeDiscIndices:       aeFuncComputeDiscIndices,
			computeDiscVertices:      aeFuncComputeDiscVertices,
			computeTorusIndices:      aeFuncComputeTorusIndices,
			computeTorusVertices:     aeFuncComputeTorusVertices,
			computeUVSphereIndices:   aeFuncComputeUVSphereIndices,
			computeUVSphereVertices:  aeFuncComputeUVSphereVertices,
			createRoundMesh:          aeFuncCreateRoundMesh,
			
			// Private constants
			QUAD_POSITIONS: [
				[0,0,0],[1,0,0],[1,0,1],[0,0,1],
				[0,0,0],[0,0,1],[1,0,1],[1,0,0]],

			QUAD_NORMALS: [
				[ 0,-1, 0],[ 0,-1, 0],[ 0,-1, 0],[ 0,-1, 0],
				[ 0, 1, 0],[ 0, 1, 0],[ 0, 1, 0],[ 0, 1, 0]],

			QUAD_UTANGENTS: [
				[ 1, 0, 0],[ 1, 0, 0],[ 1, 0, 0],[ 1, 0, 0],
				[ 1, 0, 0],[ 1, 0, 0],[ 1, 0, 0],[ 1, 0, 0]],

			QUAD_VTANGENTS: [
				[ 0, 0, 1],[ 0, 0, 1],[ 0, 0, 1],[ 0, 0, 1],
				[ 0, 0, 1],[ 0, 0, 1],[ 0, 0, 1],[ 0, 0, 1]],

			QUAD_TEXCOORDS: [
				[0,0],[1,0],[1,1],[0,1],
				[0,0],[0,1],[1,1],[1,0]],

			CUBE_POSITIONS: [
				[0,0,0],[0,1,0],[1,1,0],[1,0,0],  // front
				[1,0,0],[1,1,0],[1,1,1],[1,0,1],  // right
				[1,0,1],[1,1,1],[0,1,1],[0,0,1],  // back
				[0,0,1],[0,1,1],[0,1,0],[0,0,0],  // left
				[0,0,0],[1,0,0],[1,0,1],[0,0,1],  // bottom
				[0,1,0],[0,1,1],[1,1,1],[1,1,0]], // top

			CUBE_NORMALS: [
				[ 0, 0,-1],[ 0, 0,-1],[ 0, 0,-1],[ 0, 0,-1],  // front
				[ 1, 0, 0],[ 1, 0, 0],[ 1, 0, 0],[ 1, 0, 0],  // right
				[ 0, 0, 1],[ 0, 0, 1],[ 0, 0, 1],[ 0, 0, 1],  // back
				[-1, 0, 0],[-1, 0, 0],[-1, 0, 0],[-1, 0, 0],  // left
				[ 0,-1, 0],[ 0,-1, 0],[ 0,-1, 0],[ 0,-1, 0],  // bottom
				[ 0, 1, 0],[ 0, 1, 0],[ 0, 1, 0],[ 0, 1, 0]], // top

			CUBE_UTANGENTS: [
				[ 1, 0, 0],[ 1, 0, 0],[ 1, 0, 0],[ 1, 0, 0],  // front
				[ 0, 0, 1],[ 0, 0, 1],[ 0, 0, 1],[ 0, 0, 1],  // right
				[-1, 0, 0],[-1, 0, 0],[-1, 0, 0],[-1, 0, 0],  // back
				[ 0, 0,-1],[ 0, 0,-1],[ 0, 0,-1],[ 0, 0,-1],  // left 
				[ 1, 0, 0],[ 1, 0, 0],[ 1, 0, 0],[ 1, 0, 0],  // bottom
				[ 1, 0, 0],[ 1, 0, 0],[ 1, 0, 0],[ 1, 0, 0]], // top

			CUBE_VTANGENTS: [
				[ 0, 1, 0],[ 0, 1, 0],[ 0, 1, 0],[ 0, 1, 0],  // front
				[ 0, 1, 0],[ 0, 1, 0],[ 0, 1, 0],[ 0, 1, 0],  // right
				[ 0, 1, 0],[ 0, 1, 0],[ 0, 1, 0],[ 0, 1, 0],  // back
				[ 0, 1, 0],[ 0, 1, 0],[ 0, 1, 0],[ 0, 1, 0],  // left
				[ 0, 0, 1],[ 0, 0, 1],[ 0, 0, 1],[ 0, 0, 1],  // bottom
				[ 0, 0, 1],[ 0, 0, 1],[ 0, 0, 1],[ 0, 0, 1]], // top

			CUBE_TEXCOORDS: [
				[0,0],[0,1],[1,1],[1,0],  // front
				[0,0],[0,1],[1,1],[1,0],  // right
				[0,0],[0,1],[1,1],[1,0],  // back
				[0,0],[0,1],[1,1],[1,0],  // left
				[0,0],[1,0],[1,1],[0,1],  // bottom
				[0,0],[0,1],[1,1],[1,0]], // top
			
			// Function used for fast normal computation in the meshes
			ACOS: new AEClassSampledFunction(10000, -1, 1, (x) => Math.acos(x)),
		},
		
		// Classes
		Adjacency:   AEClassAdjacency,
		Mesh:        AEClassMesh,
		MeshBuilder: AEClassMeshBuilder,
		Triangle:    AEClassTriangle,
		Vertex:      AEClassVertex,
		
		// Functions
		createCubeA:          aeFuncCreateCubeA,
		createCubeB:          aeFuncCreateCubeB,
		createCubeC:          aeFuncCreateCubeC,
		createCylinderA:      aeFuncCreateCylinderA,
		createCylinderB:      aeFuncCreateCylinderB,
		createCylinderC:      aeFuncCreateCylinderC,
		createCylinderShellA: aeFuncCreateCylinderShellA,
		createCylinderShellB: aeFuncCreateCylinderShellB,
		createCylinderShellC: aeFuncCreateCylinderShellC,
		createDiscA:          aeFuncCreateDiscA,
		createDiscB:          aeFuncCreateDiscB,
		createDiscC:          aeFuncCreateDiscC,
		createQuadA:          aeFuncCreateQuadA,
		createQuadB:          aeFuncCreateQuadB,
		createQuadC:          aeFuncCreateQuadC,
		createTorusA:         aeFuncCreateTorusA,
		createTorusB:         aeFuncCreateTorusB,
		createTorusC:         aeFuncCreateTorusC,
		createUVSphereA:      aeFuncCreateUVSphereA,
		createUVSphereB:      aeFuncCreateUVSphereB,
		createUVSphereC:      aeFuncCreateUVSphereC,
		createUVSphereD:      aeFuncCreateUVSphereD,
		createUVSphereE:      aeFuncCreateUVSphereE,
		createUVSphereF:      aeFuncCreateUVSphereF,
		
		_VERTEX_SIZE: 32,
	},
	
	sg: {
		
		Attribute:        AEClassAttribute,
		Camera:           AEClassCamera,
		CModeAdaptiveFOV: AEClassCModeAdaptiveFOV,
		CModeFixedHorFOV: AEClassCModeFixedHorFOV,
		CModeFixedVerFOV: AEClassCModeFixedVerFOV,
		ConstAttribute:   AEClassConstAttribute,
		Entity:           AEClassEntity,
		Instance:         AEClassInstance,
		Model:            AEClassModel,
		
		EntityType: _ae.EntityType,
		
		RATIO_SQUARE: 1,
		RATIO_3_2:    3 / 2,
		RATIO_4_3:    4 / 3,
		RATIO_16_9:   16 / 9,
		RATIO_21_9:   21 / 9,
	},
	
	util: {
		
		// Classes
		CachedObject:    AEClassCachedObject,
		GrowingList:     AEClassGrowingList,
		Integer:         AEClassInteger,
		SampledFunction: AEClassSampledFunction,
		String:          AEClassString,
		
		// Functions
		assert: aeFuncAssert,
		assertNotNull: aeFuncAssertNotNull,
		assertNull: aeFuncAssertNull,
		checkArrayCopyConsistency: aeFuncCheckArrayCopyConsistency,
		clamp: aeFuncClamp,
		clampArrayAccess: aeFuncClampArrayAccess,
		cloneArray1D: aeFuncCloneArray1D,
		cloneArray2D: aeFuncCloneArray2D,
		cloneArray3D: aeFuncCloneArray3D,
		copy1DimArray: aeFuncCopy1DimArray,
		copy2DimArray: aeFuncCopy2DimArray,
		create2DimArray: aeFuncCreate2DimArray,
		create3DimArray: aeFuncCreate3DimArray,
		map: aeFuncMap,
		mix: aeFuncMix,
		mixRev: aeFuncMixRev,
		randInt: aeFuncRandInt,
		toDegrees: aeFuncToDegrees,
		toRadians: aeFuncToRadians,
	},
	
	VERSION_MAJOR:    0,
	VERSION_MINOR:    9,
	VERSION_REVISION: 0,

	RAD_FACTOR: Math.PI / 180,
	DEG_FACTOR: 180 / Math.PI,

	EXCEPTION_ABSTRACT_METHOD: "Unimplemented abstract method",
	
	// I_Mij = index of entry in row i and column j
	I_M11:  0,
	I_M12:  4,
	I_M13:  8,
	I_M14: 12,
	I_M21:  1,
	I_M22:  5,
	I_M23:  9,
	I_M24: 13,
	I_M31:  2,
	I_M32:  6,
	I_M33: 10,
	I_M34: 14,
	I_M41:  3,
	I_M42:  7,
	I_M43: 11,
	I_M44: 15,

	// I_NMij = index of entry in row i and column j (normal matrix)
	I_NM11: 0,
	I_NM12: 3,
	I_NM13: 6,
	I_NM21: 1,
	I_NM22: 4,
	I_NM23: 7,
	I_NM31: 2,
	I_NM32: 5,
	I_NM33: 8,
};

Object.freeze(ae.core._p);
Object.freeze(ae.mesh._p);
Object.freeze(ae.core);
Object.freeze(ae.math);
Object.freeze(ae.mesh);
Object.freeze(ae.util);
Object.freeze(ae);
