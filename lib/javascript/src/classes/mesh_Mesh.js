
// ae.mesh.Mesh
class AEClassMesh extends AEClassJavaObject {
	
	_vbo:     WebGLBuffer;
	_ibo:     WebGLBuffer;
	_iboType: number;
	
	vertexCount: number;
	indexCount:  number;
	textured:    boolean;
	cullFacing:  boolean;
	
	_initIbo(
			gl: WebGLRenderingContext,
			mb: ae.mesh.MeshBuilder) {
		
		let iboData;
		let tIndex = 0;
		
		if(this.vertexCount < 256) {
			this._iboType = gl.UNSIGNED_BYTE;
			iboData       = new Uint8Array(this.indexCount);
		} else if(this.vertexCount < 65536) {
			this._iboType = gl.UNSIGNED_SHORT;
			iboData       = new Uint16Array(this.indexCount);
		} else {
			
			if(!gl.getExtension("OES_element_index_uint"))
				throw "Extension 'OES_element_index_uint' not supported";
			
			this._iboType = gl.UNSIGNED_INT;
			iboData       = new Uint32Array(this.indexCount);
		}
		
		mb.forEachTriangle((triangle) => {
			iboData.set(triangle._vIndices, tIndex * 3);
			tIndex++;
		});
		
		// Initialize the IBO
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._ibo);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, iboData, gl.STATIC_DRAW);
	}

	_initVbo(
			gl: WebGLRenderingContext,
			mb: ae.mesh.MeshBuilder) {
		
		const vboData = new Float32Array(this.vertexCount * 8);
		let   vIndex  = 0;
		
		// Pack the data interleaved into the VBO buffer
		mb.forEachVertex((vertex) => {
			
			vboData.set(vertex._position, vIndex * 8 + 0);
			vboData.set(vertex._normal,   vIndex * 8 + 3);
			vboData.set(vertex._texCoord, vIndex * 8 + 6);
			
			vIndex++;
		});
		
		// Initialize the VBO
		gl.bindBuffer(gl.ARRAY_BUFFER, this._vbo);
		gl.bufferData(gl.ARRAY_BUFFER, vboData, gl.STATIC_DRAW);
	}

	constructor(
			gl: WebGLRenderingContext,
			mb: ae.mesh.MeshBuilder) {
		
		super();
		
		this._vbo = gl.createBuffer();
		this._ibo = gl.createBuffer();
		
		this.vertexCount = mb.vertexCount;
		this.indexCount  = mb.triangleCount * 3;
		this.textured    = true;
		this.cullFacing  = mb.cullFacing;
		
		this._initVbo(gl, mb);
		this._initIbo(gl, mb);
		
		// Unbind all buffers to prevent them from changes
		gl.bindBuffer(gl.ARRAY_BUFFER,         null);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
	}
	
	draw(gl: WebGLRenderingContext) {
		
		// TODO: vertexAttribPointer may be outsourced to initialization
		
		gl.bindBuffer(gl.ARRAY_BUFFER, this._vbo);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._ibo);
		
		// positions
		gl.enableVertexAttribArray(0);
		gl.vertexAttribPointer(
			0, 3, gl.FLOAT, false, ae.mesh._VERTEX_SIZE, 0);
		
		// normals
		gl.enableVertexAttribArray(1);
		gl.vertexAttribPointer(
			1, 3, gl.FLOAT, false, ae.mesh._VERTEX_SIZE, 12);

		// tex-coords
		gl.enableVertexAttribArray(2);
		gl.vertexAttribPointer(
			2, 2, gl.FLOAT, false, ae.mesh._VERTEX_SIZE, 24);
		
		gl.drawElements(gl.TRIANGLES, this.indexCount, this._iboType, 0);
		
		gl.disableVertexAttribArray(0);
		gl.disableVertexAttribArray(1);
		gl.disableVertexAttribArray(2);
	}
	/*
	finalize() {
		glDeleteBuffers(_vbo);
		glDeleteBuffers(_ibo);
	}
	*/
}
