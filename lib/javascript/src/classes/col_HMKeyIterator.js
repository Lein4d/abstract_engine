
class AEClassHMKeyIterator<K: ae.JavaObject, V> {
	
	hashMap: ae.col.PooledHashMap<K, V>;
	
	constructor(hashMap: ae.col.PooledHashMap<K, V>) {
		this.hashMap = hashMap;
	}
	
	forEach(visitor: Visitor<K>) {
		for(let i = 0; i < this.hashMap.bufferSize; i++)
			if(this.hashMap._keys[i]) visitor(this.hashMap._keys[i]);
	}
	
	forEachRev(visitor: Visitor<K>) {this.forEach(visitor);}
}
