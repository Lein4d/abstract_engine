
// ae.core.RenderState
class AEClassRenderState extends AEClassJavaObject {
	
	_p: {
		frameIndex:  number;
		absTime:     number;
		time:        number;
		timeDelta:   number;
		sceneGraph: (ae.core.SceneGraph | null);
	}
	
	_dirLights:   ae.col.PooledLinkedList<ae.sg.Instance>;
	_pointLights: ae.col.PooledLinkedList<ae.sg.Instance>;
	
	onNewFrame: ae.event.NotifyEvent;
	
	constructor() {
		
		super();
		
		this._dirLights   = new AEClassPooledLinkedList();
		this._pointLights = new AEClassPooledLinkedList();
		
		this._p = {
			frameIndex: -1,
			absTime:    0,
			time:       0,
			timeDelta:  0,
			sceneGraph: null
		};
		
		this.onNewFrame = new AEClassNotifyEvent(this);
		
		Object.freeze(this);
	}
	
	get frameIndex(): number {return this._p.frameIndex;}
	get absTime   (): number {return this._p.absTime;}
	get time      (): number {return this._p.time;}
	get timeDelta (): number {return this._p.timeDelta;}
	
	get sceneGraph(): (ae.core.SceneGraph | null) {return this._p.sceneGraph;}
	
	// internal methods ////////////////////////////////////////////////////////
	
	_applyUniformsToShader(): void {
		
		//glUniformMatrix4fv(_shader.uniMatModelView,  false, _matModelViewData);
		//glUniformMatrix4fv(_shader.uniMatProjection, false, _matProjectionData);
		//glUniformMatrix3fv(_shader.uniMatNormal,     false, _matNormalData);
		//
		//glUniform1f(_shader.uniObjectId, _objectId);
		//
		//glUniform4fv(_shader.uniDirLights,   _dirLightData);
		//glUniform4fv(_shader.uniPointLights, _pointLightData);
		//
		//glUniform1i(_shader.uniDirLightCount,   _dirLights  .getSize());
		//glUniform1i(_shader.uniPointLightCount, _pointLights.getSize());
	}
	
	_beginNextFrame(
			speed:       number,
			sceneGraph: (ae.core.SceneGraph | null)) {
		
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
	
	_newCamera(projection: ae.math.Matrix4D): void {
		
		//projection.getData(_matProjectionData);
		//
		//_setDirLightData();
		//_setPointLightData();
	}
	
	_newModelInstance(instance: ae.sg.Instance) {
		
		//_objectId = instance.getId();
		//
		//instance.tfToCameraSpace.getData  (_matModelViewData);
		//instance.tfToCameraSpace.getNmData(_matNormalData);
	}
	
	createUpdateEvent(host: ae.JavaObject): ae.core._p.UpdateEvent {
		return new AEClassUpdateEvent(this, host);
	}
}
