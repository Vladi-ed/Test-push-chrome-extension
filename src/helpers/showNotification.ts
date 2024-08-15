// Handle notifications
function showNotificationImage(body: string) {
    const options: chrome.notifications.NotificationOptions = {
        title: 'Cat Fact',
        message: body,
        type: 'image',
        iconUrl: 'https://cataas.com/cat?type=square',
        imageUrl: 'https://cataas.com/cat?width=668&height=304',
        buttons: [{title: 'Click'}, {title: 'Dismiss'}],
        priority: 0,
        requireInteraction: false,
    };

    return chrome.notifications.create(options);
}

export function showNotification(title: string, message: string, iconUrl = 'https://cataas.com/cat?type=square') {
    const options: chrome.notifications.NotificationOptions = {
        title,
        message,
        type: 'list',
        items: [{ title: "Item1", message: "This is item 1."},
            { title: "Item2", message: "This is item 2."},
            { title: "Item3", message: "This is item 3."}],

        // /asset-manager-web/images/event_medium.gif
        iconUrl,
        buttons: [{title: 'Check'}, {title: 'Dismiss'}],
        priority: 0,
        requireInteraction: true,
    };

    return chrome.notifications.create(options);
}
