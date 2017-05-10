
// ae.scenegraph.Camera
class AEClassCamera extends AEClassEntity {
	
	near: AEClassAttribute<number>;
	far:  AEClassAttribute<number>;
	mode: AEClassAttribute<ICameraMode>;
	
	// public constructor //////////////////////////////////////////////////////
	
	constructor(
    		sceneGraph:      ae.core.SceneGraph,
    		name:           (string | null) = null,
    		projectionMode:  ICameraMode    = new AEClassCModeAdaptiveFOV()) {
		
		super(sceneGraph, _aeEnumEntityType.CAMERA, name, false, false, false);
		
		this.near = new AEClassAttribute(1);
		this.far  = new AEClassAttribute(0);
		this.mode = new AEClassAttribute(projectionMode);
		
		Object.freeze(this);
	}
	
	// public methods //////////////////////////////////////////////////////////
	
	createProjectionMatrix(
			width:  number,
			height: number,
			matrix: ae.math.Matrix4D): ae.math.Matrix4D {
		
		this.mode.activeValueNN._computeProjectionMatrix(
			width / height, matrix.toIdentity(),
			this.near.activeValueNN, this.far.activeValueNN);
		
		return matrix;
	}
	
	setFarClipDistance(clipFar: number): this {
		// TODO: Exception
		this.far.internalValue = clipFar;
		return this;
	}
	
	setFarClipDistanceToInfinity(): this {
		this.far.internalValue = 0;
		return this;
	}
	
	setNearClipDistance(clipNear: number): this {
		// TODO: Exception
		this.near.internalValue = clipNear;
		return this;
	}
	
	setProjectionMode(projectionMode: ICameraMode): this {
		this.mode.internalValue = projectionMode;
		return this;
	}
}

// ae.scenegraph.Camera$Mode
interface ICameraMode {
	// The destination matrix is supposed to be the identity matrix
	_computeProjectionMatrix(
		ratio: number,
		dst:   ae.math.Matrix4D,
		near:  number,
		far:   number): void;
}

// ae.scenegraph.Camera$AdaptiveFOV
class AEClassCModeAdaptiveFOV {
	
	_p: {
		visibleRatio: number; // ratio (width : height)
		minHorFOV:    number;
		minVerFOV:    number;
	}
	
	// intenal methods /////////////////////////////////////////////////////////
	
	_computeProjectionMatrix(
			ratio: number,
			dst:   ae.math.Matrix4D,
			near:  number,
			far:   number): void {
		
		if(ratio > this.visibleRatio) {
			dst.projectPerspectiveVerFOV(ratio, 1, this.minVerFOV, near, far);
		} else {
			dst.projectPerspectiveHorFOV(ratio, 1, this.minHorFOV, near, far);
		}
	}
	
	// public constructor //////////////////////////////////////////////////////
	
	constructor() {
		
		this._p = {
			visibleRatio: 1,
			minHorFOV:    45,
			minVerFOV:    45,
		}
		
		Object.freeze(this);
	}
	
	// public getters + setters ////////////////////////////////////////////////
	
	get minHorFOV   (): number {return this._p.minHorFOV;}
	get minVerFOV   (): number {return this._p.minVerFOV;}
	get visibleRatio(): number {return this._p.visibleRatio;}
	
	// public methods //////////////////////////////////////////////////////////
	
	setFOV(
			minHorFOV: number,
			minVerFOV: number): this {
		
		this._p.minHorFOV = minHorFOV;
		this._p.minVerFOV = minVerFOV;
		
		this._p.visibleRatio =
			Math.tan(aeFuncToRadians(minHorFOV) / 2) /
			Math.tan(aeFuncToRadians(minVerFOV) / 2);
		
		return this;
	}
	
	setMinHorFOV(
			visibleRatio: number,
			minHorFOV:    number): this {
		
		this._p.visibleRatio = visibleRatio;
		this._p.minHorFOV    = minHorFOV;
		
		// 2 * atan(tan(fov / 2) / r)
		this._p.minVerFOV =
			aeFuncToDegrees(2 * Math.atan(
			Math.tan(aeFuncToRadians(minHorFOV) / 2) / visibleRatio));
		
		return this;
	}
	
	setMinVerFOV(
			visibleRatio: number,
			minVerFOV:    number): this {
		
		this._p.visibleRatio = visibleRatio;
		this._p.minVerFOV    = minVerFOV;
		
		// 2 * atan(tan(fov / 2) * r)
		this._p.minHorFOV =
			aeFuncToDegrees(2 * Math.atan(
			Math.tan(aeFuncToRadians(minVerFOV) / 2) * visibleRatio));
		
		return this;
	}
}

// ae.scenegraph.Camera$FixedFOV
class AEClassCModeFixedFOV {
	
	_p: {
		fov: number;
	}
	
	// proteced constructor ////////////////////////////////////////////////////
	
	constructor(fov: number) {
		this._p = {fov: fov};
		Object.freeze(this);
	}
	
	// public getters + setters ////////////////////////////////////////////////
	
	get fov(): number {return this._p.fov;}
	
	// public methods //////////////////////////////////////////////////////////
	
	setFOV(fov: number): this {
		// TODO: Exception
		this._p.fov = fov;
		return this;
	}
}

// ae.scenegraph.Camera$FixedHorFOV
class AEClassCModeFixedHorFOV extends AEClassCModeFixedFOV {
	
	// intenal methods /////////////////////////////////////////////////////////
	
	_computeProjectionMatrix(
			ratio: number,
			dst:   ae.math.Matrix4D,
			near:  number,
			far:   number): void {
		
		dst.projectPerspectiveHorFOV(ratio, 1, this.fov, near, far);
	}
	
	// public constructor //////////////////////////////////////////////////////
	
	constructor(fov: number) {
		super(fov);
	}
}

// ae.scenegraph.Camera$FixedVerFOV
class AEClassCModeFixedVerFOV extends AEClassCModeFixedFOV {

	// intenal methods /////////////////////////////////////////////////////////
	
	_computeProjectionMatrix(
			ratio: number,
			dst:   ae.math.Matrix4D,
			near:  number,
			far:   number): void {
		
		dst.projectPerspectiveVerFOV(ratio, 1, this.fov, near, far);
	}
	
	// public constructor //////////////////////////////////////////////////////
	
	constructor(fov: number) {
		super(fov);
	}
}
