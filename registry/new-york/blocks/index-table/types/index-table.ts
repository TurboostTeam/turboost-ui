import { type OrderDirection } from "./order-direction";

export interface IndexTableOrder<OrderField> {
  field: OrderField;
  direction: OrderDirection;
}

export interface IndexTableEdge<Node> {
  node: Node;
  cursor: string;
}

export interface IndexTablePageInfo {
  endCursor?: string | null;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor?: string | null;
}

export interface IndexTablePagination {
  first?: number;
  last?: number;
  before?: string | null;
  after?: string | null;
}

export interface IndexTableValue<OrderField> extends IndexTablePagination {
  query?: string;
  orderBy?: IndexTableOrder<OrderField>;
}
