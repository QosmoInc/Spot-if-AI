import { handleLoad, cleanup } from "./lib/client";

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message === "loaded") {
        chrome.storage.local.get(['isEnable'], (result) => {
            const isEnabled = result.isEnable ?? true;
            if (isEnabled) {
                handleLoad();
            }
            sendResponse();
        });
        return true;
    }
    return false;
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

chrome.storage.local.get(['isEnable'], (result) => {
    const isEnabled = result.isEnable ?? true;
    if (isEnabled) {
        handleLoad();
    } else {
        cleanup();
    }
});

chrome.runtime.sendMessage({ type: "contentScriptReady" });