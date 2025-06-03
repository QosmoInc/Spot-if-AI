import { createFakeProbabilityDiv, removeFakeProbabilityDivs } from "./components";
import { classifyTrack, processInternalTrackLink } from "./track_handler";

const TRACK_PATTERN = /^https:\/\/open\.spotify\.com\/(?:[^\/]+\/)?track\/[^\/]+/;
const OTHER_PATTERN = /^https:\/\/open\.spotify\.com\/(?:[^\/]+\/)?(?:artist|album|playlist)\/[^\/]+/;

let is_show = true;
let trackDiv: HTMLDivElement | null = null;
let observer: MutationObserver | null = null;


const handleTrackPage = async (url: string) => {
    const probability = await classifyTrack(url)

    if (probability === null) {
        return;
    }

    const addProbabilityDiv = (container: Element) => {
        if (!is_show) {
            return;
        }
        trackDiv = createFakeProbabilityDiv(probability, "track");
        container.appendChild(trackDiv);
    };

    const initialContainer = document.querySelector('.main-view-container');
    if (initialContainer) {
        addProbabilityDiv(initialContainer);
    } else {
        observer = new MutationObserver((mutationsList, obs) => {
            for (const mutation of mutationsList) {
                if (mutation.type !== 'childList') {
                    continue;
                }
                const mainViewContainer = document.querySelector('.main-view-container');
                if (mainViewContainer) {
                    addProbabilityDiv(mainViewContainer);
                    obs.disconnect();
                    return;
                }
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }
}

const handleOtherPage = async () => {
    const initialTrackLinks = document.querySelectorAll('[data-testid="internal-track-link"]');

    const processInternalTrackLinkWithSkip = (link: Element) => {
        processInternalTrackLink(link, () => !is_show);
    };

    initialTrackLinks.forEach(processInternalTrackLinkWithSkip);

    observer = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
            if (mutation.type !== 'childList') {
                continue;
            }
            mutation.addedNodes.forEach(node => {
                if (node instanceof Element && node.matches('[data-testid="internal-track-link"]')) {
                    processInternalTrackLinkWithSkip(node);
                }
                else if (node instanceof Element) {
                    const trackLinks = node.querySelectorAll('[data-testid="internal-track-link"]');
                    trackLinks.forEach(processInternalTrackLinkWithSkip);
                }
            });
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
}

export const handleLoad = async () => {
    is_show = true;

    const url = window.location.href;

    if (observer) {
        observer.disconnect();
    }

    if (trackDiv) {
        trackDiv.remove();
        trackDiv = null;
    }

    if (TRACK_PATTERN.test(url)) {
        handleTrackPage(url);
    } else if (OTHER_PATTERN.test(url)) {
        handleOtherPage();
    }
};

export const cleanup = () => {
    if (observer) {
        observer.disconnect();
        observer = null;
    }
    removeFakeProbabilityDivs();
    is_show = false;
}   
