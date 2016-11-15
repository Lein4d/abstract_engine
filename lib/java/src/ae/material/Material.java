package ae.material;

import ae.collections.PooledHashMap;
import ae.collections.PooledLinkedList;
import ae.collections.PooledQueue;
import ae.core.Texture;
import ae.util.Functions;

public final class Material {
	
	private enum BuiltInValue {
		NORMAL  ("var_normal",   3),
		TEXCOORD("var_texCoord", 2);
		
		private final String _glslName;
		private final int    _dimension;
		
		private BuiltInValue(
    			final String glslName,
    			final int    dimension) {
			
			_glslName  = glslName;
			_dimension = dimension;
		}
	}
	
	public static final class BuiltInNode extends Node {
		
		private final BuiltInValue _value;
		
		private BuiltInNode(
				final String       name,
				final BuiltInValue value) {
			
			super(name);
			_value = value;
		}

		@Override
		public final void computeTypes() {
			_addOutput(null, _value._dimension);
			_typingSuccessful();
		}

		@Override
		public final void toSourceString(final StringBuilder dst) {
			dst.append(_value._glslName);
		}
	}
	
	private final PooledHashMap<String, Node>   _nodes = new PooledHashMap<>();
	private final PooledLinkedList<TextureNode> _textures =
		new PooledLinkedList<>();

	private boolean _builtInNormal   = false;
	private boolean _builtInTexCoord = false;
	
	private final StringBuilder _appendEmptyLine(final StringBuilder dst) {
		return _appendLine(dst, 0, "");
	}
	
	private final StringBuilder _appendLine(
			final StringBuilder dst,
			final int           tabCount,
			final String        line) {
		
		for(int i = 0; i < tabCount; i++) dst.append('\t');
		return dst.append(line).append('\n');
	}
	
	private final String _assembleFragmentShaderSource(
    		final Node absColorNode,
    		final Node diffuseNode,
    		final Node fragNormalNode,
    		final Node specularNode,
    		final Node emissiveNode) {
		
		final StringBuilder source       = new StringBuilder();
		final boolean       light        =
			diffuseNode  != null || specularNode   != null;
		final boolean       perFragLight =
			specularNode != null || fragNormalNode != null;

		_appendLine(source, 0, "#version 330");
		_appendEmptyLine(source);

		if(light && perFragLight) {
			_appendLine(source, 0, "uniform highp vec4 u_dirLights[16];");
			_appendLine(source, 0, "uniform lowp  int  u_dirLightCount;");
		}
		if(light) {
    		_appendLine(source, 0, "uniform highp vec4 u_pointLights[16];");
    		_appendLine(source, 0, "uniform lowp  int  u_pointLightCount;");
		}
		_appendEmptyLine(source);

		for(TextureNode i : _textures)
			_appendLine(source, 0, "uniform sampler2D " + i.uniName + ";");
		_appendEmptyLine(source);
		
		if(light)
			_appendLine(source, 0, "in highp   vec3 var_pos;");
		if(light || _builtInNormal)
			_appendLine(source, 0, "in mediump vec3 var_normal;");
		if(light && !perFragLight)
			_appendLine(source, 0, "in lowp    vec3 var_vertLight;");
		if(_builtInTexCoord)
			_appendLine(source, 0, "in mediump vec2 var_texCoord;");
		_appendEmptyLine(source);

		_appendLine(source, 0, "out lowp vec4 out_color;");
		_appendEmptyLine(source);

		_appendLine(source, 0, "void main(void) {");
		_appendEmptyLine(source);
		
		// TODO: Modify normal
		
		if(absColorNode != null) {
			source.append('\t');
			source.append("lowp vec3 absColor = ");
			absColorNode.toSourceString(source);
			source.append(";\n");
			_appendEmptyLine(source);
		}
		
		if(light) {
    		_appendLine(source, 1, "lowp    int  i;");
    		_appendLine(source, 1, "highp   vec4 l1;");
    		_appendLine(source, 1, "lowp    vec4 l2;");
    		_appendLine(source, 1, "lowp    vec3 fragDiffuse = vec3(0, 0, 0);");
    		_appendLine(source, 1, "mediump vec3 normal      = normalize(var_normal);");
    		_appendLine(source, 1, "mediump vec3 lightVec;");
    		_appendEmptyLine(source);
		}

		if(light && perFragLight) {
			_appendLine(source, 1, "for(i = 0; i < u_dirLightCount; i++) {");
			_appendLine(source, 2, "l1           = u_dirLights[2 * i];");
			_appendLine(source, 2, "l2           = u_dirLights[2 * i + 1];");
			_appendLine(source, 2, "fragDiffuse += l2.rgb * max(dot(var_normal, l1.xyz) * l1.w + l2.w, 0);");
			_appendLine(source, 1, "}");
			_appendEmptyLine(source);
		}
		
		if(light) {
    		_appendLine(source, 1, "for(i = 0; i < u_pointLightCount; i++) {");
    		_appendLine(source, 2, "l1           = u_pointLights[2 * i];");
    		_appendLine(source, 2, "l2           = u_pointLights[2 * i + 1];");
    		_appendLine(source, 2, "lightVec     = l1.xyz - var_pos;");
    		_appendLine(source, 2, "fragDiffuse +=");
    		_appendLine(source, 3, "l2.rgb *");                                           // Basic color
    		_appendLine(source, 3, "pow(max(1.0 - length(lightVec) / l1.w, 0), l2.a) *"); // Attenuation
    		_appendLine(source, 3, "max(dot(normalize(lightVec), normal), 0.0);");        // Intensity
    		_appendLine(source, 1, "}");
    		_appendEmptyLine(source);
		}
		
		source.append('\t');
		source.append("out_color = vec4(");
		if(absColorNode != null)
			source.append("absColor");
		if(light) {
			if(absColorNode != null) source.append(" + ");
			source.append("fragDiffuse");
		}
		source.append(", 1);\n");
		
		_appendLine(source, 0, "}");
		_appendEmptyLine(source);
		
		return source.toString();
	}
	
	private final String _assembleVertexShaderSource(
			final boolean absColor,
			final boolean texture,
			final boolean light,
			final boolean perFragLight) {
		
		final StringBuilder source = new StringBuilder();
		
		_appendLine(source, 0, "#version 330");
		_appendEmptyLine(source);
		
		_appendLine(source, 0, "uniform highp mat4 u_matModelView;");
		_appendLine(source, 0, "uniform highp mat4 u_matProjection;");
		if(light)
			_appendLine(source, 0, "uniform highp mat3 u_matNormal;");
		_appendEmptyLine(source);
		
		if(light && !perFragLight) {
			_appendLine(source, 0, "uniform highp vec4 u_dirLights[16];");
			_appendLine(source, 0, "uniform lowp  int  u_dirLightCount;");
		}
		_appendEmptyLine(source);
		
		_appendLine(source, 0, "in highp   vec3 in_position;");
		if(light)
			_appendLine(source, 0, "in mediump vec3 in_normal;");
		if(_builtInTexCoord)
			_appendLine(source, 0, "in mediump vec2 in_texCoord;");
		_appendEmptyLine(source);
		
		if(light) {
			_appendLine(source, 0, "out highp   vec3 var_pos;");
			_appendLine(source, 0, "out mediump vec3 var_normal;");
		}
		if(light && !perFragLight)
			_appendLine(source, 0, "out lowp    vec3 var_vertLight;");
		if(_builtInTexCoord)
			_appendLine(source, 0, "out mediump vec2 var_texCoord;");
		_appendEmptyLine(source);
		
		_appendLine(source, 0, "void main(void) {");
		_appendEmptyLine(source);
		
		_appendLine(source, 1, "highp vec4 eyePos = u_matModelView * vec4(in_position, 1);");
		_appendEmptyLine(source);
		
		if(light)
			_appendLine(source, 1, "var_pos       = eyePos.xyz;");
		if(light || _builtInNormal)
			_appendLine(source, 1, "var_normal    = normalize(u_matNormal * in_normal);");
		if(light && !perFragLight)
			_appendLine(source, 1, "var_vertLight = vec3(0, 0, 0);");
		if(_builtInTexCoord)
			_appendLine(source, 1, "var_texCoord  = in_texCoord;");
		_appendEmptyLine(source);
		
		if(light && !perFragLight) {
			_appendLine(source, 1, "lowp    int  i;");
			_appendLine(source, 1, "mediump vec4 l1;");
			_appendLine(source, 1, "lowp    vec4 l2;");
			_appendEmptyLine(source);
			_appendLine(source, 1, "for(i = 0; i < u_dirLightCount; i++) {");
			_appendLine(source, 2, "l1             = u_dirLights[2 * i];");
			_appendLine(source, 2, "l2             = u_dirLights[2 * i + 1];");
			_appendLine(source, 2, "var_vertLight += l2.rgb * max(dot(var_normal, l1.xyz) * l1.w + l2.w, 0);");
			_appendLine(source, 1, "}");
			_appendEmptyLine(source);
		}
		
		_appendLine(source, 1, "gl_Position = u_matProjection * eyePos;");
		_appendLine(source, 0, "}");
		_appendEmptyLine(source);
		
		return source.toString();
	}
	
	private final Node _checkComponentNode(
			final String compName,
			final int    dimension) {
		
		if(compName == null) return null;
		
		final Node node = Functions.assertNotNull(
			getNode(compName),
			"Component doesn't refer to a valid node ('" + compName + "')");
		
		if(node._getOutputDimension(null) != dimension)
			throw new UnsupportedOperationException(
				"Component has invalid dimension");
		
		return node;
	}
	
	private final void _createShaderProgram(
    		final Node absColorNode,
    		final Node diffuseNode,
    		final Node fragNormalNode,
    		final Node specularNode,
    		final Node emissiveNode) {
		
		final boolean hasLight        =
			diffuseNode  != null || specularNode   != null;
		final boolean hasPerFragLight =
			specularNode != null || fragNormalNode != null;
		
		final String vertexShaderSource = _assembleVertexShaderSource(
			absColorNode != null,
			!_textures.isEmpty(),
			hasLight, hasPerFragLight);
		
		final String fragmentShaderSource = _assembleFragmentShaderSource(
			absColorNode, diffuseNode, fragNormalNode, specularNode, emissiveNode);
		
		System.out.println(vertexShaderSource);
		System.out.println(fragmentShaderSource);
	}
	
	public Material(
    		final String   absColor,
    		final String   diffuse,
    		final String   fragNormal,
    		final String   specular,
    		final String   emissive,
    		final Node ... nodes) {

		if(fragNormal != null)
			throw new UnsupportedOperationException(
				"Fragment normal not supported yet");
		
		if(specular != null)
			throw new UnsupportedOperationException(
				"Specular component not supported yet");
		
		if(emissive != null)
			throw new UnsupportedOperationException(
				"Emissive component not supported yet");
		
		final PooledQueue<Node> notTyped = new PooledQueue<>();
		
		// Insert all nodes into a map
		for(Node i : nodes) {
			_nodes.setValue(i.name, i);
			notTyped.push(i);
		}
		
		// Resolve the actual nodes referenced by names
		for(Node i : nodes) i.resolveInputNodes(this);
		
		// Resolve the input and output types of all nodes
		while(notTyped.hasNext()) {
			
			final Node node = notTyped.pop();
			
			if(node.areInputsTyped()) {
				node.computeTypes();
			} else {
				notTyped.push(node);
			}
		}
		
		// Look for special nodes, e.g. textures and parameters
		for(Node i : nodes) {
			
			if(i instanceof ParameterNode) ;
			if(i instanceof TextureNode) _textures.insertAtEnd((TextureNode)i);
			
			if(i instanceof BuiltInNode) {
				switch(((BuiltInNode)i)._value) {
					case NORMAL:   _builtInNormal   = true; break;
					case TEXCOORD: _builtInTexCoord = true; break;
				}
			}
		}
		
		_createShaderProgram(
			_checkComponentNode(absColor,   3),
			_checkComponentNode(diffuse,    3),
			_checkComponentNode(fragNormal, 3),
			_checkComponentNode(specular,   3),
			_checkComponentNode(emissive,   3));
	}

	public static final BuiltInNode createNormalNode(final String name) {
		return new BuiltInNode(name, BuiltInValue.NORMAL);
	}
	
	public static final BuiltInNode createTexCoordNode(final String name) {
		return new BuiltInNode(name, BuiltInValue.TEXCOORD);
	}
	
	public final Node getNode(final String name) {
		return _nodes.getValue(name);
	}
	
	public final void setTexture(
			final String  nodeName,
			final Texture texture) {
		
		((TextureNode)getNode(nodeName)).setTexture(texture);
	}
	
	public final void use() {
		
		int curSlot = 0;
		
		for(TextureNode i : _textures) i.useTexture(curSlot++);
	}
}
