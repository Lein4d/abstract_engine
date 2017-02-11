package ae.event;

public final class SignalEndPoint {
	
	private final SignalSource<?> _source;
	
	public final boolean[] flags;
	
	SignalEndPoint(
			final SignalSource<?> source,
			final int             flagCount) {
		
		_source = source;
		flags   = new boolean[flagCount];
	}
	
	@Override
	public final void finalize() {
		_source.removeEndPoint(this);
	}
	
	public final boolean hasChanged() {
		_source.collectChanges();
		return flags[0];
	}
	
	public void reset() {
		for(int i = 0; i < flags.length; i++) flags[i] = false;
	}
}
