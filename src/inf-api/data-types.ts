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
    jobTitle: string;
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

interface EventHeader {
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
    assetApplicationId: string;
    assetName: string;
    assetId: number;
    isDisplayAssetImage: boolean;
    title: string;
    formattedLocation: string;
    shortLocation: string;
    areaName: string;
    areaId: number;
    zoneName: string;
    zoneId: string;
    mapId: number;
    locationAvailable: boolean;
    categoryId: number;
    categoryName: string;
}

export interface LoginResponse {
    responseId: string;
    resultType: string;
    message: string | null;
    user: User;
    token: string;
    eventHeaders?: EventHeader[];
}

export interface EventListResponse {
    responseId: string;
    resultType: string | 'Error';
    message: string | null;
    sequenceNumber: number;
    numOfWaitingEvents: number;
    events: EventHeader[];
}
