package ae.material1;

final class SignatureGroup implements Signature {
	
	private final GlslType.Base   _returnBaseType;
	private final boolean         _isReturnScalar;
	private final GlslType.Base[] _paramBaseTypes;
	private final boolean[]       _isParamScalar;

	static final SignatureGroup SIG_GROUP_FLOAT_N_IN_N_OUT =
		new SignatureGroup(GlslType.Base.FLOAT, false, false);

	static final SignatureGroup SIG_GROUP_FLOAT_N_IN_1_OUT =
		new SignatureGroup(GlslType.Base.FLOAT, true, false);

	static final SignatureGroup SIG_GROUP_FLOAT_2N_IN_N_OUT =
		new SignatureGroup(GlslType.Base.FLOAT, false, false, false);

	static final SignatureGroup SIG_GROUP_FLOAT_2N_IN_1_OUT =
		new SignatureGroup(GlslType.Base.FLOAT, true, false, false);

	static final SignatureGroup SIG_GROUP_FLOAT_3N_IN_N_OUT =
		new SignatureGroup(GlslType.Base.FLOAT, false, false, false, false);

	static final SignatureGroup SIG_GROUP_FLOAT_3N_IN_1_OUT =
		new SignatureGroup(GlslType.Base.FLOAT, true, false, false, false);
	
	SignatureGroup(
			final GlslType.Base baseType,
			final boolean       isReturnScalar,
			final boolean ...   isParamScalar) {
		
		_returnBaseType = baseType;
		_isReturnScalar = isReturnScalar;
		_paramBaseTypes = new GlslType.Base[isParamScalar.length];
		_isParamScalar  = isParamScalar;
		
		// Set all param base types to the overall base type
		for(int i = 0; i < _paramBaseTypes.length; i++)
			_paramBaseTypes[i] = baseType;
	}
	
	SignatureGroup(
			final GlslType.Base   returnBaseType,
			final boolean         isReturnScalar,
			final GlslType.Base[] paramBaseTypes,
			final boolean[]       isParamScalar) {
		
		_returnBaseType = returnBaseType;
		_isReturnScalar = isReturnScalar;
		_paramBaseTypes = paramBaseTypes;
		_isParamScalar  = isParamScalar;
	}

	@Override
	public final GlslType resolveSignature(final GlslType[] signature) {
		
		if(signature.length != _isParamScalar.length) return GlslType.UNDEF;
		
		int dimension = 0;
		
		for(int i = 0; i < signature.length; i++) {
			
			// Check the base type
			if(signature[i].baseType != _paramBaseTypes[i])
				return GlslType.UNDEF;
			
			// Check the dimension
			if(_isParamScalar[i]) {
				if(!signature[i].isScalar()) return GlslType.UNDEF;
			} else if(dimension > 0) {
				if(signature[i].dimension != dimension)
					return GlslType.UNDEF;
			} else {
				dimension = signature[i].dimension;
			}
		}
		
		return
			GlslType.get(_returnBaseType, _isReturnScalar ? 1 : dimension);
	}
}
