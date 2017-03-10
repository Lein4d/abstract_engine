/**       */

let aeVarHashCounter = 0;

class AEClassJavaObject {
	
	                 
	
	constructor() {
		this.hashCode = aeVarHashCounter++;
	}
	
	equals(obj                   ) {return this == obj;}
	
	finalize()       {}
}

                                                           
                                                           
                                                           

                                    
                                    

                    

                       
                                    
 

                         
                                       
                                       
 

                      
                                                 
                              
 

class AEClassHMKeyIterator                      {
	
	                                    
	
	constructor(hashMap                            ) {
		this.hashMap = hashMap;
	}
	
	forEach(visitor            ) {
		for(let i = 0; i < this.hashMap.bufferSize; i++)
			if(this.hashMap._keys[i]) visitor(this.hashMap._keys[i]);
	}
	
	forEachRev(visitor            ) {this.forEach(visitor);}
}

class AEClassHMValueIterator                      {
	
	                                    
	
	constructor(hashMap                            ) {
		this.hashMap = hashMap;
	}
	
	forEach(visitor             ) {
		for(let i = 0; i < this.hashMap.bufferSize; i++)
			if(this.hashMap._used[i]) visitor(this.hashMap._values[i]);
	}
	
	forEachRev(visitor             ) {this.forEach(visitor);}
}

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
// No generic type is used for the content as the type checker cannot cope with
// it correctly
class AEClassLinkedListNode extends AEClassJavaObject {
	
	      
                                  
                                  
                    
  
	
	// public constructor //////////////////////////////////////////////////////
	
	constructor(content           = null) {
		
		super();
		
		this._pp = {
			prev:    null,
			next:    null,
			content: content
		}
		
		Object.freeze(this);
	}
	
	// public getters + setters ////////////////////////////////////////////////
	
	get prev()                         {return this._pp.prev;}
	get next()                         {return this._pp.next;}
	
	get content()           {return this._pp.content;}
	
	set content(content          ) {this._pp.content = content;}
	
	// public methods //////////////////////////////////////////////////////////
	
	forEach(visitor                                ) {
		
		let node = this;
		
		while(node) {
			visitor(node);
			node = node.next;
		}
	}
	
	forEachRev(visitor                                ) {
		
		let node = this;
		
		while(node) {
			visitor(node);
			node = node.prev;
		}
	}
	
	insertAfter(node                        )                        {
		
		if(!node) return this.resetListOnly();

		this._pp.prev = node;
		this._pp.next = node.next;
		node._pp.next = this;
		
		return this;
	}
	
	insertBefore(node                        ) 
                        {
		
		if(!node) return this.resetListOnly();
		
		this._pp.prev = node.prev;
		this._pp.next = node;
		node._pp.prev = this;
		
		return this;
	}
	
	remove()                        {
		
		if(this.prev) this.prev._pp.next = this.next;
		if(this.next) this.next._pp.prev = this.prev;
		
		return this;
	}

	reset()                        {
		
		this._pp.content              = null;
		this._pp.prev = this._pp.next = null;
		
		return this;
	}
	
	resetListOnly()                        {
		this._pp.prev = this._pp.next = null;
		return this;
	}
}

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
class AEClassPooledCollection    {
	
	     
                                                                          
                                 
               
  
	
	// protected constructor ///////////////////////////////////////////////////
	
	constructor() {
		
		this._p = {
			size: 0
		}
		
		// Will be freezed in sub class
	}
	
	// protected methods ///////////////////////////////////////////////////////
	
	_addSingle(element    )          {throw ae.EXCEPTION_ABSTRACT_METHOD;}
	
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
class AEClassPooledQueue    {
	
	                                  
	
	constructor() {
		this._list = new AEClassPooledLinkedList();
		Object.freeze(this);
	}
	
	get hasNext()          {return !this._list.empty;}
	get next()     {return this._list.first;}
	
	pop()     {
		
		const element = this._list.first;
		
		this._list.removeFirstA();
		return element;
	}
	
	push(element    )       {
		this._list.insertAtEnd(element);
	}
}
function renderLoopCallback(engine                        ) {
	
	window.requestAnimationFrame(
		function() {renderLoopCallback(engine)});
	
	engine._render();
}

class AEClassAbstractEngine {
	
	                                  
	                                   
	                             
	
	constructor(canvas                   ) {
		
		const tempGL = canvas.getContext("webgl");
		
		if(!tempGL) throw "No WebGL context available";
		
		this.gl         = tempGL;
		this.state      = new ae.core._p.RenderState();
		this.background = ae.math.BLACK.xyz.cloneStatic();
		
		this.gl.viewport(0, 0, canvas.width, canvas.height);
		
		//this.gl.clearColor(1.0, 0.0, 0.0, 1.0);
		//this.gl.clear(this.gl.COLOR_BUFFER_BIT);
		
		Object.freeze(this);
	}
	
	_render() {
		this.state._beginNextFrame(1);
	}
	
	render() {
		
		this.background.copyStaticValues();
		this.gl.clearColor(this.background.x, this.background.y, this.background.z, 1.0);
		this.gl.clear(this.gl.COLOR_BUFFER_BIT);
	}
	
	start() {
		renderLoopCallback(this);
	}
};

class AEClassRenderState {
	
	     
                     
                     
                     
                     
  
	
	                                                         
	
	constructor() {
		
		this._p = {
			frameIndex: -1,
			absTime:    0,
			time:       0,
			timeDelta:  0
		};
		
		this.onNewFrame = new AEClassNotifyEvent(this);
		
		Object.freeze(this);
	}
	
	get frameIndex()         {return this._p.frameIndex;}
	get absTime   ()         {return this._p.absTime;}
	get time      ()         {return this._p.time;}
	get timeDelta ()         {return this._p.timeDelta;}
	
	_beginNextFrame(speed        ) {
		
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
		
		this.onNewFrame.fire();
	}
	
	//createUpdateEvent<H>(host: H): ae.core.UpdateEvent<H> {
	//	return new ae.core.UpdateEvent<H>(this, host);
	//}
}

class AEClassListener    extends AEClassJavaObject {
	
	                      
	
	constructor(callback             ) {
		
		super();
		
		this.callback = callback;
		Object.freeze(this);
	}
}

class AEClassEvent          {
	
	                                                             
	
	        
	
	constructor(host   ) {
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
		// $CORRECT_CAST
		this._listeners.forEach((listener) => listener.callback(this));
	}
	
	removeListener(listener                         )       {
		this._listeners.remove(listener);
	}
}

class AEClassNotifyEvent    extends AEClassEvent                           {
	
	constructor(host   ) {
		super(host);
	}
}

class AEClassSignalEndPoint extends AEClassJavaObject {
	
	                                  
	
	                      
	
	constructor(
			source                             ,
			flagCount        ) {
		
		super();
		
		this._source = source;
		this.flags   = Array(flagCount);
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

class AEClassSignalSource                {
	
	                                                   
	     
                                                            
  
	
	             
	                  
	
	get _endPoints()                                                 {return this._p.endPoints;}
	
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
					this._endPoints.forEach((endPoint) => {endPoint.flags[i] = true;});
			}
		}
		
		this.host.reactToSignalChange();
	}
	
	constructor(
			host                   ,
			flagCount                   ,
			... forwardedSignals                                ) {
		
		if(flagCount < 1) throw "'flagCount' must be greater than 0";
		/*
		for(SignalEndPoint i : forwardedSignals)
			if(i.flags.length != flagCount)
				throw new IllegalArgumentException(
					"Flag count of forwarded signal must match 'flagCount'");
		*/
		this.host              = host;
		this.flagCount         = flagCount;
		this._forwardedSignals = forwardedSignals.length > 0 ?
			aeFuncCopy1DimArray(forwardedSignals, 0, Array(forwardedSignals.length), 0, forwardedSignals.length) : null;
		this._p                = {endPoints: null};
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

class AEClassMatrix4D {
	
	                             
	                                                   
	                              
	                                         
	                                         

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
			uniLocation                      )                   {
		
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
			uniLocation                      )                   {
		
		gl.uniformMatrix4fv(uniLocation, false, this._data);
		return this;
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
	
	getElement(
			rIndex         ,
			cIndex         )         {
		
		return this._data[cIndex * 4 + rIndex];
	}
	
	getNmData(
			dst                  ,
			offset         = 0)                {
		
		const nmData = this._nmDataCached.object;
		
		for(let i = 0; i < 9; i++) dst[offset + i] = nmData[i];
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
	
	multWithMatrix(m                  )                   {
		
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
			far           )                   {
	
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
			far           )                   {

		return this.projectOrthogonal(
			-width / 2, width / 2, -height / 2, height / 2, near, far);
	}

	projectPerspective(
			left          ,
			right         ,
			bottom        ,
			top           ,
			near          ,
			far            = 0)                   {
	
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
			far              = 0)                   {

		const width         = 2 * Math.tan(fov * Math.PI / 360) * near;
		
		return this.projectPerspectiveSym(
			width, width * vpHeight / vpWidth, near, far);
	}
	
	projectPerspectiveSym(
			width         ,
			height        ,
			near          ,
			far            = 0)                   {
		
		return this.projectPerspective(
			-width / 2, width / 2, -height / 2, height / 2, near, far);
	}

	projectPerspectiveVerFOV(
			vpWidth         ,
			vpHeight        ,
			fov             ,
			near            ,
			far              = 0)                   {

		const height         = 2 * Math.tan(fov * Math.PI / 360) * near;
		
		return this.projectPerspectiveSym(
			height * vpWidth / vpHeight, height, near, far);
	}

	rotateX(angle        )                   {
		
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

	rotateY(angle        )                   {

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

	rotateZ(angle        )                   {

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

	scaleA(value        )                   {
		return this.scaleB(value, value, value);
	}
	
	scaleB(
			x        ,
			y        ,
			z        )                   {
		
		this.m11 *= x; this.m12 *= y; this.m13 *= z;
		this.m21 *= x; this.m22 *= y; this.m23 *= z;
		this.m31 *= x; this.m32 *= y; this.m33 *= z;
		this.m41 *= x; this.m42 *= y; this.m43 *= z;
		
		return this;
	}
	
	setDataA(src                  )                   {
		this._data.set(src._data);
		return this;
	}
	
	setDataB(
			src                  ,
			offset         = 0)                   {
		
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
    		m44        )                   {
		
		this.m11 = m11; this.m12 = m12; this.m13 = m13; this.m14 = m14;
		this.m21 = m21; this.m22 = m22; this.m23 = m23; this.m24 = m24;
		this.m31 = m31; this.m32 = m32; this.m33 = m33; this.m34 = m34;
		this.m41 = m41; this.m42 = m42; this.m43 = m43; this.m44 = m44;
		
		return this;
	}
	
	setElement(
			rIndex        ,
			cIndex        ,
			value         )                   {
		
		this._data[cIndex * 4 + rIndex] = value;
		return this;
	}

	toIdentity()                   {
		
		this.m11 = this.m22 = this.m33 = this.m44 = 1;

		this.m12 = this.m13 = this.m14 = this.m21 = this.m23 = this.m24 =
		this.m31 = this.m32 = this.m34 = this.m41 = this.m42 = this.m43 = 0;
		
		return this;
	}
	
	translate(
			x        ,
			y        ,
			z        )                   {

		this.m14 = this.m11 * x + this.m12 * y + this.m13 * z + this.m14;
		this.m24 = this.m21 * x + this.m22 * y + this.m23 * z + this.m24;
		this.m34 = this.m31 * x + this.m32 * y + this.m33 * z + this.m34;
		this.m44 = this.m41 * x + this.m42 * y + this.m43 * z + this.m44;

		return this;
	}
};

class AEClassVector3D {
	
	                                
	                           
	
	          
	          
	          
	
	constructor(backend                       ) {
		
		this.backend  = backend;
		this.readOnly = backend instanceof ae.math.ReadOnlyBackend ?
			this : new AEClassVector3D(new ae.math.ReadOnlyBackend(backend));
		
		this.x = 0; this.y = 0; this.z = 0;
	}
	
	addA(value        )                   {
		
		this.backend.x += value;
		this.backend.y += value;
		this.backend.z += value;
		
		return this;
	}
	
	addB(v                  )                   {
		
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

	copyStaticValues()                   {
		
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
		
		return new AEClassVector3D(new ae.math.ReadOnlyBackend(
			new ae.math.StaticBackend(x, y, z)));
	}

	static createStaticA(grey         = 0)                   {
		return AEClassVector3D.createStaticB(grey, grey, grey);
	}

	static createStaticB(
			x        ,
			y        ,
			z        )                   {
		
		return new AEClassVector3D(new ae.math.StaticBackend(x, y, z));
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
	
	divA(value        )                   {
		
		this.backend.x /= value;
		this.backend.y /= value;
		this.backend.z /= value;
		
		return this;
	}
	
	divB(v                  )                   {
		
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
	
	multA(value        )                   {
		
		this.backend.x *= value;
		this.backend.y *= value;
		this.backend.z *= value;
		
		return this;
	}
	
	multB(v                  )                   {
		
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
			z        )                   {
		
		this.backend.x = x; this.backend.y = y; this.backend.z = z;
		return this;
	}
	
	subA(value        )                   {
		
		this.backend.x -= value;
		this.backend.y -= value;
		this.backend.z -= value;
		
		return this;
	}
	
	subB(v                  )                   {
		
		this.backend.x -= v.backend.x;
		this.backend.y -= v.backend.y;
		this.backend.z -= v.backend.z;
		
		return this;
	}
	
	toZeroVector()                   {
		return this.setDataD(0, 0, 0);
	}
};

class AEClassVector4D {
	
	                                
	                           
	                           
	
	          
	          
	          
	          
	
	constructor(
			backend                        ,
			_xyz                      ) {
		
		if(backend instanceof ae.math.ReadOnlyBackend) {
			
			this.backend  = backend;
			this.xyz      = _xyz || new ae.math.Vector3D(backend);
			this.readOnly = this;
			
		} else {
			
			this.backend  = backend;
			this.xyz      = new ae.math.Vector3D(backend);
			this.readOnly = new AEClassVector4D(
				new ae.math.ReadOnlyBackend(backend), this.xyz.readOnly);
		}
		
		this.x = 0;
		this.y = 0;
		this.z = 0;
		this.w = 0;
	}
	
	addA(value        )                   {
		
		this.backend.x += value;
		this.backend.y += value;
		this.backend.z += value;
		this.backend.w += value;
		
		return this;
	}
	
	addB(v                  )                   {
		
		this.backend.x += v.backend.x;
		this.backend.y += v.backend.y;
		this.backend.z += v.backend.z;
		this.backend.w += v.backend.w;
		
		return this;
	}
	
	cloneConst()                   {
		
		return new AEClassVector4D(new ae.math.ReadOnlyBackend(
			new ae.math.StaticBackend(this.backend)));
	}
	
	cloneDeep()                   {
		
		return new AEClassVector4D(this.backend);
	}
	
	cloneStatic()                   {
		
		return new AEClassVector4D(new ae.math.StaticBackend(this.backend));
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

	copyStaticValues()                   {
		
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
		
		return new AEClassVector4D(new ae.math.ReadOnlyBackend(
			new ae.math.StaticBackend(x, y, z, w)));
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
		
		return new AEClassVector4D(new ae.math.StaticBackend(x, y, z, w));
	}

	divA(value        )                   {
		
		this.backend.x /= value;
		this.backend.y /= value;
		this.backend.z /= value;
		this.backend.w /= value;
		
		return this;
	}
	
	divB(v                  )                   {
		
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
	
	setDataA(src                  )                   {
		return this.setDataB(src.backend);
	}
	
	setDataB(src                       )                   {
		return this.setDataD(src.x, src.y, src.z, src.w);
	}
	
	setDataC(
			src                  ,
			offset         = 0)                   {
		
		return this.setDataD(
			src[offset + 0], src[offset + 1], src[offset + 2], src[offset + 3]);
	}
	
	setDataD(
			x        ,
			y        ,
			z        ,
			w        )                   {
		
		this.backend.x = x;
		this.backend.y = y;
		this.backend.z = z;
		this.backend.w = w;
		
		return this;
	}
	
	subA(value        )                   {
		
		this.backend.x -= value;
		this.backend.y -= value;
		this.backend.z -= value;
		this.backend.w -= value;
		
		return this;
	}
	
	subB(v                  )                   {
		
		this.backend.x -= v.backend.x;
		this.backend.y -= v.backend.y;
		this.backend.z -= v.backend.z;
		this.backend.w -= v.backend.w;
		
		return this;
	}
	
	toZeroPoint()                   {
		return this.setDataD(0, 0, 0, 1);
	}
	
	toZeroVector()                   {
		return this.setDataD(0, 0, 0, 0);
	}
};

class AEClassVectorBackend {
	
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

class AEClassAdjacency {
		
	                                         
	                           
	
	constructor(mb                     ) {
		
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

class AEClassMesh {
	
	                      
	                      
	                 
	
	                    
	                    
	                     
	                     
	
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

class AEClassMeshBuilder {
	
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
			this._samples[i] = func(ae.util.mix(begin, end, i / intervalCount));
		
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
			ae.util.mixRev(this._begin, this._end, x) * this._intervalCount;
		const iPos = Math.floor(fPos);
		
		if(iPos < 0) return this._samples[0];
		
		if(iPos >= this._intervalCount)
			return this._samples[this._intervalCount];
		
		return ae.util.mix(
			this._samples[iPos], this._samples[iPos + 1], fPos - iPos);
	}
	
	sampleNearest(x        )         {
		
		return this._samples[ae.util.clampArrayAccess(
			Math.round(
				ae.util.mixRev(this._begin, this._end, x) *
				this._intervalCount),
			this._samples.length)];
	}
}

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
class AEClassPooledHashMap                     
	extends AEClassPooledCollection                      {
	
	      
                       
                       
                            
                    
  
	
	                      
	                      
	                                               
	                                               
	
	// private getters + setters ///////////////////////////////////////////////
	
	get _keys  ()                 {return this._pp.keys;}
	get _values()                 {return this._pp.values;}
	get _used  ()                 {return this._pp.used;}
	
	// private static methods //////////////////////////////////////////////////
	
	static _areKeysEqual(
			key1    ,
			key2    )          {
		
		return !key1 || !key2 ? key1 == key2 : key1.equals(key2);
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
	
	_getKeyPosition(key    )         {
		
		if(!key) return -1;
		
		let pos    = this._getInitialPosition(key);
		let newPos = -1;
		
		// Find the position of the key
		while(this._used[pos] &&
			!AEClassPooledHashMap._areKeysEqual(key, this._keys[pos])) {
			
			// If there's a slot, marked as 'used' but without a key-value-pair,
			// it is stored to optimize the key position later on
			if(!this._keys[pos] && newPos == -1) newPos = pos;
			
			pos = (pos + 1) % this._keys.length;
		}
		
		// Abort if the key couldn't be found
		if(!this._used[pos]) return -1;
		
		// Abort if the position is already the optimal position
		if(newPos == -1) return pos;
		
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
    		key      ,
    		value    )          {
    	
		if(!key) return false;
		
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
	
	_addSingle(element                      )          {
		// $CORRECT_CAST
		return element ? this.setValue(element.key, element.value) : false;
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
			keys:      Array(bucketCount),
			values:    Array(bucketCount),
			used:      Array(bucketCount),
			usedCount: 0,
		}
		
		this.maxLoadFactor = maxLoadFactor;
		this.resizeFactor  = resizeFactor;
		this.keys          = new AEClassHMKeyIterator(this);
		this.values        = new AEClassHMValueIterator(this);
	}
	
	// public getters + setters ////////////////////////////////////////////////
	
	get bufferSize()         {return this._pp.keys.length;}
	get loadFactor()         {return this._getLoadFactor(this.size);}
	
	// public methods //////////////////////////////////////////////////////////
	
	deleteKey(key    )          {
		
		if(!key) return false;
		
		let pos = this._getInitialPosition(key);
		
		// Search position of the key
		while(this._keys[pos] != key || this._used[pos])
			pos = (pos + 1) % this._keys.length;
		
		if(this._keys[pos] != key) return false;
		
		this._pp.keys  [pos] = null;
		this._pp.values[pos] = null;
		this._p .size--;
		
		return true;
	}
	
	forEach(visitor                              ) {
		
		let kvp                       = null;
		
		for(let i = 0; i < this.bufferSize; i++) {
			
			if(!this._used[i])            continue;
			if(!kvp || kvp.keepReference) kvp = ae.col._p.HM_KVP_POOL.provide();
			
			kvp.key   = this._keys[i];
			kvp.value = this._values[i];
		}
		
		if(kvp && !kvp.keepReference) ae.col._p.HM_KVP_POOL.free(kvp);
	}
	
	getValue(
			key             ,
			defaultValue     = null)     {
		
		const pos = this._getKeyPosition(key);
		return pos >= 0 ? this._values[pos] : defaultValue;
	}
	
	hasKey(key    )          {
		return this._getKeyPosition(key) >= 0;
	}
	
	// Returns 'true' when a new key has been inserted
	setValue(
			key      ,
			value    )          {
		
		return this._setValue(key, value);
	}
	
	tryGetValue(
			key      ,
			value           )          {
		
		const pos = this._getKeyPosition(key);
		
		if(pos >= 0) {
			value[0] = this._values[pos];
			return true;
		} else {
			return false;
		}
	}
}
class AEClassPooledHashSet                  
	extends AEClassPooledCollection    {
	
	// The value-component is always set to 'null'
	                                           
	
	                      
	                      
	
	_addSingle(element    )          {
		return this.insert(element);
	}
	
	constructor(backend                                   ) {
		
		super();
		
		this._hashMap      = backend ? backend : new AEClassPooledHashMap();
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
	
	exists(element    )          {
		return this._hashMap.hasKey(element);
	}

	forEach(visitor            )       {
		this._hashMap.keys.forEach(visitor);
	}
	
	insert(element    )          {
		return this._hashMap.setValue(element, null);
	}

	remove(element    )          {
		return this._hashMap.deleteKey(element);
	}
}
class AEClassPooledLinkedList    extends AEClassPooledCollection    {
	
	      
                                
                                
  
	
	// private getters + setters ///////////////////////////////////////////////
	
	get _first()                         {return this._pp.first;}
	get _last ()                         {return this._pp.last;}
	
	// private methods /////////////////////////////////////////////////////////
	
	_insert(element    )                        {
		
		const node = ae.col._p.LL_NODE_POOL.provide();
		
		node.content = element;
		
		this._p.size++;
		if(this.size == 1) this._pp.first = this._pp.last = node;
		
		return node;
	}
	
	// protected methods ///////////////////////////////////////////////////////
	
	_addSingle(element    )          {
		this.insertAtEnd(element);
		return true;
	}
	
	_clear()       {
		
		// Cannot reset the whole node pool, as there might be nodes used by
		// other collections
		let node = this._first;
		while(node) {
			ae.col._p.LL_NODE_POOL.free(node);
			node = node.next;
		}
		
		this._pp.first = this._pp.last = null;
		this._p. size  = 0;
	}
	
	// internal methods ////////////////////////////////////////////////////////
	
	_insertAfter(
			element    ,
			refNode                       )                        {
		
		const newNode = this._insert(element);
		
		// Assume the list contains at least one element. Otherwise a reference
		// node cannot exist.
		newNode.insertAfter(refNode);
		if(refNode == this._last) this._pp.last = newNode;
		
		return newNode;
	}
	
	_insertBefore(
    		element    ,
    		refNode                       )                        {

		const newNode = this._insert(element);
		
		// Assume the list contains at least one element. Otherwise a reference
		// node cannot exist.
		newNode.insertBefore(refNode);
		if(refNode == this._first) this._pp.first = newNode;
		
		return newNode;
	}
	
	_remove(node                        )          {
		
		if(!node) return false;
		
		node.remove();
		
		if(node == this._first) this._pp.first = node.next;
		if(node == this._last)  this._pp.last  = node.prev;
		
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
	
	get first()     {
		
		if(this.empty) throw "List is empty";
		
		// $CORRECT_CAST
		return this._first ? this._first.content : null;
	}
	
	get last()     {
		
		if(this.empty) throw "List is empty";
		
		// $CORRECT_CAST
		return this._last  ? this._last .content : null;
	}
	
	// public methods //////////////////////////////////////////////////////////
	
	finalize()       {
		this._clear();
	}
	
	forEach(visitor            )       {
		// $NOT_NULL + CORRECT_CAST
		if(!this.empty) this._first.forEach((node) => visitor(node.content));
	}
	
	forEachRev(visitor            )       {
		// $NOT_NULL + CORRECT_CAST
		if(!this.empty) this._last.forEachRev((node) => visitor(node.content));
	}
	
	insertAtEnd(element    )                        {
		
		if(this.empty) {
			this._insert(element);
		} else {
			// $NOT_NULL
			this._insertAfter(element, this._last);
		}
		
		// $NOT_NULL
		return this._last;
	}
	
	insertAtFront(element    )                        {
		
		if(this.empty) {
			this._insert(element);
		} else {
			// $NOT_NULL
			this._insertBefore(element, this._first);
		}
		
		// $NOT_NULL
		return this._first;
	}
	
	removeAll(element    )          {
		
		let   node    = this._first;
		const oldSize = this.size;
		
		while(node) {
			if(node.content == element) this._remove(node);
			node = node.next;
		}
		
		return this.size < oldSize;
	}

	removeFirstA()          {
		return this._remove(this._first);
	}
	
	removeFirstB(element    )          {
		
		let node = this._first;
		
		while(node) {
			if(node.content == element) return this._remove(node);
			node = node.next;
		}
		
		return false;
	}

	removeLastA()          {
		return this._remove(this._last);
	}
	
	removeLastB(element    )          {
		
		let node = this._last;
		
		while(node) {
			if(node.content == element) return this._remove(node);
			node = node.prev;
		}
		
		return false;
	}
}

class AEClassPooledOrderedSet                  
	extends AEClassPooledCollection    {
	
	                                                         
	                                     
	
	                      
	                      
	
	// private methods /////////////////////////////////////////////////////////
	
	// returns 'true' if removal took place
	_removeIfNecessary(element    )          {
		
		const node = this._hashMap.getValue(element);
		if(node) this._list._remove(node);
		
		return node !== null;
	}
	
	// protected methods ///////////////////////////////////////////////////////
	
	_addSingle(element    )          {
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
	
	exists(element    )          {
		return this._hashMap.hasKey(element);
	}
	
	forEach(visitor            ) {
		this._list.forEach(visitor);
	}
	
	forEachRev(visitor            ) {
		this._list.forEachRev(visitor);
	}
	
	insertAfter(
			element       ,
			refElement    )          {
		
		const replace = this._removeIfNecessary(element);
		
		this._hashMap.setValue(
			element,
			this._list._insertAfter(
				// $NOT_NULL
				element, this._hashMap.getValue(refElement)));
		
		return !replace;
	}

	insertAtEnd(element    )          {
		
		const replace = this._removeIfNecessary(element);
		
		this._hashMap.setValue(element, this._list.insertAtEnd(element));
		return !replace;
	}

	insertAtFront(element    )          {
		
		const replace = this._removeIfNecessary(element);
		
		this._hashMap.setValue(element, this._list.insertAtFront(element));
		return !replace;
	}

	insertBefore(
			element       ,
			refElement    )          {
		
		const replace = this._removeIfNecessary(element);
		
		this._hashMap.setValue(
			element,
			this._list._insertBefore(
				// $NOT_NULL
				element, this._hashMap.getValue(refElement)));
		
		return !replace;
	}

	remove(element    )          {
		
		const node = this._hashMap.getValue(element);
		
		if(node) {
			this._hashMap.deleteKey(element);
			this._list   ._remove(node);
		}
		
		return node !== null;
	}
	
	tryInsertAfter(
			element       ,
			refElement    )          {
		
		if(!this._hashMap.hasKey(element)) {
			this._hashMap.setValue(
				element,
				this._list._insertAfter(
					// $NOT_NULL
					element, this._hashMap.getValue(refElement)));
			return true;
		} else {
			return false;
		}
	}
	
	tryInsertAtEnd(element    )          {
		
		if(!this._hashMap.hasKey(element)) {
			this._hashMap.setValue(element, this._list.insertAtEnd(element));
			return true;
		} else {
			return false;
		}
	}

	tryInsertAtFront(element    )          {
		
		if(!this._hashMap.hasKey(element)) {
			this._hashMap.setValue(element, this._list.insertAtFront(element));
			return true;
		} else {
			return false;
		}
	}
	
	tryInsertBefore(
			element       ,
			refElement    )          {
		
		if(!this._hashMap.hasKey(element)) {
			this._hashMap.setValue(
				element,
				this._list._insertBefore(
					// $NOT_NULL
					element, this._hashMap.getValue(refElement)));
			return true;
		} else {
			return false;
		}
	}
}

class AEClassUpdateEvent    extends AEClassEvent                           {
	
	                              
	
	constructor(
			state                        ,
			host    ) {
		
		super(host);
		
		this.state = state;
		Object.freeze(this);
	}
	
	get time     ()         {return this.state.time;}
	get timeDelta()         {return this.state.timeDelta;}
}
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

class AEClassStaticBackend extends AEClassVectorBackend {
	
	                     
	
	constructor(
			xOrBackend                                ,
			y                  = 0,
			z                  = 0,
			w                  = 0) {
		
		super();
		
		this._data = xOrBackend instanceof ae.math.VectorBackend ?
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
			UpdateEvent: AEClassUpdateEvent,
		},
		
		AbstractEngine: AEClassAbstractEngine,
	},
	
	event: {
		
		Event:          AEClassEvent,
		Listener:       AEClassListener, // implemented in Event.js
		NotifyEvent:    AEClassNotifyEvent,
		SignalEndPoint: AEClassSignalEndPoint,
		SignalSource:   AEClassSignalSource,
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
	
	util: {
		
		// Classes
		CachedObject:    AEClassCachedObject,
		GrowingList:     AEClassGrowingList,
		SampledFunction: AEClassSampledFunction,
		
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
		mix: aeFuncMix,
		mixRev: aeFuncMixRev,
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
