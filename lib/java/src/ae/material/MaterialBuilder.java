package ae.material;

import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.BiConsumer;

import ae.core.AbstractEngine;
import ae.core.Frame;

public final class MaterialBuilder {
	
	// Node templates for functions with standard signatures
	private static final NodeTemplate _FUNC_ABS         = _createFuncTemplate(
		"abs",         SignatureGroup.SIG_GROUP_FLOAT_N_IN_N_OUT);
	private static final NodeTemplate _FUNC_ACOS        = _createFuncTemplate(
		"acos",        SignatureGroup.SIG_GROUP_FLOAT_N_IN_N_OUT);
	private static final NodeTemplate _FUNC_ASIN        = _createFuncTemplate(
		"asin",        SignatureGroup.SIG_GROUP_FLOAT_N_IN_N_OUT);
	private static final NodeTemplate _FUNC_ATAN        = _createFuncTemplate(
		"atan",        SignatureGroup.SIG_GROUP_FLOAT_N_IN_N_OUT);
	private static final NodeTemplate _FUNC_CEIL        = _createFuncTemplate(
		"ceil",        SignatureGroup.SIG_GROUP_FLOAT_N_IN_N_OUT);
	private static final NodeTemplate _FUNC_CLAMP       = _createFuncTemplate(
		"clamp",       SignatureGroup.SIG_GROUP_FLOAT_3N_IN_N_OUT);
	private static final NodeTemplate _FUNC_COS         = _createFuncTemplate(
		"cos",         SignatureGroup.SIG_GROUP_FLOAT_N_IN_N_OUT);
	private static final NodeTemplate _FUNC_DEGREES     = _createFuncTemplate(
		"degrees",     SignatureGroup.SIG_GROUP_FLOAT_N_IN_N_OUT);
	private static final NodeTemplate _FUNC_DISTANCE    = _createFuncTemplate(
		"distance",    SignatureGroup.SIG_GROUP_FLOAT_2N_IN_1_OUT);
	private static final NodeTemplate _FUNC_DOT         = _createFuncTemplate(
		"dot",         SignatureGroup.SIG_GROUP_FLOAT_2N_IN_1_OUT);
	private static final NodeTemplate _FUNC_EXP         = _createFuncTemplate(
		"exp",         SignatureGroup.SIG_GROUP_FLOAT_N_IN_N_OUT);
	private static final NodeTemplate _FUNC_EXP2        = _createFuncTemplate(
		"exp2",        SignatureGroup.SIG_GROUP_FLOAT_N_IN_N_OUT);
	private static final NodeTemplate _FUNC_FACEFORWARD = _createFuncTemplate(
		"faceforward", SignatureGroup.SIG_GROUP_FLOAT_3N_IN_N_OUT);
	private static final NodeTemplate _FUNC_FLOOR       = _createFuncTemplate(
		"floor",       SignatureGroup.SIG_GROUP_FLOAT_N_IN_N_OUT);
	private static final NodeTemplate _FUNC_FRACT       = _createFuncTemplate(
		"fract",       SignatureGroup.SIG_GROUP_FLOAT_N_IN_N_OUT);
	private static final NodeTemplate _FUNC_INVERSESQRT = _createFuncTemplate(
		"inversesqrt", SignatureGroup.SIG_GROUP_FLOAT_N_IN_N_OUT);
	private static final NodeTemplate _FUNC_LENGTH      = _createFuncTemplate(
		"length",      SignatureGroup.SIG_GROUP_FLOAT_N_IN_1_OUT);
	private static final NodeTemplate _FUNC_LOG         = _createFuncTemplate(
		"log",         SignatureGroup.SIG_GROUP_FLOAT_N_IN_N_OUT);
	private static final NodeTemplate _FUNC_LOG2        = _createFuncTemplate(
		"log2",        SignatureGroup.SIG_GROUP_FLOAT_N_IN_N_OUT);
	private static final NodeTemplate _FUNC_MAX         = _createFuncTemplate(
		"max",         SignatureGroup.SIG_GROUP_FLOAT_2N_IN_N_OUT);
	private static final NodeTemplate _FUNC_MIN         = _createFuncTemplate(
		"min",         SignatureGroup.SIG_GROUP_FLOAT_2N_IN_N_OUT);
	private static final NodeTemplate _FUNC_MOD         = _createFuncTemplate(
		"mod",         SignatureGroup.SIG_GROUP_FLOAT_2N_IN_N_OUT);
	private static final NodeTemplate _FUNC_NORMALIZE   = _createFuncTemplate(
		"normalize",   SignatureGroup.SIG_GROUP_FLOAT_N_IN_N_OUT);
	private static final NodeTemplate _FUNC_REFLECT     = _createFuncTemplate(
		"reflect",     SignatureGroup.SIG_GROUP_FLOAT_2N_IN_N_OUT);
	private static final NodeTemplate _FUNC_REFRACT     = _createFuncTemplate(
		"refract",     SignatureGroup.SIG_GROUP_FLOAT_3N_IN_N_OUT);
	private static final NodeTemplate _FUNC_RADIANS     = _createFuncTemplate(
		"radians",     SignatureGroup.SIG_GROUP_FLOAT_N_IN_N_OUT);
	private static final NodeTemplate _FUNC_SIGN        = _createFuncTemplate(
		"sign",        SignatureGroup.SIG_GROUP_FLOAT_N_IN_N_OUT);
	private static final NodeTemplate _FUNC_SIN         = _createFuncTemplate(
		"sin",         SignatureGroup.SIG_GROUP_FLOAT_N_IN_N_OUT);
	private static final NodeTemplate _FUNC_SQRT        = _createFuncTemplate(
		"sqrt",        SignatureGroup.SIG_GROUP_FLOAT_N_IN_N_OUT);
	private static final NodeTemplate _FUNC_TAN         = _createFuncTemplate(
		"tan",         SignatureGroup.SIG_GROUP_FLOAT_N_IN_N_OUT);

	// Node templates for functions with more complex signatures
	private static final NodeTemplate _FUNC_CROSS      = _createFuncTemplate(
		"cross",
		new CustomSignature(GlslType.FLOAT3, GlslType.FLOAT3, GlslType.FLOAT3));
	private static final NodeTemplate _FUNC_MIX        = _createFuncTemplate(
		"mix",
		SignatureGroup.SIG_GROUP_FLOAT_3N_IN_N_OUT,
		new SignatureGroup(GlslType.Base.FLOAT, false, false, false, true));
	private static final NodeTemplate _FUNC_POW        = _createFuncTemplate(
		"pow", new SignatureGroup(GlslType.Base.FLOAT, false, false, true));
	private static final NodeTemplate _FUNC_SMOOTHSTEP = _createFuncTemplate(
		"smoothstep",
		SignatureGroup.SIG_GROUP_FLOAT_3N_IN_N_OUT,
		new SignatureGroup(GlslType.Base.FLOAT, false, true, true, false));
	private static final NodeTemplate _FUNC_STEP       = _createFuncTemplate(
		"step",
		SignatureGroup.SIG_GROUP_FLOAT_2N_IN_N_OUT,
		new SignatureGroup(GlslType.Base.FLOAT, false, true, false));
	private static final NodeTemplate _FUNC_TEXTURE    = _createFuncTemplate(
		"texture",
		new CustomSignature(GlslType.FLOAT4, GlslType.TEX2, GlslType.FLOAT2));
	
	// Node template forthe division
	private static final NodeTemplate _BIN_OP_DIV = new NodeTemplate(
		2,
		new Signature[]{
			new SignatureGroup(GlslType.Base.FLOAT, false, true,  false),
			new SignatureGroup(GlslType.Base.FLOAT, false, false, true),
			new SignatureGroup(GlslType.Base.FLOAT, false, false, false)},
		"(", " / ", ")");
	
	private final Map<String, Material.CustomTexture> _textures      =
		new HashMap<>();
	private final Map<String, Material.CustomParam>   _parameters    =
		new HashMap<>();
	private final List<Material.Value>                _valuesOrdered =
		new LinkedList<>();
	private final Map<String, Material.Value>         _valuesByName  =
		new HashMap<>();
	
	private final Set<Material.BuiltInVariable> _variables = new HashSet<>();
	private final Set<Material.BuiltInFunction> _functions = new HashSet<>();
	
	private Node                        _color    = null;
	private BiConsumer<Material, Frame> _cbUpdate = null; 
	
	private static final NodeTemplate _createFuncTemplate(
			final String        name,
			final Signature ... signatures) {
		
		final int      paramCount = signatures[0].getParamCount();
		final String[] sepStrings = new String[paramCount + 1];
		
		sepStrings[0]          = name + "(";
		for(int i = 1; i < paramCount; i++) sepStrings[i] = ", ";
		sepStrings[paramCount] = ")";
		
		return new NodeTemplate(paramCount, signatures, sepStrings);
	}
	
	private static final Node createMultiOpOperatorNode(
			final char   operator,
			final Node[] ops) {
		
		if(ops.length == 1) return ops[0];
		
		final boolean[] isOpScalar = new boolean[ops.length];
		final String[]  sepStrings = new String [ops.length + 1];
		
		for(int i = 0; i < ops.length; i++)
			isOpScalar[i] = ops[i].type.isScalar();
		
		sepStrings[0] = "(";
		for(int i = 1; i < ops.length; i++)
			sepStrings[i] = " " + operator + " ";
		sepStrings[ops.length] = ")";
		
		return new NodeTemplate(
			ops.length,
			new SignatureGroup(ops[0].type.baseType, false, isOpScalar),
			sepStrings).createNode(ops);
	}
	
	public final Node abs(final Node x) {
		return _FUNC_ABS.createNode(x);
	}

	public final Node acos(final Node x) {
		return _FUNC_ACOS.createNode(x);
	}

	public final Node add(final Node ... ops) {
		return createMultiOpOperatorNode('+', ops);
	}

	public final MaterialBuilder addFunction(
    		final String name,
    		final Object definition) {
		
		throw new UnsupportedOperationException();
	}

	public final MaterialBuilder addParameter(
			final String   name,
			final GlslType type) {
		
		if(_parameters.containsKey(name))
			throw new UnsupportedOperationException(
				"A parameter with name '" + name + "' already exists");
		
		_parameters.put(name, new Material.CustomParam(name, type));
		
		return this;
	}
	
	public final MaterialBuilder addTexture(final String name) {
		
		if(_textures.containsKey(name))
			throw new UnsupportedOperationException(
				"A texture with name '" + name + "' already exists");
		
		_textures.put(name, new Material.CustomTexture(name));
		
		return this;
	}
	
	public final MaterialBuilder addValue(
    		final String   name,
    		final GlslType type,
    		final Node     definition) {
		
		final Material.Value var = new Material.Value(name, type, definition);
		
		_valuesOrdered.add(var);
		_valuesByName .put(name, var);
		
		return this;
	}

	public final Node asin(final Node x) {
		return _FUNC_ASIN.createNode(x);
	}

	public final Node atan(final Node x) {
		return _FUNC_ATAN.createNode(x);
	}

	public final Node ceil(final Node x) {
		return _FUNC_CEIL.createNode(x);
	}

	public final Node clamp(
			final Node x,
			final Node min,
			final Node max) {
		
		return _FUNC_CLAMP.createNode(x, min, max);
	}
	
	public final Node constF(final float ... values) {
		
		final Node[] nodes = new Node[values.length];
		
		for(int i = 0; i < values.length; i++)
			nodes[i] = new Node(Float.toString(values[i]), GlslType.FLOAT);
		
		return merge(nodes);
	}

	public final Node constI(final int ... values) {
		
		final Node[] nodes = new Node[values.length];
		
		for(int i = 0; i < values.length; i++)
			nodes[i] = new Node(Integer.toString(values[i]), GlslType.INT);
		
		return merge(nodes);
	}

	public final Node cos(final Node x) {
		return _FUNC_COS.createNode(x);
	}
	
	public final Material createMaterial(
			final AbstractEngine engine,
			final String         name) {
		
		return new Material(
			engine, name,
			_variables, _functions,
			_parameters.values(), _textures.values(), _valuesOrdered,
			_color, _cbUpdate);
	}

	public final Node cross(
			final Node v1,
			final Node v2) {
		
		return _FUNC_CROSS.createNode(v1, v2);
	}
	
	public final Node degrees(final Node x) {
		return _FUNC_DEGREES.createNode(x);
	}

	public final Node distance(
			final Node p1,
			final Node p2) {
		
		return _FUNC_DISTANCE.createNode(p1, p2);
	}
	
	public final Node div(
			final Node op1,
			final Node op2) {
		
		return _BIN_OP_DIV.createNode(op1, op2);
	}

	public final Node dot(
			final Node v1,
			final Node v2) {
		
		return _FUNC_DOT.createNode(v1, v2);
	}

	public final Node exp(final Node x) {
		return _FUNC_EXP.createNode(x);
	}

	public final Node exp2(final Node x) {
		return _FUNC_EXP2.createNode(x);
	}

	public final Node faceforward(
			final Node n,
			final Node i,
			final Node nRef) {
		
		return _FUNC_FACEFORWARD.createNode(n, i, nRef);
	}

	public final Node floor(final Node x) {
		return _FUNC_FLOOR.createNode(x);
	}

	public final Node fract(final Node x) {
		return _FUNC_FRACT.createNode(x);
	}

	public final Node inversesqrt(final Node x) {
		return _FUNC_INVERSESQRT.createNode(x);
	}

	public final Node length(final Node x) {
		return _FUNC_LENGTH.createNode(x);
	}

	public final Node log(final Node x) {
		return _FUNC_LOG.createNode(x);
	}

	public final Node log2(final Node x) {
		return _FUNC_LOG2.createNode(x);
	}

	public final Node max(
			final Node x1,
			final Node x2) {
		
		return _FUNC_MAX.createNode(x1, x2);
	}
	
	public final Node merge(final Node ... nodes) {
		
		if(nodes.length == 1) return nodes[0];
		
		final GlslType[] paramTypes = new GlslType[nodes.length];
		final String[]   sepStrings = new String  [nodes.length + 1];
		
		GlslType.Base baseType  = GlslType.Base.UNDEF;
		int           dimension = 0;
		
		for(int i = 0; i < nodes.length; i++) {
			
			paramTypes[i] = nodes[i].type;
			dimension    += nodes[i].type.dimension;
			
			// Check the base type consistency
			if(i > 0) {
				if(paramTypes[i].baseType != baseType)
					throw new UnsupportedOperationException(
						"Nodes have different base types");
			} else {
				baseType = paramTypes[i].baseType;
			}
		}
		
		if(dimension > 4)
			throw new UnsupportedOperationException("Dimension greater than 4");
		
		final GlslType mergedType = GlslType.get(baseType, dimension);
		
		sepStrings[0]            = mergedType.glslName + "(";
		sepStrings[nodes.length] = ")";
		
		for(int i = 1; i < nodes.length; i++) sepStrings[i] = ", ";
		
		return new NodeTemplate(
			nodes.length,
			new CustomSignature(mergedType, paramTypes),
			sepStrings).createNode(nodes);
	}

	public final Node min(
			final Node x1,
			final Node x2) {
		
		return _FUNC_MIN.createNode(x1, x2);
	}

	public final Node mix(
			final Node op1,
			final Node op2,
			final Node x) {
		
		return _FUNC_MIX.createNode(op1, op2, x);
	}

	public final Node mod(
			final Node x,
			final Node y) {
		
		return _FUNC_MOD.createNode(x, y);
	}
	
	public final Node mult(final Node ... ops) {
		return createMultiOpOperatorNode('*', ops);
	}

	public final Node normal() {
		_variables.add(Material.BUILTIN_VAR_NORMAL);
		return Material.BUILTIN_VAR_NORMAL.node;
	}

	public final Node normalize(final Node x) {
		return _FUNC_NORMALIZE.createNode(x);
	}
	
	public final Node normalMapping(final Node tsNormal) {
		return normalMapping(uTangent(), vTangent(), normal(), tsNormal);
	}
	
	public final Node normalMapping(
    		final Node normal,
    		final Node tsNormal) {
		
		return normalMapping(uTangent(), vTangent(), normal, tsNormal);
	}
	
	public final Node normalMapping(
			final Node uTangent,
			final Node vTangent,
			final Node normal,
			final Node tsNormal) {
		
		_functions.add(Material.BUILTIN_FUNC_NORMALMAPPING);
		
		return Material.BUILTIN_FUNC_NORMALMAPPING.nodeTemplate.createNode(
			uTangent, vTangent, normal, tsNormal);
	}

	public final Node normalTexture(final String name) {
		return normalTexture(name, texCoord());
	}
	
	public final Node normalTexture(
			final String name,
			final Node   texCoord) {
		
		return sub(mult(textureRGB(name, texCoord), constF(2)), constF(1));
	}

	public final Node parallax(
    		final String texture,
    		final float  height) {
		
		return parallax(texture, constF(height));
	}

	public final Node parallax(
    		final String texture,
    		final Node   height) {
		
		return parallax(texture, height, constI(3), constF(0.5f));
	}
	
	public final Node parallax(
    		final String texture,
    		final float  height,
    		final int    itCount,
    		final float  clampRatio) {
		
		return parallax(
			texture, constF(height), constI(itCount), constF(clampRatio));
	}
	
	public final Node parallax(
    		final String texture,
    		final Node   height,
    		final Node   itCount,
    		final Node   clampRatio) {
		
		return parallax(
			texture, height, position(), texCoord(), itCount, clampRatio);
	}
	
	public final Node parallax(
    		final String texture,
    		final Node   height,
    		final Node   pos,
    		final Node   texCoord,
    		final Node   itCount,
    		final Node   clampRatio) {
		
		return parallax(
			texture, height,
			uTangent(), vTangent(), normal(),
			pos, texCoord, itCount, clampRatio);
	}
	
	public final Node parallax(
			final String texture,
			final Node   height,
			final Node   uTangent,
			final Node   vTangent,
			final Node   normal,
			final Node   pos,
			final Node   texCoord,
			final Node   itCount,
			final Node   clampRatio) {
		
		_functions.add(Material.BUILTIN_FUNC_PARALLAX);
		
		return Material.BUILTIN_FUNC_PARALLAX.nodeTemplate.createNode(
			rawTexture(texture), height, uTangent, vTangent, normal, pos,
			texCoord, itCount, clampRatio);
	}
	
	public final Node param(final String name) {
		return _parameters.get(name).node;
	}
	
	public final Node phong() {
		return phong(position(), normal());
	}
	
	public final Node phong(final Node normal) {
		return phong(position(), normal);
	}
	
	public final Node phong(
			final Node position,
			final Node normal) {
		
		_functions.add(Material.BUILTIN_FUNC_PHONG);
		
		return Material.BUILTIN_FUNC_PHONG.nodeTemplate.createNode(
			position, normal);
	}
	
	public final Node position() {
		_variables.add(Material.BUILTIN_VAR_POSITION);
		return Material.BUILTIN_VAR_POSITION.node;
	}

	public final Node pow(
			final Node x,
			final Node y) {
		
		return _FUNC_POW.createNode(x, y);
	}

	public final Node radians(final Node x) {
		return _FUNC_RADIANS.createNode(x);
	}

	public final Node rawTexture(final String name) {
		return _textures.get(name).node;
	}
	
	public final Node reflect(
			final Node i,
			final Node n) {
		
		return _FUNC_REFLECT.createNode(i, n);
	}

	public final Node refract(
			final Node i,
			final Node n,
			final Node eta) {
		
		return _FUNC_REFRACT.createNode(i, n, eta);
	}
	
	public final MaterialBuilder setColor(final Node color) {
		
		if(color.type != GlslType.FLOAT3)
			throw new UnsupportedOperationException("No Float3");
		
		_color = color;
		return this;
	}
	
	public final MaterialBuilder setUpdateCallback(
			final BiConsumer<Material, Frame> cbUpdate) {
		
		_cbUpdate = cbUpdate;
		return this;
	}

	public final Node sign(final Node x) {
		return _FUNC_SIGN.createNode(x);
	}

	public final Node sin(final Node x) {
		return _FUNC_SIN.createNode(x);
	}

	public final Node smoothstep(
			final Node edge1,
			final Node edge2,
			final Node x) {
		
		return _FUNC_SMOOTHSTEP.createNode(edge1, edge2, x);
	}

	public final Node sqrt(final Node x) {
		return _FUNC_SQRT.createNode(x);
	}

	public final Node step(
			final Node edge,
			final Node x) {
		
		return _FUNC_STEP.createNode(edge, x);
	}

	public final Node sub(final Node ... ops) {
		return createMultiOpOperatorNode('-', ops);
	}

	public final Node swizzle(
			final Node   input,
			final String mask) {
		
		if(mask.length() > 4)
			throw new UnsupportedOperationException("Swizzle mask is too long");
		
		return new NodeTemplate(
			1,
			new CustomSignature(
				GlslType.get(input.type.baseType, mask.length()), input.type),
			"", "." + mask).createNode(input);
	}

	public final Node tan(final Node x) {
		return _FUNC_TAN.createNode(x);
	}
	
	public final Node texCoord() {
		_variables.add(Material.BUILTIN_VAR_TEXCOORD);
		return Material.BUILTIN_VAR_TEXCOORD.node;
	}
	
	public final Node texture(final String name) {
		return texture(name, texCoord());
	}
	
	public final Node texture(
			final String name,
			final Node   texCoord) {
		
		return _FUNC_TEXTURE.createNode(rawTexture(name), texCoord);
	}

	public final Node textureA(final String name) {
		return textureA(name, texCoord());
	}
	
	public final Node textureA(
			final String name,
			final Node   texCoord) {
		
		return swizzle(texture(name, texCoord), "a");
	}

	public final Node textureRGB(final String name) {
		return textureRGB(name, texCoord());
	}
	
	public final Node textureRGB(
			final String name,
			final Node   texCoord) {
		
		return swizzle(texture(name, texCoord), "rgb");
	}

	public final Node uTangent() {
		_variables.add(Material.BUILTIN_VAR_UTANGENT);
		return Material.BUILTIN_VAR_UTANGENT.node;
	}
	
	public final Node value(final String name) {
		
		if(!_valuesByName.containsKey(name))
			throw new UnsupportedOperationException(
				"variable '" + name + "' doesn't exist");
		
		return _valuesByName.get(name).node;
	}
	
	public final Node vTangent() {
		_variables.add(Material.BUILTIN_VAR_VTANGENT);
		return Material.BUILTIN_VAR_VTANGENT.node;
	}
}
