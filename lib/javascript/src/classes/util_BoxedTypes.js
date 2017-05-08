
class AEClassInteger extends AEClassJavaObject {
	
	value: number;
	
	constructor(value: number = 0) {
		
		super();
		
		this.hashCode = Math.abs(value);
		this.value    = value;	
		
		Object.freeze(this);
	}
	
	equals(obj: IObject) {
		if(!(obj instanceof AEClassInteger)) return false;
		return this.value === obj.value;
	}
}

class AEClassString extends AEClassJavaObject {
	
	str: string;
	
	constructor(str: string = "") {
		
		super();
		
		this.hashCode = 0;
		this.str      = str;	
		
		// Java-implementation for hash value calculation
		if(str.length !== 0) {
			
			for(let i = 0; i < str.length; i++) {
				
				const chr = str.charCodeAt(i);
				
				this.hashCode  = ((this.hashCode << 5) - this.hashCode) + chr;
				this.hashCode |= 0; // Convert to 32bit integer
			}
			
			this.hashCode = Math.abs(this.hashCode);
		}
		
		Object.freeze(this);
	}
	
	equals(obj: IObject) {
		if(!(obj instanceof AEClassString)) return false;
		return this.str === obj.str;
	}
}
