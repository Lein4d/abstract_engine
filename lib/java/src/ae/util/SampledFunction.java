package ae.util;

import java.util.function.DoubleUnaryOperator;

public final class SampledFunction {
	
	private final double   _begin;
	private final double   _end;
	private final int      _intervalCount;
	private final double[] _samples;

	public final double nearestPrecision;
	public final double linearPrecision;
	
	public SampledFunction(
			final int                 intervalCount,
			final double              begin,
			final double              end,
			final DoubleUnaryOperator func) {
		
		double tempNearestPrecision = 0;
		double tempLinearPrecision  = 0;
		
		_begin         = begin;
		_end           = end;
		_intervalCount = intervalCount;
		_samples       = new double[intervalCount + 1];
		
		for(int i = 0; i <= intervalCount; i++)
			_samples[i] = func.applyAsDouble(
				Functions.mix(begin, end, (double)i / intervalCount));
		
		for(int i = 0; i < intervalCount; i++) {
			
			final double x         = (2.0 * i + 1.0) / (2.0 * intervalCount);
			final double realValue = func.applyAsDouble(x);
			
			tempNearestPrecision = Math.max(
				tempNearestPrecision, Math.abs(sampleNearest(x) - realValue));
			tempLinearPrecision  = Math.max(
				tempLinearPrecision,  Math.abs(sampleLinear (x) - realValue));
		}
		
		nearestPrecision = tempNearestPrecision;
		linearPrecision  = tempLinearPrecision;
	}
	
	public final double sampleLinear(final double x) {
		
		final double fPos = Functions.mixRev(_begin, _end, x) * _intervalCount;
		final int    iPos = (int)Math.floor(fPos);
		
		if(iPos <  0)              return _samples[0];
		if(iPos >= _intervalCount) return _samples[_intervalCount];
		
		return Functions.mix(_samples[iPos], _samples[iPos + 1], fPos - iPos);
	}
	
	public final float sampleLinearF(final double x) {
		return (float)sampleLinear(x);
	}
	
	public final double sampleNearest(final double x) {
		return _samples[Functions.clampArrayAccess(
			(int)Math.round(Functions.mixRev(_begin, _end, x) * _intervalCount),
			_samples.length)];
	}
	
	public final float sampleNearestF(final double x) {
		return (float)sampleNearest(x);
	}
}
