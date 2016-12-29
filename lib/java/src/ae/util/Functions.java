package ae.util;

import java.io.InputStream;
import java.util.Scanner;
import java.util.regex.MatchResult;
import java.util.regex.Matcher;

import ae.collections.PooledLinkedList;

public final class Functions {
	
	private Functions() {}

	public static final <T> T assertNotNull(
			final T      obj,
			final String msg) {
		
		if(obj == null)
			throw new NullPointerException(
				msg != null ? msg : "Object is null");
		
		return obj;
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
	
	public static final PooledLinkedList<MatchResult> getMatches(
			final Matcher matcher) {
		
		final PooledLinkedList<MatchResult> results = new PooledLinkedList<>();
		
		while(matcher.find()) results.insertAtEnd(matcher.toMatchResult());
		
		return results;
	}
	
	public static final String getStreamAsString(final InputStream in) {
		
		final Scanner scanner = new Scanner(in);
		final String  result  = scanner.useDelimiter("\\A").next();
		
		scanner.close();
		
		return result;
	}
	
	public static final int packNormalizedFloatInInt(
			final float x,
			final int   bitCount) {
		
		return (int)(x * 0x7FFFFFFF) >>> (32 - bitCount);
	}
}
