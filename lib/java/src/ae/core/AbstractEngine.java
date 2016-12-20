package ae.core;

import java.io.PrintStream;
import java.net.URISyntaxException;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.lwjgl.glfw.GLFWVidMode;
import org.lwjgl.opengl.GL;

import ae.collections.PooledLinkedList;
import ae.collections.PooledQueue;
import ae.material.Material;
import ae.material.StandardMaterials;
import ae.math.Vector3D;
import ae.math.Vector4D;

import static org.lwjgl.opengl.GL11.*;
import static org.lwjgl.opengl.GL30.*;
import static org.lwjgl.glfw.GLFW.*;

public final class AbstractEngine {
	
	public enum State {
		CREATED,
		STARTING,
		RUNNING,
		STOPPING,
		STOPPED
	}

	public interface ResizeCallback {
		void onResize(AbstractEngine engine);
	}

	public interface TimeChangeCallback {
		void update(double time, double delta);
	}
	
	public final class Display extends Screen {
		
		private final Layer _layer = new Layer();
		
		private Display() {}
		
		@Override
		protected final void _setSize(
    			final int width,
    			final int height) {
			
			_layer._invalidateRects();
		}
		
		@Override
		public final void render(final AbstractEngine engine) {
			
			// Ensure rendering to the screen
			glBindFramebuffer(GL_FRAMEBUFFER, 0);
			
			// Render the only layer available
			_layer._renderVisual();
		}
	}
	
	private final long    _window;
	private final Display _display = new Display();
	
	private final PooledLinkedList<Material> _materials   =
		new PooledLinkedList<>();
	
	private final PooledQueue<ObjectPicker> _objectPickers =
		new PooledQueue<>();
	
	private State   _state        = State.CREATED;
	private boolean _isFullscreen = false;
	
	// Gr��e der Renderfl�che in Bildschirmkoordinaten
	private int _windowPosX;
	private int _windowPosY;
	private int _windowWidth;
	private int _windowHeight;
	
	// Letzte Fenstergr��e im "Fenster"-Modus, wird zur Wiederherstellung
	// ben�tigt
	private int _lastWindowedPosX;
	private int _lastWindowedPosY;
	private int _lastWindowedWidth;
	private int _lastWindowedHeight;
	
	// Gr��e des Renderbereichs in Pixel
	private int _fbWidth;
	private int _fbHeight;
	
	// Daten zur Steueurung des zeitlichen Ablaufs
	private double _speed = 1;

	private ResizeCallback _cbResize = null;
	
	final GlslShader opGlslShader;
	
	public static final int    VERSION_MAJOR    = 0;
	public static final int    VERSION_MINOR    = 9;
	public static final int    VERSION_REVISION = 3;
	public static final String VERSION_STRING   =
		"v" + VERSION_MAJOR + "." + VERSION_MINOR + "." + VERSION_REVISION;
	
	public static final int SIZE_BYTE   = 1;
	public static final int SIZE_SHORT  = 2;
	public static final int SIZE_INT    = 4;
	public static final int SIZE_LONG   = 8;
	public static final int SIZE_FLOAT  = 4;
	public static final int SIZE_DOUBLE = 8;
	
	public static final Path SOURCE_PATH;
	
	public final int maxDirLightCount;
	public final int maxPointLightCount;
	
	public final PrintStream out;
	public final PrintStream err;
	
	public final StandardMaterials standardMaterials;
	
	public final Frame        frame;
	public final Vector3D     background = Vector4D.BLACK.xyz.cloneStatic();
	public final Screen.Layer display    = _display._layer;
	public final InputManager input;

	// For the actual scene graph, refer to 'frame.getSceneGraph()'
	public SceneGraph sceneGraph = null;

	static {
		
		Path fullPath = Paths.get("");
		
		try {
			fullPath = Paths.get(
				AbstractEngine.class.getProtectionDomain().getCodeSource().
				getLocation().toURI());
		} catch(URISyntaxException e) {
			e.printStackTrace();
		}
		
		if(fullPath.getFileName().toString().endsWith(".jar")) {
			
			final Path fullPathRelative =
				Paths.get("").toAbsolutePath().relativize(fullPath);
			
			SOURCE_PATH = fullPathRelative.subpath(
				0, fullPathRelative.getNameCount() - 1);
			
		} else {
			
			SOURCE_PATH = Paths.get("");
		}
	}
	
	private final void _updateViewport() {
		glViewport(0, 0, _fbWidth, _fbHeight);
		if(_cbResize != null) _cbResize.onResize(this);
		_display.setSize(_fbWidth, _fbHeight);
	}
	
	final void registerObjectPicker(final ObjectPicker objectPicker) {
		_objectPickers.push(objectPicker);
	}
	
	public AbstractEngine(
			final String      title,
			final PrintStream out,
			final PrintStream err) {
		
		this.maxDirLightCount   = 8;
		this.maxPointLightCount = 8;
		this.out                = out != null ? out : System.out;
		this.err                = err != null ? err : System.err;
		
		if(!glfwInit())
			throw new IllegalStateException("Unable to initialize GLFW");
		
		final long        monitor = glfwGetPrimaryMonitor();
		final GLFWVidMode vidMode = glfwGetVideoMode(monitor);
		
		// Das Fenster wird erst bei Start der Engine eingeblendet
		// So k�nnen die Callbacks zuvor registriert werden
		glfwWindowHint(GLFW_VISIBLE, GLFW_FALSE);
		
		// Ein Fenster mit der halben Bildschirmgr��e erstellen
		_window = glfwCreateWindow(
			vidMode.width() / 2, vidMode.height() / 2, title, 0, 0);

		glfwSetWindowPosCallback(
			_window,
			(window, x, y) -> {
				_windowPosX = x;
				_windowPosY = y;
			});
		
		glfwSetWindowSizeCallback(
			_window,
			(window, width, height) -> {
				_windowWidth  = width;
				_windowHeight = height;
			});
		
		glfwSetFramebufferSizeCallback(
			_window,
			(window, width, height) -> {
				_fbWidth  = width;
				_fbHeight = height;
				if(_state == State.RUNNING) _updateViewport();
			});
		
		glfwMakeContextCurrent(_window);
		glfwSwapInterval(1);

		GL.createCapabilities();

		opGlslShader      = ObjectPicker.createGlslShader(this);
		standardMaterials = new StandardMaterials(this);
		frame             = new Frame(this);
		input             = new InputManager(_window);
	}

	public final void addMaterial(final Material material) {
		
		if(material.engine != null)
			throw new UnsupportedOperationException(
				"Material is added to the engine automatically");
		
		_materials.insertAtEnd(material);
	}
	
	public final int getFramebufferHeight() {
		return _fbHeight;
	}
	
	public final int getFramebufferWidth() {
		return _fbWidth;
	}
	
	public final SceneGraph getSceneGraph() {
		return sceneGraph;
	}
	
	public final double getSpeed() {
		return _speed;
	}
	
	public final State getState() {
		return _state;
	}
	
	public final int getWindowHeight() {
		return _windowHeight;
	}
	
	public final int getWindowWidth() {
		return _windowWidth;
	}
	
	public final AbstractEngine setSpeed(final double speed) {
		_speed = speed;
		return this;
	}
	
	public final AbstractEngine setResizeCallback(
			final ResizeCallback cbResize) {
		
		_cbResize = cbResize;
		return this;
	}
	
	public final void start() {

		_state = State.STARTING;

		glfwShowWindow(_window);
		if(_cbResize != null) _cbResize.onResize(this);
		_display.setSize(_fbWidth, _fbHeight);
		
		glClearColor(1f, 0f, 0f, 1f);
		glClearDepth(1);
		glDepthFunc(GL_LEQUAL);
		glEnable(GL_DEPTH_TEST);
		glEnable(GL_SCISSOR_TEST);
		
		_state = State.RUNNING;
		
		glCullFace(GL_BACK);
		//glPolygonMode(GL_FRONT_AND_BACK, GL_LINE);
		
		while(!glfwWindowShouldClose(_window)) {

			frame.moveToNext(_speed, sceneGraph);
			
			for(Material i : _materials) i.update();
			
			background.copyStaticValues();
			glClearColor(background.x, background.y, background.z, 1);

			_display.render(this);
			
			while(_objectPickers.hasNext()) _objectPickers.pop()._render();
			
			glfwSwapBuffers(_window);
			
			input.processInput();
		}
		
		_state = State.STOPPING;
		
		//glfwFreeCallbacks(_window);
		glfwDestroyWindow(_window);
		glfwTerminate();
		
		_state = State.STOPPED;
	}
	
	public final void stop() {
		glfwSetWindowShouldClose(_window, true);
	}
	
	public final boolean toggleFullscreen() {
		
		_isFullscreen = !_isFullscreen;
		
		if(_isFullscreen) {

			final long        monitor = glfwGetPrimaryMonitor();
			final GLFWVidMode vidMode = glfwGetVideoMode(monitor);
			
			// Die Fensterposition f�r die Wiederherstellung speichern
			_lastWindowedPosX   = _windowPosX;
			_lastWindowedPosY   = _windowPosY;
			_lastWindowedWidth  = _windowWidth;
			_lastWindowedHeight = _windowHeight;
			
			// Fenster- und Framebuffergr��e manuell setzen
			_fbWidth  = _windowWidth  = vidMode.width();
			_fbHeight = _windowHeight = vidMode.height();
			
			_updateViewport();
			
			glfwSetWindowMonitor(
				_window, monitor,
				0, 0, vidMode.width(), vidMode.height(),
				GLFW_DONT_CARE);
			
		} else {
			
			glfwSetWindowMonitor(
				_window, 0,
				_lastWindowedPosX,  _lastWindowedPosY,
				_lastWindowedWidth, _lastWindowedHeight,
				GLFW_DONT_CARE);
		}
		
		return _isFullscreen;
	}
	/*
	public final double updateTime() {
		
		final long absTimeNew = System.currentTimeMillis();
		
		_time   += _speed * (absTimeNew - _absTime);
		_absTime = absTimeNew;
		
		return _time;
	}
	
	public final double updateTime(
			final int     delta,
			final boolean applySpeed) {
		
		if(delta <= 0)
			throw new UnsupportedOperationException(
				"Time delta must be greater than 0");
		
		_time += applySpeed ? _speed * delta : delta;
		
		return _time;
	}
	*/
}
