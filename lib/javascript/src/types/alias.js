
type Consumer      <T> = (object: T) => any;
type Visitor       <T> = (object: T) => any;
type IndexedVisitor<T> = (object: T, index: number) => any;

type Supplier     <T> = ()     => T;
type UnaryOperator<T> = (x: T) => T;

interface IObject {}
