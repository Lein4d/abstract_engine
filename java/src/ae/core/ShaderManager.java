package ae.core;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;

import ae.entity.DirectionalLight;
import ae.entity.Entity;
import ae.entity.PointLight;
import ae.math.Matrix4D;
import ae.math.Vector4D;

import static org.lwjgl.opengl.GL11.*;
import static org.lwjgl.opengl.GL20.*;
import static org.lwjgl.opengl.GL30.*;

public final class ShaderManager {
	
	private final class Shader {
		
		private final int   _program;
		private final int[] _uniLocations = new int[_uniforms.length];
		
		private Shader(
				final int        program,
				final String ... uniNames) {
			
			glUseProgram(program);
			
			_program = program;
			
			for(int i = 0; i < uniNames.length; i++)
				_uniLocations[i] = uniNames[i] != null ?
					glGetUniformLocation(_program, uniNames[i]) : -1;
		}
		
		private final <T> void setUniformValue(
				final int index,
				final T   value) {
			
			final int location = _uniLocations[index];
			
			if(location == -1) return;
			
			switch(index) {
				
				case _UNI_MAT_MODELVIEW:
				case _UNI_MAT_PROJECTION:
					glUniformMatrix4fv(
						location, false, ((Matrix4D)value).getData(_temp16));
					break;
				
				case _UNI_MAT_NORMAL:
					glUniformMatrix3fv(
						location, false, ((Matrix4D)value).getNmData(_temp9));
					break;
				
				case _UNI_COLOR:
					glUniform4fv(location, ((Vector4D)value).getData(_temp4));
					break;
				
				case _UNI_TEXTURE:
				case _UNI_DIR_LIGHT_COUNT:
				case _UNI_POINT_LIGHT_COUNT:
					glUniform1i(location, (Integer)value);
					break;
				
				case _UNI_DIR_LIGHTS:
				case _UNI_POINT_LIGHTS:
					glUniform4fv(location, (float[])value);
					break;
			}
		}
	}
	
	private final class UniformVariable<T> {
		
		private final int       _uniformId;
		private final boolean[] _validity = new boolean[maxShaderCount];
		
		private T _value;
		
		private UniformVariable(
				final int uniformId) {
			
			_uniformId = uniformId;
			
			for(int i = 0; i < _validity.length; i++) _validity[i] = false;
		}
		
		private final void applyToCurShader() {
			
			if(_curShaderId == -1 || _validity[_curShaderId]) return;
			
			_shaders[_curShaderId].setUniformValue(_uniformId, _value);
			
			_validity[_curShaderId] = true;
		}
		
		private final void setValue(
				final T value) {
			
			_value = value;
			
			// Invalidate the value for all shader programs
			for(int i = 0; i < _shaderCount; i++) _validity[i] = false;
			
			applyToCurShader();
		}
	}
	
	private static final int _UNI_MAT_MODELVIEW     = 0;
	private static final int _UNI_MAT_NORMAL        = 1;
	private static final int _UNI_MAT_PROJECTION    = 2;
	private static final int _UNI_COLOR             = 3;
	private static final int _UNI_TEXTURE           = 4;
	private static final int _UNI_DIR_LIGHTS        = 5;
	private static final int _UNI_DIR_LIGHT_COUNT   = 6;
	private static final int _UNI_POINT_LIGHTS      = 7;
	private static final int _UNI_POINT_LIGHT_COUNT = 8;
	
	private final UniformVariable<Matrix4D> _uniMatModelView;
	private final UniformVariable<Matrix4D> _uniMatNormal;
	private final UniformVariable<Matrix4D> _uniMatProjection;
	private final UniformVariable<Vector4D> _uniColor;
	private final UniformVariable<Integer>  _uniTexture;
	private final UniformVariable<float[]>  _uniDirLights;
	private final UniformVariable<Integer>  _uniDirLightCount;
	private final UniformVariable<float[]>  _uniPointLights;
	private final UniformVariable<Integer>  _uniPointLightCount;
	
	private final Shader[] _shaders;
	private final float[]  _temp4  = new float[4];
	private final float[]  _temp9  = new float[9];
	private final float[]  _temp16 = new float[16];
	
	private final UniformVariable<?>[] _uniforms;
	
	private int _shaderCount = 0;
	private int _curShaderId = -1;
	
	public final int maxShaderCount;
	public final int maxDirLightCount;
	public final int maxPointLightCount;
	
	private final boolean createShader(
			final AbstractEngine engine,
			final int    shaderType,
			final int    program,
			final String sourcePath) {
		
		final int shader = glCreateShader(shaderType);
		
		// Load the shader source code
		try {
			glShaderSource(shader, loadFile(sourcePath));
		} catch(IOException e) {
			engine.err.println(
				"Error while loading shader source '" + sourcePath + "'");
			return false;
		}
		
		glCompileShader(shader);
		
		engine.out.println(glGetShaderInfoLog(shader));
		
		// Abort if the shader has not been compiled
		if(glGetShaderi(shader, GL_COMPILE_STATUS) == GL_FALSE) return false;
		
		glAttachShader(program, shader);
		glDeleteShader(shader);
		
		return true;
	}
	
	private static final String loadFile(
			final String path) throws IOException {
		
		byte[] encoded = Files.readAllBytes(Paths.get(path));
		
		return new String(encoded, StandardCharsets.UTF_8);
	}
	
	public ShaderManager(
			final int maxShaderCount,
			final int maxDirLightCount,
			final int maxPointLightCount) {
		
		this.maxShaderCount     = maxShaderCount;
		this.maxDirLightCount   = maxDirLightCount;
		this.maxPointLightCount = maxPointLightCount;
		
		_shaders = new Shader[maxShaderCount];
		
		_uniMatModelView    = new UniformVariable<>(_UNI_MAT_MODELVIEW);
		_uniMatNormal       = new UniformVariable<>(_UNI_MAT_NORMAL);
		_uniMatProjection   = new UniformVariable<>(_UNI_MAT_PROJECTION);
		_uniColor           = new UniformVariable<>(_UNI_COLOR);
		_uniTexture         = new UniformVariable<>(_UNI_TEXTURE);
		_uniDirLights       = new UniformVariable<>(_UNI_DIR_LIGHTS);
		_uniDirLightCount   = new UniformVariable<>(_UNI_DIR_LIGHT_COUNT);
		_uniPointLights     = new UniformVariable<>(_UNI_POINT_LIGHTS);
		_uniPointLightCount = new UniformVariable<>(_UNI_POINT_LIGHT_COUNT);
		
		_uniDirLights  .setValue(new float[maxDirLightCount   * 8]);
		_uniPointLights.setValue(new float[maxPointLightCount * 8]);
		
		_uniforms = new UniformVariable<?>[]{
			_uniMatModelView,
			_uniMatNormal,
			_uniMatProjection,
			_uniColor,
			_uniTexture,
			_uniDirLights,
			_uniDirLightCount,
			_uniPointLights,
			_uniPointLightCount
		};
	}
	
	public final int createShaderProgram(
			final AbstractEngine   engine,
			final String   vertexShaderPath,
			final String   fragmentShaderPath,
			final String[] attribNames,
			final String[] fragDataNames,
			final String   uniNameMatModelView,
			final String   uniNameMatNormal,
			final String   uniNameMatProjection,
			final String   uniNameColor,
			final String   uniNameTexture,
			final String   uniNameDirLights,
			final String   uniNameDirLightCount,
			final String   uniNamePointLights,
			final String   uniNamePointLightCount) {
		
		final int program = glCreateProgram();

		final boolean vsSuccess = createShader(
			engine, GL_VERTEX_SHADER, program, vertexShaderPath);
		final boolean fsSuccess = createShader(
			engine, GL_FRAGMENT_SHADER, program, fragmentShaderPath);
		
		if(!vsSuccess || !fsSuccess) return -1;

		// Bind the attributes
		for(int i = 0; i < attribNames.length; i++)
			if(attribNames[i] != null)
				glBindAttribLocation(program, i, attribNames[i]);

		// Bind the fragment data
		for(int i = 0; i < fragDataNames.length; i++)
			if(fragDataNames[i] != null)
				glBindFragDataLocation(program, i, fragDataNames[i]);
		
		// Link the whole program
		glLinkProgram(program);
		engine.out.println(glGetProgramInfoLog(program));
		
		if(glGetProgrami(program, GL_LINK_STATUS) == GL_FALSE) return -1;
		
		_shaders[_shaderCount] = new Shader(
			program,
			uniNameMatModelView, uniNameMatNormal, uniNameMatProjection,
			uniNameColor,
			uniNameTexture,
			uniNameDirLights,   uniNameDirLightCount,
			uniNamePointLights, uniNamePointLightCount);
		
		// Unbind the program
		glUseProgram(0);
		
		return _shaderCount++;
	}

	public final ShaderManager setColor(
			final Vector4D color) {
		
		_uniColor.setValue(color);
		
		return this;
	}
	
	public final ShaderManager setDirectionalLights(
			final Entity.Instance[] lights,
			final int               count) {
		
		final float[] lightData = _uniDirLights._value;
		
		for(int i = 0; i < count; i++) {
			
			final DirectionalLight light   =
				(DirectionalLight)lights[i].getEntity();
			final int              offset  = i * 8;
			final float[]          dotBias = light.dotBias.getActiveValue();
			
			// Apply the transformation to the light direction and copy it into
			// the data array
			light.direction.getActiveValue().getData(lightData, offset);
			lights[i].transformation.applyToDirVector(lightData, offset);
			
			// Copy the color to the data array
			light.color.getActiveValue().getData(lightData, offset + 4);
			
			// Split the bias data and copy it to the data array
			lightData[offset + 3] = dotBias[0];
			lightData[offset + 7] = dotBias[1];
		}
		
		_uniDirLights    .setValue(lightData);
		_uniDirLightCount.setValue(count);
		
		return this;
	}
	
	public final ShaderManager setModelViewMatrix(
			final Matrix4D modelViewMatrix) {
		
		_uniMatModelView.setValue(modelViewMatrix);
		_uniMatNormal   .setValue(modelViewMatrix);
		
		return this;
	}

	public final ShaderManager setPointLights(
			final Entity.Instance[] lights,
			final int               count) {
		
		final float[] lightData = _uniPointLights._value;
		
		for(int i = 0; i < count; i++) {
			
			final PointLight light       = (PointLight)lights[i].getEntity();
			final int        offset      = i * 8;
			final float[]    attenuation = light.attenuation.getActiveValue();
			
			// Apply the transformation to the light position and copy it into
			// the data array
			for(int j = 0; j < 3; j++) lightData[offset + j] = 0;
			lights[i].transformation.applyToPoint(lightData, offset, (byte)3);
			
			// Copy the color to the data array
			light.color.getActiveValue().getData(lightData, offset + 4);
			
			// Split the attenuation data and copy it to the data array
			lightData[offset + 3] = attenuation[0];
			lightData[offset + 7] = attenuation[1];
		}
		
		_uniPointLights    .setValue(lightData);
		_uniPointLightCount.setValue(count);
		
		return this;
	}
	
	public final ShaderManager setProjectionMatrix(
			final Matrix4D projectionMatrix) {
		
		_uniMatProjection.setValue(projectionMatrix);
		
		return this;
	}

	public final ShaderManager setTexture(
			final int texture) {
		
		_uniTexture.setValue(texture);
		
		return this;
	}
	
	public final void useShaderProgram(
			final int programId) {
		
		useShaderProgram(programId, false);
	}
	
	public final void useShaderProgram(
			final int     programId,
			final boolean unbind) {
		
		if(programId == _curShaderId) return;
		
		_curShaderId = programId;
		
		if(_curShaderId >= 0) {
			glUseProgram(_shaders[_curShaderId]._program);
			for(UniformVariable<?> i : _uniforms) i.applyToCurShader();
		} else if(unbind) {
			glUseProgram(0);
		}
	}
}
