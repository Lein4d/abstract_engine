package ae.util;

public final class AgingAverage extends Average {
	
	private int _fillCounter = 0;
	
	public AgingAverage(final Type type) {
		this(type, 20);
	}
	
	public AgingAverage(
			final Type type,
			final int  slotCount) {
		
		super(type, slotCount);
	}
	
	public int addValue(final int value) {
		
		if(_slotsInt == null) throw new UnsupportedOperationException();
		
		if(_fillCounter == 0) {
			
			_slotsInt[0] = value;
			
		} else {
			
			int  occupiedCount     = 0;
			long propagatedAverage = 0;
			
			while((_fillCounter & (1 << occupiedCount)) > 0) {
				propagatedAverage += _slotsInt[occupiedCount];
				occupiedCount++;
			}
			
			propagatedAverage /= occupiedCount;
			
			if(occupiedCount == _slotsInt.length) {
				for(int i = 1; i < occupiedCount; i++)
					_slotsInt[i] = (int)propagatedAverage;
			} else {
				for(int i = 1; i <= occupiedCount; i++)
					_slotsInt[i] = (int)propagatedAverage;
			}
		}
		
		_fillCounter++;
		
		return 0;
	}

	public long addValue(final long value) {
		
		if(_slotsLong == null) throw new UnsupportedOperationException();
		
		if(_fillCounter == 0) {
			
			_slotsLong[0] = value;
			
		} else {
			
			int  occupiedCount     = 0;
			long propagatedAverage = 0;
			
			while((_fillCounter & (1 << occupiedCount)) > 0) {
				propagatedAverage += _slotsLong[occupiedCount];
				occupiedCount++;
			}
			
			propagatedAverage /= occupiedCount;
			
			if(occupiedCount == _slotsLong.length) {
				for(int i = 1; i < occupiedCount; i++)
					_slotsLong[i] = propagatedAverage;
			} else {
				for(int i = 1; i <= occupiedCount; i++)
					_slotsLong[i] = propagatedAverage;
			}
		}
		
		_fillCounter++;
		
		return 0;
	}

	@Override
	public float addValue(float value) {
		// TODO Auto-generated method stub
		return 0;
	}

	@Override
	public double addValue(double value) {
		// TODO Auto-generated method stub
		return 0;
	}
}
