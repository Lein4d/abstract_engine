package ae.scenegraph.entities;

import ae.math.Matrix4D;
import ae.scenegraph.Attribute;
import ae.scenegraph.Entity;
import ae.scenegraph.SceneGraph;

public final class Camera extends Entity<Camera> {

	public interface Mode {
		// The destination matrix is supposed to be the identity matrix
		void computeProjectionMatrix(
			float ratio, Matrix4D dst, float near, float far);
	}
	
	public static final class AdaptiveFOV implements Mode {
		
		private float _visibleRatio = 1; // ratio (width : height)
		private float _minHorFOV    = 45;
		private float _minVerFOV    = 45;
		
		@Override
		public final void computeProjectionMatrix(
				final float    ratio,
				final Matrix4D dst,
				final float    near,
				final float    far) {
			
			if(ratio > _visibleRatio) {
				dst.projectPerspectiveVerFOV(ratio, 1, _minVerFOV, near, far);
			} else {
				dst.projectPerspectiveHorFOV(ratio, 1, _minHorFOV, near, far);
			}
		}
		
		public final float getMinHorFOV() {
			return _minHorFOV;
		}

		public final float getMinVerFOV() {
			return _minVerFOV;
		}
		
		public final float getVisibleRatio() {
			return _visibleRatio;
		}

		public final AdaptiveFOV setFOV(
				final float minHorFOV,
				final float minVerFOV) {
			
			_minHorFOV = minHorFOV;
			_minVerFOV = minVerFOV;
			
			_visibleRatio = (float)(
				Math.tan(Math.toRadians(minHorFOV) / 2) /
				Math.tan(Math.toRadians(minVerFOV) / 2));
			
			return this;
		}
		
		public final AdaptiveFOV setMinHorFOV(
				final float visibleRatio,
				final float minHorFOV) {
			
			_visibleRatio = visibleRatio;
			_minHorFOV    = minHorFOV;
			
			// 2 * atan(tan(fov / 2) / r)
			_minVerFOV = (float)
				Math.toDegrees(2 * Math.atan(
				Math.tan(Math.toRadians(minHorFOV) / 2) / visibleRatio));
			
			return this;
		}
		
		public final AdaptiveFOV setMinVerFOV(
				final float visibleRatio,
				final float minVerFOV) {
			
			_visibleRatio = visibleRatio;
			_minVerFOV    = minVerFOV;
			
			// 2 * atan(tan(fov / 2) * r)
			_minHorFOV = (float)
				Math.toDegrees(2 * Math.atan(
				Math.tan(Math.toRadians(minVerFOV) / 2) * visibleRatio));
			
			return this;
		}
	}
	
	public static abstract class FixedFOV implements Mode {
		
		private float _fov;
		
		protected FixedFOV(final float fov) {
			_fov = fov;
		}
		
		public final float getFOV() {
			return _fov;
		}
		
		public final FixedFOV setFOV(final float fov) {
			// TODO: Exception
			_fov = fov;
			return this;
		}
	}
	
	public static final class FixedHorFOV extends FixedFOV {
		
		public FixedHorFOV(final float fov) {
			super(fov);
		}
		
		@Override
		public final void computeProjectionMatrix(
				final float    ratio,
				final Matrix4D dst,
				final float    near,
				final float    far) {
			
			dst.projectPerspectiveHorFOV(ratio, 1, getFOV(), near, far);
		}
	}

	public static final class FixedVerFOV extends FixedFOV {

		public FixedVerFOV(final float fov) {
			super(fov);
		}
		
		@Override
		public final void computeProjectionMatrix(
				final float    ratio,
				final Matrix4D dst,
				final float    near,
				final float    far) {
			
			dst.projectPerspectiveVerFOV(ratio, 1, getFOV(), near, far);
		}
	}

	public static final float RATIO_SQUARE = 1;
	public static final float RATIO_3_2    = 3f / 2f;
	public static final float RATIO_4_3    = 4f / 3f;
	public static final float RATIO_16_9   = 16f / 9f;
	public static final float RATIO_21_9   = 21f / 9f;
	
	public final Attribute<Float> near = new Attribute<Float>(1f);
	public final Attribute<Float> far  = new Attribute<Float>(0f);
	public final Attribute<Mode>  mode = new Attribute<Mode>(null);
	
	public Camera(
			final SceneGraph sceneGraph,
			final String     name) {
		
		super(sceneGraph, Type.CAMERA, name, false, false, false);
		mode.setInternalValue(new AdaptiveFOV());
	}

	public Camera(
    		final SceneGraph sceneGraph,
    		final String     name,
    		final Mode       projectionMode) {
		
		super(sceneGraph, Type.CAMERA, name, false, false, false);
		mode.setInternalValue(projectionMode);
	}
	
	public final Matrix4D createProjectionMatrix(
			final int      width,
			final int      height,
			final Matrix4D matrix) {
		
		mode.getActiveValue().computeProjectionMatrix(
			(float)width / (float)height, matrix.toIdentity(),
			near.getActiveValue(), far.getActiveValue());
		
		return matrix;
	}
	
	public final Camera setFarClipDistance(final float clipFar) {
		// TODO: Exception
		far.setInternalValue(clipFar);
		return this;
	}
	
	public final Camera setFarClipDistanceToInfinity() {
		far.setInternalValue(0f);
		return this;
	}
	
	public final Camera setNearClipDistance(final float clipNear) {
		// TODO: Exception
		near.setInternalValue(clipNear);
		return this;
	}
	
	public final Camera setProjectionMode(final Mode projectionMode) {
		mode.setInternalValue(projectionMode);
		return this;
	}
}
