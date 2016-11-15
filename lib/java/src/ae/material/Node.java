package ae.material;

import ae.collections.PooledHashMap;
import ae.util.Functions;

public abstract class Node {
	
	protected final class Input {
		
		private Node _node;
		
		protected final String _name;
		protected final String _attribute;
		
		private Input(final String fullName) {
			
			final int sepPos = fullName.indexOf(".");
			
			if(sepPos >= 0) {
				_name      = fullName.substring(0, sepPos);
				_attribute = fullName.substring(sepPos + 1);
			} else {
				_name      = fullName;
				_attribute = null;
			}
		}
		
		protected final int _getDimension() {
			return _node._getOutputDimension(_attribute);
		}
	}
	
	private final PooledHashMap<String, Integer> _outputs =
		new PooledHashMap<>();
	
	private final Input[] _inputs;
	private       boolean _typed = false;
	
	public final String name;
	
	protected Node(
			final String     name,
			final String ... inputNames) {
		
		this._inputs = new Input[inputNames.length];
		this.name    = name;
		
		for(int i = 0; i < inputNames.length; i++)
			_inputs[i] = new Input(inputNames[i]);
	}
	
	protected final Node _addOutput(
			final String outputName,
			final int    dimension) {
		
		_outputs.setValue(outputName, dimension);
		return this;
	}
	
	protected final int _getInputDimension(final int index) {
		final Input input = _inputs[index];
		return input._node._getOutputDimension(input._attribute);
	}
	
	protected final Node _getInputNode(final int index) {
		return _inputs[index]._node;
	}
	
	protected final int _getOutputDimension(final String output) {
		return _outputs.getValue(output);
	}
	
	protected final void _typingSuccessful() {
		_typed = true;
	}
	
	public final boolean areInputsTyped() {
		for(Input i : _inputs) if(!i._node._typed) return false;
		return true;
	}
	
	public abstract void computeTypes();
	
	public final void resolveInputNodes(final Material material) {
		
		for(Input i : _inputs)
			i._node = Functions.assertNotNull(
				material.getNode(i._name),
				"Input node '" + i._name + "' cannot be resolved");
	}
	
	public abstract void toSourceString(StringBuilder dst);
}
