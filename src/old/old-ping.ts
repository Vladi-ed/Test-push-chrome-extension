import {getEventList} from "../inf-api/get-event-list.ts";

export async function ping(mvHost: string, mvToken: string) {
    console.log('ping()', mvHost);
    const eventListResp = await getEventList(mvHost, mvToken);
    console.log('Event List:', eventListResp);
    const enable = true;
    await chrome.action.setBadgeText({text: String(eventListResp.events.length)});
    // await chrome.action.setBadgeText({text: String(eventListResp.sequenceNumber)});
    await chrome.action.setIcon({
        path: {
            19: 'images/' + (enable ? 'enabled' : 'disabled') + '-19.png',
            38: 'images/' + (enable ? 'enabled' : 'disabled') + '-38.png'
        }
    });
    return eventListResp.events;
}