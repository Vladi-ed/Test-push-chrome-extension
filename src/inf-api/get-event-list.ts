import {EventListResponse, GetEventListRequest} from "./data-types.ts";

export async function getEventList(token: string): Promise<EventListResponse> {
    const url = 'http://qa-mv-00986/alerting-server-web/clientManager.json';
    const requestBody: GetEventListRequest = {
        token,
        msgId: 'GetEventListRequest',
        clientId: '1'
    };

    const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
}
