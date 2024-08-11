import {EventListResponse, GeneralRequest} from "./data-types.ts";

export async function getEventList(host: string, token: string): Promise<EventListResponse> {
    const url = host + '/alerting-server-web/clientManager.json';
    const requestBody: GeneralRequest = {
        token,
        msgId: 'GetEventListRequest',
        // clientId: '1' // uuid of a client
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
