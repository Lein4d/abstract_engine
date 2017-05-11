
// ae.material.ShaderProgram
class AEClassShaderProgram extends AEClassJavaObject {
	
	_uniLocations: ae.col.PooledHashMap<AEClassSPUniform, WebGLUniformLocation>;
	_glslShader:   _ae.core.GlslShader;
	
	// private methods /////////////////////////////////////////////////////////
	
	static _assembleFragmentShaderSource(
			uniformsFS:       Iterable<AEClassSPUniformFS>,
			uniformParams:    Iterable<AEClassSPCustomParam>,
    		uniformTextures:  Iterable<AEClassSPCustomTexture>,
			varyings:         Iterable<AEClassSPVarying>,
			lVariables:       Iterable<AEClassSPLocalVariable>,
    		customLVariables: Iterable<AEClassSPLocalVariable>,
			functions:        Iterable<AEClassSPFunction>,
			color:            ae.mat.Node): string {
		
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
		
		console.log(source.join('\n'));
		
		return source.join('\n');
	}
	
	static _assembleVertexShaderSource(
    		uniformsVS: Iterable<AEClassSPUniformVS>,
    		attributes: Iterable<AEClassSPAttribute>,
    		varyings:   Iterable<AEClassSPVarying>): string {
		
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
		
		console.log(source.join('\n'));
		
		return source.join('\n');
	}
	
	static _computeTransDependentShaderComponents(
			components: ae.col.PooledHashSet<_ae.mat.SPComponent>): void {
		
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
			engine:           ae.core.AbstractEngine,
			name:             string,
			uniformsVS:       Iterable<_ae.mat.SPUniformVS>,
			uniformsFS:       Iterable<_ae.mat.SPUniformFS>,
			uniformParams:    Iterable<_ae.mat.SPCustomParam>,
    		uniformTextures:  Iterable<_ae.mat.SPCustomTexture>,
    		attributes:       Iterable<_ae.mat.SPAttribute>,
			varyings:         Iterable<_ae.mat.SPVarying>,
			lVariables:       Iterable<_ae.mat.SPLocalVariable>,
    		customLVariables: Iterable<_ae.mat.SPLocalVariable>,
			functions:        Iterable<_ae.mat.SPFunction>,
			color:            ae.mat.Node): AEClassGlslShader {

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
    		engine: ae.core.AbstractEngine,
    		name: string,
    		components: ae.col.PooledHashSet<_ae.mat.SPComponent>,
    		customLVariables: ae.col.PooledLinkedList<_ae.mat.SPLocalVariable>,
    		color: ae.mat.Node) {
		
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
	
	getUniformLocation(uniform: _ae.mat.SPUniform): (WebGLUniformLocation | null) {
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
	
	_name:     string;
	_index:    number;
	_glslLine: string;
	
	// internal constructor ////////////////////////////////////////////////////
	
	constructor(
			name:     string,
			index:    number,
			glslLine: string) {
		
		super();
		
		this._name     = name;
		this._index    = index;
		this._glslLine = glslLine;
		
		Object.freeze(this);
	}
}

// ae.material.ShaderProgram$Function
class AEClassSPFunction extends AEClassSPComponent {

	_returnType: AEClassGlslType;
	_paramTypes: Array<AEClassGlslType>;
	_glslLines:  Array<string>;
	_glslName:   string;
	
	// internal constructor ////////////////////////////////////////////////////
	
	constructor(
			name:          string,
			returnType:    AEClassGlslType,
			paramTypes:    Array<AEClassGlslType>,
			... glslLines: Array<string>) {
		
		super();
		
		this._returnType = returnType;
		this._paramTypes = paramTypes;
		this._glslLines  = glslLines;
		this._glslName   = name;
		
		Object.freeze(this);
	}
	
	// internal methods ////////////////////////////////////////////////////////
	
	_createNodeTemplate(): ae.mat.NodeTemplate {
		
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
	
	_glslLine: string;
	_glslName: string;
	_type:     AEClassGlslType;
	
	// internal constructor ////////////////////////////////////////////////////
	
	constructor(
			name:     string,
			type:     AEClassGlslType,
			glslLine: string) {
		
		super();
		
		this._glslLine = glslLine;
		this._glslName = name;
		this._type     = type;
		
		Object.freeze(this);
	}
}

// ae.material.ShaderProgram$Uniform
class AEClassSPUniform extends AEClassSPComponent {
	
	_glslName: string;
	_glslLine: string;

	// protected constructor ///////////////////////////////////////////////////
	
	constructor(
			glslName: string,
			glslLine: string) {
		
		super();
		
		this._glslName = glslName;
		this._glslLine = glslLine;
	}

	// internal methods ////////////////////////////////////////////////////////
	
	_getCurrentLocation(
			gl:      WebGLRenderingContext,
			program: WebGLProgram): WebGLUniformLocation {
		
		return gl.getUniformLocation(program, this._glslName);
	}
}

// ae.material.ShaderProgram$CustomUniformParam
class AEClassSPCustomParam extends AEClassSPUniform {
	
	_name: ae.util.String;
	_type: AEClassGlslType;
	
	// internal constructor ////////////////////////////////////////////////////
	
	constructor(
			name: string,
			type: AEClassGlslType) {
		
		super(
			"u_par_" + name,
			"uniform highp " + type.glslName + " u_par_" + name + ";");
		
		this._name = new AEClassString(name);
		this._type = type;
		
		Object.freeze(this);
	}
}

// ae.material.ShaderProgram$CustomUniformTexture
class AEClassSPCustomTexture extends AEClassSPUniform {
	
	_name: ae.util.String;
	
	// internal constructor ////////////////////////////////////////////////////
	
	constructor(name: string) {
		
		super("u_s2D_" + name, "uniform sampler2D u_s2D_" + name + ";");
		
		this._name = new AEClassString(name);
		Object.freeze(this);
	}
}

// ae.material.ShaderProgram$UniformFS
class AEClassSPUniformFS extends AEClassSPUniform {
	
	// internal constructor ////////////////////////////////////////////////////
	
	constructor(
			name:     string,
			glslLine: string) {
		
		super(name, glslLine);
		Object.freeze(this);
	}
}

// ae.material.ShaderProgram$UniformVS
class AEClassSPUniformVS extends AEClassSPUniform {
	
	// internal constructor ////////////////////////////////////////////////////
	
	constructor(
			name:     string,
			glslLine: string) {
		
		super(name, glslLine);
		Object.freeze(this);
	}
}

// ae.material.ShaderProgram$Varying
class AEClassSPVarying extends AEClassSPComponent {
	
	_glslLineDeclVS: string;
	_glslLineDeclFS: string;
	_glslLineInit:   string;
	_glslName:       string;
	_type:           AEClassGlslType;
	
	// internal constructor ////////////////////////////////////////////////////
	
	constructor(
			name: string,
			type: AEClassGlslType,
			glslLineDecl: string,
			glslLineInit: string) {
		
		super();
		
		this._glslLineDeclVS = "varying " + glslLineDecl;
		this._glslLineDeclFS = "varying " + glslLineDecl;
		this._glslLineInit   = glslLineInit;
		this._glslName       = name;
		this._type           = type;
		
		Object.freeze(this);
	}
}
