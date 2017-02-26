/** @flow */

let aeVarHashCounter = 0;

class AEClassJavaObject {
	
	hashCode: number;
	
	constructor() {
		this.hashCode = aeVarHashCounter++;
	}
}
