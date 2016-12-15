package ae.util;

public final class Wrapper<T> {
	
	public T v = null;
	
	public Wrapper() {}
	
	public Wrapper(final T value) {
		v = value;
	}
}
