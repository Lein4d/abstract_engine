package ae.core;

import static org.lwjgl.opengl.GL20.*;

import ae.collections.PooledLinkedList;
import ae.math.Matrix4D;
import ae.scenegraph.Instance;
import ae.scenegraph.entities.DirectionalLight;
import ae.scenegraph.entities.PointLight;
import ae.util.Event;

public final class RenderState {
	
	private final class FpsCounter {
		
		private int  _counter = 0;
		private long _nextThreshold;

		private FpsCounter(final int threshold) {
			_nextThreshold = (_absTime / 1000) * 1000 + threshold;
		}
		
		private final void _count() {
			
			if(_absTime >= _nextThreshold) {
				_nextThreshold += 1000;
				_fpsCounter     = _counter;
				_counter        = 0;
			}
			
			_counter++;
		}
	}
	
	public final class UpdateEvent<H> extends Event<UpdateEvent<H>, H> {
		
		private UpdateEvent(final H host) {
			super(host);
		}
		
		public final double getTime() {
			return RenderState.this._time;
		}
		
		public final float getTimeF() {
			return (float)RenderState.this._time;
		}
		
		public final double getTimeDelta() {
			return RenderState.this._delta;
		}
		
		public final float getTimeDeltaF() {
			return (float)RenderState.this._delta;
		}
	}
	
	private final PooledLinkedList<Instance> _dirLights   =
		new PooledLinkedList<>();
	private final PooledLinkedList<Instance> _pointLights =
		new PooledLinkedList<>();
	
	private final FpsCounter[] _fpsCounters;
	private final float[]      _matModelViewData  = new float[16];
	private final float[]      _matProjectionData = new float[16];
	private final float[]      _matNormalData     = new float[9];
	private final float[]      _dirLightData;
	private final float[]      _pointLightData;
	
	private int        _frameIndex = -1;
	private long       _absTime;
	private double     _time;
	private double     _delta;
	private int        _fpsCounter = 0;
	private SceneGraph _sceneGraph;
	private GlslShader _shader;
	private float      _objectId;
	
	public final AbstractEngine            engine;
	public final Event.Notify<RenderState> onNewFrame =
		new Event.Notify<>(this);

	private final void _setDirLightData() {
		
		int offset = 0;
		
		for(Instance i : _dirLights) {
			
			final DirectionalLight light   = (DirectionalLight)i.getEntity();
			final float[]          dotBias = light.dotBias.getActiveValue();
			
			// Apply the transformation to the light direction and copy it into
			// the data array
			light.direction.getActiveValue().getData(_dirLightData, offset);
			i.tfToCameraSpace.applyToDirVector(_dirLightData, offset);
			
			// Copy the color to the data array
			light.color.getActiveValue().getData(_dirLightData, offset + 4);
			
			// Split the bias data and copy it to the data array
			_dirLightData[offset + 3] = dotBias[0];
			_dirLightData[offset + 7] = dotBias[1];

			offset += 8;
		}
	}

	private final void _setPointLightData() {
		
		int offset = 0;
		
		for(Instance i : _pointLights) {
			
			final PointLight light       = (PointLight)i.getEntity();
			final float[]    attenuation = light.attenuation.getActiveValue();
			
			// Apply the transformation to the light position and copy it into
			// the data array
			i.tfToCameraSpace.applyToOrigin(_pointLightData, offset, (byte)3);
			
			// Copy the color to the data array
			light.color.getActiveValue().getData(_pointLightData, offset + 4);
			
			// Split the attenuation data and copy it to the data array
			_pointLightData[offset + 3] = attenuation[0];
			_pointLightData[offset + 7] = attenuation[1];
			
			offset += 8;
		}
	}
	
	RenderState(
			final AbstractEngine engine,
			final int            fpsSlotCount) {
		
		this._fpsCounters    = new FpsCounter[fpsSlotCount];
		this._dirLightData   = new float[engine.maxDirLightCount   * 8];
		this._pointLightData = new float[engine.maxPointLightCount * 8];
		this.engine          = engine;
	}
	
	final void beginNextFrame(
			final double     speed,
			final SceneGraph sceneGraph) {
		
		final long absTimeNew = System.currentTimeMillis();
		
		if(_frameIndex == -1) {
			
			// Prevent a huge delta in the first frame
			_absTime = absTimeNew;
			
			for(int i = 0; i < _fpsCounters.length; i++)
				_fpsCounters[i] =
					new FpsCounter((i * 1000) / _fpsCounters.length);
		}
		
		_frameIndex++;
		_delta      = speed * (absTimeNew - _absTime);
		_time       = _frameIndex == 0 ? 0 : _time + _delta;
		_absTime    = absTimeNew;
		_sceneGraph = sceneGraph;
		
		for(FpsCounter i : _fpsCounters) i._count();
		
		onNewFrame.fire();
		
		_sceneGraph.prepareRendering(_dirLights, _pointLights);
	}
	
	final void newCamera(final Matrix4D projection) {
		
		projection.getData(_matProjectionData);
		
		_setDirLightData();
		_setPointLightData();
	}

	// TODO: shouldn't be public
	public final void applyUniformsToShader() {
		
		glUniformMatrix4fv(_shader.uniMatModelView,  false, _matModelViewData);
		glUniformMatrix4fv(_shader.uniMatProjection, false, _matProjectionData);
		glUniformMatrix3fv(_shader.uniMatNormal,     false, _matNormalData);
		
		glUniform1f(_shader.uniObjectId, _objectId);
		
		glUniform4fv(_shader.uniDirLights,   _dirLightData);
		glUniform4fv(_shader.uniPointLights, _pointLightData);
		
		glUniform1i(_shader.uniDirLightCount,   _dirLights  .getSize());
		glUniform1i(_shader.uniPointLightCount, _pointLights.getSize());
	}
	
	public final <H> UpdateEvent<H> createUpdateEvent(final H host) {
		return new UpdateEvent<H>(host);
	}
	
	public final int getFPS() {
		return _fpsCounter;
	}
	
	public final int getFrameIndex() {
		return _frameIndex;
	}
	
	public final SceneGraph getSceneGraph() {
		return _sceneGraph;
	}
	
	public final double getTime() {
		return _time;
	}
	
	public final double getTimeDelta() {
		return _delta;
	}

	public final float getTimeDeltaF() {
		return (float)_delta;
	}
	
	public final float getTimeF() {
		return (float)_time;
	}

	// TODO: shouldn't be public
	public final void newGlslShader(final GlslShader glslShader) {
		_shader = glslShader;
	}
	
	// TODO: shouldn't be public
	public final void newModelInstance(final Instance instance) {
		
		_objectId = instance.getId();
		
		instance.tfToCameraSpace.getData  (_matModelViewData);
		instance.tfToCameraSpace.getNmData(_matNormalData);
	}
}
