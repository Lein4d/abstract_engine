package ae.core;

import static org.lwjgl.opengl.EXTTextureFilterAnisotropic.*;
import static org.lwjgl.opengl.GL11.*;
import static org.lwjgl.opengl.GL30.*;

import java.nio.ByteBuffer;

import ae.math.Vector4D;

public final class Texture {
	
	private int _id;
	
	public Texture(
			final int        width,
			final int        height,
			final boolean    alpha,
			final boolean    filterMinLinear,
			final boolean    filterMagLinear,
			final boolean    mipMap,
			final boolean    filterMipMapLinear,
			final float      anisotropy,
			final ByteBuffer data) {
		
		final int format = alpha ? GL_RGBA : GL_RGB;
		
		_id = glGenTextures();
		
		glBindTexture(GL_TEXTURE_2D, _id);
		
		// Set min filtering
		glTexParameteri(
			GL_TEXTURE_2D,
			GL_TEXTURE_MIN_FILTER,
			mipMap ?
				(filterMinLinear ?
					(filterMipMapLinear ?
						GL_LINEAR_MIPMAP_LINEAR  : GL_LINEAR_MIPMAP_NEAREST) :
					(filterMipMapLinear ?
						GL_NEAREST_MIPMAP_LINEAR : GL_NEAREST_MIPMAP_NEAREST)) :
				(filterMinLinear ? GL_LINEAR : GL_NEAREST));
		
		// Set mag filtering
		glTexParameteri(
			GL_TEXTURE_2D,
			GL_TEXTURE_MAG_FILTER,
			filterMagLinear ? GL_LINEAR : GL_NEAREST);
		
		// Activate anisotropy filtering
		glTexParameterf(
			GL_TEXTURE_2D,
			GL_TEXTURE_MAX_ANISOTROPY_EXT,
			glGetFloat(GL_MAX_TEXTURE_MAX_ANISOTROPY_EXT));
		
		// Set pixel data
		glTexImage2D(
			GL_TEXTURE_2D,
			0, format, width, height, 0,
			format, GL_UNSIGNED_BYTE, data);
		
		if(mipMap) glGenerateMipmap(GL_TEXTURE_2D);

		glBindTexture(GL_TEXTURE_2D, 0);
	}
	
	public static final Texture createCheckerTexture(
			final Vector4D c1,
			final Vector4D c2) {
		
		c1.copyStaticValues();
		c2.copyStaticValues();
		
		return createCheckerTexture(
			c1.x, c1.y, c1.z, c1.w, c2.x, c2.y, c2.z, c2.w);
	}
	
	public static final Texture createCheckerTexture(
			final float r1,
			final float g1,
			final float b1,
			final float a1,
			final float r2,
			final float g2,
			final float b2,
			final float a2) {
		
		final TextureBuilder tb = new TextureBuilder();
		
		tb.setFiltering(true, false, false, false, -1);
		tb.setData(
			4, 4, true, false,
			(double x, double y, float[] color) -> {
				if((x < 0.5 && y < 0.5) || (x > 0.5 && y > 0.5)) {
					color[0] = r1; color[1] = g1; color[2] = b1; color[3] = a1;
				} else {
					color[0] = r2; color[1] = g2; color[2] = b2; color[3] = a2;
				}
			});
		
		return tb.createTexture();
	}
	
	public final void use() {
		glBindTexture(GL_TEXTURE_2D, _id);
	}
}
