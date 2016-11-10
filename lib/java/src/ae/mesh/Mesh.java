package ae.mesh;

import static org.lwjgl.opengl.GL11.*;
import static org.lwjgl.opengl.GL15.*;
import static org.lwjgl.opengl.GL20.*;
import static org.lwjgl.opengl.GL30.*;

import java.nio.ByteBuffer;

import ae.core.AbstractEngine;

public final class Mesh {
	
	public enum PrimitiveType {
		TRIANGLE(GL_TRIANGLES, 3), QUAD(GL_QUADS, 4);
		
		private final int _glMode;
		
		public final int size;
		
		private PrimitiveType(
				final int glMode,
				final int primitiveSize) {
			
			this._glMode = glMode;
			this.size    = primitiveSize;
		}
		
		public static final PrimitiveType fromPrimitiveSize(
				final int size) {
			
			switch(size) {
				case 3: return PrimitiveType.TRIANGLE;
				case 4: return PrimitiveType.QUAD;
			}
			
			throw new IllegalArgumentException(
				"Size doesn't match a primitive type");
		}
	}
	
	private static final float[] DEFAULT_NORMAL   = {0, 0, 0};
	private static final float[] DEFAULT_TEXCOORD = {0, 0};

	private final int _vbo;
	private final int _ibo;
	private final int _iboType;
	private final int _vao;
	
	public final int           vertexCount;
	public final int           indexCount;
	public final PrimitiveType primitiveType;
	public final boolean       autoNormals;
	public final boolean       textured;
	public final boolean       cullFacing;
	
	// If the bounding box vertices are transformed as well,
	// the bounding box stays valid.
	//public readonly Rect3D BoundingBox = new Rect3D();

	private final int _initIbo(
			final int[][] indices) {

		int iboType;
		int bufferPos = 0;

		glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, _ibo);

		// Determine the best format for the indeces

		if(vertexCount < 256) {
			iboType = GL_UNSIGNED_BYTE;
		} else if(vertexCount < 65536) {
			iboType = GL_UNSIGNED_SHORT;
		} else {
			iboType = GL_UNSIGNED_INT;
		}
		
		// Copy index data to ibo in the best format

		switch(iboType) {

			case GL_UNSIGNED_BYTE:
				
				final ByteBuffer iboData8 =
					ByteBuffer.allocateDirect(indexCount);
				
				for(int[] i : indices)
					for(int j : i) iboData8.put((byte)j);
				
				glBufferData(
					GL_ELEMENT_ARRAY_BUFFER,
					(ByteBuffer)iboData8.rewind(),
					GL_STATIC_DRAW);
				break;

			case GL_UNSIGNED_SHORT:

				final short[] iboData16 = new short[indexCount];

				for(int[] i : indices)
					for(int j : i) iboData16[bufferPos++] = (short)j;
				
				glBufferData(
					GL_ELEMENT_ARRAY_BUFFER, iboData16, GL_STATIC_DRAW);
				break;

			case GL_UNSIGNED_INT:
				
				final int[] iboData32 = new int[indexCount];

				for(int[] i : indices)
					for(int j : i) iboData32[bufferPos++] = j;
				
				glBufferData(
					GL_ELEMENT_ARRAY_BUFFER, iboData32, GL_STATIC_DRAW);
				break;
		}

		return iboType;
	}

	private final void _initVbo(
			final float[][] positions,
			final float[][] normals,
			final float[][] texCoords) {

		final float[] vboData = new float[8 * vertexCount];
		
		// Die Daten "interleaved" in den Puffer kopieren
		for(int i = 0; i < vertexCount; i++) {
			
			System.arraycopy(positions[i], 0, vboData, i * 8, 3);
			
			System.arraycopy(
				normals   != null ? normals[i]   : DEFAULT_NORMAL,   0,
				vboData, i * 8 + 3, 3);
			
			System.arraycopy(
				texCoords != null ? texCoords[i] : DEFAULT_TEXCOORD, 0,
				vboData, i * 8 + 6, 2);
		}
		
		// Das VBO initialisieren
		glBindBuffer(GL_ARRAY_BUFFER, _vbo);
		glBufferData(GL_ARRAY_BUFFER, vboData, GL_STATIC_DRAW);
	}

	private final void _setVertexAttributes() {
		
		final int vertexSize = (3 + 3 + 2) * AbstractEngine.SIZE_FLOAT;
		
		// Positions
		glEnableVertexAttribArray(0);
		glVertexAttribPointer(
			0, 3, GL_FLOAT, false, vertexSize, 0);
		
		// Normals
		glEnableVertexAttribArray(1);
		glVertexAttribPointer(
			1, 3, GL_FLOAT, false, vertexSize, 3 * AbstractEngine.SIZE_FLOAT);

		// Tex-coords
		glEnableVertexAttribArray(2);
		glVertexAttribPointer(
			2, 2, GL_FLOAT, false, vertexSize, 6 * AbstractEngine.SIZE_FLOAT);
	}

	public Mesh(
			final int[][]   indices,
			final float[][] positions,
			final float[][] normals,
			final float[][] texCoords,
			final boolean   autoNormals,
			final boolean   cullFacing) {
		
		_vbo = glGenBuffers();
		_ibo = glGenBuffers();
		_vao = glGenVertexArrays();
		
		this.primitiveType = PrimitiveType.fromPrimitiveSize(indices[0].length);
		this.vertexCount   = positions.length;
		this.indexCount    = indices.length * primitiveType.size;
		this.autoNormals   = autoNormals;
		this.textured      = texCoords != null;
		this.cullFacing    = cullFacing;
		
		// Init the vao
		glBindVertexArray(_vao);
		
		// Fill the vbo
		_initVbo(positions, normals, texCoords);
		_setVertexAttributes();
		
		// Fill the ibo
		_iboType = _initIbo(indices);
		
		// Unbind all buffers to prevent them from changes
		glBindVertexArray(0);
		glBindBuffer(GL_ARRAY_BUFFER, 0);
		glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, 0);
		
		// Assign Bounding Box
		//mesh.ComputeBoundingBox(BoundingBox);
	}
	
	public final void draw() {
		
		glBindVertexArray(_vao);
		glDrawElements(primitiveType._glMode, indexCount, _iboType, 0);
	}

	@Override
	public final void finalize() {

		glDeleteBuffers(_vbo);
		glDeleteBuffers(_ibo);
		glDeleteVertexArrays(_vao);
	}
}
