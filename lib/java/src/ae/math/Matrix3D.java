package ae.math;

import ae.event.Observable;
import ae.event.SignalEndPoint;
import ae.event.SignalSource;

public final class Matrix3D implements Observable {

	public final class MatrixVector extends VectorBackend {
		
		private final boolean _isRow;
		private final int     _rcIndex;
		
		@Override
		protected final float _getElement(final int index) {
			return _isRow ?
				Matrix3D.this.getElement(_rcIndex, index) :
				Matrix3D.this.getElement(index,    _rcIndex);
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
			
			Matrix3D.this.setElement(
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
	
	private final SignalSource<Matrix3D> _signal = new SignalSource<>(this);
	
	// The matrix is structured in rows
	private final float[] _data = new float[9];
	private final float[] _temp = new float[9];

	private final Vector3D[] _columnVectors = new Vector3D[3];
	private final Vector3D[] _rowVectors    = new Vector3D[3];
	
	// I_Mij = Index des Eintrags in Zeile i und Spalte j (Normalenmatrix)
	public static final int I_M11 = 0;
	public static final int I_M12 = 3;
	public static final int I_M13 = 6;
	public static final int I_M21 = 1;
	public static final int I_M22 = 4;
	public static final int I_M23 = 7;
	public static final int I_M31 = 2;
	public static final int I_M32 = 5;
	public static final int I_M33 = 8;

	private Matrix3D _fireSignal() {
		_signal.fire();
		return this;
	}
	
	public final Vector3D apply(final Vector3D x) {
		return x.setData(apply(x.getData(_temp)));
	}

	public final float[] apply(final float[] x) {
		return apply(x, 0);
	}
	
	public final float[] apply(
			final float[] x,
			final int     offset) {
		
		// Die ersten 3 Positionen des temporären Arrays frei lassen, damit sie
		// von der überladenen Methode genutzt werden können, um den Vektor
		// an die Position 0 kopieren zu können
		System.arraycopy(x, offset, _temp, 3, 3);
		
		x[offset + 0] =
			_data[I_M11] * _temp[3] + _data[I_M12] * _temp[4] +
			_data[I_M13] * _temp[5];
		x[offset + 1] =
			_data[I_M21] * _temp[3] + _data[I_M22] * _temp[4] +
			_data[I_M23] * _temp[5];
		x[offset + 2] =
			_data[I_M31] * _temp[3] + _data[I_M32] * _temp[4] +
			_data[I_M33] * _temp[5];
		
		return x;
	}

	public final float computeDeterminant() {
		
		// Use Sarrus' rule
		return
			_data[I_M11] * _data[I_M22] * _data[I_M33] +
			_data[I_M12] * _data[I_M23] * _data[I_M31] +
			_data[I_M13] * _data[I_M21] * _data[I_M32] -
			_data[I_M31] * _data[I_M22] * _data[I_M13] -
			_data[I_M32] * _data[I_M23] * _data[I_M11] -
			_data[I_M33] * _data[I_M21] * _data[I_M13];
	}

	@Override
	public final SignalEndPoint createSignalEndPoint() {
		return _signal.createEndPoint();
	}

	public final Vector3D getColumn(final int cIndex) {
		
		if(_columnVectors[cIndex] == null)
			_columnVectors[cIndex] =
				new Vector3D(new MatrixVector(true, cIndex));
		
		return _columnVectors[cIndex];
	}
	
	public final Vector4D getColumn(
			final int      cIndex,
			final Vector4D dst) {
		
		return dst.setData(_data, cIndex * 3);
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
		
		System.arraycopy(_data, cIndex * 3, dst, offset, 3);
		return dst;
	}

	public final Matrix3D getData(final Matrix3D dst) {
		return dst.setData(_data);
	}
	
	public final float[] getData(final float[] dst) {
		return getData(dst, 0);
	}
	
	public final float[] getData(
    		final float[] dst,
    		final int     offset) {
		
		System.arraycopy(_data, 0, dst, offset, 9);
		return dst;
    }

	public final float getElement(
			final int rIndex,
			final int cIndex) {
		
		return _data[cIndex * 3 + rIndex];
	}

	public final Vector3D getRow(final int rIndex) {
		
		if(_rowVectors[rIndex] == null)
			_rowVectors[rIndex] = new Vector3D(new MatrixVector(true, rIndex));
		
		return _rowVectors[rIndex];
	}
	
	public final Vector3D getRow(
			final int      rIndex,
			final Vector3D dst) {
		
		return dst.setData(
			_data[I_M11 + rIndex], _data[I_M12 + rIndex],
			_data[I_M13 + rIndex]);
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
		
		for(int i = 0; i < 3; i++) dst[offset + i] = _data[i * 3 + rIndex];
		return dst;
	}

	public final Matrix3D invert() {

		final float det = computeDeterminant();
		
		_temp[I_M11] =
			(_data[I_M33] * _data[I_M22] - _data[I_M32] * _data[I_M23]) / det;
		_temp[I_M12] =
			(_data[I_M32] * _data[I_M13] - _data[I_M33] * _data[I_M12]) / det;
		_temp[I_M13] =
			(_data[I_M23] * _data[I_M12] - _data[I_M22] * _data[I_M13]) / det;
		
		_temp[I_M21] =
			(_data[I_M31] * _data[I_M23] - _data[I_M33] * _data[I_M21]) / det;
		_temp[I_M22] =
			(_data[I_M33] * _data[I_M11] - _data[I_M31] * _data[I_M13]) / det;
		_temp[I_M23] =
			(_data[I_M21] * _data[I_M13] - _data[I_M23] * _data[I_M11]) / det;
		
		_temp[I_M31] =
			(_data[I_M32] * _data[I_M21] - _data[I_M31] * _data[I_M22]) / det;
		_temp[I_M32] =
			(_data[I_M31] * _data[I_M12] - _data[I_M32] * _data[I_M11]) / det;
		_temp[I_M33] =
			(_data[I_M22] * _data[I_M11] - _data[I_M21] * _data[I_M12]) / det;
		
		return setData(_temp);
	}

	public final Matrix3D multWithMatrix(final Matrix3D m) {
		
		// this = this * m;

		getData(_temp);

		// Row 1
		_data[I_M11] =
			_temp[I_M11] * m._data[I_M11] + _temp[I_M12] * m._data[I_M21] +
			_temp[I_M13] * m._data[I_M31];
		_data[I_M12] =
			_temp[I_M11] * m._data[I_M12] + _temp[I_M12] * m._data[I_M22] +
			_temp[I_M13] * m._data[I_M32];
		_data[I_M13] =
			_temp[I_M11] * m._data[I_M13] + _temp[I_M12] * m._data[I_M23] +
			_temp[I_M13] * m._data[I_M33];

		// Row 2
		_data[I_M21] =
			_temp[I_M21] * m._data[I_M11] + _temp[I_M22] * m._data[I_M21] +
			_temp[I_M23] * m._data[I_M31];
		_data[I_M22] =
			_temp[I_M21] * m._data[I_M12] + _temp[I_M22] * m._data[I_M22] +
			_temp[I_M23] * m._data[I_M32];
		_data[I_M23] =
			_temp[I_M21] * m._data[I_M13] + _temp[I_M22] * m._data[I_M23] +
			_temp[I_M23] * m._data[I_M33];

		// Row 3
		_data[I_M31] =
			_temp[I_M31] * m._data[I_M11] + _temp[I_M32] * m._data[I_M21] +
			_temp[I_M33] * m._data[I_M31];
		_data[I_M32] =
			_temp[I_M31] * m._data[I_M12] + _temp[I_M32] * m._data[I_M22] +
			_temp[I_M33] * m._data[I_M32];
		_data[I_M33] =
			_temp[I_M31] * m._data[I_M13] + _temp[I_M32] * m._data[I_M23] +
			_temp[I_M33] * m._data[I_M33];

		return _fireSignal();
	}

	public final Matrix3D setColumn(
			final int      cIndex,
			final Vector3D src) {
		
		src.getData(_data, cIndex * 3);
		return _fireSignal();
	}
	
	public final Matrix3D setColumn(
			final int     cIndex,
			final float[] src) {
		
		return setColumn(cIndex, src, 0);
	}

	public final Matrix3D setColumn(
			final int     cIndex,
			final float[] src,
			final int     offset) {
		
		System.arraycopy(src, offset, _data, cIndex * 4, 4);
		return _fireSignal();
	}
	
	public final Matrix3D setColumns(
			final Vector3D c1,
			final Vector3D c2,
			final Vector3D c3) {
		
		return setData(
			c1.backend.getX(), c2.backend.getX(), c3.backend.getX(),
			c1.backend.getY(), c2.backend.getY(), c3.backend.getY(),
			c1.backend.getZ(), c2.backend.getZ(), c3.backend.getZ());
	}
	
	public final Matrix3D setData(final Matrix3D src) {
		src.getData(_data);
		return _fireSignal();
	}
	
	public final Matrix3D setData(final float[] src) {
		return setData(src, 0);
	}
	
	public final Matrix3D setData(
			final float[] src,
			final int     offset) {
		
		System.arraycopy(src, offset, _data, 0, 9);
		return _fireSignal();
	}
	
	public final Matrix3D setData(
    		final float m11,
    		final float m12,
    		final float m13,
    		final float m21,
    		final float m22,
    		final float m23,
    		final float m31,
    		final float m32,
    		final float m33) {
    	
		_data[I_M11] = m11; _data[I_M12] = m12; _data[I_M11] = m13;
		_data[I_M11] = m21; _data[I_M22] = m22; _data[I_M21] = m23;
		_data[I_M31] = m31; _data[I_M32] = m32; _data[I_M31] = m33;

		return _fireSignal();
    }
	
	public final Matrix3D setElement(
			final int   rIndex,
			final int   cIndex,
			final float value) {
		
		_data[cIndex * 3 + rIndex] = value;
		return _fireSignal();
	}

	public final Matrix3D setRow(
			final int      rIndex,
			final Vector4D src) {
		
		_data[I_M11 + rIndex] = src.backend.getX();
		_data[I_M12 + rIndex] = src.backend.getY();
		_data[I_M13 + rIndex] = src.backend.getZ();

		return _fireSignal();
	}
	
	public final Matrix3D setRow(
			final int     rIndex,
			final float[] src) {
		
		return setRow(rIndex, src, 0);
	}

	public final Matrix3D setRow(
			final int     rIndex,
			final float[] src,
			final int     offset) {
		
		for(int i = 0; i < 3; i++) _data[i * 3 + rIndex] = src[offset + i];
		return _fireSignal();
	}

	public final Matrix3D setRows(
			final Vector3D r1,
			final Vector3D r2,
			final Vector3D r3) {
		
		return setData(
			r1.backend.getX(), r1.backend.getY(), r1.backend.getZ(),
			r2.backend.getX(), r2.backend.getY(), r2.backend.getZ(),
			r3.backend.getX(), r3.backend.getY(), r3.backend.getZ());
	}
	
	public final Matrix3D toIdentity() {
		
		_data[I_M11] = _data[I_M22] = _data[I_M33] = 1;

		_data[I_M12] = _data[I_M13] = _data[I_M21] =
		_data[I_M23] = _data[I_M31] = _data[I_M32] = 0;

		return _fireSignal();
	}
}
