package ae.mesh;

import ae.math.Matrix4D;
import ae.mesh.Mesh.PrimitiveType;
import ae.util.CachedObject;

public class MeshBuilder {
	
	private final CachedObject<Mesh> _lastValidMesh =
		new CachedObject<Mesh>(null, (object) -> createCachedMesh());
	
	// Metainformationen
	private Mesh.PrimitiveType _primitiveType    = PrimitiveType.TRIANGLE;
	private boolean            _primitiveTypeSet = false;
	private boolean            _autoNormals      = false;
	private boolean            _cullFacing       = false;
	private float              _precision        = 0.00001f;
	
	// Geometriedaten
	private int[][]   _indices   = null;
	private float[][] _positions = null;
	private float[][] _normals   = null;
	private float[][] _texCoords = null;
	
	private final void checkNewPositionArrayPossible(
			final int vertexCount) {
		
		if(_normals != null && _normals.length != vertexCount)
			throw new UnsupportedOperationException(
				"Normal array with different size already specified");
		
		if(_texCoords != null && _texCoords.length != vertexCount)
			throw new UnsupportedOperationException(
				"Tex-coord array with different size already specified");
	}
	
	private final void checkPositionArrayExists() {
		
		if(_positions == null)
			throw new UnsupportedOperationException("No positions specified");
	}
	
	private final void checkTexCoordArrayExists() {
		
		if(_texCoords == null)
			throw new UnsupportedOperationException("No tex-coords specified");
	}
	
	private final boolean compareFloats(
			final float f1,
			final float f2) {
		
		return Math.abs(f1 - f2) < _precision;
	}
	
	private final void computeFlatNormals(
			final boolean normalize) {

		// Der Normalenvektor für alle Punkte des Dreiecks wird hier gespeichert
		final float[] normal = new float[3];

		// Create a new array for the normals if there isn't any yet
		createNormalArray();
		
		for(int i = 0; i < _positions.length; i += _primitiveType.size) {
			
			switch(_primitiveType) {
				case TRIANGLE:
					computeTriangleNormal(i, i + 1, i + 2, normal, normalize);
					break;
				case QUAD:
					computeQuadNormal(
						i, i + 1, i + 2, i + 3, normal, normalize);
					break;
			}
			
			//computeNormal(_positions, i, normal, false);
			
			for(int j = 0; j < _primitiveType.size; j++)
				System.arraycopy(normal, 0, _normals[i + j], 0, 3);
		}
	}
	
	private static final void computeNormal(
    		final float[] p0,
    		final float[] p1,
    		final float[] p2,
    		final float[] n,
    		final boolean normalize) {
		
		computeNormal(
			p0[0], p0[1], p0[2], p1[0], p1[1], p1[2], p2[0], p2[1], p2[2],
			n, normalize);
	}
	
	private static final void computeNormal(
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
/*
	private void ComputeSmoothNormals(
			bool normalize) {
		
		float[,] areaNormals = new float[_indexCount / 3, 3];
		int      triangle;

		for(int i = 0; i < _indexCount; i += 3) {

			triangle = i / 3;

			ComputeNormal(
				positions, indices[i], indices[i + 1], indices[i + 2],
				out areaNormals[triangle, 0], out areaNormals[triangle, 1], out areaNormals[triangle, 2],
				true);
		}
	}
*/
	
	private final void computeQuadNormal(
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
		
		boolean equP0P1 = true;
		boolean equP1P2 = true;
		boolean equP2P3 = true;
		boolean equP3P0 = true;
		boolean allDifferent = false;
		
		for(int i = 0; i < 3 && !allDifferent; i++) {
			
			if(equP0P1) equP0P1 = compareFloats(p0[i], p1[i]);
			if(equP1P2) equP1P2 = compareFloats(p1[i], p2[i]);
			if(equP2P3) equP2P3 = compareFloats(p2[i], p3[i]);
			if(equP3P0) equP3P0 = compareFloats(p3[i], p0[i]);
			
			if(!equP0P1 && !equP1P2 && !equP2P3 && !equP3P0)
				allDifferent = true;
		}
		
		if(allDifferent || equP0P1) {
			computeNormal(p1, p2, p3, n, normalize);
		} else if(equP1P2) {
			computeNormal(p0, p2, p3, n, normalize);
		} else if(equP2P3) {
			computeNormal(p0, p1, p3, n, normalize);
		} else {
			computeNormal(p0, p1, p2, n, normalize);
		}
	}
	
	private final void computeTriangleNormal(
			final int     iP0,
			final int     iP1,
			final int     iP2,
			final float[] n,
			final boolean normalize) {
		
		computeNormal(
			_positions[iP0][0], _positions[iP0][1], _positions[iP0][2],
			_positions[iP1][0], _positions[iP1][1], _positions[iP1][2],
			_positions[iP2][0], _positions[iP2][1], _positions[iP2][2],
			n, normalize);
	}
	
	private final Mesh createCachedMesh() {
		
		checkPositionArrayExists();
		
		return new Mesh(
			_indices != null ? _indices : createDefaultIndices(),
			_positions, _normals, _texCoords,
			_autoNormals, _cullFacing);
	}
	
	private final int[][] createDefaultIndices() {

		checkPositionArrayExists();
		
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
	
	private final <T> void resetCompiled(
			final T oldValue,
			final T newValue) {

		if(oldValue != null || newValue != null) _lastValidMesh.invalidate();
	}
	
	public final MeshBuilder computeNormals(
			final boolean flat,
			final boolean normalize) {

		checkPositionArrayExists();
		
		if(_indices != null) unwrap();
		
		computeFlatNormals(normalize);
		
		_autoNormals = true;

		return this;
	}
	
	public final MeshBuilder createFlatCopy() {

		MeshBuilder mesh = new MeshBuilder();

		mesh._indices     = _indices;
		mesh._positions   = _positions;
		mesh._normals     = _normals;
		mesh._texCoords   = _texCoords;
		mesh._autoNormals = _autoNormals;
		mesh._cullFacing  = _cullFacing;

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
		
		checkPositionArrayExists();
		
		_normals = new float[_positions.length][3];
		
		return _normals;
	}
	
	public final float[][] createPositionArray(
			final int vertexCount) {
		
		checkNewPositionArrayPossible(vertexCount);
		
		_positions = new float[vertexCount][3];
		
		return _positions;
	}
	
	public final float[][] createTexCoordArray() {
		
		checkPositionArrayExists();
		
		_texCoords = new float[_positions.length][2];
		
		return _texCoords;
	}
	
	public final void enableCullFacingSupport(
			final boolean enable) {
		
		_cullFacing = enable;
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
	
	/*
	public static final MeshBuilder merge(
			final MeshBuilder ... meshes) {
		
		// Check some preconditions to speed up the funktion in these cases
		if(meshes.Length == 0) {
			return new MeshData();
		} else if(meshes.Length == 1) {
			return meshes[0].CreateFlatCopy();
		}
		
		MeshBuilder   mesh         = new MeshBuilder();
		MeshBuilder[] meshCopies   = new MeshBuilder[meshes.length];
		boolean    hasIndices   = false;
		boolean    hasNormals   = false;
		boolean    hasTexCoords = false;
		int        indexCount   = 0;
		int        vertexCount  = 0;
		int        indexPos     = 0;
		int        vertexPos    = 0;
		
		// Check, which attributes are specified
		for(MeshBuilder i : meshes) {
			
			i.checkPositions();
			
			if(i._indices   != null) hasIndices   = true;
			if(i._normals   != null) hasNormals   = true;
			if(i._texCoords != null) hasTexCoords = true;
		}

		// Unify all meshes
		for(int i = 0; i < meshes.length; i++) {

			meshCopies[i] = meshes[i].createFlatCopy();

			if(hasIndices && meshCopies[i]._indices == null)
				meshCopies[i].createDefaultIndices();

			// TODO: Verbessern
			if(hasNormals && meshCopies[i]._normals == null)
				meshCopies[i]._normals = new float[meshCopies[i]._vertexCount][3];

			if(hasTexCoords && meshCopies[i]._texCoords == null)
				meshCopies[i]._texCoords = new float[meshCopies[i]._vertexCount][2];

			indexCount  += meshCopies[i]._indexCount;
			vertexCount += meshCopies[i]._vertexCount;
		}
		
		// Create array for index data
		if(hasIndices) mesh._indices = new int[indexCount];
		
		// Create arrays for vertex data
		mesh._positions = new float[vertexCount][3];
		if(hasNormals)   mesh._normals   = new float[vertexCount][3];
		if(hasTexCoords) mesh._texCoords = new float[vertexCount][2];

		// Copy every mesh's data to the result mesh
		for(MeshBuilder i : meshCopies) {

			// Justify the indices while copying
			if(hasIndices)
				for(int j = 0; j < i._indexCount; j++)
					mesh._indices[indexPos + j] = i._indices[j] + vertexPos;

			// vertex data can be copyied without modification
			Functions.copyArray2D(
				i._positions, 0, mesh._positions, vertexPos, 3, i._vertexCount);
			if(hasNormals)
				Functions.copyArray2D(
					i._normals, 0, mesh._normals, vertexPos, 3, i._vertexCount);
			if(hasTexCoords)
				Functions.copyArray2D(
					i._texCoords, 0, mesh._texCoords, vertexPos,
					2, i._vertexCount);

			indexPos  += i._indexCount;
			vertexPos += i._vertexCount;
		}

		return mesh;
	}
	*/

	public final MeshBuilder setIndices(
			final int[][] indices) {
		
		resetCompiled(_indices, indices);

		_indices = indices;
		
		if(indices != null)
			setPrimitiveType(
				PrimitiveType.fromPrimitiveSize(indices[0].length));
		
		return this;
	}
	
	public final MeshBuilder setNormalArray(
			final float[][] normals) {
		
		if(normals != null && normals[0].length != 3)
			throw new UnsupportedOperationException(
				"A normal vector must consist of 3 components");
		
		checkPositionArrayExists();
		
		if(normals != null && normals.length != _positions.length)
			throw new UnsupportedOperationException(
				"Normal and position array must have the same length");
		
		resetCompiled(_normals, normals);

		_normals     = normals;
		_autoNormals = false;
		
		return this;
	}
	
	public final MeshBuilder setPositionArray(
			final float[][] positions) {
		
		if(positions != null && positions[0].length != 3)
			throw new UnsupportedOperationException(
				"A position must consist of 3 components");
		
		if(positions != null) checkNewPositionArrayPossible(positions.length);
		
		resetCompiled(_positions, positions);

		_positions = positions;
		
		return this;
	}
	
	public final MeshBuilder setPrimitiveType(
			final PrimitiveType primitiveType) {
		
		_primitiveType    = primitiveType;
		_primitiveTypeSet = true;
		
		return this;
	}
	
	public final MeshBuilder setTexCoordArray(
			final float[][] texCoords) {
		
		if(texCoords != null && texCoords[0].length != 2)
			throw new UnsupportedOperationException(
				"A tex-coord must consist of 2 components");
		
		checkPositionArrayExists();
		
		if(texCoords != null && texCoords.length != _positions.length)
			throw new UnsupportedOperationException(
				"Tex-coord and position array must have the same length");
		
		resetCompiled(_texCoords, texCoords);

		_texCoords = texCoords;
		
		return this;
	}
	
	public final MeshBuilder spliceUnusedVertices() {
		/*
		IDictionary<uint, uint> mapping = new Dictionary<uint, uint>();
		uint                    mapPos = 0;

		for(int i : new HashSet<uint>(indices))
			mapping.Add(i, mapPos++);

		// TODO
		*/
		return this;
	}

	public final boolean supportsCullFacing() {
		
		return _cullFacing;
	}
	
	public final MeshBuilder transformPositions(
			final Matrix4D transform) {
		
		checkPositionArrayExists();
		
		for(int i = 0; i < _positions.length; i++)
			transform.applyToPoint(_positions[i]);

		if(_normals != null)
			for(int i = 0; i < _normals.length; i++)
				transform.applyToDirVector(_normals[i]);

		return this;
	}

	public final MeshBuilder transformTexCoords(
			Matrix4D transform) {
		
		checkTexCoordArrayExists();

		for(int i = 0; i < _texCoords.length; i++)
			transform.applyToPoint(_texCoords[i]);

		return this;
	}

	public final MeshBuilder unwrap() {

		checkPositionArrayExists();
		
		if(_indices == null)
			throw new UnsupportedOperationException("No indices specified");
		
		final float[][] oldPositions = _positions;
		final float[][] oldNormals   = _normals;
		final float[][] oldTexCoords = _texCoords;

		int vPosOld, vPosNew;
		
		_positions = _normals = _texCoords = null;
		
		createPositionArray(_indices.length * _primitiveType.size);
		
		if(oldNormals   != null) createNormalArray();
		if(oldTexCoords != null) createTexCoordArray();
		
		for(int i = 0; i < _indices.length; i++) {
			for(int j = 0; j < _primitiveType.size; j++) {
				
				vPosOld = _indices[i][j];
				vPosNew = i * _primitiveType.size + j;
				
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
