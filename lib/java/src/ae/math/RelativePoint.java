package ae.math;

import ae.scenegraph.entities.Marker;
import ae.util.Functions;

public final class RelativePoint {
	
	private enum State {ZERO, ABSOLUTE, RELATIVE}
	
	private final Vector3D _position = Vector3D.createStatic();
	
	private Marker   _marker   = null;
	private Vector3D _absolute = null;
	private State    _state    = State.ZERO;
	
	public final Vector3D getPosition() {
		return getPosition(_position);
	}
	
	public final Vector3D getPosition(final Vector3D dst) {
		
		switch(_state) {
			case ZERO:     return dst.toZeroVector();
			case ABSOLUTE: return dst.setData(_absolute);
			case RELATIVE: return dst.setData(_marker.getPosition());
		}
		
		throw new UnsupportedOperationException("Impossible error");
	}
	
	public final RelativePoint setMarker(final Marker marker) {
		
		Functions.assertNotNull(marker, null);
		
		_marker = marker;
		_state  = State.RELATIVE;
		
		return this;
	}

	public final RelativePoint setPosition(final Vector3D position) {
		
		Functions.assertNotNull(position, null);
		
		_absolute = position;
		_state    = State.ABSOLUTE;
		
		return this;
	}
	
	public final RelativePoint setToZero() {
		_state = State.ZERO;
		return this;
	}
}
