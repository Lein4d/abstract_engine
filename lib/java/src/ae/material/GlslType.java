package ae.material;

public enum GlslType {
	UNDEF (Base.UNDEF,   0, null),
	BOOL  (Base.BOOLEAN, 1, "bool"),
	BOOL2 (Base.BOOLEAN, 2, "bvec2"),
	BOOL3 (Base.BOOLEAN, 3, "bvec3"),
	BOOL4 (Base.BOOLEAN, 4, "bvec4"),
	INT   (Base.INTEGER, 1, "int"),
	INT2  (Base.INTEGER, 2, "ivec2"),
	INT3  (Base.INTEGER, 3, "ivec3"),
	INT4  (Base.INTEGER, 4, "ivec4"),
	FLOAT (Base.FLOAT,   1, "float"),
	FLOAT2(Base.FLOAT,   2, "vec2"),
	FLOAT3(Base.FLOAT,   3, "vec3"),
	FLOAT4(Base.FLOAT,   4, "vec4");
	
	public enum Base {UNDEF, BOOLEAN, INTEGER, FLOAT}
	
	public final Base            baseType;
	public final int             dimension;
	public final String          glslName;
	public final CustomSignature varSignature;
	
	private GlslType(
			final Base   baseType,
			final int    dimension,
			final String glslName) {
		
		this.baseType     = baseType;
		this.dimension    = dimension;
		this.glslName     = glslName;
		this.varSignature = new CustomSignature(this);
	}
	
	public static final GlslType get(
			final Base baseType,
			final int  dimension) {
		
		switch(baseType) {
			
			case BOOLEAN:
				switch(dimension) {
					case 1: return BOOL;
					case 2: return BOOL2;
					case 3: return BOOL3;
					case 4: return BOOL4;
				}
				break;
			
			case INTEGER:
				switch(dimension) {
					case 1: return INT;
					case 2: return INT2;
					case 3: return INT3;
					case 4: return INT4;
				}
				break;
			
			case FLOAT:
				switch(dimension) {
					case 1: return FLOAT;
					case 2: return FLOAT2;
					case 3: return FLOAT3;
					case 4: return FLOAT4;
				}
				break;
			
			case UNDEF: return UNDEF;
		}
		
		return UNDEF;
	}
	
	public final boolean isDefined() {
		return this != UNDEF;
	}
	
	public final boolean isScalar() {
		return dimension == 1;
	}
}
