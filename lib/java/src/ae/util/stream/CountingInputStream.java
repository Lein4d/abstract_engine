package ae.util.stream;

import java.io.FilterInputStream;
import java.io.IOException;
import java.io.InputStream;

public final class CountingInputStream extends FilterInputStream {
	
	private long _position = 0;
	private long _mark     = 0;
	
	public CountingInputStream(final InputStream in) {
		super(in);
	}
	
	public final long getPosition() {
		return _position;
	}

	public final int getPositionI() {
		return (int)_position;
	}
	
	@Override
	public final void mark(final int readlimit) {
		in.mark(readlimit);
		_mark = _position;
	}
	
	@Override
	public final int read() throws IOException {
		_position++;
		return in.read();
	}
	
	@Override
	public final int read(final byte[] b) throws IOException {
		
		final int byteCount = in.read(b);
		if(byteCount > 0) _position += byteCount;
		
		return byteCount;
	}
	
	@Override
	public final int read(
			final byte[] b,
			final int    off,
			final int    len) throws IOException {
		
		final int byteCount = in.read(b, off, len);
		if(byteCount > 0) _position += byteCount;
		
		return byteCount;
	}
	
	@Override
	public final void reset() throws IOException {
		
		if(!in.markSupported()) throw new IOException("Mark not supported");
		
		in.reset();
		_position = _mark;
	}
	
	@Override
	public final long skip(final long n) throws IOException {
		
		final long byteCount = in.skip(n);
		_position += byteCount;
		
		return byteCount;
	}
}
