package ae.core;

import static org.lwjgl.opengl.GL11.*;
import static org.lwjgl.opengl.GL20.*;
import static org.lwjgl.opengl.GL30.*;

public class GlslShader {
	
	private final int _program;
	
	final int uniMatModelView;
	final int uniMatProjection;
	final int uniMatNormal;
	final int uniDirLights;
	final int uniDirLightCount;
	final int uniPointLights;
	final int uniPointLightCount;
	
	public final AbstractEngine engine;
	
	private final boolean _createShader(
			final int    shaderType,
			final String typeName,
			final int    program,
			final String shaderSource) {
		
		final int shader = glCreateShader(shaderType);
		
		glShaderSource (shader, shaderSource);
		glCompileShader(shader);
		_printLog(typeName, glGetShaderInfoLog(shader));
		
		// Abort if the shader has not been compiled
		if(glGetShaderi(shader, GL_COMPILE_STATUS) == GL_FALSE) return false;
		
		glAttachShader(program, shader);
		glDeleteShader(shader);
		
		return true;
	}
	
	private final void _printLog(
			final String name,
			final String log) {
		
		int cutPosition = log.length() - 1;
		
		while(
			cutPosition >= 0 &&
			Character.isWhitespace(log.charAt(cutPosition))) cutPosition--;
		
		// Print nothing if the log contains only whitespace characters
		if(cutPosition < 0) return;
		
		engine.out.println("> " + name + " info log:");
		engine.out.println(log.substring(0, cutPosition + 1));
	}
	
	public GlslShader(
			final AbstractEngine engine,
			final String         name,
			final String         vsSource,
			final String         fsSource,
			final String         uniNameMatModelView,
			final String         uniNameMatProjection,
			final String         uniNameMatNormal,
			final String         uniNameDirLights,
			final String         uniNameDirLightCount,
			final String         uniNamePointLights,
			final String         uniNamePointLightCount,
			final String         fragDataName,
			final String ...     attributeNames) {
	
		this.engine = engine;
	
		int program = glCreateProgram();
	
		engine.out.println("Creating shader program '" + name + "'");
		
		// Create the shader components
		final boolean vsSuccess = _createShader(
			GL_VERTEX_SHADER,   "Vertex shader",   program, vsSource);
		final boolean fsSuccess = _createShader(
			GL_FRAGMENT_SHADER, "Fragment shader", program, fsSource);
		
		// If one of shader components failed, no program will be used
		if(!vsSuccess || !fsSuccess) {
			
			engine.out.println("> Aborting program creation");
			
			if(!vsSuccess)
				engine.out.println("\tVertex shader not compiled");
			if(!fsSuccess)
				engine.out.println("\tFragment shader not compiled");
			
			program = 0;
			
		} else {
				
			// Bind the vertex attribute locations
			for(int i = 0; i < attributeNames.length; i++)
				if(attributeNames[i] != null)
					glBindAttribLocation(program, i, attributeNames[i]);
			
			// Bind fragment data locations
			glBindFragDataLocation(program, 0, fragDataName);
	
			// Link the whole program
			glLinkProgram(program);
			_printLog("Program", glGetProgramInfoLog(program));
			
			// If the linking has failed, no program will be used
			if(glGetProgrami(program, GL_LINK_STATUS) == GL_FALSE) {
				program = 0;
			} else {
				engine.out.println("> Program creation successful");
			}
		}
		
		glUseProgram(_program = program);
		
		uniMatModelView    = getUniformLocation(uniNameMatModelView);
		uniMatProjection   = getUniformLocation(uniNameMatProjection);
		uniMatNormal       = getUniformLocation(uniNameMatNormal);
		uniDirLights       = getUniformLocation(uniNameDirLights);
		uniDirLightCount   = getUniformLocation(uniNameDirLightCount);
		uniPointLights     = getUniformLocation(uniNamePointLights);
		uniPointLightCount = getUniformLocation(uniNamePointLightCount);
	}

	public final void bind() {
		glUseProgram(_program);
	}
	
	public final int getUniformLocation(final String uniName) {
		return _program != 0 && uniName != null ?
			glGetUniformLocation(_program, uniName) : -1;
	}
}
