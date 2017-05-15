
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
	
	_display:    _ae.core.Display;
	_projection: ae.math.Matrix4D;
	
	canvas:     HTMLCanvasElement;
	gl:         WebGLRenderingContext;
	state:      ae.core._p.RenderState;
	background: ae.math.Vector3D;
	display:    _ae.core.ScreenLayer;
	input:      _ae.core.InputManager;
	fullscreen: ae.util.ToggleValue;
	
	// internal methods ////////////////////////////////////////////////////////
	
	_addMaterial(material: ae.mat.Material) {
		// TODO
	}
	
	_render() {
		
		const cs     = getComputedStyle(this.canvas);
		const width  = parseInt(cs.getPropertyValue("width"));
		const height = parseInt(cs.getPropertyValue("height"));
		
		this.canvas.width  = width;
		this.canvas.height = height;
		
		this._display.setSize (width, height);
		this.gl.viewport(0, 0, width, height);
		
		this.state._beginNextFrame(1, this.sceneGraph);
		
		this.background.copyStaticValues();
		this.gl.clearColor(
			this.background.x, this.background.y, this.background.z, 1.0);
		
		this.input._processInput();
		
		if(this.sceneGraph !== null) this._display.render(this.gl);
	}
	
	// public constructor //////////////////////////////////////////////////////
	
	constructor(
			canvas:      HTMLCanvasElement,
			fitToParent: boolean = true) {
		
		const tempGL     = canvas.getContext("webgl");
		const fullscreen = new AEClassToggleValue(
			// $NOT_NULL
			(state) => canvas.requestFullscreen(),
			// $NOT_NULL
			(state) => document.exitFullscreen());
		
		if(!tempGL) throw "No WebGL context available";
		
		this._display    = new AEClassDisplay(this, false);
		this._projection = new AEClassMatrix4D();
		this._p          = {
			sceneGraph: null,
			camera:     null,
		};
		
		this.canvas     = canvas;
		this.gl         = tempGL;
		this.state      = new ae.core._p.RenderState();
		this.background = ae.math.BLACK.xyz.cloneStatic();
		this.display    = this._display._layer;
		this.input      = new AEClassInputManager(canvas, this._display, false);
		this.fullscreen = fullscreen;
		
		if(fitToParent) {
			canvas.style.border = "none";
			canvas.style.left   = "0px";
			canvas.style.top    = "0px";
			canvas.style.width  = "100%";
			canvas.style.height = "100%";
		}
		
		//window.onkeydown = function(event) {
		//	fullscreen.toggle();
		//};
		
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
