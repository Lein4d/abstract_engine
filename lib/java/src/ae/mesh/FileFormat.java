package ae.mesh;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

import ae.mesh.formats.Autodesk3dsMax;
import ae.mesh.formats.StereoLitography;

public abstract class FileFormat {
	
	private static final Map<String, FileFormat> _FILE_FORMATS =
		new HashMap<>();
	
	public final Iterable<String> extensions;
	
	static {
		_registerFileFormat(Autodesk3dsMax  .INSTANCE);
		_registerFileFormat(StereoLitography.INSTANCE);
	}
	
	private static final void _registerFileFormat(final FileFormat format) {
		for(String i : format.extensions) _FILE_FORMATS.put(i, format);
	}
	
	protected FileFormat(final String ... extensions) {
		this.extensions = Arrays.asList(extensions);
	}
	
	public static final FileFormat getByExtension(final String extension) {
		return _FILE_FORMATS.getOrDefault(extension.toLowerCase(), null);
	}
	
	public static final ModelNode load(final String fileName) {
		
		try(InputStream in = new FileInputStream(fileName)) {
			
			final int pointPos = fileName.lastIndexOf(".");
			
			if(pointPos < 1) return null;
			
			final FileFormat format =
				getByExtension(fileName.substring(pointPos + 1));
			
			return format != null ? format.importMesh(in) : null;
			
		} catch(IOException e) {
			
			e.printStackTrace();
			return null;
		}
	}
	
	public abstract void      exportMesh(OutputStream out) throws IOException; // TODO: incomplete
	public abstract ModelNode importMesh(InputStream  in)  throws IOException;
}
