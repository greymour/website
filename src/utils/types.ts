// random types that don't make sense anywhere else

export type Option<T> = T | null;

export type Enum<T> = T[keyof T];
