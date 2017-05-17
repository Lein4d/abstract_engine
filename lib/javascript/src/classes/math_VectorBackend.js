
// ae.math.VectorBackend
class AEClassVectorBackend extends AEClassJavaObject {
	
	get x(): number {return 0;}
	get y(): number {return 0;}
	get z(): number {return 0;}
	get w(): number {return 0;}
	
	set x(x: number): ae.math.VectorBackend {return this;}
	set y(y: number): ae.math.VectorBackend {return this;}
	set z(z: number): ae.math.VectorBackend {return this;}
	set w(w: number): ae.math.VectorBackend {return this;}
	
	getElement(index: number): number {
		
		switch(index) {
			case 0: return this.x;
			case 1: return this.y;
			case 2: return this.z;
			case 3: return this.w;
		}
		
		return 0;
	}
	
	setElement(
			index: number,
			value: number): ae.math.VectorBackend {
		
		switch(index) {
			case 0: this.x = value; break;
			case 1: this.y = value; break;
			case 2: this.z = value; break;
			case 3: this.w = value; break;
		}
		
		return this;
	}
}
