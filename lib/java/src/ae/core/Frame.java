package ae.core;

import static org.lwjgl.opengl.GL20.*;

import java.util.function.Consumer;

import ae.collections.PooledLinkedList;
import ae.scenegraph.Instance;
import ae.scenegraph.entities.DirectionalLight;
import ae.scenegraph.entities.PointLight;

public final class Frame {
	
	private final PooledLinkedList<Instance> _dirLights   =
		new PooledLinkedList<>();
	private final PooledLinkedList<Instance> _pointLights =
		new PooledLinkedList<>();
	
	private final float[] _dirLightData;
	private final float[] _pointLightData;
	
	private int        _index = -1;
	private long       _absTime;
	private double     _time;
	private double     _delta;
	private SceneGraph _sceneGraph;
	
	public final AbstractEngine engine;
	
	public Consumer<Frame> cbNewFrame = null;

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
	
	Frame(AbstractEngine engine) {
		
		this._dirLightData   = new float[engine.maxDirLightCount   * 8];
		this._pointLightData = new float[engine.maxPointLightCount * 8];
		this.engine          = engine;
	}
	
	final void moveToNext(
			final double     speed,
			final SceneGraph sceneGraph) {

		final long absTimeNew = System.currentTimeMillis();
		
		_index++;
		_delta      = speed * (absTimeNew - _absTime);
		_time       = _index == 0 ? 0 : _time + _delta;
		_absTime    = absTimeNew;
		_sceneGraph = sceneGraph;
		
		// Invoke the callback function
		if(cbNewFrame != null) cbNewFrame.accept(this);
		
		_sceneGraph.prepareRendering(this, _dirLights, _pointLights);
	}
	
	final void cameraChanged() {
		_setDirLightData();
		_setPointLightData();
	}
	
	// TODO: shouldn't be public
	public final void applyLightDataToShader(
			final int uniDirLights,
			final int uniDirLightCount,
			final int uniPointLights,
			final int uniPointLightCount) {
		
		glUniform4fv(uniDirLights,   _dirLightData);
		glUniform4fv(uniPointLights, _pointLightData);
		
		glUniform1i (uniDirLightCount,   _dirLights  .getSize());
		glUniform1i (uniPointLightCount, _pointLights.getSize());
	}
	
	public final int getIndex() {
		return _index;
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
}
