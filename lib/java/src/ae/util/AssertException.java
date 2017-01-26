package ae.util;

@SuppressWarnings("serial")
public final class AssertException extends RuntimeException {
	
	public AssertException() {}
	
	public AssertException(final String msg) {
		super(msg);
	}
}
