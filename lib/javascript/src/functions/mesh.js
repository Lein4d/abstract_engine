
function aeFuncComputeCylinderShellData(
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
	
	ae.mesh._p.computeDiscVertices(subdivisions, 0, vOffset,            false, mb);
	ae.mesh._p.computeDiscVertices(subdivisions, 1, vOffset + ringSize, false, mb);
	
	for(let i = 0; i < ringSize; i++) {
		mb.getVertex(vOffset            + i).setTexCoordB(i / subdivisions, 0);
		mb.getVertex(vOffset + ringSize + i).setTexCoordB(i / subdivisions, 1);
	}
}

function aeFuncComputeDiscData(
		subdivisions: number,
		posY1:        number,
		posY2:        number,
		vOffset:      number,
		mb:           ae.mesh.MeshBuilder) {
	
	// Indices of down-facing cap
	ae.mesh._p.computeDiscIndices(
		subdivisions, vOffset,                true, false, mb);
	// Indices of up-facing cap
	ae.mesh._p.computeDiscIndices(
		subdivisions, vOffset + subdivisions, true, true,  mb);
	
	// Vertices of down-facing cap
	ae.mesh._p.computeDiscVertices(
		subdivisions, posY1, vOffset,                true, mb);
	// Vertices of up-facing cap
	ae.mesh._p.computeDiscVertices(
		subdivisions, posY2, vOffset + subdivisions, true, mb);
	
	// Fill TBN data
	for(let i = 0; i < subdivisions; i++) {
		mb.getVertex(vOffset                + i).
			setNormalB(0, -1, 0).setUTangentB(1, 0, 0).setVTangentB(0, 0, 1);
		mb.getVertex(vOffset + subdivisions + i).
			setNormalB(0,  1, 0).setUTangentB(1, 0, 0).setVTangentB(0, 0, 1);
	}
}

function aeFuncComputeDiscIndices(
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

function aeFuncComputeDiscVertices(
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

function aeFuncComputeTorusIndices(
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

function aeFuncComputeTorusVertices(
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

function aeFuncComputeUVSphereIndices(
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

function aeFuncComputeUVSphereVertices(
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

function aeFuncCreateRoundMesh(
		vertexCount: number,
		flat:        boolean,
		initializer: Consumer<ae.mesh.MeshBuilder>): ae.mesh.MeshBuilder {
	
	const mb = new ae.mesh.MeshBuilder().allocateVertices(vertexCount);
	
	initializer(mb);
	
	if(flat) mb.makeFlat().computeNormals();
	mb.cullFacing = true;
	
	return mb.seal();
}

function aeFuncCreateCubeA(... _r: Array<void>): ae.mesh.MeshBuilder {
	
	return new ae.mesh.MeshBuilder().
		allocateVertices     (ae.mesh._p.CUBE_POSITIONS.length).
		allocateTriangles    (12).
		activeCullFaceSupport().
		fillVertexData       ((vertex, index) => vertex.
			setPositionA(ae.mesh._p.CUBE_POSITIONS[index]).
			setNormalA  (ae.mesh._p.CUBE_NORMALS  [index]).
			setUTangentA(ae.mesh._p.CUBE_UTANGENTS[index]).
			setVTangentA(ae.mesh._p.CUBE_VTANGENTS[index]).
			setTexCoordA(ae.mesh._p.CUBE_TEXCOORDS[index])).
		createDefaultQuads();
}

function aeFuncCreateCubeB(
		size:     number,
		centered: boolean): ae.mesh.MeshBuilder {
	
	return ae.mesh.createCubeC(size, size, size, centered);
}

function aeFuncCreateCubeC(
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

function aeFuncCreateCylinderA(
		subdivisions: number,
		flat:         boolean): ae.mesh.MeshBuilder {
	
	return ae.mesh._p.createRoundMesh(
		2 * subdivisions + 2 * (subdivisions + 1), flat, (mb) => {
			ae.mesh._p.computeDiscData         (subdivisions, 0, 1, 0,          mb);
			ae.mesh._p.computeCylinderShellData(subdivisions, 2 * subdivisions, mb);
		});
}

function aeFuncCreateCylinderB(
		subdivisions: number,
		radius:       number,
		height:       number,
		flat:         boolean): ae.mesh.MeshBuilder {
	
	return ae.mesh.createCylinderC(subdivisions, radius, radius, height, flat);
}

function aeFuncCreateCylinderC(
		subdivisions: number,
		rx:           number,
		rz:           number,
		height:       number,
		flat:         boolean): ae.mesh.MeshBuilder {
	
	return ae.mesh.createCylinderA(subdivisions, flat).
		transformPositions(new ae.math.Matrix4D().scaleB(rx, height, rz));
}

function aeFuncCreateCylinderShellA(
		subdivisions: number,
		flat:         boolean): ae.mesh.MeshBuilder {
	
	return ae.mesh._p.createRoundMesh(
		2 * (subdivisions + 1), flat,
		(mb) => ae.mesh._p.computeCylinderShellData(subdivisions, 0, mb));
}

function aeFuncCreateCylinderShellB(
		subdivisions: number,
		radius:       number,
		height:       number,
		flat:         boolean): ae.mesh.MeshBuilder {
	
	return ae.mesh.createCylinderShellC(
		subdivisions, radius, radius, height, flat);
}

function aeFuncCreateCylinderShellC(
		subdivisions: number,
		rx:           number,
		rz:           number,
		height:       number,
		flat:         boolean): ae.mesh.MeshBuilder {
	
	return ae.mesh.createCylinderShellA(subdivisions, flat).
		transformPositions(new ae.math.Matrix4D().scaleB(rx, height, rz));
}

function aeFuncCreateDiscA(subdivisions: number) {
	return ae.mesh._p.createRoundMesh(
		2 * subdivisions, false,
		(mb) => ae.mesh._p.computeDiscData(subdivisions, 0, 0, 0, mb));
}

function aeFuncCreateDiscB(
		subdivisions: number,
		radius:       number): ae.mesh.MeshBuilder {
	
	return ae.mesh.createDiscC(subdivisions, radius, radius);
}

function aeFuncCreateDiscC(
		subdivisions: number,
		rx:           number,
		rz:           number): ae.mesh.MeshBuilder {
	
	return ae.mesh.createDiscA(subdivisions).
		transformPositions(new ae.math.Matrix4D().scaleB(rx, 1, rz));
}

function aeFuncCreateQuadA(): ae.mesh.MeshBuilder {
	
	return new ae.mesh.MeshBuilder().
		allocateVertices     (ae.mesh._p.QUAD_POSITIONS.length).
		allocateTriangles    (4).
		activeCullFaceSupport().
		fillVertexData       ((vertex, index) => vertex.
			setPositionA(ae.mesh._p.QUAD_POSITIONS[index]).
			setNormalA  (ae.mesh._p.QUAD_NORMALS  [index]).
			setUTangentA(ae.mesh._p.QUAD_UTANGENTS[index]).
			setVTangentA(ae.mesh._p.QUAD_VTANGENTS[index]).
			setTexCoordA(ae.mesh._p.QUAD_TEXCOORDS[index])).
		createDefaultQuads();
}

function aeFuncCreateQuadB(
		size:     number,
		centered: boolean): ae.mesh.MeshBuilder {
	
	return ae.mesh.createQuadC(size, size, centered);
}

function aeFuncCreateQuadC(
		width:    number,
		length:   number,
		centered: boolean): ae.mesh.MeshBuilder {
	
	const t = centered ? -0.5 : 0;
	
	return ae.mesh.createQuadA().transformPositions(
		new ae.math.Matrix4D().scaleB(width, 1, length).translate(t, 0, t));
}

function aeFuncCreateTorusA(
		subdivisionsHor: number,
		subdivisionsVer: number,
		flat:            boolean): ae.mesh.MeshBuilder {
	
	return ae.mesh.createTorusB(subdivisionsHor, subdivisionsVer, 2, flat);
}

function aeFuncCreateTorusB(
		subdivisionsHor: number,
		subdivisionsVer: number,
		radius:          number,
		flat:            boolean): ae.mesh.MeshBuilder {
	
	return ae.mesh._p.createRoundMesh(
		(subdivisionsHor + 1) * (subdivisionsVer + 1), flat, (mb) => {
			ae.mesh._p.computeTorusIndices (
				subdivisionsHor, subdivisionsVer,         mb);
			ae.mesh._p.computeTorusVertices(
				subdivisionsHor, subdivisionsVer, radius, mb);
	});
}

function aeFuncCreateTorusC(
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

function aeFuncCreateUVSphereA(
		subdivisions: number,
		flat:         boolean): ae.mesh.MeshBuilder {
	
	return ae.mesh.createUVSphereB(subdivisions, subdivisions / 2, flat);
}

function aeFuncCreateUVSphereB(
		subdivisionsHor: number,
		subdivisionsVer: number,
		flat:            boolean): ae.mesh.MeshBuilder {
	
	return ae.mesh._p.createRoundMesh(
		(subdivisionsHor + 1) * (subdivisionsVer + 1), flat, (mb) => {
			ae.mesh._p.computeUVSphereIndices (
				subdivisionsHor, subdivisionsVer, mb);
			ae.mesh._p.computeUVSphereVertices(
				subdivisionsHor, subdivisionsVer, mb);
		});
}

function aeFuncCreateUVSphereC(
		subdivisions: number,
		radius:       number,
		flat:         boolean): ae.mesh.MeshBuilder {
	
	return ae.mesh.createUVSphereD(subdivisions, radius, radius, radius, flat);
}

function aeFuncCreateUVSphereD(
		subdivisions: number,
		rx:           number,
		ry:           number,
		rz:           number,
		flat:         boolean): ae.mesh.MeshBuilder {
	
	return ae.mesh.createUVSphereA(subdivisions, flat).
		transformPositions(new ae.math.Matrix4D().scaleB(rx, ry, rz));
}

function aeFuncCreateUVSphereE(
		subdivisionsHor: number,
		subdivisionsVer: number,
		radius:          number,
		flat:            boolean): ae.mesh.MeshBuilder {
	
	return ae.mesh.createUVSphereF(
		subdivisionsHor, subdivisionsVer, radius, radius, radius, flat);
}

function aeFuncCreateUVSphereF(
		subdivisionsHor: number,
		subdivisionsVer: number,
		rx:              number,
		ry:              number,
		rz:              number,
		flat:            boolean): ae.mesh.MeshBuilder {
	
	return ae.mesh.createUVSphereB(subdivisionsHor, subdivisionsVer, flat).
		transformPositions(new ae.math.Matrix4D().scaleB(rx, ry, rz));
}