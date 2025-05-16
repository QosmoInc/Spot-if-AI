import axios from "axios";

export const fetchAudioWaveform = async (url: string, samplingRate: number): Promise<Float32Array> => {
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        const audioContext = new AudioContext({ latencyHint: 'playback', sampleRate: samplingRate });
        const decodedBuffer = await audioContext.decodeAudioData(response.data);

        if (decodedBuffer.sampleRate !== samplingRate) {
            throw new Error(`Unsupported sample rate: ${decodedBuffer.sampleRate}. Expected ${samplingRate}.`);
        }

        return decodedBuffer.getChannelData(0);
    } catch (error) {
        console.error('Error during fetching:', error);
        throw error;
    }
}

const getMeta = (metaProperty: string, doc: Document = document): string | null => {
    const meta = doc.querySelector(`meta[property="${metaProperty}"]`)
    return meta?.getAttribute("content") ?? null
}

export const fetchAndParseMeta = async (url: string, metaProperty: string, maxRetries: number = 10, retryDelayMS: number = 100): Promise<string | null> => {
    let retries = 0;
    while (retries < maxRetries) {
        try {
            const response = await fetch(url, { credentials: 'omit' });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, "text/html");
            const metaContent = getMeta(metaProperty, doc);
            if (metaContent) {
                return metaContent;
            } else {
                console.warn(`Meta property "${metaProperty}" not found in ${url}`);
                return null;
            }
        } catch (error) {
            retries++;
            console.error(`Error fetching meta from ${url} (Attempt ${retries}/${maxRetries}):`, error);
            if (retries >= maxRetries) {
                console.error(`Max retries reached for ${url}. Giving up.`);
                return null;
            }
            await new Promise(resolve => setTimeout(resolve, retryDelayMS));
        }
    }
    return null;
}