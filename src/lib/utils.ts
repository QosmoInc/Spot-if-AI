export const getUniqueStr = (): string => {
    return (
        new Date().getTime().toString(16) +
        Math.floor(1000 * Math.random()).toString(16)
    );
}

export const extractMiddleChunk = (
    waveform: Float32Array,
    targetLength: number
): Float32Array => {
    const start = Math.floor(waveform.length / 2) - Math.floor(targetLength / 2);
    const end = start + Math.floor(targetLength);
    return waveform.slice(start, end);
}

export class LimitedMap<K, V> {
    private map: Map<K, V>;
    private maxLength: number;

    constructor(maxLength: number) {
        this.map = new Map();
        this.maxLength = maxLength;
    }

    set(key: K, value: V): void {
        if (this.map.size >= this.maxLength) {
            const firstKey = this.map.keys().next().value!;
            this.map.delete(firstKey);
        }
        this.map.set(key, value);
    }

    get(key: K): V | undefined {
        return this.map.get(key);
    }
}