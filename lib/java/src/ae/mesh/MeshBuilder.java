package ae.mesh;

import java.util.Arrays;
import java.util.LinkedList;
import java.util.List;

import ae.math.Matrix4D;
import ae.math.Vector3D;
import ae.util.ArrayIterator;
import ae.util.CachedObject;
import ae.util.Functions;

public class MeshBuilder {
	
	public interface Filler<T> {
		void fill(T obj, int index);
	}
	
	public final class Triangle {
		
		private int   _smoothingGroup = 0;
		final   int[] _vIndices       = new int[3];
		
		private final void _assign(final Triangle t) {
			setIndices       (t._vIndices);
			setSmoothingGroup(t._smoothingGroup);
		}
		
		private final void _assignAuxVectors(
    			final int p0,
    			final int p1,
    			final int p2) {
			
			_auxP .setData(_vertices[_vIndices[p0]]._position);
			_auxV1.setData(_vertices[_vIndices[p1]]._position).sub(_auxP);
			_auxV2.setData(_vertices[_vIndices[p2]]._position).sub(_auxP);
		}
		
		// Computes the angle of the vectors p0p1 and p0p2 in radians
		private final float _computeAngle(
				final int p0,
				final int p1,
				final int p2) {
			
			_assignAuxVectors(p0, p1, p2);
			return Vector3D.angleRad(_auxV1, _auxV2);
		}
		
		private final void _computeAngles(final float[] dst) {
			dst[0] = _computeAngle(0, 1, 2);
			dst[1] = _computeAngle(1, 2, 0);
			dst[2] = _computeAngle(2, 0, 1);
		}
		
		private final void _computeNormal(final float[] dst) {
			_assignAuxVectors(0, 1, 2);
			Vector3D.cross(_auxV1, _auxV2, _auxP).normalize().getData(dst);
		}
		
		private final int _getVIndexPos(final int vIndex) {
			for(int i = 0; i < 3; i++) if(_vIndices[i] == vIndex) return i;
			return -1;
		}
		
		public final Triangle setIndices(final int[] indices) {
			return setIndices(indices[0], indices[1], indices[2]);
		}
		
		public final Triangle setIndices(
				final int v1,
				final int v2,
				final int v3) {
			
			_vIndices[0] = v1; _vIndices[1] = v2; _vIndices[2] = v3;
			return this;
		}
		
		public final Triangle setSmoothingGroup(final int smoothingGroup) {
			_smoothingGroup = smoothingGroup;
			return this;
		}
	}
	
	public final class Vertex {

		private Triangle[] _adjacency = null;
		
		final float[] _position = new float[3];
		final float[] _normal   = new float[3];
		final float[] _uTangent = new float[3];
		final float[] _vTangent = new float[3];
		final float[] _texCoord = new float[2];
		
		private final int _addSmoothingGroup(
				final int[] auxArray,
				final int   sgCount,
				final int   smoothingGroup) {
			
			for(int i = 0; i < sgCount; i++)
				if(auxArray[i] == smoothingGroup) return sgCount;
			
			auxArray[sgCount] = smoothingGroup;
			
			return sgCount + 1;
		}
		
		private final void _assign(final Vertex v) {
			setPosition(v._position);
			setNormal  (v._normal);
			setUTangent(v._uTangent);
			setVTangent(v._vTangent);
			setTexCoord(v._texCoord);
		}
		
		private final int[] _collectSmoothingGroups(final int[] auxArray) {
			
			int sgCount = 0;
			
			for(Triangle i : _adjacency)
				sgCount =
					_addSmoothingGroup(auxArray, sgCount, i._smoothingGroup);
			
			return Arrays.copyOfRange(auxArray, 0, sgCount);
		}
		
		private final void _computeSmoothNormal(final int ownIndex) {
			
			// TODO
		}
		
		public final Vertex setNormal(final float[] normal) {
			return setNormal(normal[0], normal[1], normal[2]);
		}
		
		public final Vertex setNormal(
				final float nx,
				final float ny,
				final float nz) {
			
			_normal[0] = nx; _normal[1] = ny; _normal[2] = nz;
			return this;
		}

		public final Vertex setPosition(final float[] position) {
			return setPosition(position[0], position[1], position[2]);
		}
		
		public final Vertex setPosition(
				final float x,
				final float y,
				final float z) {
			
			_position[0] = x; _position[1] = y; _position[2] = z;
			return this;
		}

		public final Vertex setTexCoord(final float[] texCoordd) {
			return setTexCoord(texCoordd[0], texCoordd[1]);
		}
		
		public final Vertex setTexCoord(
				final float s,
				final float t) {
			
			_texCoord[0] = s; _texCoord[1] = t;
			return this;
		}

		public final Vertex setUTangent(final float[] uTangent) {
			return setUTangent(uTangent[0], uTangent[1], uTangent[2]);
		}
		
		public final Vertex setUTangent(
				final float ux,
				final float uy,
				final float uz) {
			
			_uTangent[0] = ux; _uTangent[1] = uy; _uTangent[2] = uz;
			return this;
		}

		public final Vertex setVTangent(final float[] vTangent) {
			return setVTangent(vTangent[0], vTangent[1], vTangent[2]);
		}
		
		public final Vertex setVTangent(
				final float vx,
				final float vy,
				final float vz) {
			
			_vTangent[0] = vx; _vTangent[1] = vy; _vTangent[2] = vz;
			return this;
		}
	}
	
	private final CachedObject<Mesh> _lastValidMesh =
		new CachedObject<Mesh>(null, (object) -> _createCachedMesh());
	private final List<Vertex>       _dynVertices   = new LinkedList<>();
	private final List<Triangle>     _dynTriangles  = new LinkedList<>();
	
	private final Vector3D _auxP  = Vector3D.createStatic();
	private final Vector3D _auxV1 = Vector3D.createStatic();
	private final Vector3D _auxV2 = Vector3D.createStatic();
	
	// Meta information
	private boolean _vertexAdjacency = false;
	
	// Geometry data
	private Vertex  [] _vertices  = null;
	private Triangle[] _triangles = null;
	
	public final Iterable<Triangle> triangles = () -> _triangles != null ?
		new ArrayIterator<>(_triangles) : _dynTriangles.iterator();
	public final Iterable<Vertex>   vertices  = () -> _vertices  != null ?
		new ArrayIterator<>(_vertices)  : _dynVertices .iterator();

	public boolean cullFacing = false;

	private final void _assertTrianglesSealed() {
		Functions.assertNotNull(_triangles, "Triangles are not sealed yet");
	}

	private final void _assertVerticesSealed() {
		Functions.assertNotNull(_vertices, "Vertices are not sealed yet");
	}
	/*
	private static final void _computeNormal(
			final float   p0x,
			final float   p0y,
			final float   p0z,
			final float   p1x,
			final float   p1y,
			final float   p1z,
			final float   p2x,
			final float   p2y,
			final float   p2z,
			final float[] n,
			final boolean normalize) {

		// Die Vektoren a und b für das Kreuzprodukt erstellen
		
		final float ax = p1x - p0x;
		final float ay = p1y - p0y;
		final float az = p1z - p0z;
		final float bx = p2x - p0x;
		final float by = p2y - p0y;
		final float bz = p2z - p0z;

		// Das Kreuzprodukt a x b berechnen
		
		n[0] = ay * bz - az * by;
		n[1] = az * bx - ax * bz;
		n[2] = ax * by - ay * bx;

		if(!normalize) return;

		// Den Normalenvektor normalisieren
		
		final float length =
			(float)Math.sqrt(n[0] * n[0] + n[1] * n[1] + n[2] * n[2]);

		n[0] /= length;
		n[1] /= length;
		n[2] /= length;
	}
	*/
	private final Mesh _createCachedMesh() {
		return new Mesh(this, cullFacing);
	}
	
	private final void _ensureVertexAdjacency() {
		
		if(_vertexAdjacency) return;
		
		ensureSealed();
		
		final int[] adjacencyCount = new int[_vertices.length];
		
		// Pass 1: Count the adjacency polygons for each vertex
		for(Triangle i : _triangles) for(int j : i._vIndices) adjacencyCount[j]++;
		
		// Pass 2: Create the adjacency arrays
		for(int i = 0; i < _vertices.length; i++)
			_vertices[i]._adjacency = new Triangle[adjacencyCount[i]];
		
		// Pass 3: Initialize the adjacency arrays
		// Use the previous computed adjacency count to determine the slot that
		// is written next by decrementing the counter each time
		for(Triangle i : _triangles) {
			for(int j : i._vIndices) {
				adjacencyCount[j]--;
				_vertices[j]._adjacency[adjacencyCount[j]] = i;
			}
		}
		
		_vertexAdjacency = true;
	}

	private final MeshBuilder _invalidateMesh() {
		_lastValidMesh.invalidate();
		return this;
	}
	
	public final MeshBuilder activeCullFaceSupport() {
		cullFacing = true;
		return this;
	}
	
	public final MeshBuilder addPolygon(
			final int     smoothingGroup,
			final int ... vIndices) {
		
		Functions.assertCond(
			_triangles == null, "Triangles are already sealed");
		
		for(int i = 2; i < vIndices.length; i++)
			_dynTriangles.add(new Triangle().
				setIndices       (vIndices[0], vIndices[i - 1], vIndices[i]).
				setSmoothingGroup(smoothingGroup));
		
		return this;
	}
	
	public final MeshBuilder addVertex(final Vertex vertex) {
		
		Functions.assertCond(
			_vertices == null, "Vertices are already sealed");
		
		_dynVertices.add(vertex);
		return this;
	}

	public final MeshBuilder allocateTriangles(final int triangleCount) {
		
		_triangles = new Triangle[triangleCount];
		
		for(int i = 0; i < _triangles.length; i++)
			_triangles[i] = new Triangle();
		
		return this;
	}
	
	public final MeshBuilder allocateVertices(final int vertexCount) {
		
		_vertices = new Vertex[vertexCount];
		
		for(int i = 0; i < _vertices.length; i++)
			_vertices[i] = new Vertex();
		
		return this;
	}

	public final MeshBuilder computeNormals() {
		
		ensureConsistentSmoothingGroups();
		_ensureVertexAdjacency();
		
		final float[][] flatNormals  = new float[_triangles.length][3];
		final float[][] vertexAngles = new float[_triangles.length][3];
		
		for(int i = 0; i < _triangles.length; i++) {
			_triangles[i]._computeNormal(flatNormals [i]);
			_triangles[i]._computeAngles(vertexAngles[i]);
		}
		
		for(int i = 0; i < _vertices.length; i++)
			_vertices[i]._computeSmoothNormal(i);
		
		return this;
	}

	public final MeshBuilder createDefaultTriangles() {
		
		allocateTriangles(_vertices.length / 3);
		
		for(int i = 0; i < _triangles.length; i++)
			for(int j = 0; j < 3; j++) _triangles[i]._vIndices[j] = i * 3 + j;
		
		return this;
	}
	
	public final Mesh createMesh() {
		return _lastValidMesh.getObject();
	}
	/*
	public final MeshBuilder ensureCollapsedSmoothingGroups() {
		
		if(_collapsedSGs) return this;
		
		// TODO
		
		_collapsedSGs = true;
		return this;
	}
	*/
	public final MeshBuilder ensureConsistentSmoothingGroups() {
		
		_ensureVertexAdjacency();
		
		int maxAdjacencyCount = 0;
		int newVertexCount    = 0;
		
		// Find the vertex with the maximum number of adjacent polygons
		for(Vertex i : _vertices)
			maxAdjacencyCount =
				Math.max(maxAdjacencyCount, i._adjacency.length);
		
		final int[][] smoothingGroups = new int[_vertices.length][];
		final int[]   auxArray        = new int[maxAdjacencyCount];
		
		for(int i = 0; i < _vertices.length; i++) {
			smoothingGroups[i] = _vertices[i]._collectSmoothingGroups(auxArray);
			newVertexCount    += smoothingGroups[i].length;
		}
		
		// Abort if each vertex belongs to exactly one smoothing group
		if(newVertexCount == _vertices.length) return this;
		
		final Vertex[] oldVertices = _vertices;
		
		allocateVertices(newVertexCount);
		
		// TODO
		
		_vertexAdjacency = false;
		
		return this;
	}
	
	public final MeshBuilder ensureSealed() {
		return ensureVerticesSealed().ensureTrianglesSealed();
	}
	
	public final MeshBuilder ensureTrianglesSealed() {
		
		if(_triangles != null) return this;
    	
		if(_dynTriangles.isEmpty()) {
			createDefaultTriangles();
		} else {
			_triangles =
				_dynTriangles.toArray(new Triangle[_dynTriangles.size()]);
			_dynTriangles.clear();
		}
		
		return this;
	}
	
	public final MeshBuilder ensureVerticesSealed() {
		
		if(_vertices != null) return this;
		
    	_vertices = _dynVertices.toArray(new Vertex[_dynVertices.size()]);
    	_dynVertices.clear();
    	
    	return this;
	}

	public final MeshBuilder fillTrianglexData(final Filler<Triangle> filler) {
		
		_assertTrianglesSealed();
		for(int i = 0; i < _triangles.length; i++)
			filler.fill(_triangles[i], i);
		
		return this;
	}
	
	public final MeshBuilder fillVertexData(final Filler<Vertex> filler) {
		
		_assertVerticesSealed();
		for(int i = 0; i < _vertices.length; i++) filler.fill(_vertices[i], i);
		
		return this;
	}
	
	public final Triangle getTriangle(final int tIndex) {
		_assertTrianglesSealed();
		return _triangles[tIndex];
	}
	
	public final Vertex getVertex(final int vIndex) {
		_assertVerticesSealed();
		return _vertices[vIndex];
	}

	public final int getTriangleCount() {
		return _triangles != null ? _triangles.length : _dynTriangles.size();
	}
	
	public final int getVertexCount() {
		return _vertices != null ? _vertices.length : _dynVertices.size();
	}
	
	public final MeshBuilder invertFaceOrientation() {
		
		ensureTrianglesSealed();
		
		int temp;
		
		// Swap index order of each polygon
		for(Triangle i : _triangles) {
			temp           = i._vIndices[1];
			i._vIndices[1] = i._vIndices[2];
			i._vIndices[2] = temp;
		}
		
		return _invalidateMesh();
	}
	
	public final MeshBuilder invertNormals() {
		
		ensureVerticesSealed();
		
		for(Vertex i : _vertices)
			for(int j = 0; j < 3; j++) i._normal[j] *= -1;
		
		return _invalidateMesh();
	}

	public final MeshBuilder makeFlat() {
		
		ensureTrianglesSealed();
		for(Triangle i : _triangles) i._smoothingGroup = 0;
		
		return this;
	}

	public final MeshBuilder makeSmooth() {
		
		ensureTrianglesSealed();
		
		for(int i = 0; i < _triangles.length; i++)
			_triangles[i]._smoothingGroup = i;
		
		return this;
	}
	
	public static final MeshBuilder merge(final MeshBuilder ... meshes) {

		final MeshBuilder mesh          = new MeshBuilder();
		final int[]       vIndexOffsets = new int[meshes.length];
		
		int vertexCount   = 0;
		int triangleCount = 0;
		int vIndex        = 0;
		int tIndex        = 0;
		
		for(int i = 0; i < meshes.length; i++) {
			vIndexOffsets[i] = vertexCount;
			vertexCount     += meshes[i].getVertexCount();
			triangleCount   += meshes[i].getTriangleCount();
		}
		
		mesh.allocateVertices (vertexCount);
		mesh.allocateTriangles(triangleCount);
		
		for(int i = 0; i < meshes.length; i++) {
			
			for(Vertex j : meshes[i].vertices)
				mesh._vertices[vIndex++]._assign(j);
			
			for(Triangle j : meshes[i].triangles)
				mesh._triangles[tIndex++]._assign(j);
		}
		
		return mesh;
	}

	public final MeshBuilder setPolygon(
			final int     startIndex,
			final int     smoothingGroup,
			final int ... vIndices) {
		
		_assertTrianglesSealed();
		
		for(int i = 2; i < vIndices.length; i++)
			_dynTriangles.add(_triangles[startIndex + i - 2].
				setIndices       (vIndices[0], vIndices[i - 1], vIndices[i]).
				setSmoothingGroup(smoothingGroup));
		
		return this;
	}
	
	public final MeshBuilder spliceUnusedVertices() {

		// Default indices may be created here
		ensureSealed();
		
		// The index map assigns each vertex a mapped index
		final Vertex[] oldVertices    = _vertices;
		final int[]    indexMap       = new int[_vertices.length];
		int            curMappedIndex = 0;
		
		// Initialize the map with -1, saying that all vertices should be
		// spliced
		for(int i = 0; i < indexMap.length; i++) indexMap[i] = -1;
		
		// After having looped all indices, 'curMappedIndex' contains the number
		// of actual referenced vertices
		for(Triangle i : _triangles)
			for(int j : i._vIndices)
				if(indexMap[j] == -1) indexMap[j] = curMappedIndex++;
		
		// Abort if all vertices are used
		if(curMappedIndex == _vertices.length) return this;
		
		allocateVertices(curMappedIndex);
		
		// Set the new indices based on the previous computed mapping
		for(Triangle i : _triangles)
			for(int j = 0; j < 3; j++)
				i._vIndices[j] = indexMap[i._vIndices[j]];
		
		// Copy all vertices to their new positions if the index map entry is
		// not -1
		for(int i = 0; i < oldVertices.length; i++)
			if(indexMap[i] >= 0) _vertices[indexMap[i]]._assign(oldVertices[i]);
		
		return _invalidateMesh();
	}
	
	public final MeshBuilder transformPositions(final Matrix4D transform) {
		
		ensureVerticesSealed();
		
		for(Vertex i : _vertices) {
			transform.applyToPoint    (i._position);
			transform.applyToDirVector(i._normal);
    		transform.applyToDirVector(i._uTangent);
    		transform.applyToDirVector(i._vTangent);
		}

		return _invalidateMesh();
	}

	public final MeshBuilder transformTexCoords(Matrix4D transform) {
		
		ensureVerticesSealed();
		for(Vertex i : _vertices) transform.applyToPoint(i._texCoord);

		return _invalidateMesh();
	}
}
