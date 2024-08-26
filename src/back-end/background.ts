import {openUrl} from "./open-url";
import {EventNotificationManager} from "./event-notification-manager";
import {ExtensionStorage} from "./../helpers/extension-storage";

let enable = false;
let heartbeatInterval: number | undefined;
let notifManager: EventNotificationManager | undefined;

chrome.runtime.onInstalled.addListener(({ reason }) => {
    // if (reason === chrome.runtime.OnInstalledReason.INSTALL)
    console.log('onInstalled', reason);

    ExtensionStorage.getLastHost().then(host => {
        if (host) ExtensionStorage.setHostOptions(host, { active: false });
    });

    /*
    "install" Specifies the event reason as an installation.
    "update" Specifies the event reason as an extension update.
    "chrome_update" Specifies the event reason as a Chrome update.
    "shared_module_update" Specifies the event reason as an update to a shared module.
     */
});


// on startup when the browser starts up
chrome.runtime.onStartup.addListener(function () {
    console.log('onStartup');
    // enableDisablePolling();
});

// Fired when an action icon is clicked. This event will not fire if the action has a popup.
chrome.action.onClicked.addListener(async function () {

    await chrome.permissions.request({
        permissions: ['cookies'],
        origins: ['https://qa-mv-1778/', 'http://qa-mv-00986/']
    });

    enableDisablePolling();
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log(sender.tab ?
        "from a content script:" + sender.tab.url :
        "Notification Manager received " + request.action + " message from the extension");

    if (request.action === 'start') {
        // ping(request.mvHost, request.mvToken).then(sendResponse);

        if (!notifManager) notifManager = new EventNotificationManager({mvHost: request.mvHost, mvToken: request.mvToken});
        notifManager.start();

        chrome.action.setIcon({
            path: {
                19: 'images/enabled-19.png',
                38: 'images/enabled-38.png'
            }
        });
        // injectScript();
    }
    if (request.action === 'stop') {
        notifManager!.stop();
        // TODO: do we need to kill notifManager or just run it again wth different token?
        notifManager = undefined;

        chrome.action.setIcon({
            path: {
                19: 'images/disabled-19.png',
                38: 'images/disabled-38.png'
            }
        });
    }

    // @ts-ignore
    sendResponse({ notifManager });
    return true;
});

function enableDisablePolling() {
    enable = !enable;
    chrome.action.setIcon({
        path: {
            19: 'images/' + (enable ? 'enabled' : 'disabled') + '-19.png',
            38: 'images/' + (enable ? 'enabled' : 'disabled') + '-38.png'
        }
    });
    chrome.action.setTitle({ title: enable ? 'Disable' : 'Enable' });
    chrome.action.setBadgeText({text: enable ? '100' : ''});

    if (enable) startHeartbeatInterval().then(() => console.log('startHeartbeat()'));
    else stopHeartbeatInterval().then(() => console.log('stopHeartbeat()'));
}

/**
 * Tracks when a service worker was last alive and extends the service worker
 * lifetime by writing the current time to extension storage every 20 seconds.
 * You should still prepare for unexpected termination - for example, if the
 * extension process crashes or your extension is manually stopped at
 * chrome://serviceworker-internals.
 */
async function runHeartbeat() {

    const option = Math.floor((Math.random() * 4) + 1);
    const pageUrl = chrome.runtime.getURL('index.html');

    const sessionCookie = await chrome.cookies?.get({ name: 'JSESSIONID', url: 'https://qa-mv-1778/asset-manager-web' });
    console.log('MV JSESSIONID cookie', sessionCookie);

    // const sessionCookies = await chrome.cookies.getAll({ name: 'JSESSIONID', domain: 'qa-mv-1778' });
    // console.log('cookies', sessionCookies);

    console.log('Notification option', option, new Date().getSeconds() + 's');

    if (option) {
        const mvTab = await chrome.tabs.query({ url: 'https://qa-mv-1778/*' });
        console.log('try to focus MV tab');

        if (mvTab[0]?.id) {
            await chrome.windows.update(mvTab[0].windowId, {focused: true});
            await chrome.tabs.update(mvTab[0].id, {active: true, highlighted: true});
        }
        else await openUrl(pageUrl);
    }

    // if (option == 1) {
    //     const fact = await getCatFact();
    //     await showNotification(fact); // Display notification
    // } else if (option == 2) {
    //     await openUrl(pageUrl);
    // } else if (option == 3) {
    //     await chrome.windows.create({
    //         url: pageUrl, focused: true, type: 'popup', height: 700, width: 700
    //     })
    // }
    // else {
    //     const mvTab = await chrome.tabs.query({title: 'MobileView'});
    //     console.log('try to focus MV tab');
    //
    //     if (mvTab[0]?.id) await chrome.tabs.update(mvTab[0].id, {active: true, highlighted: true});
    //     else console.log('no MV tab detected');
    // }

    await chrome.storage.local.set({ 'last-heartbeat': new Date().getTime() });
}

/**
 * Starts the heartbeat interval which keeps the service worker alive. Call
 * this sparingly when you are doing work which requires persistence, and call
 * stopHeartbeat once that work is complete.
 */
async function startHeartbeatInterval() {
    runHeartbeat().then(() => {
        heartbeatInterval = setInterval(runHeartbeat, 20 * 1000);  // Then again every 20 seconds.
    });
}

async function stopHeartbeatInterval() {
    clearInterval(heartbeatInterval);
}

chrome.notifications.onClicked.addListener(() => {
    // if push window clicked
    activateMV('http://192.168.60.113/asset-manager-web');
});

chrome.notifications.onButtonClicked.addListener(async (_, buttonIndex) => {
    // more info about Notification actions: https://stackoverflow.com/questions/20188792/is-there-any-way-to-insert-action-buttons-in-notification-in-google-chrome#answer-20190702
    // if first push button clicked
    if (buttonIndex == 0) {
        // openUrl(chrome.runtime.getURL('index.html'));
        // openUrl('http://192.168.60.113/asset-manager-web/am/pages/alerts/alertsMng.jsf');
        activateMV('http://192.168.60.113/asset-manager-web');
    }
})

async function activateMV(url: string) {
    console.log('try to focus MV tab');

    const host = new URL(url).origin;
    const mvTab = await chrome.tabs.query({url: host + '/*'});

    if (mvTab[0]?.id) {
        await chrome.windows.update(mvTab[0].windowId, {focused: true});
        await chrome.tabs.update(mvTab[0].id, {active: true, highlighted: true});
    } else await openUrl(url);
}


