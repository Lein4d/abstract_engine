package ae.mesh;

import java.util.function.Consumer;

import ae.math.Matrix4D;

public final class Meshes {
	
	private static final float[][] _QUAD_POSITIONS = {
		{0,0,0},{1,0,0},{1,0,1},{0,0,1},
		{0,0,0},{0,0,1},{1,0,1},{1,0,0}};
	
	private static final float[][] _QUAD_NORMALS = {
		{ 0,-1, 0},{ 0,-1, 0},{ 0,-1, 0},{ 0,-1, 0},
		{ 0, 1, 0},{ 0, 1, 0},{ 0, 1, 0},{ 0, 1, 0}};

	private static final float[][] _QUAD_UTANGENTS = {
		{ 1, 0, 0},{ 1, 0, 0},{ 1, 0, 0},{ 1, 0, 0},
		{ 1, 0, 0},{ 1, 0, 0},{ 1, 0, 0},{ 1, 0, 0}};

	private static final float[][] _QUAD_VTANGENTS = {
		{ 0, 0, 1},{ 0, 0, 1},{ 0, 0, 1},{ 0, 0, 1},
		{ 0, 0, 1},{ 0, 0, 1},{ 0, 0, 1},{ 0, 0, 1}};
	
	private static final float[][] _QUAD_TEXCOORDS = {
		{0,0},{1,0},{1,1},{0,1},
		{0,0},{0,1},{1,1},{1,0}};
	
	private static final float[][] _CUBE_POSITIONS = {
		{0,0,0},{0,1,0},{1,1,0},{1,0,0},  // front
		{1,0,0},{1,1,0},{1,1,1},{1,0,1},  // right
		{1,0,1},{1,1,1},{0,1,1},{0,0,1},  // back
		{0,0,1},{0,1,1},{0,1,0},{0,0,0},  // left
		{0,0,0},{1,0,0},{1,0,1},{0,0,1},  // bottom
		{0,1,0},{0,1,1},{1,1,1},{1,1,0}}; // top

	private static final float[][] _CUBE_NORMALS = {
		{ 0, 0,-1},{ 0, 0,-1},{ 0, 0,-1},{ 0, 0,-1},  // front
		{ 1, 0, 0},{ 1, 0, 0},{ 1, 0, 0},{ 1, 0, 0},  // right
		{ 0, 0, 1},{ 0, 0, 1},{ 0, 0, 1},{ 0, 0, 1},  // back
		{-1, 0, 0},{-1, 0, 0},{-1, 0, 0},{-1, 0, 0},  // left
		{ 0,-1, 0},{ 0,-1, 0},{ 0,-1, 0},{ 0,-1, 0},  // bottom
		{ 0, 1, 0},{ 0, 1, 0},{ 0, 1, 0},{ 0, 1, 0}}; // top

	private static final float[][] _CUBE_UTANGENTS = {
		{ 1, 0, 0},{ 1, 0, 0},{ 1, 0, 0},{ 1, 0, 0},  // front
		{ 0, 0, 1},{ 0, 0, 1},{ 0, 0, 1},{ 0, 0, 1},  // right
		{-1, 0, 0},{-1, 0, 0},{-1, 0, 0},{-1, 0, 0},  // back
		{ 0, 0,-1},{ 0, 0,-1},{ 0, 0,-1},{ 0, 0,-1},  // left
		{ 1, 0, 0},{ 1, 0, 0},{ 1, 0, 0},{ 1, 0, 0},  // bottom
		{ 1, 0, 0},{ 1, 0, 0},{ 1, 0, 0},{ 1, 0, 0}}; // top

	private static final float[][] _CUBE_VTANGENTS = {
		{ 0, 1, 0},{ 0, 1, 0},{ 0, 1, 0},{ 0, 1, 0},  // front
		{ 0, 1, 0},{ 0, 1, 0},{ 0, 1, 0},{ 0, 1, 0},  // right
		{ 0, 1, 0},{ 0, 1, 0},{ 0, 1, 0},{ 0, 1, 0},  // back
		{ 0, 1, 0},{ 0, 1, 0},{ 0, 1, 0},{ 0, 1, 0},  // left
		{ 0, 0, 1},{ 0, 0, 1},{ 0, 0, 1},{ 0, 0, 1},  // bottom
		{ 0, 0, 1},{ 0, 0, 1},{ 0, 0, 1},{ 0, 0, 1}}; // top
	
	private static final float[][] _CUBE_TEXCOORDS = {
		{0,0},{0,1},{1,1},{1,0},  // front
		{0,0},{0,1},{1,1},{1,0},  // right
		{0,0},{0,1},{1,1},{1,0},  // back
		{0,0},{0,1},{1,1},{1,0},  // left
		{0,0},{1,0},{1,1},{0,1},  // bottom
		{0,0},{0,1},{1,1},{1,0}}; // top

	private Meshes() {}
	
	private static final void _computeCylinderShellData(
			final int         subdivisions,
			final int         vOffset,
			final MeshBuilder mb) {
		
		final int ringSize = subdivisions + 1;
		
		for(int i = 0; i < subdivisions; i++) {
			final int vPos = vOffset + i;
			mb.addPolygon(
				0,
    			vPos,
    			vPos            + 1,
    			vPos + ringSize + 1,
    			vPos + ringSize);
		}
		
		_computeDiscVertices(subdivisions, 0, vOffset,            false, mb);
		_computeDiscVertices(subdivisions, 1, vOffset + ringSize, false, mb);
		
		for(int i = 0; i < ringSize; i++) {
			mb.getVertex(vOffset            + i).
				setTexCoord(i / (float)subdivisions, 0);
			mb.getVertex(vOffset + ringSize + i).
				setTexCoord(i / (float)subdivisions, 1);
		}
	}
	
	private static final void _computeDiscData(
    		final int         subdivisions,
    		final float       posY1,
    		final float       posY2,
    		final int         vOffset,
    		final MeshBuilder mb) {
		
		// Indices of down-facing cap
		_computeDiscIndices(
			subdivisions, vOffset,                true, false, mb);
		// Indices of up-facing cap
		_computeDiscIndices(
			subdivisions, vOffset + subdivisions, true, true,  mb);
		
		// Vertices of down-facing cap
		_computeDiscVertices(
			subdivisions, posY1, vOffset,                true, mb);
		// Vertices of up-facing cap
		_computeDiscVertices(
			subdivisions, posY2, vOffset + subdivisions, true, mb);
		
		// Fill TBN data
		for(int i = 0; i < subdivisions; i++) {
			mb.getVertex(vOffset                + i).
				setNormal(0, -1, 0).setUTangent(1, 0, 0).setVTangent(0, 0, 1);
			mb.getVertex(vOffset + subdivisions + i).
				setNormal(0,  1, 0).setUTangent(1, 0, 0).setVTangent(0, 0, 1);
		}
	}
	
	private static final void _computeDiscIndices(
			final int         subdivisions,
			final int         vOffset,
			final boolean     wrapIndices,
			final boolean     invert,
			final MeshBuilder mb) {

		final int   ringSize = subdivisions + (wrapIndices ? 0 : 1);
		final int[] indices  = new int[subdivisions + 1];
		
		for(int i = 0; i < indices.length; i++)
			indices[i] = vOffset + (invert ? subdivisions - i : i) % ringSize;
		
		mb.addPolygon(0, indices);
	}
	
	private static final void _computeDiscVertices(
			final int         subdivisions,
			final float       posY,
			final int         vOffset,
			final boolean     wrapIndices,
			final MeshBuilder mb) {
		
		final int ringSize = subdivisions + (wrapIndices ? 0 : 1);
		
		for(int i = 0; i < ringSize; i++) {
			
			final double angle = 2.0 * Math.PI * (double)i / subdivisions;
			final float  x     = (float)Math.sin(angle);
			final float  z     = (float)Math.cos(angle);
			
			mb.getVertex(vOffset + i).
    			setPosition(x, posY, z).
    			setNormal  (x, 0,    z).
    			setUTangent((float)Math.cos(angle), 0, -(float)Math.sin(angle)).
    			setVTangent(0, 1, 0).
    			setTexCoord((x + 1) / 2, (z + 1) / 2);
		}
	}

	private static final void _computeTorusIndices(
    		final int         subdivisionsHor,
    		final int         subdivisionsVer,
    		final MeshBuilder mb) {
		
		final int ringSizeHor = subdivisionsHor + 1;
		
		for(int i = 0; i < subdivisionsVer; i++)
			for(int j = 0; j < subdivisionsHor; j++)
				mb.addPolygon(
					0,
    				 i      * ringSizeHor +  j,
    				(i + 1) * ringSizeHor +  j,
    				(i + 1) * ringSizeHor + (j + 1),
    				 i      * ringSizeHor + (j + 1));
	}

	private static final void _computeTorusVertices(
    		final int         subdivisionsHor,
    		final int         subdivisionsVer,
    		final float       radius,
    		final MeshBuilder mb) {
		
		final int ringSizeHor = subdivisionsHor + 1;
		final int ringSizeVer = subdivisionsVer + 1;
		
		for(int i = 0; i < ringSizeVer; i++) {
			for(int j = 0; j < ringSizeHor; j++) {
				
				final double angleHor = 2.0 * Math.PI * j / subdivisionsHor;
				final double angleVer = 2.0 * Math.PI * i / subdivisionsVer;
				
				// The normals are computed similar to the positions, except
				// that the radius is assumed as 0 and thus removed from the
				// formula
				
				mb.getVertex(i * ringSizeHor + j).
    				setPosition(
    					(float)(Math.sin(angleHor) * (radius - Math.cos(angleVer))),
    					(float) Math.sin(angleVer),
    					(float)(Math.cos(angleHor) * (radius - Math.cos(angleVer)))).
    				setNormal(
    					(float)(Math.sin(angleHor) * -Math.cos(angleVer)),
    					(float) Math.sin(angleVer),
    					(float)(Math.cos(angleHor) * -Math.cos(angleVer))).
    				setUTangent(
        				(float) Math.cos(angleHor),
        				0,
        				(float)-Math.sin(angleHor)).
    				setVTangent(
    					(float)(Math.sin(angleHor) * Math.sin(angleVer)),
        				(float) Math.cos(angleVer),
            			(float)(Math.cos(angleHor) * Math.sin(angleVer))).
        			setTexCoord(
        				(float)j / subdivisionsHor,
        				(float)i / subdivisionsVer);
			}
		}
	}
	
	private static final void _computeUVSphereIndices(
			final int         subdivisionsHor,
			final int         subdivisionsVer,
			final MeshBuilder mb) {
		
		for(int i = 0; i < subdivisionsVer; i++)
    		for(int j = 0; j < subdivisionsHor; j++)
    			mb.addPolygon(
    				0,
        			 i      * (subdivisionsHor + 1) +  j,
        			 i      * (subdivisionsHor + 1) + (j + 1),
        			(i + 1) * (subdivisionsHor + 1) + (j + 1),
        			(i + 1) * (subdivisionsHor + 1) +  j);
	}
	
	private static final void _computeUVSphereVertices(
    		final int         subdivisionsHor,
    		final int         subdivisionsVer,
    		final MeshBuilder mb) {
		
		for(int i = 0; i <= subdivisionsVer; i++) {
    		for(int j = 0; j <= subdivisionsHor; j++) {
    			
    			final double angleHor =
    				2.0 * Math.PI *  (double)j / subdivisionsHor;
    			final double angleVer =
    				      Math.PI * ((double)i / subdivisionsVer - 0.5);
    
    			final float x =
    				(float)(Math.cos(angleVer) * Math.sin(angleHor));
    			final float y =
    				(float) Math.sin(angleVer);
    			final float z =
    				(float)(Math.cos(angleVer) * Math.cos(angleHor));
    
    			mb.getVertex(i * (subdivisionsHor + 1) + j).
        			setPosition(x, y, z).
    				setNormal  (x, y, z).
    				setUTangent(
    					 (float)Math.cos(angleHor),
    					0,
    					-(float)Math.sin(angleHor)).
    				setVTangent(
    					(float)(Math.sin(angleVer) * -Math.sin(angleHor)),
    					(float) Math.cos(angleVer),
    					(float)(Math.sin(angleVer) * -Math.cos(angleHor))).
        			setTexCoord(
        				2 * (float)j / subdivisionsHor,
        				    (float)i / subdivisionsVer);
    		}
    	}
	}
	
	private static final MeshBuilder _createRoundMesh(
			final int                   vertexCount,
			final boolean               flat,
			final Consumer<MeshBuilder> initializer) {
		
		final MeshBuilder mb = new MeshBuilder().
			allocateVertices(vertexCount);
		
		initializer.accept(mb);
		
		if(flat) mb.makeFlat().computeNormals();
		mb.cullFacing = true;
    	
    	return mb.seal();
	}
	
	public static final MeshBuilder createCube() {
		
		return new MeshBuilder().
			allocateVertices     (_CUBE_POSITIONS.length).
			allocateTriangles    (12).
			activeCullFaceSupport().
			fillVertexData       ((vertex, index) -> vertex.
    			setPosition(_CUBE_POSITIONS[index]).
    			setNormal  (_CUBE_NORMALS  [index]).
    			setUTangent(_CUBE_UTANGENTS[index]).
    			setVTangent(_CUBE_VTANGENTS[index]).
    			setTexCoord(_CUBE_TEXCOORDS[index])).
			createDefaultQuads();
	}

	public static final MeshBuilder createCube(
			final float   size,
			final boolean centered) {
		
		return createCube(size, size, size, centered);
	}
	
	public static final MeshBuilder createCube(
			final float   width,
			final float   height,
			final float   length,
			final boolean centered) {
		
		final float t = centered ? -0.5f : 0;
		
		return
			createCube().
			transformPositions(
				new Matrix4D().scale(width, height, length).translate(t, t, t));
	}
	
	public static final MeshBuilder createCylinder(
    		final int     subdivisions,
    		final boolean flat) {
		
		return _createRoundMesh(
			2 * subdivisions + 2 * (subdivisions + 1), flat, (mb) -> {
				_computeDiscData         (subdivisions, 0, 1, 0,          mb);
				_computeCylinderShellData(subdivisions, 2 * subdivisions, mb);
			});
	}

	public static final MeshBuilder createCylinder(
    		final int     subdivisions,
    		final float   radius,
    		final float   height,
    		final boolean flat) {
		
		return createCylinder(subdivisions, radius, radius, height, flat);
	}
	
	public static final MeshBuilder createCylinder(
    		final int     subdivisions,
    		final float   rx,
    		final float   rz,
    		final float   height,
    		final boolean flat) {
		
		return
			createCylinder(subdivisions, flat).
			transformPositions(new Matrix4D().scale(rx, height, rz));
	}
	
	public static final MeshBuilder createCylinderShell(
    		final int     subdivisions,
    		final boolean flat) {
		
		return _createRoundMesh(
			2 * (subdivisions + 1), flat,
			(mb) -> _computeCylinderShellData(subdivisions, 0, mb));
	}

	public static final MeshBuilder createCylinderShell(
    		final int     subdivisions,
    		final float   radius,
    		final float   height,
    		final boolean flat) {
		
		return createCylinderShell(subdivisions, radius, radius, height, flat);
	}
	
	public static final MeshBuilder createCylinderShell(
    		final int     subdivisions,
    		final float   rx,
    		final float   rz,
    		final float   height,
    		final boolean flat) {
		
		return
			createCylinderShell(subdivisions, flat).
			transformPositions(new Matrix4D().scale(rx, height, rz));
	}
	
	public static final MeshBuilder createDisc(final int subdivisions) {
		return _createRoundMesh(
			2 * subdivisions, false,
			(mb) -> _computeDiscData(subdivisions, 0, 0, 0, mb));
	}

	public static final MeshBuilder createDisc(
			final int   subdivisions,
			final float radius) {
		
		return createDisc(subdivisions, radius, radius);
	}
	
	public static final MeshBuilder createDisc(
			final int   subdivisions,
			final float rx,
			final float rz) {
		
		return
			createDisc(subdivisions).
			transformPositions(new Matrix4D().scale(rx, 1, rz));
	}
	
	public static final MeshBuilder createQuad() {
		
		return new MeshBuilder().
			allocateVertices     (_QUAD_POSITIONS.length).
			allocateTriangles    (4).
			activeCullFaceSupport().
			fillVertexData       ((vertex, index) -> vertex.
    			setPosition(_QUAD_POSITIONS[index]).
    			setNormal  (_QUAD_NORMALS  [index]).
    			setUTangent(_QUAD_UTANGENTS[index]).
    			setVTangent(_QUAD_VTANGENTS[index]).
    			setTexCoord(_QUAD_TEXCOORDS[index])).
			createDefaultQuads();
	}

	public static final MeshBuilder createQuad(
			final float   size,
			final boolean centered) {
		
		return createQuad(size, size, centered);
	}
	
	public static final MeshBuilder createQuad(
			final float   width,
			final float   length,
			final boolean centered) {
		
		final float t = centered ? -0.5f : 0;
		
		return
			createQuad().
			transformPositions(
				new Matrix4D().scale(width, 1, length).translate(t, 0, t));
	}
	
	public static final MeshBuilder createTorus(
    		final int     subdivisionsHor,
    		final int     subdivisionsVer,
    		final boolean flat) {
		
		return createTorus(subdivisionsHor, subdivisionsVer, 2, flat);
	}
	
	public static final MeshBuilder createTorus(
			final int     subdivisionsHor,
			final int     subdivisionsVer,
			final float   radius,
			final boolean flat) {
		
		return _createRoundMesh(
			(subdivisionsHor + 1) * (subdivisionsVer + 1), flat, (mb) -> {
    			_computeTorusIndices (
    				subdivisionsHor, subdivisionsVer,         mb);
    			_computeTorusVertices(
    				subdivisionsHor, subdivisionsVer, radius, mb);
		});
	}
	
	public static final MeshBuilder createTorus(
    		final int     subdivisionsHor,
    		final int     subdivisionsVer,
    		final float   R,
    		final float   rHor,
    		final float   rVer,
    		final boolean flat) {
		
		// The radius is set to preserve the ratio R/rHor
		final MeshBuilder mb =
			createTorus(subdivisionsHor, subdivisionsVer, R / rHor, flat);
		
		mb.transformPositions(new Matrix4D().scale(rHor, rVer, rHor));
		
		return mb;
	}
	
	public static final MeshBuilder createUVSphere(
    		final int     subdivisions,
    		final boolean flat) {
		
		return createUVSphere(subdivisions, subdivisions / 2, flat);
	}
	
	public static final MeshBuilder createUVSphere(
    		final int     subdivisionsHor,
    		final int     subdivisionsVer,
    		final boolean flat) {
    	
		return _createRoundMesh(
			(subdivisionsHor + 1) * (subdivisionsVer + 1), flat, (mb) -> {
    			_computeUVSphereIndices (subdivisionsHor, subdivisionsVer, mb);
    			_computeUVSphereVertices(subdivisionsHor, subdivisionsVer, mb);
			});
    }

	public static final MeshBuilder createUVSphere(
    		final int     subdivisions,
    		final float   radius,
    		final boolean flat) {
    	
		return createUVSphere(
			subdivisions, radius, radius, radius, flat);
	}

	public static final MeshBuilder createUVSphere(
    		final int     subdivisions,
    		final float   rx,
    		final float   ry,
    		final float   rz,
    		final boolean flat) {
    	
		return
			createUVSphere(subdivisions, flat).
			transformPositions(new Matrix4D().scale(rx, ry, rz));
	}
	
	public static final MeshBuilder createUVSphere(
    		final int     subdivisionsHor,
    		final int     subdivisionsVer,
    		final float   radius,
    		final boolean flat) {
    	
		return createUVSphere(
			subdivisionsHor, subdivisionsVer, radius, radius, radius, flat);
	}

	public static final MeshBuilder createUVSphere(
    		final int     subdivisionsHor,
    		final int     subdivisionsVer,
    		final float   rx,
    		final float   ry,
    		final float   rz,
    		final boolean flat) {
    	
		return
			createUVSphere(subdivisionsHor, subdivisionsVer, flat).
			transformPositions(new Matrix4D().scale(rx, ry, rz));
	}
}
