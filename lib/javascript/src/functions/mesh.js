
ae.mesh._QUAD_POSITIONS = [
	[0,0,0],[1,0,0],[1,0,1],[0,0,1],
	[0,0,0],[0,0,1],[1,0,1],[1,0,0]];

ae.mesh._QUAD_NORMALS = [
	[ 0,-1, 0],[ 0,-1, 0],[ 0,-1, 0],[ 0,-1, 0],
	[ 0, 1, 0],[ 0, 1, 0],[ 0, 1, 0],[ 0, 1, 0]];

ae.mesh._QUAD_UTANGENTS = [
	[ 1, 0, 0],[ 1, 0, 0],[ 1, 0, 0],[ 1, 0, 0],
	[ 1, 0, 0],[ 1, 0, 0],[ 1, 0, 0],[ 1, 0, 0]];

ae.mesh._QUAD_VTANGENTS = [
	[ 0, 0, 1],[ 0, 0, 1],[ 0, 0, 1],[ 0, 0, 1],
	[ 0, 0, 1],[ 0, 0, 1],[ 0, 0, 1],[ 0, 0, 1]];

ae.mesh._QUAD_TEXCOORDS = [
	[0,0],[1,0],[1,1],[0,1],
	[0,0],[0,1],[1,1],[1,0]];

ae.mesh._CUBE_POSITIONS = [
	[0,0,0],[0,1,0],[1,1,0],[1,0,0],  // front
	[1,0,0],[1,1,0],[1,1,1],[1,0,1],  // right
	[1,0,1],[1,1,1],[0,1,1],[0,0,1],  // back
	[0,0,1],[0,1,1],[0,1,0],[0,0,0],  // left
	[0,0,0],[1,0,0],[1,0,1],[0,0,1],  // bottom
	[0,1,0],[0,1,1],[1,1,1],[1,1,0]]; // top

ae.mesh._CUBE_NORMALS = [
	[ 0, 0,-1],[ 0, 0,-1],[ 0, 0,-1],[ 0, 0,-1],  // front
	[ 1, 0, 0],[ 1, 0, 0],[ 1, 0, 0],[ 1, 0, 0],  // right
	[ 0, 0, 1],[ 0, 0, 1],[ 0, 0, 1],[ 0, 0, 1],  // back
	[-1, 0, 0],[-1, 0, 0],[-1, 0, 0],[-1, 0, 0],  // left
	[ 0,-1, 0],[ 0,-1, 0],[ 0,-1, 0],[ 0,-1, 0],  // bottom
	[ 0, 1, 0],[ 0, 1, 0],[ 0, 1, 0],[ 0, 1, 0]]; // top

ae.mesh._CUBE_UTANGENTS = [
	[ 1, 0, 0],[ 1, 0, 0],[ 1, 0, 0],[ 1, 0, 0],  // front
	[ 0, 0, 1],[ 0, 0, 1],[ 0, 0, 1],[ 0, 0, 1],  // right
	[-1, 0, 0],[-1, 0, 0],[-1, 0, 0],[-1, 0, 0],  // back
	[ 0, 0,-1],[ 0, 0,-1],[ 0, 0,-1],[ 0, 0,-1],  // left 
	[ 1, 0, 0],[ 1, 0, 0],[ 1, 0, 0],[ 1, 0, 0],  // bottom
	[ 1, 0, 0],[ 1, 0, 0],[ 1, 0, 0],[ 1, 0, 0]]; // top

ae.mesh._CUBE_VTANGENTS = [
	[ 0, 1, 0],[ 0, 1, 0],[ 0, 1, 0],[ 0, 1, 0],  // front
	[ 0, 1, 0],[ 0, 1, 0],[ 0, 1, 0],[ 0, 1, 0],  // right
	[ 0, 1, 0],[ 0, 1, 0],[ 0, 1, 0],[ 0, 1, 0],  // back
	[ 0, 1, 0],[ 0, 1, 0],[ 0, 1, 0],[ 0, 1, 0],  // left
	[ 0, 0, 1],[ 0, 0, 1],[ 0, 0, 1],[ 0, 0, 1],  // bottom
	[ 0, 0, 1],[ 0, 0, 1],[ 0, 0, 1],[ 0, 0, 1]]; // top

ae.mesh._CUBE_TEXCOORDS = [
	[0,0],[0,1],[1,1],[1,0],  // front
	[0,0],[0,1],[1,1],[1,0],  // right
	[0,0],[0,1],[1,1],[1,0],  // back
	[0,0],[0,1],[1,1],[1,0],  // left
	[0,0],[1,0],[1,1],[0,1],  // bottom
	[0,0],[0,1],[1,1],[1,0]]; // top

ae.mesh._computeCylinderShellData = function(
		subdivisions: number,
		vOffset:      number,
		mb:           ae.mesh.MeshBuilder) {
	
	const ringSize = subdivisions + 1;
	
	for(let i = 0; i < subdivisions; i++) {
		const vPos = vOffset + i;
		mb.addPolygonB(
			0,
			vPos,
			vPos            + 1,
			vPos + ringSize + 1,
			vPos + ringSize);
	}
	
	ae.mesh._computeDiscVertices(subdivisions, 0, vOffset,            false, mb);
	ae.mesh._computeDiscVertices(subdivisions, 1, vOffset + ringSize, false, mb);
	
	for(let i = 0; i < ringSize; i++) {
		mb.getVertex(vOffset            + i).setTexCoordB(i / subdivisions, 0);
		mb.getVertex(vOffset + ringSize + i).setTexCoordB(i / subdivisions, 1);
	}
}

ae.mesh._computeDiscData = function(
		subdivisions: number,
		posY1:        number,
		posY2:        number,
		vOffset:      number,
		mb:           ae.mesh.MeshBuilder) {
	
	// Indices of down-facing cap
	ae.mesh._computeDiscIndices(
		subdivisions, vOffset,                true, false, mb);
	// Indices of up-facing cap
	ae.mesh._computeDiscIndices(
		subdivisions, vOffset + subdivisions, true, true,  mb);
	
	// Vertices of down-facing cap
	ae.mesh._computeDiscVertices(
		subdivisions, posY1, vOffset,                true, mb);
	// Vertices of up-facing cap
	ae.mesh._computeDiscVertices(
		subdivisions, posY2, vOffset + subdivisions, true, mb);
	
	// Fill TBN data
	for(let i = 0; i < subdivisions; i++) {
		mb.getVertex(vOffset                + i).
			setNormalB(0, -1, 0).setUTangentB(1, 0, 0).setVTangentB(0, 0, 1);
		mb.getVertex(vOffset + subdivisions + i).
			setNormalB(0,  1, 0).setUTangentB(1, 0, 0).setVTangentB(0, 0, 1);
	}
}

ae.mesh._computeDiscIndices = function(
		subdivisions: number,
		vOffset:      number,
		wrapIndices:  boolean,
		invert:       boolean,
		mb:           ae.mesh.MeshBuilder) {

	const ringSize = subdivisions + (wrapIndices ? 0 : 1);
	const indices  = Array(subdivisions + 1);
	
	for(let i = 0; i < indices.length; i++)
		indices[i] = vOffset + (invert ? subdivisions - i : i) % ringSize;
	
	mb.addPolygonA(0, indices);
}

ae.mesh._computeDiscVertices = function(
		subdivisions: number,
		posY:         number,
		vOffset:      number,
		wrapIndices:  boolean,
		mb:           ae.mesh.MeshBuilder) {
	
	const ringSize = subdivisions + (wrapIndices ? 0 : 1);
	
	for(let i = 0; i < ringSize; i++) {
		
		const angle = 2.0 * Math.PI * i / subdivisions;
		const x     = Math.sin(angle);
		const z     = Math.cos(angle);
		
		mb.getVertex(vOffset + i).
			setPositionB(x, posY, z).
			setNormalB  (x, 0,    z).
			setUTangentB(Math.cos(angle), 0, -Math.sin(angle)).
			setVTangentB(0, 1, 0).
			setTexCoordB((x + 1) / 2, (z + 1) / 2);
	}
}

ae.mesh._computeTorusIndices = function(
		subdivisionsHor: number,
		subdivisionsVer: number,
		mb:              ae.mesh.MeshBuilder) {
	
	const ringSizeHor = subdivisionsHor + 1;
	
	for(let i = 0; i < subdivisionsVer; i++)
		for(let j = 0; j < subdivisionsHor; j++)
			mb.addPolygonB(
				0,
				 i      * ringSizeHor +  j,
				(i + 1) * ringSizeHor +  j,
				(i + 1) * ringSizeHor + (j + 1),
				 i      * ringSizeHor + (j + 1));
}

ae.mesh._computeTorusVertices = function(
		subdivisionsHor: number,
		subdivisionsVer: number,
		radius:          number,
		mb:              ae.mesh.MeshBuilder) {
	
	const ringSizeHor = subdivisionsHor + 1;
	const ringSizeVer = subdivisionsVer + 1;
	
	for(let i = 0; i < ringSizeVer; i++) {
		for(let j = 0; j < ringSizeHor; j++) {
			
			const angleHor = 2.0 * Math.PI * j / subdivisionsHor;
			const angleVer = 2.0 * Math.PI * i / subdivisionsVer;
			
			// The normals are computed similar to the positions, except
			// that the radius is assumed as 0 and thus removed from the
			// formula
			
			mb.getVertex(i * ringSizeHor + j).
				setPositionB(
					Math.sin(angleHor) * (radius - Math.cos(angleVer)),
					Math.sin(angleVer),
					Math.cos(angleHor) * (radius - Math.cos(angleVer))).
				setNormalB(
					Math.sin(angleHor) * -Math.cos(angleVer),
					Math.sin(angleVer),
					Math.cos(angleHor) * -Math.cos(angleVer)).
				setUTangentB(Math.cos(angleHor), 0, -Math.sin(angleHor)).
				setVTangentB(
					Math.sin(angleHor) * Math.sin(angleVer),
					Math.cos(angleVer),
					Math.cos(angleHor) * Math.sin(angleVer)).
				setTexCoordB(j / subdivisionsHor, i / subdivisionsVer);
		}
	}
}

ae.mesh._computeUVSphereIndices = function(
		subdivisionsHor: number,
		subdivisionsVer: number,
		mb:              ae.mesh.MeshBuilder) {
	
	for(let i = 0; i < subdivisionsVer; i++)
		for(let j = 0; j < subdivisionsHor; j++)
			mb.addPolygonB(
				0,
				 i      * (subdivisionsHor + 1) +  j,
				 i      * (subdivisionsHor + 1) + (j + 1),
				(i + 1) * (subdivisionsHor + 1) + (j + 1),
				(i + 1) * (subdivisionsHor + 1) +  j);
}

ae.mesh._computeUVSphereVertices = function(
		subdivisionsHor: number,
		subdivisionsVer: number,
		mb:              ae.mesh.MeshBuilder) {
	
	for(let i = 0; i <= subdivisionsVer; i++) {
		for(let j = 0; j <= subdivisionsHor; j++) {
			
			const angleHor = 2.0 * Math.PI *  j / subdivisionsHor;
			const angleVer =       Math.PI * (i / subdivisionsVer - 0.5);

			const x = Math.cos(angleVer) * Math.sin(angleHor);
			const y = Math.sin(angleVer);
			const z = Math.cos(angleVer) * Math.cos(angleHor);

			mb.getVertex(i * (subdivisionsHor + 1) + j).
				setPositionB(x, y, z).
				setNormalB  (x, y, z).
				setUTangentB(Math.cos(angleHor), 0, -Math.sin(angleHor)).
				setVTangentB(
					Math.sin(angleVer) * -Math.sin(angleHor),
					Math.cos(angleVer),
					Math.sin(angleVer) * -Math.cos(angleHor)).
				setTexCoordB(2 * j / subdivisionsHor, i / subdivisionsVer);
		}
	}
}

ae.mesh._createRoundMesh = function(
		vertexCount: number,
		flat:        boolean,
		initializer: Consumer<ae.mesh.MeshBuilder>): ae.mesh.MeshBuilder {
	
	const mb = new ae.mesh.MeshBuilder().allocateVertices(vertexCount);
	
	initializer(mb);
	
	if(flat) mb.makeFlat().computeNormals();
	mb.cullFacing = true;
	
	return mb.seal();
}

ae.mesh.createCubeA = function(... _r: Array<void>): ae.mesh.MeshBuilder {
	
	return new ae.mesh.MeshBuilder().
		allocateVertices     (ae.mesh._CUBE_POSITIONS.length).
		allocateTriangles    (12).
		activeCullFaceSupport().
		fillVertexData       ((vertex, index) => vertex.
			setPositionA(ae.mesh._CUBE_POSITIONS[index]).
			setNormalA  (ae.mesh._CUBE_NORMALS  [index]).
			setUTangentA(ae.mesh._CUBE_UTANGENTS[index]).
			setVTangentA(ae.mesh._CUBE_VTANGENTS[index]).
			setTexCoordA(ae.mesh._CUBE_TEXCOORDS[index])).
		createDefaultQuads();
}

ae.mesh.createCubeB = function(
		size:     number,
		centered: boolean): ae.mesh.MeshBuilder {
	
	return ae.mesh.createCubeC(size, size, size, centered);
}

ae.mesh.createCubeC = function(
		width:    number,
		height:   number,
		length:   number,
		centered: boolean): ae.mesh.MeshBuilder {
	
	const t = centered ? -0.5 : 0;
	
	return ae.mesh.createCubeA().
		transformPositions(new ae.math.Matrix4D().
			scaleB(width, height, length).
			translate(t, t, t));
}

ae.mesh.createCylinderA = function(
		subdivisions: number,
		flat:         boolean): ae.mesh.MeshBuilder {
	
	return ae.mesh._createRoundMesh(
		2 * subdivisions + 2 * (subdivisions + 1), flat, (mb) => {
			ae.mesh._computeDiscData         (subdivisions, 0, 1, 0,          mb);
			ae.mesh._computeCylinderShellData(subdivisions, 2 * subdivisions, mb);
		});
}

ae.mesh.createCylinderB = function(
		subdivisions: number,
		radius:       number,
		height:       number,
		flat:         boolean): ae.mesh.MeshBuilder {
	
	return ae.mesh.createCylinderC(subdivisions, radius, radius, height, flat);
}

ae.mesh.createCylinderC = function(
		subdivisions: number,
		rx:           number,
		rz:           number,
		height:       number,
		flat:         boolean): ae.mesh.MeshBuilder {
	
	return ae.mesh.createCylinderA(subdivisions, flat).
		transformPositions(new ae.math.Matrix4D().scaleB(rx, height, rz));
}

ae.mesh.createCylinderShellA = function(
		subdivisions: number,
		flat:         boolean): ae.mesh.MeshBuilder {
	
	return ae.mesh._createRoundMesh(
		2 * (subdivisions + 1), flat,
		(mb) => ae.mesh._computeCylinderShellData(subdivisions, 0, mb));
}

ae.mesh.createCylinderShellB = function(
		subdivisions: number,
		radius:       number,
		height:       number,
		flat:         boolean): ae.mesh.MeshBuilder {
	
	return ae.mesh.createCylinderShellC(
		subdivisions, radius, radius, height, flat);
}

ae.mesh.createCylinderShellC = function(
		subdivisions: number,
		rx:           number,
		rz:           number,
		height:       number,
		flat:         boolean): ae.mesh.MeshBuilder {
	
	return ae.mesh.createCylinderShellA(subdivisions, flat).
		transformPositions(new ae.math.Matrix4D().scaleB(rx, height, rz));
}

ae.mesh.createDiscA = function(subdivisions: number) {
	return ae.mesh._createRoundMesh(
		2 * subdivisions, false,
		(mb) => ae.mesh._computeDiscData(subdivisions, 0, 0, 0, mb));
}

ae.mesh.createDiscB = function(
		subdivisions: number,
		radius:       number): ae.mesh.MeshBuilder {
	
	return ae.mesh.createDiscC(subdivisions, radius, radius);
}

ae.mesh.createDiscC = function(
		subdivisions: number,
		rx:           number,
		rz:           number): ae.mesh.MeshBuilder {
	
	return ae.mesh.createDiscA(subdivisions).
		transformPositions(new ae.math.Matrix4D().scaleB(rx, 1, rz));
}

ae.mesh.createQuadA = function(): ae.mesh.MeshBuilder {
	
	return new ae.mesh.MeshBuilder().
		allocateVertices     (ae.mesh._QUAD_POSITIONS.length).
		allocateTriangles    (4).
		activeCullFaceSupport().
		fillVertexData       ((vertex, index) => vertex.
			setPositionA(ae.mesh._QUAD_POSITIONS[index]).
			setNormalA  (ae.mesh._QUAD_NORMALS  [index]).
			setUTangentA(ae.mesh._QUAD_UTANGENTS[index]).
			setVTangentA(ae.mesh._QUAD_VTANGENTS[index]).
			setTexCoordA(ae.mesh._QUAD_TEXCOORDS[index])).
		createDefaultQuads();
}

ae.mesh.createQuadB = function(
		size:     number,
		centered: boolean): ae.mesh.MeshBuilder {
	
	return ae.mesh.createQuadC(size, size, centered);
}

ae.mesh.createQuadC = function(
		width:    number,
		length:   number,
		centered: boolean): ae.mesh.MeshBuilder {
	
	const t = centered ? -0.5 : 0;
	
	return ae.mesh.createQuadA().transformPositions(
		new ae.math.Matrix4D().scaleB(width, 1, length).translate(t, 0, t));
}

ae.mesh.createTorusA = function(
		subdivisionsHor: number,
		subdivisionsVer: number,
		flat:            boolean): ae.mesh.MeshBuilder {
	
	return ae.mesh.createTorusB(subdivisionsHor, subdivisionsVer, 2, flat);
}

ae.mesh.createTorusB = function(
		subdivisionsHor: number,
		subdivisionsVer: number,
		radius:          number,
		flat:            boolean): ae.mesh.MeshBuilder {
	
	return ae.mesh._createRoundMesh(
		(subdivisionsHor + 1) * (subdivisionsVer + 1), flat, (mb) => {
			ae.mesh._computeTorusIndices (
				subdivisionsHor, subdivisionsVer,         mb);
			ae.mesh._computeTorusVertices(
				subdivisionsHor, subdivisionsVer, radius, mb);
	});
}

ae.mesh.createTorusC = function(
		subdivisionsHor: number,
		subdivisionsVer: number,
		R:               number,
		rHor:            number,
		rVer:            number,
		flat:            boolean): ae.mesh.MeshBuilder {
	
	// The radius is set to preserve the ratio R/rHor
	return ae.mesh.createTorusB(
			subdivisionsHor, subdivisionsVer, R / rHor, flat).
		transformPositions(new ae.math.Matrix4D().scaleB(rHor, rVer, rHor));
}

ae.mesh.createUVSphereA = function(
		subdivisions: number,
		flat:         boolean): ae.mesh.MeshBuilder {
	
	return ae.mesh.createUVSphereB(subdivisions, subdivisions / 2, flat);
}

ae.mesh.createUVSphereB = function(
		subdivisionsHor: number,
		subdivisionsVer: number,
		flat:            boolean): ae.mesh.MeshBuilder {
	
	return ae.mesh._createRoundMesh(
		(subdivisionsHor + 1) * (subdivisionsVer + 1), flat, (mb) => {
			ae.mesh._computeUVSphereIndices (
				subdivisionsHor, subdivisionsVer, mb);
			ae.mesh._computeUVSphereVertices(
				subdivisionsHor, subdivisionsVer, mb);
		});
}

ae.mesh.createUVSphereC = function(
		subdivisions: number,
		radius:       number,
		flat:         boolean): ae.mesh.MeshBuilder {
	
	return ae.mesh.createUVSphereD(subdivisions, radius, radius, radius, flat);
}

ae.mesh.createUVSphereD = function(
		subdivisions: number,
		rx:           number,
		ry:           number,
		rz:           number,
		flat:         boolean): ae.mesh.MeshBuilder {
	
	return ae.mesh.createUVSphereA(subdivisions, flat).
		transformPositions(new ae.math.Matrix4D().scaleB(rx, ry, rz));
}

ae.mesh.createUVSphereE = function(
		subdivisionsHor: number,
		subdivisionsVer: number,
		radius:          number,
		flat:            boolean): ae.mesh.MeshBuilder {
	
	return ae.mesh.createUVSphereF(
		subdivisionsHor, subdivisionsVer, radius, radius, radius, flat);
}

ae.mesh.createUVSphereF = function(
		subdivisionsHor: number,
		subdivisionsVer: number,
		rx:              number,
		ry:              number,
		rz:              number,
		flat:            boolean): ae.mesh.MeshBuilder {
	
	return ae.mesh.createUVSphereB(subdivisionsHor, subdivisionsVer, flat).
		transformPositions(new ae.math.Matrix4D().scaleB(rx, ry, rz));
}