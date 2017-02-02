
ae.util.SampledFunction = class SampledFunction {
	
	_begin:            number;
	_end:              number;
	_intervalCount:    number;
	_samples:          Array<number>;
	_nearestPrecision: number;
	_linearPrecision:  number;
	
	constructor(
			intervalCount: number,
			begin:         number,
			end:           number,
			func:          UnaryOperator<number>) {
		
		this._begin            = begin;
		this._end              = end;
		this._intervalCount    = intervalCount;
		this._samples          = Array(intervalCount + 1);
		this._nearestPrecision = 0;
		this._linearPrecision  = 0;
		
		for(let i = 0; i <= intervalCount; i++)
			this._samples[i] = func(ae.util.mix(begin, end, i / intervalCount));
		
		for(let i = 0; i < intervalCount; i++) {
			
			const x         = (2 * i + 1) / (2 * intervalCount);
			const realValue = func(x);
			
			this._nearestPrecision = Math.max(
				this._nearestPrecision,
				Math.abs(this.sampleNearest(x) - realValue));
			this._linearPrecision  = Math.max(
				this._linearPrecision,
				Math.abs(this.sampleLinear (x) - realValue));
		}
	}
	
	get nearestPrecision() {return this._nearestPrecision}
	get linearPrecision () {return this._linearPrecision}
	
	sampleLinear(x: number): number {
		
		const fPos =
			ae.util.mixRev(this._begin, this._end, x) * this._intervalCount;
		const iPos = Math.floor(fPos);
		
		if(iPos < 0) return this._samples[0];
		
		if(iPos >= this._intervalCount)
			return this._samples[this._intervalCount];
		
		return ae.util.mix(
			this._samples[iPos], this._samples[iPos + 1], fPos - iPos);
	}
	
	sampleNearest(x: number): number {
		
		return this._samples[ae.util.clampArrayAccess(
			Math.round(
				ae.util.mixRev(this._begin, this._end, x) *
				this._intervalCount),
			this._samples.length)];
	}
}
