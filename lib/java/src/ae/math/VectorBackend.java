package ae.math;

import ae.event.Observable;
import ae.event.SignalEndPoint;
import ae.event.SignalSource;

public abstract class VectorBackend implements Observable {
	
	private SignalSource<VectorBackend> _signal = new SignalSource<>(this);
	
	protected float _getElement(
    		final int index) {
    	
    	switch(index) {
    		case 0: return getX();
    		case 1: return getY();
    		case 2: return getZ();
    		case 3: return getW();
    	}
    	
    	throw new IndexOutOfBoundsException();
    }
    
    protected abstract float _getX();
    protected abstract float _getY();
    protected abstract float _getZ();
    protected abstract float _getW();
    
    protected void _setElement(
    		final int   index,
    		final float value) {
    	
    	switch(index) {
    		case 0: _setX(value); break;
    		case 1: _setY(value); break;
    		case 2: _setZ(value); break;
    		case 3: _setW(value); break;
    	}
    	
    	throw new IndexOutOfBoundsException();
    }
    
    protected abstract void _setX(final float x);
    protected abstract void _setY(final float y);
    protected abstract void _setZ(final float z);
    protected abstract void _setW(final float w);

    @Override
	public final SignalEndPoint createSignalEndPoint() {
		return _signal.createEndPoint();
	}
	
	public final float getElement(final int index) {
		return _getElement(index);
	}
	
	public final float getX() {return _getX();}
	public final float getY() {return _getY();}
	public final float getZ() {return _getZ();}
	public final float getW() {return _getW();}

	public final VectorBackend setElement(
			final int   index,
			final float value) {
		
		_setElement(index, value);
		_signal.fire();
		
		return this;
	}
	
	public final VectorBackend setX(final float x) {
		
		_setX(x);
		_signal.fire();
		
		return this;
	}

	public final VectorBackend setY(final float y) {
		
		_setY(y);
		_signal.fire();
		
		return this;
	}

	public final VectorBackend setZ(final float z) {
		
		_setZ(z);
		_signal.fire();
		
		return this;
	}

	public final VectorBackend setW(final float w) {
		
		_setW(w);
		_signal.fire();
		
		return this;
	}
}
