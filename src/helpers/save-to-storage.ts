export async function saveToStorage(host: string, data: any) {
    const hostOptions = await chrome.storage.local.get(['hostOptions']) || {};
    console.log('hostOptions', hostOptions);
    hostOptions[host] = {data};
    await chrome.storage.local.set(hostOptions);
}