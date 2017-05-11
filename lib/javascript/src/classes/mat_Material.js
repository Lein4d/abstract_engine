
// ae.material.Material
class AEClassMaterial extends AEClassJavaObject {
	
	_glslShader: AEClassGlslShader;
	
	_textures: ae.col.PooledHashMap<ae.util.String, _ae.mat.MatCustomTexture>;
	_params:   ae.col.PooledHashMap<ae.util.String, _ae.mat.MatCustomParam>;
	
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
		
		params.forEach((i) => {
			i._location = program.getUniformLocation(i._uniform);
			this._params.setValue(i._uniform._name, i);
		});
		textures.forEach((i) => {
			i._location = program.getUniformLocation(i._uniform);
			this._textures.setValue(i._uniform._name, i);
		});
		
		Object.freeze(this);
	}
	
	setParam(
			name:   string,
			value: (Array<number> | null)): ae.mat.Material {
		
		this._params.getValueA(new AEClassString(name))._value = value;
		return this;
	}
	
	setTexture(
			name:     string,
			texture: (ae.core.Texture | null)): this {
		
		this._textures.getValueA(new AEClassString(name))._texture = texture;
		return this;
	}
	
	update(): void {
		this.onUpdate.fire();
	}
	
	_use(): void {
		
		this._glslShader._bind();
		
		this.engine.state._newGlslShader(this._glslShader);
		this.engine.state._applyUniformsToShader(this.engine.gl);
		
		let curSlot = 0;
		this._params  .values.forEach((i) => i._useParam  (this.engine.gl));
		this._textures.values.forEach((i) => i._useTexture(this.engine.gl, curSlot++));
	}
}

// ae.material.Material$CustomParam
class AEClassMatCustomParam extends AEClassJavaObject {
	
	_p: {
		location: (WebGLUniformLocation | null);
		value:    (Array<number>        | null);
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
			location: null,
			value:    null,
		};
		
		this._node = AEClassNode._createFromType(this._uniform._glslName, type);
		
		Object.freeze(this);
	}
	
	// internal getters + setters //////////////////////////////////////////////
	
	get _location(): (WebGLUniformLocation | null) {return this._p.location;}
	get _value   (): (Array<number>        | null) {return this._p.value;}
	
	set _location(location: (WebGLUniformLocation | null)): void {
		this._p.location = location;
	}
	
	set _value(value: (Array<number> | null)): void {
		this._p.value = value;
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
		location: (WebGLUniformLocation | null);
		texture:  (ae.core.Texture      | null);
	}
	
	_node:     ae.mat.Node;
	_uniform: _ae.mat.SPCustomTexture;
	
	// internal constructor ////////////////////////////////////////////////////
	
	constructor(name: string) {
		
		super();
		
		this._uniform = new AEClassSPCustomTexture(name);
		this._node    = AEClassNode._createFromType(this._uniform._glslName, _aeEnumGlslType.TEX2);
		this._p       = {
			location: null,
			texture:  null,
		};
		
		Object.freeze(this);
	}
	
	// internal getters + setters //////////////////////////////////////////////
	
	get _location(): (WebGLUniformLocation | null) {return this._p.location;}
	get _texture (): (ae.core.Texture      | null) {return this._p.texture;}
	
	set _location(location: (WebGLUniformLocation | null)): void {
		this._p.location = location;
	}
	
	set _texture(texture: (ae.core.Texture | null)): void {
		this._p.texture = texture;
	}
	
	// internal methods ////////////////////////////////////////////////////////
	
	_useTexture(
			gl:   WebGLRenderingContext,
			slot: number): void {
		
		gl.activeTexture(gl.TEXTURE0 + slot);
		
		if(this._texture !== null) {
			this._texture._use(gl);
		} else {
			gl.bindTexture(gl.TEXTURE_2D, null);
		}
		
		gl.uniform1i(this._p.location, slot);
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
