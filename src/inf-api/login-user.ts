import {LoginRequest, LoginResponse} from "./data-types.ts";

export async function loginUser(): Promise<LoginResponse> {
    const url = 'http://qa-mv-00986/alerting-server-web/clientManager.json';
    const requestBody: LoginRequest = {
        msgId: 'LoginRequest',
        userName: 'vladi',
        password: '123'
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

