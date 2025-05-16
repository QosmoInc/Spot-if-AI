import * as ort from "onnxruntime-web";

export const SAMPLING_RATE = 44100;
export const MAX_TIME = 5;

ort.env.wasm.numThreads = 1;
ort.env.wasm.wasmPaths = "./";

let session: ort.InferenceSession | null = null;

const initSession = async () => {
    if (session !== null) {
        return;
    }

    try {
        session = await ort.InferenceSession.create("./sonics_model.onnx", {
            executionProviders: ["wasm"]
        });
    } catch (error) {
        console.error("Error initializing ONNX Runtime session:", error);
    }
}

const infer = async (audioData: Float32Array): Promise<number | null> => {
    const audioDataTensor = new ort.Tensor("float32", audioData, [1, MAX_TIME * SAMPLING_RATE]);

    const feeds = { audio: audioDataTensor };
    await initSession();
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