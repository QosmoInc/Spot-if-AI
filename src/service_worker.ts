import infer from "./lib/infer_engine";

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (!message.waveform) {
        console.error("No audio data received.");
        return;
    }

    const audioData = new Float32Array(JSON.parse(message.waveform));

    infer(audioData).then(probability => {
        sendResponse(probability);
    }).catch(error => {
        console.error("Error during inference:", error);
        sendResponse(null);
    });

    return true;
});

chrome.tabs.onUpdated.addListener((tabId, info, tab) => {
    if (info.status === 'complete' && tab.url && tab.url.indexOf('https://open.spotify.com/') !== -1) {
        chrome.tabs.sendMessage(tabId, "loaded", () => { });
    }
});
