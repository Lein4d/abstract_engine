package ae.collections;

import java.util.function.Consumer;
import java.util.function.Supplier;

public abstract class Pool<T> {
	
	public final Supplier<T> creator;
	public final Consumer<T> preparator;
	public final Consumer<T> finalizer;
	
	protected Pool(
    		final Supplier<T> creator,
    		final Consumer<T> preparator,
    		final Consumer<T> finalizer) {
		
		this.creator    = creator;
		this.preparator = preparator != null ? preparator : (obj) -> {};
		this.finalizer  = finalizer  != null ? finalizer  : (obj) -> {};
	}
	
	protected final T _create() {
		return creator.get();
	}

	@SuppressWarnings("unchecked")
	protected final void _finalize(final Object object) {
		finalizer.accept((T)object);
	}
	
	protected final T _prepare(final Object object) {
		
		@SuppressWarnings("unchecked")
		final T casted = (T)object;
		
		preparator.accept(casted);
		return casted;
	}
	
	public abstract int  getCapacity();
	public abstract int  getUnusedObjectCount();
	public abstract int  getUsedObjectCount();
	public abstract T    provide();
	public abstract void reset();
	
	public boolean free(final T object) {
		throw new UnsupportedOperationException(
			"Freeing a single object is not supported by this pool");
	}
}
