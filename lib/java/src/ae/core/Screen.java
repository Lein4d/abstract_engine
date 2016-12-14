package ae.core;

import static org.lwjgl.opengl.GL11.*;

import ae.collections.PooledOrderedSet;
import ae.math.Matrix4D;
import ae.scenegraph.entities.Camera;

public abstract class Screen {

	public class Layer {
		
		private final PooledOrderedSet<Rect> _rects = new PooledOrderedSet<>();
		
		protected final void _render() {
			for(Rect i : _rects)
				i._render(Screen.this._width, Screen.this._height);
		}
		
		public final Layer appendRects(final Rect ... rects) {
			for(Rect i : rects) _rects.insertAtEnd(i);
			return this;
		}
		
		public final Layer moveAfter(
				final Rect rect,
				final Rect refRect) {
			
			_rects.insertAfter(rect, refRect);
			return this;
		}

		public final Layer moveBefore(
				final Rect rect,
				final Rect refRect) {
			
			_rects.insertBefore(rect, refRect);
			return this;
		}
		
		public final Layer moveToBack(final Rect rect) {
			_rects.insertAtFront(rect);
			return this;
		}
		
		public final Layer moveToFront(final Rect rect) {
			_rects.insertAtEnd(rect);
			return this;
		}
		
		public final Layer setCamera(final Camera camera) {
			// TODO: Remove all rects
			_rects.insertAtEnd(new RelativeRect(camera));
			return this;
		}
		
		public final Layer split(
				final int        rowCount,
				final int        columnCount,
				final Camera ... cameras) {
			
			// TODO: Remove all rects
			
			final float rowCountF    = rowCount;
			final float columnCountF = columnCount;
			
			for(int i = 0; i < rowCount; i++) {
				for(int j = 0; j < columnCount; j++) {
					
					final int    cameraPos = i * columnCount + j;
					final Camera camera    =
						cameras.length > cameraPos ? cameras[cameraPos] : null;
					
					_rects.insertAtEnd(new RelativeRect(camera).
						setPosition(j / columnCountF, i / rowCountF).
						setSize    (1 / columnCountF, 1 / rowCountF));
				}
			}
			
			return this;
		}
	}
	
	public static abstract class Rect {
		
		private final Matrix4D _projection = new Matrix4D();
		private final int[]    _absRect    = new int[4];
		
		public Camera camera;
		
		private void _render(
				final int width,
				final int height) {
			
			if(camera == null || camera.getInstance() == null) return;
			
			_computeAbsRect(width, height, _absRect);
			
			glViewport(_absRect[0], _absRect[1], _absRect[2], _absRect[3]);
			
			camera.sceneGraph.render(
				camera,
				camera.createProjectionMatrix(
					_absRect[2], _absRect[3], _projection));
		}
		
		protected Rect(final Camera camera) {
			this.camera  = camera;
		}
		
		protected abstract void _computeAbsRect(
			int width, int height, int[] dst);
	}
	
	public static final class AbsoluteRect extends Rect {
		
		private int _x;
		private int _y;
		private int _width;
		private int _height;
		
		private final int _checkSizeDimension(final int value) {
			
			if(value < 0)
				throw new UnsupportedOperationException(
					"Rect size must be greater or equal to 0");
			
			return value;
		}

		@Override
		protected final void _computeAbsRect(
    			final int   width,
    			final int   height,
    			final int[] dst) {
			
			dst[0] = _x;
			dst[1] = _y;
			dst[2] = _width;
			dst[3] = _height;
		}
		
		public AbsoluteRect() {
			super(null);
		}

		public AbsoluteRect(final Camera camera) {
			super(camera);
		}
		
		public final AbsoluteRect setPosition(
				final int x,
				final int y) {
			
			_x = x;
			_y = y;
			
			return this;
		}
		
		public final AbsoluteRect setSize(
				final int width,
				final int height) {
			
			_width  = _checkSizeDimension(width);
			_height = _checkSizeDimension(height);
			
			return this;
		}
	}
	
	public static final class RelativeRect extends Rect {
		
		private float _x      = 0;
		private float _y      = 0;
		private float _width  = 1;
		private float _height = 1;
		
		private final float _checkSizeDimension(final float value) {
			
			if(value < 0)
				throw new UnsupportedOperationException(
					"Rect size must be greater or equal to 0");
			
			return value;
		}

		@Override
		protected final void _computeAbsRect(
    			final int   width,
    			final int   height,
    			final int[] dst) {
			
			dst[0] = Math.round(_x * width);
			dst[1] = Math.round(_y * height);
			dst[2] = Math.round((_x + _width ) * width ) - dst[0];
			dst[3] = Math.round((_y + _height) * height) - dst[1];
		}
		
		public RelativeRect() {
			super(null);
		}

		public RelativeRect(final Camera camera) {
			super(camera);
		}
		
		public final RelativeRect setPosition(
				final float x,
				final float y) {
			
			_x = x;
			_y = y;
			
			return this;
		}
		
		public final RelativeRect setSize(
				final float width,
				final float height) {
			
			_width  = _checkSizeDimension(width);
			_height = _checkSizeDimension(height);
			
			return this;
		}
	}
	
	private int _width;
	private int _height;
	
	protected abstract void _setSize(int width, int height);
	
	public final int getWidth() {
		return _width;
	}
	
	public final int getHeight() {
		return _height;
	}
	
	public abstract void render(AbstractEngine engine);
	
	public final Screen setSize(
			final int width,
			final int height) {
		
		if(width == _width && height == _height) return this;
		
		_width  = width;
		_height = height;
		
		_setSize(_width, _height);
		
		return this;
	}
}
