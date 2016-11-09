
ae.mesh._QUAD_POSITIONS = [[0,0,0],[1,0,0],[1,0,1],[0,0,1]];
ae.mesh._QUAD_TEXCOORDS = [[0,0],[0,1],[1,1],[1,0]];
ae.mesh._QUAD_INDICES   = [[0,1,2,3],[3,2,1,0]];
	
ae.mesh._CUBE_POSITIONS = [
	[0,0,0],[0,1,0],[1,1,0],[1,0,0],  // front
	[1,0,0],[1,1,0],[1,1,1],[1,0,1],  // right
	[1,0,1],[1,1,1],[0,1,1],[0,0,1],  // back
	[0,0,1],[0,1,1],[0,1,0],[0,0,0],  // left
	[0,0,0],[1,0,0],[1,0,1],[0,0,1],  // bottom
	[0,1,0],[0,1,1],[1,1,1],[1,1,0]]; // top

ae.mesh._CUBE_TEXCOORDS = [
	[0,0],[0,1],[1,1],[1,0],
	[0,0],[0,1],[1,1],[1,0],
	[0,0],[0,1],[1,1],[1,0],
	[0,0],[0,1],[1,1],[1,0],
	[0,0],[0,1],[1,1],[1,0],
	[0,0],[0,1],[1,1],[1,0]];

ae.mesh._computeCylinderShellData = function _computeCylinderShellData(
		subdivisions: number,
		iOffset:      number,
		vOffset:      number,
		indices:      Array<Array<number>>,
		positions:    Array<Array<number>>,
		normals:      Array<Array<number>>,
		texCoords:    Array<Array<number>>): void {
	
	const ringSize = subdivisions + 1;
	
	for(var i = 0; i < subdivisions; i++) {
		
		const iPos = iOffset + i;
		const vPos = vOffset + i;
		
		indices[iPos][0] = vPos;
		indices[iPos][1] = vPos + ringSize;
		indices[iPos][2] = vPos + ringSize + 1;
		indices[iPos][3] = vPos            + 1;
	}
	
	ae.mesh._computeDiscVertices(
		subdivisions, 0, vOffset,
		false, positions, normals, null);
	ae.mesh._computeDiscVertices(
		subdivisions, 1, vOffset + ringSize,
		false, positions, normals, null);
	
	for(var i = 0; i < ringSize; i++) {
		
		const vPos = vOffset + i;
		
		texCoords[vPos           ][0] = i / subdivisions;
		texCoords[vPos           ][1] = 0;
		texCoords[vPos + ringSize][0] = i / subdivisions;
		texCoords[vPos + ringSize][1] = 1;
	}
}

ae.mesh._computeDiscData = function _computeDiscData(
		subdivisions: number,
		posY1:        number,
		posY2:        number,
		iOffset:      number,
		vOffset:      number,
		indices:      Array<Array<number>>,
		positions:    Array<Array<number>>,
		normals:      Array<Array<number>>,
		texCoords:    Array<Array<number>>): void {
	
	const quadCount = ae.mesh._computeDiscQuadCount(subdivisions);
	
	// Indices of down-facing cap
	ae.mesh._computeDiscIndices(
		subdivisions, iOffset,             vOffset,
		true, false, indices);
	// Indices of up-facing cap
	ae.mesh._computeDiscIndices(
		subdivisions, iOffset + quadCount, vOffset + subdivisions,
		true, true,  indices);
	
	// Vertices of down-facing cap
	ae.mesh._computeDiscVertices(
		subdivisions, posY1, vOffset,
		true, positions, null, texCoords);
	// Vertices of up-facing cap
	ae.mesh._computeDiscVertices(
		subdivisions, posY2, vOffset + subdivisions,
		true, positions, null, texCoords);
	
	// Fill normal data
	for(var i = 0; i < subdivisions; i++) {
		ae.math.Y_NEG.getData(normals[vOffset                + i]);
		ae.math.Y_POS.getData(normals[vOffset + subdivisions + i]);
	}
}

ae.mesh._computeDiscIndices = function _computeDiscIndices(
		subdivisions: number,
		iOffset:      number,
		vOffset:      number,
		wrapIndices:  boolean,
		invert:       boolean,
		indices:      Array<Array<number>>): void {

	const ringSize  = subdivisions + (wrapIndices ? 0 : 1);
	const quadCount = this._computeDiscQuadCount(subdivisions);
	const offset1   = invert ? 3 : 1;
	const offset3   = invert ? 1 : 3;
	
	for(var i = 0; i < quadCount; i++) {
		
		const iPos = iOffset + i;
		
		indices[iPos][0] = vOffset;
		indices[iPos][1] = vOffset + (2 * i + offset1) % ringSize;
		indices[iPos][2] = vOffset +  2 * i + 2;
		indices[iPos][3] = vOffset + (2 * i + offset3) % ringSize;
	}
}

ae.mesh._computeDiscVertices = function _computeDiscVertices(
		subdivisions: number,
		posY:         number,
		vOffset:      number,
		wrapIndices:  boolean,
		positions:    Array<Array<number>>,
		normals:     ?Array<Array<number>>,
		texCoords:   ?Array<Array<number>>): void {
	
	const ringSize = subdivisions + (wrapIndices ? 0 : 1);
	
	for(var i = 0; i < ringSize; i++) {
		
		const angle = 2.0 * Math.PI * i / subdivisions;
		const x     =  Math.sin(angle);
		const z     = -Math.cos(angle);
		
		positions[vOffset + i][0] = x;
		positions[vOffset + i][1] = posY;
		positions[vOffset + i][2] = z;
		
		if(normals) {
			normals[vOffset + i][0] = x;
			normals[vOffset + i][1] = 0;
			normals[vOffset + i][2] = z;
		}
		
		if(texCoords) {
			texCoords[vOffset + i][0] = (x + 1) / 2;
			texCoords[vOffset + i][1] = (z + 1) / 2;
		}
	}
}

ae.mesh._computeDiscQuadCount = function _computeDiscQuadCount(
		subdivisions: number): number {
	
	return Math.ceil((subdivisions - 2.0) / 2.0);
}

ae.mesh.createCube = function createCube(): ae.mesh.MeshBuilder {
	
	const mb = new ae.mesh.MeshBuilder();
	
	mb.positions     = ae.util.cloneArray2D(ae.mesh._CUBE_POSITIONS);
	mb.texCoords     = ae.util.cloneArray2D(ae.mesh._CUBE_TEXCOORDS);
	mb.primitiveType = ae.mesh.PrimitiveType.QUAD;
	mb.cullFacing    = true;
	
	mb.computeNormals(true, true);
	
	return mb;
}

ae.mesh.createCubeEx = function createCubeEx(
		centered:    boolean = true,
		widthOrSize: number  = 1,
		height:     ?number  = null,
		length:     ?number  = null): ae.mesh.MeshBuilder {
	
	const t = centered ? -0.5 : 0;
	
	return ae.mesh.createCube().transformPositions(new ae.math.Matrix4D().
		scale(widthOrSize, height || widthOrSize, length || widthOrSize).
		translate(t, t, t));
}

ae.mesh.createCylinder = function createCylinder(
		subdivisions: number,
		flat:         boolean = false): ae.mesh.MeshBuilder {
	
	const mb = new ae.mesh.MeshBuilder();
	
	const ringSize  = subdivisions + 1;
	const quadCount = ae.mesh._computeDiscQuadCount(subdivisions);
	
	const indices   = mb.createIndexArray(
		2 * quadCount + subdivisions, ae.mesh.PrimitiveType.QUAD);
	const positions = mb.createPositionArray(
		2 * subdivisions + 2 * ringSize);
	const normals   = mb.createNormalArray();
	const texCoords = mb.createTexCoordArray();
	
	ae.mesh._computeDiscData(
		subdivisions, 0, 1, 0, 0, indices, positions, normals, texCoords);
	
	ae.mesh._computeCylinderShellData(
		subdivisions, 2 * quadCount, 2 * subdivisions,
		indices, positions, normals, texCoords);
	
	mb.cullFacing = true;
	
	return mb;
}

ae.mesh.createCylinderEx = function createCylinderEx(
		subdivisions: number,
		flat:         boolean = false,
		height:       number  = 1,
		rxOrRadius:   number  = 1,
		rz:          ?number  = null): ae.mesh.MeshBuilder {
	
	return ae.mesh.createCylinder(subdivisions, flat).
		transformPositions(
			new ae.math.Matrix4D().scale(rxOrRadius, height, rz || rxOrRadius));
}

ae.mesh.createCylinderShell = function createCylinderShell(
		subdivisions: number,
		flat:         boolean = false): ae.mesh.MeshBuilder {
	
	const mb = new ae.mesh.MeshBuilder();
	
	const ringSize = subdivisions + 1;
	
	const indices   = mb.createIndexArray(
		subdivisions, ae.mesh.PrimitiveType.QUAD);
	const positions = mb.createPositionArray(2 * ringSize);
	const normals   = mb.createNormalArray();
	const texCoords = mb.createTexCoordArray();
	
	ae.mesh._computeCylinderShellData(
		subdivisions, 0, 0, indices, positions, normals, texCoords);
	
	mb.cullFacing = true;
	
	return mb;
}

ae.mesh.createCylinderShellEx = function createCylinderShellEx(
		subdivisions: number,
		flat:         boolean = false,
		height:       number  = 1,
		rxOrRadius:   number  = 1,
		rz:          ?number  = null): ae.mesh.MeshBuilder {
	
	return ae.mesh.createCylinderShell(subdivisions, flat).
		transformPositions(
			new ae.math.Matrix4D().scale(rxOrRadius, height, rz || rxOrRadius));
}

ae.mesh.createDisc = function createDisc(
		subdivisions: number): ae.mesh.MeshBuilder {
	
	const mb = new ae.mesh.MeshBuilder();
	
	const quadCount = ae.mesh._computeDiscQuadCount(subdivisions);
	
	const indices   = mb.createIndexArray(
		2 * quadCount, ae.mesh.PrimitiveType.QUAD);
	const positions = mb.createPositionArray(2 * subdivisions);
	const normals   = mb.createNormalArray();
	const texCoords = mb.createTexCoordArray();
	
	ae.mesh._computeDiscData(
		subdivisions, 0, 0, 0, 0, indices, positions, normals, texCoords);
	
	mb.cullFacing = true;
	
	return mb;
}

ae.mesh.createDiscEx = function createDiscEx(
		subdivisions: number,
		rxOrRadius:   number = 1,
		rz:          ?number = null): ae.mesh.MeshBuilder {
	
	return ae.mesh.createDisc(subdivisions).transformPositions(
		new ae.math.Matrix4D().scale(rxOrRadius, 1, rz || rxOrRadius));
}

ae.mesh.createQuad = function createQuad(): ae.mesh.MeshBuilder {
	
	const mb = new ae.mesh.MeshBuilder();
	
	mb.indices       = ae.util.cloneArray2D(ae.mesh._QUAD_INDICES);
	mb.positions     = ae.util.cloneArray2D(ae.mesh._QUAD_POSITIONS);
	mb.texCoords     = ae.util.cloneArray2D(ae.mesh._QUAD_TEXCOORDS);
	mb.primitiveType = ae.mesh.PrimitiveType.QUAD;
	mb.cullFacing    = true;
	
	mb.computeNormals(true, true);
	
	return mb;
}

ae.mesh.createQuadEx = function createQuadEx(
		centered:    boolean = true,
		widthOrSize: number  = 1,
		length:     ?number  = null): ae.mesh.MeshBuilder {
	
	const t = centered ? -0.5 : 0;
	
	return ae.mesh.createQuad().transformPositions(new ae.math.Matrix4D().
		scale(widthOrSize, 1, length || widthOrSize).translate(t, t, t));
}

ae.mesh.createTorus = function createTorus(
		subdivisionsHor: number,
		subdivisionsVer: number,
		flat:            boolean = false,
		radius:          number  = 2): ae.mesh.MeshBuilder {
	
	const mb = new ae.mesh.MeshBuilder();
	
	const ringSizeHor = subdivisionsHor + 1;
	const ringSizeVer = subdivisionsVer + 1;
	
	const indices   = mb.createIndexArray(
		subdivisionsHor * subdivisionsVer, ae.mesh.PrimitiveType.QUAD);
	const positions = mb.createPositionArray(ringSizeHor * ringSizeVer);
	const normals   = flat ? null : mb.createNormalArray();
	const texCoords = mb.createTexCoordArray();
	
	for(var i = 0; i < subdivisionsVer; i++) {
		for(var j = 0; j < subdivisionsHor; j++) {
			
			const iPos = i * subdivisionsHor + j;
			
			indices[iPos][0] =  i      * ringSizeHor +  j;
			indices[iPos][1] = (i + 1) * ringSizeHor +  j;
			indices[iPos][2] = (i + 1) * ringSizeHor + (j + 1);
			indices[iPos][3] =  i      * ringSizeHor + (j + 1);
		}
	}
	
	for(var i = 0; i < ringSizeVer; i++) {
		for(var j = 0; j < ringSizeHor; j++) {
			
			const angleHor = 2.0 * Math.PI * j / subdivisionsHor;
			const angleVer = 2.0 * Math.PI * i / subdivisionsVer;
			
			const vPos = i * ringSizeHor + j;
			
			positions[vPos][0] =
				Math.sin(angleHor) * (radius - Math.cos(angleVer));
			positions[vPos][1] =
				Math.sin(angleVer);
			positions[vPos][2] =
				Math.cos(angleHor) * (radius - Math.cos(angleVer));
			
			// The normals are computed similary to the positions, except
			// that the radius is assumed as 0 and thus removed from the
			// formula
			if(normals) {
				normals[vPos][0] = Math.sin(angleHor) * -Math.cos(angleVer);
				normals[vPos][1] = Math.sin(angleVer);
				normals[vPos][2] = Math.cos(angleHor) * -Math.cos(angleVer);
			}
			
			texCoords[vPos][0] = j / subdivisionsHor;
			texCoords[vPos][1] = i / subdivisionsVer;
		}
	}
	
	if(flat) mb.computeNormals(true, true);
	
	mb.cullFacing = true;
	
	return mb;
}

ae.mesh.createTorusEx = function createTorusEx(
		subdivisionsHor: number,
		subdivisionsVer: number,
		flat:            boolean = false,
		R:               number  = 2,
		rHorOrRadius:    number  = 1,
		rVer:           ?number  = null): ae.mesh.MeshBuilder {
	
	// The radius is set to preserve the ratio R/rHor
	return ae.mesh.createTorus(
			subdivisionsHor, subdivisionsVer, flat, R / rHorOrRadius).
		transformPositions(new ae.math.Matrix4D().
			scale(rHorOrRadius, rVer || rHorOrRadius, rHorOrRadius));
}

ae.mesh.createUVSphere = function createUVSphere(
		subdivisionsHor: number,
		flat:            boolean = false,
		subdivisionsVer: number  = -1): ae.mesh.MeshBuilder {
	
	const mb = new ae.mesh.MeshBuilder();
	
	if(subdivisionsVer <= 0) subdivisionsVer = subdivisionsHor;
	
	const vertexCount = (subdivisionsHor + 1) * (subdivisionsVer + 1);

	const indices   = mb.createIndexArray(
		subdivisionsHor * subdivisionsVer, ae.mesh.PrimitiveType.QUAD);
	const positions = mb.createPositionArray(vertexCount);
	const normals   = mb.createNormalArray();
	const texCoords = mb.createTexCoordArray();

	for(var i = 0; i < subdivisionsVer; i++) {
		for(var j = 0; j < subdivisionsHor; j++) {
			
			const iPos = i * subdivisionsHor + j;

			indices[iPos][0] =  i      * (subdivisionsHor + 1) +  j;
			indices[iPos][1] = (i + 1) * (subdivisionsHor + 1) +  j;
			indices[iPos][2] = (i + 1) * (subdivisionsHor + 1) + (j + 1);
			indices[iPos][3] =  i      * (subdivisionsHor + 1) + (j + 1);
		}
	}

	for(var i = 0; i <= subdivisionsVer; i++) {
		for(var j = 0; j <= subdivisionsHor; j++) {
			
			const angleHor = 2.0 * Math.PI * j / subdivisionsHor;
			const angleVer = Math.PI * (i / subdivisionsVer - 0.5);
			const radius   = Math.cos(angleVer);
			const vPos     = i * (subdivisionsHor + 1) + j;

			const x =  Math.sin(angleHor) * radius;
			const y =  Math.sin(angleVer);
			const z = -Math.cos(angleHor) * radius;

			positions[vPos][0] = x;
			positions[vPos][1] = y;
			positions[vPos][2] = z;

			if(!flat) {
				normals[vPos][0] = x;
				normals[vPos][1] = y;
				normals[vPos][2] = z;
			}

			texCoords[vPos][0] = 2 * j / subdivisionsHor;
			texCoords[vPos][1] =     i / subdivisionsVer;
		}
	}
	
	if(flat) mb.computeNormals(true, true);
	
	mb.cullFacing = true;
	
	return mb;
}

ae.mesh.createUVSphereEx = function createUVSphereEx(
		subdivisionsHor: number,
		subdivisionsVer: number,
		flat:            boolean = false,
		rxOrRadius:      number  = 1,
		ry:             ?number  = null,
		rz:             ?number  = null) {
	
	return ae.mesh.createUVSphere(subdivisionsHor, flat, subdivisionsVer).
		transformPositions(new ae.math.Matrix4D().
			scale(rxOrRadius, ry || rxOrRadius, rz || rxOrRadius));
}
