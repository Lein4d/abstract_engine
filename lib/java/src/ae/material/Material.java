package ae.material;

import static org.lwjgl.opengl.GL11.*;
import static org.lwjgl.opengl.GL13.*;
import static org.lwjgl.opengl.GL20.*;

import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Set;

import ae.collections.PooledHashMap;
import ae.collections.PooledLinkedList;
import ae.core.AbstractEngine;
import ae.core.Texture;
import ae.entity.DirectionalLight;
import ae.entity.Entity;
import ae.entity.PointLight;
import ae.math.Matrix4D;

public class Material {

	static final class CustomParam {
		
		private final ShaderProgram.CustomUniformParam _uniform;
		private       int                              _location;
		private       float[]                          _value;
	
		final Node node;
		
		private final void _useParam() {
	
			if(_value == null) return;
			
			switch(_value.length) {
				case 1: glUniform1fv(_location, _value); break;
				case 2: glUniform2fv(_location, _value); break;
				case 3: glUniform3fv(_location, _value); break;
				case 4: glUniform4fv(_location, _value); break;
			}
		}
		
		CustomParam(
				final String   name,
				final GlslType type) {
			
			_uniform = new ShaderProgram.CustomUniformParam(name, type);
			node     = new Node(_uniform.glslName, type);
		}
	}
	
	static final class CustomTexture {
		
		private final ShaderProgram.CustomUniformTexture _uniform;
		private       int                                _location;
		private       Texture                            _texture;
		
		final Node node;
		
		private final void _useTexture(final int slot) {
			
			glActiveTexture(GL_TEXTURE0 + slot);
			
			if(_texture != null) {
				_texture.use();
			} else {
				glBindTexture(GL_TEXTURE_2D, 0);
			}
			
			glUniform1i(_location, slot);
		}
		
		CustomTexture(final String name) {
			_uniform = new ShaderProgram.CustomUniformTexture(name);
			node     = new Node(_uniform.glslName, GlslType.TEX2);
		}
	}
	
	static final class BuiltInFunction {
		
		private final ShaderProgram.Function _function;
		final         NodeTemplate           nodeTemplate;
		
		private BuiltInFunction(final ShaderProgram.Function function) {
			
			this._function    = function;
			this.nodeTemplate = function.createNodeTemplate();
		}
	}
	
	static final class BuiltInVariable {
		
		private final ShaderProgram.ShaderComponent _component;
		final         Node                          node;
		
		private BuiltInVariable(final ShaderProgram.LocalVariable lVariable) {
			_component = lVariable;
			node       = new Node(lVariable.glslName, lVariable.type);
		}
		
		private BuiltInVariable(final ShaderProgram.Varying varying) {
			_component = varying;
			node       = new Node(varying.glslName, varying.type);
		}
	}
	
	static final class Value {
		
		private final ShaderProgram.LocalVariable _lVariable;
		final         Node                        node;
		
		Value(
				final String   name,
				final GlslType type,
				final Node     definition) {
			
			_lVariable = new ShaderProgram.LocalVariable(
				"var_" + name,
				type,
				type.glslName + " var_" + name + " = " +
					definition.toSourceString() + ";");
			
			node = new Node(_lVariable.glslName, type);
		}
	}
	
	public interface Updater {
		void updateMaterial(Material material, double time, double delta);
	}
	
	private final int     _shaderProgram;
	private final Updater _updater;
	private final float[] _temp9  = new float[9];
	private final float[] _temp16 = new float[16];
	private final float[] _lightData;
	
	private final PooledHashMap<String, CustomTexture> _textures =
		new PooledHashMap<>();
	private final PooledHashMap<String, CustomParam>   _params   =
		new PooledHashMap<>();
	
	private final int     _uniMatModelView;
	private final int     _uniMatProjection;
	private final int     _uniMatNormal;
	private final int     _uniDirLights;
	private final int     _uniDirLightCount;
	private final int     _uniPointLights;
	private final int     _uniPointLightCount;
	private final boolean _hasLights;
	
	static final BuiltInVariable BUILTIN_VAR_POSITION =
		new BuiltInVariable(ShaderProgram.VARY_POSITION);
	static final BuiltInVariable BUILTIN_VAR_NORMAL   =
		new BuiltInVariable(ShaderProgram.LVAR_NORMAL);
	static final BuiltInVariable BUILTIN_VAR_UTANGENT =
		new BuiltInVariable(ShaderProgram.LVAR_UTANGENT);
	static final BuiltInVariable BUILTIN_VAR_VTANGENT =
		new BuiltInVariable(ShaderProgram.LVAR_VTANGENT);
	static final BuiltInVariable BUILTIN_VAR_TEXCOORD =
		new BuiltInVariable(ShaderProgram.VARY_TEXCOORD);
	
	static final BuiltInFunction BUILTIN_FUNC_NORMALMAPPING =
		new BuiltInFunction(ShaderProgram.FUNC_NORMALMAPPING);
	static final BuiltInFunction BUILTIN_FUNC_PARALLAX =
		new BuiltInFunction(ShaderProgram.FUNC_PARALLAX);
	static final BuiltInFunction BUILTIN_FUNC_PHONG =
		new BuiltInFunction(ShaderProgram.FUNC_PHONG);
	
	public final AbstractEngine engine;

	private final void _setDirLightData(
			final PooledLinkedList<Entity.Instance> lights) {
		
		int offset = 0;
		
		for(Entity.Instance i : lights) {
			
			final DirectionalLight light   = (DirectionalLight)i.getEntity();
			final float[]          dotBias = light.dotBias.getActiveValue();
			
			// Apply the transformation to the light direction and copy it into
			// the data array
			light.direction.getActiveValue().getData(_lightData, offset);
			i.tfToCameraSpace.applyToDirVector(_lightData, offset);
			
			// Copy the color to the data array
			light.color.getActiveValue().getData(_lightData, offset + 4);
			
			// Split the bias data and copy it to the data array
			_lightData[offset + 3] = dotBias[0];
			_lightData[offset + 7] = dotBias[1];

			offset += 8;
		}
		
		glUniform4fv(_uniDirLights,     _lightData);
		glUniform1i (_uniDirLightCount, lights.getSize());
	}

	private final void _setPointLightData(
			final PooledLinkedList<Entity.Instance> lights) {
		
		int offset = 0;
		
		for(Entity.Instance i : lights) {
			
			final PointLight light       = (PointLight)i.getEntity();
			final float[]    attenuation = light.attenuation.getActiveValue();
			
			// Apply the transformation to the light position and copy it into
			// the data array
			for(int j = 0; j < 3; j++) _lightData[offset + j] = 0;
			i.tfToCameraSpace.applyToPoint(_lightData, offset, (byte)3);
			
			// Copy the color to the data array
			light.color.getActiveValue().getData(_lightData, offset + 4);
			
			// Split the attenuation data and copy it to the data array
			_lightData[offset + 3] = attenuation[0];
			_lightData[offset + 7] = attenuation[1];

			offset += 8;
		}
		
		glUniform4fv(_uniPointLights,     _lightData);
		glUniform1i (_uniPointLightCount, lights.getSize());
	}
	
	Material(
			final AbstractEngine          engine,
			final Set<BuiltInVariable>    variables,
			final Set<BuiltInFunction>    functions,
			final Iterable<CustomParam>   params,
			final Iterable<CustomTexture> textures,
			final List<Value>             values,
			final Node                    color,
			final Updater                 updater) {
	
		final Set<ShaderProgram.ShaderComponent> components = new HashSet<>();
		final List<ShaderProgram.LocalVariable>  valueVariables =
			new LinkedList<>();

		engine.addMaterial(this);
		
		this.engine     = engine;
		this._updater   = updater;
		this._lightData = new float[
			Math.max(engine.maxDirLightCount, engine.maxPointLightCount) * 8];
		
		for(BuiltInVariable i : variables) components    .add(i._component);
		for(BuiltInFunction i : functions) components    .add(i._function);
		for(CustomParam     i : params)    components    .add(i._uniform);
		for(CustomTexture   i : textures)  components    .add(i._uniform);
		for(Value           i : values)    valueVariables.add(i._lVariable);
		
		final ShaderProgram program =
			new ShaderProgram(engine, components, valueVariables, color);
		
		_shaderProgram = program.programId;
		
		// Read the locations of the internal uniforms
		_uniMatModelView    =
			program.getUniformLocation(ShaderProgram.UNI_MAT_MODELVIEW);
		_uniMatProjection   =
			program.getUniformLocation(ShaderProgram.UNI_MAT_PROJECTION);
		_uniMatNormal       =
			program.getUniformLocation(ShaderProgram.UNI_MAT_NORMAL);
		_uniDirLights       =
			program.getUniformLocation(ShaderProgram.UNI_DIR_LIGHTS);
		_uniDirLightCount   =
			program.getUniformLocation(ShaderProgram.UNI_DIR_LIGHT_COUNT);
		_uniPointLights     =
			program.getUniformLocation(ShaderProgram.UNI_POINT_LIGHTS);
		_uniPointLightCount =
			program.getUniformLocation(ShaderProgram.UNI_POINT_LIGHT_COUNT);
		
		_hasLights =
			_uniDirLights   != -1 && _uniDirLightCount   != -1 &&
			_uniPointLights != -1 && _uniPointLightCount != -1;
		
		for(CustomParam i : params) {
			i._location = program.getUniformLocation(i._uniform);
			_params.setValue(i._uniform.name, i);
		}
		
		for(CustomTexture i : textures) {
			i._location = program.getUniformLocation(i._uniform);
			_textures.setValue(i._uniform.name, i);
		}
	}
	
	public final Material setParam(
			final String    name,
			final float ... value) {
		
		_params.getValue(name)._value = value;
		return this;
	}
	
	public final Material setTexture(
			final String  name,
			final Texture texture) {
		
		_textures.getValue(name)._texture = texture;
		return this;
	}

	public final void update(
			final double time,
			final double delta) {
		
		if(_updater != null) _updater.updateMaterial(this, time, delta);
	}
	
	public final void use(
			final Matrix4D                          matModelView,
			final Matrix4D                          matProjection,
			final PooledLinkedList<Entity.Instance> dirLights,
			final PooledLinkedList<Entity.Instance> pointLights) {
		
		glUseProgram(_shaderProgram);
		
		if(_uniMatModelView != -1)
			glUniformMatrix4fv(
				_uniMatModelView, false, matModelView.getData(_temp16));
		
		if(_uniMatProjection != -1)
			glUniformMatrix4fv(
				_uniMatProjection, false, matProjection.getData(_temp16));
		
		if(_uniMatNormal != -1)
			glUniformMatrix3fv(
				_uniMatNormal, false, matModelView.getNmData(_temp9));
		
		if(_hasLights) {
    		_setDirLightData  (dirLights);
    		_setPointLightData(pointLights);
		}
		
		int curSlot = 0;
		for(CustomParam   i : _params  .values) i._useParam();
		for(CustomTexture i : _textures.values) i._useTexture(curSlot++);
	}
}
