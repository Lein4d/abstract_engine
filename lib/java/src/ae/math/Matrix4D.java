package ae.math;

import ae.util.CachedObject;
import ae.util.OrganizedObject;

public final class Matrix4D extends OrganizedObject<Matrix4D> {
	
	public final class MatrixVector extends VectorBackend {
		
		private final boolean _isRow;
		private final int     _rcIndex;
		
		@Override
		protected final float _getElement(final int index) {
			return _isRow ?
				Matrix4D.this.getElement(_rcIndex, index) :
				Matrix4D.this.getElement(index,    _rcIndex);
		}
		
		@Override
		protected final float _getX() {return getElement(0);}
		@Override
		protected final float _getY() {return getElement(1);}
		@Override
		protected final float _getZ() {return getElement(2);}
		@Override
		protected final float _getW() {return getElement(3);}

		@Override
		protected final void _setElement(
				final int   index,
				final float value) {
			
			Matrix4D.this.setElement(
				_isRow ? _rcIndex : index, _isRow ? index : _rcIndex, value);
		}
		
		@Override
		protected final void _setX(final float x) {_setElement(0, x);}
		@Override
		protected final void _setY(final float y) {_setElement(0, y);}
		@Override
		protected final void _setZ(final float z) {_setElement(0, z);}
		@Override
		protected final void _setW(final float w) {_setElement(0, w);}

		public MatrixVector(
				final boolean isRow,
				final int     rcIndex) {
			
			_isRow   = isRow;
			_rcIndex = rcIndex;
		}
	}
	
	private static final float RAD_FACTOR = 0.0174532f;
	
	// Die Matrix ist spaltenweise organisiert
	private final float[] _data = new float[16];
	private final float[] _temp = new float[16];

	// Die Normalenmatrix ist die Inverse der transponierten oberen 3x3 Matrix
	private final CachedObject<float[]> _dataNmCached = new CachedObject<>(
		new float[9], (object) -> _computeNormalMatrix(object));
	
	private final Vector4D[] _columnVectors = new Vector4D[4];
	private final Vector4D[] _rowVectors    = new Vector4D[4];
	
	// I_Mij = Index des Eintrags in Zeile i und Spalte j
	public static final int I_M11 =  0;
	public static final int I_M12 =  4;
	public static final int I_M13 =  8;
	public static final int I_M14 = 12;
	public static final int I_M21 =  1;
	public static final int I_M22 =  5;
	public static final int I_M23 =  9;
	public static final int I_M24 = 13;
	public static final int I_M31 =  2;
	public static final int I_M32 =  6;
	public static final int I_M33 = 10;
	public static final int I_M34 = 14;
	public static final int I_M41 =  3;
	public static final int I_M42 =  7;
	public static final int I_M43 = 11;
	public static final int I_M44 = 15;

	// I_NMij = Index des Eintrags in Zeile i und Spalte j (Normalenmatrix)
	public static final int I_NM11 = 0;
	public static final int I_NM12 = 3;
	public static final int I_NM13 = 6;
	public static final int I_NM21 = 1;
	public static final int I_NM22 = 4;
	public static final int I_NM23 = 7;
	public static final int I_NM31 = 2;
	public static final int I_NM32 = 5;
	public static final int I_NM33 = 8;

	private final float[] _computeNormalMatrix(
			final float[] dataNm) {

		// Die Werte transponiert aus der Hauptmatrix auslesen
		final float a0 = _data[I_M11], a3 = _data[I_M21], a6 = _data[I_M31];
		final float a1 = _data[I_M12], a4 = _data[I_M22], a7 = _data[I_M32];
		final float a2 = _data[I_M13], a5 = _data[I_M23], a8 = _data[I_M33];
	
		// Diskriminante als geschlossene Formel
		final float d =
			a0 * a4 * a8 + a3 * a7 * a2 + a6 * a1 * a5 - a2 * a4 * a6 -
			a5 * a7 * a0 - a8 * a1 * a3;
		
		// Zeile 1
		dataNm[I_NM11] = (a4 * a8 - a5 * a7) / d;
		dataNm[I_NM12] = (a5 * a6 - a3 * a8) / d;
		dataNm[I_NM13] = (a3 * a7 - a6 * a4) / d;
		
		// Zeile 2
		dataNm[I_NM21] = (a2 * a7 - a1 * a8) / d;
		dataNm[I_NM22] = (a0 * a8 - a2 * a6) / d;
		dataNm[I_NM23] = (a1 * a6 - a0 * a7) / d;
		
		// Zeile 3
		dataNm[I_NM31] = (a1 * a5 - a2 * a4) / d;
		dataNm[I_NM32] = (a2 * a3 - a0 * a5) / d;
		dataNm[I_NM33] = (a0 * a4 - a1 * a3) / d;
		
		return dataNm;
	}

	private final void _propagateNmChange() {
		
		_dataNmCached.invalidate();
		_propagateChange();
	}
	
	private final void _propagateRowColumnChange(
			final int index) {
		
		if(index == 3) {
			_propagateChange();
		} else {
			_propagateNmChange();
		}
	}
	
	private final Matrix4D _rotate(
			final float r11,
			final float r12,
			final float r13,
			final float r21,
			final float r22,
			final float r23,
			final float r31,
			final float r32,
			final float r33) {

		getData(_temp);

		// Zeile 1
		_data[I_M11] =
			_temp[I_M11] * r11 + _temp[I_M12] * r21 + _temp[I_M13] * r31;
		_data[I_M12] =
			_temp[I_M11] * r12 + _temp[I_M12] * r22 + _temp[I_M13] * r32;
		_data[I_M13] =
			_temp[I_M11] * r13 + _temp[I_M12] * r23 + _temp[I_M13] * r33;

		// Zeile 2
		_data[I_M21] =
			_temp[I_M21] * r11 + _temp[I_M22] * r21 + _temp[I_M23] * r31;
		_data[I_M22] =
			_temp[I_M21] * r12 + _temp[I_M22] * r22 + _temp[I_M23] * r32;
		_data[I_M23] =
			_temp[I_M21] * r13 + _temp[I_M22] * r23 + _temp[I_M23] * r33;

		// Zeile 3
		_data[I_M31] =
			_temp[I_M31] * r11 + _temp[I_M32] * r21 + _temp[I_M33] * r31;
		_data[I_M32] =
			_temp[I_M31] * r12 + _temp[I_M32] * r22 + _temp[I_M33] * r32;
		_data[I_M33] =
			_temp[I_M31] * r13 + _temp[I_M32] * r23 + _temp[I_M33] * r33;

		// Zeile 4
		_data[I_M41] =
			_temp[I_M41] * r11 + _temp[I_M42] * r21 + _temp[I_M43] * r31;
		_data[I_M42] =
			_temp[I_M41] * r12 + _temp[I_M42] * r22 + _temp[I_M43] * r32;
		_data[I_M43] =
			_temp[I_M41] * r13 + _temp[I_M42] * r23 + _temp[I_M43] * r33;

		_propagateNmChange();
		
		return this;
	}

	public Matrix4D() {
		
		toIdentity();
	}
	
	public final Vector3D applyToDirVector(
			final Vector3D v) {
		
		return v.setData(applyToDirVector(v.getData(_temp)));
	}

	public final float[] applyToDirVector(
			final float[] v) {
		
		return applyToDirVector(v, 0);
	}
	
	public final float[] applyToDirVector(
			final float[] v,
			final int     offset) {
		
		final float[] dataNm = _dataNmCached.getObject();
		
		// Die ersten 3 Positionen des temporären Arrays frei lassen, damit sie
		// von der überladenen Methode genutzt werden können, um den Vektor
		// an die Position 0 kopieren zu können
		System.arraycopy(v, offset, _temp, 3, 3);
		
		v[offset + 0] =
			dataNm[I_NM11] * _temp[3] + dataNm[I_NM12] * _temp[4] +
			dataNm[I_NM13] * _temp[5];
		v[offset + 1] =
			dataNm[I_NM21] * _temp[3] + dataNm[I_NM22] * _temp[4] +
			dataNm[I_NM23] * _temp[5];
		v[offset + 2] =
			dataNm[I_NM31] * _temp[3] + dataNm[I_NM32] * _temp[4] +
			dataNm[I_NM33] * _temp[5];
		
		return v;
	}

	public final Vector3D applyToPoint(
			final Vector3D p) {
		
		return p.setData(applyToPoint(p.getData(_temp), (byte)3));
	}

	public final Vector4D applyToPoint(
			final Vector4D p) {
		
		return p.setData(applyToPoint(p.getData(_temp), (byte)4));
	}

	public final float[] applyToPoint(
			final float[] p) {
		
		return applyToPoint(p, 0, (byte)p.length);
	}
	
	public final float[] applyToPoint(
			final float[] p,
			final int     offset) {
		
		return applyToPoint(p, offset, (byte)p.length);
	}
	
	public final float[] applyToPoint(
    		final float[] p,
    		final byte    dimension) {
		
		return applyToPoint(p, 0, dimension);
	}
	
	public final float[] applyToPoint(
			final float[] p,
			final int     offset,
			final byte    dimension) {
		
		if(dimension < 1) return p;
		
		final float x = dimension >= 1 ? p[offset + 0] : 0;
		final float y = dimension >= 2 ? p[offset + 1] : 0;
		final float z = dimension >= 3 ? p[offset + 2] : 0;
		final float w = dimension >= 4 ? p[offset + 3] : 1;
		
		p[offset + 0] =
			_data[I_M11] * x + _data[I_M12] * y +
			_data[I_M13] * z + _data[I_M14] * w;
		
		if(dimension < 2) return p;
		
		p[offset + 1] =
			_data[I_M21] * x + _data[I_M22] * y +
			_data[I_M23] * z + _data[I_M24] * w;

		if(dimension < 3) return p;
		
		p[offset + 2] =
			_data[I_M31] * x + _data[I_M32] * y +
			_data[I_M33] * z + _data[I_M34] * w;

		if(dimension < 4) return p;
		
		p[offset + 3] =
			_data[I_M41] * x + _data[I_M42] * y +
			_data[I_M43] * z + _data[I_M44] * w;
		
		return p;
	}

	public final float computeDeterminant() {

		return
			_data[I_M14] * _data[I_M23] * _data[I_M32] * _data[I_M41] -
			_data[I_M13] * _data[I_M24] * _data[I_M32] * _data[I_M41] -
			_data[I_M14] * _data[I_M22] * _data[I_M33] * _data[I_M41] +
			_data[I_M12] * _data[I_M24] * _data[I_M33] * _data[I_M41] +
			_data[I_M13] * _data[I_M22] * _data[I_M34] * _data[I_M41] -
			_data[I_M12] * _data[I_M23] * _data[I_M34] * _data[I_M41] -
			_data[I_M14] * _data[I_M23] * _data[I_M31] * _data[I_M42] +
			_data[I_M13] * _data[I_M24] * _data[I_M31] * _data[I_M42] +
			_data[I_M14] * _data[I_M21] * _data[I_M33] * _data[I_M42] -
			_data[I_M11] * _data[I_M24] * _data[I_M33] * _data[I_M42] -
			_data[I_M13] * _data[I_M21] * _data[I_M34] * _data[I_M42] +
			_data[I_M11] * _data[I_M23] * _data[I_M34] * _data[I_M42] +
			_data[I_M14] * _data[I_M22] * _data[I_M31] * _data[I_M43] -
			_data[I_M12] * _data[I_M24] * _data[I_M31] * _data[I_M43] -
			_data[I_M14] * _data[I_M21] * _data[I_M32] * _data[I_M43] +
			_data[I_M11] * _data[I_M24] * _data[I_M32] * _data[I_M43] +
			_data[I_M12] * _data[I_M21] * _data[I_M34] * _data[I_M43] -
			_data[I_M11] * _data[I_M22] * _data[I_M34] * _data[I_M43] -
			_data[I_M13] * _data[I_M22] * _data[I_M31] * _data[I_M44] +
			_data[I_M12] * _data[I_M23] * _data[I_M31] * _data[I_M44] +
			_data[I_M13] * _data[I_M21] * _data[I_M32] * _data[I_M44] -
			_data[I_M11] * _data[I_M23] * _data[I_M32] * _data[I_M44] -
			_data[I_M12] * _data[I_M21] * _data[I_M33] * _data[I_M44] +
			_data[I_M11] * _data[I_M22] * _data[I_M33] * _data[I_M44];
	}

	public final Vector4D getColumn(
			final int cIndex) {
		
		if(_columnVectors[cIndex] == null)
			_columnVectors[cIndex] =
				new Vector4D(new MatrixVector(true, cIndex));
		
		return _columnVectors[cIndex];
	}
	
	public final Vector4D getColumn(
			final int      cIndex,
			final Vector4D dst) {
		
		return dst.setData(_data, cIndex * 4);
	}
	
	public final float[] getColumn(
			final int     cIndex,
			final float[] dst) {
		
		return getColumn(cIndex, dst, 0);
	}

	public final float[] getColumn(
			final int     cIndex,
			final float[] dst,
			final int     offset) {
		
		System.arraycopy(_data, cIndex * 4, dst, offset, 4);
		
		return dst;
	}
	
	public final Matrix4D getData(
			final Matrix4D dst) {
		
		return dst.setData(_data);
	}
	
	public final float[] getData(
			final float[] dst) {
		
		return getData(dst, 0);
	}
	
	public final float[] getData(
    		final float[] dst,
    		final int     offset) {
		
		System.arraycopy(_data, 0, dst, offset, 16);
		
		return dst;
    }

	public final float getElement(
			final int rIndex,
			final int cIndex) {
		
		return _data[cIndex * 4 + rIndex];
	}
	
	public final float[] getNmData(
			final float[] dst) {
		
		return getNmData(dst, 0);
	}
	
	public final float[] getNmData(
			final float[] dst,
			final int     offset) {
		
		System.arraycopy(_dataNmCached.getObject(), 0, dst, offset, 9);
		
		return dst;
    }

	public final Vector4D getRow(
			final int rIndex) {
		
		if(_rowVectors[rIndex] == null)
			_rowVectors[rIndex] = new Vector4D(new MatrixVector(true, rIndex));
		
		return _rowVectors[rIndex];
	}
	
	public final Vector4D getRow(
			final int      rIndex,
			final Vector4D dst) {
		
		return dst.setData(
			_data[I_M11 + rIndex], _data[I_M12 + rIndex],
			_data[I_M13 + rIndex], _data[I_M14 + rIndex]);
	}
	
	public final float[] getRow(
			final int     rIndex,
			final float[] dst) {
		
		return getRow(rIndex, dst, 0);
	}

	public final float[] getRow(
			final int     rIndex,
			final float[] dst,
			final int     offset) {
		
		for(int i = 0; i < 4; i++) dst[offset + i] = _data[i * 4 + rIndex];
		
		return dst;
	}

	public final Matrix4D invert() {

		final float det = computeDeterminant();

		// Zeile 1
		_temp[ 0] = (
			_data[I_M23] * _data[I_M34] * _data[I_M42] -
			_data[I_M24] * _data[I_M33] * _data[I_M42] +
			_data[I_M24] * _data[I_M32] * _data[I_M43] -
			_data[I_M22] * _data[I_M34] * _data[I_M43] -
			_data[I_M23] * _data[I_M32] * _data[I_M44] +
			_data[I_M22] * _data[I_M33] * _data[I_M44]) / det;
		_temp[ 4] = (
			_data[I_M14] * _data[I_M33] * _data[I_M42] -
			_data[I_M13] * _data[I_M34] * _data[I_M42] -
			_data[I_M14] * _data[I_M32] * _data[I_M43] +
			_data[I_M12] * _data[I_M34] * _data[I_M43] +
			_data[I_M13] * _data[I_M32] * _data[I_M44] -
			_data[I_M12] * _data[I_M33] * _data[I_M44]) / det;
		_temp[ 8] = (
			_data[I_M13] * _data[I_M24] * _data[I_M42] -
			_data[I_M14] * _data[I_M23] * _data[I_M42] +
			_data[I_M14] * _data[I_M22] * _data[I_M43] -
			_data[I_M12] * _data[I_M24] * _data[I_M43] -
			_data[I_M13] * _data[I_M22] * _data[I_M44] +
			_data[I_M12] * _data[I_M23] * _data[I_M44]) / det;
		_temp[12] = (
			_data[I_M14] * _data[I_M23] * _data[I_M32] -
			_data[I_M13] * _data[I_M24] * _data[I_M32] -
			_data[I_M14] * _data[I_M22] * _data[I_M33] +
			_data[I_M12] * _data[I_M24] * _data[I_M33] +
			_data[I_M13] * _data[I_M22] * _data[I_M34] -
			_data[I_M12] * _data[I_M23] * _data[I_M34]) / det;
		
		// Zeile 2
		_temp[ 1] = (
			_data[I_M24] * _data[I_M33] * _data[I_M41] -
			_data[I_M23] * _data[I_M34] * _data[I_M41] -
			_data[I_M24] * _data[I_M31] * _data[I_M43] +
			_data[I_M21] * _data[I_M34] * _data[I_M43] +
			_data[I_M23] * _data[I_M31] * _data[I_M44] -
			_data[I_M21] * _data[I_M33] * _data[I_M44]) / det;
		_temp[ 5] = (
			_data[I_M13] * _data[I_M34] * _data[I_M41] -
			_data[I_M14] * _data[I_M33] * _data[I_M41] +
			_data[I_M14] * _data[I_M31] * _data[I_M43] -
			_data[I_M11] * _data[I_M34] * _data[I_M43] -
			_data[I_M13] * _data[I_M31] * _data[I_M44] +
			_data[I_M11] * _data[I_M33] * _data[I_M44]) / det;
		_temp[ 9] = (
			_data[I_M14] * _data[I_M23] * _data[I_M41] -
			_data[I_M13] * _data[I_M24] * _data[I_M41] -
			_data[I_M14] * _data[I_M21] * _data[I_M43] +
			_data[I_M11] * _data[I_M24] * _data[I_M43] +
			_data[I_M13] * _data[I_M21] * _data[I_M44] -
			_data[I_M11] * _data[I_M23] * _data[I_M44]) / det;
		_temp[13] = (
			_data[I_M13] * _data[I_M24] * _data[I_M31] -
			_data[I_M14] * _data[I_M23] * _data[I_M31] +
			_data[I_M14] * _data[I_M21] * _data[I_M33] -
			_data[I_M11] * _data[I_M24] * _data[I_M33] -
			_data[I_M13] * _data[I_M21] * _data[I_M34] +
			_data[I_M11] * _data[I_M23] * _data[I_M34]) / det;

		// Zeile 3
		_temp[ 2] = (
			_data[I_M22] * _data[I_M34] * _data[I_M41] -
			_data[I_M24] * _data[I_M32] * _data[I_M41] +
			_data[I_M24] * _data[I_M31] * _data[I_M42] -
			_data[I_M21] * _data[I_M34] * _data[I_M42] -
			_data[I_M22] * _data[I_M31] * _data[I_M44] +
			_data[I_M21] * _data[I_M32] * _data[I_M44]) / det;
		_temp[ 6] = (
			_data[I_M14] * _data[I_M32] * _data[I_M41] -
			_data[I_M12] * _data[I_M34] * _data[I_M41] -
			_data[I_M14] * _data[I_M31] * _data[I_M42] +
			_data[I_M11] * _data[I_M34] * _data[I_M42] +
			_data[I_M12] * _data[I_M31] * _data[I_M44] -
			_data[I_M11] * _data[I_M32] * _data[I_M44]) / det;
		_temp[10] = (
			_data[I_M12] * _data[I_M24] * _data[I_M41] -
			_data[I_M14] * _data[I_M22] * _data[I_M41] +
			_data[I_M14] * _data[I_M21] * _data[I_M42] -
			_data[I_M11] * _data[I_M24] * _data[I_M42] -
			_data[I_M12] * _data[I_M21] * _data[I_M44] +
			_data[I_M11] * _data[I_M22] * _data[I_M44]) / det;
		_temp[14] = (
			_data[I_M14] * _data[I_M22] * _data[I_M31] -
			_data[I_M12] * _data[I_M24] * _data[I_M31] -
			_data[I_M14] * _data[I_M21] * _data[I_M32] +
			_data[I_M11] * _data[I_M24] * _data[I_M32] +
			_data[I_M12] * _data[I_M21] * _data[I_M34] -
			_data[I_M11] * _data[I_M22] * _data[I_M34]) / det;

		// Zeile 4
		_temp[ 3] = (
			_data[I_M23] * _data[I_M32] * _data[I_M41] -
			_data[I_M22] * _data[I_M33] * _data[I_M41] -
			_data[I_M23] * _data[I_M31] * _data[I_M42] +
			_data[I_M21] * _data[I_M33] * _data[I_M42] +
			_data[I_M22] * _data[I_M31] * _data[I_M43] -
			_data[I_M21] * _data[I_M32] * _data[I_M43]) / det;
		_temp[ 7] = (
			_data[I_M12] * _data[I_M33] * _data[I_M41] -
			_data[I_M13] * _data[I_M32] * _data[I_M41] +
			_data[I_M13] * _data[I_M31] * _data[I_M42] -
			_data[I_M11] * _data[I_M33] * _data[I_M42] -
			_data[I_M12] * _data[I_M31] * _data[I_M43] +
			_data[I_M11] * _data[I_M32] * _data[I_M43]) / det;
		_temp[11] = (
			_data[I_M13] * _data[I_M22] * _data[I_M41] -
			_data[I_M12] * _data[I_M23] * _data[I_M41] -
			_data[I_M13] * _data[I_M21] * _data[I_M42] +
			_data[I_M11] * _data[I_M23] * _data[I_M42] +
			_data[I_M12] * _data[I_M21] * _data[I_M43] -
			_data[I_M11] * _data[I_M22] * _data[I_M43]) / det;
		_temp[15] = (
			_data[I_M12] * _data[I_M23] * _data[I_M31] -
			_data[I_M13] * _data[I_M22] * _data[I_M31] +
			_data[I_M13] * _data[I_M21] * _data[I_M32] -
			_data[I_M11] * _data[I_M23] * _data[I_M32] -
			_data[I_M12] * _data[I_M21] * _data[I_M33] +
			_data[I_M11] * _data[I_M22] * _data[I_M33]) / det;
		
		return setData(_temp);
	}
	
	public final Matrix4D multWithMatrix(
			final Matrix4D m) {
		
		// this = this * m;

		getData(_temp);

		// Zeile 1
		_data[I_M11] =
			_temp[I_M11] * m._data[I_M11] + _temp[I_M12] * m._data[I_M21] +
			_temp[I_M13] * m._data[I_M31] + _temp[I_M14] * m._data[I_M41];
		_data[I_M12] =
			_temp[I_M11] * m._data[I_M12] + _temp[I_M12] * m._data[I_M22] +
			_temp[I_M13] * m._data[I_M32] + _temp[I_M14] * m._data[I_M42];
		_data[I_M13] =
			_temp[I_M11] * m._data[I_M13] + _temp[I_M12] * m._data[I_M23] +
			_temp[I_M13] * m._data[I_M33] + _temp[I_M14] * m._data[I_M43];
		_data[I_M14] =
			_temp[I_M11] * m._data[I_M14] + _temp[I_M12] * m._data[I_M24] +
			_temp[I_M13] * m._data[I_M34] + _temp[I_M14] * m._data[I_M44];

		// Zeile 2
		_data[I_M21] =
			_temp[I_M21] * m._data[I_M11] + _temp[I_M22] * m._data[I_M21] +
			_temp[I_M23] * m._data[I_M31] + _temp[I_M24] * m._data[I_M41];
		_data[I_M22] =
			_temp[I_M21] * m._data[I_M12] + _temp[I_M22] * m._data[I_M22] +
			_temp[I_M23] * m._data[I_M32] + _temp[I_M24] * m._data[I_M42];
		_data[I_M23] =
			_temp[I_M21] * m._data[I_M13] + _temp[I_M22] * m._data[I_M23] +
			_temp[I_M23] * m._data[I_M33] + _temp[I_M24] * m._data[I_M43];
		_data[I_M24] =
			_temp[I_M21] * m._data[I_M14] + _temp[I_M22] * m._data[I_M24] +
			_temp[I_M23] * m._data[I_M34] + _temp[I_M24] * m._data[I_M44];

		// Zeile 3
		_data[I_M31] =
			_temp[I_M31] * m._data[I_M11] + _temp[I_M32] * m._data[I_M21] +
			_temp[I_M33] * m._data[I_M31] + _temp[I_M34] * m._data[I_M41];
		_data[I_M32] =
			_temp[I_M31] * m._data[I_M12] + _temp[I_M32] * m._data[I_M22] +
			_temp[I_M33] * m._data[I_M32] + _temp[I_M34] * m._data[I_M42];
		_data[I_M33] =
			_temp[I_M31] * m._data[I_M13] + _temp[I_M32] * m._data[I_M23] +
			_temp[I_M33] * m._data[I_M33] + _temp[I_M34] * m._data[I_M43];
		_data[I_M34] =
			_temp[I_M31] * m._data[I_M14] + _temp[I_M32] * m._data[I_M24] +
			_temp[I_M33] * m._data[I_M34] + _temp[I_M34] * m._data[I_M44];

		// Zeile 4
		_data[I_M41] =
			_temp[I_M41] * m._data[I_M11] + _temp[I_M42] * m._data[I_M21] +
			_temp[I_M43] * m._data[I_M31] + _temp[I_M44] * m._data[I_M41];
		_data[I_M42] =
			_temp[I_M41] * m._data[I_M12] + _temp[I_M42] * m._data[I_M22] +
			_temp[I_M43] * m._data[I_M32] + _temp[I_M44] * m._data[I_M42];
		_data[I_M43] =
			_temp[I_M41] * m._data[I_M13] + _temp[I_M42] * m._data[I_M23] +
			_temp[I_M43] * m._data[I_M33] + _temp[I_M44] * m._data[I_M43];
		_data[I_M44] =
			_temp[I_M41] * m._data[I_M14] + _temp[I_M42] * m._data[I_M24] +
			_temp[I_M43] * m._data[I_M34] + _temp[I_M44] * m._data[I_M44];

		_propagateNmChange();
		
		return this;
	}

	public final Matrix4D projectOrthogonal(
			final float width,
			final float height,
			final float near,
			final float far) {

		return projectOrthogonal(
			-width / 2, width / 2, -height / 2, height / 2, near, far);
	}

	public final Matrix4D projectOrthogonal(
			final float left,
			final float right,
			final float bottom,
			final float top,
			final float near,
			final float far) {
	
		// /a 0 0 d\
		// |0 b 0 e|
		// |0 0 c f|
		// \0 0 0 1/
	
		final float a = 2 / (right - left);
		final float b = 2 / (top   - bottom);
		final float c = 2 / (near  - far);
		final float d = (right + left)   / (right - left);
		final float e = (top   + bottom) / (top   - bottom);
		final float f = (far   + near)   / (far   - near);
	
		// Spalte 4 zuerst berechnen -> keine temp-Variablen
		_data[I_M14] =
			_data[I_M11] * d + _data[I_M12] * e +
			_data[I_M13] * f + _data[I_M14];
		_data[I_M24] =
			_data[I_M21] * d + _data[I_M22] * e +
			_data[I_M23] * f + _data[I_M24];
		_data[I_M34] =
			_data[I_M31] * d + _data[I_M32] * e +
			_data[I_M33] * f + _data[I_M34];
		_data[I_M44] =
			_data[I_M41] * d + _data[I_M42] * e +
			_data[I_M43] * f + _data[I_M44];

		// Spalten 1,2,3 berechnen
		_data[I_M11] *= a; _data[I_M12] *= b; _data[I_M13] *= c;
		_data[I_M21] *= a; _data[I_M22] *= b; _data[I_M23] *= c;
		_data[I_M31] *= a; _data[I_M32] *= b; _data[I_M33] *= c;
		_data[I_M41] *= a; _data[I_M42] *= b; _data[I_M43] *= c;

		_propagateNmChange();
		
		return this;
	}

	public final Matrix4D projectPerspective(
    		final float width,
    		final float height,
    		final float near) {
		
		return projectPerspective(width, height, near, 0);
	}
	
	public final Matrix4D projectPerspective(
			final float width,
			final float height,
			final float near,
			final float far) {
		
		return projectPerspective(
			-width / 2, width / 2, -height / 2, height / 2, near, far);
	}

	public final Matrix4D projectPerspective(
    		final float left,
    		final float right,
    		final float bottom,
    		final float top,
    		final float near) {
		
		return projectPerspective(left, right, bottom, top, near, 0);
	}
	
	public final Matrix4D projectPerspective(
			final float left,
			final float right,
			final float bottom,
			final float top,
			final float near,
			final float far) {
	
		// /a 0  c 0\
		// |0 b  d 0|
		// |0 0  e f|
		// \0 0 -1 0/

		final float a = 2 * near / (right - left);
		final float b = 2 * near / (top   - bottom);
		final float c = (right + left)   / (right - left);
		final float d = (top   + bottom) / (top   - bottom);
	
		// Nur die 3. Spalte muss temporär gespeichert werden
		final float m13 = _data[I_M13];
		final float m23 = _data[I_M23];
		final float m33 = _data[I_M33];
		final float m43 = _data[I_M43];
		
		// far-ClippingPlane nach unendlich setzen (e=-1,f=-2*near)
		if(far < near) {
		
			final float f = -2 * near;

			// Spalte 3 zuerst berechnen -> weniger temp-Variablen
			_data[I_M13] =
				_data[I_M11] * c + _data[I_M12] * d - m13 - _data[I_M14];
			_data[I_M23] =
				_data[I_M21] * c + _data[I_M22] * d - m23 - _data[I_M24];
			_data[I_M33] =
				_data[I_M31] * c + _data[I_M32] * d - m33 - _data[I_M34];
			_data[I_M43] =
				_data[I_M41] * c + _data[I_M42] * d - m43 - _data[I_M44];

			// Spalten 1,2,4 berechnen
			_data[I_M11] *= a; _data[I_M12] *= b; _data[I_M14] = f * m13;
			_data[I_M21] *= a; _data[I_M22] *= b; _data[I_M24] = f * m23;
			_data[I_M31] *= a; _data[I_M32] *= b; _data[I_M34] = f * m33;
			_data[I_M41] *= a; _data[I_M42] *= b; _data[I_M44] = f * m43;
		
		} else { // normale Projektionsmatrix
		
			final float e = (near - far) / (far - near);
			final float f = 2 * far * near / (near - far);
		
			// Spalte 3 zuerst berechnen -> weniger temp-Variablen
			_data[I_M13] =
				_data[I_M11] * c + _data[I_M12] * d + e * m13 - _data[I_M14];
			_data[I_M23] =
				_data[I_M21] * c + _data[I_M22] * d + e * m23 - _data[I_M24];
			_data[I_M33] =
				_data[I_M31] * c + _data[I_M32] * d + e * m33 - _data[I_M34];
			_data[I_M43] =
				_data[I_M41] * c + _data[I_M42] * d + e * m43 - _data[I_M44];

			// Spalten 1,2,4 berechnen
			_data[I_M11] *= a; _data[I_M12] *= b; _data[I_M14] = f * m13;
			_data[I_M21] *= a; _data[I_M22] *= b; _data[I_M24] = f * m23;
			_data[I_M31] *= a; _data[I_M32] *= b; _data[I_M34] = f * m33;
			_data[I_M41] *= a; _data[I_M42] *= b; _data[I_M44] = f * m43;
		}

		_propagateNmChange();
		
		return this;
	}

	public final Matrix4D projectPerspectiveHorFOV(
			final float vpWidth,
			final float vpHeight,
			final float fov,
			final float near) {
		
		return projectPerspectiveHorFOV(vpWidth, vpHeight, fov, near, 0);
	}
	
	public final Matrix4D projectPerspectiveHorFOV(
			final float vpWidth,
			final float vpHeight,
			final float fov,
			final float near,
			final float far) {
		
		final double width = 2 * Math.tan(fov * Math.PI / 360) * near;
		
		return projectPerspective(
			(float)width, (float)(width * vpHeight / vpWidth), near, far);
	}

	public final Matrix4D projectPerspectiveVerFOV(
			final float vpWidth,
			final float vpHeight,
			final float fov,
			final float near) {
		
		return projectPerspectiveVerFOV(vpWidth, vpHeight, fov, near, 0);
	}
	
	public final Matrix4D projectPerspectiveVerFOV(
			final float vpWidth,
			final float vpHeight,
			final float fov,
			final float near,
			final float far) {

		final double height = 2 * Math.tan(fov * Math.PI / 360) * near;

		return projectPerspective(
			(float)(height * vpWidth / vpHeight), (float)height, near, far);
	}
	
	public final Matrix4D rotate(
			final Quaternion q) {

		q.copyStaticValues();
		
		return _rotate(
			1 - 2 * (q.c * q.c + q.d * q.d),  // r11
			    2 * (q.b * q.c + q.a * q.d),  // r12
			    2 * (q.b * q.d - q.a * q.c),  // r13
			    2 * (q.b * q.c - q.a * q.d),  // r21
			1 - 2 * (q.b * q.b + q.d * q.d),  // r22
			    2 * (q.c * q.d + q.a * q.b),  // r23
			    2 * (q.b * q.d + q.a * q.c),  // r31
			    2 * (q.c * q.d - q.a * q.b),  // r32
			1 - 2 * (q.b * q.b + q.c * q.c)); // r33
	}
	
	public final Matrix4D rotateX(
			final float angle) {
		
		final float s = (float)Math.sin(angle * RAD_FACTOR);
		final float c = (float)Math.cos(angle * RAD_FACTOR);

		// Spalte 2 kopieren
		getColumn(1, _temp);

		// Spalte 2 berechnen
		_data[I_M12] = _temp[0] * c + _data[I_M13] * s; 
		_data[I_M22] = _temp[1] * c + _data[I_M23] * s; 
		_data[I_M32] = _temp[2] * c + _data[I_M33] * s; 
		_data[I_M42] = _temp[3] * c + _data[I_M43] * s; 
		
		// Spalte 3 berechnen
		_data[I_M13] = _data[I_M13] * c - _temp[0] * s;
		_data[I_M23] = _data[I_M23] * c - _temp[1] * s;
		_data[I_M33] = _data[I_M33] * c - _temp[2] * s;
		_data[I_M43] = _data[I_M43] * c - _temp[3] * s;

		_propagateNmChange();
		
		return this;
	}

	public final Matrix4D rotateY(
			final float angle) {

		final float s = (float)Math.sin(angle * RAD_FACTOR);
		final float c = (float)Math.cos(angle * RAD_FACTOR);

		// Spalte 1 kopieren
		getColumn(0, _temp);

		// Spalte 1 berechnen
		_data[I_M11] = _temp[0] * c - _data[I_M13] * s;
		_data[I_M21] = _temp[1] * c - _data[I_M23] * s;
		_data[I_M31] = _temp[2] * c - _data[I_M33] * s;
		_data[I_M41] = _temp[3] * c - _data[I_M43] * s;
		
		// Spalte 3 berechnen
		_data[I_M13] = _temp[0] * s + _data[I_M13] * c;
		_data[I_M23] = _temp[1] * s + _data[I_M23] * c;
		_data[I_M33] = _temp[2] * s + _data[I_M33] * c;
		_data[I_M43] = _temp[3] * s + _data[I_M43] * c;

		_propagateNmChange();
		
		return this;
	}

	public final Matrix4D rotateZ(
			final float angle) {

		final float s = (float)Math.sin(angle * RAD_FACTOR);
		final float c = (float)Math.cos(angle * RAD_FACTOR);

		// Spalte 1 kopieren
		getColumn(0, _temp);

		// Spalte 1 berechnen
		_data[I_M11] = _temp[0] * c + _data[I_M12] * s;
		_data[I_M21] = _temp[1] * c + _data[I_M22] * s;
		_data[I_M31] = _temp[2] * c + _data[I_M32] * s;
		_data[I_M41] = _temp[3] * c + _data[I_M42] * s;
		
		// Spalte 2 berechnen
		_data[I_M12] = _data[I_M12] * c - _temp[0] * s;
		_data[I_M22] = _data[I_M22] * c - _temp[1] * s;
		_data[I_M32] = _data[I_M32] * c - _temp[2] * s;
		_data[I_M42] = _data[I_M42] * c - _temp[3] * s;

		_propagateNmChange();
		
		return this;
	}

	public Matrix4D round() {

		for(int i = 0; i < 16; i++) _data[i] = (float)Math.round(_data[i]);

		_propagateNmChange();
		
		return this;
	}

	public Matrix4D round(
			final float interval) {

		for(int i = 0; i < 16; i++)
			_data[i] = (float)Math.round(_data[i] / interval) * interval;

		_propagateNmChange();
		
		return this;
	}

	public final Matrix4D scale(
			final float factor) {

		return scale(factor, factor, factor);
	}

	public final Matrix4D scale(
			final float x,
			final float y,
			final float z) {

		_data[I_M11] *= x; _data[I_M12] *= y; _data[I_M13] *= z;
		_data[I_M21] *= x; _data[I_M22] *= y; _data[I_M23] *= z;
		_data[I_M31] *= x; _data[I_M32] *= y; _data[I_M33] *= z;
		_data[I_M41] *= x; _data[I_M42] *= y; _data[I_M43] *= z;

		_propagateNmChange();
		
		return this;
	}

	public final Matrix4D setColumn(
			final int      cIndex,
			final Vector4D src) {
		
		src.getData(_data, cIndex * 4);

		_propagateRowColumnChange(cIndex);
		
		return this;
	}
	
	public final Matrix4D setColumn(
			final int     cIndex,
			final float[] src) {
		
		return setColumn(cIndex, src, 0);
	}

	public final Matrix4D setColumn(
			final int     cIndex,
			final float[] src,
			final int     offset) {
		
		System.arraycopy(src, offset, _data, cIndex * 4, 4);
		
		_propagateRowColumnChange(cIndex);
		
		return this;
	}
	
	public final Matrix4D setData(
			final Matrix4D src) {
		
		src.getData(_data);
		
		_propagateNmChange();
		
		return this;
	}
	
	public final Matrix4D setData(
			final float[] src) {
		
		return setData(src, 0);
	}
	
	public final Matrix4D setData(
			final float[] src,
			final int     offset) {
		
		System.arraycopy(src, offset, _data, 0, 16);
		
		_propagateNmChange();
		
		return this;
	}
	
	public final Matrix4D setData(
    		final float m11,
    		final float m12,
    		final float m13,
    		final float m14,
    		final float m21,
    		final float m22,
    		final float m23,
    		final float m24,
    		final float m31,
    		final float m32,
    		final float m33,
    		final float m34,
    		final float m41,
    		final float m42,
    		final float m43,
    		final float m44) {
    	
		_data[I_M11] = m11; _data[I_M12] = m12;
		_data[I_M11] = m13; _data[I_M14] = m14;

		_data[I_M11] = m21; _data[I_M22] = m22;
		_data[I_M21] = m23; _data[I_M24] = m24;

		_data[I_M31] = m31; _data[I_M32] = m32;
		_data[I_M31] = m33; _data[I_M34] = m34;

		_data[I_M41] = m41; _data[I_M42] = m42;
		_data[I_M41] = m43; _data[I_M44] = m44;

		_propagateNmChange();
		
    	return this;
    }
	
	public final Matrix4D setElement(
			final int   rIndex,
			final int   cIndex,
			final float value) {
		
		_data[cIndex * 4 + rIndex] = value;

		if(rIndex < 3 && cIndex < 3) {
			_propagateNmChange();
		} else {
			_propagateChange();
		}
		
		return this;
	}

	public final Matrix4D setRow(
			final int      rIndex,
			final Vector4D src) {
		
		_data[I_M11 + rIndex] = src.backend.getX();
		_data[I_M12 + rIndex] = src.backend.getY();
		_data[I_M13 + rIndex] = src.backend.getZ();
		_data[I_M14 + rIndex] = src.backend.getW();

		_propagateRowColumnChange(rIndex);
		
		return this;
	}
	
	public final Matrix4D setRow(
			final int     rIndex,
			final float[] src) {
		
		return setRow(rIndex, src, 0);
	}

	public final Matrix4D setRow(
			final int     rIndex,
			final float[] src,
			final int     offset) {
		
		for(int i = 0; i < 4; i++) _data[i * 4 + rIndex] = src[offset + i];
		
		_propagateRowColumnChange(rIndex);
		
		return this;
	}
	
	public final Matrix4D toIdentity() {
		
		_data[I_M11] = _data[I_M22] = _data[I_M33] = _data[I_M44] = 1;

		_data[I_M12] = _data[I_M13] = _data[I_M14] =
		_data[I_M21] = _data[I_M23] = _data[I_M24] =
		_data[I_M31] = _data[I_M32] = _data[I_M34] =
		_data[I_M41] = _data[I_M42] = _data[I_M43] = 0;

		_propagateNmChange();
		
		return this;
	}

	public final Matrix4D translate(
			final float x,
			final float y,
			final float z) {

		_data[I_M14] =
			_data[I_M11] * x + _data[I_M12] * y +
			_data[I_M13] * z + _data[I_M14];
		_data[I_M24] =
			_data[I_M21] * x + _data[I_M22] * y +
			_data[I_M23] * z + _data[I_M24];
		_data[I_M34] =
			_data[I_M31] * x + _data[I_M32] * y +
			_data[I_M33] * z + _data[I_M34];
		_data[I_M44] =
			_data[I_M41] * x + _data[I_M42] * y +
			_data[I_M43] * z + _data[I_M44];

		_propagateChange();

		return this;
	}
}
