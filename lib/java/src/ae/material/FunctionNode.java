package ae.material;

import java.util.Arrays;

public final class FunctionNode extends Node {
	
	private enum FunctionType {
		ABS        ("abs",         _SIGNATURES_N_IN_N_OUT),
		ACOS       ("acos",        _SIGNATURES_N_IN_N_OUT),
		ASIN       ("asin",        _SIGNATURES_N_IN_N_OUT),
		ATAN       ("atan",        _SIGNATURES_N_IN_N_OUT),
		CEIL       ("ceil",        _SIGNATURES_N_IN_N_OUT),
		CLAMP      ("clamp",       _SIGNATURES_3N_IN_N_OUT),
		COS        ("cos",         _SIGNATURES_N_IN_N_OUT),
		CROSS      ("cross",       new int[][]{{3,3,3}}),
		DEGREES    ("degrees",     _SIGNATURES_N_IN_N_OUT),
		DISTANCE   ("distance",    _SIGNATURES_2N_IN_1_OUT),
		DOT        ("dot",         _SIGNATURES_2N_IN_1_OUT),
		EXP        ("exp",         _SIGNATURES_N_IN_N_OUT),
		EXP2       ("exp2",        _SIGNATURES_N_IN_N_OUT),
		FACEFORWARD("faceforward", _SIGNATURES_3N_IN_N_OUT),
		FLOOR      ("floor",       _SIGNATURES_N_IN_N_OUT),
		FRACT      ("fract",       _SIGNATURES_N_IN_N_OUT),
		INVERSESQRT("inversesqrt", _SIGNATURES_N_IN_N_OUT),
		LENGTH     ("length",      _SIGNATURES_N_IN_1_OUT),
		LOG        ("log",         _SIGNATURES_N_IN_N_OUT),
		LOG2       ("log2",        _SIGNATURES_N_IN_N_OUT),
		MAX        ("max",         _SIGNATURES_2N_IN_N_OUT),
		MIN        ("min",         _SIGNATURES_2N_IN_N_OUT),
		MIX        ("mix",         new int[][]{
			{1,1,1,1},{2,2,2,1},{2,2,2,2},{3,3,3,1},{3,3,3,3},{4,4,4,1},
			{4,4,4,4}}),
		MOD        ("mod",         _SIGNATURES_2N_IN_N_OUT),
		NORMALIZE  ("normalize",   _SIGNATURES_N_IN_N_OUT),
		REFLECT    ("reflect",     _SIGNATURES_2N_IN_N_OUT),
		REFRACT    ("refract",     _SIGNATURES_3N_IN_N_OUT),
		POW        ("pow",         new int[][]{
			{1,1,1},{2,2,1},{3,3,1},{4,4,1}}),
		RADIANS    ("radians",     _SIGNATURES_N_IN_N_OUT),
		SIGN       ("sign",        _SIGNATURES_N_IN_N_OUT),
		SIN        ("sin",         _SIGNATURES_N_IN_N_OUT),
		SMOOTHSTEP ("smoothstep",  new int[][]{
			{1,1,1,1},{2,1,1,2},{2,2,2,2},{3,1,1,3},{3,3,3,3},{4,1,1,4},
			{4,4,4,4}}),
		SQRT       ("sqrt",        _SIGNATURES_N_IN_N_OUT),
		STEP       ("sign",        new int[][]{
			{1,1,1},{2,1,2},{2,2,2},{3,1,3},{3,3,3},{4,1,4},{4,4,4}}),
		TAN        ("tan",         _SIGNATURES_N_IN_N_OUT);
		
		private final String  _name;
		private final int     _argCount;
		private final int[][] _signatures;
		
		private FunctionType(
				final String  name,
				final int[][] signatures) {
			
			_name       = name;
			_argCount   = signatures[0].length - 1;
			_signatures = signatures;
		}
		
		private final int _resolveSignature(final int[] signature) {
			
			boolean signatureFound = false;
			
			for(int[] i : _signatures) {
				signature[0] = i[0];
				if(Arrays.equals(signature, i)) {
					signatureFound = true;
					break;
				}
			}
			
			if(!signatureFound)
				throw new UnsupportedOperationException(
					"No valid signuture found");
			
			return signature[0];
		}
	}
	
	private static final int[][] _SIGNATURES_N_IN_N_OUT =
		{{1,1},{2,2},{3,3},{4,4}};
	private static final int[][] _SIGNATURES_N_IN_1_OUT =
		{{1,1},{1,2},{1,3},{1,4}};
	private static final int[][] _SIGNATURES_2N_IN_N_OUT =
		{{1,1,1},{2,2,2},{3,3,3},{4,4,4}};
	private static final int[][] _SIGNATURES_2N_IN_1_OUT =
		{{1,1,1},{1,2,2},{1,3,3},{1,4,4}};
	private static final int[][] _SIGNATURES_3N_IN_N_OUT =
		{{1,1,1,1},{2,2,2,2},{3,3,3,3},{4,4,4,4}};
	
	private final FunctionType _type;
	
	private FunctionNode(
			final String       name,
			final FunctionType type,
			final String ...   arguments) {
		
		super(name, arguments);
		_type = type;
	}

	@Override
	public final void computeTypes() {
		
		// The first value will be set to the result dimension
		final int[] signature = new int[_type._argCount + 1];
		
		for(int i = 0; i < _type._argCount; i++)
			signature[i + 1] = _getInputDimension(i);
		
		_addOutput(null, _type._resolveSignature(signature));
		_typingSuccessful();
	}

	public static final FunctionNode mix(
			final String name,
			final String op1,
			final String op2,
			final String x) {
		
		return new FunctionNode(name, FunctionType.MIX, op1, op2, x);
	}
	
	@Override
	public final void toSourceString(final StringBuilder dst) {
		
		dst.append(_type._name);
		dst.append('(');
		
		for(int i = 0; i < _type._argCount - 1; i++) {
			_getInputNode(i).toSourceString(dst);
			dst.append(", ");
		}
		
		_getInputNode(_type._argCount - 1).toSourceString(dst);
		dst.append(')');
	}
}
