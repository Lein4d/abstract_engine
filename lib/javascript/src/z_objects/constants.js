
// Enum types

const _aeEnumAxis = {
	X: new AEClassAxis(0, 1, 0, 0),
	Y: new AEClassAxis(1, 0, 1, 0),
	Z: new AEClassAxis(2, 0, 0, 1),
};
Object.freeze(_aeEnumAxis);

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

const _aeEnumKey = {
	UNKNOWN:        -1,
	SPACE:          32,
	COMMA:          44,
	PERIOD:         46,
	SLASH:          47,
	N0:             48,
	N1:             49,
	N2:             50,
	N3:             51,
	N4:             52,
	N5:             53,
	N6:             54,
	N7:             55,
	N8:             56,
	N9:             57,
	SEMICOLON:      59,
	A:              65,
	B:              66,
	C:              67,
	D:              68,
	E:              69,
	F:              70,
	G:              71,
	H:              72,
	I:              73,
	J:              74,
	K:              75,
	L:              76,
	M:              77,
	N:              78,
	O:              79,
	P:              80,
	Q:              81,
	R:              82,
	S:              83,
	T:              84,
	U:              85,
	V:              86,
	W:              87,
	X:              88,
	Y:              89,
	Z:              90,
	LEFT_BRACKET:   91,
	BACKSLASH:      92,
	RIGHT_BRACKET:  93,
	ESCAPE:        256,
	ENTER:         257,
	TAB:           258,
	BACKSPACE:     259,
	INSERT:        260,
	DELETE:        261,
	RIGHT:         262,
	LEFT:          263,
	DOWN:          264,
	UP:            265,
	PAGE_UP:       266,
	PAGE_DOWN:     267,
	CAPS_LOCK:     280,
	SCROLL_LOCK:   281,
	NUM_LOCK:      282,
	PAUSE:         284,
	F1:            290,
	F2:            291,
	F3:            292,
	F4:            293,
	F5:            294,
	F6:            295,
	F7:            296,
	F8:            297,
	F9:            298,
	F10:           299,
	F11:           300,
	F12:           301,
	F13:           302,
	F14:           303,
	F15:           304,
	F16:           305,
	F17:           306,
	F18:           307,
	F19:           308,
	F20:           309,
	F21:           310,
	F22:           311,
	F23:           312,
	F24:           313,
	F25:           314,
	KP_0:          320,
	KP_1:          321,
	KP_2:          322,
	KP_3:          323,
	KP_4:          324,
	KP_5:          325,
	KP_6:          326,
	KP_7:          327,
	KP_8:          328,
	KP_9:          329,
	KP_DIVIDE:     331,
	KP_MULTIPLY:   332,
	KP_SUBTRACT:   333,
	KP_ADD:        334,
	KP_ENTER:      335,
	LEFT_SHIFT:    340,
	LEFT_CONTROL:  341,
	LEFT_ALT:      342,
	RIGHT_SHIFT:   344,
	RIGHT_CONTROL: 345,
	RIGHT_ALT:     346,
};
Object.freeze(_aeEnumKey);

const _aeEnumKeyString = {
	"Space":          _aeEnumKey.SPACE,
	"Comma":          _aeEnumKey.COMMA,
	"Period":         _aeEnumKey.PERIOD,
	"Slash":          _aeEnumKey.SLASH,
	"Digit0":         _aeEnumKey.N0,
	"Digit1":         _aeEnumKey.N1,
	"Digit2":         _aeEnumKey.N2,
	"Digit3":         _aeEnumKey.N3,
	"Digit4":         _aeEnumKey.N4,
	"Digit5":         _aeEnumKey.N5,
	"Digit6":         _aeEnumKey.N6,
	"Digit7":         _aeEnumKey.N7,
	"Digit8":         _aeEnumKey.N8,
	"Digit9":         _aeEnumKey.N9,
	"Semicolon":      _aeEnumKey.SEMICOLON,
	"KeyA":           _aeEnumKey.A,
	"KeyB":           _aeEnumKey.B,
	"KeyC":           _aeEnumKey.C,
	"KeyD":           _aeEnumKey.D,
	"KeyE":           _aeEnumKey.E,
	"KeyF":           _aeEnumKey.F,
	"KeyG":           _aeEnumKey.G,
	"KeyH":           _aeEnumKey.H,
	"KeyI":           _aeEnumKey.I,
	"KeyJ":           _aeEnumKey.J,
	"KeyK":           _aeEnumKey.K,
	"KeyL":           _aeEnumKey.L,
	"KeyM":           _aeEnumKey.M,
	"KeyN":           _aeEnumKey.N,
	"KeyO":           _aeEnumKey.O,
	"KeyP":           _aeEnumKey.P,
	"KeyQ":           _aeEnumKey.Q,
	"KeyR":           _aeEnumKey.R,
	"KeyS":           _aeEnumKey.S,
	"KeyT":           _aeEnumKey.T,
	"KeyU":           _aeEnumKey.U,
	"KeyV":           _aeEnumKey.V,
	"KeyW":           _aeEnumKey.W,
	"KeyX":           _aeEnumKey.X,
	"KeyY":           _aeEnumKey.Y,
	"KeyZ":           _aeEnumKey.Z,
	"BracketLeft":    _aeEnumKey.LEFT_BRACKET,
	"Backslash":      _aeEnumKey.BACKSLASH,
	"BracketRight":   _aeEnumKey.RIGHT_BRACKET,
	"Escape":         _aeEnumKey.ESCAPE,
	"Enter":          _aeEnumKey.ENTER,
	"Tab":            _aeEnumKey.TAB,
	"Backspace":      _aeEnumKey.BACKSPACE,
	"Insert":         _aeEnumKey.INSERT,
	"Delete":         _aeEnumKey.DELETE,
	"ArrowRight":     _aeEnumKey.RIGHT,
	"ArrowLeft":      _aeEnumKey.LEFT,
	"ArrowDown":      _aeEnumKey.DOWN,
	"ArrowUp":        _aeEnumKey.UP,
	"PageUp":         _aeEnumKey.PAGE_UP,
	"PageDown":       _aeEnumKey.PAGE_DOWN,
	"CapsLock":       _aeEnumKey.CAPS_LOCK,
	"ScrollLock":     _aeEnumKey.SCROLL_LOCK,
	"NumLock":        _aeEnumKey.NUM_LOCK,
	"Pause":          _aeEnumKey.PAUSE,
	"F1":             _aeEnumKey.F1,
	"F2":             _aeEnumKey.F2,
	"F3":             _aeEnumKey.F3,
	"F4":             _aeEnumKey.F4,
	"F5":             _aeEnumKey.F5,
	"F6":             _aeEnumKey.F6,
	"F7":             _aeEnumKey.F7,
	"F8":             _aeEnumKey.F8,
	"F9":             _aeEnumKey.F9,
	"F10":            _aeEnumKey.F10,
	"F11":            _aeEnumKey.F11,
	"F12":            _aeEnumKey.F12,
	"F13":            _aeEnumKey.F13,
	"F14":            _aeEnumKey.F14,
	"F15":            _aeEnumKey.F15,
	"F16":            _aeEnumKey.F16,
	"F17":            _aeEnumKey.F17,
	"F18":            _aeEnumKey.F18,
	"F19":            _aeEnumKey.F19,
	"F20":            _aeEnumKey.F20,
	"F21":            _aeEnumKey.F21,
	"F22":            _aeEnumKey.F22,
	"F23":            _aeEnumKey.F23,
	"F24":            _aeEnumKey.F24,
	"F25":            _aeEnumKey.F25,
	"Numpad0":        _aeEnumKey.KP_0,
	"Numpad1":        _aeEnumKey.KP_1,
	"Numpad2":        _aeEnumKey.KP_2,
	"Numpad3":        _aeEnumKey.KP_3,
	"Numpad4":        _aeEnumKey.KP_4,
	"Numpad5":        _aeEnumKey.KP_5,
	"Numpad6":        _aeEnumKey.KP_6,
	"Numpad7":        _aeEnumKey.KP_7,
	"Numpad8":        _aeEnumKey.KP_8,
	"Numpad9":        _aeEnumKey.KP_9,
	"NumpadDivide":   _aeEnumKey.KP_DIVIDE,
	"NumpadMultiply": _aeEnumKey.KP_MULTIPLY,
	"NumpadSubtract": _aeEnumKey.KP_SUBTRACT,
	"NumpadAdd":      _aeEnumKey.KP_ADD,
	"NumpadEnter":    _aeEnumKey.KP_ENTER,
	"ShiftLeft":      _aeEnumKey.LEFT_SHIFT,
	"ControlLeft":    _aeEnumKey.LEFT_CONTROL,
	"AltLeft":        _aeEnumKey.LEFT_ALT,
	"ShiftRight":     _aeEnumKey.RIGHT_SHIFT,
	"ControlRight":   _aeEnumKey.RIGHT_CONTROL,
	"AltRight":       _aeEnumKey.RIGHT_ALT,
};
Object.freeze(_aeEnumKeyString);

const _aeEnumMouseButton = {
	LEFT:   0,
	MIDDLE: 1,
	RIGHT:  2,
};
type EnumMouseButton = 0 | 1 | 2;
Object.freeze(_aeEnumMouseButton);

const _aeEnumRPState = {
	ZERO:     0,
	ABSOLUTE: 1,
	RELATIVE: 2,
};
type EnumRPState = 0 | 1 | 2;
Object.freeze(_aeEnumRPState);

const _aeEnumPixelFormat = {
	RGB : new AEClassPixelFormat(0, 1, 2),
	BGR : new AEClassPixelFormat(2, 1, 0),
	RGBA: new AEClassPixelFormat(0, 1, 2, 3),
	BGRA: new AEClassPixelFormat(2, 1, 0, 3),
	ARGB: new AEClassPixelFormat(1, 2, 3, 0),
	ABGR: new AEClassPixelFormat(3, 2, 1, 0),
};
Object.freeze(_aeEnumPixelFormat);

const _aeEnumSignedAxis = {
	X_POS: new AEClassSignedAxis(_aeEnumAxis.X,  1,  0,  0),
	X_NEG: new AEClassSignedAxis(_aeEnumAxis.X, -1,  0,  0),
	Y_POS: new AEClassSignedAxis(_aeEnumAxis.Y,  0,  1,  0),
	Y_NEG: new AEClassSignedAxis(_aeEnumAxis.Y,  0, -1,  0),
	Z_POS: new AEClassSignedAxis(_aeEnumAxis.Z,  0,  0,  1),
	Z_NEG: new AEClassSignedAxis(_aeEnumAxis.Z,  0,  0, -1),
};
Object.freeze(_aeEnumSignedAxis);

// Exception to simulate abstract methods

const _AE_EXCEPTION_ABSTRACT_METHOD = "Unimplemented abstract method";

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
	"texture2D",
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
	"\t\tin highp   vec3 pos,",
	"\t\tin mediump vec3 normal) {",
	"",
	"\thighp   vec4 l1;",
	"\tlowp    vec4 l2;",
	"\tmediump vec3 lightVec;",
	"\tlowp    vec3 intensity = vec3(0, 0, 0);",
	"",
	"\tfor(lowp int i = 0; i < 8; i++) {",
	"\t\tif(i == u_dirLightCount) break;",
	"\t\tl1         = u_dirLights[2 * i];",
	"\t\tl2         = u_dirLights[2 * i + 1];",
	"\t\tintensity += l2.rgb * max(dot(normal, l1.xyz) * l1.w + l2.w, 0.0);",
	"\t}",
	"",
	"\tfor(lowp int i = 0; i < 8; i++) {",
	"\t\tif(i == u_pointLightCount) break;",
	"\t\tl1         = u_pointLights[2 * i];",
	"\t\tl2         = u_pointLights[2 * i + 1];",
	"\t\tlightVec   = l1.xyz - pos;",
	"\t\tintensity +=",
	"\t\t\tl2.rgb *",                                             // Basic color
	"\t\t\tpow(max(1.0 - length(lightVec) / l1.w, 0.0), l2.a) *", // Attenuation
	"\t\t\tmax(dot(normalize(lightVec), normal), 0.0);",          // Intensity
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
	