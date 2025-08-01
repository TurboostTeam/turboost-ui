type Prev = [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

type Join<K, P> = K extends string | number
  ? P extends string | number
    ? `${K}${"" extends P ? "" : "."}${P}`
    : never
  : never;

export type Field<T, D extends Prev[number] = 3> = [D] extends [never]
  ? never
  : T extends object
  ? {
      [K in keyof T]-?: K extends string | number
        ? T[K] extends Date
          ? `${K}`
          : Join<K, Field<T[K], Prev[D]>>
        : never;
    }[keyof T]
  : "";
