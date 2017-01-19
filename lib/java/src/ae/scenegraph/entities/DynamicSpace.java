package ae.scenegraph.entities;

import ae.core.SceneGraph;
import ae.math.Axis;
import ae.math.Matrix4D;
import ae.math.RelativePoint;
import ae.math.RelativeVector;
import ae.math.SignedAxis;
import ae.math.Vector3D;
import ae.scenegraph.Attribute;
import ae.scenegraph.ConstAttribute;
import ae.scenegraph.Entity;

public final class DynamicSpace extends Entity<DynamicSpace> {
	
	private static final int[][] AXIS_MAP = {{1, 2, 0}, {2, 0, 1}, {0, 1, 2}};
	
	private final Matrix4D _transformation = transformation.getValue();
	private final Vector3D _pos            = _transformation.getColumn(3).xyz;
	
	public final ConstAttribute<RelativePoint>  origin   =
		new ConstAttribute<>(new RelativePoint());
	public final ConstAttribute<RelativeVector> viewAxis =
		new ConstAttribute<>(new RelativeVector().setDirection(Axis.Z.v));
	public final ConstAttribute<RelativeVector> upAxis   =
		new ConstAttribute<>(new RelativeVector().setDirection(Axis.Y.v));
	
	public final Attribute<SignedAxis> viewAxisMapping =
		new Attribute<>(SignedAxis.Z_POS);
	
	public DynamicSpace(
			final SceneGraph sceneGraph,
			final String     name) {
		
		super(sceneGraph, Type.DYNAMIC_SPACE, name, false, true, false);
	}
	
	public final void computeTransformation() {
		
		final SignedAxis curViewAxis = viewAxisMapping.getActiveValue();
		final int[]      axisMapping = AXIS_MAP[curViewAxis.axis.index];
		
		final Vector3D x = _transformation.getColumn(axisMapping[0]).xyz;
		final Vector3D y = _transformation.getColumn(axisMapping[1]).xyz;
		final Vector3D z = _transformation.getColumn(axisMapping[2]).xyz;
		
		transformation.getValue().toIdentity();
		
		_pos.setData(origin  .getActiveValue().getPosition());
		z   .setData(viewAxis.getActiveValue().getDirection()).normalize();
		
		if(!curViewAxis.positive) z.mult(-1);
		
		Vector3D.cross(
			upAxis.getActiveValue().getDirection(), z, x).normalize();
		Vector3D.cross(z,  x, y).normalize();
	}
	
	public final DynamicSpace setOrigin(final Marker origin) {
		this.origin.getValue().setMarker(origin);
		return this;
	}

	public final DynamicSpace setUpDirection(final Vector3D direction) {
		upAxis.getValue().setDirection(direction);
		return this;
	}

	public final DynamicSpace setUpFocus(final Marker focus) {
		
		// Link the starting point of the view axis to the origin attribute by
		// sharing the same Vector3D-object
		upAxis.getValue().p1.setPosition(origin.getValue().getPosition());
		upAxis.getValue().p2.setMarker(focus);
		
		return this;
	}
	
	public final DynamicSpace setViewAxisMapping(final SignedAxis axis) {
		viewAxisMapping.setInternalValue(axis);
		return this;
	}
	
	public final DynamicSpace setViewDirection(final Vector3D direction) {
		viewAxis.getValue().setDirection(direction);
		return this;
	}

	public final DynamicSpace setViewFocus(final Marker focus) {
		
		// Link the starting point of the view axis to the origin attribute by
		// sharing the same Vector3D-object
		viewAxis.getValue().p1.setPosition(origin.getValue().getPosition());
		viewAxis.getValue().p2.setMarker(focus);
		
		return this;
	}
}
