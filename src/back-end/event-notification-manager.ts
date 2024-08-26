import {getEventList} from "../inf-api/get-event-list";
import {EventHeader} from "../inf-api/data-types";
import {loginUser} from "../inf-api/login-user";
import {showNotification, showNotificationList} from "./show-notification";
import {ExtensionStorage} from "./../helpers/extension-storage";

export class EventNotificationManager {
    private readonly mvHost: string;
    private mvToken: string;
    private checkInterval = 2000; // Default to 2 seconds
    private intervalId: any = null;
    private lastEvents: Map<EventHeader['id'], EventHeader> = new Map();
    private readonly maxRetries: number = 2;
    private currentRetries = 0;

    constructor(config: {
        mvHost: string;
        mvToken: string;
        checkInterval?: number;
    }) {
        this.mvHost = config.mvHost;
        this.mvToken = config.mvToken;
        if (config.checkInterval) this.checkInterval = config.checkInterval;
    }

    public start(): void {
        if (this.intervalId === null) {
            this.intervalId = setInterval(() => this.checkForNewEvents(), this.checkInterval);
            console.log('Event notification manager started');
        }
        else console.log('Event notification manager already started');
        chrome.action.setTitle({ title: 'INF service started' });
    }

    public stop(): void {
        if (this.intervalId !== null) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            console.log('Event notification manager stopped');
        }
        chrome.action.setTitle({ title: 'INF service stopped' });
        chrome.action.setBadgeText({text: ''});
    }

    private async checkForNewEvents(): Promise<void> {
        await ExtensionStorage.setHostOptions(this.mvHost, { lastHeartbeat: new Date().getTime() });

        try {
            const apiResponse = await getEventList(this.mvHost, this.mvToken);

            if (apiResponse.resultType === 'Error' && apiResponse.message === 'no such user') {
                await this.reLogin();
            }

            if (apiResponse.events) {
                this.updateEvents(apiResponse.events);
            }

            // TODO: check on Chromebook
            if (chrome.audio) {
                const devices = await chrome.audio.getDevices({isActive: true, streamTypes: ['OUTPUT']});
                console.log('devices[0].level', devices[0].deviceName,  devices[0].level);

                if (await chrome.audio.getMute('OUTPUT')) await showNotification('Error', 'Sound is on Mute', 'images/no_sound.png');
            }

        } catch (error) {
            console.error('Error checking for new events:', error);
            this.currentRetries++;

            if (this.currentRetries < this.maxRetries) {
                console.log(`Retrying... Attempt ${this.currentRetries} of ${this.maxRetries}`);
                await showNotification('Error', 'Unable to check for new events. ' + (error as Error).message, 'images/error.png');
                // await new Promise(resolve => setTimeout(resolve, 5000)); // Wait before retrying
            } else {
                console.error('Max retries reached. Unable to check for new events.');
                await showNotification('Error', 'Max retries reached. Unable to check for new events.', 'images/error.png'); // Display notification
                this.stop();
                await ExtensionStorage.setHostOptions(this.mvHost, { active: false });
            }
        }
    }

    async login(user: string, passw: string) {
        const loginResponse = await loginUser(this.mvHost, user, passw);
        this.mvToken = loginResponse.token;
    }

    private async reLogin() {
        const { user, passw } = await ExtensionStorage.getHostOptions(this.mvHost);

        if (!user || !passw) {
            throw new Error('Login credentials not found');
        }

        await this.login(user, atob(passw));
    }

    private updateEvents(newEvents: EventHeader[]): void {
        if (newEvents.length === 0) return;

        // Find brand-new events (events in newEvents but not in lastEvents) and have status NEW
        const brandNewEvents = newEvents.filter(event =>
            !this.lastEvents.has(event.id) &&
            event.status === 'NEW'
        );

        // Find updated events where the lastReminderDateInMs has changed
        const updatedEvents = newEvents.filter(event => {
            const lastEvent = this.lastEvents.get(event.id);
            return lastEvent && lastEvent.lastReminderDateInMs !== event.lastReminderDateInMs;
        });

        // Combine brand new events and updated events
        const eventsToAdd = [...brandNewEvents, ...updatedEvents];

        if (eventsToAdd.length > 0) {
            console.log('New or updated events detected:', eventsToAdd);
            this.showNotification(eventsToAdd);

            // Fill and Update lastEvents map with new or updated events
            eventsToAdd.forEach(event => this.lastEvents.set(event.id, event));
        }

        // Initialize a set of new event IDs for easy comparison
        const newEventIds = new Set(newEvents.map(event => event.id));

        // Handle removed events: Remove if the event is in lastEvents and status is not NEW
        const removedEventIds = Array.from(this.lastEvents.keys()).filter(id => {
            const lastEvent = this.lastEvents.get(id);
            return lastEvent && newEventIds.has(id) && lastEvent.status !== 'NEW';
        });

        if (removedEventIds.length > 0) {
            console.log('Events to be removed:', removedEventIds);
            // Remove these events from lastEvents
            removedEventIds.forEach(id => this.lastEvents.delete(id));
            // You might want to handle removed events differently, e.g., update UI
        }

        if (this.lastEvents.size) {
            const text = String(this.lastEvents.size);
            chrome.action.setBadgeText({text});
            chrome.action.setTitle({ title: 'You have ' + text + ' new notification(s)' });
        }
    }


    private showNotification(events: EventHeader[]): void {
        // showNotification(
        //     'New alerts (' + events.length + ')',
        //     events[0].name,
        //     this.mvHost + '/asset-manager-web/images/event_' + events[0].priority.toLowerCase() + '.gif'
        // );

        showNotificationList(
            'New alerts (' + events.length + ')',
            events.map(event => ({title: event.name, message: String(event.priority)}))
        );
    }
}

// Usage example:
// const notificationManager = new EventNotificationManager({
//     mvHost: 'https://api.example.com',
//     mvToken: 'your-auth-token-here',
//     checkInterval: 5000 // Check every 5 seconds
// });
//
// notificationManager.start();

// To stop checking:
// notificationManager.stop();
