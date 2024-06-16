import {openUrl} from "./helpers/openUrl.ts";
import {getCatFact} from "./helpers/getCatFact.ts";
import {showNotification} from "./helpers/showNotification.ts";


let enable = false;

// on startup when the browser starts up
chrome.runtime.onStartup.addListener(function () {
    console.log('onStartup');
});

// Fired when an action icon is clicked. This event will not fire if the action has a popup.
chrome.action.onClicked.addListener(function () {
    enable = !enable;
    chrome.action.setIcon({
        path: {
            19: 'images/' + (enable ? 'day' : 'night') + '-19.png',
            38: 'images/' + (enable ? 'day' : 'night') + '-38.png'
        }
    });
    chrome.action.setTitle({ title: enable ? 'Disable' : 'Enable' });

    if (enable) startHeartbeatInterval().then(() => console.log('startHeartbeat()'));
    else stopHeartbeatInterval().then(() => console.log('stopHeartbeat()'));

});


/**
 * Tracks when a service worker was last alive and extends the service worker
 * lifetime by writing the current time to extension storage every 20 seconds.
 * You should still prepare for unexpected termination - for example, if the
 * extension process crashes or your extension is manually stopped at
 * chrome://serviceworker-internals.
 */
let heartbeatInterval: number | undefined;

async function runHeartbeat() {
    const fact = await getCatFact();
    await showNotification(fact); // Display notification

    // await openUrl(chrome.runtime.getURL('index.html'));

    await chrome.storage.local.set({ 'last-heartbeat': new Date().getTime() });
}

/**
 * Starts the heartbeat interval which keeps the service worker alive. Call
 * this sparingly when you are doing work which requires persistence, and call
 * stopHeartbeat once that work is complete.
 */
async function startHeartbeatInterval() {
    // Run the heartbeat once at service worker startup.
    runHeartbeat().then(() => {
        // Then again every 20 seconds.
        heartbeatInterval = setInterval(runHeartbeat, 20 * 1000);
    });
}

async function stopHeartbeatInterval() {
    clearInterval(heartbeatInterval);
}


chrome.notifications.onClicked.addListener(() => {
    openUrl('https://cataas.com/cat?type=square');
});

chrome.notifications.onButtonClicked.addListener((_, buttonIndex) => {
    // if first button clicked
    if (buttonIndex == 0) {
        openUrl(chrome.runtime.getURL('index.html'));
    }
})


