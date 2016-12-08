package ae.entity;

import ae.core.SceneGraph;
import ae.math.Matrix4D;

public final class Camera extends Entity<Camera> {

	public interface Mode {
		// The destination matrix is supposed to be the identity matrix
		void computeProjectionMatrix(float ratio, Matrix4D dst);
	}
	
	public final class AdaptiveFOV implements Mode {
		
		private float _visibleRatio = 1;
		private float _minFOV       = 45;
		
		@Override
		public final void computeProjectionMatrix(
				final float    ratio,
				final Matrix4D dst) {
			
			if(ratio > _visibleRatio) {
				
				dst.projectPerspectiveVerFOV(
					ratio, 1, _minFOV,
					near.getActiveValue(), far.getActiveValue());
				
			} else {
				
				dst.projectPerspectiveHorFOV(
					ratio, 1, _minFOV,
					near.getActiveValue(), far.getActiveValue());
			}
		}
		
		public final float getMinFOV() {
			return _minFOV;
		}
		
		public final float getVisibleRatio() {
			return _visibleRatio;
		}
		
		public final AdaptiveFOV setMinFOV(final float minFOV) {
			// TODO: Exception
			_minFOV = minFOV;
			return this;
		}
		
		public final AdaptiveFOV setVisibleRatio(final float visibleRatio) {
			// TODO: Exception
			_visibleRatio = visibleRatio;
			return this;
		}
	}
	
	public abstract class FixedFOV implements Mode {
		
		private float _fov;
		
		public final float getFOV() {
			return _fov;
		}
		
		public final FixedFOV setFOV(final float fov) {
			// TODO: Exception
			_fov = fov;
			return this;
		}
	}
	
	public final class FixedHorFOV extends FixedFOV {

		@Override
		public final void computeProjectionMatrix(
				final float    ratio,
				final Matrix4D dst) {
			
			dst.projectPerspectiveHorFOV(
				ratio, 1, getFOV(),
				near.getActiveValue(), far.getActiveValue());
		}
	}

	public final class FixedVerFOV extends FixedFOV {
		
		@Override
		public final void computeProjectionMatrix(
				final float    ratio,
				final Matrix4D dst) {
			
			dst.projectPerspectiveVerFOV(
				ratio, 1, getFOV(),
				near.getActiveValue(), far.getActiveValue());
		}
	}

	public final Attribute<Float> near = new Attribute<Float>(1f);
	public final Attribute<Float> far  = new Attribute<Float>(0f);
	public final Attribute<Mode>  mode = new Attribute<Mode>(null);
	
	public Camera(
			final SceneGraph sceneGraph,
			final String     name) {
		
		super(sceneGraph, Type.CAMERA, name, false);
		mode.setInternalValue(new AdaptiveFOV());
	}

	public Camera(
    		final SceneGraph sceneGraph,
    		final String     name,
    		final Mode       projectionMode) {
		
		super(sceneGraph, Type.CAMERA, name, false);
		mode.setInternalValue(projectionMode);
	}
	
	public final Matrix4D createProjectionMatrix(
			final int      width,
			final int      height,
			final Matrix4D matrix) {
		
		mode.getActiveValue().computeProjectionMatrix(
			(float)width / (float)height, matrix.toIdentity());
		
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
}
