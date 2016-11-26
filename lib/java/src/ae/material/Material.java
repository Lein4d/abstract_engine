package ae.material;

import ae.collections.PooledHashMap;
import ae.collections.PooledLinkedList;
import ae.collections.PooledQueue;
import ae.core.AbstractEngine;
import ae.core.Texture;
import ae.entity.DirectionalLight;
import ae.entity.Entity;
import ae.entity.PointLight;
import ae.math.Matrix4D;
import ae.util.Functions;

import static org.lwjgl.opengl.GL11.*;
import static org.lwjgl.opengl.GL20.*;
import static org.lwjgl.opengl.GL30.*;

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

	public interface Updater {
		void update(Material material, double time, double delta);
	}
	
	private static final class BuiltInNode extends Node {
		
		private final BuiltInValue _value;
		
		private BuiltInNode(
				final String       name,
				final BuiltInValue value) {
			
			super(name);
			_value = value;
		}

		@Override
		public final void computeTypes() {
			_outputDim = _value._dimension;
		}

		@Override
		public final void toSourceString(final StringBuilder dst) {
			dst.append(_value._glslName);
		}
	}
	
	private final PooledHashMap<String, Node> _nodes = new PooledHashMap<>();
	
	private final PooledLinkedList<ParameterNode> _parameters =
		new PooledLinkedList<>();
	private final PooledLinkedList<TextureNode>   _textures   =
		new PooledLinkedList<>();

	private final int _shaderProgram;
	private final int _uniMatModelView;
	private final int _uniMatProjection;
	private final int _uniMatNormal;
	private final int _uniDirLights;
	private final int _uniDirLightCount;
	private final int _uniPointLights;
	private final int _uniPointLightCount;
	
	private final Updater _updater;
	
	private final float[] _temp9  = new float[9];
	private final float[] _temp16 = new float[16];
	private final float[] _lightData;
	
	private boolean _builtInNormal   = false;
	private boolean _builtInTexCoord = false;
	
	public final AbstractEngine engine;
	
	public final boolean absColor;
	public final boolean diffuse;
	public final boolean perFragNormal;
	public final boolean specular;
	public final boolean emissive;
	public final boolean light;
	public final boolean normalMapping;
	public final boolean parallaxMapping = true;
	public final boolean perFragLight;
	
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
		
		final StringBuilder source = new StringBuilder();

		_appendLine(source, 0, "#version 330");
		_appendEmptyLine(source);

		if(perFragLight) {
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
		
		for(ParameterNode i : _parameters)
			_appendLine(
				source, 0, "uniform " + i.uniType + " " + i.uniName + ";");
		_appendEmptyLine(source);
		
		if(light)
			_appendLine(source, 0, "in highp   vec3 var_pos;");
		if(light || _builtInNormal)
			_appendLine(source, 0, "in mediump vec3 var_normal;");
		if(normalMapping) {
			_appendLine(source, 0, "in mediump vec3 var_uTangent;");
			_appendLine(source, 0, "in mediump vec3 var_vTangent;");
		}
		if(light && !perFragLight)
			_appendLine(source, 0, "in lowp    vec3 var_vertLight;");
		if(_builtInTexCoord)
			_appendLine(source, 0, "in mediump vec2 var_texCoord1;");
		_appendEmptyLine(source);

		_appendLine(source, 0, "out lowp vec4 out_color;");
		_appendEmptyLine(source);

		_appendLine(source, 0, "void main(void) {");
		_appendEmptyLine(source);
		
		if(parallaxMapping) {
			
			_appendLine(source, 1, "vec3 eye = vec3(dot(normalize(var_uTangent), -var_pos), dot(normalize(var_vTangent), -var_pos), dot(normalize(var_normal), -var_pos));");
			_appendLine(source, 1, "eye.z = max(0.5 * eye.z, length(eye.xy));");
			_appendLine(source, 1, "vec2 mInv = eye.xy / eye.z;");
			_appendLine(source, 1, "float height = 0.05;");
			
			_appendLine(source, 1, "vec2 t1 = var_texCoord1;");
			_appendLine(source, 1, "vec2 t2, td, a;");
			_appendLine(source, 1, "float h1, h2;");
			_appendLine(source, 1, "float maxA = -height / eye.z;");
			_appendLine(source, 1, "int j;");
			_appendLine(source, 1, "for(j = 0; j < 3; j++) {");
			_appendLine(source, 2, "h1 = height * (texture(u_s2D_TBump, t1).x - 1.0);");
			_appendLine(source, 2, "t2 = var_texCoord1 + mInv * h1;");
			_appendLine(source, 2, "h2 = height * (texture(u_s2D_TBump, t2).x - 1.0);");
			_appendLine(source, 2, "td = var_texCoord1 - t1;");
			_appendLine(source, 2, "a  = (h2 * td + h1 * h1 * mInv) / (eye.xy * (2 * h1 - h2) + eye.z * td);");
			_appendLine(source, 2, "t1 = var_texCoord1 + eye.xy * clamp(a, maxA, 0);");
			_appendLine(source, 1, "}");
			_appendLine(source, 1, "mediump vec2 var_texCoord = t1;");
			
		} else {
			_appendLine(source, 1, "mediump vec2 var_texCoord = var_texCoord1;");
		}
		_appendEmptyLine(source);
		
		if(normalMapping) {
			source.append('\t');
			source.append("mediump vec3 tsNormal = ");
			fragNormalNode.toSourceString(source);
			source.append(";\n");
			_appendLine(source, 1, "mediump vec3 normal   = normalize(mat3(normalize(var_uTangent), normalize(var_vTangent), normalize(var_normal)) * tsNormal);");
			_appendEmptyLine(source);
		} else if(light) {
			_appendLine(source, 1, "mediump vec3 normal = normalize(var_normal);");
			_appendEmptyLine(source);
		}
		
		if(absColor) {
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
    		_appendLine(source, 1, perFragLight ?
    			"lowp    vec3 fragDiffuse = vec3(0, 0, 0);" :
    			"lowp    vec3 fragDiffuse = var_vertLight;");
    		_appendLine(source, 1, "mediump vec3 lightVec;");
    		_appendEmptyLine(source);
		}

		if(perFragLight) {
			_appendLine(source, 1, "for(i = 0; i < u_dirLightCount; i++) {");
			_appendLine(source, 2, "l1           = u_dirLights[2 * i];");
			_appendLine(source, 2, "l2           = u_dirLights[2 * i + 1];");
			_appendLine(source, 2, "fragDiffuse += l2.rgb * max(dot(normal, l1.xyz) * l1.w + l2.w, 0);");
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

		if(diffuse) {
			source.append('\t');
			source.append("fragDiffuse *= ");
			diffuseNode.toSourceString(source);
			source.append(";\n");
			//_appendLine(source, 1, "fragDiffuse = vec3(fract(var_texCoord * 10), 0);");
			_appendEmptyLine(source);
		}
		
		source.append('\t');
		source.append("out_color = vec4(");
		if(absColor)
			source.append("absColor");
		if(light) {
			if(absColor) source.append(" + ");
			source.append("fragDiffuse");
		}
		source.append(", 1);\n");
		
		_appendLine(source, 0, "}");
		_appendEmptyLine(source);
		
		return source.toString();
	}
	
	private final String _assembleVertexShaderSource() {
		
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
		if(normalMapping) {
			_appendLine(source, 0, "in mediump vec3 in_uTangent;");
			_appendLine(source, 0, "in mediump vec3 in_vTangent;");
		}
		if(_builtInTexCoord)
			_appendLine(source, 0, "in mediump vec2 in_texCoord;");
		_appendEmptyLine(source);
		
		if(light)
			_appendLine(source, 0, "out highp   vec3 var_pos;");
		if(light || _builtInNormal)
			_appendLine(source, 0, "out mediump vec3 var_normal;");
		if(normalMapping) {
			_appendLine(source, 0, "out mediump vec3 var_uTangent;");
			_appendLine(source, 0, "out mediump vec3 var_vTangent;");
		}
		if(light && !perFragLight)
			_appendLine(source, 0, "out lowp    vec3 var_vertLight;");
		if(_builtInTexCoord)
			_appendLine(source, 0, "out mediump vec2 var_texCoord1;");
		_appendEmptyLine(source);
		
		_appendLine(source, 0, "void main(void) {");
		_appendEmptyLine(source);
		
		_appendLine(source, 1, "highp vec4 eyePos = u_matModelView * vec4(in_position, 1);");
		_appendEmptyLine(source);
		
		if(light)
			_appendLine(source, 1, "var_pos       = eyePos.xyz;");
		if(light || _builtInNormal)
			_appendLine(source, 1, "var_normal    = normalize(u_matNormal * in_normal);");
		if(normalMapping) {
			_appendLine(source, 1, "var_uTangent  = normalize(u_matNormal * in_uTangent);");
			_appendLine(source, 1, "var_vTangent  = normalize(u_matNormal * in_vTangent);");
		}
		if(_builtInTexCoord)
			_appendLine(source, 1, "var_texCoord1  = in_texCoord;");
		_appendEmptyLine(source);
		
		if(light && !perFragLight) {
			_appendLine(source, 1, "lowp    int  i;");
			_appendLine(source, 1, "mediump vec4 l1;");
			_appendLine(source, 1, "lowp    vec4 l2;");
			_appendEmptyLine(source);
			_appendLine(source, 1, "var_vertLight = vec3(0, 0, 0);");
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
		
		if(node._outputDim != dimension)
			throw new UnsupportedOperationException(
				"Component has invalid dimension");
		
		return node;
	}

	private final boolean _createShader(
			final int    shaderType,
			final int    program,
			final String shaderSource) {
		System.out.println(shaderSource);
		final int shader = glCreateShader(shaderType);
		
		glShaderSource (shader, shaderSource);
		glCompileShader(shader);
		
		engine.out.println(glGetShaderInfoLog(shader));
		
		// Abort if the shader has not been compiled
		if(glGetShaderi(shader, GL_COMPILE_STATUS) == GL_FALSE) return false;
		
		glAttachShader(program, shader);
		glDeleteShader(shader);
		
		return true;
	}
	
	private final int _createShaderProgram(
    		final Node absColorNode,
    		final Node diffuseNode,
    		final Node fragNormalNode,
    		final Node specularNode,
    		final Node emissiveNode) {

		final int program = glCreateProgram();

		// Create the vertex shader
		final boolean vsSuccess = _createShader(
			GL_VERTEX_SHADER,
			program,
			_assembleVertexShaderSource());
		
		// Create the fragment shader
		final boolean fsSuccess = _createShader(
			GL_FRAGMENT_SHADER,
			program,
			_assembleFragmentShaderSource(
				absColorNode,
				diffuseNode, fragNormalNode, specularNode, emissiveNode));
		
		// If one of shader components failed, no program will be used
		if(!vsSuccess || !fsSuccess) return 0;

		// Bind the vertex attribute locations
		                     glBindAttribLocation(program, 0, "in_position");
		if(light)            glBindAttribLocation(program, 1, "in_normal");
		if(normalMapping)    glBindAttribLocation(program, 2, "in_uTangent");
		if(normalMapping)    glBindAttribLocation(program, 3, "in_vTangent");
		if(_builtInTexCoord) glBindAttribLocation(program, 4, "in_texCoord");
		
		// Bind fragment data locations
		glBindFragDataLocation(program, 0, "out_color");

		// Link the whole program
		glLinkProgram(program);
		engine.out.println(glGetProgramInfoLog(program));
		
		// If the linking has failed, no program will be used
		if(glGetProgrami(program, GL_LINK_STATUS) == GL_FALSE) return 0;
		
		return program;
	}
	
	private final void _setDirLightData(
			final PooledLinkedList<Entity.Instance> lights) {
		
		int offset = 0;
		
		for(Entity.Instance i : lights) {
			
			final DirectionalLight light   = (DirectionalLight)i.getEntity();
			final float[]          dotBias = light.dotBias.getActiveValue();
			
			// Apply the transformation to the light direction and copy it into
			// the data array
			light.direction.getActiveValue().getData(_lightData, offset);
			i.transformation.applyToDirVector(_lightData, offset);
			
			// Copy the color to the data array
			light.color.getActiveValue().getData(_lightData, offset + 4);
			
			// Split the bias data and copy it to the data array
			_lightData[offset + 3] = dotBias[0];
			_lightData[offset + 7] = dotBias[1];

			offset += 8;
		}
		
		glUniform4fv(_uniDirLights,     _lightData);
		glUniform1i (_uniDirLightCount, lights.getSize());
	}

	private final void _setPointLightData(
			final PooledLinkedList<Entity.Instance> lights) {
		
		int offset = 0;
		
		for(Entity.Instance i : lights) {
			
			final PointLight light       = (PointLight)i.getEntity();
			final float[]    attenuation = light.attenuation.getActiveValue();
			
			// Apply the transformation to the light position and copy it into
			// the data array
			for(int j = 0; j < 3; j++) _lightData[offset + j] = 0;
			i.transformation.applyToPoint(_lightData, offset, (byte)3);
			
			// Copy the color to the data array
			light.color.getActiveValue().getData(_lightData, offset + 4);
			
			// Split the attenuation data and copy it to the data array
			_lightData[offset + 3] = attenuation[0];
			_lightData[offset + 7] = attenuation[1];

			offset += 8;
		}
		
		glUniform4fv(_uniPointLights,     _lightData);
		glUniform1i (_uniPointLightCount, lights.getSize());
	}
	
	public Material(
			final AbstractEngine engine,
    		final String         absColor,
    		final String         diffuse,
    		final String         fragNormal,
    		final String         specular,
    		final String         emissive,
    		final Updater        updater,
    		final Node ...       nodes) {
		
		if(specular != null)
			throw new UnsupportedOperationException(
				"Specular component not supported yet");
		
		if(emissive != null)
			throw new UnsupportedOperationException(
				"Emissive component not supported yet");
		
		//engine.addMaterial(this);
		
		this._updater   = updater;
		this._lightData = new float[
			Math.max(engine.maxDirLightCount, engine.maxPointLightCount) * 8];
		this.engine     = engine;
		
		// Set the public properties of this material
		this.absColor      = absColor   != null;
		this.diffuse       = diffuse    != null;
		this.perFragNormal = fragNormal != null;
		this.specular      = specular   != null;
		this.emissive      = emissive   != null;
		this.light         = this.diffuse       || this.specular;
		this.normalMapping = this.light         && this.perFragNormal;
		this.perFragLight  = this.normalMapping || this.specular;
		
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
			
			if(i instanceof ParameterNode)
				_parameters.insertAtEnd((ParameterNode)i);
			if(i instanceof TextureNode)
				_textures  .insertAtEnd((TextureNode)i);
			
			if(i instanceof BuiltInNode) {
				switch(((BuiltInNode)i)._value) {
					case NORMAL:   _builtInNormal   = true; break;
					case TEXCOORD: _builtInTexCoord = true; break;
				}
			}
		}
		
		_shaderProgram = _createShaderProgram(
			_checkComponentNode(absColor,   3),
			_checkComponentNode(diffuse,    3),
			_checkComponentNode(fragNormal, 3),
			_checkComponentNode(specular,   3),
			_checkComponentNode(emissive,   3));
		
		glUseProgram(_shaderProgram);
		
		// Get the locations of the built-in uniform variables
		_uniMatModelView    =
			glGetUniformLocation(_shaderProgram, "u_matModelView");
		_uniMatProjection   =
			glGetUniformLocation(_shaderProgram, "u_matProjection");
		_uniMatNormal       =
			glGetUniformLocation(_shaderProgram, "u_matNormal");
		_uniDirLights       =
			glGetUniformLocation(_shaderProgram, "u_dirLights");
		_uniDirLightCount   =
			glGetUniformLocation(_shaderProgram, "u_dirLightCount");
		_uniPointLights     =
			glGetUniformLocation(_shaderProgram, "u_pointLights");
		_uniPointLightCount =
			glGetUniformLocation(_shaderProgram, "u_pointLightCount");
		
		// Get the locations of the parameter uniform variables
		for(ParameterNode i : _parameters)
			i.setUniformLocation(
				glGetUniformLocation(_shaderProgram, i.uniName));
		
		// Get the locations of the texture uniform variables
		for(TextureNode i : _textures)
			i.setUniformLocation(
				glGetUniformLocation(_shaderProgram, i.uniName));
		
		// Unbind the shader program to prevent further changes
		glUseProgram(0);
	}

	public static final Node builtInNormal(final String name) {
		return new BuiltInNode(name, BuiltInValue.NORMAL);
	}
	
	public static final Node builtInTexCoord(final String name) {
		return new BuiltInNode(name, BuiltInValue.TEXCOORD);
	}
	
	public final Node getNode(final String name) {
		return _nodes.getValue(name);
	}
	
	public final void setParameter(
			final String    nodeName,
			final float ... value) {
		
		((ParameterNode)getNode(nodeName)).setValue(value);
	}
	
	public final void setTexture(
			final String  nodeName,
			final Texture texture) {
		
		((TextureNode)getNode(nodeName)).setTexture(texture);
	}
	
	public final void update(
			final double time,
			final double delta) {
		
		if(_updater != null) _updater.update(this, time, delta);
	}
	
	public final void use(
			final Matrix4D                          matModelView,
			final Matrix4D                          matProjection,
			final PooledLinkedList<Entity.Instance> dirLights,
			final PooledLinkedList<Entity.Instance> pointLights) {
		
		glUseProgram(_shaderProgram);
		
		if(_uniMatModelView != -1)
			glUniformMatrix4fv(
				_uniMatModelView, false, matModelView.getData(_temp16));
		
		if(_uniMatProjection != -1)
			glUniformMatrix4fv(
				_uniMatProjection, false, matProjection.getData(_temp16));
		
		if(_uniMatNormal != -1)
			glUniformMatrix3fv(
				_uniMatNormal, false, matModelView.getNmData(_temp9));
		
		_setDirLightData  (dirLights);
		_setPointLightData(pointLights);
		
		for(ParameterNode i : _parameters) i.applyToShaderProgram();
		
		int curSlot = 0;
		for(TextureNode i : _textures) i.useTexture(curSlot++);
	}
}
