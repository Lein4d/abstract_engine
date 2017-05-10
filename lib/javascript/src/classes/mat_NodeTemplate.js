
// ae.material.NodeTemplate
class AEClassNodeTemplate extends AEClassJavaObject {
	
	_inputCount: number;
	_signatures: Array<ISignature>;
	_sepStrings: Array<string>;
	
	// internal constructor ////////////////////////////////////////////////////
	
	constructor(
    		inputCount: number,
    		signatures: Array<ISignature>,
    		sepStrings: Array<string>) {
		
		super();
		
		if(sepStrings.length - 1 !== inputCount)
			throw "Mismatch between sep-string count and input count";
		
		this._inputCount = inputCount;
		this._signatures = signatures;
		this._sepStrings = sepStrings;
		
		Object.freeze(this);
	}
	
	// internal methods ////////////////////////////////////////////////////////
	
	_createNode(inputs: Array<ae.mat.Node>): ae.mat.Node {
		
		if(inputs.length !== this._inputCount)
			throw "Actual input count doesn't match expected input count";
		
		const signature  = Array(this._inputCount);
		let   outputType = _aeEnumGlslType.UNDEF;
		
		// Initialize the signature
		for(let i = 0; i < this._inputCount; i++) signature[i] = inputs[i].type;
		
		// Try finding a matching signature
		for(let i = 0; i < this._signatures.length; i++) {
			outputType = this._signatures[i].resolveSignature(signature);
			if(outputType.defined) break;
		}
		
		if(!outputType.defined) throw "No valid signature found";
		
		return new AEClassNode(this, outputType, inputs);
	}
	
	_getLastSepString(): string {
		return this._sepStrings[this._inputCount];
	}
	
	_getSepString(index: number): string {
		return this._sepStrings[index];
	}
}