package ae.material1;

public final class Node {
	
	private final NodeTemplate _template;
	private final Node[]       _inputs;
	
	final GlslType type;
	
	Node(
			final NodeTemplate template,
			final GlslType     type,
			final Node[]       inputs) {
		
		_template = template;
		_inputs   = inputs;
		this.type = type;
	}
	
	final String toSourceString() {
		return toSourceString(new StringBuilder()).toString();
	}
	
	final StringBuilder toSourceString(final StringBuilder dst) {
		
		for(int i = 0; i < _inputs.length; i++)
			_inputs[i].toSourceString(dst.append(_template.getSepString(i)));
		
		dst.append(_template.getLastSepString());
		
		return dst;
	}
}
