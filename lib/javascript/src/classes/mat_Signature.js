
// ae.material.Signature
interface ISignature {
	getParamCount(): number;
	resolveSignature(signature: Array<AEClassGlslType>): AEClassGlslType;
}

// ae.material.CustomSignature
class AEClassCustomSignature extends AEClassJavaObject implements ISignature {
	
	_returnType: AEClassGlslType;
	_paramTypes: Array<AEClassGlslType>;
	
	// public constructor //////////////////////////////////////////////////////
	
	constructor(
			returnType: AEClassGlslType,
			paramTypes: Array<AEClassGlslType>) {
		
		super();
		
		this._returnType = returnType;
		this._paramTypes = paramTypes;
		
		Object.freeze(this);
	}

	// public methods //////////////////////////////////////////////////////////
	
	getParamCount(): number {
		return this._paramTypes.length;
	}
	
	resolveSignature(signature: Array<AEClassGlslType>): AEClassGlslType {

		if(signature.length !== this.getParamCount())
			return _aeEnumGlslType.UNDEF;
		
		for(let i = 0; i < signature.length; i++)
			if(signature[i] !== this._paramTypes[i])
				return _aeEnumGlslType.UNDEF;
		
		return this._returnType;
	}
}

class AEClassSignatureGroup extends AEClassJavaObject implements ISignature {
	
	_returnBaseType: EnumGlslTypeBase;
	_isReturnScalar: boolean;
	_paramBaseTypes: Array<EnumGlslTypeBase>;
	_isParamScalar:  Array<boolean>;
	
	// public constructor //////////////////////////////////////////////////////

	constructor(
			returnBaseType: EnumGlslTypeBase,
			isReturnScalar: boolean,
			paramBaseTypes: Array<EnumGlslTypeBase>,
			isParamScalar:  Array<boolean>) {
		
		super();
		
		this._returnBaseType = returnBaseType;
		this._isReturnScalar = isReturnScalar;
		this._paramBaseTypes = paramBaseTypes;
		this._isParamScalar  = isParamScalar;
		
		Object.freeze(this);
	}

	// public methods //////////////////////////////////////////////////////////
	
	static createWithUniqueBase(
			baseType:       EnumGlslTypeBase,
			isReturnScalar: boolean,
			isParamScalar:  Array<boolean>): ae.mat.SignatureGroup {
		
		const paramCount = isParamScalar.length;
		const sigGroup   = new AEClassSignatureGroup(
			baseType,          isReturnScalar,
			Array(paramCount), isParamScalar);
		
		// Set all param base types to the overall base type
		for(let i = 0; i < paramCount; i++)
			sigGroup._paramBaseTypes[i] = baseType;
		
		return sigGroup;
	}
	
	getParamCount(): number {
		return this._paramBaseTypes.length;
	}
	
	resolveSignature(signature: Array<AEClassGlslType>): AEClassGlslType {
		
		if(signature.length !== this.getParamCount())
			return _aeEnumGlslType.UNDEF;
		
		let dimension = 0;
		
		for(let i = 0; i < signature.length; i++) {
			
			// Check the base type
			if(signature[i].baseType !== this._paramBaseTypes[i])
				return _aeEnumGlslType.UNDEF;
			
			// Check the dimension
			if(this._isParamScalar[i]) {
				if(!signature[i].scalar) return _aeEnumGlslType.UNDEF;
			} else if(dimension > 0) {
				if(signature[i].dimension !== dimension)
					return _aeEnumGlslType.UNDEF;
			} else {
				dimension = signature[i].dimension;
			}
		}
		
		return aeFuncGetGlslType(
			this._returnBaseType,
			this._isReturnScalar || dimension === 0 ? 1 : dimension);
	}
}
