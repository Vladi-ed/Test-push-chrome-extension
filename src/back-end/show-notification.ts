export function showNotification(title: string, message: string, iconUrl: string) {
    const options: chrome.notifications.NotificationOptions = {
        title,
        message,
        iconUrl,
        type: 'basic',
        buttons: [{title: 'Check'}, {title: 'Dismiss'}],
        priority: 0,
        requireInteraction: false,
    };
    return chrome.notifications.create(options);
}

export function showNotificationList(title: string, items: Array<{ title: string, message: string }>) {
    const options: chrome.notifications.NotificationOptions = {
        title,
        message: items[0].message,
        type: 'list',
        items,
        iconUrl: 'images/notifications.png', // /asset-manager-web/images/event_medium.gif
        buttons: [{title: 'Check'}, {title: 'Dismiss'}],
        priority: 0,
        requireInteraction: true,
    };

    return chrome.notifications.create(options);
}

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
