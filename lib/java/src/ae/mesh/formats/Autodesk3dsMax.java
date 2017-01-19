package ae.mesh.formats;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.ByteOrder;

import ae.mesh.FileFormat;
import ae.mesh.MeshBuilder;
import ae.mesh.ModelNode;
import ae.util.stream.ByteOrderInputStream;
import ae.util.stream.CountingInputStream;

public final class Autodesk3dsMax extends FileFormat {
	
	public static final Autodesk3dsMax INSTANCE = new Autodesk3dsMax();

	private Autodesk3dsMax() {
		super("3ds");
	}
	
	private static final void _fillVertexData(
			final ByteOrderInputStream                     boin,
			final MeshBuilder                              mb,
			final MeshBuilder.FillerIO<MeshBuilder.Vertex> filler)
				throws IOException {
		
		final int newVertexCount = boin.readShort();
		
		if(mb.getVertexCount() == 0) mb.allocateVertices(newVertexCount);
		mb.fillVertexDataIO(filler);
	}
	
	private static final void _readChunks(
			final CountingInputStream  in,
			final ByteOrderInputStream boin,
			final int                  end,
			final ModelNode            parentNode,
			final ModelNode            curNode) throws IOException {
    
    	while(in.getPosition() < end) {
    		
    		final int   chunkStart = in.getPositionI();
    		final short chunkId    = boin.readShort();
    		final int   chunkEnd   = chunkStart + boin.readInt();
    		
    		switch(chunkId) {
    			/*
    			case <chunkId>:
    				<Read relevant values>
    				ReadChunks(chunkEnd)
    				break;
    			*/
    			case 0x4D4D: // Main chunk
    			case 0x3D3D: // 3D Editor chunk
    			case 0x4100: // Triangular mesh chunk
    				_readChunks(in, boin, chunkEnd, parentNode, curNode);
    				break;
    				
    			case 0x4000: // Object chunk
    				
    				final StringBuilder sb = new StringBuilder();
    				int                 b;
    				
    				// Read 20 characters at maximum
    				while(sb.length() < 20 && (b = in.read()) != 0)
    					sb.append((char)b);
    				
    				final ModelNode mn = new ModelNode(parentNode);
    				
    				_readChunks(in, boin, chunkEnd, parentNode, mn);
    				
    				mn.name = sb.toString();
    				mn.mesh.computeNormals();
    				break;
    			
    			case 0x4110: // Vertex chunk
    				_fillVertexData(boin, curNode.mesh, (vertex, index) ->
    					vertex.setPosition(
    						boin.readFloat(),
							boin.readFloat(),
							boin.readFloat()));
    				break;
    
    			case 0x4120: // Triangle chunk
    				
    				curNode.mesh.
    					allocateTriangles(boin.readShort()).
    					fillTrianglexDataIO((triangle, index) -> {
    						triangle.setIndices(
    							boin.readShort(),
    							boin.readShort(),
    							boin.readShort());
    						in.skip(2); // Skip additional flags
    					});
    				
    				_readChunks(in, boin, chunkEnd, parentNode, curNode);
    				break;
    			
    			case 0x4140: // Mapping Coords chunk
    				_fillVertexData(boin, curNode.mesh, (vertex, index) ->
    					vertex.setTexCoord(boin.readFloat(), boin.readFloat()));
    				break;
    			
    			case 0x4150: // Face Smoothing Group Chunk
    				curNode.mesh.fillTrianglexDataIO((triangle, index) ->
    					triangle.setSmoothingGroup(
    						Integer.numberOfTrailingZeros(boin.readInt()) + 1));
    				break;
    				
    			default:
    				in.skip(chunkEnd - in.getPositionI());
    				break;
    		}
    	}
	}

	public final void exportMesh(final OutputStream out) throws IOException {
		
	}
	
	public final ModelNode importMesh(
			final InputStream in) throws IOException {
		
		final CountingInputStream cin = new CountingInputStream(in);
		final ModelNode    parentNode = new ModelNode();
		
		// Can pass '1' as chunk end as the loop will iterate once for the main
		// chunk. Subsequent chunks will get the correct chunk end.
		_readChunks(
			cin, new ByteOrderInputStream(cin, ByteOrder.LITTLE_ENDIAN), 1,
			parentNode, null);
		
		return parentNode.simplify();
	}
}
