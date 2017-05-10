
// ae.math.Axis
class AEClassAxis extends AEClassJavaObject {
	
	index: number;
	v:     ae.math.Vector3D;
	
	// internal constructor ////////////////////////////////////////////////////
	
	constructor(
			index: number,
			x:     number,
			y:     number,
			z:     number) {
		
		super();
		
		this.index = index;
		this.v     = AEClassVector3D.createConstB(x, y, z);
		
		Object.freeze(this);
	}
}

// ae.math.SignedAxis
class AEClassSignedAxis extends AEClassJavaObject {
	
	axis:     ae.math.Axis;
	positive: boolean;
	v:        ae.math.Vector3D;
	
	// internal constructor ////////////////////////////////////////////////////
	
	constructor(
			axis: ae.math.Axis,
			x:    number,
			y:    number,
			z:    number) {
		
		super();
		
		this.axis     = axis;
		this.positive = x + y + z > 0;
		this.v        = AEClassVector3D.createConstB(x, y, z);
		
		Object.freeze(this);
	}
}
