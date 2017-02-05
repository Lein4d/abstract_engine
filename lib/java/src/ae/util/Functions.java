package ae.util;

import java.io.InputStream;
import java.util.LinkedList;
import java.util.List;
import java.util.Scanner;
import java.util.regex.MatchResult;
import java.util.regex.Matcher;

public final class Functions {
	
	private Functions() {}

	public static final void assertCond(
			final boolean cond,
			final String  msg) {
		
		if(!cond)
			throw msg != null ?
				new AssertException(msg) : new AssertException();
	}
	
	public static final <T> T assertNotNull(
			final T      obj,
			final String msg) {
		
		if(obj == null)
			throw new AssertException(msg != null ? msg : "Object is null");
		
		return obj;
	}

	public static final void assertNull(
			final Object obj,
			final String msg) {
		
		if(obj != null)
			throw new AssertException(msg != null ? msg : "Object is not null");
	}
	
	public static final int clamp(
			final int value,
			final int min,
			final int max) {
		
		return value < min ? min : (value > max ? max : value);
	}

	public static final float clamp(
			final float value,
			final float min,
			final float max) {
		
		return value < min ? min : (value > max ? max : value);
	}

	public static final double clamp(
			final double value,
			final double min,
			final double max) {
		
		return value < min ? min : (value > max ? max : value);
	}
	
	public static final int clampArrayAccess(
			final int index,
			final int length) {
		
		return index < 0 ? 0 : (index >= length ? length - 1 : index);
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
	
	public static final List<MatchResult> getMatches(
			final Matcher matcher) {
		
		final List<MatchResult> results = new LinkedList<>();
		
		while(matcher.find()) results.add(matcher.toMatchResult());
		return results;
	}
	
	public static final String getStreamAsString(final InputStream in) {
		
		final Scanner scanner = new Scanner(in);
		final String  result  = scanner.useDelimiter("\\A").next();
		
		scanner.close();
		
		return result;
	}
	
	public static final float mix(
			final float x1,
			final float x2,
			final float ratio) {
		
		return (1 - ratio) * x1 + ratio * x2;
	}

	public static final double mix(
			final double x1,
			final double x2,
			final double ratio) {
		
		return (1 - ratio) * x1 + ratio * x2;
	}

	public static final float mixRev(
			final float x1,
			final float x2,
			final float value) {
		
		return (value - x1) / (x2 - x1);
	}
	
	public static final double mixRev(
			final double x1,
			final double x2,
			final double value) {
		
		return (value - x1) / (x2 - x1);
	}
	
	public static final int packNormalizedFloatInInt(
			final float x,
			final int   bitCount) {
		
		return (int)(x * 0x7FFFFFFF) >>> (32 - bitCount);
	}
}
