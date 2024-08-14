export interface LoginRequest extends GeneralRequest {
    ip?: string;
    userName: string;
    password: string;
}

export interface GeneralRequest {
    token?: string;
    msgId: string;
    clientId?: string;
}

interface User {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
    jobTitle: string | null;
    dateFormat: string;
    language: string;
    timeZone: string;
    timeZoneOffsetMillis: string;
    temperatureUnit: string;
    permissions: string;
}

interface CorrectiveAction {
    correctiveActionTypeId: number;
    date: number;
    name: string;
    description: string;
}

enum EventPriority {
    INFO = "INFO",
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH",
    CRITICAL = "CRITICAL"
}

enum EventStatus {
    NEW = "NEW",
    VIEWED = "VIEWED",
    CLOSED = "CLOSED"
}

export interface EventHeader {
    id: number;
    name: string;
    type: string;
    priority: EventPriority;
    status: EventStatus;
    dateInMs: number;
    modifiedDateInMs: number;
    dismissedUser: string;
    correctiveAction: CorrectiveAction;
    correctiveActionMandatoryForDismiss: boolean;
    isUpdate: boolean;
    specSoundFileName: string;
    playSound: boolean;
    specId: number;
    lastReminderDateInMs: number | null;
    assetApplicationId: string | null;
    assetName: string;
    assetId: number;
    isDisplayAssetImage: boolean;
    title: string | null;
    formattedLocation: string;
    shortLocation: string;
    areaName: string;
    areaId: number;
    zoneName: string | null;
    zoneId: string | null;
    mapId: number;
    locationAvailable: boolean;
    categoryId: number;
    categoryName: string | null;
}

interface GeneralResponse {
    responseId: string;
    resultType: 'Error' | 'Ok' | 'Unknown';
    message: string | null;
}

export interface LoginResponse extends GeneralResponse {
    user: User;
    token: string;
}

export interface EventListResponse extends GeneralResponse {
    sequenceNumber: number;
    numOfWaitingEvents: number;
    events: EventHeader[];
}
