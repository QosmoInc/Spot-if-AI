import { createFakeProbabilityDiv } from "./components";
import { fetchAndParseMeta, fetchAudioWaveform } from "./fetcher";
import { extractMiddleChunk, LimitedMap } from "./utils";

const SAMPLING_RATE = 44100;
const processingTracks = new Set<string>();
const resultCache = new LimitedMap<string, number>(1000);

export const classifyTrack = async (url: string): Promise<number | null> => {
    const cache = resultCache.get(url);
    if (cache) {
        return cache;
    }

    const previewUrl = await fetchAndParseMeta(url, "og:audio");
    if (!previewUrl) {
        console.error("No preview URL found.");
        return null;
    }

    const waveform = await fetchAudioWaveform(previewUrl, SAMPLING_RATE);
    const slicedWaveform = extractMiddleChunk(waveform, 5 * SAMPLING_RATE);

    return new Promise((resolve, _) => {
        chrome.runtime.sendMessage({ waveform: JSON.stringify(Array.from(slicedWaveform)) }, (response) => {
            resultCache.set(url, response);
            return resolve(response);
        });
    });
}

export const processInternalTrackLink = async (link: Element, isSkip: () => boolean) => {
    const href = link.getAttribute('href');
    const parent = link.parentElement?.parentElement;
    const existingDiv = parent?.querySelector(`.fake-probability[data-track-href="${href}"]`);

    if (!href || !parent || existingDiv || processingTracks.has(href)) return;

    processingTracks.add(href);

    try {
        const probability = await classifyTrack(href);
        if (probability !== null) {
            const div = createFakeProbabilityDiv(probability, "playlist");
            div.setAttribute('data-track-href', href);
            if (!isSkip()) {
                parent.appendChild(div);
            }
        }
    } catch (error) {
        console.error(`Error processing track ${href}:`, error);
    } finally {
        processingTracks.delete(href);
    }
};