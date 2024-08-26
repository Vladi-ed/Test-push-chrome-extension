export class ExtensionStorage {
    static async getLastHost() {
        const {hostOptions} = await chrome.storage.local.get('hostOptions');
        if (!hostOptions) return;
        return Object.keys(hostOptions).pop();
    }

    static async getHostOptions(host: string): Promise<HostOptions> {
        const result = await chrome.storage.local.get('hostOptions');
        const hostOptions = result.hostOptions || {};
        console.log('hostOptions for ' + host, hostOptions[host]);
        return hostOptions[host];
    }

    static async setHostOptions(host: string, updatedFields: Partial<HostOptions>): Promise<void> {
        const result = await chrome.storage.local.get('hostOptions');
        const hostOptions = result.hostOptions || {};

        hostOptions[host] = {
            ...hostOptions[host],
            ...updatedFields
        };

        await chrome.storage.local.set({ hostOptions });
    }
}

interface HostOptions {
    user: string;
    passw: string;
    active: boolean;
    lastHeartbeat: number;
}
