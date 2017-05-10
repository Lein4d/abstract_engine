
// ae.material.Node
class AEClassNode extends AEClassJavaObject {
	
	_template: ae.mat.NodeTemplate;
	_inputs:   Array<ae.mat.Node>;
	
	// internal
	type: AEClassGlslType;
	
	// internal constructor ////////////////////////////////////////////////////
	
	constructor(
			template: ae.mat.NodeTemplate,
			type:     AEClassGlslType,
			inputs:   Array<ae.mat.Node>) {
		
		super();
		
		this._template = template;
		this._inputs   = inputs;
		this.type      = type;
		
		Object.freeze(this);
	}
	
	// internal methods ////////////////////////////////////////////////////////
	
	static _createFromType(
			name: string,
			type: AEClassGlslType): ae.mat.Node {
		
		return new AEClassNode(
			new AEClassNodeTemplate(0, [type.varSignature], [name]), type, []);
	}
	
	_toSourceString(): string {
		
		let sourceString = "";
		
		for(let i = 0; i < this._inputs.length; i++)
			sourceString +=
				this._template._getSepString(i) +
				this._inputs[i]._toSourceString();
		
		return sourceString + this._template._getLastSepString();
	}
}