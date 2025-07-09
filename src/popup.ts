const element = document.getElementById('is-enable') as HTMLInputElement;
const mainDiv = document.querySelector('.main-div') as HTMLElement;

chrome.storage.local.get(['isEnable'], (result) => {
    mainDiv.classList.add('no-transition');
    element.checked = result.isEnable ?? true;

    requestAnimationFrame(() => {
        mainDiv.classList.remove('no-transition');
    });
});

element.addEventListener('change', () => {
    chrome.storage.local.set({ isEnable: element.checked }, () => { });
});