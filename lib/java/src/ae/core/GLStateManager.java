package ae.core;

import static org.lwjgl.opengl.GL11.GL_CULL_FACE;
import static org.lwjgl.opengl.GL11.GL_DEPTH_TEST;
import static org.lwjgl.opengl.GL11.glDisable;
import static org.lwjgl.opengl.GL11.glEnable;

public final class GLStateManager {

	public enum StateFlag {
		DEPTH_TEST (GL_DEPTH_TEST),
		CULL_FACING(GL_CULL_FACE);
		
		private final int _glValue;
		private boolean   _state = false;
		
		private StateFlag(
				final int glValue) {
			
			_glValue = glValue;
		}
		
		public final void set(
				final boolean state) {
			
			if(state == _state) return;
			
			if(state) {
				glEnable(_glValue);
			} else {
				glDisable(_glValue);
			}
			
			_state = state;
		}
	}
}
