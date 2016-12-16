package ae.material;

import static org.lwjgl.opengl.GL20.*;

import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Set;

import ae.core.AbstractEngine;
import ae.core.ShaderCompiler;

final class ShaderProgram {
	
	// Marker interface
	interface ShaderComponent {}
	
	static final class Attribute implements ShaderComponent {
		
		private final String _name;
		private final int    _index;
		private final String _glslLine;
		
		private Attribute(
    			final String name,
    			final int    index,
    			final String glslLine) {
			
			_name     = name;
			_index    = index;
			_glslLine = glslLine;
		}
	}
	
	static final class CustomUniformParam extends Uniform {
		
		final String   name;
		final GlslType type;
		
		CustomUniformParam(
				final String   name,
				final GlslType type) {
			
			super(
				"u_par_" + name,
				"uniform highp " + type.glslName + " u_par_" + name + ";");
			
			this.name = name;
			this.type = type;
		}
	}
	
	static final class CustomUniformTexture extends Uniform {
		
		final String name;
		
		CustomUniformTexture(final String name) {
			super("u_s2D_" + name, "uniform sampler2D u_s2D_" + name + ";");
			this.name = name;
		}
	}

	static final class Function implements ShaderComponent {

		private final GlslType   _returnType;
		private final GlslType[] _paramTypes;
		private final String[]   _glslLines;
		
		final String glslName;
		
		private Function(
				final String     name,
				final GlslType   returnType,
				final GlslType[] paramTypes,
				final String ... glslLines) {
			
			_returnType = returnType;
			_paramTypes = paramTypes;
			_glslLines  = glslLines;
			glslName    = name;
		}
		
		final NodeTemplate createNodeTemplate() {
			
			final String[] sepStrings = new String[_paramTypes.length + 1];
			
			sepStrings[0]                  = glslName + "(";
			for(int i = 1; i < _paramTypes.length; i++) sepStrings[i] = ", ";
			sepStrings[_paramTypes.length] = ")";
			
			return new NodeTemplate(
				_paramTypes.length,
				new CustomSignature(_returnType, _paramTypes),
				sepStrings);
		}
	}

	static final class LocalVariable implements ShaderComponent {
		
		private final String _glslLine;
		
		final String   glslName;
		final GlslType type;
		
		LocalVariable(
				final String   name,
				final GlslType type,
				final String   glslLine) {
			
			_glslLine = glslLine;
			
			this.glslName = name;
			this.type     = type;
		}
	}

	static abstract class Uniform implements ShaderComponent {
		
		final String glslName;
		final String _glslLine; // This member should be private

		protected Uniform(
				final String glslName,
				final String glslLine) {
			
			this.glslName  = glslName;
			this._glslLine = glslLine;
		}

		final int getCurrentLocation(final int program) {
			return glGetUniformLocation(program, glslName);
		}
	}
	
	static final class UniformFS extends Uniform {
		
		private UniformFS(
				final String name,
				final String glslLine) {
			
			super(name, glslLine);
		}
	}
	
	static final class UniformVS extends Uniform {
		
		private UniformVS(
    			final String name,
    			final String glslLine) {
    		
    		super(name, glslLine);
    	}
	}

	static final class Varying implements ShaderComponent {
		
		private final String _glslLineDeclVS;
		private final String _glslLineDeclFS;
		private final String _glslLineInit;
		
		final String   glslName;
		final GlslType type;
		
		private Varying(
				final String   name,
    			final GlslType type,
    			final String   glslLineDecl,
    			final String   glslLineInit) {
			
			_glslLineDeclVS = "out " + glslLineDecl;
			_glslLineDeclFS = "in "  + glslLineDecl;
			_glslLineInit   = glslLineInit;
			
			this.glslName = name;
			this.type     = type;
		}
	}

	// Attributes
	private static final Attribute _ATTR_POSITION =
		new Attribute("in_position", 0, "in highp   vec3 in_position;");
	private static final Attribute _ATTR_NORMAL   =
		new Attribute("in_normal",   1, "in mediump vec3 in_normal;");
	private static final Attribute _ATTR_UTANGENT =
		new Attribute("in_uTangent", 2, "in mediump vec3 in_uTangent;");
	private static final Attribute _ATTR_VTANGENT =
		new Attribute("in_vTangent", 3, "in mediump vec3 in_vTangent;");
	private static final Attribute _ATTR_TEXCOORD =
		new Attribute("in_texCoord", 4, "in mediump vec2 in_texCoord;");

	private final Map<Uniform, Integer> _uniLocations = new HashMap<>();
	
	// Internal uniforms in vertex shader
	static final UniformVS UNI_MAT_MODELVIEW  = new UniformVS(
		"u_matModelView",  "uniform highp mat4 u_matModelView;");
	static final UniformVS UNI_MAT_PROJECTION = new UniformVS(
		"u_matProjection", "uniform highp mat4 u_matProjection;");
	static final UniformVS UNI_MAT_NORMAL     = new UniformVS(
		"u_matNormal",     "uniform highp mat3 u_matNormal;");
	
	// Internal uniforms in fragment shader
	static final UniformFS UNI_DIR_LIGHTS        = new UniformFS(
		"u_dirLights",       "uniform highp vec4 u_dirLights[16];");
	static final UniformFS UNI_DIR_LIGHT_COUNT   = new UniformFS(
		"u_dirLightCount",   "uniform lowp  int  u_dirLightCount;");
	static final UniformFS UNI_POINT_LIGHTS      = new UniformFS(
		"u_pointLights",     "uniform highp vec4 u_pointLights[16];");
	static final UniformFS UNI_POINT_LIGHT_COUNT = new UniformFS(
		"u_pointLightCount", "uniform lowp  int  u_pointLightCount;");
	
	// Varying variables
	static final Varying VARY_POSITION = new Varying(
		"var_pos", GlslType.FLOAT3,
		"highp   vec3 var_pos;",
		"var_pos      = eyePos.xyz;");
	static final Varying VARY_NORMAL   = new Varying(
		"var_normal", GlslType.FLOAT3,
		"mediump vec3 var_normal;",
		"var_normal   = normalize(u_matNormal * in_normal);");
	static final Varying VARY_UTANGENT = new Varying(
		"var_uTangent", GlslType.FLOAT3,
		"mediump vec3 var_uTangent;",
		"var_uTangent = normalize(u_matNormal * in_uTangent);");
	static final Varying VARY_VTANGENT = new Varying(
		"var_vTangent", GlslType.FLOAT3,
		"mediump vec3 var_vTangent;",
		"var_vTangent = normalize(u_matNormal * in_vTangent);");
	static final Varying VARY_TEXCOORD = new Varying(
		"var_texCoord", GlslType.FLOAT2,
		"mediump vec2 var_texCoord;",
		"var_texCoord = in_texCoord;");
	
	// Local variables in the FS main-function
	static final LocalVariable LVAR_NORMAL   = new LocalVariable(
		"normal", GlslType.FLOAT3,
		"mediump vec3 normal   = normalize(var_normal);");
	static final LocalVariable LVAR_UTANGENT = new LocalVariable(
		"uTangent", GlslType.FLOAT3,
		"mediump vec3 uTangent = normalize(var_uTangent);");
	static final LocalVariable LVAR_VTANGENT = new LocalVariable(
		"vTangent", GlslType.FLOAT3,
		"mediump vec3 vTangent = normalize(var_vTangent);");

	static final Function FUNC_PHONG =
		new Function(
    		"phong",
    		GlslType.FLOAT3,
			new GlslType[]{GlslType.FLOAT3, GlslType.FLOAT3},
    		
    		"vec3 phong(",
    		"\t\tin vec3 pos,",
    		"\t\tin vec3 normal) {",
    		"",
    		"\tlowp    int  i;",
    		"\thighp   vec4 l1;",
    		"\tlowp    vec4 l2;",
    		"\tmediump vec3 lightVec;",
    		"\tlowp    vec3 intensity = vec3(0, 0, 0);",
    		"",
    		"\tfor(i = 0; i < u_dirLightCount; i++) {",
    		"\t\tl1         = u_dirLights[2 * i];",
    		"\t\tl2         = u_dirLights[2 * i + 1];",
    		"\t\tintensity += l2.rgb * max(dot(normal, l1.xyz) * l1.w + l2.w, 0);",
    		"\t}",
    		"",
    		"\tfor(i = 0; i < u_pointLightCount; i++) {",
    		"\t\tl1         = u_pointLights[2 * i];",
    		"\t\tl2         = u_pointLights[2 * i + 1];",
    		"\t\tlightVec   = l1.xyz - pos;",
    		"\t\tintensity +=",
    		"\t\t\tl2.rgb *",                                           // Basic color
    		"\t\t\tpow(max(1.0 - length(lightVec) / l1.w, 0), l2.a) *", // Attenuation
    		"\t\t\tmax(dot(normalize(lightVec), normal), 0.0);",        // Intensity
    		"\t}",
    		"",
    		"\treturn intensity;",
    		"}");
    
	static final Function FUNC_PARALLAX =
		new Function(
			"parallax",
			GlslType.FLOAT2,
			new GlslType[]{
				GlslType.TEX2, GlslType.FLOAT, GlslType.FLOAT3, GlslType.FLOAT3,
				GlslType.FLOAT3, GlslType.FLOAT3, GlslType.FLOAT2, GlslType.INT,
				GlslType.FLOAT},
			
			"vec2 parallax(",
			"\t\tin sampler2D heightMap,",
			"\t\tin float     height,",
			"\t\tin vec3      uTangent,",
			"\t\tin vec3      vTangent,",
			"\t\tin vec3      normal,",
			"\t\tin vec3      pos,",
			"\t\tin vec2      texCoord,",
			"\t\tin int       itCount,",
			"\t\tin float     clampRatio) {",
			"",
			"\tint   i;",
			"\tfloat h1, h2;",
			"\tvec2  t2, td, a;",
			"",
			"\tvec3  eye   = vec3(dot(uTangent, -pos), dot(vTangent, -pos), dot(normal, -pos));",
			"\t      eye.z = max(clampRatio * eye.z, length(eye.xy));",
			"\tvec2  mInv  = eye.xy / eye.z;",
			"\tvec2  t1    = texCoord;",
			"\tfloat maxA  = -height / eye.z;",
			"",
			"\tfor(i = 0; i < itCount; i++) {",
			"",
			"\t\th1 = height * (texture(heightMap, t1).x - 1.0);",
			"\t\tt2 = texCoord + mInv * h1;",
			"\t\th2 = height * (texture(heightMap, t2).x - 1.0);",
			"\t\ttd = texCoord - t1;",
			"",
			"\t\ta  = (h2 * td + h1 * h1 * mInv) / (eye.xy * (2 * h1 - h2) + eye.z * td);",
			"\t\tt1 = texCoord + eye.xy * clamp(a, maxA, 0);",
			"\t}",
			"",
			"\treturn t1;",
			"}");
	
	static final Function FUNC_NORMALMAPPING =
		new Function(
			"normalmapping",
			GlslType.FLOAT3,
			new GlslType[]{
				GlslType.FLOAT3, GlslType.FLOAT3, GlslType.FLOAT3,
				GlslType.FLOAT3},
			
			"vec3 normalmapping(",
			"\t\tin vec3 uTangent,",
			"\t\tin vec3 vTangent,",
			"\t\tin vec3 normal,",
			"\t\tin vec3 tsNormal) {",
			"",
			"\treturn normalize(mat3(uTangent, vTangent, normal) * tsNormal);",
			"}");

	final int programId;
	
	private static final StringBuilder _appendEmptyLine(
			final StringBuilder dst) {
		
		return _appendLines(dst, 0, "");
	}
	
	private static final StringBuilder _appendLines(
			final StringBuilder dst,
			final int           tabCount,
			final String ...    lines) {
		
		for(String i : lines) {
			for(int j = 0; j < tabCount; j++) dst.append('\t');
			dst.append(i).append('\n');
		}
		
		return dst;
	}
	
	private static final String _assembleFragmentShaderSource(
			final List<UniformFS>            uniformsFS,
			final List<CustomUniformParam>   uniformParams,
    		final List<CustomUniformTexture> uniformTextures,
			final List<Varying>              varyings,
			final List<LocalVariable>        lVariables,
    		final List<LocalVariable>        customLVariables,
			final List<Function>             functions,
			final Node                       color) {
		
		final StringBuilder source = new StringBuilder();
		
		_appendLines(source, 0, "#version 330");
		_appendEmptyLine(source);
		
		for(UniformFS i : uniformsFS)
			_appendLines(source, 0, i._glslLine);
		_appendEmptyLine(source);
		
		for(CustomUniformTexture i : uniformTextures)
			_appendLines(source, 0, i._glslLine);
		_appendEmptyLine(source);
	
		for(CustomUniformParam i : uniformParams)
			_appendLines(source, 0, i._glslLine);
		_appendEmptyLine(source);
		
		for(Varying i : varyings)
			_appendLines(source, 0, i._glslLineDeclFS);
		_appendEmptyLine(source);
		
		_appendLines(source, 0, "out lowp vec4 out_color;");
		_appendEmptyLine(source);
		
		for(Function i : functions) {
			_appendLines(source, 0, i._glslLines);
			_appendEmptyLine(source);
		}
		
		_appendLines(source, 0, "void main(void) {");
		_appendEmptyLine(source);
		
		for(LocalVariable i : lVariables)
			_appendLines(source, 1, i._glslLine);
		_appendEmptyLine(source);

		for(LocalVariable i : customLVariables)
			_appendLines(source, 1, i._glslLine);
		_appendEmptyLine(source);
		
		source.append('\t');
		source.append("out_color = vec4(");
		source.append(color.toSourceString());
		source.append(", 1);");
		source.append('\n');
	
		_appendLines(source, 0, "}");
		_appendEmptyLine(source);
		
		return source.toString();
	}
	
	private static final String _assembleVertexShaderSource(
    		final List<UniformVS> uniformsVS,
    		final List<Attribute> attributes,
    		final List<Varying>   varyings) {
		
		final StringBuilder source = new StringBuilder();
		
		_appendLines(source, 0, "#version 330");
		_appendEmptyLine(source);
		
		for(UniformVS i : uniformsVS)
			_appendLines(source, 0, i._glslLine);
		_appendEmptyLine(source);
		
		for(Attribute i : attributes)
			_appendLines(source, 0, i._glslLine);
		_appendEmptyLine(source);
		
		for(Varying i : varyings)
			_appendLines(source, 0, i._glslLineDeclVS);
		_appendEmptyLine(source);
		
		_appendLines(source, 0, "void main(void) {");
		_appendEmptyLine(source);
		
		_appendLines(source, 1, "highp vec4 eyePos = u_matModelView * vec4(in_position, 1);");
		_appendEmptyLine(source);
		
		for(Varying i : varyings)
			_appendLines(source, 1, i._glslLineInit);
		_appendEmptyLine(source);
		
		_appendLines(source, 1, "gl_Position = u_matProjection * eyePos;");
		_appendLines(source, 0, "}");
		_appendEmptyLine(source);
		
		return source.toString();
	}
	
	private static final void _computeTransDependentShaderComponents(
			final Set<ShaderComponent> components) {
		
		components.add(UNI_MAT_MODELVIEW);
		components.add(UNI_MAT_PROJECTION);
		components.add(_ATTR_POSITION);

		if(components.contains(FUNC_PHONG)) {
			components.add(UNI_DIR_LIGHTS);
			components.add(UNI_DIR_LIGHT_COUNT);
			components.add(UNI_POINT_LIGHTS);
			components.add(UNI_POINT_LIGHT_COUNT);
		}
		
		if(components.contains(LVAR_NORMAL  )) components.add(VARY_NORMAL);
		if(components.contains(LVAR_UTANGENT)) components.add(VARY_UTANGENT);
		if(components.contains(LVAR_VTANGENT)) components.add(VARY_VTANGENT);
		
		if(components.contains(VARY_POSITION)) components.add(_ATTR_POSITION);
		
		if(components.contains(VARY_NORMAL)) {
			components.add(UNI_MAT_NORMAL);
			components.add(_ATTR_NORMAL);
		}

		if(components.contains(VARY_UTANGENT)) {
			components.add(UNI_MAT_NORMAL);
			components.add(_ATTR_UTANGENT);
		}

		if(components.contains(VARY_VTANGENT)) {
			components.add(UNI_MAT_NORMAL);
			components.add(_ATTR_VTANGENT);
		}
		
		if(components.contains(VARY_TEXCOORD)) components.add(_ATTR_TEXCOORD);
	}

	private static final int _createShaderProgram(
			final AbstractEngine             engine,
			final String                     name,
    		final List<UniformVS>            uniformsVS,
    		final List<UniformFS>            uniformsFS,
    		final List<CustomUniformParam>   uniformParams,
    		final List<CustomUniformTexture> uniformTextures,
    		final List<Attribute>            attributes,
    		final List<Varying>              varyings,
    		final List<LocalVariable>        lVariables,
    		final List<LocalVariable>        customLVariables,
    		final List<Function>             functions,
			final Node                       color) {

		final String[] attributeNames = new String[5];
		
		for(Attribute i : attributes) attributeNames[i._index] = i._name;
		
		return ShaderCompiler.createShaderProgram(
			engine,
			"[Material] " + name,
			_assembleVertexShaderSource(uniformsVS, attributes, varyings),
			_assembleFragmentShaderSource(
				uniformsFS, uniformParams, uniformTextures,
				varyings, lVariables, customLVariables, functions, color),
			"out_color",
			attributeNames);
	}
	
	ShaderProgram(
    		final AbstractEngine       engine,
    		final String               name,
    		final Set<ShaderComponent> components,
    		final List<LocalVariable>  customLVariables,
    		final Node                 color) {
		
		final List<Uniform>              uniforms        = new LinkedList<>();
		final List<UniformVS>            uniformsVS      = new LinkedList<>();
		final List<UniformFS>            uniformsFS      = new LinkedList<>();
		final List<CustomUniformParam>   uniformParams   = new LinkedList<>();
		final List<CustomUniformTexture> uniformTextures = new LinkedList<>();
		final List<Attribute>            attributes      = new LinkedList<>();
		final List<Varying>              varyings        = new LinkedList<>();
		final List<LocalVariable>        lVariables      = new LinkedList<>();
		final List<Function>             functions       = new LinkedList<>();
		
		_computeTransDependentShaderComponents(components);
		
		for(ShaderComponent i : components) {

			if(i instanceof Uniform)       uniforms  .add((Uniform)      i);
			if(i instanceof UniformVS)     uniformsVS.add((UniformVS)    i);
			if(i instanceof UniformFS)     uniformsFS.add((UniformFS)    i);
			if(i instanceof Attribute)     attributes.add((Attribute)    i);
			if(i instanceof Varying)       varyings  .add((Varying)      i);
			if(i instanceof LocalVariable) lVariables.add((LocalVariable)i);
			if(i instanceof Function)      functions .add((Function)     i);

			if(i instanceof CustomUniformParam)
				uniformParams.add((CustomUniformParam)i);
			
			if(i instanceof CustomUniformTexture)
				uniformTextures.add((CustomUniformTexture)i);
		}
		
		programId = _createShaderProgram(
			engine, name,
			uniformsVS, uniformsFS, uniformParams, uniformTextures,
			attributes, varyings, lVariables, customLVariables, functions,
			color);
		
		for(Uniform i : uniforms)
			_uniLocations.put(i, glGetUniformLocation(programId, i.glslName));
	}
	
	final int getUniformLocation(final Uniform uniform) {
		return _uniLocations.containsKey(uniform) ?
			_uniLocations.get(uniform) : -1;
	}
}
