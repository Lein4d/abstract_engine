
// ae.material.GlslType
class AEClassGlslType extends AEClassJavaObject {
	
	baseType:     EnumGlslTypeBase;
	dimension:    number;
	glslName:     string;
	varSignature: ae.mat.CustomSignature;
	
	// internal constructor ////////////////////////////////////////////////////
	
	constructor(
			baseType:  EnumGlslTypeBase,
			dimension: number,
			glslName:  string) {
		
		super();
		
		this.baseType     = baseType;
		this.dimension    = dimension;
		this.glslName     = glslName;
		this.varSignature = new AEClassCustomSignature(this, []);
	}
	
	// public getters + setters ////////////////////////////////////////////////
	
	get defined(): boolean {
		return this !== _aeEnumGlslType.UNDEF;
	}
	
	get scalar(): boolean {
		return this.dimension === 1;
	}
}

// ae.material.GlslsType$get
function aeFuncGetGlslType(
		baseType:  EnumGlslTypeBase,
		dimension: number): AEClassGlslType {
	
	switch(baseType) {
		
		case _aeEnumGlslTypeBase.BOOLEAN:
			switch(dimension) {
				case 1: return _aeEnumGlslType.BOOL;
				case 2: return _aeEnumGlslType.BOOL2;
				case 3: return _aeEnumGlslType.BOOL3;
				case 4: return _aeEnumGlslType.BOOL4;
			}
			break;
		
		case _aeEnumGlslTypeBase.INTEGER:
			switch(dimension) {
				case 1: return _aeEnumGlslType.INT;
				case 2: return _aeEnumGlslType.INT2;
				case 3: return _aeEnumGlslType.INT3;
				case 4: return _aeEnumGlslType.INT4;
			}
			break;
		
		case _aeEnumGlslTypeBase.FLOAT:
			switch(dimension) {
				case 1: return _aeEnumGlslType.FLOAT;
				case 2: return _aeEnumGlslType.FLOAT2;
				case 3: return _aeEnumGlslType.FLOAT3;
				case 4: return _aeEnumGlslType.FLOAT4;
			}
			break;
		
		case _aeEnumGlslTypeBase.TEXTURE:
			switch(dimension) {
				case 1: return _aeEnumGlslType.TEX1;
				case 2: return _aeEnumGlslType.TEX2;
				case 3: return _aeEnumGlslType.TEX3;
			}
			break;
		
		case _aeEnumGlslType.UNDEF: return _aeEnumGlslType.UNDEF;
	}
	
	return _aeEnumGlslType.UNDEF;
}
