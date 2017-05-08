
// ae.collections.PooledHashMap<K,V>$ValueIterator
class AEClassHMValueIterator<K: ae.JavaObject, V> extends AEClassJavaObject {
	
	hashMap: ae.col.PooledHashMap<K, V>;
	
	constructor(hashMap: ae.col.PooledHashMap<K, V>) {
		super();
		this.hashMap = hashMap;
	}
	
	forEach(visitor: Visitor<?V>) {
		for(let i = 0; i < this.hashMap.bufferSize; i++)
			if(this.hashMap._used[i]) visitor(this.hashMap._values[i]);
	}
	
	forEachRev(visitor: Visitor<?V>) {this.forEach(visitor);}
}
