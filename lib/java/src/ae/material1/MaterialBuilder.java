package ae.material1;

import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Set;

import ae.core.AbstractEngine;

public final class MaterialBuilder {
	
	private final class Variable {
		
		private final String   _glslName;
		private final GlslType _type;
		private final Node     _definition;
		
		private Variable(
    			final String   name,
        		final GlslType type,
        		final Node     definition) {
			
			_glslName   = "v_" + name;
			_type       = type;
			_definition = definition;
		}
	}
	
	private static final Signature[] _BIN_OP_SIGNATURES = {
		new SignatureGroup(GlslType.Base.FLOAT, false, true,  false),
		new SignatureGroup(GlslType.Base.FLOAT, false, false, true),
		new SignatureGroup(GlslType.Base.FLOAT, false, false, false)};
	
	private static final NodeTemplate _BIN_OP_ADD =
		new NodeTemplate(2, _BIN_OP_SIGNATURES, "(", " + ", ")");
	private static final NodeTemplate _BIN_OP_DIV =
		new NodeTemplate(2, _BIN_OP_SIGNATURES, "(", " / ", ")");
	private static final NodeTemplate _BIN_OP_MULT =
		new NodeTemplate(2, _BIN_OP_SIGNATURES, "(", " * ", ")");
	private static final NodeTemplate _BIN_OP_SUB =
		new NodeTemplate(2, _BIN_OP_SIGNATURES, "(", " - ", ")");
	
	private final Map<String, Material.CustomTexture> _textures   = new HashMap<>();
	private final Map<String, Material.CustomParam>   _parameters = new HashMap<>();
	
	private final List<Variable>        _variablesOrdered = new LinkedList<>();
	private final Map<String, Variable> _variablesByName  = new HashMap<>();
	
	private final Set<Material.BuiltInVariable> _variables = new HashSet<>();
	private final Set<Material.BuiltInFunction> _functions = new HashSet<>();
	
	private Node             _color   = null;
	private Material.Updater _updater = null; 
	
	public final Node add(
			final Node op1,
			final Node op2) {
		
		return _BIN_OP_ADD.createNode(op1, op2);
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
	
	public final MaterialBuilder addVariable(
    		final String   name,
    		final GlslType type,
    		final Node     definition) {
		
		final Variable var = new Variable(name, type, definition);
		
		_variablesOrdered.add(var);
		_variablesByName .put(name, var);
		
		return this;
	}

	public final Node constF(final float ... values) {
		
		final Node[] nodes = new Node[values.length];
		
		for(int i = 0; i < values.length; i++)
			nodes[i] = 
				new NodeTemplate(Float.toString(values[i]), GlslType.FLOAT).
				createNode();
		
		return merge(nodes);
	}
	
	public final Material createMaterial(final AbstractEngine engine) {
		return new Material(
			engine,
			_variables, _functions, _parameters.values(), _textures.values(),
			_color, _updater);
	}
	
	public final Node div(
			final Node op1,
			final Node op2) {
		
		return _BIN_OP_DIV.createNode(op1, op2);
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
	
	public final Node mult(
			final Node op1,
			final Node op2) {
		
		return _BIN_OP_MULT.createNode(op1, op2);
	}

	public final Node normal() {
		_variables.add(Material.BUILTIN_VAR_NORMAL);
		return Material.BUILTIN_VAR_NORMAL.nodeTemplate.createNode();
	}
	
	public final Node param(final String name) {
		return _parameters.get(name).nodeTemplate.createNode();
	}
	
	public final Node phong(
			final Node position,
			final Node normal) {
		
		//_components.add(Material.FUNC_PHONG);
		
		//return Material.FUNC_PHONG.create(position, normal);
		
		return constF(1, 1, 1);
	}
	
	public final Node position() {
		_variables.add(Material.BUILTIN_VAR_POSITION);
		return Material.BUILTIN_VAR_POSITION.nodeTemplate.createNode();
	}
	
	public final MaterialBuilder setColor(final Node color) {
		
		if(color.type != GlslType.FLOAT3)
			throw new UnsupportedOperationException("No Float3");
		
		_color = color;
		return this;
	}
	
	public final MaterialBuilder setUpdater(final Material.Updater updater) {
		
		return this;
	}
	
	public final Node sub(
			final Node op1,
			final Node op2) {
		
		return _BIN_OP_SUB.createNode(op1, op2);
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
	
	public final Node texCoord() {
		_variables.add(Material.BUILTIN_VAR_TEXCOORD);
		return Material.BUILTIN_VAR_TEXCOORD.nodeTemplate.createNode();
	}
	
	public final Node texture(
			final String name,
			final Node   texCoord) {
		
		return _textures.get(name).nodeTemplate.createNode(texCoord);
	}
	/*
	public final Node var(final String name) {
		
		if(!_variablesByName.containsKey(name))
			throw new UnsupportedOperationException(
				"variable '" + name + "' doesn't exist");
		
		return new Node(
			new CustomSignature(_variablesByName.get(name)._type),
			new String[]{name});
	}
	*/
}
