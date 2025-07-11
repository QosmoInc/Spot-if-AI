import * as ort from "onnxruntime-web";

export const SAMPLING_RATE = 44100;
export const MAX_TIME = 5;

ort.env.wasm.numThreads = 1;
ort.env.wasm.wasmPaths = "./";

let sessionPromise: Promise<ort.InferenceSession | null> | null = null;

export const initSession = (): Promise<ort.InferenceSession | null> => {
    if (sessionPromise) return sessionPromise;

    sessionPromise = (async () => {
        try {
            const session = await ort.InferenceSession.create('./sonics_model.onnx', {
                executionProviders: ["wasm"],
            });
            return session;
        } catch (err) {
            console.error("Failed to load model:", err);
            return null;
        }
    })();

    return sessionPromise;
}

const infer = async (audioData: Float32Array): Promise<number | null> => {
    const audioDataTensor = new ort.Tensor("float32", audioData, [1, MAX_TIME * SAMPLING_RATE]);

    const feeds = { audio: audioDataTensor };
    const session = await initSession();
    if (session) {
        try {
            const results = await session.run(feeds);
            const outputTensor = results.prob;
            const outputData = outputTensor.data as Float32Array;
            return Array.from(outputData)[0];
        } catch (error) {
            console.error('Error during inference:', error);
        }
    }
    return null;
}

export default infer