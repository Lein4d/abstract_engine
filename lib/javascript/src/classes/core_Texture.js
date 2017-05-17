
// ae.core.TextureBuilder$PixelFormat
class AEClassPixelFormat extends AEClassJavaObject {
	
	_mapping: Array<number>;
	
	// internal constructor ////////////////////////////////////////////////////
	
	constructor(... mapping: Array<number>) {
		super();
		this._mapping = mapping;
		Object.freeze(this);
	}
}

// ae.core.Texture
class AEClassTexture extends AEClassJavaObject {
	
	_id: WebGLTexture;
	
	// internal methods ////////////////////////////////////////////////////////
	
	_use(gl: WebGLRenderingContext): void {
		gl.bindTexture(gl.TEXTURE_2D, this._id);
	}
	
	// public constructor //////////////////////////////////////////////////////
	
	constructor(
			gl:                 WebGLRenderingContext,
			width:              number,
			height:             number,
			alpha:              boolean,
			filterMinLinear:    boolean,
			filterMagLinear:    boolean,
			mipMap:             boolean,
			filterMipMapLinear: boolean,
			anisotropic:        boolean,
			data:               Uint8Array) {
		
		super();
		
		const format = alpha ? gl.RGBA : gl.RGB;
		const ext    = (
			gl.getExtension("EXT_texture_filter_anisotropic") ||
			gl.getExtension("MOZ_EXT_texture_filter_anisotropic") ||
			gl.getExtension("WEBKIT_EXT_texture_filter_anisotropic"));
		
		this._id = gl.createTexture();
		
		gl.bindTexture(gl.TEXTURE_2D, this._id);
		
		// Set min filtering
		gl.texParameteri(
			gl.TEXTURE_2D,
			gl.TEXTURE_MIN_FILTER,
			mipMap ?
				(filterMinLinear ?
					(filterMipMapLinear ?
						gl.LINEAR_MIPMAP_LINEAR  : gl.LINEAR_MIPMAP_NEAREST) :
					(filterMipMapLinear ?
						gl.NEAREST_MIPMAP_LINEAR : gl.NEAREST_MIPMAP_NEAREST)) :
				(filterMinLinear ? gl.LINEAR : gl.NEAREST));
		
		// Set mag filtering
		gl.texParameteri(
			gl.TEXTURE_2D,
			gl.TEXTURE_MAG_FILTER,
			filterMagLinear ? gl.LINEAR : gl.NEAREST);
		
		// Activate anisotropy filtering
		if(anisotropic && ext)
			gl.texParameterf(
				gl .TEXTURE_2D,
				ext.TEXTURE_MAX_ANISOTROPY_EXT,
				gl .getParameter(ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT));
		
		// Set pixel data
		gl.texImage2D(
			gl.TEXTURE_2D,
			0, format, width, height, 0,
			format, gl.UNSIGNED_BYTE, data);
		
		if(mipMap) gl.generateMipmap(gl.TEXTURE_2D);

		gl.bindTexture(gl.TEXTURE_2D, null);
	}
	
	// public methods //////////////////////////////////////////////////////////
	
	static createCheckerTextureA(
			engine: ae.core.AbstractEngine,
			c1:     ae.math.Vector4D,
			c2:     ae.math.Vector4D): ae.core.Texture {
		
		c1.copyStaticValues();
		c2.copyStaticValues();
		
		return AEClassTexture.createCheckerTextureB(
			engine, c1.x, c1.y, c1.z, c1.w, c2.x, c2.y, c2.z, c2.w);
	}
	
	static createCheckerTextureB(
			engine: ae.core.AbstractEngine,
			r1:     number,
			g1:     number,
			b1:     number,
			a1:     number,
			r2:     number,
			g2:     number,
			b2:     number,
			a2:     number): ae.core.Texture {
		
		const tb = new AEClassTextureBuilder(engine);
		
		tb.setFiltering(true, false, false, false, false);
		tb.setDataByGradient(
			4, 4, true,
			(x, y, color) => {
				if((x < 0.5 && y < 0.5) || (x > 0.5 && y > 0.5)) {
					color[0] = r1; color[1] = g1; color[2] = b1; color[3] = a1;
				} else {
					color[0] = r2; color[1] = g2; color[2] = b2; color[3] = a2;
				}
			},
			true, false);
		
		return tb.texture;
	}
}

// ae.core.TextureBuilder
class AEClassTextureBuilder extends AEClassJavaObject {
	/*
	public interface ContinuousGradient2D {

		// 0 <= x <= 1
		// 0 <= y <= 1
		// 0 <= color[i] <= 1
		void computeColor(double x, double y, float[] color);
	}
	
	public interface DiscreteGradient2D {
		
		// 0 <= x < width
		// 0 <= y < height
		// 0 <= color[i] < 256
		void computeColor(int x, int y, int[] color);
	}
	*/
	_p: {
		width:              number;
		height:             number;
		alpha:              boolean;
		filterMinLinear:    boolean;
		filterMagLinear:    boolean;
		mipMap:             boolean;
		filterMipMapLinear: boolean;
		anisotropic:        boolean;
		data:               (Uint8Array | null);
	}
	
	_gl:               WebGLRenderingContext;
	_lastValidTexture: ae.util.CachedObject<ae.core.Texture>;
	
	// private methods /////////////////////////////////////////////////////////
	
	static _checkDimensions(
			width:  number,
			height: number): void {
		
		if(width < 0 || height < 0)
			throw "Width (" + width + ") and height (" + height +
				") must be greater than 0";
		
		if(width % 4 !== 0 || height % 4 !== 0)
			throw "Width (" + width + ") and height (" + height +
				") must be multiples of 4 (due to padding problem)";
	}
	
	_createCachedTexture(): ae.core.Texture {
		
		if(this._p.data === null) throw "No pixel data specified";
		
		return new AEClassTexture(
			this._gl,
			this._p.width, this._p.height, this._p.alpha,
			this._p.filterMinLinear, this._p.filterMagLinear,
			this._p.mipMap, this._p.filterMipMapLinear, this._p.anisotropic,
			this._p.data);
	}
	
	// public constructor //////////////////////////////////////////////////////
	
	constructor(engine: ae.core.AbstractEngine) {
		
		super();
		
		this._gl               = engine.gl;
		// $NOT_NULL
		this._lastValidTexture = new AEClassCachedObject(null, (object) => this._createCachedTexture());
		this._p = {
			width:              -1,
			height:             -1,
			alpha:              false,
			filterMinLinear:    false,
			filterMagLinear:    false,
			mipMap:             false,
			filterMipMapLinear: false,
			anisotropic:        false,
			data:               null,
		};
		
		Object.freeze(this);
	}
	
	// public getters + setters ////////////////////////////////////////////////
	
	get texture(): ae.core.Texture {return this._lastValidTexture.object;}
	
	// public methods //////////////////////////////////////////////////////////
	/*
	public final TextureBuilder setData(final String fileName) {
		
		final int[] width  = new int[1];
		final int[] height = new int[1];
		final int[] comp   = new int[1];
		
		_data   = STBImage.stbi_load(fileName, width, height, comp, 0);
		_width  = width[0];
		_height = height[0];
		
		switch(comp[0]) {
			case 1: case 2: throw new UnsupportedOperationException();
			case 3: _alpha = false; break;
			case 4: _alpha = true;  break;
		}
		
		return this;
	}
	*/
	setData(
    		width:   number,
    		height:  number,
    		pixels:  Uint8Array,
    		format:  _ae.core.PixelFormat,
    		invertX: boolean = false,
    		invertY: boolean = false): this {
		
		AEClassTextureBuilder._checkDimensions(width, height);
		
		const channelMap = format._mapping;
		const newData    = new Uint8Array(width * height * channelMap.length);
		
		this._p.width  = width;
		this._p.height = height;
		this._p.alpha  = channelMap.length === 4;
		this._p.data   = newData;

		let xStart, dx;
		let yStart, dy;
		
		if(invertX) {
			xStart = width - 1;
			dx     = -1;
		} else {
			xStart = 0;
			dx     = 1;
		}

		if(invertY) {
			yStart = height - 1;
			dy     = -1;
		} else {
			yStart = 0;
			dy     = 1;
		}

		for(let i1 = yStart, i2 = 0; i2 < height; i1 += dy, i2++) {
			for(let j1 = xStart, j2 = 0; j2 < width; j1 += dx, j2++) {
				
				const pixelPos = (i1 * width + j1) * channelMap.length;
				
				for(let k = 0; k < channelMap.length; k++)
					newData[pixelPos + k] = pixels[pixelPos + channelMap[k]];
			}
		}
		
		return this;
	}
	
	setDataByGradient(
			width:           number,
			height:          number,
			alpha:           boolean,
			gradient:        Gradient2D,
			continuous:      boolean = false,
			stretchToBorder: boolean = false): this {
		
		AEClassTextureBuilder._checkDimensions(width, height);
		
		const srcColor = Array(alpha ? 4 : 3);
		
		if(continuous) {
			
			this.setDataByGradient(
				width, height, alpha,
				(x, y, color) => {
					
					if(stretchToBorder) {
						gradient(x / (width  - 1), y / (height - 1), srcColor);
					} else {
						gradient(
							(2.0 * x + 1) / (2.0 * width),
							(2.0 * y + 1) / (2.0 * height),
							srcColor);
					}
					
					AEClassTextureBuilder.toIntPixel(srcColor, color);
				});
			
		} else {
			
			const newData = new Uint8Array(width * height * srcColor.length);
			
			this._p.width  = width;
			this._p.height = height;
			this._p.alpha  = alpha;
			this._p.data   = newData;
			
			for(let i = 0; i < height; i++) {
				for(let j = 0; j < width; j++) {
					gradient(j, i, srcColor);
					for(let k = 0; k < srcColor.length; k++)
						newData[(i * width + j) * srcColor.length + k] = srcColor[k];
				}
			}
		}
		
		return this;
	}
	
	setFiltering(
			minLinear:    boolean,
			magLinear:    boolean,
			mipMap:       boolean,
			mipMapLinear: boolean,
			anisotropic:  boolean): this {
		
		this._p.filterMinLinear    = minLinear;
		this._p.filterMagLinear    = magLinear;
		this._p.mipMap             = mipMap;
		this._p.filterMipMapLinear = mipMapLinear;
		this._p.anisotropic        = anisotropic;
		
		return this;
	}
	
	static toIntPixel(
			src: Array<number>,
			dst: Array<number>): Array<number> {
		
		for(let i = 0; i < src.length; i++) dst[i] = Math.round(src[i] * 255);
		return dst;
	}
	
	static toFloatPixel(
			src: Array<number>,
			dst: Array<number>): Array<number> {
		
		for(let i = 0; i < src.length; i++) dst[i] = src[i] / 255;
		return dst;
	}
}
