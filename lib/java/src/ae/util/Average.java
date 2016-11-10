package ae.util;

public abstract class Average {

	public enum Type {
		INT, LONG, FLOAT, DOUBLE
	}

	protected final int[]    _slotsInt;
	protected final long[]   _slotsLong;
	protected final float[]  _slotsFloat;
	protected final double[] _slotsDouble;

	protected Average(
			final Type type,
			final int  slotCount) {
		
		_slotsInt    = type == Type.INT    ? new int   [slotCount] : null;
		_slotsLong   = type == Type.LONG   ? new long  [slotCount] : null;
		_slotsFloat  = type == Type.FLOAT  ? new float [slotCount] : null;
		_slotsDouble = type == Type.DOUBLE ? new double[slotCount] : null;
	}
	
	public abstract int    addValue(int    value);
	public abstract long   addValue(long   value);
	public abstract float  addValue(float  value);
	public abstract double addValue(double value);
}
