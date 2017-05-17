
// ae.event.SignalSource<H extends Observable>
class AEClassSignalSource<H: Observable> {
	
	_forwardedSignals: ?Array<ae.event.SignalEndPoint>;
	_p: {
		endPoints: ?ae.col.PooledHashSet<ae.event.SignalEndPoint>;
	}
	
	host:      H;
	flagCount: number;
	
	get _endPoints(): ?ae.col.PooledHashSet<ae.event.SignalEndPoint> {
		return this._p.endPoints;
	}
	
	_collectChanges(): void {
		
		if(this._forwardedSignals && this._endPoints) {
			
			for(let i = 0; i < this.flagCount; i++) {
				
				let flag = false;
				
				for(let j = 0; j < this._forwardedSignals.length; j++) {
					if(this._forwardedSignals[j].flags[i]) {
						flag = true;
						break;
					}
				}
				
				if(flag)
					this._endPoints.forEach(
						(endPoint) => {endPoint.flags[i] = true;});
			}
		}
		
		this.host.reactToSignalChange();
	}
	
	constructor(
			host:                 H,
			flagCount:            number,
			... forwardedSignals: Array<ae.event.SignalEndPoint>) {
		
		if(flagCount < 1) throw "'flagCount' must be greater than 0";
		
		forwardedSignals.forEach((endPoint) => {
			if(endPoint.flags.length !== flagCount)
				throw "Flag count of forwarded signal must match 'flagCount'";
		});
		
		this.host              = host;
		this.flagCount         = flagCount;
		this._forwardedSignals = forwardedSignals.length > 0 ?
			aeFuncCopy1DimArray(
				forwardedSignals, 0, Array(forwardedSignals.length), 0,
				forwardedSignals.length) :
			null;
		this._p                = {endPoints: null};
		
		Object.freeze(this);
	}
	
	createEndPoint(): ae.event.SignalEndPoint {
		
		const endPoint = new AEClassSignalEndPoint(this, this.flagCount);
		
		if(!this._endPoints) this._p.endPoints = new AEClassPooledHashSet();
		// $NOT_NULL
		this._endPoints.insert(endPoint);
		
		return endPoint;
	}
	
	fire(... changeFlagIndices: Array<number>): void {
		
		if(!this._endPoints) return;
		
		this._endPoints.forEach((endPoint) => {
			endPoint.flags[0] = true;
			for(let i = 0; i < changeFlagIndices.length; i++)
				endPoint.flags[i] = true;
		});
	}

	removeEndPoint(endPoint: ae.event.SignalEndPoint): void {
		if(this._endPoints) this._endPoints.remove(endPoint);
	}
}
