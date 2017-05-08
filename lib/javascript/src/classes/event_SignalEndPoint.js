
// ae.event.SignalEndPoint
class AEClassSignalEndPoint extends AEClassJavaObject {
	
	_source: ae.event.SignalSource<*>;
	
	flags: Array<boolean>;
	
	constructor(
			source:    ae.event.SignalSource<*>,
			flagCount: number) {
		
		super();
		
		this._source = source;
		this.flags   = Array(flagCount);
		
		Object.freeze(this);
	}
	
	finalize(): void {
		this._source.removeEndPoint(this);
	}
	
	hasChanged(): boolean {
		this._source._collectChanges();
		return this.flags[0];
	}
	
	reset(): void {
		for(let i = 0; i < this.flags.length; i++) this.flags[i] = false;
	}
}
