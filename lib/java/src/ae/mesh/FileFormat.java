package ae.mesh;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.HashMap;
import java.util.Map;

import ae.mesh.formats.StereoLitography;

public abstract class FileFormat {
	
	private static final Map<String, FileFormat> _FILE_FORMATS =
		new HashMap<>();
	
	static {
		_registerFileFormat(StereoLitography.EXTENSIONS, new StereoLitography());
	}
	
	private static final void _registerFileFormat(
			final String[]   extensions,
			final FileFormat fileFormat) {
		
		for(String i : extensions)
			_FILE_FORMATS.put(i.toLowerCase(), fileFormat);
	}
	
	public static final FileFormat getByExtension(final String extension) {
		return _FILE_FORMATS.getOrDefault(extension.toLowerCase(), null);
	}
	
	public abstract void      exportMesh(OutputStream out) throws IOException; // TODO: incomplete
	public abstract ModelNode importMesh(InputStream  in)  throws IOException;
	
	
}
