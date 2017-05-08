
function aeFuncRenderLoopCallback(engine: ae.core.AbstractEngine) {
	
	window.requestAnimationFrame(
		function() {aeFuncRenderLoopCallback(engine)});
	
	engine._render();
}

// ae.core.AbstractEngine
class AEClassAbstractEngine {
	
	_p: {
		sceneGraph: (ae.core.SceneGraph | null);
		camera:     (ae.sg.Camera       | null);
	}
	
	_projection: ae.math.Matrix4D;
	
	gl:         WebGLRenderingContext;
	state:      ae.core._p.RenderState;
	background: ae.math.Vector3D;
	
	// only temporary
	uniLocProjection: WebGLUniformLocation;
	uniLocModelView:  WebGLUniformLocation;
	
	// internal methods ////////////////////////////////////////////////////////
	
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
				false);
	}
	
	// public constructor //////////////////////////////////////////////////////
	
	constructor(
			canvas:           HTMLCanvasElement,
			uniLocProjection: WebGLUniformLocation,
			uniLocModelView:  WebGLUniformLocation) {
		
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
	
	get camera    (): (ae.sg.Camera       | null) {return this._p.camera;}
	get sceneGraph(): (ae.core.SceneGraph | null) {return this._p.sceneGraph;}
	
	set camera(camera: (ae.sg.Camera | null)): void {
		this._p.camera = camera;
	}
	
	set sceneGraph(sceneGraph: (ae.core.SceneGraph | null)): void {
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
