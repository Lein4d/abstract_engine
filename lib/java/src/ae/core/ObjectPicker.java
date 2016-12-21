package ae.core;

import static org.lwjgl.opengl.GL11.*;
import static org.lwjgl.opengl.GL12.*;
import static org.lwjgl.opengl.GL14.*;
import static org.lwjgl.opengl.GL30.*;

import java.util.function.Consumer;

import ae.collections.PooledQueue;
import ae.math.Vector3D;
import ae.scenegraph.Instance;
import ae.util.OrganizedObject;

public final class ObjectPicker {
	
	private final class Job extends OrganizedObject<Job> {
		
	}
	
	public interface PickedCallback {
		void onPicked(
			Instance instance,
			Vector3D modelCoords, Vector3D cameraCoords, Vector3D worldCoords);
	}
	
	private static final String _VS_SOURCE =
    	"#version 330\n" +
    	"\n" +
    	"uniform highp mat4 u_matModelView;\n"  +
    	"uniform highp mat4 u_matProjection;\n" +
    	"\n" +
    	"in  highp vec3 in_position;\n"  +
    	"out highp vec3 var_position;\n" +
    	"\n" +
    	"void main(void) {\n" +
    	"\tvar_position = in_position;\n" +
    	"\tgl_Position  = u_matProjection * (u_matModelView * vec4(in_position, 1));\n" +
    	"}\n";
	
	private static final String _FS_SOURCE =
    	"#version 330\n" +
    	"\n" +
    	"uniform highp float u_objectId;\n" +
    	"\n" +
    	"in  highp vec3 var_position;\n" +
    	"out highp vec4 out_color;\n"    +
    	"\n" +
    	"void main(void) {\n" +
    	"\tout_color = vec4(var_position, u_objectId);\n" +
    	//"\tout_color = vec4(u_objectId / 20.0, 0, 0, 1);\n" +
    	"}\n";
	
	private final Screen.Layer     _layer;
	private final Vector3D         _modelCoords  = Vector3D.createStatic();
	private final Vector3D         _cameraCoords = Vector3D.createStatic();
	private final Vector3D         _worldCoords  = Vector3D.createStatic();
	private final PooledQueue<Job> _jobs         = new PooledQueue<>();
	
	private int      _fbo      = 0;
	private int      _rbo      = 0;
	private int      _texture  = 0;
	private int      _width    = -1;
	private int      _height   = -1;
	private Instance _instance = null;
	
	private int                _x;
	private int                _y;
	private Consumer<Instance> _callback;
	
	public final AbstractEngine engine;
	
	private final void _createFBO() {
		
		// Delete previous buffers
        glDeleteFramebuffers (_fbo);
        glDeleteRenderbuffers(_rbo);
        glDeleteTextures     (_texture);
		
		// Generate new buffers
		_fbo     = glGenFramebuffers();
		_rbo     = glGenRenderbuffers();
		_texture = glGenTextures();
		
		// Bind all buffers
		glBindFramebuffer (GL_FRAMEBUFFER,  _fbo);
		glBindRenderbuffer(GL_RENDERBUFFER, _rbo);
		glBindTexture     (GL_TEXTURE_2D,   _texture);
		
		// Set the texture parameters
		glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
		glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);
		glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_BASE_LEVEL, 0);
		glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAX_LEVEL,  0);
		
		glTexImage2D(
			GL_TEXTURE_2D,
			0, GL_RGBA32F, _width, _height, 0, GL_RGBA, GL_FLOAT, 0);
		
		// Attach objects to the framebuffer
		glRenderbufferStorage(
			GL_RENDERBUFFER, GL_DEPTH_COMPONENT24, _width, _height);
		glFramebufferRenderbuffer(
			GL_FRAMEBUFFER, GL_DEPTH_ATTACHMENT, GL_RENDERBUFFER, _rbo);
		glFramebufferTexture2D(
			GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT0, GL_TEXTURE_2D, _texture, 0);
		
		// Unbind all buffers
		glBindFramebuffer (GL_FRAMEBUFFER,  0);
		glBindRenderbuffer(GL_RENDERBUFFER, 0);
		glBindTexture     (GL_TEXTURE_2D,   0);
	}
	
	// The shader program is created outside the object picker, so it can be
	// reused among multiple object pickers
	static final GlslShader createGlslShader(final AbstractEngine engine) {
		return new GlslShader(
			engine, "Object Picker",
			_VS_SOURCE, _FS_SOURCE,
			"u_matModelView", "u_matProjection", null, "u_objectId",
			null, null, null, null,
			"out_color", "in_position");
	}
	
	final void _render() {
		
		final float[] pixel = new float[4];
		
		final int oldWidth  = _width;
		final int oldHeight = _height;
		
		_width  = _layer.getWidth();
		_height = _layer.getHeight();
		
		if(_width != oldWidth || _height != oldHeight) _createFBO();
		
		glBindFramebuffer(GL_FRAMEBUFFER, _fbo);
		engine.opGlslShader.bind();
		engine.state.newGlslShader(engine.opGlslShader);
		
		glClearColor(0, 0, 0, 0);
		
		_layer._renderObjectPicking(this, _x, _y);
		
		glReadBuffer(GL_COLOR_ATTACHMENT0);
		glReadPixels(100, 100, 1, 1, GL_RGBA, GL_FLOAT, pixel);
		System.out.println(pixel[0] + " " + pixel[1] + " " + pixel[2] + " " + pixel[3]);
		// TODO: Check why the framebuffer needs to be unbound
		glBindFramebuffer(GL_FRAMEBUFFER, 0);
	}
	
	public ObjectPicker(
			final Screen.Layer   layer,
			final AbstractEngine engine) {
		
		engine.opGlslShader.bind();
		
		this._layer = layer;
		this.engine = engine;
	}
	
	public final Instance getLastInstance() {
		return _instance;
	}
	
	public final void pickInstance(
			final int                x,
			final int                y,
			final Consumer<Instance> callback) {
		
		_x        = x;
		_y        = y;
		_callback = callback;
		
		engine.registerObjectPicker(this);
	}
}
