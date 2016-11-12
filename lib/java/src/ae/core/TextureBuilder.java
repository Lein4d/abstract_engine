package ae.core;

import java.nio.ByteBuffer;

import org.lwjgl.stb.STBImage;

import ae.util.CachedObject;

public final class TextureBuilder {

	public enum PixelFormat {
		RGB (0, 1, 2),    BGR (2, 1, 0),
		RGBA(0, 1, 2, 3), BGRA(2, 1, 0, 3), ARGB(1, 2, 3, 0), ABGR(3, 2, 1, 0);
		
		public final int[] mapping;
		
		private PixelFormat(
				final int ... mapping) {
			
			this.mapping = mapping;
		}
	}

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
	
	private final CachedObject<Texture> _lastValidTexture =
		new CachedObject<Texture>(null, (object) -> _createCachedTexture());
	
	private int        _width              = -1;
	private int        _height             = -1;
	private boolean    _alpha              = false;
	private boolean    _filterMinLinear    = false;
	private boolean    _filterMagLinear    = false;
	private boolean    _mipMap             = false;
	private boolean    _filterMipMapLinear = false;
	private float      _anisotropy         = 1;
	private ByteBuffer _data               = null;
	
	private static final void _checkDimensions(
			final int width,
			final int height) {
		
		if(width < 0 || height < 0)
			throw new UnsupportedOperationException(
				"Width (" + width + ") and height (" + height +
				") must be greater than 0");
		
		if(width % 4 != 0 || height % 4 != 0)
			throw new UnsupportedOperationException(
				"Width (" + width + ") and height (" + height +
				") must be multiples of 4 (due to padding problem)");
	}
	
	private final Texture _createCachedTexture() {
		
		return new Texture(
			_width, _height, _alpha,
			_filterMinLinear, _filterMagLinear,
			_mipMap, _filterMipMapLinear, _anisotropy,
			_data);
	}
	
	public final Texture createTexture() {
		return _lastValidTexture.getObject();
	}
	
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
	
	public final TextureBuilder setData(
    		final int         width,
    		final int         height,
    		final byte[]      pixels,
    		final PixelFormat format) {
		
		return setData(width, height, pixels, format, false, false);
	}
	
	public final TextureBuilder setData(
    		final int         width,
    		final int         height,
    		final byte[]      pixels,
    		final PixelFormat format,
    		final boolean     invertX,
    		final boolean     invertY) {
		
		_checkDimensions(width, height);
		
		final int[] channelMap = format.mapping;

		_width  = width;
		_height = height;
		_alpha  = channelMap.length == 4;
		_data   = ByteBuffer.allocateDirect(width * height * channelMap.length);

		int xStart, dx;
		int yStart, dy;
		int pixelPos;
		
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

		for(int i1 = yStart, i2 = 0; i2 < height; i1 += dy, i2++) {
			for(int j1 = xStart, j2 = 0; j2 < width; j1 += dx, j2++) {
				
				pixelPos = (i1 * width + j1) * channelMap.length;
				
				for(int k = 0; k < channelMap.length; k++)
					_data.put(pixels[pixelPos + channelMap[k]]);
			}
		}
		
		_data.rewind();
		
		return this;
	}
	
	public final TextureBuilder setData(
    		final int                  width,
    		final int                  height,
    		final boolean              alpha,
    		final boolean              stretchToBorder,
    		final ContinuousGradient2D gradient) {

		final float[] fColor = new float[alpha ? 4 : 3];
		
		return setData(
			width, height, alpha,
			(int x, int y, int[] color) -> {
				
				if(stretchToBorder) {
					gradient.computeColor(
						(double)x / (width  - 1),
						(double)y / (height - 1),
						fColor);
				} else {
					gradient.computeColor(
						(2.0 * x + 1) / (2.0 * width),
						(2.0 * y + 1) / (2.0 * height),
						fColor);
				}
				
				toIntPixel(fColor, color);
			});
	}

	public final TextureBuilder setData(
    		final int                width,
    		final int                height,
    		final boolean            alpha,
    		final DiscreteGradient2D gradient) {

		_checkDimensions(width, height);
		
		final int[] color = new int[alpha ? 4 : 3];
		
		_width  = width;
		_height = height;
		_alpha  = alpha;
		_data   = ByteBuffer.allocateDirect(width * height * color.length);
		
		for(int i = 0; i < height; i++) {
			for(int j = 0; j < width; j++) {
				
				gradient.computeColor(j, i, color);
				
				for(int k = 0; k < color.length; k++) _data.put((byte)color[k]);
			}
		}
		
		_data.rewind();
		
		return this;
	}
	
	public final TextureBuilder setFiltering(
			final boolean minLinear,
			final boolean magLinear,
			final boolean mipMap,
			final boolean mipMapLinear,
			final float   anisotropy) {
		
		_filterMinLinear    = minLinear;
		_filterMagLinear    = magLinear;
		_mipMap             = mipMap;
		_filterMipMapLinear = mipMapLinear;
		_anisotropy         = anisotropy;
		
		return this;
	}
	
	public static final int[] toIntPixel(
			final float[] src,
			final int[]   dst) {
		
		for(int i = 0; i < src.length; i++) dst[i] = Math.round(src[i] * 255);
		return dst;
	}
	
	public static final float[] toFloatPixel(
			final int[]   src,
			final float[] dst) {
		
		for(int i = 0; i < src.length; i++) dst[i] = src[i] / 255f;
		return dst;
	}
}
