package ae.mesh;

import ae.math.Matrix4D;
import ae.mesh.Mesh.PrimitiveType;
import ae.util.CachedObject;
import ae.util.Functions;

public class MeshBuilder {
	
	private static final int[][] _QUAD_TO_TRI_MAP = {{0,1,2},{2,3,0}};
	
	private final CachedObject<Mesh> _lastValidMesh =
		new CachedObject<Mesh>(null, (object) -> _createCachedMesh());
	
	// Metainformationen
	private PrimitiveType _primitiveType    = PrimitiveType.TRIANGLE;
	private boolean       _primitiveTypeSet = false;
	private boolean       _autoNormals      = false;
	private float         _precision        = 0.00001f;
	
	// Geometriedaten
	private int[][]   _indices   = null;
	private float[][] _positions = null;
	private float[][] _normals   = null;
	private float[][] _texCoords = null;

	public boolean cullFacing = false;
	
	private final void _assertIndicesNotNull() {
		Functions.assertNotNull(_indices, "No indices specified");
	}
	
	private final void _assertPositionsNotNull() {
		Functions.assertNotNull(_positions, "No positions specified");
	}
	
	private final void _assertPrimitiveTypeSet() {
		if(!_primitiveTypeSet)
			throw new UnsupportedOperationException("Primitive type not set");
	}
	
	private final void _assertTexCoordsNotNull() {
		Functions.assertNotNull(_positions, "No tex-coords specified");
	}
	
	private final void _checkNewPositionArrayPossible(final int vertexCount) {
		
		if(_normals != null && _normals.length != vertexCount)
			throw new UnsupportedOperationException(
				"Normal array with different size already specified");
		
		if(_texCoords != null && _texCoords.length != vertexCount)
			throw new UnsupportedOperationException(
				"Tex-coord array with different size already specified");
	}
	
	private final boolean _compareFloats(
			final float f1,
			final float f2) {
		
		return Math.abs(f1 - f2) < _precision;
	}
	
	private final void _computeFlatNormals(final boolean normalize) {

		// Der Normalenvektor für alle Punkte des Dreiecks wird hier gespeichert
		final float[] normal = new float[3];

		// Create a new array for the normals if there isn't any yet
		createNormalArray();
		
		for(int i = 0; i < _positions.length; i += _primitiveType.size) {
			
			switch(_primitiveType) {
				case TRIANGLE:
					_computeTriangleNormal(i, i + 1, i + 2, normal, normalize);
					break;
				case QUAD:
					_computeQuadNormal(
						i, i + 1, i + 2, i + 3, normal, normalize);
					break;
			}
			
			for(int j = 0; j < _primitiveType.size; j++)
				System.arraycopy(normal, 0, _normals[i + j], 0, 3);
		}
	}
	
	private static final boolean[] computeMergedAttributesExistence(
			final MeshBuilder[] meshes,
			final boolean       conservative) {
		
		boolean hasIndices   = false;
		boolean hasNormals   = conservative;
		boolean hasTexCoords = conservative;
		
		// Check, which attributes are specified
		// In conservative mode, an attribute has to be specified in all meshes
		// to be part of the merged mesh.
		// In progessive mode, missing attributes are initialized with default
		// values.
		for(MeshBuilder i : meshes) {
			
			i._assertPositionsNotNull();
			
			// Indices are always treated in progressive manner
			if(i._indices != null) hasIndices = true;
			
			if(conservative) {
				if(i._normals   == null) hasNormals   = false;
    			if(i._texCoords == null) hasTexCoords = false;
			} else {
    			if(i._normals   != null) hasNormals   = true;
    			if(i._texCoords != null) hasTexCoords = true;
			}
		}
		
		return new boolean[]{hasIndices, hasNormals, hasTexCoords};
	}
	
	private static final int[] _computeMergedMeshArraySizes(
			final MeshBuilder[] meshes,
			final boolean       hasIndices) {
		
		int indexCount  = 0;
		int vertexCount = 0;
		
		for(int i = 0; i < meshes.length; i++) {
			indexCount  += hasIndices ?
				meshes[i]._indices.length : meshes[i]._positions.length;
			vertexCount += meshes[i]._positions.length;
		}
		
		return new int[]{indexCount, vertexCount};
	}
	
	private static PrimitiveType _computeMergedPrimitiveType(
			final MeshBuilder[] meshes) {
		
		for(MeshBuilder i : meshes)
			if(i._primitiveType == PrimitiveType.TRIANGLE)
				return PrimitiveType.TRIANGLE;
		
		return PrimitiveType.QUAD;
	}
	
	private static final void _computeNormal(
    		final float[] p0,
    		final float[] p1,
    		final float[] p2,
    		final float[] n,
    		final boolean normalize) {
		
		_computeNormal(
			p0[0], p0[1], p0[2], p1[0], p1[1], p1[2], p2[0], p2[1], p2[2],
			n, normalize);
	}
	
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
	
	private final void _computeQuadNormal(
    		final int     iP0,
    		final int     iP1,
    		final int     iP2,
    		final int     iP3,
    		final float[] n,
    		final boolean normalize) {
		
		final float[] p0 = _positions[iP0];
		final float[] p1 = _positions[iP1];
		final float[] p2 = _positions[iP2];
		final float[] p3 = _positions[iP3];
		
		boolean equP0P1      = true;
		boolean equP1P2      = true;
		boolean equP2P3      = true;
		boolean equP3P0      = true;
		boolean allDifferent = false;
		
		for(int i = 0; i < 3 && !allDifferent; i++) {
			
			if(equP0P1) equP0P1 = _compareFloats(p0[i], p1[i]);
			if(equP1P2) equP1P2 = _compareFloats(p1[i], p2[i]);
			if(equP2P3) equP2P3 = _compareFloats(p2[i], p3[i]);
			if(equP3P0) equP3P0 = _compareFloats(p3[i], p0[i]);
			
			if(!equP0P1 && !equP1P2 && !equP2P3 && !equP3P0)
				allDifferent = true;
		}
		
		if(allDifferent || equP0P1) {
			_computeNormal(p1, p2, p3, n, normalize);
		} else if(equP1P2) {
			_computeNormal(p0, p2, p3, n, normalize);
		} else if(equP2P3) {
			_computeNormal(p0, p1, p3, n, normalize);
		} else {
			_computeNormal(p0, p1, p2, n, normalize);
		}
	}
	/*
	private final void _computeSmoothNormals(final boolean normalize) {
		
		// Perform screening, to determine the edges for each vertex
		
	}
	*/
	private final void _computeTriangleNormal(
			final int     iP0,
			final int     iP1,
			final int     iP2,
			final float[] n,
			final boolean normalize) {
		
		_computeNormal(
			_positions[iP0][0], _positions[iP0][1], _positions[iP0][2],
			_positions[iP1][0], _positions[iP1][1], _positions[iP1][2],
			_positions[iP2][0], _positions[iP2][1], _positions[iP2][2],
			n, normalize);
	}
	
	private final void _copyVertex(
			final float[][] srcPositions,
			final float[][] srcNormals,
			final float[][] srcTexCoords,
			final int       srcPos,
			final int       dstPos) {
		
		System.arraycopy(srcPositions[srcPos], 0, _positions[dstPos], 0, 3);
		
		if(srcNormals != null)
			System.arraycopy(srcNormals[srcPos], 0, _normals[dstPos], 0, 3);
		
		if(srcTexCoords != null)
			System.arraycopy(srcTexCoords[srcPos], 0, _texCoords[dstPos], 0, 2);
	}
	
	private final Mesh _createCachedMesh() {
		
		_assertPositionsNotNull();
		
		return new Mesh(
			_indices != null ? _indices : _createDefaultIndices(),
			_positions, _normals, _texCoords,
			_autoNormals, cullFacing);
	}
	
	private final int[][] _createDefaultIndices() {

		_assertPositionsNotNull();
		
		if(!_primitiveTypeSet)
			throw new UnsupportedOperationException(
				"Primitive type not specified");
		
		final int[][] newIndices = new int
			[_positions.length / _primitiveType.size][_primitiveType.size];

		for(int i = 0; i < newIndices.length; i++)
			for(int j = 0; j < _primitiveType.size; j++)
				newIndices[i][j] = i * _primitiveType.size + j;

		return newIndices;
	}
	
	private static final void _mergeUnifiedMeshData(
			final MeshBuilder[] src,
			final MeshBuilder   dst,
			final boolean       hasIndices,
			final boolean       hasNormals,
			final boolean       hasTexCoords) {
		
		int indexPos  = 0;
		int vertexPos = 0;
		
		// Copy every mesh's data to the result mesh
		for(MeshBuilder i : src) {

			// Justify the indices while copying
			if(hasIndices) {
				
				for(int j = 0; j < i._indices.length; j++)
					for(int k = 0; k < i._primitiveType.size; k++)
						dst._indices[indexPos + j][k] =
							i._indices[j][k] + vertexPos;
				
				indexPos += i._indices.length;
			}
			
			// vertex data can be copyied without modification
			Functions.copyArray2D(
				i  ._positions, 0,
				dst._positions, vertexPos,
				3, i._positions.length);
			
			if(hasNormals)
				Functions.copyArray2D(
					i  ._normals, 0,
					dst._normals, vertexPos,
					3, i._normals.length);
			
			if(hasTexCoords)
				Functions.copyArray2D(
					i  ._texCoords, 0,
					dst._texCoords, vertexPos,
					2, i._texCoords.length);
			
			vertexPos += i._positions.length;
		}
	}
	
	private final void _renewVertexArrays(final int vertexCount) {
		
		final boolean hasNormals   = _normals   != null;
		final boolean hasTexCoords = _texCoords != null;
		
		_positions = _normals = _texCoords = null;
		
		createPositionArray(_indices.length * _primitiveType.size);
		
		if(hasNormals)   createNormalArray();
		if(hasTexCoords) createTexCoordArray();
	}
	
	private final <T> void _resetCompiled(
			final T oldValue,
			final T newValue) {

		if(oldValue != null || newValue != null) _lastValidMesh.invalidate();
	}
	
	private static final MeshBuilder[] _unifyMeshes(
			final MeshBuilder[] src,
			final MeshBuilder   dst,
			final boolean       hasIndices,
			final boolean       hasNormals,
			final boolean       hasTexCoords) {
		
		final MeshBuilder[] srcCopies = new MeshBuilder[src.length];
		
		for(int i = 0; i < src.length; i++) {

			srcCopies[i] = src[i].createFlatCopy();
			
			if(dst._primitiveType == PrimitiveType.TRIANGLE)
				srcCopies[i].splitQuads();
			
			if(hasIndices && srcCopies[i]._indices == null)
				srcCopies[i]._createDefaultIndices();
			
			if(hasNormals && srcCopies[i]._normals == null)
				srcCopies[i].createNormalArray();
			
			if(hasTexCoords && srcCopies[i]._texCoords == null)
				srcCopies[i].createTexCoordArray();
		}
		
		return srcCopies;
	}
	
	public final MeshBuilder computeNormals(
			final boolean flat,
			final boolean normalize) {

		_assertPositionsNotNull();
		
		if(_indices != null) unwrap();
		
		_computeFlatNormals(normalize);
		
		_autoNormals = true;

		return this;
	}
	
	public final MeshBuilder createFlatCopy() {

		MeshBuilder mesh = new MeshBuilder();

		mesh._primitiveType    = _primitiveType;
		mesh._primitiveTypeSet = _primitiveTypeSet;
		mesh._autoNormals      = _autoNormals;
		mesh._precision        = _precision;
		mesh._indices          = _indices;
		mesh._positions        = _positions;
		mesh._normals          = _normals;
		mesh._texCoords        = _texCoords;
		mesh.cullFacing        = cullFacing;

		return mesh;
	}

	public final Mesh createMesh() {
		return _lastValidMesh.getObject();
	}
	
	public final int[][] createIndexArray(
			final int                polygonCount,
			final Mesh.PrimitiveType type) {
		
		_indices = new int[polygonCount][type.size];
		
		setPrimitiveType(type);
		
		return _indices;
	}
	
	public final float[][] createNormalArray() {
		_assertPositionsNotNull();
		return _normals = new float[_positions.length][3];
	}
	
	public final float[][] createPositionArray(final int vertexCount) {
		_checkNewPositionArrayPossible(vertexCount);
		return _positions = new float[vertexCount][3];
	}
	
	public final float[][] createTexCoordArray() {
		_assertPositionsNotNull();
		return _texCoords = new float[_positions.length][2];
	}
	
	public final int[][] getIndices() {
		return _indices;
	}
	
	public final float[][] getNormals() {
		return _normals;
	}

	public final float[][] getPositions() {
		return _positions;
	}
	
	public final float[][] getTexCoords() {
		return _texCoords;
	}
	
	public static final MeshBuilder merge(
			final boolean         conservative,
			final MeshBuilder ... meshes) {
		
		// Check some preconditions to speed up the function in these cases
		if(meshes.length == 0) {
			return new MeshBuilder();
		} else if(meshes.length == 1) {
			return meshes[0].createFlatCopy();
		}
		
		final MeshBuilder mesh = new MeshBuilder();
		
		mesh.setPrimitiveType(_computeMergedPrimitiveType(meshes));
		
		final boolean[] attributes   =
			computeMergedAttributesExistence(meshes, conservative);
		final boolean   hasIndices   = attributes[0];
		final boolean   hasNormals   = attributes[1];
		final boolean   hasTexCoords = attributes[2];
		
		final MeshBuilder[] meshCopies =
			_unifyMeshes(meshes, mesh, hasIndices, hasNormals, hasTexCoords);
		
		final int[] arraySizes  =
			_computeMergedMeshArraySizes(meshCopies, hasIndices);
		final int   indexCount  = arraySizes[0];
		final int   vertexCount = arraySizes[1];

		// Create array for index data
		if(hasIndices)
			mesh._indices = new int[indexCount][mesh._primitiveType.size];
		
		// Create arrays for vertex data
		mesh.createPositionArray(vertexCount);
		if(hasNormals)   mesh.createNormalArray();
		if(hasTexCoords) mesh.createTexCoordArray();
		
		_mergeUnifiedMeshData(
			meshCopies, mesh, hasIndices, hasNormals, hasTexCoords);

		return mesh;
	}
	
	public final MeshBuilder setIndices(final int[][] indices) {
		
		_resetCompiled(_indices, indices);

		_indices = indices;
		
		if(indices != null)
			setPrimitiveType(
				PrimitiveType.fromPrimitiveSize(indices[0].length));
		
		return this;
	}
	
	public final MeshBuilder setNormalArray(final float[][] normals) {
		
		if(normals != null && normals[0].length != 3)
			throw new UnsupportedOperationException(
				"A normal vector must consist of 3 components");
		
		_assertPositionsNotNull();
		
		if(normals != null && normals.length != _positions.length)
			throw new UnsupportedOperationException(
				"Normal and position array must have the same length");
		
		_resetCompiled(_normals, normals);

		_normals     = normals;
		_autoNormals = false;
		
		return this;
	}
	
	public final MeshBuilder setPositionArray(final float[][] positions) {
		
		if(positions != null && positions[0].length != 3)
			throw new UnsupportedOperationException(
				"A position must consist of 3 components");
		
		if(positions != null) _checkNewPositionArrayPossible(positions.length);
		
		_resetCompiled(_positions, positions);

		_positions = positions;
		
		return this;
	}
	
	public final MeshBuilder setPrimitiveType(
			final PrimitiveType primitiveType) {
		
		_primitiveType    = primitiveType;
		_primitiveTypeSet = true;
		
		return this;
	}
	
	public final MeshBuilder setTexCoordArray(final float[][] texCoords) {
		
		if(texCoords != null && texCoords[0].length != 2)
			throw new UnsupportedOperationException(
				"A tex-coord must consist of 2 components");
		
		_assertPositionsNotNull();
		
		if(texCoords != null && texCoords.length != _positions.length)
			throw new UnsupportedOperationException(
				"Tex-coord and position array must have the same length");
		
		_resetCompiled(_texCoords, texCoords);

		_texCoords = texCoords;
		
		return this;
	}
	
	public final MeshBuilder spliceUnusedVertices() {
		
		if(_indices == null) return this;
		
		_assertPositionsNotNull();
		
		// The index map assigns each vertex a mapped index
		final int[] indexMap       = new int[_positions.length];
		int         curMappedIndex = 0;
		
		// Initialize the map with -1, saying that all vertices should be
		// spliced
		for(int i = 0; i < indexMap.length; i++) indexMap[i] = -1;
		
		// After having looped all indices, 'curMappedIndex' contains the number
		// of actual referenced vertices
		for(int[] i : _indices)
			for(int j : i)
				if(indexMap[j] == -1) indexMap[j] = curMappedIndex++;

		// Store the old vertex data
		final float[][] oldPositions = _positions;
		final float[][] oldNormals   = _normals;
		final float[][] oldTexCoords = _texCoords;
		
		_renewVertexArrays(_indices.length * _primitiveType.size);
		
		// Set the new indices based on the previous computed mapping
		for(int i = 0; i < _indices.length; i++)
			for(int j = 0; j < _primitiveType.size; j++)
				_indices[i][j] = indexMap[_indices[i][j]];
		
		// Copy all vertices to their new positions
		for(int i = 0; i < oldPositions.length; i++) {
			
			final int newIndex = indexMap[i];
			
			// Skip vertices that should be spliced
			if(newIndex == -1) continue;
			
			System.arraycopy(oldPositions[i], 0, _positions[newIndex], 0, 3);
			
			if(_normals != null)
				System.arraycopy(oldNormals[i], 0, _normals[newIndex], 0, 3);
			
			if(_texCoords != null)
				System.arraycopy(
					oldTexCoords[i], 0, _texCoords[newIndex], 0, 2);
		}
		
		return this;
	}
	
	public final MeshBuilder splitQuads() {
		
		_assertPrimitiveTypeSet();
		
		if(_primitiveType == PrimitiveType.TRIANGLE) return this;
		
		if(_indices != null) {
			
			final int[][] oldIndices = _indices;
			
			_indices = new int[oldIndices.length * 2][3];
			
			for(int i = 0; i < oldIndices.length; i++) // All quads
				for(int j = 0; j < 2; j++) // The 2 new triangles
					for(int k = 0; k < 3; k++) // the 3 vertices of each
						_indices[i * 2 + j][k] =
							oldIndices[i][_QUAD_TO_TRI_MAP[j][k]];
			
		} else {
			
			_assertPositionsNotNull();
			
			final float[][] oldPositions = _positions;
			final float[][] oldNormals   = _normals;
			final float[][] oldTexCoords = _texCoords;
			final int       quadCount    = _positions.length / 4;
			
			_renewVertexArrays(_positions.length * 2);
			
			for(int i = 0; i < quadCount; i++) // All quads
				for(int j = 0; j < 2; j++) // The 2 new triangles
					for(int k = 0; k < 3; k++) // the 3 vertices of each
						_copyVertex(
							oldPositions, oldNormals, oldTexCoords,
							i * 4 + _QUAD_TO_TRI_MAP[j][k], i * 6 + j * 3 + k);
		}
		
		return this;
	}
	
	public final MeshBuilder transformPositions(final Matrix4D transform) {
		
		_assertPositionsNotNull();
		
		for(int i = 0; i < _positions.length; i++)
			transform.applyToPoint(_positions[i]);

		if(_normals != null)
			for(int i = 0; i < _normals.length; i++)
				transform.applyToDirVector(_normals[i]);

		return this;
	}

	public final MeshBuilder transformTexCoords(Matrix4D transform) {
		
		_assertTexCoordsNotNull();

		for(int i = 0; i < _texCoords.length; i++)
			transform.applyToPoint(_texCoords[i]);

		return this;
	}

	public final MeshBuilder unwrap() {
		
		_assertIndicesNotNull();
		_assertPositionsNotNull();
		
		final float[][] oldPositions = _positions;
		final float[][] oldNormals   = _normals;
		final float[][] oldTexCoords = _texCoords;
		
		_renewVertexArrays(_indices.length * _primitiveType.size);
		
		for(int i = 0; i < _indices.length; i++) {
			for(int j = 0; j < _primitiveType.size; j++) {
				
				final int vPosOld = _indices[i][j];
				final int vPosNew = i * _primitiveType.size + j;
				
				System.arraycopy(
					oldPositions[vPosOld], 0, _positions[vPosNew], 0, 3);
				
				if(oldNormals != null)
					System.arraycopy(
						oldNormals[vPosOld], 0, _normals[vPosNew], 0, 3);
				
				if(oldTexCoords != null)
					System.arraycopy(
						oldTexCoords[vPosOld], 0, _texCoords[vPosNew], 0, 2);
			}
		}

		setIndices(null);
		
		return this;
	}
}
