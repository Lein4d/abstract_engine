package ae.mesh;

import static org.lwjgl.opengl.GL11.*;
import static org.lwjgl.opengl.GL12.*;
import static org.lwjgl.opengl.GL15.*;
import static org.lwjgl.opengl.GL20.*;
import static org.lwjgl.opengl.GL30.*;
import static org.lwjgl.opengl.GL33.*;

import java.nio.ByteBuffer;

import org.lwjgl.BufferUtils;

import ae.math.Vector3D;
import ae.util.Functions;

public final class Mesh {
	
	private static final int _VERTEX_SIZE = 32;
	
	private final int _vbo;
	private final int _ibo;
	private final int _iboType;
	private final int _vao;

	private final Vector3D _tempV = Vector3D.createStatic(0, 0, 0);
	
	public final int     vertexCount;
	public final int     indexCount;
	public final boolean textured;
	public final boolean cullFacing;
	
	// If the bounding box vertices are transformed as well,
	// the bounding box stays valid.
	//public readonly Rect3D BoundingBox = new Rect3D();
	
	/*
	private final float _compressTangent(
			final float[] normal,
			final float[] tangent) {
		
		_tempN  .setData(normal);
		_tempAux.setData(normal);
		_tempT  .setData(tangent);
		
		// Ensure all values of the new vector are positive
		_tempAux.applyUnaryOp((x) -> Math.abs(x));
		_tempAux.copyStaticValues();
		
		// Add 1 to the smaller components of 'x' and 'y'
		// This should make the new vector different from the original normal
		// vector
		if(_tempAux.x < _tempAux.y) {
			_tempAux.backend.setX(_tempAux.x + 1);
		} else {
			_tempAux.backend.setY(_tempAux.y + 1);
		}
		
		// V1 and V2 span a plane perpendicular to the normal vector
		Vector3D.cross(_tempN, _tempAux, _tempV1);
		Vector3D.cross(_tempN, _tempV1,  _tempV2);
		
		// Create the matrix for the (V1|V2|N)-space
		_tempV1V2N.setColumns(_tempV1, _tempV2, _tempN);
		
		// Transform the tangent into the (V1|V2|N)-space
		_tempV1V2N.invert().apply(_tempT);
		
		// Project the tangent onto the V1-V2-plane by discarding the
		// N-component and compute the angle relative to V1
		return (float)Math.atan2(_tempT.backend.getY(), _tempT.backend.getX());
	}
	*/
	private final int _initIbo(final Iterable<MeshBuilder.Triangle> triangles) {

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
				
				for(MeshBuilder.Triangle i : triangles)
					for(int j : i._vIndices) iboData8.put((byte)j);
				
				glBufferData(
					GL_ELEMENT_ARRAY_BUFFER,
					(ByteBuffer)iboData8.rewind(),
					GL_STATIC_DRAW);
				break;

			case GL_UNSIGNED_SHORT:

				final short[] iboData16 = new short[indexCount];

				for(MeshBuilder.Triangle i : triangles)
					for(int j : i._vIndices) iboData16[bufferPos++] = (short)j;
				
				glBufferData(
					GL_ELEMENT_ARRAY_BUFFER, iboData16, GL_STATIC_DRAW);
				break;

			case GL_UNSIGNED_INT:
				
				final int[] iboData32 = new int[indexCount];

				for(MeshBuilder.Triangle i : triangles)
					for(int j : i._vIndices) iboData32[bufferPos++] = j;
				
				glBufferData(
					GL_ELEMENT_ARRAY_BUFFER, iboData32, GL_STATIC_DRAW);
				break;
		}

		return iboType;
	}

	private final void _initVbo(final Iterable<MeshBuilder.Vertex> vertices) {

		final ByteBuffer vboData = BufferUtils.createByteBuffer(vertexCount * 32);
		
		// Pack the data interleaved into the VBO buffer
		for(MeshBuilder.Vertex i : vertices) {
			
			// positions
			for(int j = 0; j < 3; j++) vboData.putFloat(i._position[j]);
			
			// normals and tangents
			vboData.putInt(_packDirVector(i._normal));
			vboData.putInt(_packDirVector(i._uTangent));
			vboData.putInt(_packDirVector(i._vTangent));
			
			// tex-coords
			for(int j = 0; j < 2; j++) vboData.putFloat(i._texCoord[j]);
			
		}
		vboData.rewind();
		
		// Initialize the VBO
		glBindBuffer(GL_ARRAY_BUFFER, _vbo);
		glBufferData(GL_ARRAY_BUFFER, vboData, GL_STATIC_DRAW);
	}

	private final int _packDirVector(final float[] v) {
		
		_tempV.setData(v).normalize();
		
		return
			Functions.packNormalizedFloatInInt(_tempV.backend.getZ(), 10)       |
			Functions.packNormalizedFloatInInt(_tempV.backend.getY(), 10) << 10 |
			Functions.packNormalizedFloatInInt(_tempV.backend.getX(), 10) << 20;
	}
	
	private final void _setVertexAttributes() {
		
		// positions
		glEnableVertexAttribArray(0);
		glVertexAttribPointer(
			0, 3, GL_FLOAT, false, _VERTEX_SIZE, 0);
		
		// normals
		glEnableVertexAttribArray(1);
		glVertexAttribPointer(
			1, GL_BGRA, GL_INT_2_10_10_10_REV, true, _VERTEX_SIZE, 12);

		// u-tangents
		glEnableVertexAttribArray(2);
		glVertexAttribPointer(
			2, GL_BGRA, GL_INT_2_10_10_10_REV, true, _VERTEX_SIZE, 16);

		// v-tangents
		glEnableVertexAttribArray(3);
		glVertexAttribPointer(
			3, GL_BGRA, GL_INT_2_10_10_10_REV, true, _VERTEX_SIZE, 20);

		// tex-coords
		glEnableVertexAttribArray(4);
		glVertexAttribPointer(
			4, 2, GL_FLOAT, false, _VERTEX_SIZE, 24);
	}

	public Mesh(
			final MeshBuilder mb,
			final boolean     cullFacing) {
		
		_vbo = glGenBuffers();
		_ibo = glGenBuffers();
		_vao = glGenVertexArrays();
		
		this.vertexCount = mb.getVertexCount();
		this.indexCount  = mb.getTriangleCount() * 3;
		this.textured    = true;
		this.cullFacing  = cullFacing;
		
		// Init the vao
		glBindVertexArray(_vao);
		
		// Fill the vbo
		_initVbo(mb.vertices);
		_setVertexAttributes();
		
		// Fill the ibo
		_iboType = _initIbo(mb.triangles);
		
		// Unbind all buffers to prevent them from changes
		glBindVertexArray(0);
		glBindBuffer(GL_ARRAY_BUFFER, 0);
		glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, 0);
		
		// Assign Bounding Box
		//mesh.ComputeBoundingBox(BoundingBox);
	}
	
	public final void draw() {
		glBindVertexArray(_vao);
		glDrawElements(GL_TRIANGLES, indexCount, _iboType, 0);
	}

	@Override
	public final void finalize() {
		glDeleteBuffers(_vbo);
		glDeleteBuffers(_ibo);
		glDeleteVertexArrays(_vao);
	}
}
