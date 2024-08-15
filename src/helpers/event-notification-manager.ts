import {getEventList} from "../inf-api/get-event-list.ts";
import {EventHeader} from "../inf-api/data-types.ts";
import {loginUser} from "../inf-api/login-user.ts";
import { showNotification } from "./showNotification.ts";

export class EventNotificationManager {
    private mvHost: string;
    private mvToken: string;
    private checkInterval = 2000; // Default to 2 seconds
    private intervalId: any = null;
    private lastEvents: Map<EventHeader['id'], EventHeader> = new Map();
    private maxRetries: number = 3;

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
    }

    public stop(): void {
        if (this.intervalId !== null) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            console.log('Event notification manager stopped');
        }
    }

    private async checkForNewEvents(retryCount: number = 0): Promise<void> {
        try {
            const apiResponse = await getEventList(this.mvHost, this.mvToken);

            if (apiResponse.resultType === 'Error' && apiResponse.message === 'no such user') {
                await this.relogin();
                return this.checkForNewEvents();
            }

            if (apiResponse.events) {
                this.updateEvents(apiResponse.events);
            }
        } catch (error) {
            console.error('Error checking for new events:', error);
            if (retryCount < this.maxRetries) {
                console.log(`Retrying... Attempt ${retryCount + 1} of ${this.maxRetries}`);
                await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retrying
                return this.checkForNewEvents(retryCount + 1);
            } else {
                console.error('Max retries reached. Unable to check for new events.');
                await showNotification('Error', 'Max retries reached. Unable to check for new events.'); // Display notification
            }
        }
    }

    private async relogin(): Promise<void> {
        const { user, passw } = await chrome.storage.local.get(['user', 'passw', 'host']);

        if (!user || !passw) {
            throw new Error('Login credentials not found in localStorage');
        }

        const loginResponse = await loginUser(this.mvHost, user, passw);
        this.mvToken = loginResponse.token;
    }

    private updateEvents(newEvents: EventHeader[]): void {
        if (newEvents.length === 0) return;

        // Initialize a set of new event IDs for easy comparison
        const newEventIds = new Set(newEvents.map(event => event.id));

        // Find brand new events (events in newEvents but not in lastEvents) and have status NEW
        const brandNewEvents = newEvents.filter(event =>
            !this.lastEvents.has(event.id) &&
            event.status === "NEW"
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

        // Handle removed events: Remove if the event is in lastEvents and status is not NEW
        const removedEventIds = Array.from(this.lastEvents.keys()).filter(id => {
            const lastEvent = this.lastEvents.get(id);
            return lastEvent && newEventIds.has(id) && lastEvent.status !== 'NEW';
        });

        if (removedEventIds.length > 0) {
            console.log('Events to be removed:', removedEventIds);
            // Remove these events from lastEvents
            // removedEventIds.forEach(id => this.lastEvents.delete(id));
            // You might want to handle removed events differently, e.g., update UI
        }
    }


    private showNotification(events: EventHeader[]): void {
        // Implement your popup logic here
        console.log('Showing notification for events:', events);
        showNotification('New alerts', events.length + ') ' + events[0].name, this.mvHost + '/asset-manager-web/images/event_medium.gif'); // Display notification
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
