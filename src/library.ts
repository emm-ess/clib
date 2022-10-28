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
