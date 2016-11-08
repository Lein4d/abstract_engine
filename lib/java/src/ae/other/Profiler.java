package ae.other;

import ae.other.Average.Type;

public final class Profiler {
	
	private static final Profiler _OVERHEAD_PROFILER = new Profiler(100);

	private final Average _costAvg;
	
	private long _tStart;
	private long _tEnd;
	private long _cost;
	
	public Profiler(
			final int slotCount) {
		
		this(new FloatingAverage(Type.INT, slotCount));
	}
	
	public Profiler(
			final Average average) {
		
		_costAvg = average;
	}
	
	public final void end() {
		
		_tEnd = System.nanoTime();
		_cost = _costAvg.addValue((int)(_tEnd - _tStart));
	}
	
	public final void endWithCorrect() {
		
		_tEnd = System.nanoTime();
		_cost = _costAvg.addValue((int)(_tEnd - _tStart - _OVERHEAD_PROFILER._cost));
	}
	
	public final long getCost() {
		
		return _cost;
	}
	
	public static final long getOverhead() {
		
		return _OVERHEAD_PROFILER._cost;
	}
	
	public static final void profileOverhead() {
		
		_OVERHEAD_PROFILER.start();
		_OVERHEAD_PROFILER.end();
	}
	
	public final void start() {
		
		_tStart = System.nanoTime();
	}
}
