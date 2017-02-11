package ae.event;

import java.util.Arrays;

import ae.collections.PooledHashSet;

public final class SignalSource<H extends Observable> {
	
	private final SignalEndPoint[]              _forwardedSignals;
	private       PooledHashSet<SignalEndPoint> _endPoints;
	
	public final H   host;
	public final int flagCount;
	
	final void collectChanges() {
		
		if(_forwardedSignals != null && _endPoints != null) {
			
			for(int i = 0; i < flagCount; i++) {
				
				boolean flag = false;
				
				for(SignalEndPoint j : _forwardedSignals) {
					if(j.flags[i]) {
						flag = true;
						break;
					}
				}
				
				if(flag) for(SignalEndPoint j : _endPoints) j.flags[i] = true;
			}
		}
		
		host.reactToSignalChange();
	}
	
	public SignalSource(
			final H                  host,
			final SignalEndPoint ... forwardedSignals) {
		
		this(host, 1, forwardedSignals);
	}
	
	public SignalSource(
			final H                  host,
			final int                flagCount,
			final SignalEndPoint ... forwardedSignals) {
		
		if(flagCount < 1)
			throw new IllegalArgumentException(
				"'flagCount' must be greater than 0");
		
		for(SignalEndPoint i : forwardedSignals)
			if(i.flags.length != flagCount)
				throw new IllegalArgumentException(
					"Flag count of forwarded signal must match 'flagCount'");
		
		this.host              = host;
		this.flagCount         = flagCount;
		this._forwardedSignals = forwardedSignals.length > 0 ?
			Arrays.copyOf(forwardedSignals, forwardedSignals.length) : null;
	}
	
	public final SignalEndPoint createEndPoint() {
		
		final SignalEndPoint endPoint =
			new SignalEndPoint(this, flagCount);
		
		if(_endPoints == null) _endPoints = new PooledHashSet<>();
		_endPoints.insert(endPoint);
		
		return endPoint;
	}
	
	public final void fire(final int ... changeFlagIndices) {
		
		if(_endPoints == null) return;
		
		for(SignalEndPoint i : _endPoints) {
			i.flags[0] = true;
			for(int j : changeFlagIndices) i.flags[j] = true;
		}
	}

	public final void removeEndPoint(final SignalEndPoint endPoint) {
		if(_endPoints != null) _endPoints.remove(endPoint);
	}
}
