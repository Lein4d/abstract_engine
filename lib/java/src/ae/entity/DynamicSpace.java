package ae.entity;

import ae.core.SceneGraph;
import ae.math.Vector3D;

public final class DynamicSpace extends Entity<DynamicSpace> {
	
	private static final Vector3D _DEFAULT_ORIGIN = Vector3D.createConst();
	private static final Vector3D _DEFAULT_FACING = Vector3D.createConst(0, 0, 1);
	private static final Vector3D _UP             = Vector3D.createConst(0, 1, 0);
	
	private final Vector3D _x   = transformation.getValue().getColumn(0).xyz;
	private final Vector3D _y   = transformation.getValue().getColumn(1).xyz;
	private final Vector3D _z   = transformation.getValue().getColumn(2).xyz;
	private final Vector3D _pos = transformation.getValue().getColumn(3).xyz;
	
	public final Attribute<Marker> origin = new Attribute<>();
	public final Attribute<Marker> focus  = new Attribute<>();
	
	public DynamicSpace(
			final SceneGraph sceneGraph,
			final String     name) {
		
		super(sceneGraph, Type.DYNAMIC_SPACE, name, false);
	}
	
	public final void computeTransformation() {
		
		final Marker curOrigin = origin.getActiveValue();
		final Marker curFocus  = focus .getActiveValue();
		
		transformation.getValue().toIdentity();
		
		_pos.setData(
			curOrigin != null ? curOrigin.getPosition() : _DEFAULT_ORIGIN);
		
		if(curFocus != null) {
			_z.setData(curFocus.getPosition()).sub(_pos).normalize();
		} else {
			_z.setData(_DEFAULT_FACING);
		}
		
		Vector3D.cross(_UP, _z, _x).normalize();
		Vector3D.cross(_z,  _x, _y).normalize();
	}
	
	public final DynamicSpace setFocus(final Marker focus) {
		this.focus.setInternalValue(focus);
		return this;
	}
	
	public final DynamicSpace setOrigin(final Marker origin) {
		this.origin.setInternalValue(origin);
		return this;
	}
}
