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
	private boolean _active;
	
	// Links to other instances in the unrolled scene graph
	private Instance _parent;      // 'null' if instance belongs to the root
	private Instance _firstChild;  // 'null' if there are no children
	private Instance _nextSibling; // 'null' if there are no more siblings
	
	// Derived properties
	private int     _level;
	private boolean _static;
	private boolean _rendered;
	private boolean _pickable;
	
	public final Instance assign(
			final Entity<?> entity,
    		final Instance  parent,
    		final Instance  firstChild,
    		final Instance  nextSibling) {
    	
    	_entity      = entity;
    	_active      = true;
    	_parent      = parent;
    	_firstChild  = firstChild;
    	_nextSibling = nextSibling;
		
		return this;
	}
	
	public final Instance deactivate() {
		_active = false;
		return this;
	}

	public final void deriveProperties() {
		
		if(_parent != null) {
	    	
			_active   = _parent._active   && _active;
			_level    = _parent._level + 1;
			_static   = _parent._static   && _entity.noTF;
			_rendered = _parent._rendered && _entity.rendered;
			_pickable = _parent._pickable && _entity.pickable;
			
		} else {
			
			_level    = 0;
			_static   = _entity.noTF;
			_rendered = _entity.rendered;
			_pickable = _entity.pickable;
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
		return _active;
	}
	
	public final boolean isStatic() {
		return _static;
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
