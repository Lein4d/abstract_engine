
ae.mesh.PrimitiveTypeEnumClass = class PrimitiveTypeEnumClass {
	
	glMode: number;
	size:   number;
	
	constructor(
			glMode: number,
			size:   number) {
		
		this.glMode = glMode;
		this.size   = size;
		
		Object.freeze(this);
	}
	
	static fromPrimitiveSize(size: number): ae.mesh.PrimitiveTypeEnumClass {
		
		switch(size) {
			case 3: return ae.mesh.PrimitiveType.TRIANGLE;
			case 4: return ae.mesh.PrimitiveType.QUAD;
		}
		
		throw "Size doesn't match a primitive type";
	}
};

ae.mesh.PrimitiveType = {
	TRIANGLE : new ae.mesh.PrimitiveTypeEnumClass(0, 3),
	QUAD     : new ae.mesh.PrimitiveTypeEnumClass(0, 4)
};

Object.freeze(ae.mesh.PrimitiveType);
