package ae.util.profiling;

public final class FloatingAverage extends Average {

	private long   _iSum            = 0;
	private long   _iAverage        = 0;
	private double _fSum            = 0;
	private double _fAverage        = 0;
	private int    _filledSlotCount = 0;
	private int    _activeSlot      = 0;
	
	public FloatingAverage(
			final Type type,
			final int  slotCount) {
		
		super(type, slotCount);
	}

	@Override
	public final int addValue(final int value) {
		
		if(_slotsInt == null) throw new UnsupportedOperationException();
		
		if(_filledSlotCount < _slotsInt.length) {
			_filledSlotCount++;
		} else {
			_iSum -= _slotsInt[_activeSlot];
		}
		
		// TODO: Add median filter to remove salt and pepper noise
		
		_iSum                 += value;
		_slotsInt[_activeSlot] = value;
		_activeSlot            = (_activeSlot + 1) % _slotsInt.length;
		_iAverage              = _iSum / _filledSlotCount;
		
		return (int)_iAverage;
	}

	@Override
	public final long addValue(final long value) {
		
		if(_slotsLong == null) throw new UnsupportedOperationException();
		
		if(_filledSlotCount < _slotsLong.length) {
			_filledSlotCount++;
		} else {
			_iSum -= _slotsLong[_activeSlot];
		}
		
		_iSum                  += value;
		_slotsLong[_activeSlot] = value;
		_activeSlot             = (_activeSlot + 1) % _slotsLong.length;
		_iAverage               = _iSum / _filledSlotCount;
		
		return _iAverage;
	}

	@Override
	public final float addValue(final float value) {
		
		if(_slotsFloat == null) throw new UnsupportedOperationException();
		
		if(_filledSlotCount < _slotsFloat.length) {
			_filledSlotCount++;
		} else {
			_fSum -= _slotsFloat[_activeSlot];
		}
		
		_fSum                   += value;
		_slotsFloat[_activeSlot] = value;
		_activeSlot              = (_activeSlot + 1) % _slotsFloat.length;
		_fAverage                = _fSum / _filledSlotCount;
		
		return (float)_fAverage;
	}

	@Override
	public final double addValue(final double value) {
		
		if(_slotsDouble == null) throw new UnsupportedOperationException();
		
		if(_filledSlotCount < _slotsDouble.length) {
			_filledSlotCount++;
		} else {
			_fSum -= _slotsDouble[_activeSlot];
		}
		
		_fSum                    += value;
		_slotsDouble[_activeSlot] = value;
		_activeSlot               = (_activeSlot + 1) % _slotsDouble.length;
		_fAverage                 = _fSum / _filledSlotCount;
		
		return _fAverage;
	}
}
