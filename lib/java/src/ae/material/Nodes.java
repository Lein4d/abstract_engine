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
		
		public Merge(
				final String     name,
				final String ... components) {
			
			super(name, components);
			_componentCount = components.length;
		}
		
		@Override
		public final void computeTypes() {
			
			int absComponentCount = 0;
			
			for(int i = 0; i < _componentCount; i++)
				absComponentCount += _getInputDimension(i);
			
			if(absComponentCount > 4)
				throw new UnsupportedOperationException();
			
			_addOutput(null, absComponentCount);
			_typingSuccessful();
		}
		
		@Override
		public final void toSourceString(final StringBuilder dst) {
			
			// TODO
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
