package ae.material;

import static org.lwjgl.opengl.GL11.*;
import static org.lwjgl.opengl.GL13.*;
import static org.lwjgl.opengl.GL20.*;

import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Set;
import java.util.function.BiConsumer;

import ae.collections.PooledHashMap;
import ae.core.AbstractEngine;
import ae.core.RenderState;
import ae.core.GlslShader;
import ae.core.Texture;

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
	
	private final GlslShader _glslShader;
	
	private final BiConsumer<Material, RenderState>          _cbUpdate;
	private final PooledHashMap<String, CustomTexture> _textures =
		new PooledHashMap<>();
	private final PooledHashMap<String, CustomParam>   _params   =
		new PooledHashMap<>();
	
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

	Material(
			final AbstractEngine              engine,
			final String                      name,
			final Set<BuiltInVariable>        variables,
			final Set<BuiltInFunction>        functions,
			final Iterable<CustomParam>       params,
			final Iterable<CustomTexture>     textures,
			final List<Value>                 values,
			final Node                        color,
			final BiConsumer<Material, RenderState> cbUpdate) {
	
		final Set<ShaderProgram.ShaderComponent> components = new HashSet<>();
		final List<ShaderProgram.LocalVariable>  valueVariables =
			new LinkedList<>();

		engine.addMaterial(this);
		
		this.engine    = engine;
		this._cbUpdate = cbUpdate;
		
		for(BuiltInVariable i : variables) components    .add(i._component);
		for(BuiltInFunction i : functions) components    .add(i._function);
		for(CustomParam     i : params)    components    .add(i._uniform);
		for(CustomTexture   i : textures)  components    .add(i._uniform);
		for(Value           i : values)    valueVariables.add(i._lVariable);
		
		final ShaderProgram program =
			new ShaderProgram(engine, name, components, valueVariables, color);
		
		_glslShader = program.glslShader;
		
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

	public final void update() {
		if(_cbUpdate != null) _cbUpdate.accept(this, engine.state);
	}
	
	public final void use() {
		
		_glslShader.bind();
		
		engine.state.newGlslShader(_glslShader);
		engine.state.applyUniformsToShader();
		
		int curSlot = 0;
		for(CustomParam   i : _params  .values) i._useParam();
		for(CustomTexture i : _textures.values) i._useTexture(curSlot++);
	}
}
