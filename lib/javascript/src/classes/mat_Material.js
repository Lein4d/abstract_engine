
// ae.material.Material
class AEClassMaterial extends AEClassJavaObject {
	
	_glslShader: AEClassGlslShader;
	
	_textures: ae.col.PooledHashMap<ae.util.String, _ae.mat.SPCustomTexture>;
	_params:   ae.col.PooledHashMap<ae.util.String, _ae.mat.SPCustomParam>;
	
	engine:   ae.core.AbstractEngine;
	onUpdate: ae.core._p.UpdateEvent;

	constructor(
			engine:    ae.core.AbstractEngine,
			name:      string,
			variables: ae.col.PooledHashSet<_ae.mat.MatBuiltInVariable>,
			functions: ae.col.PooledHashSet<_ae.mat.MatBuiltInFunction>,
			params:    Iterable<_ae.mat.MatCustomParam>,
			textures:  Iterable<_ae.mat.MatCustomTexture>,
			values:    ae.col.PooledLinkedList<_ae.mat.MatValue>,
			color:     ae.mat.Node) {
	
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
			name:      ae.util.String,
			... value: Array<number>): ae.mat.Material {
		
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
	update(): void {
		this.onUpdate.fire();
	}
	
	_use(): void {
		
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
	
	_p: {
		location: WebGLUniformLocation;
		value:    (Array<number> | null);
	}
	
	_node:     ae.mat.Node;
	_uniform: _ae.mat.SPCustomParam;
	
	// internal constructor ////////////////////////////////////////////////////
	
	constructor(
			name: string,
			type: _ae.mat.GlslType) {
		
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
	
	_useParam(gl: WebGLRenderingContext): void {

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
	
	_p: {
		location: WebGLUniformLocation;
		//texture:  Texture
	}
	
	_node:     ae.mat.Node;
	_uniform: _ae.mat.SPCustomTexture;
	
	// internal constructor ////////////////////////////////////////////////////
	
	constructor(name: string) {
		
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
			gl:   WebGLRenderingContext,
			slot: number): void {
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
	
	_nodeTemplate:  ae.mat.NodeTemplate;
	_function:     _ae.mat.SPFunction;
	
	// internal constructor ////////////////////////////////////////////////////
	
	constructor(func: _ae.mat.SPFunction) {
		
		super();
		
		this._nodeTemplate = func._createNodeTemplate();
		this._function     = func;
		
		Object.freeze(this);
	}
}

// ae.material.Material$BuiltInVariable
class AEClassMatBuiltInVariable extends AEClassJavaObject {
	
	_node:       ae.mat.Node;
	_component: _ae.mat.SPComponent;
	
	// internal constructor ////////////////////////////////////////////////////
	
	constructor(variable: (_ae.mat.SPLocalVariable | _ae.mat.SPVarying)) {
		
		super();
		
		this._node = AEClassNode._createFromType(variable._glslName, variable._type);
		this._component = variable;
		
		Object.freeze(this);
	}
}

// ae.material.Material$Value
class AEClassMatValue extends AEClassJavaObject {
	
	_node:       ae.mat.Node;
	_lVariable: _ae.mat.SPLocalVariable;
	
	// internal constructor ////////////////////////////////////////////////////
	
	constructor(
			name:       string,
			type:       _ae.mat.GlslType,
			definition:  ae.mat.Node) {
		
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
