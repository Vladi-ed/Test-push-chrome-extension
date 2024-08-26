export async function injectScript() {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // require webNavigation permission
    // const frames = await chrome.webNavigation.getAllFrames({'tabId': tab.id!});
    // console.log('frames', frames);

    // When injecting as a function, you can also pass arguments to the function.
    await chrome.scripting.executeScript({
        target : {tabId : tab.id!},
        func : () => {
            document.body.style.backgroundColor = 'orange';
            console.log(document.location.href);
        }
    });
}