package ae.core;

import static org.lwjgl.glfw.GLFW.*;

public final class InputManager {

	public interface KeyActionCallback {
		void onKeyAction(int key, boolean down);
	}

	public interface KeyDownCallback {
		void onKeyDown(int key);
	}

	public interface KeyUpCallback {
		void onKeyUp(int key);
	}
	
	public interface MouseButtonActionCallback {
		void onMouseButtonAction(int button, int x, int y, boolean down);
	}
	
	public interface MouseButtonDownCallback {
		void onMouseButtonDown(int button, int x, int y);
	}
	
	public interface MouseButtonUpCallback {
		void onMouseButtonUp(int button, int x, int y);
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
	
	private final long     _windowId;
	private final double[] _tempX      = new double[1];
	private final double[] _tempY      = new double[1];
	private final int[]    _tempWidth  = new int[1];
	private final int[]    _tempHeight = new int[1];
	
	private final int _frameSizeLeft;
	private final int _frameSizeTop;
	private final int _frameSizeRight;
	private final int _frameSizeBottom;
	
	private int _x;
	private int _y;
	private boolean _inWindow;
	private boolean _inClient;
	
	public KeyActionCallback         onKeyAction         = null; // called first
	public KeyDownCallback           onKeyDown           = null;
	public KeyUpCallback             onKeyUp             = null;
	public MouseButtonActionCallback onMouseButtonAction = null; // called first
	public MouseButtonDownCallback   onMouseButtonDown   = null;
	public MouseButtonUpCallback     onMouseButtonUp     = null;
	public MouseEnterClientCallback  onMouseEnterClient  = null;
	public MouseEnterWindowCallback  onMouseEnterWindow  = null;
	public MouseLeaveClientCallback  onMouseLeaveClient  = null;
	public MouseLeaveWindowCallback  onMouseLeaveWindow  = null;
	public MouseMoveCallback         onMouseMove         = null;
	public MouseWheelCallback        onMouseWheel        = null;
	
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
				if(onKeyAction != null) onKeyAction.onKeyAction(key, true);
				if(onKeyDown   != null) onKeyDown  .onKeyDown  (key);
				break;
			case GLFW_RELEASE:
				if(onKeyAction != null) onKeyAction.onKeyAction(key, false);
				if(onKeyUp     != null) onKeyUp    .onKeyUp    (key);
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
				if(onMouseButtonAction != null)
					onMouseButtonAction.onMouseButtonAction(
						button, _x, _y, true);
				if(onMouseButtonDown != null)
					onMouseButtonDown.onMouseButtonDown(button, _x, _y);
				break;
			
			case GLFW_RELEASE:
				if(onMouseButtonAction != null)
					onMouseButtonAction.onMouseButtonAction(
						button, _x, _y, false);
				if(onMouseButtonUp != null)
					onMouseButtonUp.onMouseButtonUp(button, _x, _y);
				break;
		}
	}
	
	private final boolean _isMouseButtonDown(final int button) {
		return glfwGetMouseButton(_windowId, button) == GLFW_PRESS;
	}
	
	InputManager(final long windowId) {
		
		final int[][] sizes = {{0}, {0}, {0}, {0}};
		
		glfwGetWindowFrameSize(
			windowId, sizes[0], sizes[1], sizes[2], sizes[3]);
		
		_windowId        = windowId;
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
		
		final int     xOld        = _x;
		final int     yOld        = _y;
		final boolean inWindowOld = _inWindow;
		final boolean inClientOld = _inClient;
		
		_getCursorPos();
		
		glfwPollEvents();
		
		// Check for the mouse entering the window
		if(!inWindowOld && _inWindow && onMouseEnterWindow != null)
			onMouseEnterWindow.onMouseEnterWindow();
		if(!inClientOld && _inClient && onMouseEnterClient != null)
			onMouseEnterClient.onMouseEnterWindow();
		
		// Check for the mouse leaving the window
		if(inClientOld && !_inClient && onMouseLeaveClient != null)
			onMouseLeaveClient.onMouseLeaveWindow();
		if(inWindowOld && !_inWindow && onMouseLeaveWindow != null)
			onMouseLeaveWindow.onMouseLeaveWindow();
		
		// Check for mouse movement
		if((_x != xOld || _y != yOld) && onMouseMove != null)
			onMouseMove.onMouseMove(
				_x, _y, _x - xOld, _y - yOld,
				_isMouseButtonDown(GLFW_MOUSE_BUTTON_LEFT),
				_isMouseButtonDown(GLFW_MOUSE_BUTTON_MIDDLE),
				_isMouseButtonDown(GLFW_MOUSE_BUTTON_RIGHT));
	}
	
	public final int getMouseX() {
		return _x;
	}
	
	public final int getMouseY() {
		return _y;
	}
}
