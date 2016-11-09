
ae.util.assertNotNull = function assertNotNull<T>(
		obj: ?T,
		msg: ?string = null): T {
	
	if(obj) {
		return obj;
	} else if(msg) {
		throw msg;
	} else {
		throw "Object is null";
	}
};

ae.util.checkArrayCopyConsistency = function checkArrayCopyConsistency(
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

ae.util.cloneArray1D = function cloneArray1D<T>(array: Array<T>): Array<T> {
	
	return array.slice(0);
}

ae.util.cloneArray2D = function cloneArray1D<T>(
		array: Array<Array<T>>): Array<Array<T>> {
	
	const newArray = array.slice(0);
	
	for(var i = 0; i < array.length; i++)
		newArray[i] = ae.util.cloneArray1D(array[i]);
	
	return array.slice(0);
}

ae.util.cloneArray3D = function cloneArray1D<T>(
		array: Array<Array<Array<T>>>): Array<Array<Array<T>>> {
	
	const newArray = array.slice(0);
	
	for(var i = 0; i < array.length; i++)
		newArray[i] = ae.util.cloneArray2D(array[i]);
	
	return array.slice(0);
}

ae.util.copy1DimArray = function copy1DimArray<T>(
		src:       Array<T>,
		srcOffset: number,
		dst:       Array<T>,
		dstOffset: number,
		length:    number): Array<T> {
	
	if(!ae.util.checkArrayCopyConsistency(
		src, srcOffset, dst, dstOffset, length)) return dst;
	
	for(var i = 0; i < length; i++) dst[dstOffset + i] = src[srcOffset + i];
	
	return dst;
};

ae.util.copy2DimArray = function copy2DimArray<T>(
		src:       Array<Array<T>>,
		srcOffset: number,
		dst:       Array<Array<T>>,
		dstOffset: number,
		length:    number): Array<Array<T>> {
	
	if(!ae.util.checkArrayCopyConsistency(
		src, srcOffset, dst, dstOffset, length)) return dst;
	
	for(var i = 0; i < length; i++) {
		
		const subSrc = src[srcOffset + i];
		const subDst = dst[dstOffset + i];
		
		if(subSrc.length != subDst.length)
			throw "Sub arrays of different length";
		
		ae.util.copy1DimArray(subSrc, 0, subDst, 0, subSrc.length);
	}
	
	return dst;
};

ae.util.create2DimBooleanArray = function create2DimBooleanArray(
		dimSize1: number,
		dimSize2: number): Array<Array<boolean>> {
	
	const array = Array(dimSize1);
	
	for(var i = 0; i < dimSize2; i++) array[i] = Array(dimSize2);
	
	return array;
};

ae.util.create2DimNumberArray = function create2DimNumberArray(
		dimSize1: number,
		dimSize2: number): Array<Array<number>> {
	
	const array = Array(dimSize1);
	
	for(var i = 0; i < dimSize2; i++) array[i] = Array(dimSize2);
	
	return array;
};

ae.util.create3DimBooleanArray = function create3DimBooleanArray(
		dimSize1: number,
		dimSize2: number,
		dimSize3: number): Array<Array<Array<boolean>>> {
	
	const array = Array(dimSize1);
	
	for(var i = 0; i < dimSize2; i++)
		array[i] = ae.util.create2DimBooleanArray(dimSize2, dimSize3);
	
	return array;
};

ae.util.create3DimNumberArray = function create3DimNumberArray(
		dimSize1: number,
		dimSize2: number,
		dimSize3: number): Array<Array<Array<number>>> {
	
	const array = Array(dimSize1);
	
	for(var i = 0; i < dimSize2; i++)
		array[i] = ae.util.create2DimNumberArray(dimSize2, dimSize3);
	
	return array;
};

ae.util.computeNormalDirect = function computeNormalDirect(
		p0x:       number,
		p0y:       number,
		p0z:       number,
		p1x:       number,
		p1y:       number,
		p1z:       number,
		p2x:       number,
		p2y:       number,
		p2z:       number,
		n:         Array<number>,
		normalize: boolean = true): Array<number> {
	
	// Create the auxiliary vectors a,b for the vector product
	
	const ax = p1x - p0x;
	const ay = p1y - p0y;
	const az = p1z - p0z;
	const bx = p2x - p0x;
	const by = p2y - p0y;
	const bz = p2z - p0z;

	// Compute the vector product a x b
	
	n[0] = ay * bz - az * by;
	n[1] = az * bx - ax * bz;
	n[2] = ax * by - ay * bx;
	
	if(!normalize) return n;

	// Normalize the vector
	
	const length = Math.sqrt(n[0] * n[0] + n[1] * n[1] + n[2] * n[2]);

	n[0] /= length;
	n[1] /= length;
	n[2] /= length;
	
	return n;
};

ae.util.computeNormalFromPointArrays = function computeNormalFromPointArrays(
		p0:        Array<number>,
		p1:        Array<number>,
		p2:        Array<number>,
		n:         Array<number>,
		normalize: boolean = true) {
	
	return ae.util.computeNormalDirect(
		p0[0], p0[1], p0[2], p1[0], p1[1], p1[2], p2[0], p2[1], p2[2],
		n, normalize);
};
