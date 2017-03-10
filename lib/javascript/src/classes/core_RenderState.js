
class AEClassRenderState {
	
	_p: {
		frameIndex: number;
		absTime:    number;
		time:       number;
		timeDelta:  number;
	}
	
	onNewFrame: ae.event.NotifyEvent<ae.core._p.RenderState>;
	
	constructor() {
		
		this._p = {
			frameIndex: -1,
			absTime:    0,
			time:       0,
			timeDelta:  0
		};
		
		this.onNewFrame = new AEClassNotifyEvent(this);
		
		Object.freeze(this);
	}
	
	get frameIndex(): number {return this._p.frameIndex;}
	get absTime   (): number {return this._p.absTime;}
	get time      (): number {return this._p.time;}
	get timeDelta (): number {return this._p.timeDelta;}
	
	_beginNextFrame(speed: number) {
		
		const absTimeNew = Date.now();
		
		if(this.frameIndex == -1) {
			
			// Prevent a huge timeDelta in the first frame
			this._p.absTime = absTimeNew;
			
			//for(let i = 0; i < _fpsCounters.length; i++)
			//	_fpsCounters[i] =
			//		new FpsCounter((i * 1000) / _fpsCounters.length);
		}
		
		this._p.frameIndex++;
		this._p.timeDelta  = speed * (absTimeNew - this.absTime);
		this._p.time       = this.frameIndex == 0 ? 0 : this.time + this.timeDelta;
		this._p.absTime    = absTimeNew;
		
		this.onNewFrame.fire();
	}
	
	//createUpdateEvent<H>(host: H): ae.core.UpdateEvent<H> {
	//	return new ae.core.UpdateEvent<H>(this, host);
	//}
}
