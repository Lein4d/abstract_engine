
// ae.scenegraph.DynamicSpace
class AEClassDynamicSpace extends AEClassEntity {
	
	_pos: ae.math.Vector3D;
	
	origin:   ae.sg.ConstAttribute<ae.math.RelativePoint>;
	viewAxis: ae.sg.ConstAttribute<ae.math.RelativeVector>;
	upAxis:   ae.sg.ConstAttribute<ae.math.RelativeVector>;
	
	viewAxisMapping: ae.sg.Attribute<ae.math.SignedAxis>;
	
	// internal methods ////////////////////////////////////////////////////////
	
	_computeTransformation(): void {
		
		const transformation = this.transformation.valueNN;
		const curViewAxis    = this.viewAxisMapping.activeValueNN;
		const axisMapping    = _AE_DS_AXIS_MAP[curViewAxis.axis.index];
		
		const x = transformation.getColumn(axisMapping[0]).xyz;
		const y = transformation.getColumn(axisMapping[1]).xyz;
		const z = transformation.getColumn(axisMapping[2]).xyz;
		
		transformation.toIdentity();
		
		this._pos.setData(this.origin  .activeValueNN.getPosition());
		z        .setData(this.viewAxis.activeValueNN.getDirection()).normalize();
		
		if(!curViewAxis.positive) z.multA(-1);
		
		AEClassVector3D.cross(
			this.upAxis.activeValueNN.getDirection(), z, x).normalize();
		AEClassVector3D.cross(z, x, y).normalize();
	}
	
	// public constructor //////////////////////////////////////////////////////
	
	constructor(
			sceneGraph: ae.core.SceneGraph,
			name:       (string | null)) {
		
		super(
			sceneGraph, _aeEnumEntityType.DYNAMIC_SPACE, name,
			false, true, false);
		
		this._pos = this.transformation.valueNN.getColumn(3).xyz;
		
		this.origin   = new AEClassConstAttribute(new AEClassRelativePoint());
		this.viewAxis = new AEClassConstAttribute(
			new AEClassRelativeVector().setDirection(_aeEnumAxis.Z.v));
		this.upAxis   = new AEClassConstAttribute(
			new AEClassRelativeVector().setDirection(_aeEnumAxis.Y.v));
		
		this.viewAxisMapping = new AEClassAttribute(_aeEnumSignedAxis.Z_POS);
		
		Object.freeze(this);
	}
	
	// public methods //////////////////////////////////////////////////////////
	
	setOrigin(origin: ae.sg.Marker): this {
		this.origin.valueNN.setMarker(origin);
		return this;
	}

	setUpDirection(direction: ae.math.Vector3D): this {
		this.upAxis.valueNN.setDirection(direction);
		return this;
	}

	setUpFocus(focus: ae.sg.Marker): this {
		
		// Link the starting point of the view axis to the origin attribute by
		// sharing the same Vector3D-object
		this.upAxis.valueNN.p1.setPosition(this.origin.valueNN.getPosition());
		this.upAxis.valueNN.p2.setMarker(focus);
		
		return this;
	}
	
	setViewAxisMapping(axis: ae.math.SignedAxis): this {
		this.viewAxisMapping.internalValue = axis;
		return this;
	}
	
	setViewDirection(direction: ae.math.Vector3D): this {
		this.viewAxis.valueNN.setDirection(direction);
		return this;
	}
	
	setViewFocus(focus: ae.sg.Marker): this {
		
		// Link the starting point of the view axis to the origin attribute by
		// sharing the same Vector3D-object
		this.viewAxis.valueNN.p1.setPosition(this.origin.valueNN.getPosition());
		this.viewAxis.valueNN.p2.setMarker(focus);
		
		return this;
	}
}
