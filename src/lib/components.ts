import { getUniqueStr } from "./utils";

const fakeProbabilityClass = "fake-probability";

export const createFakeProbabilityDiv = (probability: number, kind: "track" | "playlist"): HTMLDivElement => {
    const uniqueStr = getUniqueStr();

    const div = document.createElement('div');
    div.id = `fake-probability-${uniqueStr}`;
    div.className = fakeProbabilityClass;

    if (kind === "track") {
        div.style.position = 'absolute';
        div.style.top = '16px';
        div.style.right = '24px';
        div.style.marginRight = '0px';
    } else {
        div.style.marginLeft = 'auto';
        div.style.whiteSpace = 'nowrap';
    }

    div.appendChild(createIcon("🧑‍🎤", `human-${uniqueStr}`));
    div.appendChild(createFakeBar(probability, `fake-bar-${uniqueStr}`, `fake-fill-${uniqueStr}`));
    div.appendChild(createIcon("🤖", `ai-${uniqueStr}`));

    return div;
}

const createIcon = (icon: string, id: string): HTMLDivElement => {
    const div = document.createElement('div');
    div.id = id;
    div.textContent = icon;
    div.style.display = 'inline';
    return div;
}

const createFakeBar = (probability: number, fakeBarId: string, fakeFillId: string): HTMLDivElement => {
    const fakeBar = document.createElement('div');
    fakeBar.id = fakeBarId;
    fakeBar.style.position = 'relative';
    fakeBar.style.width = '50px';
    fakeBar.style.height = '8px';
    fakeBar.style.borderRadius = '9999px';
    fakeBar.style.backgroundColor = '#22c55e';
    fakeBar.style.overflow = 'hidden';
    fakeBar.style.display = 'inline-block';
    fakeBar.style.marginLeft = '5px';
    fakeBar.style.marginRight = '5px';

    const fakeFill = document.createElement('div');
    fakeFill.id = fakeFillId;
    fakeFill.style.position = 'absolute';
    fakeFill.style.height = '100%';
    fakeFill.style.right = '0';
    fakeFill.style.backgroundColor = '#c53232';
    fakeFill.style.transition = 'width 0.5s ease-out';
    fakeFill.style.width = '50%';
    setTimeout(() => {
        fakeFill.style.width = `${probability * 100}%`;
    }, 10);

    fakeBar.appendChild(fakeFill);

    return fakeBar;
}

export const removeFakeProbabilityDivs = () => {
    const divs = document.querySelectorAll(`.${fakeProbabilityClass}`);
    divs.forEach(div => div.remove());
}