package ae.material;

final class NodeTemplate {
	
	private final int         _inputCount;
	private final Signature[] _signatures;
	private final String[]    _sepStrings;
	
	NodeTemplate(
    		final int        inputCount,
    		final Signature  signature,
    		final String ... sepStrings) {
		
		this(inputCount, new Signature[]{signature}, sepStrings);
	}
	
	NodeTemplate(
    		final int         inputCount,
    		final Signature[] signatures,
    		final String ...  sepStrings) {
		
		if(sepStrings.length - 1 != inputCount)
			throw new UnsupportedOperationException(
				"Mismatch between sep-string count and input count");
		
		_inputCount = inputCount;
		_signatures = signatures;
		_sepStrings = sepStrings;
	}
	
	final Node createNode(final Node ... inputs) {
		
		if(inputs.length != _inputCount)
			throw new UnsupportedOperationException(
				"Actual input count doesn't match expected input count");
		
		final GlslType[] signature  = new GlslType[_inputCount];
		GlslType         outputType = GlslType.UNDEF;
		
		// Initialize the signature
		for(int i = 0; i < _inputCount; i++) signature[i] = inputs[i].type;
		
		// Try finding a matching signature
		for(Signature i : _signatures) {
			outputType = i.resolveSignature(signature);
			if(outputType.isDefined()) break;
		}
		
		if(!outputType.isDefined())
			throw new UnsupportedOperationException("No valid signature found");
		
		return new Node(this, outputType, inputs);
	}
	
	final String getLastSepString() {
		return _sepStrings[_inputCount];
	}
	
	final String getSepString(final int index) {
		return _sepStrings[index];
	}
}
