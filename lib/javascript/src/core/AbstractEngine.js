
ae.AbstractEngine = class AbstractEngine {
	
	gl: WebGLRenderingContext;
	
	constructor(canvas: HTMLCanvasElement) {
		
		const glContext = canvas.getContext("webgl");
		
		if(!glContext) throw "No Web-GL context available";
		
		this.gl = glContext || new WebGLRenderingContext();
		
		// Wait for WebGLRenderingContext type in flow
		
		//this.gl.viewport(0, 0, canvas.width, canvas.height);
	}
};
