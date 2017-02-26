
function renderLoopCallback(engine: ae.core.AbstractEngine) {
	
	window.requestAnimationFrame(
		function() {renderLoopCallback(engine)});
	
	engine._render();
}

class AEClassAbstractEngine {
	
	gl:         WebGLRenderingContext;
	state:      ae.core._p.RenderState;
	background: ae.math.Vector3D;
	
	constructor(canvas: HTMLCanvasElement) {
		
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
