
// _ae.core.Screen
class AEClassScreen extends AEClassJavaObject {

	_p: {
		width: number;
		height: number;
	}
	
	//private final ObjectPicker _picker;
	
	//protected int _fbo = 0;
	//protected int _rbo = 0;
	
	engine: ae.core.AbstractEngine;
	hasOffscreenBuffer: boolean;
	supportsEntityPicking: boolean;
	
	onSizeChange: _ae.core.SizeChangeEvent<_ae.core.Screen>;
	/*
	final void executePicking() {
		
		glBindFramebuffer(GL_FRAMEBUFFER, _fbo);
		
		_picker.executeJobs();
		
		// TODO: necessary?
		glBindFramebuffer(GL_FRAMEBUFFER, 0);
	}
	*/
	
	// protected constructor ///////////////////////////////////////////////////
	
	constructor(
			engine:       ae.core.AbstractEngine,
			fbo:          boolean,
			pickingLayer: number) {

		super();
			
		this._p = {
			width:  0,
			height: 0,
		};
			
		this.engine                = engine;
		this.supportsEntityPicking = pickingLayer >= 0;
		this.hasOffscreenBuffer    = fbo || this.supportsEntityPicking;
		this.onSizeChange          = new AEClassSizeChangeEvent(this);
		
		if(this.supportsEntityPicking) {
			//this._picker = new ObjectPicker(this, pickingLayer);
			//engine._addPickingScreen(this);
		} else {
			//this._picker = null;
		}
		
		// Will be frozen in derived class
	}
	
	// protected methods ///////////////////////////////////////////////////////
	
	// Must invalidate all rects in all layers
	_setSize(
			width:  number,
			height: number): void {
		
		throw _AE_EXCEPTION_ABSTRACT_METHOD;
	}
	
	// public getters + setters ////////////////////////////////////////////////
	
	get width (): number {return this._p.width;}
	get height(): number {return this._p.height;}
	
	// public methods //////////////////////////////////////////////////////////
	
	containsPoint(
			x: number,
			y: number): boolean {
		
		return x >= 0 && x < this.width && y >= 0 && y < this.height;
	}
	
	render(gl: WebGLRenderingContext): void {
		throw _AE_EXCEPTION_ABSTRACT_METHOD;
	}
	
	setSize(
			width:  number,
			height: number): this {
		
		if(width === this.width && height === this.height) return this;
		
		this._p.width  = width;
		this._p.height = height;
		/*
		// Delete previous buffers
        glDeleteFramebuffers (_fbo);
        glDeleteRenderbuffers(_rbo);
        
        // Generate new buffers
 		_fbo = glGenFramebuffers();
 		_rbo = glGenRenderbuffers();
		
 		// Bind all buffers
		glBindFramebuffer (GL_FRAMEBUFFER,  _fbo);
		glBindRenderbuffer(GL_RENDERBUFFER, _rbo);
 		
		// Create and attach renderbuffer to the framebuffer
		glRenderbufferStorage(
			GL_RENDERBUFFER, GL_DEPTH_COMPONENT24, _width, _height);
		glFramebufferRenderbuffer(
			GL_FRAMEBUFFER, GL_DEPTH_ATTACHMENT, GL_RENDERBUFFER, _rbo);
		
		// Adapt the picking layer texture
		if(supportsEntityPicking) _picker.adaptTextureSize();
		*/
		// Other layers may be filled here
		this._setSize(width, height);
		/*
		// Unbind all buffers
		glBindFramebuffer (GL_FRAMEBUFFER,  0);
		glBindRenderbuffer(GL_RENDERBUFFER, 0);
		*/
		this.onSizeChange._setSize(width, height);
		
		return this;
	}
}

// ae.core.AbstractEngine$Display
class AEClassDisplay extends AEClassScreen {
	
	_layer: _ae.core.ScreenLayer;
	
	// protected methods ///////////////////////////////////////////////////////
	
	_setSize(
			width:  number,
			height: number): void {
		
		this._layer._invalidateRects();
	}
	
	// internal constructor ////////////////////////////////////////////////////
	
	constructor(
			engine:        ae.core.AbstractEngine,
			entityPicking: boolean) {
		
		super(engine, false, entityPicking ? 0 : -1);
		
		this._layer = new AEClassScreenLayer(this);
		Object.freeze(this);
	}
	
	// public methods //////////////////////////////////////////////////////////
	
	render(gl: WebGLRenderingContext): void {
		
		// Ensure rendering to the screen
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		
		// Render the only layer available
		this._layer._renderVisual(gl);
	}
}

// _ae.core.Screen$Layer
class AEClassScreenLayer extends AEClassJavaObject {
	
	_rects: ae.col.PooledOrderedSet<ae.core.ScreenRect>;
	
	screen: _ae.core.Screen;
	
	// protected constructor ///////////////////////////////////////////////////
	
	constructor(
			screen: _ae.core.Screen,
			freeze: boolean = true) {
		
		super();
		
		this._rects  = new AEClassPooledOrderedSet();
		this. screen = screen;
		
		if(freeze) Object.freeze(this);
	}
	
	// protected methods ///////////////////////////////////////////////////////
	
	_invalidateRects(): void {
		this._rects.forEach(
			(i) => i._invalidate(this.screen.width, this.screen.height));
	}
	
	_renderVisual(gl: WebGLRenderingContext): void {
		this._rects.forEach((i) => i._render(gl, true));
	}
	
	// internal methods ////////////////////////////////////////////////////////
	/*
	final void _renderObjectPicking(
			final ObjectPicker objectPicker,
			final int          x,
			final int          y) {
		
		for(Rect i : _rects.reverse) {
			if(i._containsPoint(x, y)) {
				glScissor(x, y, 1, 1);
				i._render(false);
				break;
			}
		}
	}
	*/
	// public methods //////////////////////////////////////////////////////////
	
	appendRects(... rects: Array<ae.core.ScreenRect>): this {
		this._rects.addAll(rects);
		return this;
	}
	
	moveAfter(
			rect:    ae.core.ScreenRect,
			refRect: ae.core.ScreenRect): this {
		
		this._rects.insertAfter(rect, refRect);
		return this;
	}

	moveBefore(
			rect:    ae.core.ScreenRect,
			refRect: ae.core.ScreenRect): this {
		
		this._rects.insertBefore(rect, refRect);
		return this;
	}
	
	moveToBack(rect: ae.core.ScreenRect): this {
		this._rects.insertAtFront(rect);
		return this;
	}
	
	moveToFront(rect: ae.core.ScreenRect): this {
		this._rects.insertAtEnd(rect);
		return this;
	}
	/*
	public final void pickInstance(
			final ObjectPicker.PickedCallback callback) {
		
		pickInstance(
			Screen.this.engine.input.getX(),
			Screen.this.engine.input.getY(),
			callback);
	}
	
	public final void pickInstance(
			final int                         x,
			final int                         y,
			final ObjectPicker.PickedCallback callback) {
		
		if(!Screen.this.supportsEntityPicking)
			throw new UnsupportedOperationException(
				"The layer doesn't support entity picking");
		
		Screen.this._picker.pickInstance(this, x, y, callback);
	}
	*/
	setCamera(camera: ae.sg.Camera): this {
		
		this._rects.clear();
		this._rects.insertAtEnd(new AEClassScreenRect(camera));
		
		return this;
	}
	
	split(
			rowCount:    number,
			columnCount: number,
			cameras:     Array<ae.sg.Camera>): this {
		
		this._rects.clear();
		
		const rowCountF    = rowCount;
		const columnCountF = columnCount;
		
		for(let i = 0; i < rowCount; i++) {
			for(let j = 0; j < columnCount; j++) {
				
				const cameraPos = i * columnCount + j;
				if(cameraPos >= cameras.length) break;
				
				this._rects.insertAtEnd(new AEClassScreenRect(cameras[cameraPos]).
					setRelativePosition(j / columnCountF, i / rowCountF).
					setRelativeSize    (1 / columnCountF, 1 / rowCountF));
			}
		}
		
		return this;
	}
}

// _ae.core.Screen$Rect
class AEClassScreenRect extends AEClassJavaObject {
	
	_p: {
		camera:       ae.sg.Camera;
		x:            number;
		y:            number;
		width:        number;
		height:       number;
		screenWidth:  number;
		screenHeight: number;
		absolutePos:  boolean;
		absoluteSize: boolean;
	}
	
	_projection: ae.math.Matrix4D;
	_absRect:    ae.util.CachedObject<Array<number>>
	
	onSizeChange: _ae.core.SizeChangeEvent<ae.core.ScreenRect>;
	
	// private methods /////////////////////////////////////////////////////////
	
	_checkSizeDimension(value: number): number {
		if(value < 0) throw "Rect size must be greater or equal to 0";
		return value;
	}

	_computeCachedRect(dst: Array<number>): Array<number> {
		
		const x            = this._p.x;
		const y            = this._p.y;
		const width        = this._p.width;
		const height       = this._p.height;
		const screenWidth  = this._p.screenWidth;
		const screenHeight = this._p.screenHeight;
		
		if(this._p.absolutePos) {
			dst[0] = x;
			dst[1] = y;
		} else {
			dst[0] = Math.round(x * screenWidth);
			dst[1] = Math.round(y * screenHeight);
		}
		
		if(this._p.absoluteSize) {
			dst[2] = width;
			dst[3] = height;
		} else {
			dst[2] =
				Math.round((dst[0] / screenWidth  + width ) * screenWidth ) -
				dst[0];
			dst[3] =
				Math.round((dst[1] / screenHeight + height) * screenHeight) -
				dst[1];
		}
		
		this.onSizeChange._setRect(dst[0], dst[1], dst[2], dst[3]);
		
		return dst;
	}
	
	_invalidateRect(): this {
		this._absRect.invalidate();
		return this;
	}
	
	// internal methods ////////////////////////////////////////////////////////
	
	_containsPoint(
			x: number,
			y: number): boolean {
		
		const absRect = this._absRect.object;
		
		return (
			x >= absRect[0] && x < absRect[0] + absRect[2] &&
			y >= absRect[1] && y < absRect[1] + absRect[3]);
	}
	
	_invalidate(
			screenWidth:  number,
			screenHeight: number): this {
		
		this._p.screenWidth  = screenWidth;
		this._p.screenHeight = screenHeight;
		
		this._absRect.invalidate();
		
		return this;
	}
	
	_render(
			gl:     WebGLRenderingContext,
			visual: boolean): void {
		
		if(this.camera.instance === null) return;
		
		const absRect = this._absRect.object;
		
		// The viewport must always be set to the full rect
		gl.viewport(absRect[0], absRect[1], absRect[2], absRect[3]);
		
		if(visual)
			gl.scissor(absRect[0], absRect[1], absRect[2], absRect[3]);
		
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		
		this._p.camera.sceneGraph._render(
			gl,
			this._p.camera,
			this._p.camera.createProjectionMatrix(
				absRect[2], absRect[3], this._projection),
			visual);
	}
	
	// public constructor //////////////////////////////////////////////////////
	
	constructor(camera: ae.sg.Camera) {
		
		super();
		
		this._projection = new AEClassMatrix4D();
		this._absRect    = new AEClassCachedObject(
			Array(4),
			(rect) => {
				// $NOT_NULL: 'rect'
				return this._computeCachedRect(rect);
			});
		this._p          = {
			camera:       camera,
			x:            0,
			y:            0,
			width:        1,
			height:       1,
			screenWidth:  0,
			screenHeight: 0,
			absolutePos:  false,
			absoluteSize: false,
		};
		
		this.onSizeChange = new AEClassSizeChangeEvent(this);
		
		Object.freeze(this);
	}
	
	// public getters + setters ////////////////////////////////////////////////
	
	get camera(): ae.sg.Camera {return this._p.camera;}
	
	set camera(camera: ae.sg.Camera): void {this._p.camera = camera;}
	
	// public methods
	
	setAbsolutePosition(
			x: number,
			y: number): this {
		
		this._p.absolutePos = true;
		this._p.x           = x;
		this._p.y           = y;
		
		return this._invalidateRect();
	}
	
	setAbsoluteSize(
			width:  number,
			height: number): this {
		
		this._p.absoluteSize = true;
		this._p.width        = this._checkSizeDimension(width);
		this._p.height       = this._checkSizeDimension(height);
		
		return this._invalidateRect();
	}
	
	setRelativePosition(
			x: number,
			y: number): this {
		
		this._p.absolutePos = false;
		this._p.x           = x;
		this._p.y           = y;
		
		return this._invalidateRect();
	}
	
	setRelativeSize(
			width:  number,
			height: number): this {
		
		this._p.absoluteSize = false;
		this._p.width        = this._checkSizeDimension(width);
		this._p.height       = this._checkSizeDimension(height);
		
		return this._invalidateRect();
	}
}
