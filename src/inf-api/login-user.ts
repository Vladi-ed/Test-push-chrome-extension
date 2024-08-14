import {LoginRequest, LoginResponse} from "./data-types.ts";

export async function loginUser(host: string, userName: string, password: string): Promise<LoginResponse> {
    const url = host + '/alerting-server-web/clientManager.json';
    const requestBody: LoginRequest = {
        msgId: 'LoginRequest',
        userName,
        password
    };

    const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const loginResp = await response.json();

    if (loginResp.resultType === 'Error') {
        throw new Error(loginResp.message);
    }

    return loginResp;
}

