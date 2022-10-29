export function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max)
}

export async function sleep(time: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve()
        }, time)
    })
}

export class Deferred<T> {
    promise: Promise<T>
    resolve!: (value: T) => void
    reject!: (reason?: unknown) => void

    constructor() {
        this.promise = new Promise((resolve, reject) => {
            this.resolve = resolve
            this.reject = reject
        })
        Object.freeze(this)
    }
}
