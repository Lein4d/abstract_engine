
// ae.scenegraph.Entity<This>
class AEClassEntity extends AEClassJavaObject {
	
	// The ...Rec values are only relevant if rendered/pickable is false. Then
	// they define whether these values are forced onto the children, too.
	_p: {
		rendered:    boolean;
		renderedRec: boolean;
		pickable:    boolean;
		pickableRec: boolean;
	}
	
	_children:  ae.col.PooledLinkedList<ae.sg.Entity>;
	_instances: ae.col.PooledLinkedList<ae.sg.Instance>;
	
	name:          ae.util.String;
	type:          EnumEntityType;
	sceneGraph:    ae.core.SceneGraph;
	children:      BiIterable<ae.sg.Entity>;
	instances:     BiIterable<ae.sg.Instance>;
	noTF:          boolean;
	noInheritedTF: boolean;
	multiInstance: boolean;
	onUpdate:      ae.core._p.UpdateEvent;
	
	// Attributes
	transformation: ae.sg.ConstAttribute<ae.math.Matrix4D>;
	
	// protected constructor ///////////////////////////////////////////////////
	
	constructor(
			sceneGraph:     ae.core.SceneGraph,
			type:           EnumEntityType,
			name:          (string | null),
			noTF:           boolean,
			noInheritedTF:  boolean,
			multiInstance:  boolean) {
		
		super();
		
		this.type           = type;
		this.name           = sceneGraph._addEntity(this, name);
		this.hashCode       = this.name.hashCode;
		this.sceneGraph     = sceneGraph;
		this.noTF           = noTF;
		this.noInheritedTF  = noInheritedTF;
		this.multiInstance  = multiInstance;
		this.onUpdate       =
			sceneGraph.engine.state.createUpdateEvent(this);
		this.transformation = new AEClassConstAttribute(new AEClassMatrix4D());
		this._children      = new AEClassPooledLinkedList();
		this. children      = this._children;
		this._instances     = new AEClassPooledLinkedList();
		this. instances     = this._instances;
		this._p             = {
			rendered:    true,
			renderedRec: true,
			pickable:    true,
			pickableRec: true,
		};
		
		// Will be frozen in derived classed or outside the constructor
	}
	
	get childCount(): number {return this._children.size;}
	
	get instance(): ?ae.sg.Instance {
		
		if(this.multiInstance || this._instances.empty) return null;
		
		const instance = this._instances.first;
		return instance.active ? instance : null;
	}
	
	get instanceCount(): number  {return this._instances.size;}
	get pickable     (): boolean {return this._p.pickable;}
	get pickableRec  (): boolean {return this._p.pickableRec;}
	get rendered     (): boolean {return this._p.rendered;}
	get renderedRec  (): boolean {return this._p.renderedRec;}
	
	set pickable(pickable: boolean): void {
		this._p.pickable = pickable;
	}
	
	set pickableRec(pickableRec: boolean): void {
		this._p.pickableRec = pickableRec;
	}
	
	set rendered(rendered: boolean): void {
		this._p.rendered = rendered;
	}
	
	set renderedRec(renderedRec: boolean): void {
		this._p.renderedRec = renderedRec;
	}
	
	static create(
			sceneGraph:         ae.core.SceneGraph,
			name:              (string | null),
			hasTransformation:  boolean): ae.sg.Entity {
		
		const entity = new AEClassEntity(
			sceneGraph, _aeEnumEntityType.NONE, name,
			!hasTransformation, false, true);
		
		Object.freeze(entity);
		
		return entity;
	}
	
	static makeRoot(sceneGraph: ae.core.SceneGraph): ae.sg.Entity {
		return new AEClassEntity(
			sceneGraph, _aeEnumEntityType.NONE, "root", true, true, false);
	}

	addChild(entity: ae.sg.Entity): void {
		
		if(entity.sceneGraph !== this.sceneGraph)
			throw "Entity belongs to different scene graph";
		
		this._children .insertAtEnd(entity);
		this.sceneGraph._invalidateGraphStructure();
	}
	
	addInstance(instance: ae.sg.Instance): ae.sg.Instance {
		this._instances.insertAtEnd(instance);
		return instance;
	}
	
	equals(obj: IObject) {
		if(!(obj instanceof AEClassEntity)) return false;
		return this.name.equals(obj.name);
	}
	
	static group(
			name:              (string | null),
			hasTransformation:  boolean,
			... children:       Array<ae.sg.Entity>): ae.sg.Entity {
		
		const entity = AEClassEntity.create(
			children[0].sceneGraph, name, hasTransformation);
		
		children.forEach((child) => entity.addChild(child));
		
		Object.freeze(entity);
		return entity;
	}

	resetInstances(): void {
		this._instances.clear();
	}
	
	setUpdateCallback(callback: Consumer<ae.core._p.UpdateEvent>): this {
		this.onUpdate.addListener(callback);
		return this;
	}
	
	update(): void {
		//console.log(this.name.str + ": " + this.onUpdate.hashCode);
		this.onUpdate.fire();
		if(this.noTF) this.transformation.resetExternal();
	}
}
