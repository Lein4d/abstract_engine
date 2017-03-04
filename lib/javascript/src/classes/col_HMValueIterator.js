
class AEClassHMValueIterator<K: ae.JavaObject, V> {
	
	hashMap: ae.col.PooledHashMap<K, V>;
	
	constructor(hashMap: ae.col.PooledHashMap<K, V>) {
		this.hashMap = hashMap;
	}
	
	forEach(visitor: Visitor<?V>) {
		for(let i = 0; i < this.hashMap.bufferSize; i++)
			if(this.hashMap._used[i]) visitor(this.hashMap._values[i]);
	}
	
	forEachRev(visitor: Visitor<?V>) {this.forEach(visitor);}
}
