
// ae.mesh.MeshBuilder$Adjacency
class AEClassAdjacency extends AEClassJavaObject {
		
	_data:              Array<Array<number>>;
	_maxAdjacencyCount: number;
	
	constructor(mb: ae.mesh.MeshBuilder) {
		
		super();
		
		mb._assertTrianglesSealed();
		
		this._data              = Array(mb._vertices.length);
		this._maxAdjacencyCount = 0;
		
		const vertexCount    = mb.vertexCount;
		const adjacencyCount = Array(vertexCount);
		
		// Pass 1: Count the adjacency polygons for each vertex
		for(let i = 0; i < mb._triangles.length; i++)
			for(let j = 0; j < 3; j++)
				adjacencyCount[mb._triangles[i]._vIndices[j]]++;
		
		// Pass 2: Create the adjacency arrays
		for(let i = 0; i < vertexCount; i++) {
			this._data[i]           = Array(adjacencyCount[i]);
			this._maxAdjacencyCount =
				Math.max(this._maxAdjacencyCount, adjacencyCount[i]);
		}
		
		// Pass 3: Initialize the adjacency arrays
		// Use the previous computed adjacency count to determine the slot that
		// is written next by decrementing the counter each time
		for(let i = 0; i < mb._triangles.length; i++) {
			const vIndices = mb._triangles[i]._vIndices;
			for(let j = 0; j < 3; j++) {
				adjacencyCount[j]--;
				this._data[j][adjacencyCount[vIndices[j]]] = i;
			}
		}
	}
}
