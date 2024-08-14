import {getEventList} from "../inf-api/get-event-list.ts";
import {EventHeader} from "../inf-api/data-types.ts";
import {loginUser} from "../inf-api/login-user.ts";
import { showNotification } from "./showNotification.ts";

class EventNotificationManager {
    private mvHost: string;
    private mvToken: string;
    private checkInterval = 2000; // Default to 2 seconds
    private intervalId: any = null;
    private lastEvents: EventHeader[] = [];
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
                await showNotification('Max retries reached. Unable to check for new events.'); // Display notification
            }
        }
    }

    private async relogin(): Promise<void> {
        const user = localStorage.getItem('username');
        const passw = localStorage.getItem('password');

        if (!user || !passw) {
            throw new Error('Login credentials not found in localStorage');
        }

        const loginResponse = await loginUser(this.mvHost, user, passw);
        this.mvToken = loginResponse.token;
    }

    private updateEvents(newEvents: EventHeader[]): void {
        const newEventIds = new Set(newEvents.map(event => event.id));
        const oldEventIds = new Set(this.lastEvents.map(event => event.id));

        // Find brand new events (events in newEvents but not in lastEvents)
        const brandNewEvents = newEvents.filter(event => !oldEventIds.has(event.id));

        // Find removed events (events in lastEvents but not in newEvents)
        const removedEvents = this.lastEvents.filter(event => !newEventIds.has(event.id));

        if (brandNewEvents.length > 0) {
            console.log('New events detected:', brandNewEvents);
            this.showNotification(brandNewEvents);
        }

        if (removedEvents.length > 0) {
            console.log('Events removed:', removedEvents);
            // You might want to handle removed events differently, e.g., update UI
        }

        // Update the lastEvents array with the new events
        this.lastEvents = newEvents;

        // Log a summary of changes
        console.log(`Events updated. Added: ${brandNewEvents.length}, Removed: ${removedEvents.length}, Total: ${newEvents.length}`);
    }

    private showNotification(events: EventHeader[]): void {
        // Implement your popup logic here
        console.log('Showing notification for events:', events);
        showNotification(events[0].name); // Display notification
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