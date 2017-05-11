
// ae.scenegraph.Instance
class AEClassInstance extends AEClassJavaObject {
	
	_p: {
		
		// Link to the original entity that contains most of the meta
		// information
		entity: ae.sg.Entity;

		// The ID may be used for object picking
		id: number;
		
		// Used to skip this instance in case of consistency errors
		valid: boolean;
		
		// Links to other instances in the unrolled scene graph
		parent:      (ae.sg.Instance | null); // 'null' if instance belongs to the root
		firstChild:  (ae.sg.Instance | null); // 'null' if there are no children
		nextSibling: (ae.sg.Instance | null); // 'null' if there are no more siblings
		
		// Derived properties
		level:       number;
		fixed:       boolean;
		rendered:    boolean;
		renderedRec: boolean;
		pickable:    boolean;
		pickableRec: boolean;
	}
	
	tfToEyeSpace:    ae.math.Matrix4D;
	tfToCameraSpace: ae.math.Matrix4D;
	
	get _pickableRec(): boolean {return this._p.pickableRec;}
	get _renderedRec(): boolean {return this._p.renderedRec;}
	get _valid      (): boolean {return this._p.valid;}
	
	constructor() {
		
		super();
		
		this.tfToEyeSpace    = new AEClassMatrix4D();  
		this.tfToCameraSpace = new AEClassMatrix4D();
		// $NOT_NULL: 'entity'
		this._p              = {
			entity:      null,
			id:          0,
			valid:       false,
			parent:      null,
			firstChild:  null,
			nextSibling: null,
			level:       0,
			fixed:       false,
			rendered:    false,
			renderedRec: false,
			pickable:    false,
			pickableRec: false,
		};
		
		Object.freeze(this);
	}
	
	assign(
			entity:       ae.sg.Entity,
    		parent:      (ae.sg.Instance | null),
    		firstChild:  (ae.sg.Instance | null),
    		nextSibling: (ae.sg.Instance | null)): this {
    	
    	this._p.entity      = entity;
    	this._p.valid       = true;
    	this._p.parent      = parent;
    	this._p.firstChild  = firstChild;
    	this._p.nextSibling = nextSibling;
		
		return this;
	}
	
	deactivate(): this {
		this._p.valid = false;
		return this;
	}

	deriveProperties(): void {
		
		if(this.parent !== null) {
	    	
			this._p.valid = this.parent._valid && this._valid;
			this._p.level = this.parent.level + 1;
			this._p.fixed = this.parent.fixed  && this.entity.noTF;
			
			this._p.rendered = this._valid && this.parent._renderedRec && this.entity.rendered;
			this._p.pickable = this._valid && this.parent._pickableRec && this.entity.pickable;
			
			// Derive the recursive properties
			this._p.renderedRec = this.rendered || this.entity.renderedRec;
			this._p.pickableRec = this.pickable || this.entity.pickableRec;
			
		} else {
			
			this._p.level       = 0; // Root is always on level 0
			this._p.fixed       = this._p.entity.noTF;
			this._p.renderedRec = this._p.entity.renderedRec;
			this._p.pickableRec = this._p.entity.pickableRec;
			this._p.rendered    = this._p.entity.rendered;
			this._p.pickable    = this._p.entity.pickable;
		}
	}
	
	getScope(dst: ae.col.PooledLinkedList<ae.sg.Instance>):
		ae.col.PooledLinkedList<ae.sg.Instance> {
		
		let instance = this;
		
		dst.clear();
		
		while(instance !== null) {
			dst.insertAtFront(instance);
			instance = instance.parent;
		}
		
		return dst;
	}
	
	get active     ():  boolean                {return this._p.valid;}
	get entity     ():  ae.sg.Entity           {return this._p.entity;}
	get firstChild (): (ae.sg.Instance | null) {return this._p.firstChild;}
	get fixed      ():  boolean                {return this._p.fixed;}
	get id         ():  number                 {return this._p.id;}
	get level      ():  number                 {return this._p.level;}
	get nextSibling(): (ae.sg.Instance | null) {return this._p.nextSibling;}
	get parent     (): (ae.sg.Instance | null) {return this._p.parent;}
	get pickable   ():  boolean                {return this._p.pickable;}
	get rendered   ():  boolean                {return this._p.rendered;}
	
	setId(id: number): this {
    	this._p.id = id;
		return this;
	}
	
	transformToCameraSpace(tfCameraInverse: ae.math.Matrix4D): this {
		
		this.tfToCameraSpace.setData       (tfCameraInverse);
		this.tfToCameraSpace.multWithMatrix(this.tfToEyeSpace);
		
		return this;
	}
}
