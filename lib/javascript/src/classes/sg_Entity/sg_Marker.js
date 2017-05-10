
// ae.scenegraph.Marker
class AEClassMarker extends AEClassEntity {

	_position: ae.util.CachedObject<ae.math.Vector3D>;
	
	// public constructor //////////////////////////////////////////////////////
	
	constructor(
			sceneGraph: ae.core.SceneGraph,
			name:       (string | null) = null) {
		
		super(sceneGraph, _aeEnumEntityType.MARKER, name, false, false, false);
		
		this._position = new AEClassCachedObject(
			AEClassVector3D.createStaticB(0, 0, 0),
			(pos) => {
				const instance = this.instance;
				return instance ? // TODO
					// $NOT_NULL: 'pos'
					instance.tfToEyeSpace.applyToOriginA(pos) : pos;
			});
		
		Object.freeze(this);
	}
	
	// internal methods //////////////////////////////////////////////////////////
	
	_invalidatePosition(): void {
		this._position.invalidate();
	}

	// public getters + setters ////////////////////////////////////////////////
	
	get position(): ae.math.Vector3D {
		return this._position.object;
	}
}