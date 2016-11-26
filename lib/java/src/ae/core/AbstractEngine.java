package ae.core;

import java.io.PrintStream;
import java.net.URISyntaxException;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.lwjgl.glfw.GLFWVidMode;
import org.lwjgl.opengl.GL;

import ae.collections.PooledLinkedList;
import ae.material1.Material;
import ae.math.Matrix4D;
import ae.math.Vector3D;
import ae.math.Vector4D;

import static org.lwjgl.opengl.GL11.*;
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
	
	private final long _window;
	
	private final PooledLinkedList<Material> _materials   =
		new PooledLinkedList<>();
	
	private State   _state        = State.CREATED;
	private boolean _isFullscreen = false;
	
	// Größe der Renderfläche in Bildschirmkoordinaten
	private int _windowPosX;
	private int _windowPosY;
	private int _windowWidth;
	private int _windowHeight;
	
	// Letzte Fenstergröße im "Fenster"-Modus, wird zur Wiederherstellung
	// benötigt
	private int _lastWindowedPosX;
	private int _lastWindowedPosY;
	private int _lastWindowedWidth;
	private int _lastWindowedHeight;
	
	// Größe des Renderbereichs in Pixel
	private int _fbWidth;
	private int _fbHeight;
	
	// Daten zur Steueurung des zeitlichen Ablaufs
	private double _speed = 1;
	private double _time;
	private long   _absTime;

	private ResizeCallback     _cbResize     = null;
	private TimeChangeCallback _cbTimeChange = null;
	
	private SceneGraph _sceneGraph = null;

	public static final int VERSION_MAJOR    = 0;
	public static final int VERSION_MINOR    = 9;
	public static final int VERSION_REVISION = 0;
	
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
	
	public final Texture  defaultTexture;
	public final Vector3D background = Vector4D.BLACK.xyz.cloneStatic();
	public final Matrix4D projection = new Matrix4D();
	
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
			
			SOURCE_PATH =
				fullPathRelative.subpath(0, fullPathRelative.getNameCount() - 1);
			
		} else {
			
			SOURCE_PATH = Paths.get("");
		}
	}
	
	private final void _updateViewport() {
		glViewport(0, 0, _fbWidth, _fbHeight);
		if(_cbResize != null) _cbResize.onResize(this);
	}
	
	public AbstractEngine(
    		final String title,
    		final int    maxDirLightCount,
    		final int    maxPointLightCount) {
		
		this(
			title, maxDirLightCount, maxPointLightCount,
			System.out, System.err);
	}
	
	public AbstractEngine(
			final String      title,
			final int         maxDirLightCount,
			final int         maxPointLightCount,
			final PrintStream out,
			final PrintStream err) {
		
		this.maxDirLightCount   = maxDirLightCount;
		this.maxPointLightCount = maxPointLightCount;
		this.out                = out;
		this.err                = err;
		
		if(!glfwInit())
			throw new IllegalStateException("Unable to initialize GLFW");
		
		final long        monitor = glfwGetPrimaryMonitor();
		final GLFWVidMode vidMode = glfwGetVideoMode(monitor);
		
		// Das Fenster wird erst bei Start der Engine eingeblendet
		// So können die Callbacks zuvor registriert werden
		glfwWindowHint(GLFW_VISIBLE, GLFW_FALSE);
		
		// Ein Fenster mit der halben Bildschirmgröße erstellen
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

		defaultTexture =
			Texture.createCheckerTexture(Vector4D.WHITE, Vector4D.WHITE);
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
		return _sceneGraph;
	}
	
	public final double getSpeed() {
		return _speed;
	}
	
	public final State getState() {
		return _state;
	}
	
	public final double getTime() {
		return _time;
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
	
	public final AbstractEngine setInputListener(
			final InputListener inputListener) {
		
		glfwSetKeyCallback(
			_window,
			(window, key, scancode, action, mods) -> {
				
				switch(action) {
					case GLFW_PRESS:
						inputListener.onKeyDown(key);
						break;
					case GLFW_RELEASE:
						inputListener.onKeyUp(key);
						break;
					case GLFW_REPEAT:
						//err.println("Unsupported key event");
						break;
				}
			});
		
		return this;
	}
	
	public final AbstractEngine setResizeCallback(
			final ResizeCallback cbResize) {
		
		_cbResize = cbResize;
		return this;
	}
	
	public final AbstractEngine setSceneGraph(final SceneGraph sceneGraph) {
		
		if(_sceneGraph == sceneGraph) return this;

		if(_sceneGraph != null) _sceneGraph.setEngine(null);
		if( sceneGraph != null)  sceneGraph.setEngine(this);
		
		_sceneGraph = sceneGraph;
		
		return this;
	}

	public final AbstractEngine setTimeChangeCallback(
			final TimeChangeCallback cbTimeChange) {
		
		_cbTimeChange = cbTimeChange;
		return this;
	}

	public final void start() {

		_state = State.STARTING;

		_time    = 0;
		_absTime = System.currentTimeMillis();

		glfwShowWindow(_window);
		if(_cbResize != null) _cbResize.onResize(this);
		
		glClearColor(1f, 0f, 0f, 1f);
		glClearDepth(1);
		glDepthFunc(GL_LEQUAL);
		glEnable(GL_DEPTH_TEST);
		
		_state = State.RUNNING;
		
		glCullFace(GL_BACK);
		//glPolygonMode(GL_FRONT_AND_BACK, GL_LINE);
		
		while(!glfwWindowShouldClose(_window)) {

			final long absTimeNew = System.currentTimeMillis();
			final double delta = _speed * (absTimeNew - _absTime);
			
			_time   += delta;
			_absTime = absTimeNew;
			
			if(_cbTimeChange != null) _cbTimeChange.update(_time, delta);
			
			for(Material i : _materials) i.update(_time, delta);
			
			background.copyStaticValues();
			glClearColor(background.x, background.y, background.z, 1);
			glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

			_sceneGraph.draw(_time, delta);
			
			glfwSwapBuffers(_window);
			glfwPollEvents();
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
			
			// Die Fensterposition für die Wiederherstellung speichern
			_lastWindowedPosX   = _windowPosX;
			_lastWindowedPosY   = _windowPosY;
			_lastWindowedWidth  = _windowWidth;
			_lastWindowedHeight = _windowHeight;
			
			// Fenster- und Framebuffergröße manuell setzen
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
}
