import { handleLoad, cleanup } from "./lib/client";

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message === "loaded") {
        chrome.storage.local.get(['isEnable'], (result) => {
            if (!!result.isEnable) {
                handleLoad();
            }
            sendResponse();
        });
    }
});

chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes.isEnable) {
        if (!!changes.isEnable.newValue) {
            handleLoad();
        } else {
            cleanup();
        }
    }
});