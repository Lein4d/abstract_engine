package ae.core;

import java.io.PrintStream;
import java.net.URISyntaxException;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.lwjgl.glfw.GLFWVidMode;
import org.lwjgl.opengl.GL;

import ae.collections.PooledLinkedList;
import ae.material.Material;
import ae.material.StandardMaterials;
import ae.math.Vector3D;
import ae.math.Vector4D;
import ae.util.Event;
import ae.util.ToggleValue;

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
	
	public final class Display extends Screen {
		
		private final Layer _layer = new Layer();
		
		private Display(final boolean entityPicking) {
			super(AbstractEngine.this, false, entityPicking ? 0 : -1);
		}
		
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
	private final Display _display;
	
	private final PooledLinkedList<Material> _materials      =
		new PooledLinkedList<>();
	private final PooledLinkedList<Screen>   _pickingScreens =
		new PooledLinkedList<>();
	
	private State _state = State.CREATED;
	
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

	final GlslShader opGlslShader;
	
	public static final int    VERSION_MAJOR    = 0;
	public static final int    VERSION_MINOR    = 9;
	public static final int    VERSION_REVISION = 4;
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
	
	public final RenderState  state;
	public final Vector3D     background = Vector4D.BLACK.xyz.cloneStatic();
	public final Screen.Layer display;
	public final InputManager input;
	public final ToggleValue  fullscreen = new ToggleValue(
		(state) -> _switchToFullscreen(), (state) -> _switchToWindowed());
	
	public final Event.Notify<Screen.Layer> onResize;

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

	private final void _adaptDisplaySize() {
		_display.setSize(_fbWidth, _fbHeight);
		onResize.fire();
	}
	
	private final void _switchToFullscreen() {
		
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
		
		_adaptDisplaySize();
		
		glfwSetWindowMonitor(
			_window, monitor,
			0, 0, vidMode.width(), vidMode.height(),
			GLFW_DONT_CARE);
	}
	
	private final void _switchToWindowed() {
		
		glfwSetWindowMonitor(
			_window, 0,
			_lastWindowedPosX,  _lastWindowedPosY,
			_lastWindowedWidth, _lastWindowedHeight,
			GLFW_DONT_CARE);
	}
	
	final void addPickingScreen(final Screen screen) {
		_pickingScreens.insertAtEnd(screen);
	}
	
	public AbstractEngine(
			final String      title,
			final PrintStream out,
			final PrintStream err,
			final boolean     entityPicking) {
		
		this.maxDirLightCount   = 8;
		this.maxPointLightCount = 8;
		this.out                = out != null ? out : System.out;
		this.err                = err != null ? err : System.err;
		
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
				if(_state == State.RUNNING) _adaptDisplaySize();
			});
		
		glfwMakeContextCurrent(_window);
		glfwSwapInterval(1);

		GL.createCapabilities();

		opGlslShader      = ObjectPicker.createGlslShader(this);
		_display          = new Display(entityPicking);
		display           = _display._layer;
		standardMaterials = new StandardMaterials(this);
		state             = new RenderState(this);
		input             = new InputManager(this, _window, entityPicking);
		onResize          = new Event.Notify<>(display);
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
	
	public final void start() {

		_state = State.STARTING;

		glfwShowWindow(_window);
		_adaptDisplaySize();
		
		glClearColor(1f, 0f, 0f, 1f);
		glClearDepth(1);
		glDepthFunc(GL_LEQUAL);
		glEnable(GL_DEPTH_TEST);
		glEnable(GL_SCISSOR_TEST);
		
		_state = State.RUNNING;
		
		glCullFace(GL_BACK);
		//glPolygonMode(GL_FRONT_AND_BACK, GL_LINE);
		
		while(!glfwWindowShouldClose(_window)) {
			
			state.beginNextFrame(_speed, sceneGraph);
			
			for(Material i : _materials) i.update();
			
			background.copyStaticValues();
			glClearColor(background.x, background.y, background.z, 1);

			_display.render(this);
			
			input.processInput();
			
			for(Screen i : _pickingScreens) i.executePicking();
			
			glfwSwapBuffers(_window);
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
}
