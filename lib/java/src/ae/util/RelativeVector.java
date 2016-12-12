package ae.util;

import ae.math.Vector3D;

public final class RelativeVector {
	
	private final Vector3D _direction = Vector3D.createStatic();
	
	public final RelativePoint p1 = new RelativePoint();
	public final RelativePoint p2 = new RelativePoint();
	
	public final Vector3D getDirection() {
		return getDirection(_direction);
	}
	
	public final Vector3D getDirection(final Vector3D dst) {
		return p2.getPosition(dst).sub(p1.getPosition());
	}
	
	public final RelativeVector setDirection(final Vector3D direction) {
		
		p1.setToZero();
		p2.setPosition(direction);
		
		return this;
	}
}
