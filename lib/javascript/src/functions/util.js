
function aeFuncAssert(
		cond: boolean,
		msg:  ?string = null) {
	
	if(!cond) throw "Assertion failed" + (msg ? ": " + msg : "");
}

function aeFuncAssertNotNull<T>(
		obj: ?T,
		msg: ?string = null): T {
	
	if(obj) {
		return obj;
	} else {
		throw "Assertion failed: " + (msg ? msg : "Object is null");
	}
};

function aeFuncAssertNull(
		obj: any,
		msg: ?string = null) {
	
	if(obj) throw "Assertion failed: " + (msg ? msg : "Object is not null");
};

function aeFuncCheckArrayCopyConsistency(
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

function aeFuncClamp(
		value: number,
		min:   number,
		max:   number): number {
	
	return value < min ? min : (value > max ? max : value);
}

function aeFuncClampArrayAccess(
		index:  number,
		length: number) {
	
	return index < 0 ? 0 : (index >= length ? length - 1 : index);
}

function aeFuncCloneArray1D<T>(array: Array<T>): Array<T> {
	
	return array.slice(0);
}

function aeFuncCloneArray2D<T>(
		array: Array<Array<T>>): Array<Array<T>> {
	
	const newArray = array.slice(0);
	
	for(let i = 0; i < array.length; i++)
		newArray[i] = ae.util.cloneArray1D(array[i]);
	
	return array.slice(0);
}

function aeFuncCloneArray3D<T>(
		array: Array<Array<Array<T>>>): Array<Array<Array<T>>> {
	
	const newArray = array.slice(0);
	
	for(let i = 0; i < array.length; i++)
		newArray[i] = ae.util.cloneArray2D(array[i]);
	
	return array.slice(0);
}

function aeFuncCopy1DimArray<T>(
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

function aeFuncCopy2DimArray<T>(
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

function aeFuncCreate2DimArray<T>(
		dimSize1: number,
		dimSize2: number): Array<Array<T>> {
	
	const array = Array(dimSize1);
	
	for(let i = 0; i < dimSize1; i++) array[i] = Array(dimSize2);
	return array;
};

function aeFuncCreate3DimArray<T>(
		dimSize1: number,
		dimSize2: number,
		dimSize3: number): Array<Array<Array<T>>> {
	
	const array = Array(dimSize1);
	
	for(let i = 0; i < dimSize1; i++)
		array[i] = ae.util.create2DimArray(dimSize2, dimSize3);
	
	return array;
};

function aeFuncMix(
		x1:    number,
		x2:    number,
		ratio: number) {
	
	return (1 - ratio) * x1 + ratio * x2;
}

function aeFuncMixRev(
		x1:    number,
		x2:    number,
		value: number) {
	
	return (value - x1) / (x2 - x1);
}
