// Handle notifications
export function showNotification(body: string) {
    const options: chrome.notifications.NotificationOptions = {
        title: "Cat Fact",
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
