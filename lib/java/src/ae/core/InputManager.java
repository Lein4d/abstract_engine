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
	private final double[] _tempX = new double[1];
	private final double[] _tempY = new double[1];
	
	private int _x;
	private int _y;
	
	public KeyActionCallback         onKeyAction         = null; // called first
	public KeyDownCallback           onKeyDown           = null;
	public KeyUpCallback             onKeyUp             = null;
	public MouseButtonActionCallback onMouseButtonAction = null; // called first
	public MouseButtonDownCallback   onMouseButtonDown   = null;
	public MouseButtonUpCallback     onMouseButtonUp     = null;
	public MouseMoveCallback         onMouseMove         = null;
	public MouseWheelCallback        onMouseWheel        = null;
	
	private final void _getCursorPos() {
		
		glfwGetCursorPos(_windowId, _tempX, _tempY);
		
		_x = (int)Math.floor(_tempX[0]);
		_y = (int)Math.floor(_tempY[0]);
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
		
		_windowId = windowId;
		
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
		
		final int xOld = _x;
		final int yOld = _y;
		
		_getCursorPos();
		
		glfwPollEvents();
		
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
