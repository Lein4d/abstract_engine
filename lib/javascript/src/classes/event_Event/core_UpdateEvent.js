
// ae.core.RenderState$UpdateEvent
class AEClassUpdateEvent extends AEClassEvent<AEClassUpdateEvent> {
	
	state: ae.core._p.RenderState;
	
	constructor(
			state: ae.core._p.RenderState,
			host:  ae.JavaObject) {
		
		super(host);
		
		this.state = state;
		Object.freeze(this);
	}
	
	get time     (): number {return this.state.time;}
	get timeDelta(): number {return this.state.timeDelta;}
}