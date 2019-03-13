export class SortedMap<V>{
    private map
    // can only use no parameter constructor outside
    constructor(obj?: any) {
        this.map = obj || {}
    }
    get(key: string | number): V {
        return this.map[key]
    }
    set(key: string | number, value: V): SortedMap<V> {
        let obj = { ...this.map }
        obj[key] = value
        return new SortedMap<V>(obj)
    }
    keys() {
        return Object.keys(this.map).sort()
    }
    [Symbol.iterator]() {
        let keys = Object.keys(this.map).sort()
        let index = 0
        return {
            next: () => {
                if (index < keys.length) {
                    let key = keys[index++]
                    return { value: [key, this.map[key]], done: false }
                } else {
                    return { done: true }
                }
            }
        }
    }
}