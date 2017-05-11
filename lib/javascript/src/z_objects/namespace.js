
const _ae = {
	
	core: {
		
		// Classes
		GlslShader:  AEClassGlslShader,
		PixelFormat: AEClassPixelFormat,
	},
	
	mat: {
		
		// Classes
		GlslType:           AEClassGlslType,
		MatCustomParam:     AEClassMatCustomParam,
		MatCustomTexture:   AEClassMatCustomTexture,
		MatBuiltInFunction: AEClassMatBuiltInFunction,
		MatBuiltInVariable: AEClassMatBuiltInVariable,
		MatValue:           AEClassMatValue,
		SPAttribute:        AEClassSPAttribute,
		SPCustomParam:      AEClassSPCustomParam,
		SPCustomTexture:    AEClassSPCustomTexture,
		SPFunction:         AEClassSPFunction,
		SPLocalVariable:    AEClassSPLocalVariable,
		SPComponent:        AEClassSPComponent,
		SPUniform:          AEClassSPUniform,
		SPUniformFS:        AEClassSPUniformFS,
		SPUniformVS:        AEClassSPUniformVS,
		SPVarying:          AEClassSPVarying,
	},
	
	SG_ERROR_NOT_STATIC:     "Scope transformations must be static",
	SG_ERROR_MULTI_INSTANCE: "Only one instance is allowed",
};

Object.freeze(_ae.core);
Object.freeze(_ae.mat);
Object.freeze(_ae);

const ae = {
	
	JavaObject: AEClassJavaObject,
	
	col: {
		
		_p: {
			
			HMKeyIterator:   AEClassHMKeyIterator,
			HMValueIterator: AEClassHMValueIterator,
			
			LL_NODE_POOL: AEClassDynamicPool.createNodePoolA(true),
			HM_KVP_POOL:
				new AEClassDynamicPool(true, () => new AEClassKeyValuePair()),
		},
		
		// Classes
		DynamicPool:      AEClassDynamicPool,
		GrowingPool:      AEClassGrowingPool,
		KeyValuePair:     AEClassKeyValuePair,
		LinkedListNode:   AEClassLinkedListNode,
		Pool:             AEClassPool,
		PooledCollection: AEClassPooledCollection,
		PooledHashMap:    AEClassPooledHashMap,
		PooledHashSet:    AEClassPooledHashSet,
		PooledLinkedList: AEClassPooledLinkedList,
		PooledOrderedSet: AEClassPooledOrderedSet,
		PooledQueue:      AEClassPooledQueue,
	},
	
	core: {
		
		_p: {
			RenderState: AEClassRenderState,
			UnrollError: AEClassUnrollError,
			UpdateEvent: AEClassUpdateEvent,
		},
		
		AbstractEngine: AEClassAbstractEngine,
		SceneGraph:     AEClassSceneGraph,
		Texture:        AEClassTexture,
		TextureBuilder: AEClassTextureBuilder,
	},
	
	event: {
		
		Event:          AEClassEvent,
		Listener:       AEClassListener, // implemented in Event.js
		NotifyEvent:    AEClassNotifyEvent,
		SignalEndPoint: AEClassSignalEndPoint,
		SignalSource:   AEClassSignalSource,
	},
	
	mat: {
		
		// Classes
		CustomSignature: AEClassCustomSignature,
		Material:        AEClassMaterial,
		MaterialBuilder: AEClassMaterialBuilder,
		Node:            AEClassNode,
		NodeTemplate:    AEClassNodeTemplate,
		SignatureGroup:  AEClassSignatureGroup,
		
		// Enums
		GlslType:     _aeEnumGlslType,
		GlslTypeBase: _aeEnumGlslTypeBase,
		
		// Functions
		getGlslType: aeFuncGetGlslType,
		
		// Constants
		SIG_GROUP_FLOAT_N_IN_N_OUT:  _AE_SG_FLOAT_N_IN_N_OUT,
		SIG_GROUP_FLOAT_N_IN_1_OUT:  _AE_SG_FLOAT_N_IN_1_OUT,
		SIG_GROUP_FLOAT_2N_IN_N_OUT: _AE_SG_FLOAT_2N_IN_N_OUT,
		SIG_GROUP_FLOAT_2N_IN_1_OUT: _AE_SG_FLOAT_2N_IN_1_OUT,
		SIG_GROUP_FLOAT_3N_IN_N_OUT: _AE_SG_FLOAT_3N_IN_N_OUT,
		SIG_GROUP_FLOAT_3N_IN_1_OUT: _AE_SG_FLOAT_3N_IN_1_OUT,
	},
	
	math: {
		
		// Classes
		Axis:            AEClassAxis,
		Matrix4D:        AEClassMatrix4D,
		MatrixVector:    AEClassMatrixVector,
		ReadOnlyBackend: AEClassReadOnlyBackend,
		RelativePoint:   AEClassRelativePoint,
		RelativeVector:  AEClassRelativeVector,
		SignedAxis:      AEClassSignedAxis,
		StaticBackend:   AEClassStaticBackend,
		Vector3D:        AEClassVector3D,
		Vector4D:        AEClassVector4D,
		VectorBackend:   AEClassVectorBackend,
		
		// Unit vectors defined as 3D vectors
		X_POS: AEClassVector3D.createConstB( 1,  0,  0),
		X_NEG: AEClassVector3D.createConstB(-1,  0,  0),
		Y_POS: AEClassVector3D.createConstB( 0,  1,  0),
		Y_NEG: AEClassVector3D.createConstB( 0, -1,  0),
		Z_POS: AEClassVector3D.createConstB( 0,  0,  1),
		Z_NEG: AEClassVector3D.createConstB( 0,  0, -1),

		// Colors defined as 4D vectors
		BLACK : AEClassVector4D.createConstB(0,       1),
		GREY  : AEClassVector4D.createConstB(0.5,     1),
		WHITE : AEClassVector4D.createConstB(1,       1),
		RED   : AEClassVector4D.createConstC(1, 0, 0, 1),
		GREEN : AEClassVector4D.createConstC(0, 1, 0, 1),
		BLUE  : AEClassVector4D.createConstC(0, 0, 1, 1),
		YELLOW: AEClassVector4D.createConstC(1, 1, 0, 1),
		PURPLE: AEClassVector4D.createConstC(1, 0, 1, 1),
		CYAN  : AEClassVector4D.createConstC(0, 1, 1, 1),
	},
	
	mesh: {
		
		_p: {
			
			// Private functions
			computeCylinderShellData: aeFuncComputeCylinderShellData,
			computeDiscData:          aeFuncComputeDiscData,
			computeDiscIndices:       aeFuncComputeDiscIndices,
			computeDiscVertices:      aeFuncComputeDiscVertices,
			computeTorusIndices:      aeFuncComputeTorusIndices,
			computeTorusVertices:     aeFuncComputeTorusVertices,
			computeUVSphereIndices:   aeFuncComputeUVSphereIndices,
			computeUVSphereVertices:  aeFuncComputeUVSphereVertices,
			createRoundMesh:          aeFuncCreateRoundMesh,
			
			// Private constants
			QUAD_POSITIONS: [
				[0,0,0],[1,0,0],[1,0,1],[0,0,1],
				[0,0,0],[0,0,1],[1,0,1],[1,0,0]],

			QUAD_NORMALS: [
				[ 0,-1, 0],[ 0,-1, 0],[ 0,-1, 0],[ 0,-1, 0],
				[ 0, 1, 0],[ 0, 1, 0],[ 0, 1, 0],[ 0, 1, 0]],

			QUAD_UTANGENTS: [
				[ 1, 0, 0],[ 1, 0, 0],[ 1, 0, 0],[ 1, 0, 0],
				[ 1, 0, 0],[ 1, 0, 0],[ 1, 0, 0],[ 1, 0, 0]],

			QUAD_VTANGENTS: [
				[ 0, 0, 1],[ 0, 0, 1],[ 0, 0, 1],[ 0, 0, 1],
				[ 0, 0, 1],[ 0, 0, 1],[ 0, 0, 1],[ 0, 0, 1]],

			QUAD_TEXCOORDS: [
				[0,0],[1,0],[1,1],[0,1],
				[0,0],[0,1],[1,1],[1,0]],

			CUBE_POSITIONS: [
				[0,0,0],[0,1,0],[1,1,0],[1,0,0],  // front
				[1,0,0],[1,1,0],[1,1,1],[1,0,1],  // right
				[1,0,1],[1,1,1],[0,1,1],[0,0,1],  // back
				[0,0,1],[0,1,1],[0,1,0],[0,0,0],  // left
				[0,0,0],[1,0,0],[1,0,1],[0,0,1],  // bottom
				[0,1,0],[0,1,1],[1,1,1],[1,1,0]], // top

			CUBE_NORMALS: [
				[ 0, 0,-1],[ 0, 0,-1],[ 0, 0,-1],[ 0, 0,-1],  // front
				[ 1, 0, 0],[ 1, 0, 0],[ 1, 0, 0],[ 1, 0, 0],  // right
				[ 0, 0, 1],[ 0, 0, 1],[ 0, 0, 1],[ 0, 0, 1],  // back
				[-1, 0, 0],[-1, 0, 0],[-1, 0, 0],[-1, 0, 0],  // left
				[ 0,-1, 0],[ 0,-1, 0],[ 0,-1, 0],[ 0,-1, 0],  // bottom
				[ 0, 1, 0],[ 0, 1, 0],[ 0, 1, 0],[ 0, 1, 0]], // top

			CUBE_UTANGENTS: [
				[ 1, 0, 0],[ 1, 0, 0],[ 1, 0, 0],[ 1, 0, 0],  // front
				[ 0, 0, 1],[ 0, 0, 1],[ 0, 0, 1],[ 0, 0, 1],  // right
				[-1, 0, 0],[-1, 0, 0],[-1, 0, 0],[-1, 0, 0],  // back
				[ 0, 0,-1],[ 0, 0,-1],[ 0, 0,-1],[ 0, 0,-1],  // left 
				[ 1, 0, 0],[ 1, 0, 0],[ 1, 0, 0],[ 1, 0, 0],  // bottom
				[ 1, 0, 0],[ 1, 0, 0],[ 1, 0, 0],[ 1, 0, 0]], // top

			CUBE_VTANGENTS: [
				[ 0, 1, 0],[ 0, 1, 0],[ 0, 1, 0],[ 0, 1, 0],  // front
				[ 0, 1, 0],[ 0, 1, 0],[ 0, 1, 0],[ 0, 1, 0],  // right
				[ 0, 1, 0],[ 0, 1, 0],[ 0, 1, 0],[ 0, 1, 0],  // back
				[ 0, 1, 0],[ 0, 1, 0],[ 0, 1, 0],[ 0, 1, 0],  // left
				[ 0, 0, 1],[ 0, 0, 1],[ 0, 0, 1],[ 0, 0, 1],  // bottom
				[ 0, 0, 1],[ 0, 0, 1],[ 0, 0, 1],[ 0, 0, 1]], // top

			CUBE_TEXCOORDS: [
				[0,0],[0,1],[1,1],[1,0],  // front
				[0,0],[0,1],[1,1],[1,0],  // right
				[0,0],[0,1],[1,1],[1,0],  // back
				[0,0],[0,1],[1,1],[1,0],  // left
				[0,0],[1,0],[1,1],[0,1],  // bottom
				[0,0],[0,1],[1,1],[1,0]], // top
			
			// Function used for fast normal computation in the meshes
			ACOS: new AEClassSampledFunction(10000, -1, 1, (x) => Math.acos(x)),
		},
		
		// Classes
		Adjacency:   AEClassAdjacency,
		Mesh:        AEClassMesh,
		MeshBuilder: AEClassMeshBuilder,
		Triangle:    AEClassTriangle,
		Vertex:      AEClassVertex,
		
		// Functions
		createCubeA:          aeFuncCreateCubeA,
		createCubeB:          aeFuncCreateCubeB,
		createCubeC:          aeFuncCreateCubeC,
		createCylinderA:      aeFuncCreateCylinderA,
		createCylinderB:      aeFuncCreateCylinderB,
		createCylinderC:      aeFuncCreateCylinderC,
		createCylinderShellA: aeFuncCreateCylinderShellA,
		createCylinderShellB: aeFuncCreateCylinderShellB,
		createCylinderShellC: aeFuncCreateCylinderShellC,
		createDiscA:          aeFuncCreateDiscA,
		createDiscB:          aeFuncCreateDiscB,
		createDiscC:          aeFuncCreateDiscC,
		createQuadA:          aeFuncCreateQuadA,
		createQuadB:          aeFuncCreateQuadB,
		createQuadC:          aeFuncCreateQuadC,
		createTorusA:         aeFuncCreateTorusA,
		createTorusB:         aeFuncCreateTorusB,
		createTorusC:         aeFuncCreateTorusC,
		createUVSphereA:      aeFuncCreateUVSphereA,
		createUVSphereB:      aeFuncCreateUVSphereB,
		createUVSphereC:      aeFuncCreateUVSphereC,
		createUVSphereD:      aeFuncCreateUVSphereD,
		createUVSphereE:      aeFuncCreateUVSphereE,
		createUVSphereF:      aeFuncCreateUVSphereF,
		
		_VERTEX_SIZE: 32,
	},
	
	sg: {
		
		Attribute:        AEClassAttribute,
		Camera:           AEClassCamera,
		CModeAdaptiveFOV: AEClassCModeAdaptiveFOV,
		CModeFixedHorFOV: AEClassCModeFixedHorFOV,
		CModeFixedVerFOV: AEClassCModeFixedVerFOV,
		ConstAttribute:   AEClassConstAttribute,
		DynamicSpace:     AEClassDynamicSpace,
		Entity:           AEClassEntity,
		Instance:         AEClassInstance,
		Marker:           AEClassMarker,
		Model:            AEClassModel,
		
		EntityType: _aeEnumEntityType,
		
		RATIO_SQUARE: 1,
		RATIO_3_2:    3 / 2,
		RATIO_4_3:    4 / 3,
		RATIO_16_9:   16 / 9,
		RATIO_21_9:   21 / 9,
	},
	
	util: {
		
		// Classes
		CachedObject:    AEClassCachedObject,
		GrowingList:     AEClassGrowingList,
		Integer:         AEClassInteger,
		SampledFunction: AEClassSampledFunction,
		String:          AEClassString,
		
		// Functions
		assert: aeFuncAssert,
		assertNotNull: aeFuncAssertNotNull,
		assertNull: aeFuncAssertNull,
		checkArrayCopyConsistency: aeFuncCheckArrayCopyConsistency,
		clamp: aeFuncClamp,
		clampArrayAccess: aeFuncClampArrayAccess,
		cloneArray1D: aeFuncCloneArray1D,
		cloneArray2D: aeFuncCloneArray2D,
		cloneArray3D: aeFuncCloneArray3D,
		copy1DimArray: aeFuncCopy1DimArray,
		copy2DimArray: aeFuncCopy2DimArray,
		create2DimArray: aeFuncCreate2DimArray,
		create3DimArray: aeFuncCreate3DimArray,
		map: aeFuncMap,
		mix: aeFuncMix,
		mixRev: aeFuncMixRev,
		randInt: aeFuncRandInt,
		toDegrees: aeFuncToDegrees,
		toRadians: aeFuncToRadians,
	},
	
	VERSION_MAJOR:    0,
	VERSION_MINOR:    9,
	VERSION_REVISION: 0,

	RAD_FACTOR: Math.PI / 180,
	DEG_FACTOR: 180 / Math.PI,

	EXCEPTION_ABSTRACT_METHOD: "Unimplemented abstract method",
	
	// I_Mij = index of entry in row i and column j
	I_M11:  0,
	I_M12:  4,
	I_M13:  8,
	I_M14: 12,
	I_M21:  1,
	I_M22:  5,
	I_M23:  9,
	I_M24: 13,
	I_M31:  2,
	I_M32:  6,
	I_M33: 10,
	I_M34: 14,
	I_M41:  3,
	I_M42:  7,
	I_M43: 11,
	I_M44: 15,

	// I_NMij = index of entry in row i and column j (normal matrix)
	I_NM11: 0,
	I_NM12: 3,
	I_NM13: 6,
	I_NM21: 1,
	I_NM22: 4,
	I_NM23: 7,
	I_NM31: 2,
	I_NM32: 5,
	I_NM33: 8,
};

Object.freeze(ae.core._p);
Object.freeze(ae.mesh._p);
Object.freeze(ae.core);
Object.freeze(ae.math);
Object.freeze(ae.mesh);
Object.freeze(ae.util);
Object.freeze(ae);
