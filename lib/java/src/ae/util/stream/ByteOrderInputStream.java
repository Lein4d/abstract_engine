package ae.util.stream;

import java.io.FilterInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;

public final class ByteOrderInputStream extends FilterInputStream {
	
	private final boolean    _bigEndian;
	private final ByteBuffer _buffer = ByteBuffer.allocate(8);
	
	public final ByteOrder byteOrder;
	
	public ByteOrderInputStream(final InputStream in) {
		this(in, ByteOrder.BIG_ENDIAN);
	}
	
	public ByteOrderInputStream(
			final InputStream in,
			final ByteOrder   byteOrder) {
		
		super(in);
		
		this.byteOrder  = byteOrder;
		this._bigEndian = byteOrder == ByteOrder.BIG_ENDIAN;
	}
	
	@Override
	public final int read() throws IOException {
		return in.read();
	}

	@Override
	public final int read(final byte[] b) throws IOException {
		return in.read(b);
	}

	@Override
	public int read(
			final byte[] b,
			final int    off,
			final int    len) throws IOException {
		
		return in.read(b, off, len);
	}
	
	public final boolean readBoolean() throws IOException {
		return in.read() != 0;
	}
	
	public final byte readByte() throws IOException {
		return (byte)in.read();
	}
	
	public final char readChar() throws IOException {
		return _bigEndian ?
			(char)(in.read() << 8 | in.read()) :
			(char)(in.read() | in.read() << 8);
	}
	
	public final double readDouble() throws IOException {
		
		_buffer.rewind();
		_buffer.putLong(readLong());
		_buffer.rewind();
		
		return _buffer.getDouble();
	}
	
	public final float readFloat() throws IOException {
		
		_buffer.rewind();
		_buffer.putInt(readInt());
		_buffer.rewind();
		
		return _buffer.getFloat();
	}
	
	public final int readInt() throws IOException {
		return _bigEndian ?
			in.read() << 24 | in.read() << 16 | in.read() << 8 | in.read() :
			in.read() | in.read() << 8 | in.read() << 16 | in.read() << 24;
	}
	
	public final long readLong() throws IOException {
		
		return _bigEndian ?
			
			(long)in.read() << 56 | (long)in.read() << 48 |
			(long)in.read() << 40 | (long)in.read() << 32 |
			(long)in.read() << 24 | (long)in.read() << 16 |
			(long)in.read() <<  8 | (long)in.read() :
			
			(long)in.read()       | (long)in.read() <<  8 |
			(long)in.read() << 16 | (long)in.read() << 24 |
			(long)in.read() << 32 | (long)in.read() << 40 |
			(long)in.read() << 48 | (long)in.read() << 56;
	}
	
	public final short readShort() throws IOException {
		return (short)(_bigEndian ?
			in.read() << 8 | in.read() :
			in.read()      | in.read() << 8);
	}
}
