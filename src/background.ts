import {openUrl} from "./helpers/openUrl.ts";
import {loginUser} from "./inf-api/login-user.ts";
import {getEventList} from "./inf-api/get-event-list.ts";
// import {getCatFact} from "./helpers/getCatFact.ts";
// import {showNotification} from "./helpers/showNotification.ts";

let enable = false;
let heartbeatInterval: number | undefined;

chrome.runtime.onInstalled.addListener(({ reason }) => {
    // if (reason === chrome.runtime.OnInstalledReason.INSTALL)
        console.log('onInstalled', reason);

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
    enableDisablePolling();
});

// Fired when an action icon is clicked. This event will not fire if the action has a popup.
chrome.action.onClicked.addListener(async function () {

    await chrome.permissions.request({
        permissions: ['cookies'],
        // origins: ['http://qa-mv-00986/'],
        origins: ['https://qa-mv-1778/']
    });

    await connect();
    enableDisablePolling();
});


function enableDisablePolling() {
    enable = !enable;
    chrome.action.setIcon({
        path: {
            19: 'images/' + (enable ? 'day' : 'night') + '-19.png',
            38: 'images/' + (enable ? 'day' : 'night') + '-38.png'
        }
    });
    chrome.action.setTitle({ title: enable ? 'Disable' : 'Enable' });
    chrome.action.setBadgeText({text: enable ? '100' : ''});

    if (enable) startHeartbeatInterval().then(() => console.log('startHeartbeat()'));
    else stopHeartbeatInterval().then(() => console.log('stopHeartbeat()'));
}


async function connect() {
    const loginResp = await loginUser();
    const token = loginResp.token;
    console.log('Login Response:', token);

    const eventListResp = await getEventList(token);

    console.log('Event List:', eventListResp);
}



/**
 * Tracks when a service worker was last alive and extends the service worker
 * lifetime by writing the current time to extension storage every 20 seconds.
 * You should still prepare for unexpected termination - for example, if the
 * extension process crashes or your extension is manually stopped at
 * chrome://serviceworker-internals.
 */
// @ts-ignore
async function runHeartbeat() {

    const option = Math.floor((Math.random() * 4) + 1);
    const pageUrl = chrome.runtime.getURL('index.html');

    const sessionCookie = await chrome
        .cookies?.get({ name: 'JSESSIONID', url: 'https://qa-mv-1778/asset-manager-web' });
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
    openUrl('https://cataas.com/cat?type=square');
});

chrome.notifications.onButtonClicked.addListener((_, buttonIndex) => {
    // if first button clicked
    if (buttonIndex == 0) {
        openUrl(chrome.runtime.getURL('index.html'));
    }
})


