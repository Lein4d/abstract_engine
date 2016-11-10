package ae.util;

public final class Functions {
	
	private Functions() {}

	public static final void assertNotNull(
			final Object obj,
			final String msg) {
		
		if(obj == null)
			throw new NullPointerException(
				msg != null ? msg : "Object is null");
	}
	
	public static final int[][] cloneArray2D(
			final int[][] array) {
		
		if(array == null) return null;
		
		final int[][] result = new int[array.length][];
		
		for(int i = 0; i < array.length; i++)
			result[i] = array[i].clone();
		
		return result;
	}
	
	public static final float[][] cloneArray2D(
			final float[][] array) {
		
		if(array == null) return null;
		
		final float[][] result = new float[array.length][];
		
		for(int i = 0; i < array.length; i++)
			result[i] = array[i].clone();
		
		return result;
	}
	
	public static final <T> T[] copyArray2D(
			final T[] src,
			final int srcPos,
			final T[] dst,
			final int dstPos,
			final int subLength,
			final int length) {

		if(length <= 0) return dst;
		
		if(src.length < srcPos + length)
			throw new IndexOutOfBoundsException("Source array too small");

		if(dst.length < dstPos + length)
			throw new IndexOutOfBoundsException("Destination array too small");

		for(int i = 0; i < length; i++)
			System.arraycopy(src[srcPos + i], 0, dst[dstPos + i], 0, subLength);
		
		return dst;
	}
}
