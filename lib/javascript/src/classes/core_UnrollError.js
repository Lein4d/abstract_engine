
// ae.core.SceneGraph$UnrollError
class AEClassUnrollError extends AEClassJavaObject {
	
	_p: {
		entity:    ae.sg.Entity;
		instance: ?ae.sg.Instance;
		msg:       string;
	}
	
	_sg:            ae.core.SceneGraph;
	_instanceScope: ae.col.PooledLinkedList<ae.sg.Instance>;
	
	constructor(sg: ae.core.SceneGraph) {
		
		super();
		
		this._sg            = sg;
		this._instanceScope = new AEClassPooledLinkedList();
		// $NOT_NULL
		this._p             = {
			entity:   null,
			instance: null,
			msg:      null,
		};
	}
	
	_print(): void {
		/*
		engine.err.println("\tERROR: " + _msg);
		engine.err.println(
			"\t\tin entity '" + _entity.name + "' (" + _entity.type + ")");
		
		if(_instance != null) {
			
			_instance.getScope(_instanceScope);
			
			engine.err.print("\t\tin instance [");
			for(Instance i : _instanceScope)
				engine.err.print(
					i.getEntity().name + (i != _instance ? " -> " : ""));
			engine.err.println("]");
		}
		*/
	}
	
	_setA(
			entity: ae.sg.Entity,
			msg:    string): this {
		
		this._p.entity   = entity;
		this._p.instance = null;
		this._p.msg      = msg;
		
		return this;
	}
	
	_setB(
			instance: ae.sg.Instance,
			msg:      string): this {
		
		this._p.entity   = instance.entity;
		this._p.instance = instance;
		this._p.msg      = msg;
		
		return this;
	}
}