/** @flow */

interface IObject {}

let aeVarHashCounter = 0;

class AEClassJavaObject {
	
	hashCode: number;
	
	constructor() {
		this.hashCode = aeVarHashCounter++;
	}
	
	equals(obj: IObject): boolean {return this === obj;}
	
	finalize(): void {}
}
