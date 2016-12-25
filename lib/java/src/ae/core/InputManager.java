package ae.core;

import static org.lwjgl.glfw.GLFW.*;

import ae.scenegraph.Instance;
import ae.scenegraph.entities.Model;
import ae.util.Event;

public final class InputManager {

	public final class KeyEvent extends Event<KeyEvent, InputManager> {

		private int     _key;
		private boolean _pressed;
		
		private KeyEvent() {
			super(InputManager.this);
		}
		
		private final void _fire(
				final int     key,
				final boolean pressed) {
			
			_key     = key;
			_pressed = pressed;
			
			fire();
		}
		
		public final int getKey() {
			return _key;
		}
		
		public final boolean isPressed() {
			return _pressed;
		}
	}
	
	public final class MouseButtonEvent
		extends Event<MouseButtonEvent, InputManager> {

		private int     _button;
		private boolean _pressed;
		
		private MouseButtonEvent() {
			super(InputManager.this);
		}

		private final void _fire(
				final int     button,
				final boolean pressed) {
			
			_button  = button;
			_pressed = pressed;
			
			fire();
		}
		
		public final int getButton() {
			return _button;
		}
		
		public final boolean isPressed() {
			return _pressed;
		}
	}
	
	public final class MouseMoveEvent
		extends Event<MouseMoveEvent, InputManager> {

		private int _dx;
		private int _dy;
		
		private MouseMoveEvent() {
			super(InputManager.this);
		}

		private final void _fire(
				final int dx,
				final int dy) {
			
			_dx = dx;
			_dy = dy;
			
			fire();
		}
		
		public final int getDX() {
			return _dx;
		}

		public final int getDY() {
			return _dy;
		}
	}
	
	public interface MouseEnterClientCallback {
		void onMouseEnterWindow();
	}

	public interface MouseEnterWindowCallback {
		void onMouseEnterWindow();
	}

	public interface MouseLeaveClientCallback {
		void onMouseLeaveWindow();
	}
	
	public interface MouseLeaveWindowCallback {
		void onMouseLeaveWindow();
	}
	
	public interface MouseMoveCallback {
		void onMouseMove(
			int x, int y, int dx, int dy,
			boolean left, boolean middle, boolean right);
	}

	public interface MouseWheelCallback {
		void onMouseWheel(
			int wheel, int x, int y,
			boolean left, boolean middle, boolean right);
	}
	
	private final long         _windowId;
	private final Screen.Layer _pickingLayer;
	private final double[]     _tempX      = new double[1];
	private final double[]     _tempY      = new double[1];
	private final int[]        _tempWidth  = new int[1];
	private final int[]        _tempHeight = new int[1];
	
	private final int _frameSizeLeft;
	private final int _frameSizeTop;
	private final int _frameSizeRight;
	private final int _frameSizeBottom;

	private final ObjectPicker.PickedCallback _cbPicked =
		(instance, modelCoords, cameraCoords, worldCoords) ->
		_changePickedInstance(instance);
	
	private int      _x;
	private int      _y;
	private boolean  _inWindow;
	private boolean  _inClient;
	private Instance _instance = null;

	public KeyEvent         onKeyAction          = new KeyEvent(); // called first
	public KeyEvent         onKeyDown            = new KeyEvent();
	public KeyEvent         onKeyUp              = new KeyEvent();
	public MouseButtonEvent onMouseButtonAction  = new MouseButtonEvent(); // called first
	public MouseButtonEvent onMouseButtonDown    = new MouseButtonEvent();
	public MouseButtonEvent onMouseButtonUp      = new MouseButtonEvent();
	public MouseMoveEvent   onMouseEnterInstance = new MouseMoveEvent();
	public MouseMoveEvent   onMouseEnterClient   = new MouseMoveEvent();
	public MouseMoveEvent   onMouseEnterWindow   = new MouseMoveEvent();
	public MouseMoveEvent   onMouseLeaveInstance = new MouseMoveEvent();
	public MouseMoveEvent   onMouseLeaveClient   = new MouseMoveEvent();
	public MouseMoveEvent   onMouseLeaveWindow   = new MouseMoveEvent();
	public MouseMoveEvent   onMouseMove          = new MouseMoveEvent();
	
	private final void _changePickedInstance(final Instance instance) {

		// Abort if the instance hasn't changed
		if(instance == _instance) return;
		
		final Instance oldInstance = _instance;
		
		// TODO: Richtige Koordinaten
		if(oldInstance != null) onMouseLeaveInstance._fire(0, 0);
		_instance = instance;
		if(instance    != null) onMouseEnterInstance._fire(0, 0);
	}
	
	private final void _getCursorPos() {
		
		glfwGetCursorPos      (_windowId, _tempX,     _tempY);
		glfwGetFramebufferSize(_windowId, _tempWidth, _tempHeight);
		
		_x        = (int)Math.floor(_tempX[0]);
		_y        = (int)Math.floor(_tempY[0]);
		_inWindow =
			_x >= -_frameSizeLeft && _x < _tempWidth [0] + _frameSizeRight &&
			_y >= -_frameSizeTop  && _y < _tempHeight[0] + _frameSizeBottom;
		_inClient =
			_x >= 0 && _x < _tempWidth[0] && _y >= 0 && _y < _tempHeight[0];
	}
	
	private final void _glfwKeyCallback(
    		final int key,
    		final int action) {
		
		switch(action) {
			case GLFW_PRESS:
				onKeyAction._fire(key, true);
				onKeyDown  ._fire(key, true);
				break;
			case GLFW_RELEASE:
				onKeyAction._fire(key, false);
				onKeyUp    ._fire(key, false);
				break;
			case GLFW_REPEAT:
				break;
		}
	}
	
	private final void _glfwMouseButtonCallback(
			final int button,
			final int action) {
		
		switch(action) {
			
			case GLFW_PRESS:
				onMouseButtonAction._fire(button, true);
				onMouseButtonDown  ._fire(button, true);
				break;
			
			case GLFW_RELEASE:
				onMouseButtonAction._fire(button, false);
				onMouseButtonUp    ._fire(button, false);
				break;
		}
	}
	
	InputManager(
			final AbstractEngine engine,
			final long           windowId,
			final boolean        entityPicking) {
		
		final int[][] sizes = {{0}, {0}, {0}, {0}};
		
		glfwGetWindowFrameSize(
			windowId, sizes[0], sizes[1], sizes[2], sizes[3]);
		
		_windowId        = windowId;
		_pickingLayer    = entityPicking ? engine.display : null;
		_frameSizeLeft   = sizes[0][0];
		_frameSizeTop    = sizes[1][0];
		_frameSizeRight  = sizes[2][0];
		_frameSizeBottom = sizes[3][0];
		
		glfwSetKeyCallback(
			windowId,
			(window, key, scancode, action, mods) ->
				_glfwKeyCallback(key, action));
		
		glfwSetMouseButtonCallback(
			windowId,
			(window, button, action, mods) ->
				_glfwMouseButtonCallback(button, action));
		
		_getCursorPos();
	}
	
	final void processInput() {
		
		final int      xOld        = _x;
		final int      yOld        = _y;
		final boolean  inWindowOld = _inWindow;
		final boolean  inClientOld = _inClient;
		
		_getCursorPos();
		
		final int dx = _x - xOld;
		final int dy = _y - yOld;
		
		glfwPollEvents();
		
		// Check for the mouse entering the window
		if(!inWindowOld && _inWindow) onMouseEnterWindow._fire(dx, dy);
		if(!inClientOld && _inClient) onMouseEnterClient._fire(dx, dy);
		
		// Check for the mouse leaving the window
		if(inClientOld && !_inClient) onMouseLeaveClient._fire(dx, dy);
		if(inWindowOld && !_inWindow) onMouseLeaveWindow._fire(dx, dy);
		
		// Check for mouse movement
		if(dx != 0 || dy != 0) onMouseMove._fire(dx, dy);
		
		if(_pickingLayer != null) _pickingLayer.pickInstance(_cbPicked);
	}
	
	public final Instance getInstance() {
		return _instance;
	}
	
	public final Model getModel() {
		return _instance != null ? (Model)_instance.getEntity() : null;
	}
	
	public final int getX() {
		return _x;
	}
	
	public final int getY() {
		return _y;
	}
	
	public final boolean isLBtnPressed() {
		return glfwGetMouseButton(
			_windowId, GLFW_MOUSE_BUTTON_LEFT) == GLFW_PRESS;
	}
	
	public final boolean isMBtnPressed() {
		return glfwGetMouseButton(
			_windowId, GLFW_MOUSE_BUTTON_MIDDLE) == GLFW_PRESS;
	}
	
	public final boolean isRBtnPressed() {
		return glfwGetMouseButton(
			_windowId, GLFW_MOUSE_BUTTON_RIGHT) == GLFW_PRESS;
	}
}
