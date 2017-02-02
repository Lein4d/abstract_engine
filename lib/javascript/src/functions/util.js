
ae.util.assert = function(
		cond: boolean,
		msg:  ?string = null) {
	
	if(!cond) throw "Assertion failed" + (msg ? ": " + msg : "");
}

ae.util.assertNotNull = function<T>(
		obj: ?T,
		msg: ?string = null): T {
	
	if(obj) {
		return obj;
	} else {
		throw "Assertion failed: " + (msg ? msg : "Object is null");
	}
};

ae.util.assertNull = function(
		obj: any,
		msg: ?string = null) {
	
	if(obj) throw "Assertion failed: " + (msg ? msg : "Object is not null");
};

ae.util.checkArrayCopyConsistency = function(
		src:       Array<any>,
		srcOffset: number,
		dst:       Array<any>,
		dstOffset: number,
		length:    number): boolean {
	
	if(length === 0) return false;
	
	if(srcOffset + length >= src.length) throw "Range exceeds source array";
	if(dstOffset + length >= dst.length)
		throw "Range exceeds destination array";
	
	return true;
};

ae.util.clamp = function(
		value: number,
		min:   number,
		max:   number): number {
	
	return value < min ? min : (value > max ? max : value);
}

ae.util.clampArrayAccess = function(
		index:  number,
		length: number) {
	
	return index < 0 ? 0 : (index >= length ? length - 1 : index);
}

ae.util.cloneArray1D = function<T>(array: Array<T>): Array<T> {
	
	return array.slice(0);
}

ae.util.cloneArray2D = function<T>(
		array: Array<Array<T>>): Array<Array<T>> {
	
	const newArray = array.slice(0);
	
	for(let i = 0; i < array.length; i++)
		newArray[i] = ae.util.cloneArray1D(array[i]);
	
	return array.slice(0);
}

ae.util.cloneArray3D = function<T>(
		array: Array<Array<Array<T>>>): Array<Array<Array<T>>> {
	
	const newArray = array.slice(0);
	
	for(let i = 0; i < array.length; i++)
		newArray[i] = ae.util.cloneArray2D(array[i]);
	
	return array.slice(0);
}

ae.util.copy1DimArray = function<T>(
		src:       Array<T>,
		srcOffset: number,
		dst:       Array<T>,
		dstOffset: number,
		length:    number): Array<T> {
	
	if(!ae.util.checkArrayCopyConsistency(
		src, srcOffset, dst, dstOffset, length)) return dst;
	
	for(let i = 0; i < length; i++) dst[dstOffset + i] = src[srcOffset + i];
	
	return dst;
};

ae.util.copy2DimArray = function<T>(
		src:       Array<Array<T>>,
		srcOffset: number,
		dst:       Array<Array<T>>,
		dstOffset: number,
		length:    number): Array<Array<T>> {
	
	if(!ae.util.checkArrayCopyConsistency(
		src, srcOffset, dst, dstOffset, length)) return dst;
	
	for(let i = 0; i < length; i++) {
		
		const subSrc = src[srcOffset + i];
		const subDst = dst[dstOffset + i];
		
		if(subSrc.length != subDst.length)
			throw "Sub arrays of different length";
		
		ae.util.copy1DimArray(subSrc, 0, subDst, 0, subSrc.length);
	}
	
	return dst;
};

ae.util.create2DimArray = function<T>(
		dimSize1: number,
		dimSize2: number): Array<Array<T>> {
	
	const array = Array(dimSize1);
	
	for(let i = 0; i < dimSize1; i++) array[i] = Array(dimSize2);
	return array;
};

ae.util.create3DimArray = function<T>(
		dimSize1: number,
		dimSize2: number,
		dimSize3: number): Array<Array<Array<T>>> {
	
	const array = Array(dimSize1);
	
	for(let i = 0; i < dimSize1; i++)
		array[i] = ae.util.create2DimArray(dimSize2, dimSize3);
	
	return array;
};

ae.util.mix = function(
		x1:    number,
		x2:    number,
		ratio: number) {
	
	return (1 - ratio) * x1 + ratio * x2;
}

ae.util.mixRev = function(
		x1:    number,
		x2:    number,
		value: number) {
	
	return (value - x1) / (x2 - x1);
}
