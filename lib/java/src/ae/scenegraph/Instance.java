package ae.scenegraph;

import ae.collections.PooledLinkedList;
import ae.math.Matrix4D;
import ae.util.OrganizedObject;

public final class Instance extends OrganizedObject<Instance> {
	
	public final Matrix4D tfToEyeSpace    = new Matrix4D();
	public final Matrix4D tfToCameraSpace = new Matrix4D();
	
	// Link to the original entity that contains most of the meta information
	private Entity<?> _entity;

	// The ID may be used for object picking
	private int _id;
	
	// Used to skip this instance in case of consistency errors
	private boolean _valid;
	
	// Links to other instances in the unrolled scene graph
	private Instance _parent;      // 'null' if instance belongs to the root
	private Instance _firstChild;  // 'null' if there are no children
	private Instance _nextSibling; // 'null' if there are no more siblings
	
	// Derived properties
	private int     _level;
	private boolean _fixed;
	private boolean _rendered;
	private boolean _renderedRec;
	private boolean _pickable;
	private boolean _pickableRec;
	
	public final Instance assign(
			final Entity<?> entity,
    		final Instance  parent,
    		final Instance  firstChild,
    		final Instance  nextSibling) {
    	
    	_entity      = entity;
    	_valid       = true;
    	_parent      = parent;
    	_firstChild  = firstChild;
    	_nextSibling = nextSibling;
		
		return this;
	}
	
	public final Instance deactivate() {
		_valid = false;
		return this;
	}

	public final void deriveProperties() {
		
		if(_parent != null) {
	    	
			_valid = _parent._valid   && _valid;
			_level = _parent._level + 1;
			_fixed = _parent._fixed   && _entity.noTF;
			
			// Derive the recursive properties
			_renderedRec = _parent._renderedRec && _entity.renderedRec;
			_pickableRec = _parent._pickableRec && _entity.pickableRec;
			
			// Derive properties based on the recursive ones
			_rendered = _valid && _renderedRec && _entity.rendered;
			_pickable = _valid && _pickableRec && _entity.pickable;
			
		} else {
			
			_level       = 0; // Root is always on level 0
			_fixed       = _entity.noTF;
			_renderedRec = _entity.renderedRec;
			_pickableRec = _entity.pickableRec;
			_rendered    = _entity.rendered;
			_pickable    = _entity.pickable;
		}
	}

	public final Entity<?> getEntity() {
		return _entity;
	}
	
	public final Instance getFirstChild() {
		return _firstChild;
	}
	
	public final int getId() {
		return _id;
	}
	
	public final int getLevel() {
		return _level;
	}
	
	public final Instance getNextSibling() {
		return _nextSibling;
	}
	
	public final Instance getParent() {
		return _parent;
	}
	
	public final PooledLinkedList<Instance> getScope(
			final PooledLinkedList<Instance> dst) {
		
		Instance instance = this;
		
		dst.clear();
		
		while(instance != null) {
			dst.insertAtFront(instance);
			instance = instance._parent;
		}
		
		return dst;
	}
	
	public final boolean isActive() {
		return _valid;
	}
	
	public final boolean isFixed() {
		return _fixed;
	}
	
	public final boolean isPickable() {
		return _pickable;
	}
	
	public final boolean isRendered() {
		return _rendered;
	}
	
	public final Instance setId(final int id) {
    	_id = id;
    	return this;
	}
	
	public final Instance transformToCameraSpace(
			final Matrix4D tfCameraInverse) {
		
		tfToCameraSpace.setData(tfCameraInverse);
		tfToCameraSpace.multWithMatrix(tfToEyeSpace);
		
		return this;
	}
}
