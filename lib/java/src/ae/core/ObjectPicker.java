package ae.core;

import static org.lwjgl.opengl.GL11.*;
import static org.lwjgl.opengl.GL12.*;
import static org.lwjgl.opengl.GL30.*;

import ae.collections.ObjectPool;
import ae.collections.PooledQueue;
import ae.math.Vector3D;
import ae.scenegraph.Instance;
import ae.util.OrganizedObject;

public final class ObjectPicker {
	
	private static final class Job extends OrganizedObject<Job> {
		private Screen.Layer   _layer;
		private int            _x;
		private int            _y;
		private PickedCallback _callback;
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
    	"}\n";
	
	private static final ObjectPool<Job> _JOB_POOL =
		new ObjectPool<>(() -> new Job()); 
	
	private final int              _fboLayerIndex;
	private final float[]          _pixel        = new float[4];
	private final Vector3D         _modelCoords  = Vector3D.createStatic();
	private final Vector3D         _cameraCoords = Vector3D.createStatic();
	private final Vector3D         _worldCoords  = Vector3D.createStatic();
	private final PooledQueue<Job> _jobs         = new PooledQueue<>();
	
	private int      _texture  = 0;
	private Instance _instance = null;
	
	public final Screen screen;

	ObjectPicker(
			final Screen screen,
			final int    fboLayerIndex) {

		this._fboLayerIndex = fboLayerIndex;
		this.screen         = screen;
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

	final void adaptTextureSize() {
		
		glDeleteTextures(_texture);
		
		_texture = glGenTextures();
		glBindTexture(GL_TEXTURE_2D, _texture);
		
		// Set the texture parameters
		glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
		glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);
		glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_BASE_LEVEL, 0);
		glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAX_LEVEL,  0);
		
		// Allocate storage and attach the texture to the framebuffer
		glTexImage2D(
			GL_TEXTURE_2D,
			0, GL_RGBA32F, screen.getWidth(), screen.getHeight(), 0,
			GL_RGBA, GL_FLOAT, 0);
		glFramebufferTexture2D(
			GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT0 + _fboLayerIndex,
			GL_TEXTURE_2D,  _texture, 0);
		
		glBindTexture(GL_TEXTURE_2D, 0);
	}
	
	final void executeJobs() {
		
		screen.engine.opGlslShader.bind();
		screen.engine.state.newGlslShader(screen.engine.opGlslShader);
		
		glClearColor(0, 0, 0, 0);
		
		while(_jobs.hasNext()) {
			
			final Job job      = _jobs.pop();
			Instance  instance = null;
			
			if(screen.containsPoint(job._x, job._y)) {
			
				// Invert the y-coordinate to adapt the window coordinate system
				// to the OpenGL system
				job._y = screen.getHeight() - 1 - job._y;
				
				job._layer._renderObjectPicking(this, job._x, job._y);
				
				// TODO: 'glReadPixels()' is too slow!
				glReadBuffer(GL_COLOR_ATTACHMENT0);
				glReadPixels(job._x, job._y, 1, 1, GL_RGBA, GL_FLOAT, _pixel);
				
				instance =
					screen.engine.getSceneGraph().getInstance((int)_pixel[3]);
			}
			
			if(instance != null) {
				
				_modelCoords .setData(_pixel);
				_cameraCoords.setData(_pixel);
				_worldCoords .setData(_pixel);
	
				instance.tfToCameraSpace.applyToPoint(_cameraCoords);
				instance.tfToEyeSpace   .applyToPoint(_worldCoords);
				
				job._callback.onPicked(
					instance, _modelCoords, _cameraCoords, _worldCoords);
				
			} else {
				
				job._callback.onPicked(null, null, null, null);
			}
			
			_JOB_POOL.free(job);
		}
	}
	
	final void pickInstance(
			final Screen.Layer   layer,
			final int            x,
			final int            y,
			final PickedCallback callback) {
		
		final Job job = _JOB_POOL.provide();
		
		job._layer    = layer;
		job._x        = x;
		job._y        = y;
		job._callback = callback;
		
		_jobs.push(job);
	}
	
	public final Instance getLastInstance() {
		return _instance;
	}
}
