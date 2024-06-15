let enable = false;

// on startup
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

    if (enable) startHeartbeat().then(() => console.log('startHeartbeat()'));
    else stopHeartbeat().then(() => console.log('stopHeartbeat()'));

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
    getCatFact();
    await chrome.storage.local.set({ 'last-heartbeat': new Date().getTime() });
}

/**
 * Starts the heartbeat interval which keeps the service worker alive. Call
 * this sparingly when you are doing work which requires persistence, and call
 * stopHeartbeat once that work is complete.
 */
async function startHeartbeat() {
    // Run the heartbeat once at service worker startup.
    runHeartbeat().then(() => {
        // Then again every 20 seconds.
        heartbeatInterval = setInterval(runHeartbeat, 20 * 1000);
    });
}

async function stopHeartbeat() {
    clearInterval(heartbeatInterval);
}

/**
 * Returns the last heartbeat stored in extension storage, or undefined if
 * the heartbeat has never run before.
 */
async function getLastHeartbeat() {
    return (await chrome.storage.local.get('last-heartbeat'))['last-heartbeat'];
}


async function getCatFact() {
    console.log('getCatFact()')
    try {
        const response = await fetch('https://catfact.ninja/fact');
        const data = await response.json();
        showNotification(data.fact); // Display notification
    } catch (error) {
        console.error('Error fetching cat fact data:', error);
    }
}

// Handle notifications
function showNotification(body: string) {
    const options: chrome.notifications.NotificationOptions = {
        title: "Cat Fact",
        message: body,
        type: 'image',
        iconUrl: 'https://cataas.com/cat?type=square',
        imageUrl: 'https://cataas.com/cat?width=668&height=304',
        buttons: [{title: 'Click'}, {title: 'Dismiss'}],
        priority: 0,
        requireInteraction: false,
    };

    chrome.notifications.create(options);
}


chrome.notifications.onClicked.addListener(async () => {
    const current = await chrome.windows.getCurrent();

    if (current.id) chrome.tabs.create({url: 'https://google.com'});
    else chrome.windows.create({url: 'https://google.com'})
});

chrome.notifications.onButtonClicked.addListener((_, buttonIndex) => {
    // if first button clicked
    if (buttonIndex == 0) {
        chrome.tabs.create({url: 'https://google.com'});
    }
})
