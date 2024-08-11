import {GeneralRequest, LoginResponse} from "./data-types.ts";

export async function logoutUser(host: string): Promise<LoginResponse> {
    const url = host + '/alerting-server-web/clientManager.json';
    const requestBody: GeneralRequest = {
        msgId: 'LogoutRequest',
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

