export async function openUrl(url: string) {
    try {
        const current = await chrome.windows.getCurrent(); // may be a popup window
        if (current.id) {
            await chrome.windows.update(current.id, {focused: true, state: 'maximized'});
            await chrome.tabs.create({url, active: true});
        }
    } catch (e) {
        console.log('No current windows', e);
        await chrome.windows.create({
            url, focused: true, type: 'popup', height: 700, width: 700
        });
    }
}
