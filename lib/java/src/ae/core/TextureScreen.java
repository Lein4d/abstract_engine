package ae.core;

import static org.lwjgl.opengl.GL11.*;
import static org.lwjgl.opengl.GL12.*;
import static org.lwjgl.opengl.GL14.*;
import static org.lwjgl.opengl.GL15.*;
import static org.lwjgl.opengl.GL30.*;
import static org.lwjgl.opengl.GL42.*;

public final class TextureScreen extends Screen {
	
	public final class TextureLayer {
		
		private final TextureScreen _parent;
		private final int           _level;
		
		private int _texture = 0;
		
		private final void _activate(final boolean active) {
			
			if(active) {
				
				//_addToFBO();
				
			} else {
				
				glFramebufferTexture2D(
					GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT0 + _level,
					GL_TEXTURE_2D, 0, 0);
				
				glDeleteTextures(_texture);
			}
		}
		
		private final void _addToFBO(
				final int width,
				final int height) {
			
			glDeleteTextures(_texture);
			
			_texture = glGenTextures();
			
			glBindTexture(GL_TEXTURE_2D, _texture);
			
			glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
			glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
			glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_BASE_LEVEL, 0);
			glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAX_LEVEL,  0);
			glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
			glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);
			
			glTexStorage2D(GL_TEXTURE_2D, 1, GL_RGBA32F, width, height);
			
			glFramebufferTexture2D(
				GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT0 + _level,
				GL_TEXTURE_2D, 0, 0);
			
			glBindTexture(GL_TEXTURE_2D, 0);
		}
		
		private final boolean _isActive() {
			return _texture != 0;
		}
		
		private TextureLayer(final int level) {
			_parent = TextureScreen.this;
			_level  = level;
		}
	}
	
	private final TextureLayer[] _layers;
	
	private int _fbo = 0;
	private int _rbo = 0;
	
	@Override
	protected final void _setSize(
			final int width,
			final int height) {
		
		glDeleteBuffers(_fbo);
		glDeleteBuffers(_rbo);
		
		_fbo = glGenFramebuffers();
		_rbo = glGenRenderbuffers();
		
		glBindFramebuffer (GL_FRAMEBUFFER,  _fbo);
		glBindRenderbuffer(GL_RENDERBUFFER, _rbo);
		
		glRenderbufferStorage(
			GL_RENDERBUFFER, GL_DEPTH_COMPONENT24, width, height);
		glFramebufferRenderbuffer(
			GL_FRAMEBUFFER, GL_DEPTH_ATTACHMENT, GL_RENDERBUFFER, _rbo);
		
		// Adapt textures
		for(TextureLayer i : _layers)
			if(i._isActive()) i._addToFBO(width, height);
		
		// Unbind all buffers
		glBindFramebuffer (GL_FRAMEBUFFER,  0);
		glBindRenderbuffer(GL_RENDERBUFFER, 0);
	}
	
	public TextureScreen(final AbstractEngine engine) {
		
		_layers = new TextureLayer[glGetInteger(GL_MAX_COLOR_ATTACHMENTS)];
		
		for(int i = 0; i < _layers.length; i++)
			_layers[i] = new TextureLayer(i);
	}
	
	public final TextureLayer addLayer() {
		
		for(TextureLayer i : _layers) {
			if(!i._isActive()) {
				i._activate(true);
				return i;
			}
		}
		
		return null;
	}
	
	public final void removeLayer(final TextureLayer layer) {
		if(layer._parent == this) layer._activate(false);
	}
	
	@Override
	public final void render(final AbstractEngine engine) {
		
	}
}
