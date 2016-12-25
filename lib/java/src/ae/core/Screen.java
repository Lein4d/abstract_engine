package ae.core;

import static org.lwjgl.opengl.GL11.*;
import static org.lwjgl.opengl.GL14.*;
import static org.lwjgl.opengl.GL30.*;

import ae.collections.PooledOrderedSet;
import ae.math.Matrix4D;
import ae.scenegraph.entities.Camera;
import ae.util.CachedObject;

public abstract class Screen {

	public class Layer {
		
		private final PooledOrderedSet<Rect> _rects = new PooledOrderedSet<>();
		
		public final Screen screen = Screen.this;
		
		final void _renderObjectPicking(
				final ObjectPicker objectPicker,
    			final int          x,
    			final int          y) {
			
			for(Rect i : _rects.reverse) {
				if(i._containsPoint(x, y)) {
					glScissor(x, y, 1, 1);
					i._render(false);
					break;
				}
			}
		}
		
		protected final void _invalidateRects() {
			for(Rect i : _rects)
				i._invalidate(Screen.this._width, Screen.this._height);
		}
		
		protected final void _renderVisual() {
			for(Rect i : _rects) i._render(true);
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

		public final void pickInstance(
	    		final ObjectPicker.PickedCallback callback) {
			
			pickInstance(
				Screen.this.engine.input.getX(),
				Screen.this.engine.input.getY(),
				callback);
		}
		
		public final void pickInstance(
	    		final int                         x,
	    		final int                         y,
	    		final ObjectPicker.PickedCallback callback) {
			
			if(!Screen.this.supportsEntityPicking)
				throw new UnsupportedOperationException(
					"The layer doesn't support entity picking");
			
			Screen.this._picker.pickInstance(this, x, y, callback);
		}
		
		public final Layer setCamera(final Camera camera) {
			
			_rects.clear();
			_rects.insertAtEnd(new RelativeRect(camera));
			
			return this;
		}
		
		public final Layer split(
				final int        rowCount,
				final int        columnCount,
				final Camera ... cameras) {
			
			_rects.clear();
			
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
		
		private final Matrix4D            _projection = new Matrix4D();
		private final CachedObject<int[]> _absRect    = new CachedObject<int[]>(
			new int[4], (rect) -> _computeCachedRect(rect));
		
		private int _screenWidth;
		private int _screenHeight;
		
		public Camera camera;

		private final int[] _computeCachedRect(final int[] dst) {
			_computeAbsRect(_screenWidth, _screenHeight, dst);
			return dst;
		}
		
		private final boolean _containsPoint(
				final int x,
				final int y) {
			
			final int[] absRect = _absRect.getObject();
			
			return
				x >= absRect[0] && x < absRect[0] + absRect[2] &&
				y >= absRect[1] && y < absRect[1] + absRect[3];
		}
		
		private final void _invalidate(
				final int screenWidth,
				final int screenHeight) {
			
			_screenWidth  = screenWidth;
			_screenHeight = screenHeight;
			
			_absRect.invalidate();
		}
		
		private void _render(final boolean visual) {
			
			if(camera == null || camera.getInstance() == null) return;
			
			final int[] absRect = _absRect.getObject();
			
			// The viewport must always be set to the full rect
			glViewport(absRect[0], absRect[1], absRect[2], absRect[3]);
			
			if(visual)
				glScissor(absRect[0], absRect[1], absRect[2], absRect[3]);
			
			glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
			
			camera.sceneGraph.render(
				camera,
				camera.createProjectionMatrix(
					absRect[2], absRect[3], _projection),
				visual);
		}
		
		protected Rect(final Camera camera) {
			this.camera  = camera;
		}
		
		protected abstract void _computeAbsRect(
			int width, int height, int[] dst);
		
		protected final void _invalidate() {
			_absRect.invalidate();
		}
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
			
			_invalidate();
			return this;
		}
		
		public final AbsoluteRect setSize(
				final int width,
				final int height) {
			
			_width  = _checkSizeDimension(width);
			_height = _checkSizeDimension(height);
			
			_invalidate();
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
			
			_invalidate();
			return this;
		}
		
		public final RelativeRect setSize(
				final float width,
				final float height) {
			
			_width  = _checkSizeDimension(width);
			_height = _checkSizeDimension(height);
			
			_invalidate();
			return this;
		}
	}
	
	private final ObjectPicker _picker;
	
	private int _width;
	private int _height;
	
	protected int _fbo = 0;
	protected int _rbo = 0;
	
	public final AbstractEngine engine;
	public final boolean        hasOffscreenBuffer;
	public final boolean        supportsEntityPicking;
	
	final void executePicking() {
		
		glBindFramebuffer(GL_FRAMEBUFFER, _fbo);
		
		_picker.executeJobs();
		
		// TODO: necessary?
		glBindFramebuffer(GL_FRAMEBUFFER, 0);
	}
	
	protected Screen(
			final AbstractEngine engine,
			final boolean        fbo,
			final int            pickingLayer) {

		this.engine = engine;
		
		supportsEntityPicking = pickingLayer >= 0;
		hasOffscreenBuffer    = fbo || supportsEntityPicking;
		_picker               =
			supportsEntityPicking ? new ObjectPicker(this, pickingLayer) : null;
		
		engine.addPickingScreen(this);
	}
	
	// Must invalidate all rects in all layers
	protected abstract void _setSize(int width, int height);
	
	public final boolean containsPoint(
			final int x,
			final int y) {
		
		return x >= 0 && x < _width && y >= 0 && y < _height;
	}
	
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
		
		// Delete previous buffers
        glDeleteFramebuffers (_fbo);
        glDeleteRenderbuffers(_rbo);
        
        // Generate new buffers
 		_fbo = glGenFramebuffers();
 		_rbo = glGenRenderbuffers();
		
 		// Bind all buffers
		glBindFramebuffer (GL_FRAMEBUFFER,  _fbo);
		glBindRenderbuffer(GL_RENDERBUFFER, _rbo);
 		
		// Create and attach renderbuffer to the framebuffer
		glRenderbufferStorage(
			GL_RENDERBUFFER, GL_DEPTH_COMPONENT24, _width, _height);
		glFramebufferRenderbuffer(
			GL_FRAMEBUFFER, GL_DEPTH_ATTACHMENT, GL_RENDERBUFFER, _rbo);
		
		// Adapt the picking layer texture
		if(supportsEntityPicking) _picker.adaptTextureSize();
		
		// Other layers may be filled here
		_setSize(_width, _height);
		
		// Unbind all buffers
		glBindFramebuffer (GL_FRAMEBUFFER,  0);
		glBindRenderbuffer(GL_RENDERBUFFER, 0);
		
		return this;
	}
}
