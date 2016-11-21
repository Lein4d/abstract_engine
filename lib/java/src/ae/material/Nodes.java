package ae.material;

public final class Nodes {
	
	private static final class Constant extends Node {
		
		private final float[] _values;
		
		public Constant(
				final String  name,
				final float[] values) {
			
			super(name);
			_values = values;
		}
		
		@Override
		public final void computeTypes() {
			_addOutput(null, _values.length);
			_typingSuccessful();
		}

		@Override
		public final void toSourceString(final StringBuilder dst) {
			
			if(_values.length == 1) {
				dst.append(_values[0]);
			} else {
				dst.append("vec").append(_values.length).append('(');
				for(float i : _values) dst.append(i).append(',');
				dst.setLength(dst.length() - 1);
				dst.append(')');
			}
		}
	}
	
	private static final class Merge extends Node {
		
	    private final int _componentCount;
	    private       int _absComponentCount = 0;
		
		public Merge(
				final String   name,
				final String[] components) {
			
			super(name, components);
			_componentCount = components.length;
		}
		
		@Override
		public final void computeTypes() {
			
			for(int i = 0; i < _componentCount; i++)
				_absComponentCount += _getInputDimension(i);
			
			if(_absComponentCount > 4)
				throw new UnsupportedOperationException();
			
			_addOutput(null, _absComponentCount);
			_typingSuccessful();
		}
		
		@Override
		public final void toSourceString(final StringBuilder dst) {
			
			if(_absComponentCount == 1) {
				
				_getInputNode(0).toSourceString(dst);
				
			} else {
				
				dst.append("vec").append(_absComponentCount).append('(');
				
				for(int i = 0; i < _componentCount - 1; i++) {
					_getInputNode(i).toSourceString(dst);
					dst.append(", ");
				}
				
				_getInputNode(_componentCount - 1).toSourceString(dst);
				dst.append(')');
			}
		}
	}
	
	private static final class NormalMap extends Node {

		protected NormalMap(
				final String name,
				final String texture) {
			
			super(name, texture);
		}

		@Override
		public final void computeTypes() {
			
			if(_getInputDimension(0) < 3)
				throw new UnsupportedOperationException(
					"Normal map needs at least 3 dimensional input");
			
			_addOutput(null, 3);
			_typingSuccessful();
		}

		@Override
		public final void toSourceString(final StringBuilder dst) {
			dst.append('(');
			_getInputNode(0).toSourceString(dst);
			dst.append(".xyz * 2 - 1)");
		}
	}
	
	private static final class Swizzle extends Node {
		
		private final String _swizzleMask;
		
		public Swizzle(
				final String name,
				final String input,
				final String swizzleMask) {
			
			super(name, input);
			_swizzleMask = swizzleMask;
		}

		@Override
		public final void computeTypes() {
			_addOutput(null, _swizzleMask.length());
			_typingSuccessful();
		}
		
		@Override
		public final void toSourceString(final StringBuilder dst) {
			_getInputNode(0).toSourceString(dst);
			dst.append('.').append(_swizzleMask);
		}
	}
	
	private Nodes() {}
	
	public static final Node colorTexture(
			final String name,
			final String texture) {
		
		return swizzle(name, texture, "rgb");
	}
	
	public static final Node constant(
    		final String    name,
    		final float ... values) {
		
		return new Constant(name, values);
	}
	
	public static final Node merge(
    		final String     name,
    		final String ... components) {
		
		return new Merge(name, components);
	}
	
	public static final Node normalMap(
    		final String name,
    		final String texture) {
		
		return new NormalMap(name, texture);
	}
	
	public static final Node swizzle(
    		final String name,
    		final String input,
    		final String swizzleMask) {
		
		return new Swizzle(name, input, swizzleMask);
	}
}
