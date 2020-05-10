interface ObjectConstructor {
    fromEntries<T>(xs: [keyof T, T[keyof T]][]): T
}