import infer from "./lib/infer_engine";

let inferenceQueue = Promise.resolve();

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === "contentScriptReady" && _sender.tab?.id) {
        chrome.tabs.sendMessage(_sender.tab.id, "loaded", () => {
            if (chrome.runtime.lastError) {
                console.warn("Error sending 'loaded' to tab:", chrome.runtime.lastError.message);
            }
        });
        return true; // keep channel open for async sendResponse if needed
    }

    if (message && typeof message === "object" && "waveform" in message) {
        const audioData = new Float32Array(JSON.parse(message.waveform));

        inferenceQueue = inferenceQueue.then(async () => {
            try {
                const result = await infer(audioData);
                sendResponse(result);
            } catch (error) {
                console.error("Error during inference:", error);
                sendResponse(null);
            }
        });

        return true; // keep channel open for async response
    }

    if (message === "loaded") {
        return false;
    }

    console.warn("Received unknown message:", message);
    return false;
});

chrome.tabs.onUpdated.addListener((tabId, info, tab) => {
    if (info.status === 'complete' && tab.url?.includes('https://open.spotify.com/')) {
        chrome.tabs.sendMessage(tabId, "loaded");
    }
});