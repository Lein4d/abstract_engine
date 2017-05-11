
type Consumer      <T> = (object: T)                => any;
type Visitor       <T> = (object: T)                => any;
type IndexedVisitor<T> = (object: T, index: number) => any;

type Supplier     <T> = ()     => T;
type UnaryOperator<T> = (x: T) => T;

type Gradient2D = (x: number, y: number, color: Array<number>) => any;

interface Iterable<T> {
	forEach(visitor: Visitor<T>): void;
}

interface BiIterable<T> {
	forEach   (visitor: Visitor<T>): void;
	forEachRev(visitor: Visitor<T>): void;
}

interface Observable {
	createSignalEndPoint(): ae.event.SignalEndPoint;
	reactToSignalChange (): void;
}
