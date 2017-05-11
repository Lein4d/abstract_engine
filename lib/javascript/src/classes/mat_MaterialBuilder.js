
// ae.material.MaterialBuilder
class AEClassMaterialBuilder extends AEClassJavaObject {
	
	_p: {
		color: (ae.mat.Node | null);
	}
	
	_textures:      ae.col.PooledHashMap<ae.util.String, _ae.mat.MatCustomTexture>;
	_parameters:    ae.col.PooledHashMap<ae.util.String, _ae.mat.MatCustomParam>;
	_valuesOrdered: ae.col.PooledLinkedList<_ae.mat.MatValue>;
	_valuesByName:  ae.col.PooledHashMap<ae.util.String, _ae.mat.MatValue>;
	_variables:     ae.col.PooledHashSet<_ae.mat.MatBuiltInVariable>;
	_functions:     ae.col.PooledHashSet<_ae.mat.MatBuiltInFunction>;
	
	// private methods /////////////////////////////////////////////////////////
	
	static _createFuncTemplate(
			name:       string,
			signatures: Array<ISignature>): ae.mat.NodeTemplate {
		
		const paramCount = signatures[0].getParamCount();
		const sepStrings = Array(paramCount + 1);
		
		sepStrings[0]          = name + "(";
		for(let i = 1; i < paramCount; i++) sepStrings[i] = ", ";
		sepStrings[paramCount] = ")";
		
		return new AEClassNodeTemplate(paramCount, signatures, sepStrings);
	}
	
	static _createMultiOpOperatorNode(
			operator: string,
			ops:      Array<ae.mat.Node>): ae.mat.Node {
		
		if(ops.length === 1) return ops[0];
		
		const isOpScalar = Array(ops.length);
		const sepStrings = Array(ops.length + 1);
		
		for(let i = 0; i < ops.length; i++) isOpScalar[i] = ops[i].type.scalar;
		
		sepStrings[0] = "(";
		for(let i = 1; i < ops.length; i++)
			sepStrings[i] = " " + operator + " ";
		sepStrings[ops.length] = ")";
		
		return new AEClassNodeTemplate(
			ops.length,
			[AEClassSignatureGroup.createWithUniqueBase(
				ops[0].type.baseType, false, isOpScalar)],
			sepStrings)._createNode(ops);
	}
	
	// internal getters + setters //////////////////////////////////////////////
	
	get color(): (ae.mat.Node | null) {return this._p.color;}
	
	// public constructor //////////////////////////////////////////////////////
	
	constructor() {
		
		super();
		
		this._textures      = new AEClassPooledHashMap();
		this._parameters    = new AEClassPooledHashMap();
		this._valuesOrdered = new AEClassPooledLinkedList();
		this._valuesByName  = new AEClassPooledHashMap();
		this._variables     = new AEClassPooledHashSet();
		this._functions     = new AEClassPooledHashSet();
		this._p             = {
			color: null,
		};
		
		Object.freeze(this);
	}
	
	// public methods //////////////////////////////////////////////////////////
	
	abs(x: ae.mat.Node): ae.mat.Node {
		return _AE_NT_FUNC_ABS._createNode([x]);
	}

	acos(x: ae.mat.Node): ae.mat.Node {
		return _AE_NT_FUNC_ACOS._createNode([x]);
	}
	
	add(... ops: Array<ae.mat.Node>): ae.mat.Node {
		return AEClassMaterialBuilder._createMultiOpOperatorNode('+', ops);
	}
	
	addParameter(
			name: string,
			type: _ae.mat.GlslType): this {
		
		const boxedName = new AEClassString(name);
		
		if(this._parameters.hasKey(boxedName))
			throw "A parameter with name '" + name + "' already exists";
		
		this._parameters.setValue(
			boxedName, new AEClassMatCustomParam(name, type));
		
		return this;
	}
	
	addTexture(name: string): this {
		
		const boxedName = new AEClassString(name);
		
		if(this._textures.hasKey(boxedName))
			throw "A texture with name '" + name + "' already exists";
		
		this._textures.setValue(boxedName, new AEClassMatCustomTexture(name));
		
		return this;
	}
	/*
	public final MaterialBuilder addValue(
    		final String   name,
    		final GlslType type,
    		final Node     definition) {
		
		final Material.Value var = new Material.Value(name, type, definition);
		
		_valuesOrdered.add(var);
		_valuesByName .put(name, var);
		
		return this;
	}
	*/
	asin(x: ae.mat.Node): ae.mat.Node {
		return _AE_NT_FUNC_ASIN._createNode([x]);
	}

	atan(x: ae.mat.Node): ae.mat.Node {
		return _AE_NT_FUNC_ATAN._createNode([x]);
	}

	ceil(x: ae.mat.Node): ae.mat.Node {
		return _AE_NT_FUNC_CEIL._createNode([x]);
	}

	clamp(
			x:   ae.mat.Node,
			min: ae.mat.Node,
			max: ae.mat.Node): ae.mat.Node {
		
		return _AE_NT_FUNC_CLAMP._createNode([x, min, max]);
	}
	
	constF(... values: Array<number>): ae.mat.Node {
		
		const nodes = Array(values.length);
		
		for(let i = 0; i < values.length; i++)
			nodes[i] =
				AEClassNode._createFromType(values[i].toString(), _aeEnumGlslType.FLOAT);
		
		return this.merge(nodes);
	}

	constI(... values: Array<number>): ae.mat.Node {
		
		const nodes = Array(values.length);
		
		for(let i = 0; i < values.length; i++)
			nodes[i] =
				AEClassNode._createFromType(Math.round(values[i]).toString(), _aeEnumGlslType.INT);
		
		return this.merge(nodes);
	}
	
	cos(x: ae.mat.Node): ae.mat.Node {
		return _AE_NT_FUNC_COS._createNode([x]);
	}
	
	createMaterial(
			engine: ae.core.AbstractEngine,
			name:   string): ae.mat.Material {
		
		if(this._p.color === null) throw "Color term undefined";
		
		return new AEClassMaterial(
			engine, name,
			this._variables, this._functions,
			this._parameters.values, this._textures.values, this._valuesOrdered,
			this._p.color);
	}
	
	cross(
			v1: ae.mat.Node,
			v2: ae.mat.Node): ae.mat.Node {
		
		return _AE_NT_FUNC_CROSS._createNode([v1, v2]);
	}
	
	degrees(x: ae.mat.Node): ae.mat.Node {
		return _AE_NT_FUNC_DEGREES._createNode([x]);
	}
	
	distance(
			p1: ae.mat.Node,
			p2: ae.mat.Node): ae.mat.Node {
		
		return _AE_NT_FUNC_DISTANCE._createNode([p1, p2]);
	}
	
	div(
			op1: ae.mat.Node,
			op2: ae.mat.Node): ae.mat.Node {
		
		return _AE_NT_BIN_OP_DIV._createNode([op1, op2]);
	}
	
	dot(
			v1: ae.mat.Node,
			v2: ae.mat.Node): ae.mat.Node {
		
		return _AE_NT_FUNC_DOT._createNode([v1, v2]);
	}
	
	exp(x: ae.mat.Node): ae.mat.Node {
		return _AE_NT_FUNC_EXP._createNode([x]);
	}

	exp2(x: ae.mat.Node): ae.mat.Node {
		return _AE_NT_FUNC_EXP2._createNode([x]);
	}
	
	eye(): ae.mat.Node {
		this._variables.insert(_AE_MAT_BUILTIN_VAR_EYE);
		return _AE_MAT_BUILTIN_VAR_EYE._node;
	}
	
	faceforward(
			n:    ae.mat.Node,
			i:    ae.mat.Node,
			nRef: ae.mat.Node): ae.mat.Node {
		
		return _AE_NT_FUNC_FACEFORWARD._createNode([n, i, nRef]);
	}
	
	floor(x: ae.mat.Node): ae.mat.Node {
		return _AE_NT_FUNC_FLOOR._createNode([x]);
	}

	fract(x: ae.mat.Node): ae.mat.Node {
		return _AE_NT_FUNC_FRACT._createNode([x]);
	}

	inversesqrt(x: ae.mat.Node): ae.mat.Node {
		return _AE_NT_FUNC_INVERSESQRT._createNode([x]);
	}

	length(x: ae.mat.Node): ae.mat.Node {
		return _AE_NT_FUNC_LENGTH._createNode([x]);
	}

	log(x: ae.mat.Node): ae.mat.Node {
		return _AE_NT_FUNC_LOG._createNode([x]);
	}

	log2(x: ae.mat.Node): ae.mat.Node {
		return _AE_NT_FUNC_LOG2._createNode([x]);
	}

	max(
			x1: ae.mat.Node,
			x2: ae.mat.Node): ae.mat.Node {
		
		return _AE_NT_FUNC_MAX._createNode([x1, x2]);
	}
	
	merge(nodes: Array<ae.mat.Node>): ae.mat.Node {
		
		if(nodes.length === 1) return nodes[0];
		
		const paramTypes = Array(nodes.length);
		const sepStrings = Array(nodes.length + 1);
		
		let baseType  = _aeEnumGlslTypeBase.UNDEF;
		let dimension = 0;
		
		for(let i = 0; i < nodes.length; i++) {
			
			paramTypes[i] = nodes[i].type;
			dimension    += nodes[i].type.dimension;
			
			// Check the base type consistency
			if(i > 0) {
				if(paramTypes[i].baseType !== baseType)
					throw "Nodes have different base types";
			} else {
				baseType = paramTypes[i].baseType;
			}
		}
		
		if(dimension > 4) throw "Dimension greater than 4";
		
		const mergedType = aeFuncGetGlslType(baseType, dimension);
		
		sepStrings[0]            = mergedType.glslName + "(";
		sepStrings[nodes.length] = ")";
		
		for(let i = 1; i < nodes.length; i++) sepStrings[i] = ", ";
		
		return new AEClassNodeTemplate(
			nodes.length,
			[new AEClassCustomSignature(mergedType, paramTypes)],
			sepStrings)._createNode(nodes);
	}
	
	min(
			x1: ae.mat.Node,
			x2: ae.mat.Node): ae.mat.Node {
		
		return _AE_NT_FUNC_MIN._createNode([x1, x2]);
	}
	
	mix(
			op1: ae.mat.Node,
			op2: ae.mat.Node,
			x:   ae.mat.Node): ae.mat.Node {
		
		return _AE_NT_FUNC_MIX._createNode([op1, op2, x]);
	}
	
	mod(
			x: ae.mat.Node,
			y: ae.mat.Node): ae.mat.Node {
		
		return _AE_NT_FUNC_MOD._createNode([x, y]);
	}
	
	mult(... ops: Array<ae.mat.Node>): ae.mat.Node {
		return AEClassMaterialBuilder._createMultiOpOperatorNode('*', ops);
	}
	
	negate(x: ae.mat.Node): ae.mat.Node {
		return _AE_NT_UNARY_OP_NEGATE._createNode([x]);
	}
	
	normal(): ae.mat.Node {
		this._variables.insert(_AE_MAT_BUILTIN_VAR_NORMAL);
		return _AE_MAT_BUILTIN_VAR_NORMAL._node;
	}
	
	normalize(x: ae.mat.Node): ae.mat.Node {
		return _AE_NT_FUNC_NORMALIZE._createNode([x]);
	}
	
	param(name: string): ae.mat.Node {
		// TODO: bessere Abfrage
		return this._parameters.getValueA(new AEClassString(name))._node;
	}
	
	phong(
			normal:   (ae.mat.Node | null) = null,
			position: (ae.mat.Node | null) = null): ae.mat.Node {
		
		this._functions.insert(_AE_MAT_BUILTIN_FUNC_PHONG);
		
		return _AE_MAT_BUILTIN_FUNC_PHONG._nodeTemplate._createNode(
			[position !== null ? position : this.position(),
			 normal   !== null ? normal   : this.normal  ()]);
	}
	
	position(): ae.mat.Node {
		this._variables.insert(_AE_MAT_BUILTIN_VAR_POSITION);
		return _AE_MAT_BUILTIN_VAR_POSITION._node;
	}
	
	pow(
			x: ae.mat.Node,
			y: ae.mat.Node): ae.mat.Node {
		
		return _AE_NT_FUNC_POW._createNode([x, y]);
	}
	
	radians(x: ae.mat.Node): ae.mat.Node {
		return _AE_NT_FUNC_RADIANS._createNode([x]);
	}
	
	rawTexture(name: string): ae.mat.Node {
		return this._textures.getValueA(new AEClassString(name))._node;
	}
	
	reflect(
			i: ae.mat.Node,
			n: ae.mat.Node): ae.mat.Node {
		
		return _AE_NT_FUNC_REFLECT._createNode([i, n]);
	}
	
	refract(
			i:   ae.mat.Node,
			n:   ae.mat.Node,
			eta: ae.mat.Node): ae.mat.Node {
		
		return _AE_NT_FUNC_REFRACT._createNode([i, n, eta]);
	}
	/*
	public final Node rim() {
		return sub(constF(1), dot(normal(), eye()));
	}

	// 'angle' is the width of the rim, 0° <= angle <= 90°
	public final Node rim(final float angle) {
		return sub(
			constF(1),
			div(
				dot(normal(), eye()),
				constF((float)Math.cos(Math.toRadians(90 - angle)))));
	}
	*/
	setColor(color: ae.mat.Node): this {
		
		if(color.type !== _aeEnumGlslType.FLOAT3) throw "No Float3";
		
		this._p.color = color;
		return this;
	}
	
	sign(x: ae.mat.Node): ae.mat.Node {
		return _AE_NT_FUNC_SIGN._createNode([x]);
	}

	sin(x: ae.mat.Node): ae.mat.Node {
		return _AE_NT_FUNC_SIN._createNode([x]);
	}

	smoothstep(
			edge1: ae.mat.Node,
			edge2: ae.mat.Node,
			x:     ae.mat.Node): ae.mat.Node {
		
		return _AE_NT_FUNC_SMOOTHSTEP._createNode([edge1, edge2, x]);
	}
	
	sqrt(x: ae.mat.Node): ae.mat.Node {
		return _AE_NT_FUNC_SQRT._createNode([x]);
	}

	step(
			edge: ae.mat.Node,
			x:    ae.mat.Node): ae.mat.Node {
		
		return _AE_NT_FUNC_STEP._createNode([edge, x]);
	}
	
	sub(... ops: Array<ae.mat.Node>): ae.mat.Node {
		return AEClassMaterialBuilder._createMultiOpOperatorNode('-', ops);
	}
	
	swizzle(
			input: ae.mat.Node,
			mask:  string): ae.mat.Node {
		
		if(mask.length > 4) throw "Swizzle mask is too long";
		
		return new AEClassNodeTemplate(
			1,
			[new AEClassCustomSignature(
				aeFuncGetGlslType(input.type.baseType, mask.length),
				[input.type])],
			["", "." + mask])._createNode([input]);
	}
	
	tan(x: ae.mat.Node): ae.mat.Node {
		return _AE_NT_FUNC_TAN._createNode([x]);
	}
	
	texCoord(): ae.mat.Node {
		this._variables.insert(_AE_MAT_BUILTIN_VAR_TEXCOORD);
		return _AE_MAT_BUILTIN_VAR_TEXCOORD._node;
	}
	
	texture(
			name:      string,
			texCoord: (ae.mat.Node | null) = null): ae.mat.Node {
		
		return _AE_NT_FUNC_TEXTURE._createNode(
			[this.rawTexture(name),
			 texCoord !== null ? texCoord : this.texCoord()]);
	}

	textureA(
			name:      string,
			texCoord: (ae.mat.Node | null) = null): ae.mat.Node {
		
		return this.swizzle(this.texture(name, texCoord), "a");
	}

	textureRGB(
			name:      string,
			texCoord: (ae.mat.Node | null) = null): ae.mat.Node {
		
		return this.swizzle(this.texture(name, texCoord), "rgb");
	}

	value(name: string): ae.mat.Node {
		
		const boxedName = new AEClassString(name);
		
		if(!this._valuesByName.hasKey(boxedName))
			throw "variable '" + name + "' doesn't exist";
		
		return this._valuesByName.getValueA(boxedName)._node;
	}
}
