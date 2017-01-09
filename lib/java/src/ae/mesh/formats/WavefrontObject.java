package ae.mesh.formats;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import ae.mesh.FileFormat;
import ae.mesh.Mesh;
import ae.mesh.ModelNode;

public final class WavefrontObject extends FileFormat {

	private static final String _SPACE     = "\\s+";
	private static final String _DATA      = "(\\S+)";
	private static final String _PADDING   = "^\\s*";
	private static final String _INDEX     = "(-?\\d+)";
	private static final String _INDEX_EXT = "(?:/" + _INDEX + "?)?";
	
	private static final Pattern _REGEX_TYPE     = Pattern.compile(
		_PADDING + "(\\w+)" + _SPACE);
	private static final Pattern _REGEX_POSITION = Pattern.compile(
		_PADDING + "v" + _SPACE + _DATA + _SPACE + _DATA + _SPACE + _DATA);
	private static final Pattern _REGEX_VERTEX   = Pattern.compile(
		_INDEX + _INDEX_EXT + _INDEX_EXT);
	
	public static final WavefrontObject INSTANCE = new WavefrontObject();
	
	private WavefrontObject() {
		super("obj");
	}
	
	private static final List<int[]> _finishGroup(
			final List<int[]>      curGroup,
			final Set<List<int[]>> groups) {
		
		if(curGroup.isEmpty()) {
			return curGroup;
		} else {
			groups.add(curGroup);
			return new LinkedList<>();
		}
	}
	
	private static final int _readIndex(
			final String src,
			final int    curVertexCount) {
		
		final int rawIndex = Integer.parseInt(src);
		return rawIndex > 0 ? rawIndex - 1 : curVertexCount + rawIndex;
	}
	
	private static final void _readPosition(
			final String        line,
			final List<float[]> positions) {
		
		final Matcher matcher  = _REGEX_POSITION.matcher(line);
		final float[] position = new float[3];
		
		matcher.find();
		
		for(int i = 0; i < 3; i++)
			position[i] = Float.parseFloat(matcher.group(i + 1));
		
		positions.add(position);
	}
	
	private static final void _readTriangles(
			final String      line,
			final int         curVertexCount,
			final List<int[]> triangles) {
		
		final Matcher matcher = _REGEX_VERTEX.matcher(line);
		
		matcher.find();
		final int firstIndex = _readIndex(matcher.group(1), curVertexCount);
		
		matcher.find();
		int recentIndex = _readIndex(matcher.group(1), curVertexCount);
		int nextIndex;
		
		while(matcher.find()) {
			
			nextIndex   = recentIndex;
			recentIndex = _readIndex(matcher.group(1), curVertexCount);
			
			// Create a triangle from the first index and the two most recent
			// indices
			triangles.add(new int[]{firstIndex, nextIndex, recentIndex});
		}
	}
	
	@Override
	public final void exportMesh(final OutputStream out) throws IOException {}

	@Override
	public final ModelNode importMesh(final InputStream in) throws IOException {
		
		final BufferedReader   reader    =
			new BufferedReader(new InputStreamReader(in));
		final List<float[]>    positions = new LinkedList<>();
		final Set<List<int[]>> groups    = new HashSet<>();
		final ModelNode        rootNode  = new ModelNode("<root>", null);
		
		List<int[]> curGroup = new LinkedList<>();
		
		for(String line; (line = reader.readLine()) != null;) {
			
			final Matcher typeMatcher = _REGEX_TYPE.matcher(line);
			
			if(typeMatcher.find()) {
				switch(typeMatcher.group(1)) {
					case "o":
					case "g":
						curGroup = _finishGroup(curGroup, groups);
						break;
					case "v":
						_readPosition(line, positions);
						break;
					case "f":
						_readTriangles(line, positions.size(), curGroup);
						break;
				}
			}
		}
		
		_finishGroup(curGroup, groups);
		
		final float[][] positionArray =
			positions.toArray(new float[positions.size()][]);
		
		for(List<int[]> i : groups) {
			
			final ModelNode node = new ModelNode(rootNode, null);
			
			node.mesh.setPrimitiveType(Mesh.PrimitiveType.TRIANGLE);
			node.mesh.setPositions    (positionArray);
			node.mesh.setIndices      (i.toArray(new int[i.size()][]));
			
			node.mesh.computeNormals(true, true);
		}
		
		return rootNode;
	}
}
