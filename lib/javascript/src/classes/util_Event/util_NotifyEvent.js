
ae.util.NotifyEvent =
	class NotifyEvent<H> extends ae.util.Event<ae.util.NotifyEvent<H>, H> {
	
	constructor(host: H) {
		super(host);
	}
}
