package ae.mesh;

import java.io.IOException;
import java.util.Arrays;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import ae.math.Matrix4D;
import ae.util.ArrayIterator;
import ae.util.CachedObject;
import ae.util.Functions;

public class MeshBuilder {
	
	private final class Adjacency {
		
		private final int[][] _data = new int[_vertices.length][];
		private final int     _maxAdjacencyCount;
		
		private Adjacency() {
			
			_assertTrianglesSealed();
			
			final int   vertexCount    = getVertexCount();
			final int[] adjacencyCount = new int[vertexCount];
			
			int maxAdjacencyCount = 0;
			
			// Pass 1: Count the adjacency polygons for each vertex
			for(Triangle i : _triangles)
				for(int j : i._vIndices) adjacencyCount[j]++;
			
			// Pass 2: Create the adjacency arrays
			for(int i = 0; i < vertexCount; i++) {
				_data[i]          = new int[adjacencyCount[i]];
				maxAdjacencyCount =
					Math.max(maxAdjacencyCount, adjacencyCount[i]);
			}
			
			// Pass 3: Initialize the adjacency arrays
			// Use the previous computed adjacency count to determine the slot that
			// is written next by decrementing the counter each time
			for(int i = 0; i < _triangles.length; i++) {
				for(int j : _triangles[i]._vIndices) {
					adjacencyCount[j]--;
					_data[j][adjacencyCount[j]] = i;
				}
			}
			
			_maxAdjacencyCount = maxAdjacencyCount;
		}
	}
	
	public interface Filler<T> {
		void fill(T obj, int index);
	}

	public interface FillerIO<T> {
		void fill(T obj, int index) throws IOException;
	}
	
	public final class Triangle {
		
		private int   _smoothingGroup = 0;
		final   int[] _vIndices       = new int[3];
		
		private final void _assign(final Triangle t) {
			setIndices       (t._vIndices);
			setSmoothingGroup(t._smoothingGroup);
		}
		
		private final void _computeNormalAndAngles(
				final float[] normal,
				final float[] angles) {
			
			final float[] p1 = _vertices[_vIndices[0]]._position;
			final float[] p2 = _vertices[_vIndices[1]]._position;
			final float[] p3 = _vertices[_vIndices[2]]._position;
			
			final float p1x = p1[0], p1y = p1[1], p1z = p1[2];
			final float p2x = p2[0], p2y = p2[1], p2z = p2[2];
			final float p3x = p3[0], p3y = p3[1], p3z = p3[2];
			
			final float d1x = p2x - p1x, d1y = p2y - p1y, d1z = p2z - p1z;
			final float d2x = p3x - p1x, d2y = p3y - p1y, d2z = p3z - p1z;
			final float d3x = p3x - p2x, d3y = p3y - p2y, d3z = p3z - p2z;
			
			final float l1 =
				(float)Math.sqrt(d1x * d1x + d1y * d1y + d1z * d1z);
			final float l2 =
				(float)Math.sqrt(d2x * d2x + d2y * d2y + d2z * d2z);
			final float l3 =
				(float)Math.sqrt(d3x * d3x + d3y * d3y + d3z * d3z);
			
			final float nx = d1y * d2z - d1z * d2y;
			final float ny = d1z * d2x - d1x * d2z;
			final float nz = d1x * d2y - d1y * d2x;
			
			final float ln = (float)Math.sqrt(nx * nx + ny * ny + nz * nz);
			
			normal[0] = nx / ln;
			normal[1] = ny / ln;
			normal[2] = nz / ln;
			
			angles[0] =
				_acos( (d1x * d2x + d1y * d2y + d1z * d2z) / (l1 * l2));
			angles[1] =
				_acos(-(d1x * d3x + d1y * d3y + d1z * d3z) / (l1 * l3));
			angles[2] =
				_acos( (d2x * d3x + d2y * d3y + d2z * d3z) / (l2 * l3));
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
		
		private final int[] _collectSmoothingGroups(
				final int[] adjacency,
				final int[] auxArray) {
			
			int sgCount = 0;
			
			for(int i : adjacency)
				sgCount = _addSmoothingGroup(
					auxArray, sgCount, _triangles[i]._smoothingGroup);
			
			return Arrays.copyOfRange(auxArray, 0, sgCount);
		}
		
		private final void _computeSmoothNormal(
				final float[][] flatNormals,
				final int[]     adjacencyTriangles,
				final float[]   adjacencyAngles) {
			
			float nx = 0, ny = 0, nz = 0;
			
			for(int i = 0; i < adjacencyTriangles.length; i++) {
				
				final float   angle      = adjacencyTriangles[i];
				final float[] flatNormal = flatNormals[adjacencyTriangles[i]];
				
				nx += angle * flatNormal[0];
				ny += angle * flatNormal[1];
				nz += angle * flatNormal[2];
			}
			
			final float length = (float)Math.sqrt(nx * nx + ny * ny + nz * nz);
			
			_normal[0] = nx / length;
			_normal[1] = ny / length;
			_normal[2] = nz / length;
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

		public final Vertex setTexCoord(final float[] texCoord) {
			return setTexCoord(texCoord[0], texCoord[1]);
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
	
	private static final float[] _ACOS_LOOKUP = new float[1001];
	
	private final CachedObject<Mesh> _lastValidMesh =
		new CachedObject<Mesh>(null, (object) -> _createCachedMesh());
	private final List<Vertex>       _dynVertices   = new LinkedList<>();
	private final List<Triangle>     _dynTriangles  = new LinkedList<>();
	
	private Vertex  [] _vertices  = null;
	private Triangle[] _triangles = null;
	
	public final Iterable<Triangle> triangles = () -> _triangles != null ?
		new ArrayIterator<>(_triangles) : _dynTriangles.iterator();
	public final Iterable<Vertex>   vertices  = () -> _vertices  != null ?
		new ArrayIterator<>(_vertices)  : _dynVertices .iterator();
	
	public boolean cullFacing = false;

	static {
		
		for(int i = 0; i < _ACOS_LOOKUP.length; i++) {
			_ACOS_LOOKUP[i] = (float)Math.acos((2.0 * i) / (_ACOS_LOOKUP.length - 1) - 1);
		}
	}
	
	private static final float _acos(final float x) {
		
		final float fPos = (x + 1) * 500;
		final int   iPos = (int)((x + 1) * 500);
		final float fract = fPos - iPos;
		
		return (1 - fract) * _ACOS_LOOKUP[iPos] + fract * _ACOS_LOOKUP[iPos + 1];
	}
	
	private final void _assertTrianglesNotSealed() {
		Functions.assertNull(_triangles, "Triangles are already sealed");
	}

	private final void _assertTrianglesSealed() {
		Functions.assertNotNull(_triangles, "Triangles are not sealed yet");
	}

	private final void _assertVerticesNotSealed() {
		Functions.assertNull(_vertices, "Vertices are already sealed");
	}
	
	private final void _assertVerticesSealed() {
		Functions.assertNotNull(_vertices, "Vertices are not sealed yet");
	}
	
	private final Mesh _createCachedMesh() {
		return new Mesh(this, cullFacing);
	}
	
	// The function checks whether there are vertices that belong to triangles
	// with different smoothing groups. These vertices are split into new
	// vertices.
	private final boolean _ensureConsistentSmoothingGroups(
			final Adjacency adjacency) {
		
		final int[][]  smoothingGroups = new int[_vertices.length][];
		final int[]    auxArray        = new int[adjacency._maxAdjacencyCount];
		final int[]    vIndexMap       = new int[_vertices.length];
		final Vertex[] oldVertices     = _vertices;

		int newVertexCount = 0;
		
		for(int i = 0; i < _vertices.length; i++) {
			smoothingGroups[i] = _vertices[i]._collectSmoothingGroups(
				adjacency._data[i], auxArray);
			vIndexMap[i]       = newVertexCount;
			newVertexCount    += smoothingGroups[i].length;
		}
		
		// Abort if each vertex belongs to exactly one smoothing group
		if(newVertexCount == _vertices.length) return true;
		
		allocateVertices(newVertexCount);
		
		// Copy the old vertices into the new array
		// (as often as it has smoothing groups)
		for(int i = 0; i < oldVertices.length; i++)
			for(int j = 0; j < smoothingGroups[i].length; j++)
				_vertices[vIndexMap[i] + j]._assign(oldVertices[i]);
		
		// Map the vertex indices to the new created vertices
		for(Triangle i : _triangles) {
			for(int j = 0; j < 3; j++) {
				final int vIndex = i._vIndices[j];
				i._vIndices[j] =
					vIndexMap[vIndex] +
					_getValuePos(smoothingGroups[vIndex], i._smoothingGroup);
			}
		}
		
		return false;
	}
	
	private static final int _getValuePos(
			final int[] array,
			final int   value) {
		
		for(int i = 0; i < array.length; i++) if(array[i] == value) return i;
		return -1;
	}
	
	private final MeshBuilder _invalidateMesh() {
		_lastValidMesh.invalidate();
		return this;
	}
	
	public final MeshBuilder activeCullFaceSupport() {
		cullFacing = true;
		return _invalidateMesh();
	}
	
	public final MeshBuilder addPolygon(
			final int     smoothingGroup,
			final int ... vIndices) {
		
		_assertTrianglesNotSealed();
		
		for(int i = 2; i < vIndices.length; i++)
			_dynTriangles.add(new Triangle().
				setIndices       (vIndices[0], vIndices[i - 1], vIndices[i]).
				setSmoothingGroup(smoothingGroup));
		
		return _invalidateMesh();
	}
	
	public final MeshBuilder addVertex(final Vertex vertex) {
		
		_assertVerticesNotSealed();
		
		_dynVertices.add(vertex);
		return _invalidateMesh();
	}

	public final MeshBuilder allocateTriangles(final int triangleCount) {
		
		_triangles = new Triangle[triangleCount];
		
		for(int i = 0; i < _triangles.length; i++)
			_triangles[i] = new Triangle();
		
		return _invalidateMesh();
	}
	
	public final MeshBuilder allocateVertices(final int vertexCount) {
		
		_vertices = new Vertex[vertexCount];
		
		for(int i = 0; i < _vertices.length; i++)
			_vertices[i] = new Vertex();
		
		return _invalidateMesh();
	}

	public final MeshBuilder collapseSmoothingGroups() {
		
		final Map<Integer, Integer> sgMap = new HashMap<>();
		int                         curSG = 0;
		
		// Fill the smoothing group mapping
		for(Triangle i : triangles)
			if(!sgMap.containsKey(i._smoothingGroup))
				sgMap.put(i._smoothingGroup, curSG++);
		
		// Apply the smoothing group mapping
		for(Triangle i : triangles)
			i._smoothingGroup = sgMap.get(i._smoothingGroup);
		
		return _invalidateMesh();
	}
	
	public final MeshBuilder computeNormals() {
		
		_assertVerticesSealed();
		
		Adjacency adjacency = new Adjacency();
		
		// If the vertex data has changed due to inconsistent smoothing groups,
		// a new adjacency is computed
		if(!_ensureConsistentSmoothingGroups(adjacency))
			adjacency = new Adjacency();
		
		final float[][] flatNormals    = new float[_triangles.length][3];
		final float[][] triangleAngles = new float[_triangles.length][3];
		final float[]   vertexAngles = new float[adjacency._maxAdjacencyCount];
		
		for(int i = 0; i < _triangles.length; i++)
			_triangles[i]._computeNormalAndAngles(
				flatNormals[i], triangleAngles[i]);
		
		for(int i = 0; i < _vertices.length; i++) {
			
			final Vertex vertex       = _vertices[i];
			final int[]  curAdjacency = adjacency._data[i];
			
			for(int j = 0; j < curAdjacency.length; j++)
				vertexAngles[j] = triangleAngles
					[curAdjacency[j]]
					[_getValuePos(_triangles[curAdjacency[j]]._vIndices, i)];
			
			vertex._computeSmoothNormal(
				flatNormals, curAdjacency, vertexAngles);
		}
		
		return _invalidateMesh();
	}

	public final MeshBuilder createDefaultTriangles() {
		
		allocateTriangles(_vertices.length / 3);
		
		for(int i = 0; i < _triangles.length; i++) {
			final int[] vIndices = _triangles[i]._vIndices;
			for(int j = 0; j < 3; j++) vIndices[j] = i * 3 + j;
		}
		
		return _invalidateMesh();
	}
	
	public final Mesh createMesh() {
		return _lastValidMesh.getObject();
	}
	
	public final MeshBuilder fillTriangleData(final Filler<Triangle> filler) {
		
		_assertTrianglesSealed();
		for(int i = 0; i < _triangles.length; i++)
			filler.fill(_triangles[i], i);
		
		return _invalidateMesh();
	}

	public final MeshBuilder fillTriangleDataIO(
			final FillerIO<Triangle> filler) throws IOException {
		
		_assertTrianglesSealed();
		for(int i = 0; i < _triangles.length; i++)
			filler.fill(_triangles[i], i);
		
		return _invalidateMesh();
	}
	
	public final MeshBuilder fillVertexData(final Filler<Vertex> filler) {
		
		_assertVerticesSealed();
		for(int i = 0; i < _vertices.length; i++) filler.fill(_vertices[i], i);
		
		return _invalidateMesh();
	}

	public final MeshBuilder fillVertexDataIO(
			final FillerIO<Vertex> filler) throws IOException {
		
		_assertVerticesSealed();
		for(int i = 0; i < _vertices.length; i++) filler.fill(_vertices[i], i);
		
		return _invalidateMesh();
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
		
		// Swap index order of each triangle
		for(Triangle i : triangles) {
			final int temp = i._vIndices[1];
			i._vIndices[1] = i._vIndices[2];
			i._vIndices[2] = temp;
		}
		
		return _invalidateMesh();
	}
	
	public final MeshBuilder invertNormals() {
		
		for(Vertex i : vertices)
			for(int j = 0; j < 3; j++) i._normal[j] *= -1;
		
		return _invalidateMesh();
	}

	public final MeshBuilder makeFlat() {
		
		int curSGroup = 0;
		for(Triangle i : triangles) i._smoothingGroup = curSGroup++;
		
		return _invalidateMesh();
	}
	
	public final MeshBuilder makeSmooth() {
		for(Triangle i : triangles) i._smoothingGroup = 0;
		return _invalidateMesh();
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

	public final MeshBuilder seal() {
		return sealVertices().sealTriangles();
	}
	
	public final MeshBuilder sealTriangles() {
		
		if(_triangles != null) return this;
    	
		if(_dynTriangles.isEmpty()) {
			createDefaultTriangles();
		} else {
			_triangles =
				_dynTriangles.toArray(new Triangle[_dynTriangles.size()]);
			_dynTriangles.clear();
		}
		
		return _invalidateMesh();
	}
	
	public final MeshBuilder sealVertices() {
		
		if(_vertices != null) return this;
		
    	_vertices = _dynVertices.toArray(new Vertex[_dynVertices.size()]);
    	_dynVertices.clear();
    	
    	return _invalidateMesh();
	}

	public final MeshBuilder setPolygon(
			final int     startIndex,
			final int     smoothingGroup,
			final int ... vIndices) {
		
		_assertTrianglesSealed();
		
		for(int i = 2; i < vIndices.length; i++)
			_triangles[startIndex + i - 2].
				setIndices       (vIndices[0], vIndices[i - 1], vIndices[i]).
				setSmoothingGroup(smoothingGroup);
		
		return _invalidateMesh();
	}
	
	public final MeshBuilder spliceUnusedVertices() {

		_assertVerticesSealed();
		
		// The index map assigns each vertex a mapped index
		final Vertex[] oldVertices    = _vertices;
		final int[]    indexMap       = new int[_vertices.length];
		int            curMappedIndex = 0;
		
		// Initialize the map with -1, saying that all vertices should be
		// spliced
		for(int i = 0; i < indexMap.length; i++) indexMap[i] = -1;
		
		// After having looped all indices, 'curMappedIndex' contains the number
		// of actual referenced vertices
		for(Triangle i : triangles)
			for(int j : i._vIndices)
				if(indexMap[j] == -1) indexMap[j] = curMappedIndex++;
		
		// Abort if all vertices are used
		if(curMappedIndex == _vertices.length) return this;
		
		allocateVertices(curMappedIndex);
		
		// Set the new indices based on the previous computed mapping
		for(Triangle i : triangles)
			for(int j = 0; j < 3; j++)
				i._vIndices[j] = indexMap[i._vIndices[j]];
		
		// Copy all vertices to their new positions if the index map entry is
		// not -1
		for(int i = 0; i < oldVertices.length; i++)
			if(indexMap[i] >= 0) _vertices[indexMap[i]]._assign(oldVertices[i]);
		
		return _invalidateMesh();
	}
	
	public final MeshBuilder transformPositions(final Matrix4D transform) {
		
		for(Vertex i : vertices) {
			transform.applyToPoint    (i._position);
			transform.applyToDirVector(i._normal);
    		transform.applyToDirVector(i._uTangent);
    		transform.applyToDirVector(i._vTangent);
		}

		return _invalidateMesh();
	}

	public final MeshBuilder transformTexCoords(final Matrix4D transform) {
		for(Vertex i : vertices) transform.applyToPoint(i._texCoord);
		return _invalidateMesh();
	}
}
