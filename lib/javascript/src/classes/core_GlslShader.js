
// ae.core.GlslShader
class AEClassGlslShader extends AEClassJavaObject {
	
	_program: WebGLProgram;
	
	_uniMatModelView:    (WebGLUniformLocation | null);
	_uniMatProjection:   (WebGLUniformLocation | null);
	_uniMatNormal:       (WebGLUniformLocation | null);
	_uniObjectId:        (WebGLUniformLocation | null);
	_uniDirLights:       (WebGLUniformLocation | null);
	_uniDirLightCount:   (WebGLUniformLocation | null);
	_uniPointLights:     (WebGLUniformLocation | null);
	_uniPointLightCount: (WebGLUniformLocation | null);
	
	engine: ae.core.AbstractEngine;
	
	// private methods /////////////////////////////////////////////////////////
	
	_createShader(
			gl:           WebGLRenderingContext,
			shaderType:   number,
			typeName:     string,
			program:      WebGLProgram,
			shaderSource: string): boolean {
		
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
			engine:                 ae.core.AbstractEngine,
			name:                   string,
			vsSource:               string,
			fsSource:               string,
			uniNameMatModelView:    string,
			uniNameMatProjection:   string,
			uniNameMatNormal:       string,
			uniNameObjectId:        string,
			uniNameDirLights:       string,
			uniNameDirLightCount:   string,
			uniNamePointLights:     string,
			uniNamePointLightCount: string,
			attributeNames:         Array<string | null>) {
		
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
	
	_bind(): void {
		this.engine.gl.useProgram(this._program);
	}
	
	_getUniformLocation(uniName: string): (WebGLUniformLocation | null) {
		return this._program !== 0 ?
			this.engine.gl.getUniformLocation(this._program, uniName) : null;
	}
}