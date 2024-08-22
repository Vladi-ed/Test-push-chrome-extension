/**
 * Returns the last heartbeat stored in extension storage, or undefined if
 * the heartbeat has never run before.
 */
export async function getLastHeartbeat(): Promise<number | undefined> {
    return (await chrome.storage.local.get('last-heartbeat'))['last-heartbeat'];
}
