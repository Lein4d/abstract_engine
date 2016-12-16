package ae.core;

public final class ObjectPicker {
	
	private static final String _VS_SOURCE =
    	"#version 330\n" +
    	"\n" +
    	"uniform highp mat4 u_matModelView;\n"  +
    	"uniform highp mat4 u_matProjection;\n" +
    	"\n" +
    	"in  highp vec3 in_position;\n"  +
    	"out highp vec3 var_position;\n" +
    	"\n" +
    	"void main(void) {\n" +
    	"\tvar_position = in_position;\n" +
    	"\tgl_Position  = u_matProjection * (u_matModelView * vec4(in_position, 1));\n" +
    	"}\n";
	
	private static final String _FS_SOURCE =
    	"#version 330\n" +
    	"\n" +
    	"uniform highp float u_objectId;\n" +
    	"\n" +
    	"in  highp vec3 var_position;\n" +
    	"out highp vec4 out_color;\n"    +
    	"\n" +
    	"void main(void) {\n" +
    	"\tout_color = vec4(var_position, u_objectId);\n" +
    	"}\n";
	
	private final Screen.Layer _layer;
	
	private int _width  = -1;
	private int _height = -1;
	
	ObjectPicker(final Screen.Layer layer) {
		_layer = layer;
	}
	
	// The shader program is created outside the object picker, so it can be
	// reused among multiple object pickers
	public static final int createShaderProgram() {
		
		
		return 0;
	}
}
