package ae.core;

import static org.lwjgl.opengl.GL11.*;

import ae.collections.PooledOrderedSet;
import ae.entity.Camera;
import ae.math.Matrix4D;

public abstract class Screen {

	public class Layer {
		
		private final Screen                 _parent;
		private final PooledOrderedSet<Rect> _rects = new PooledOrderedSet<>();
		
		protected Layer() {
			_parent = Screen.this;
		}

		protected final void _render() {
			for(Rect i : _rects) i._render();
		}
		
		public final Layer appendRects(final Rect ... rects) {
			for(Rect i : rects) if(i._parent == _parent) _rects.insertAtEnd(i);
			return this;
		}
		
		public final Layer moveAfter(
				final Rect rect,
				final Rect refRect) {
			
			if(rect._parent == _parent && refRect._parent == _parent)
				_rects.insertAfter(rect, refRect);
			
			return this;
		}

		public final Layer moveBefore(
				final Rect rect,
				final Rect refRect) {
			
			if(rect._parent == _parent && refRect._parent == _parent)
				_rects.insertBefore(rect, refRect);
			
			return this;
		}
		
		public final Layer moveToBack(final Rect rect) {
			if(rect._parent == _parent) _rects.insertAtFront(rect);
			return this;
		}
		
		public final Layer moveToFront(final Rect rect) {
			if(rect._parent == _parent) _rects.insertAtEnd(rect);
			return this;
		}
	}
	
	public abstract class Rect {

		private final Screen   _parent;
		private final Matrix4D _projection = new Matrix4D();
		
		public Camera camera;
		
		private void _render() {
			
			if(camera == null) return;
			
			final int width  = getWidth();
			final int height = getHeight();
			
			glViewport(getX(), getY(), width, height);
			
			camera.sceneGraph.draw(
				camera,
				camera.createProjectionMatrix(width, height, _projection));
		}
		
		protected Rect(final Camera camera) {
			this._parent = Screen.this;
			this.camera  = camera;
		}
		
		public abstract int getX();
		public abstract int getY();
		public abstract int getWidth();
		public abstract int getHeight();
	}
	
	public final class AbsoluteRect extends Rect {
		
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

		public AbsoluteRect() {
			super(null);
		}

		public AbsoluteRect(final Camera camera) {
			super(camera);
		}
		
		@Override
		public final int getWidth() {
			return _width;
		}

		@Override
		public final int getHeight() {
			return _height;
		}

		@Override
		public final int getX() {
			return _x;
		}

		@Override
		public final int getY() {
			return _y;
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
	
	public final class RelativeRect extends Rect {
		
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
		
		public RelativeRect() {
			super(null);
		}

		public RelativeRect(final Camera camera) {
			super(camera);
		}
		
		@Override
		public final int getWidth() {
			return Math.round((_x + _width) * Screen.this._width) - getX();
		}

		@Override
		public final int getHeight() {
			return Math.round((_y + _height) * Screen.this._height) - getY();
		}

		@Override
		public final int getX() {
			return Math.round(_x * Screen.this._width);
		}

		@Override
		public final int getY() {
			return Math.round(_y * Screen.this._height);
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
