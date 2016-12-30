package ae.mesh.formats;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.ByteOrder;
import java.nio.charset.StandardCharsets;
import java.util.regex.MatchResult;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import ae.collections.PooledLinkedList;
import ae.mesh.FileFormat;
import ae.mesh.Mesh;
import ae.mesh.ModelNode;
import ae.util.ByteOrderInputStream;
import ae.util.Functions;

public final class StereoLitography extends FileFormat {

	private static final String _SPACE  = "\\s+";
	private static final String _NDATA  = "\\S+";
	private static final String _VDATA  = "(\\S+)";
	private static final String _NORMAL =
		"normal" + _SPACE + _NDATA + _SPACE + _NDATA + _SPACE + _NDATA + _SPACE;
	private static final String _VERTEX =
		"vertex" + _SPACE + _VDATA + _SPACE + _VDATA + _SPACE + _VDATA + _SPACE;
	
	private static final Pattern _REGEX_HEADER = Pattern.compile(
		"solid" + _SPACE + _VDATA);
	private static final Pattern _REGEX_FACET  = Pattern.compile(
		"facet" + _SPACE + _NORMAL +
			"outer" + _SPACE + "loop" + _SPACE +
				_VERTEX + _VERTEX + _VERTEX +
			"endloop" + _SPACE +
		"endfacet");
	
	private final byte[] _headerBytes = new byte[80];
	
	public static final StereoLitography INSTANCE = new StereoLitography();
	
	private StereoLitography() {
		super("stl");
	}
	
	private final ModelNode _importASCII(
			final InputStream in,
			final String      headerString,
			final String      name) throws IOException {
		
		final ModelNode mn           = new ModelNode(name, null);
		final String    content      =
			headerString + Functions.getStreamAsString(in);
		final Matcher   facetMatcher = _REGEX_FACET .matcher(content);
		
		final PooledLinkedList<MatchResult> facets    =
			Functions.getMatches(facetMatcher);
		final float[][]                     positions =
			mn.mesh.createPositionArray(facets.getSize() * 3);
		
		int vPos = 0;
		for(MatchResult i : facets) {
			_parsePosition(i, 1, positions[vPos++]);
			_parsePosition(i, 4, positions[vPos++]);
			_parsePosition(i, 7, positions[vPos++]);
		}
		
		return mn;
	}

	private final ModelNode _importBinary(
			final InputStream in) throws IOException {
		
		final ModelNode            mn        = new ModelNode("STL Mesh", null);
		final ByteOrderInputStream boin      =
			new ByteOrderInputStream(in, ByteOrder.LITTLE_ENDIAN);
		
		final int       triangleCount = boin.readInt();
		final float[][] positions     =
			mn.mesh.createPositionArray(triangleCount * 3);
		
		for(int i = 0; i < triangleCount; i++) {
			in.skip(12); // Skip normal vector
			_readPosition(boin, positions[i * 3 + 0]);
			_readPosition(boin, positions[i * 3 + 1]);
			_readPosition(boin, positions[i * 3 + 2]);
			in.skip(2);  // Skip attribute
		}
		
		in.close();
		
		return mn;
	}
	
	private static final void _parsePosition(
			final MatchResult src,
			final int         groupOffset,
			final float[]     dst) {
		
		for(int i = 0; i < 3; i++)
			dst[i] = Float.parseFloat(src.group(groupOffset + i));
	}
	
	private static final void _readPosition(
			final ByteOrderInputStream src,
			final float[]              dst) throws IOException {
		
		for(int i = 0; i < 3; i++) dst[i] = src.readFloat();
	}
	
	@Override
	public final void exportMesh(final OutputStream out) throws IOException {}

	@Override
	public final ModelNode importMesh(final InputStream in) throws IOException {
		
		in.read(_headerBytes);
		
		final String    headerString  =
			new String(_headerBytes, StandardCharsets.UTF_8);
		final Matcher   headerMatcher = _REGEX_HEADER.matcher(headerString);
		final ModelNode mn            = headerMatcher.find() ?
			_importASCII(in, headerString, headerMatcher.group(1)) :
			_importBinary(in);
		
		mn.mesh.setPrimitiveType(Mesh.PrimitiveType.TRIANGLE);
		mn.mesh.computeNormals(true, true);
			
		return mn;
	}
}
