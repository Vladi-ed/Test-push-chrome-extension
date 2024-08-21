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
    private maxRetries: number = 2;
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
    }

    public stop(): void {
        if (this.intervalId !== null) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            console.log('Event notification manager stopped');
        }
    }

    private async checkForNewEvents(): Promise<void> {
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
                await chrome.storage.local.set({active: false});
            }
        }
    }

    private async reLogin(): Promise<void> {
        const { user, passw } = await chrome.storage.local.get(['user', 'passw']);

        if (!user || !passw) {
            throw new Error('Login credentials not found');
        }

        const loginResponse = await loginUser(this.mvHost, user, atob(passw));
        this.mvToken = loginResponse.token;
    }

    private updateEvents(newEvents: EventHeader[]): void {
        if (newEvents.length === 0) return;

        // Find brand new events (events in newEvents but not in lastEvents) and have status NEW
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
            // removedEventIds.forEach(id => this.lastEvents.delete(id));
            // You might want to handle removed events differently, e.g., update UI
        }
    }


    private showNotification(events: EventHeader[]): void {
        // Implement your popup logic here
        console.log('Showing push notification for events:', events);
        // TODO: add a notification list
        showNotification('New alerts (' + events.length + ')', events[0].name, this.mvHost + '/asset-manager-web/images/event_medium.gif'); // Display notification
    }

    private injectScript() {
        function injectedFunction() {
            document.body.style.backgroundColor = "orange";
        }

        chrome.action.onClicked.addListener((tab) => {
            chrome.scripting.executeScript({
                target : {tabId : tab.id!},
                func : injectedFunction,
            });
        });

        // When injecting as a function, you can also pass arguments to the function.
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
