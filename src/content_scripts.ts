import handleLoad from "./lib/client";

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message === "loaded") {
        handleLoad();
        sendResponse();
    }
});
