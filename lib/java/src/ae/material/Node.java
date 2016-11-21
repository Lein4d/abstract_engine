package ae.material;

import ae.util.Functions;

public abstract class Node {
	
	private final String[] _inputNames;
	private final Node[]   _inputs;
	
	protected int _outputDim = 0;
	
	public final String name;
	
	protected Node(
			final String     name,
			final String ... inputNames) {
		
		this._inputNames = inputNames;
		this._inputs     = new Node[inputNames.length];
		this.name        = name;
	}
	
	protected final int _getInputDimension(final int index) {
		return _inputs[index]._outputDim;
	}
	
	protected final Node _getInputNode(final int index) {
		return _inputs[index];
	}
	
	public final boolean areInputsTyped() {
		for(Node i : _inputs) if(i._outputDim == 0) return false;
		return true;
	}
	
	public abstract void computeTypes();
	
	public final void resolveInputNodes(final Material material) {
		
		for(int i = 0; i < _inputs.length; i++)
			_inputs[i] = Functions.assertNotNull(
				material.getNode(_inputNames[i]),
				"Input node '" + _inputNames[i] + "' cannot be resolved");
	}
	
	public abstract void toSourceString(StringBuilder dst);
}
