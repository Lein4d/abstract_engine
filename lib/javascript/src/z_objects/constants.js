
// Enum types

const _aeEnumAxis = {
	X: new AEClassAxis(0, 1, 0, 0),
	Y: new AEClassAxis(1, 0, 1, 0),
	Z: new AEClassAxis(2, 0, 0, 1),
};
Object.freeze(_aeEnumAxis);

const _aeEnumSignedAxis = {
	X_POS: new AEClassSignedAxis(_aeEnumAxis.X,  1,  0,  0),
	X_NEG: new AEClassSignedAxis(_aeEnumAxis.X, -1,  0,  0),
	Y_POS: new AEClassSignedAxis(_aeEnumAxis.Y,  0,  1,  0),
	Y_NEG: new AEClassSignedAxis(_aeEnumAxis.Y,  0, -1,  0),
	Z_POS: new AEClassSignedAxis(_aeEnumAxis.Z,  0,  0,  1),
	Z_NEG: new AEClassSignedAxis(_aeEnumAxis.Z,  0,  0, -1),
};
Object.freeze(_aeEnumSignedAxis);

const _aeEnumRPState = {
	ZERO:     0,
	ABSOLUTE: 1,
	RELATIVE: 2,
};
type EnumRPState = 0 | 1 | 2;
Object.freeze(_aeEnumRPState);

const _aeEnumEntityType = {
	NONE:              0,
	CAMERA:            1,
	MODEL:             2,
	DIRECTIONAL_LIGHT: 3,
	POINT_LIGHT:       4,
	MARKER:            5,
	DYNAMIC_SPACE:     6,
};
type EnumEntityType = 0 | 1 | 2 | 3 | 4 | 5 | 6;
Object.freeze(_aeEnumEntityType);

const _aeEnumGlslTypeBase = {
	UNDEF:   0,
	BOOLEAN: 1,
	INTEGER: 2,
	FLOAT:   3,
	TEXTURE: 4,
};
type EnumGlslTypeBase = 0 | 1 | 2 | 3 | 4;
Object.freeze(_aeEnumGlslTypeBase);

const _aeEnumGlslType = {
	UNDEF:  new AEClassGlslType(_aeEnumGlslTypeBase.UNDEF,   0, ""),
	BOOL:   new AEClassGlslType(_aeEnumGlslTypeBase.BOOLEAN, 1, "bool"),
	BOOL2:  new AEClassGlslType(_aeEnumGlslTypeBase.BOOLEAN, 2, "bvec2"),
	BOOL3:  new AEClassGlslType(_aeEnumGlslTypeBase.BOOLEAN, 3, "bvec3"),
	BOOL4:  new AEClassGlslType(_aeEnumGlslTypeBase.BOOLEAN, 4, "bvec4"),
	INT:    new AEClassGlslType(_aeEnumGlslTypeBase.INTEGER, 1, "int"),
	INT2:   new AEClassGlslType(_aeEnumGlslTypeBase.INTEGER, 2, "ivec2"),
	INT3:   new AEClassGlslType(_aeEnumGlslTypeBase.INTEGER, 3, "ivec3"),
	INT4:   new AEClassGlslType(_aeEnumGlslTypeBase.INTEGER, 4, "ivec4"),
	FLOAT:  new AEClassGlslType(_aeEnumGlslTypeBase.FLOAT,   1, "float"),
	FLOAT2: new AEClassGlslType(_aeEnumGlslTypeBase.FLOAT,   2, "vec2"),
	FLOAT3: new AEClassGlslType(_aeEnumGlslTypeBase.FLOAT,   3, "vec3"),
	FLOAT4: new AEClassGlslType(_aeEnumGlslTypeBase.FLOAT,   4, "vec4"),
	TEX1:   new AEClassGlslType(_aeEnumGlslTypeBase.TEXTURE, 1, "sampler1D"),
	TEX2:   new AEClassGlslType(_aeEnumGlslTypeBase.TEXTURE, 2, "sampler2D"),
	TEX3:   new AEClassGlslType(_aeEnumGlslTypeBase.TEXTURE, 3, "sampler3D"),
};
Object.freeze(_aeEnumGlslType);

// Axis mapping for dynamic space entities

const _AE_DS_AXIS_MAP = [[1, 2, 0], [2, 0, 1], [0, 1, 2]];

// Default signature groups

const _AE_SG_FLOAT_N_IN_N_OUT  = AEClassSignatureGroup.createWithUniqueBase(_aeEnumGlslTypeBase.FLOAT, false, [false]);
const _AE_SG_FLOAT_N_IN_1_OUT  = AEClassSignatureGroup.createWithUniqueBase(_aeEnumGlslTypeBase.FLOAT, true,  [false]);
const _AE_SG_FLOAT_2N_IN_N_OUT = AEClassSignatureGroup.createWithUniqueBase(_aeEnumGlslTypeBase.FLOAT, false, [false, false]);
const _AE_SG_FLOAT_2N_IN_1_OUT = AEClassSignatureGroup.createWithUniqueBase(_aeEnumGlslTypeBase.FLOAT, true,  [false, false]);
const _AE_SG_FLOAT_3N_IN_N_OUT = AEClassSignatureGroup.createWithUniqueBase(_aeEnumGlslTypeBase.FLOAT, false, [false, false, false]);
const _AE_SG_FLOAT_3N_IN_1_OUT = AEClassSignatureGroup.createWithUniqueBase(_aeEnumGlslTypeBase.FLOAT, true,  [false, false, false]);

// Node templates for functions with standard signatures

const _AE_NT_FUNC_ABS         = AEClassMaterialBuilder._createFuncTemplate("abs",         [_AE_SG_FLOAT_N_IN_N_OUT ]);
const _AE_NT_FUNC_ACOS        = AEClassMaterialBuilder._createFuncTemplate("acos",        [_AE_SG_FLOAT_N_IN_N_OUT ]);
const _AE_NT_FUNC_ASIN        = AEClassMaterialBuilder._createFuncTemplate("asin",        [_AE_SG_FLOAT_N_IN_N_OUT ]);
const _AE_NT_FUNC_ATAN        = AEClassMaterialBuilder._createFuncTemplate("atan",        [_AE_SG_FLOAT_N_IN_N_OUT ]);
const _AE_NT_FUNC_CEIL        = AEClassMaterialBuilder._createFuncTemplate("ceil",        [_AE_SG_FLOAT_N_IN_N_OUT ]);
const _AE_NT_FUNC_CLAMP       = AEClassMaterialBuilder._createFuncTemplate("clamp",       [_AE_SG_FLOAT_3N_IN_N_OUT]);
const _AE_NT_FUNC_COS         = AEClassMaterialBuilder._createFuncTemplate("cos",         [_AE_SG_FLOAT_N_IN_N_OUT ]);
const _AE_NT_FUNC_DEGREES     = AEClassMaterialBuilder._createFuncTemplate("degrees",     [_AE_SG_FLOAT_N_IN_N_OUT ]);
const _AE_NT_FUNC_DISTANCE    = AEClassMaterialBuilder._createFuncTemplate("distance",    [_AE_SG_FLOAT_2N_IN_1_OUT]);
const _AE_NT_FUNC_DOT         = AEClassMaterialBuilder._createFuncTemplate("dot",         [_AE_SG_FLOAT_2N_IN_1_OUT]);
const _AE_NT_FUNC_EXP         = AEClassMaterialBuilder._createFuncTemplate("exp",         [_AE_SG_FLOAT_N_IN_N_OUT ]);
const _AE_NT_FUNC_EXP2        = AEClassMaterialBuilder._createFuncTemplate("exp2",        [_AE_SG_FLOAT_N_IN_N_OUT ]);
const _AE_NT_FUNC_FACEFORWARD = AEClassMaterialBuilder._createFuncTemplate("faceforward", [_AE_SG_FLOAT_3N_IN_N_OUT]);
const _AE_NT_FUNC_FLOOR       = AEClassMaterialBuilder._createFuncTemplate("floor",       [_AE_SG_FLOAT_N_IN_N_OUT ]);
const _AE_NT_FUNC_FRACT       = AEClassMaterialBuilder._createFuncTemplate("fract",       [_AE_SG_FLOAT_N_IN_N_OUT ]);
const _AE_NT_FUNC_INVERSESQRT = AEClassMaterialBuilder._createFuncTemplate("inversesqrt", [_AE_SG_FLOAT_N_IN_N_OUT ]);
const _AE_NT_FUNC_LENGTH      = AEClassMaterialBuilder._createFuncTemplate("length",      [_AE_SG_FLOAT_N_IN_1_OUT ]);
const _AE_NT_FUNC_LOG         = AEClassMaterialBuilder._createFuncTemplate("log",         [_AE_SG_FLOAT_N_IN_N_OUT ]);
const _AE_NT_FUNC_LOG2        = AEClassMaterialBuilder._createFuncTemplate("log2",        [_AE_SG_FLOAT_N_IN_N_OUT ]);
const _AE_NT_FUNC_MAX         = AEClassMaterialBuilder._createFuncTemplate("max",         [_AE_SG_FLOAT_2N_IN_N_OUT]);
const _AE_NT_FUNC_MIN         = AEClassMaterialBuilder._createFuncTemplate("min",         [_AE_SG_FLOAT_2N_IN_N_OUT]);
const _AE_NT_FUNC_MOD         = AEClassMaterialBuilder._createFuncTemplate("mod",         [_AE_SG_FLOAT_2N_IN_N_OUT]);
const _AE_NT_FUNC_NORMALIZE   = AEClassMaterialBuilder._createFuncTemplate("normalize",   [_AE_SG_FLOAT_N_IN_N_OUT ]);
const _AE_NT_FUNC_REFLECT     = AEClassMaterialBuilder._createFuncTemplate("reflect",     [_AE_SG_FLOAT_2N_IN_N_OUT]);
const _AE_NT_FUNC_REFRACT     = AEClassMaterialBuilder._createFuncTemplate("refract",     [_AE_SG_FLOAT_3N_IN_N_OUT]);
const _AE_NT_FUNC_RADIANS     = AEClassMaterialBuilder._createFuncTemplate("radians",     [_AE_SG_FLOAT_N_IN_N_OUT ]);
const _AE_NT_FUNC_SIGN        = AEClassMaterialBuilder._createFuncTemplate("sign",        [_AE_SG_FLOAT_N_IN_N_OUT ]);
const _AE_NT_FUNC_SIN         = AEClassMaterialBuilder._createFuncTemplate("sin",         [_AE_SG_FLOAT_N_IN_N_OUT ]);
const _AE_NT_FUNC_SQRT        = AEClassMaterialBuilder._createFuncTemplate("sqrt",        [_AE_SG_FLOAT_N_IN_N_OUT ]);
const _AE_NT_FUNC_TAN         = AEClassMaterialBuilder._createFuncTemplate("tan",         [_AE_SG_FLOAT_N_IN_N_OUT ]);

// Node templates for functions with more complex signatures

const _AE_NT_FUNC_CROSS      = AEClassMaterialBuilder._createFuncTemplate(
	"cross",
	[new AEClassCustomSignature(_aeEnumGlslType.FLOAT3, [_aeEnumGlslType.FLOAT3, _aeEnumGlslType.FLOAT3])]);

const _AE_NT_FUNC_MIX        = AEClassMaterialBuilder._createFuncTemplate(
	"mix",
	[_AE_SG_FLOAT_3N_IN_N_OUT,
	 AEClassSignatureGroup.createWithUniqueBase(_aeEnumGlslTypeBase.FLOAT, false, [false, false, true])]);

const _AE_NT_FUNC_POW        = AEClassMaterialBuilder._createFuncTemplate(
	"pow",
	[AEClassSignatureGroup.createWithUniqueBase(_aeEnumGlslTypeBase.FLOAT, false, [false, true])]);

const _AE_NT_FUNC_SMOOTHSTEP = AEClassMaterialBuilder._createFuncTemplate(
	"smoothstep",
	[_AE_SG_FLOAT_3N_IN_N_OUT,
	 AEClassSignatureGroup.createWithUniqueBase(_aeEnumGlslTypeBase.FLOAT, false, [true, true, false])]);

const _AE_NT_FUNC_STEP       = AEClassMaterialBuilder._createFuncTemplate(
	"step",
	[_AE_SG_FLOAT_2N_IN_N_OUT,
	 AEClassSignatureGroup.createWithUniqueBase(_aeEnumGlslTypeBase.FLOAT, false, [true, false])]);

const _AE_NT_FUNC_TEXTURE    = AEClassMaterialBuilder._createFuncTemplate(
	"texture",
	[new AEClassCustomSignature(_aeEnumGlslType.FLOAT4, [_aeEnumGlslType.TEX2, _aeEnumGlslType.FLOAT2])]);
	
// Node template for the negation

const _AE_NT_UNARY_OP_NEGATE = new AEClassNodeTemplate(1, [_AE_SG_FLOAT_N_IN_N_OUT], ["-", ""]);

// Node template for the division

const _AE_NT_BIN_OP_DIV = new AEClassNodeTemplate(
	2,
	[AEClassSignatureGroup.createWithUniqueBase(_aeEnumGlslTypeBase.FLOAT, false, [true,  false]),
	 AEClassSignatureGroup.createWithUniqueBase(_aeEnumGlslTypeBase.FLOAT, false, [false, true ]),
	 AEClassSignatureGroup.createWithUniqueBase(_aeEnumGlslTypeBase.FLOAT, false, [false, false])],
	["(", " / ", ")"]);

// Attributes

const _AE_SP_ATTR_POSITION = new AEClassSPAttribute("in_position", 0, "attribute highp   vec3 in_position;");
const _AE_SP_ATTR_NORMAL   = new AEClassSPAttribute("in_normal",   1, "attribute mediump vec3 in_normal;");
const _AE_SP_ATTR_TEXCOORD = new AEClassSPAttribute("in_texCoord", 2, "attribute mediump vec2 in_texCoord;");

// Internal uniforms in vertex shader

const _AE_SP_UNI_MAT_MODELVIEW  = new AEClassSPUniformVS("u_matModelView",  "uniform highp mat4 u_matModelView;");
const _AE_SP_UNI_MAT_PROJECTION = new AEClassSPUniformVS("u_matProjection", "uniform highp mat4 u_matProjection;");
const _AE_SP_UNI_MAT_NORMAL     = new AEClassSPUniformVS("u_matNormal",     "uniform highp mat3 u_matNormal;");

// Internal uniforms in fragment shader

const _AE_SP_UNI_DIR_LIGHTS        = new AEClassSPUniformFS("u_dirLights",       "uniform highp vec4 u_dirLights[16];");
const _AE_SP_UNI_DIR_LIGHT_COUNT   = new AEClassSPUniformFS("u_dirLightCount",   "uniform lowp  int  u_dirLightCount;");
const _AE_SP_UNI_POINT_LIGHTS      = new AEClassSPUniformFS("u_pointLights",     "uniform highp vec4 u_pointLights[16];");
const _AE_SP_UNI_POINT_LIGHT_COUNT = new AEClassSPUniformFS("u_pointLightCount", "uniform lowp  int  u_pointLightCount;");

// Varying variables

const _AE_SP_VARY_POSITION = new AEClassSPVarying("var_pos",      _aeEnumGlslType.FLOAT3, "highp   vec3 var_pos;",      "var_pos      = eyePos.xyz;");
const _AE_SP_VARY_NORMAL   = new AEClassSPVarying("var_normal",   _aeEnumGlslType.FLOAT3, "mediump vec3 var_normal;",   "var_normal   = normalize(u_matNormal * in_normal);");
const _AE_SP_VARY_TEXCOORD = new AEClassSPVarying("var_texCoord", _aeEnumGlslType.FLOAT2, "mediump vec2 var_texCoord;", "var_texCoord = in_texCoord;");

// Local variables in the FS main-function

const _AE_SP_LVAR_EYE    = new AEClassSPLocalVariable("eye",    _aeEnumGlslType.FLOAT3, "mediump vec3 eye    = normalize(-var_pos);");
const _AE_SP_LVAR_NORMAL = new AEClassSPLocalVariable("normal", _aeEnumGlslType.FLOAT3, "mediump vec3 normal = normalize(var_normal);");

// Function for phong shading

const _AE_SP_FUNC_PHONG = new AEClassSPFunction(
	"phong",
	_aeEnumGlslType.FLOAT3,
	[_aeEnumGlslType.FLOAT3, _aeEnumGlslType.FLOAT3],
	
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

// Material builtin objects

const _AE_MAT_BUILTIN_VAR_POSITION = new AEClassMatBuiltInVariable(_AE_SP_VARY_POSITION);
const _AE_MAT_BUILTIN_VAR_EYE      = new AEClassMatBuiltInVariable(_AE_SP_LVAR_EYE);
const _AE_MAT_BUILTIN_VAR_NORMAL   = new AEClassMatBuiltInVariable(_AE_SP_LVAR_NORMAL);
const _AE_MAT_BUILTIN_VAR_TEXCOORD = new AEClassMatBuiltInVariable(_AE_SP_VARY_TEXCOORD);
const _AE_MAT_BUILTIN_FUNC_PHONG   = new AEClassMatBuiltInFunction(_AE_SP_FUNC_PHONG);
	