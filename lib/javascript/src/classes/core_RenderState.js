
// ae.core.RenderState
class AEClassRenderState extends AEClassJavaObject {
	
	_p: {
		frameIndex: number;
		absTime:    number;
		time:       number;
		timeDelta:  number;
		sceneGraph: (ae.core.SceneGraph | null);
		shader:     _ae.core.GlslShader;
	}
	
	_matModelViewData:  Float32Array;
	_matProjectionData: Float32Array;
	_matNormalData:     Float32Array;
	_dirLightData:      Float32Array;
	_pointLightData:    Float32Array;
	
	_dirLights:   ae.col.PooledLinkedList<ae.sg.Instance>;
	_pointLights: ae.col.PooledLinkedList<ae.sg.Instance>;
	
	onNewFrame: ae.event.NotifyEvent<_ae.core.RenderState>;
	
	// private methods /////////////////////////////////////////////////////////
	
	_setDirLightData(): void {
		
		let offset = 0;
		
		this._dirLights.forEach((i) => {
			
			// $CORRECT_CAST
			const light: ae.sg.DirectionalLight = i.entity;
			const dotBias                       = light.dotBias.activeValueNN;
			
			// Apply the transformation to the light direction and copy it into
			// the data array
			light.direction.activeValueNN.getDataArray(this._dirLightData, offset);
			i.tfToCameraSpace.applyToDirVectorArray(this._dirLightData, offset);
			
			// Copy the color to the data array
			light.color.activeValueNN.getDataArray(this._dirLightData, offset + 4);
			
			// Split the bias data and copy it to the data array
			this._dirLightData[offset + 3] = dotBias[0];
			this._dirLightData[offset + 7] = dotBias[1];

			offset += 8;
		});
	}
	
	_setPointLightData(): void {
		
		let offset = 0;
		
		this._pointLights.forEach((i) => {
			
			// $CORRECT_CAST
			const light: ae.sg.PointLight = i.entity;
			const attenuation             = light.attenuation.activeValueNN;
			
			// Apply the transformation to the light position and copy it into
			// the data array
			i.tfToCameraSpace.applyToOriginArrayExt(this._pointLightData, 3, offset);
			
			// Copy the color to the data array
			light.color.activeValueNN.getDataArray(this._pointLightData, offset + 4);
			
			// Split the attenuation data and copy it to the data array
			this._pointLightData[offset + 3] = attenuation[0];
			this._pointLightData[offset + 7] = attenuation[1];
			
			offset += 8;
		});
	}
	
	// internal constructor ////////////////////////////////////////////////////
	
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
	
	get frameIndex(): number {return this._p.frameIndex;}
	get absTime   (): number {return this._p.absTime;}
	get time      (): number {return this._p.time;}
	get timeDelta (): number {return this._p.timeDelta;}
	
	get sceneGraph(): (ae.core.SceneGraph | null) {return this._p.sceneGraph;}
	
	// internal methods ////////////////////////////////////////////////////////
	
	_applyUniformsToShader(gl: WebGLRenderingContext): void {
		
		gl.uniformMatrix4fv(this._p.shader._uniMatModelView,  false, this._matModelViewData);
		gl.uniformMatrix4fv(this._p.shader._uniMatProjection, false, this._matProjectionData);
		gl.uniformMatrix3fv(this._p.shader._uniMatNormal,     false, this._matNormalData);
		
		//glUniform1f(_shader.uniObjectId, _objectId);
		
		gl.uniform4fv(this._p.shader._uniDirLights,   this._dirLightData);
		gl.uniform4fv(this._p.shader._uniPointLights, this._pointLightData);
		
		gl.uniform1i(this._p.shader._uniDirLightCount,   this._dirLights  .size);
		gl.uniform1i(this._p.shader._uniPointLightCount, this._pointLights.size);
	}
	
	_beginNextFrame(
			speed:       number,
			sceneGraph: (ae.core.SceneGraph | null)) {
		
		const absTimeNew = Date.now();
		
		if(this.frameIndex === -1) {
			
			// Prevent a huge timeDelta in the first frame
			this._p.absTime = absTimeNew;
			
			//for(let i = 0; i < _fpsCounters.length; i++)
			//	_fpsCounters[i] =
			//		new FpsCounter((i * 1000) / _fpsCounters.length);
		}
		
		this._p.frameIndex++;
		this._p.timeDelta  = speed * (absTimeNew - this.absTime);
		this._p.time       = this.frameIndex === 0 ? 0 : this.time + this.timeDelta;
		this._p.absTime    = absTimeNew;
		this._p.sceneGraph = sceneGraph;
		
		this.onNewFrame.fire();
		
		if(this.sceneGraph !== null)
			this.sceneGraph._prepareRendering(
				this._dirLights, this._pointLights);
	}
	
	_newCamera(projection: ae.math.Matrix4D): void {
		
		projection.getDataArray(this._matProjectionData);
		
		this._setDirLightData();
		this._setPointLightData();
	}
	
	_newGlslShader(glslShader: _ae.core.GlslShader): void {
		this._p.shader = glslShader;
	}
	
	_newModelInstance(instance: ae.sg.Instance): void {
		
		//_objectId = instance.getId();
		
		instance.tfToCameraSpace.getDataArray(this._matModelViewData);
		instance.tfToCameraSpace.getNmData   (this._matNormalData);
	}
	
	createUpdateEvent(host: ae.JavaObject): ae.core._p.UpdateEvent {
		return new AEClassUpdateEvent(this, host);
	}
}
