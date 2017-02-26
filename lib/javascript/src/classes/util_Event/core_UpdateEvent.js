
class AEClassUpdateEvent<H> extends AEClassEvent<AEClassUpdateEvent<H>, H> {
	
	state: ae.core._p.RenderState;
	
	constructor(
			state: ae.core._p.RenderState,
			host:  H) {
		
		super(host);
		
		this.state = state;
		Object.freeze(this);
	}
	
	get time     (): number {return this.state.time;}
	get timeDelta(): number {return this.state.timeDelta;}
}