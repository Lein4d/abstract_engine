package ae.material;

final class CustomSignature implements Signature {
	
	private final GlslType   _returnType;
	private final GlslType[] _paramTypes;
	
	CustomSignature(
			final GlslType     returnType,
			final GlslType ... paramTypes) {
		
		_returnType = returnType;
		_paramTypes = paramTypes;
	}

	@Override
	public final int getParamCount() {
		return _paramTypes.length;
	}
	
	@Override
	public final GlslType resolveSignature(final GlslType[] signature) {

		if(signature.length != _paramTypes.length) return GlslType.UNDEF;
		
		for(int i = 0; i < signature.length; i++)
			if(signature[i] != _paramTypes[i]) return GlslType.UNDEF;
		
		return _returnType;
	}
}
