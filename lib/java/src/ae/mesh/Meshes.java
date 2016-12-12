package ae.mesh;

import ae.math.Matrix4D;
import ae.math.SignedAxis;
import ae.mesh.Mesh.PrimitiveType;
import ae.util.Functions;

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
		{ 0, 0,-1},{ 0, 0,-1},{ 0, 0,-1},{ 0, 0,-1},
		{ 1, 0, 0},{ 1, 0, 0},{ 1, 0, 0},{ 1, 0, 0},
		{ 0, 0, 1},{ 0, 0, 1},{ 0, 0, 1},{ 0, 0, 1},
		{-1, 0, 0},{-1, 0, 0},{-1, 0, 0},{-1, 0, 0},
		{ 0,-1, 0},{ 0,-1, 0},{ 0,-1, 0},{ 0,-1, 0},
		{ 0, 1, 0},{ 0, 1, 0},{ 0, 1, 0},{ 0, 1, 0}};

	private static final float[][] _CUBE_UTANGENTS = {
		{ 1, 0, 0},{ 1, 0, 0},{ 1, 0, 0},{ 1, 0, 0},
		{ 0, 0, 1},{ 0, 0, 1},{ 0, 0, 1},{ 0, 0, 1},
		{-1, 0, 0},{-1, 0, 0},{-1, 0, 0},{-1, 0, 0},
		{ 0, 0,-1},{ 0, 0,-1},{ 0, 0,-1},{ 0, 0,-1},
		{ 1, 0, 0},{ 1, 0, 0},{ 1, 0, 0},{ 1, 0, 0},
		{ 1, 0, 0},{ 1, 0, 0},{ 1, 0, 0},{ 1, 0, 0}};

	private static final float[][] _CUBE_VTANGENTS = {
		{ 0, 1, 0},{ 0, 1, 0},{ 0, 1, 0},{ 0, 1, 0},
		{ 0, 1, 0},{ 0, 1, 0},{ 0, 1, 0},{ 0, 1, 0},
		{ 0, 1, 0},{ 0, 1, 0},{ 0, 1, 0},{ 0, 1, 0},
		{ 0, 1, 0},{ 0, 1, 0},{ 0, 1, 0},{ 0, 1, 0},
		{ 0, 0, 1},{ 0, 0, 1},{ 0, 0, 1},{ 0, 0, 1},
		{ 0, 0, 1},{ 0, 0, 1},{ 0, 0, 1},{ 0, 0, 1}};
	
	private static final float[][] _CUBE_TEXCOORDS = {
		{0,0},{0,1},{1,1},{1,0},
		{0,0},{0,1},{1,1},{1,0},
		{0,0},{0,1},{1,1},{1,0},
		{0,0},{0,1},{1,1},{1,0},
		{0,0},{1,0},{1,1},{0,1},
		{0,0},{0,1},{1,1},{1,0}};

	private Meshes() {}
	
	private static final void _computeCylinderShellData(
			final int       subdivisions,
			final int       iOffset,
			final int       vOffset,
			final int[][]   indices,
			final float[][] positions,
			final float[][] uTangents,
			final float[][] vTangents,
			final float[][] normals,
			final float[][] texCoords) {
		
		final int ringSize = subdivisions + 1;
		
		int iPos, vPos;
		
		for(int i = 0; i < subdivisions; i++) {
			
			iPos = iOffset + i;
			vPos = vOffset + i;
			
			indices[iPos][0] = vPos;
			indices[iPos][1] = vPos            + 1;
			indices[iPos][2] = vPos + ringSize + 1;
			indices[iPos][3] = vPos + ringSize;
		}
		
		_computeDiscVertices(
			subdivisions, 0, vOffset,
			false, positions, uTangents, vTangents, normals, null);
		_computeDiscVertices(
			subdivisions, 1, vOffset + ringSize,
			false, positions, uTangents, vTangents, normals, null);
		
		for(int i = 0; i < ringSize; i++) {
			
			vPos = vOffset + i;
			
			texCoords[vPos           ][0] = i / (float)subdivisions;
			texCoords[vPos           ][1] = 0;
			texCoords[vPos + ringSize][0] = i / (float)subdivisions;
			texCoords[vPos + ringSize][1] = 1;
		}
	}
	
	private static final void _computeDiscData(
    		final int       subdivisions,
    		final float     posY1,
    		final float     posY2,
    		final int       iOffset,
    		final int       vOffset,
    		final int[][]   indices,
    		final float[][] positions,
    		final float[][] uTangents,
    		final float[][] vTangents,
    		final float[][] normals,
    		final float[][] texCoords) {
		
		final int quadCount = _computeDiscQuadCount(subdivisions);
		
		// Indices of down-facing cap
		_computeDiscIndices(
			subdivisions, iOffset,             vOffset,
			true, false, indices);
		// Indices of up-facing cap
		_computeDiscIndices(
			subdivisions, iOffset + quadCount, vOffset + subdivisions,
			true, true,  indices);
		
		// Vertices of down-facing cap
		_computeDiscVertices(
			subdivisions, posY1, vOffset,
			true, positions, null, null, null, texCoords);
		// Vertices of up-facing cap
		_computeDiscVertices(
			subdivisions, posY2, vOffset + subdivisions,
			true, positions, null, null, null, texCoords);
		
		// Fill TBN data
		for(int i = 0; i < subdivisions; i++) {
			SignedAxis.X_POS.v.getData(uTangents[vOffset                + i]);
			SignedAxis.X_POS.v.getData(uTangents[vOffset + subdivisions + i]);
			SignedAxis.Z_POS.v.getData(vTangents[vOffset                + i]);
			SignedAxis.Z_POS.v.getData(vTangents[vOffset + subdivisions + i]);
			SignedAxis.Y_NEG.v.getData(normals  [vOffset                + i]);
			SignedAxis.Y_POS.v.getData(normals  [vOffset + subdivisions + i]);
		}
	}
	
	private static final void _computeDiscIndices(
			final int     subdivisions,
			final int     iOffset,
			final int     vOffset,
			final boolean wrapIndices,
			final boolean invert,
			final int[][] indices) {

		final int ringSize  = subdivisions + (wrapIndices ? 0 : 1);
		final int quadCount = _computeDiscQuadCount(subdivisions);
		final int offset1   = invert ? 1 : 3;
		final int offset3   = invert ? 3 : 1;
		
		int iPos;
		
		for(int i = 0; i < quadCount; i++) {
			
			iPos = iOffset + i;
			
			indices[iPos][0] = vOffset;
			indices[iPos][1] = vOffset + (2 * i + offset1) % ringSize;
			indices[iPos][2] = vOffset +  2 * i + 2;
			indices[iPos][3] = vOffset + (2 * i + offset3) % ringSize;
		}
	}
	
	private static final void _computeDiscVertices(
			final int       subdivisions,
			final float     posY,
			final int       vOffset,
			final boolean   wrapIndices,
			final float[][] positions,
    		final float[][] uTangents,
    		final float[][] vTangents,
			final float[][] normals,
			final float[][] texCoords) {
		
		final int ringSize = subdivisions + (wrapIndices ? 0 : 1);
		
		double angle;
		float  x, z;
		
		for(int i = 0; i < ringSize; i++) {
			
			angle = 2.0 * Math.PI * (double)i / subdivisions;
			x     = (float)Math.sin(angle);
			z     = (float)Math.cos(angle);
			
			positions[vOffset + i][0] = x;
			positions[vOffset + i][1] = posY;
			positions[vOffset + i][2] = z;
			
			if(uTangents != null) {
				uTangents[vOffset + i][0] =  (float)Math.cos(angle);
				uTangents[vOffset + i][1] = 0;
				uTangents[vOffset + i][2] = -(float)Math.sin(angle);
			}

			if(vTangents != null) {
				vTangents[vOffset + i][0] = 0;
				vTangents[vOffset + i][1] = 1;
				vTangents[vOffset + i][2] = 0;
			}

			if(normals != null) {
				normals[vOffset + i][0] = x;
				normals[vOffset + i][1] = 0;
				normals[vOffset + i][2] = z;
			}
			
			if(texCoords != null) {
				texCoords[vOffset + i][0] = (x + 1) / 2;
				texCoords[vOffset + i][1] = (z + 1) / 2;
			}
		}
	}

	private static final int _computeDiscQuadCount(final int subdivisions) {
		return (int)Math.ceil((subdivisions - 2.0) / 2.0);
	}
	
	public static final MeshBuilder createCube() {
		
		final MeshBuilder mb = new MeshBuilder();
		
		mb.setPositions(Functions.cloneArray2D(_CUBE_POSITIONS));
		mb.setNormals  (Functions.cloneArray2D(_CUBE_NORMALS));
		mb.setUTangents(Functions.cloneArray2D(_CUBE_UTANGENTS));
		mb.setVTangents(Functions.cloneArray2D(_CUBE_VTANGENTS));
		mb.setTexCoords(Functions.cloneArray2D(_CUBE_TEXCOORDS));
		
		mb.setPrimitiveType(PrimitiveType.QUAD);
		mb.cullFacing = true;
		
		return mb;
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
		
		final MeshBuilder mb = new MeshBuilder();
		
		final int ringSize  = subdivisions + 1;
		final int quadCount = _computeDiscQuadCount(subdivisions);
		
		final int[][]   indices   = mb.createIndexArray(
			2 * quadCount + subdivisions, PrimitiveType.QUAD);
		final float[][] positions = mb.createPositionArray(
			2 * subdivisions + 2 * ringSize);
		final float[][] uTangents = mb.createUTangentArray();
		final float[][] vTangents = mb.createVTangentArray();
		final float[][] normals   = mb.createNormalArray();
		final float[][] texCoords = mb.createTexCoordArray();
		
		_computeDiscData(
			subdivisions, 0, 1, 0, 0,
			indices, positions, uTangents, vTangents, normals, texCoords);
		
		_computeCylinderShellData(
			subdivisions, 2 * quadCount, 2 * subdivisions,
			indices, positions, uTangents, vTangents, normals, texCoords);

		mb.cullFacing = true;
		
		return mb;
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
		
		final MeshBuilder mb = new MeshBuilder();
		
		final int ringSize = subdivisions + 1;
		
		final int[][]   indices   = mb.createIndexArray(
			subdivisions, PrimitiveType.QUAD);
		final float[][] positions = mb.createPositionArray(2 * ringSize);
		final float[][] uTangents = mb.createUTangentArray();
		final float[][] vTangents = mb.createVTangentArray();
		final float[][] normals   = mb.createNormalArray();
		final float[][] texCoords = mb.createTexCoordArray();
		
		_computeCylinderShellData(
			subdivisions, 0, 0,
			indices, positions, uTangents, vTangents, normals, texCoords);

		mb.cullFacing = true;
		
		return mb;
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
		
		final MeshBuilder mb = new MeshBuilder();
		
		final int quadCount = _computeDiscQuadCount(subdivisions);
		
		final int[][]   indices   = mb.createIndexArray(
			2 * quadCount, PrimitiveType.QUAD);
		final float[][] positions = mb.createPositionArray(2 * subdivisions);
		final float[][] uTangents = mb.createUTangentArray();
		final float[][] vTangents = mb.createVTangentArray();
		final float[][] normals   = mb.createNormalArray();
		final float[][] texCoords = mb.createTexCoordArray();
		
		_computeDiscData(
			subdivisions, 0, 0, 0, 0,
			indices, positions, uTangents, vTangents, normals, texCoords);

		mb.cullFacing = true;
		
		return mb;
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
		
		final MeshBuilder mb = new MeshBuilder();
		
		mb.setPositions(Functions.cloneArray2D(_QUAD_POSITIONS));
		mb.setNormals  (Functions.cloneArray2D(_QUAD_NORMALS));
		mb.setUTangents(Functions.cloneArray2D(_QUAD_UTANGENTS));
		mb.setVTangents(Functions.cloneArray2D(_QUAD_VTANGENTS));
		mb.setTexCoords(Functions.cloneArray2D(_QUAD_TEXCOORDS));
		
		mb.setPrimitiveType(PrimitiveType.QUAD);
		mb.cullFacing = true;
		
		return mb;
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
		
		final MeshBuilder mb = new MeshBuilder();
		
		final int ringSizeHor = subdivisionsHor + 1;
		final int ringSizeVer = subdivisionsVer + 1;
		
		final int[][]   indices   = mb.createIndexArray(
			subdivisionsHor * subdivisionsVer, PrimitiveType.QUAD);
		final float[][] positions = mb.createPositionArray(
			ringSizeHor * ringSizeVer);
		final float[][] uTangents = flat ? null : mb.createUTangentArray();
		final float[][] vTangents = flat ? null : mb.createVTangentArray();
		final float[][] normals   = flat ? null : mb.createNormalArray();
		final float[][] texCoords = mb.createTexCoordArray();
		
		double angleHor, angleVer;
		int    iPos, vPos;
		
		for(int i = 0; i < subdivisionsVer; i++) {
			for(int j = 0; j < subdivisionsHor; j++) {
				
				iPos = i * subdivisionsHor + j;
				
				indices[iPos][0] =  i      * ringSizeHor +  j;
				indices[iPos][1] = (i + 1) * ringSizeHor +  j;
				indices[iPos][2] = (i + 1) * ringSizeHor + (j + 1);
				indices[iPos][3] =  i      * ringSizeHor + (j + 1);
			}
		}
		
		for(int i = 0; i < ringSizeVer; i++) {
			for(int j = 0; j < ringSizeHor; j++) {
				
				angleHor = 2.0 * Math.PI * j / subdivisionsHor;
				angleVer = 2.0 * Math.PI * i / subdivisionsVer;
				
				vPos = i * ringSizeHor + j;
				
				positions[vPos][0] =
					(float)(Math.sin(angleHor) * (radius - Math.cos(angleVer)));
				positions[vPos][1] =
					(float) Math.sin(angleVer);
				positions[vPos][2] =
					(float)(Math.cos(angleHor) * (radius - Math.cos(angleVer)));
				
				// The normals are computed similar to the positions, except
				// that the radius is assumed as 0 and thus removed from the
				// formula
				if(!flat) {
    				
    				uTangents[vPos][0] = (float) Math.cos(angleHor);
    				uTangents[vPos][1] = 0;
    				uTangents[vPos][2] = (float)-Math.sin(angleHor);
    				
    				vTangents[vPos][0] =
    					(float)(Math.sin(angleHor) * Math.sin(angleVer));
        			vTangents[vPos][1] =
        				(float) Math.cos(angleVer);
            		vTangents[vPos][2] =
            			(float)(Math.cos(angleHor) * Math.sin(angleVer));
    				
					normals[vPos][0] =
    					(float)(Math.sin(angleHor) * -Math.cos(angleVer));
    				normals[vPos][1] =
    					(float) Math.sin(angleVer);
    				normals[vPos][2] =
    					(float)(Math.cos(angleHor) * -Math.cos(angleVer));
				}
				
				texCoords[vPos][0] = (float)j / subdivisionsHor;
				texCoords[vPos][1] = (float)i / subdivisionsVer;
			}
		}
		
		if(flat) mb.computeNormals(true, true);

		mb.cullFacing = true;
		
		return mb;
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
    	
		final MeshBuilder mb = new MeshBuilder();
		
    	final int vertexCount = (subdivisionsHor + 1) * (subdivisionsVer + 1);

    	final int[][]   indices   = mb.createIndexArray(
    		subdivisionsHor * subdivisionsVer, PrimitiveType.QUAD);
    	final float[][] positions = mb.createPositionArray(vertexCount);
    	final float[][] uTangents = flat ? null : mb.createUTangentArray();
		final float[][] vTangents = flat ? null : mb.createVTangentArray();
    	final float[][] normals   = flat ? null : mb.createNormalArray();
    	final float[][] texCoords = mb.createTexCoordArray();
    
    	double angleHor;
    	double angleVer;
    	float  x, y, z;
    	int    iPos;
    	int    vPos;
    
    	for(int i = 0; i < subdivisionsVer; i++) {
    		for(int j = 0; j < subdivisionsHor; j++) {
    			
    			iPos = i * subdivisionsHor + j;
    
    			indices[iPos][0] =  i      * (subdivisionsHor + 1) +  j;
    			indices[iPos][1] =  i      * (subdivisionsHor + 1) + (j + 1);
    			indices[iPos][2] = (i + 1) * (subdivisionsHor + 1) + (j + 1);
    			indices[iPos][3] = (i + 1) * (subdivisionsHor + 1) +  j;
    		}
    	}
    
    	for(int i = 0; i <= subdivisionsVer; i++) {
    		for(int j = 0; j <= subdivisionsHor; j++) {
    			
    			angleHor = 2.0 * Math.PI * (double)j / subdivisionsHor;
    			angleVer = Math.PI * ((double)i / subdivisionsVer - 0.5);
    			vPos     = i * (subdivisionsHor + 1) + j;
    
    			x = (float)(Math.cos(angleVer) * Math.sin(angleHor));
    			y = (float) Math.sin(angleVer);
    			z = (float)(Math.cos(angleVer) * Math.cos(angleHor));
    
    			positions[vPos][0] = x;
    			positions[vPos][1] = y;
    			positions[vPos][2] = z;
    
    			if(!flat) {
    				
    				uTangents[vPos][0] =  (float)Math.cos(angleHor);
        			uTangents[vPos][1] = 0;
            		uTangents[vPos][2] = -(float)Math.sin(angleHor);
            		
            		vTangents[vPos][0] =
            			(float)(Math.sin(angleVer) * -Math.sin(angleHor));
        			vTangents[vPos][1] =
        				(float) Math.cos(angleVer);
            		vTangents[vPos][2] =
            			(float)(Math.sin(angleVer) * -Math.cos(angleHor));
    				
    				normals[vPos][0] = x;
        			normals[vPos][1] = y;
        			normals[vPos][2] = z;
    			}
    
    			texCoords[vPos][0] = 2 * (float)j / subdivisionsHor;
    			texCoords[vPos][1] =     (float)i / subdivisionsVer;
    		}
    	}
    	
    	if(flat) mb.computeNormals(true, true);

		mb.cullFacing = true;
    	
    	return mb;
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
