package ae.mesh.formats;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import ae.mesh.FileFormat;
import ae.mesh.MeshBuilder;
import ae.mesh.ModelNode;

public final class WavefrontObject extends FileFormat {

	private static final class Group {
		
		private final String         _name;
		private final List<Triangle> _triangles = new LinkedList<>();
		
		private Group(final String name) {
			_name = name;
		}
	}
	
	private static final class Triangle {
		
		private final int[][] _indices;
		private final int[]   _realIndices = new int[3];
		private final int     _smoothingGroup;
		
		private Triangle(
				final int[] p1,
				final int[] p2,
				final int[] p3,
				final int   smoothingGroup) {
			
			_indices        = new int[][]{p1, p2, p3};
			_smoothingGroup = smoothingGroup;
		}
		
		private final Vertex _computeRealIndices(
				final Map<Vertex, Vertex> vertexMap,
				final Vertex              testVertex) {
			
			Vertex vertex = testVertex;
			
			for(int i = 0; i < 3; i++) {
				
				vertex._compIndices = _indices[i];
				vertex._index       = vertexMap.size();
				
				final Vertex mappedVertex =
					vertexMap.putIfAbsent(vertex, vertex);
				
				if(mappedVertex != null) {
					// The vertex already exists
					_realIndices[i] = mappedVertex._index;
				} else {
					// The previous assigned vertex has been inserted
					_realIndices[i] = vertex._index;
					vertex          = new Vertex();
				}
			}
			
			return vertex;
		}
	}
	
	private static final class Vertex {
		
		private int   _index   = -1;
		private int[] _compIndices;
		
		@Override
		public final boolean equals(final Object obj) {
			
			if(!(obj instanceof Vertex)) return false;
			
			final Vertex v = (Vertex)obj;
			
			return
				_compIndices[0] == v._compIndices[0] &&
				_compIndices[1] == v._compIndices[1] &&
				_compIndices[2] == v._compIndices[2];
		}
		
		@Override
		public final int hashCode() {
			return
				_compIndices[0] ^
				(_compIndices[1] << 12) ^ (_compIndices[2] << 22);
		}
	}
	
	private static final String _SPACE     = "\\s+";
	private static final String _DATA      = "(\\S+)";
	private static final String _PADDING   = "^\\s*";
	private static final String _INDEX     = "(-?\\d+)";
	private static final String _INDEX_EXT = "(?:/" + _INDEX + "?)?";
	
	private static final Pattern _REGEX_TYPE        = Pattern.compile(
		_PADDING + "(\\w+)" + _SPACE);
	private static final Pattern _REGEX_VERTEX_DATA = Pattern.compile(
		_PADDING + "(?:v|vn|vt)" +
		_SPACE + _DATA + _SPACE + _DATA + "(?:" + _SPACE + _DATA + ")?");
	private static final Pattern _REGEX_VERTEX      = Pattern.compile(
		_INDEX + _INDEX_EXT + _INDEX_EXT);
	private static final Pattern _REGEX_GROUP       = Pattern.compile(
		_PADDING + "(?:o|g)" + _SPACE + _DATA);
	private static final Pattern _REGEX_SGROUP      = Pattern.compile(
		_PADDING + "s" + _SPACE + "(?:(off)|(\\d+))");
	
	public static final WavefrontObject INSTANCE = new WavefrontObject();
	
	private WavefrontObject() {
		super("obj");
	}

	private static final Group _beginNewGroup(
			final String      line,
			final List<Group> groups) {
		
		final Matcher matcher = _REGEX_GROUP.matcher(line);
		
		matcher.find();
		
		final Group newGroup = new Group(matcher.group(1));
		groups.add(newGroup);
		
		return newGroup;
	}
	
	private static final ModelNode _createModelNodes(
    		final float[][]   positionArray,
    		final float[][]   normalArray,
    		final float[][]   texCoordArray,
    		final List<Group> groups) {
		
		final ModelNode           rootNode  = new ModelNode();
		final Map<Vertex, Vertex> vertexMap = new HashMap<>();
		
		for(Group i : groups) {
			
			// Skip groups without triangles
			if(i._triangles.isEmpty()) continue;
			
			final ModelNode mn         = new ModelNode(rootNode);
			int             tIndex     = 0;
			Vertex          testVertex = new Vertex();
			
			vertexMap.clear();
			
			for(Triangle j : i._triangles)
				testVertex = j._computeRealIndices(vertexMap, testVertex);
			
			mn.name = i._name;
			mn.mesh.allocateVertices (vertexMap   .size());
			mn.mesh.allocateTriangles(i._triangles.size());
			
			for(Vertex j : vertexMap.keySet()) {
				
				MeshBuilder.Vertex vertex = mn.mesh.getVertex(j._index);
				
				if(positionArray != null)
					vertex.setPosition(positionArray[j._compIndices[0]]);
				if(normalArray   != null)
					vertex.setNormal  (normalArray  [j._compIndices[1]]);
				if(texCoordArray != null)
					vertex.setTexCoord(texCoordArray[j._compIndices[2]]);
			}
			
			for(Triangle j : i._triangles) {
				
				mn.mesh.getTriangle(tIndex).
					setIndices(
						j._realIndices[0],
						j._realIndices[1],
						j._realIndices[2]).
					setSmoothingGroup(j._smoothingGroup);
				
				tIndex++;
			}
			
			if(normalArray == null) mn.mesh.computeNormals();
		}
		
		return rootNode;
	}
	
	private static final boolean[] _parseData(
			final InputStream   in,
    		final List<float[]> positions,
    		final List<float[]> normals,
    		final List<float[]> texCoords,
    		final List<Group>   groups) throws IOException {
		
		// {<positions>,<normals>,<texCoords>}
		final boolean[]      attributes = {false, false, false};
		final BufferedReader reader     =
			new BufferedReader(new InputStreamReader(in));
		
		Group curGroup  = new Group("");
		int   curSGroup = 0;
		
		for(String line; (line = reader.readLine()) != null;) {
			
			final Matcher typeMatcher = _REGEX_TYPE.matcher(line);
			
			if(typeMatcher.find()) {
				switch(typeMatcher.group(1)) {
					case "o":
					case "g":
						curGroup = _beginNewGroup(line, groups);
						break;
					case "s":
						curSGroup = _readSmoothingGroup(line);
						break;
					case "v":
						_readVertexData(line, 3, positions);
						break;
					case "vn":
						_readVertexData(line, 3, normals);
						break;
					case "vt":
						_readVertexData(line, 2, texCoords);
						break;
					case "f":
						_readTriangles(
							line,
							positions.size(), normals.size(), texCoords.size(),
							curGroup._triangles, curSGroup, attributes);
						break;
				}
			}
		}
		
		return attributes;
	}
	
	private static final int _parseIndex(
			final String indexString,
			final int    curCount) {
		
		if(indexString == null) return 0;
		
		final int rawIndex = Integer.parseInt(indexString);
		return rawIndex > 0 ? rawIndex - 1 : curCount + rawIndex;
	}
	
	private static final int _readSmoothingGroup(final String line) {
		
		final Matcher matcher = _REGEX_SGROUP.matcher(line);
		
		matcher.find();
		return
			matcher.group(1) != null ? 0 : Integer.parseInt(matcher.group(2));
	}
	
	private static final void _readTriangles(
			final String         line,
			final int            pCount,
			final int            nCount,
			final int            tcCount,
			final List<Triangle> dst,
			final int            sGroup,
			final boolean[]      attributes) {
		
		final Matcher matcher = _REGEX_VERTEX.matcher(line);
		
		matcher.find();
		final int[] firstIndex =
			_readVIndices(matcher, pCount, nCount, tcCount, attributes);
		
		matcher.find();
		int[] nextIndex;
		int[] recentIndex =
			_readVIndices(matcher, pCount, nCount, tcCount, attributes);
		
		while(matcher.find()) {
			
			nextIndex   = recentIndex;
			recentIndex =
				_readVIndices(matcher, pCount, nCount, tcCount, attributes);
			
			// Create a triangle from the first index and the two most recent
			// indices
			dst.add(new Triangle(firstIndex, nextIndex, recentIndex, sGroup));
		}
	}

	private static final void _readVertexData(
			final String        line,
			final int           componentCount,
			final List<float[]> dst) {
		
		final Matcher matcher  = _REGEX_VERTEX_DATA.matcher(line);
		final float[] data     = new float[componentCount];
		
		matcher.find();
		
		for(int i = 0; i < componentCount; i++)
			data[i] = Float.parseFloat(matcher.group(i + 1));
		
		dst.add(data);
	}

	private static final int[] _readVIndices(
			final Matcher   matcher,
			final int       curPositionCount,
			final int       curNormalCount,
			final int       curTexCoordCount,
			final boolean[] attributes) {
		
		final String position = matcher.group(1);
		final String normal   = matcher.group(3);
		final String texCoord = matcher.group(2);
		
		if(attributes[0]) {
			
			if((normal   != null) != attributes[1])
				throw new UnsupportedOperationException();
			if((texCoord != null) != attributes[2])
				throw new UnsupportedOperationException();
			
		} else {
			
			attributes[0] = true;
			attributes[1] = normal   != null;
			attributes[2] = texCoord != null;
		}
		
		return new int[]{
			_parseIndex(position, curPositionCount),
			_parseIndex(normal,   curNormalCount),
			_parseIndex(texCoord, curTexCoordCount)
		};
	}

	@Override
	public final void exportMesh(final OutputStream out) throws IOException {}

	@Override
	public final ModelNode importMesh(final InputStream in) throws IOException {
		
		final List<float[]> positions = new LinkedList<>();
		final List<float[]> normals   = new LinkedList<>();
		final List<float[]> texCoords = new LinkedList<>();
		final List<Group>   groups    = new LinkedList<>();
		
		// {<positions>,<normals>,<texCoords>}
		final boolean[] attributes =
			_parseData(in, positions, normals, texCoords, groups);
		
		return _createModelNodes(
			attributes[0] ?
				positions.toArray(new float[positions.size()][]) : null,
			attributes[1] ?
				normals  .toArray(new float[normals  .size()][]) : null,
			attributes[2] ?
				texCoords.toArray(new float[texCoords.size()][]) : null,
			groups);
	}
}
