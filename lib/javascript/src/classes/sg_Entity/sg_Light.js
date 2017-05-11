
// ae.scenegraph.DirectionalLight
class AEClassDirectionalLight extends AEClassEntity {

	color:     ae.sg.ConstAttribute<ae.math.Vector3D>;
	direction: ae.sg.ConstAttribute<ae.math.Vector3D>;
	dotBias:   ae.sg.ConstAttribute<Array<number>>;
	
	// public constructor //////////////////////////////////////////////////////
	
	constructor(
			sceneGraph: ae.core.SceneGraph,
			name:       (string | null) = null) {
		
		super(
			sceneGraph, _aeEnumEntityType.DIRECTIONAL_LIGHT, name,
			false, false, true);
		
		this.dotBias   = new AEClassConstAttribute([1, 0]);
		this.color     =
			new AEClassConstAttribute(AEClassVector3D.createStaticB(1, 1, 1));	
		this.direction =
			new AEClassConstAttribute(AEClassVector3D.createStaticB(0, 1, 0));
		
		Object.freeze(this);
	}
	
	// public methods //////////////////////////////////////////////////////////
	
	makeAmbient(): this {
		
		this.dotBias.valueNN[0] = 0.5;
		this.dotBias.valueNN[1] = 0.5;
		
		return this;
	}

	makeSpot(): this {
		
		this.dotBias.valueNN[0] = 1;
		this.dotBias.valueNN[1] = 0;
		
		return this;
	}
}

// ae.scenegraph.PointLight
class AEClassPointLight extends AEClassEntity {

	color:       ae.sg.ConstAttribute<ae.math.Vector3D>;
	attenuation: ae.sg.ConstAttribute<Array<number>>;
	
	// public constructor //////////////////////////////////////////////////////
	
	constructor(
			sceneGraph: ae.core.SceneGraph,
			name:       (string | null) = null) {
		
		super(
			sceneGraph, _aeEnumEntityType.POINT_LIGHT, name,
			false, false, true);
		
		this.attenuation = new AEClassConstAttribute([1, 1]);
		this.color       =
			new AEClassConstAttribute(AEClassVector3D.createStaticB(1, 1, 1));
		
		Object.freeze(this);
	}
	
	makeLinear(): this {
		return this.setAttenuationExponent(1);
	}

	makeQuadratic(): this {
		return this.setAttenuationExponent(2);
	}
	
	setAttenuationExponent(exponent: number): this {
		this.attenuation.valueNN[1] = exponent;
		return this;
	}
	
	setRange(range: number): this {
		this.attenuation.valueNN[0] = range;
		return this;
	}
}
