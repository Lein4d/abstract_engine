package ae.util;

import java.util.Random;

import ae.collections.PooledHashMap;

public final class NameDomain<T> {
	
	private final PooledHashMap<String, T> _objects = new PooledHashMap<>();
	private final Random                   _random  = new Random();
	private final String                   _randNamePrefix;
	
	public final Iterable<T> objects = _objects.values;
	
	public NameDomain() {
		this("");
	}
	
	public NameDomain(final String randNamePrefix) {
		_randNamePrefix = randNamePrefix;
	}
	
	public final String addObject(final T object) {
		
		String name;
		
		do {
			name = _randNamePrefix + (_random.nextInt() & 0x7FFFFFFF);
		} while(isNameUsed(name));
		
		_objects.setValue(name, object);
		
		return name;
	}
	
	public final String addObject(
			final T      object,
			final String name) {
		
		if(name == null) return addObject(object);
		
		if(isNameUsed(name))
			throw new UnsupportedOperationException(
				"Name '" + name + "' already used in this domain");
		
		_objects.setValue(name, object);
		
		return name;
	}
	
	public final T getObject(final String name) {
		return _objects.getValue(name);
	}
	
	public final int getObjectCount() {
		return _objects.getSize();
	}
	
	public final boolean isNameAvailable(final String name) {
		return !_objects.hasKey(name);
	}
	
	public final boolean isNameUsed(final String name) {
		return _objects.hasKey(name);
	}
	
	public final void removeObject(final String name) {
		_objects.deleteKey(name);
	}
	
	public final void reset() {
		_objects.clear();
	}
}
