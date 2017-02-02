
ae.core._p.UpdateEvent =
	class UpdateEvent<H> extends ae.util.Event<ae.core._p.UpdateEvent<H>, H> {
	
	state: ae.core.RenderState;
	
	constructor(
			state: ae.core.RenderState,
			host:  H) {
		
		super(host);
		
		this.state = state;
		Object.freeze(this);
	}
	
	get time     (): number {return this.state.time;}
	get timeDelta(): number {return this.state.timeDelta;}
}