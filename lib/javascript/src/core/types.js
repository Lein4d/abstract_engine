
type Consumer      <T> = (object: T) => any;
type Visitor       <T> = (object: T) => any;
type IndexedVisitor<T> = (object: T, index: number) => any;

type UnaryOperator<T> = (x: T) => T;
