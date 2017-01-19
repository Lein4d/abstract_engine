package ae.util.stream;

import java.io.FilterOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;

public final class ByteOrderOutputStream extends FilterOutputStream {
	
	private final boolean    _bigEndian;
	private final ByteBuffer _buffer = ByteBuffer.allocate(8);
	
	public final ByteOrder byteOrder;
	
	protected int invertByte(
			int b) {
		
		return
				(b & 0x01) << 7 | (b & 0x02) << 5 | (b & 0x04) << 3 | (b & 0x08) << 1 |
				(b & 0x10) >> 1 | (b & 0x20) >> 3 | (b & 0x40) >> 5 | (b & 0x80) >> 7;
	}
	
	public ByteOrderOutputStream(final OutputStream out) {
		this(out, ByteOrder.BIG_ENDIAN);
	}
	
	public ByteOrderOutputStream(
			final OutputStream out,
			final ByteOrder    byteOrder) {
		
		super(out);
		
		this.byteOrder  = byteOrder;
		this._bigEndian = byteOrder == ByteOrder.BIG_ENDIAN;
	}
	
	@Override
	public final void write(final int b) throws IOException {
		writeByte((byte)b);
	}
	
	@Override
	public final void write(final byte[] b) throws IOException {
		out.write(b);
	}
	
	@Override
	public final void write(
			final byte[] b,
			final int    off,
			final int    len) throws IOException {
		
		out.write(b, off, len);
	}
	
	public final void writeBoolean(final boolean value) throws IOException {
		out.write(value ? 0xFF : 0x00);
	}
	
	public final void writeByte(final byte value) throws IOException {
		out.write(value);
	}
	
	public final void writeChar(final char value) throws IOException {
		
		if(_bigEndian) {
			out.write(value >> 8 & 0xFF);
			out.write(value      & 0xFF);
		} else {
			out.write(value      & 0xFF);
			out.write(value >> 8 & 0xFF);
		}
	}
	
	public final void writeDouble(final double value) throws IOException {
		
		_buffer.rewind();
		_buffer.putDouble(value);
		_buffer.rewind();
		
		writeLong(_buffer.getLong());
	}
	
	public final void writeFloat(final float value) throws IOException {
		
		_buffer.rewind();
		_buffer.putFloat(value);
		_buffer.rewind();
		
		writeInt(_buffer.getInt());
	}
	
	public final void writeInt(final int value) throws IOException {
		
		if(_bigEndian) {
			out.write(value >> 24 & 0xFF);
			out.write(value >> 16 & 0xFF);
			out.write(value >>  8 & 0xFF);
			out.write(value       & 0xFF);
		} else {
			out.write(value       & 0xFF);
			out.write(value >>  8 & 0xFF);
			out.write(value >> 16 & 0xFF);
			out.write(value >> 24 & 0xFF);
		}
	}
	
	public final void writeLong(final long value) throws IOException {
		
		if(_bigEndian) {
			out.write((int)(value >> 56 & 0xFF));
			out.write((int)(value >> 48 & 0xFF));
			out.write((int)(value >> 40 & 0xFF));
			out.write((int)(value >> 32 & 0xFF));
			out.write((int)(value >> 24 & 0xFF));
			out.write((int)(value >> 16 & 0xFF));
			out.write((int)(value >>  8 & 0xFF));
			out.write((int)(value       & 0xFF));
		} else {
			out.write((int)(value       & 0xFF));
			out.write((int)(value >>  8 & 0xFF));
			out.write((int)(value >> 16 & 0xFF));
			out.write((int)(value >> 24 & 0xFF));
			out.write((int)(value >> 32 & 0xFF));
			out.write((int)(value >> 40 & 0xFF));
			out.write((int)(value >> 48 & 0xFF));
			out.write((int)(value >> 56 & 0xFF));
		}
	}
	
	public final void writeShort(final short value) throws IOException {
		
		if(_bigEndian) {
			out.write(value >> 8 & 0xFF);
			out.write(value      & 0xFF);
		} else {
			out.write(value      & 0xFF);
			out.write(value >> 8 & 0xFF);
		}
	}
}
