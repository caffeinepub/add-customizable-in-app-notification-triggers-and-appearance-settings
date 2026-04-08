import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface NotificationPreferences {
    appearance: ToastAppearance;
    triggers: NotificationTriggers;
}
export type Time = bigint;
export interface LakeLocationEvent {
    id: string;
    organizer: string;
    owner: Principal;
    time: string;
    location: LakeLocation;
}
export interface CampfireEvent {
    organizer: string;
    campsiteNumber: string;
    owner: Principal;
    date: bigint;
    time: string;
}
export interface Camper {
    status: ArrivalStatus;
    siteNumber?: string;
    plannedArrival?: bigint;
    name: string;
    plannedDeparture?: bigint;
    numberOfCampers: bigint;
}
export interface ToastAppearance {
    animation: string;
    style: string;
    position: string;
}
export interface Message {
    content: string;
    sender: string;
    timestamp: Time;
}
export interface FileReference {
    hash: string;
    path: string;
}
export interface NotificationTriggers {
    departureWarning: boolean;
    messageReceived: boolean;
    campfireInvitation: boolean;
    lakeArrivalAlert: boolean;
    lakeLocationUpdate: boolean;
    eventReminder: boolean;
}
export interface UserProfile {
    notificationPreferences?: NotificationPreferences;
    name: string;
}
export enum ArrivalStatus {
    onTheWay = "onTheWay",
    atTheLake = "atTheLake",
    planning = "planning"
}
export enum LakeLocation {
    sandBar = "sandBar",
    karenCove = "karenCove",
    bigIslandBeach = "bigIslandBeach",
    skylineBar = "skylineBar",
    marina = "marina",
    bigIslandCove = "bigIslandCove",
    sandyBeach = "sandyBeach"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addOrUpdateCamper(name: string, plannedArrival: bigint | null, plannedDeparture: bigint | null, siteNumber: string | null, numberOfCampers: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    clearCamper(name: string): Promise<void>;
    createCampfireEvent(organizer: string, date: bigint, time: string, campsiteNumber: string): Promise<void>;
    createLakeLocationEvent(organizer: string, time: string, location: LakeLocation): Promise<void>;
    deleteCampfireEvent(eventId: bigint): Promise<void>;
    deleteLakeLocationEvent(eventId: string): Promise<void>;
    dropFileReference(path: string): Promise<void>;
    getCallerNotificationPreferences(): Promise<NotificationPreferences | null>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCampers(): Promise<Array<Camper>>;
    getCampfireEvents(): Promise<Array<CampfireEvent>>;
    getFileReference(path: string): Promise<FileReference>;
    getLakeLocationEvents(): Promise<Array<LakeLocationEvent>>;
    getMessages(): Promise<Array<Message>>;
    getUserNotificationPreferences(user: Principal): Promise<NotificationPreferences | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    initializeAccessControl(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    listFileReferences(): Promise<Array<FileReference>>;
    registerFileReference(path: string, hash: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    sendMessage(sender: string, content: string): Promise<void>;
    updateCallerNotificationPreferences(preferences: NotificationPreferences): Promise<void>;
    updateCampfireEvent(organizer: string, date: bigint, time: string, campsiteNumber: string): Promise<void>;
    updateLakeLocationEvent(organizer: string, time: string, location: LakeLocation): Promise<void>;
    updateNumberOfCampers(name: string, numberOfCampers: bigint): Promise<void>;
    updatePlannedDeparture(name: string, plannedDeparture: bigint | null): Promise<void>;
    updateSiteNumber(name: string, siteNumber: string | null): Promise<void>;
    updateStatus(name: string, status: ArrivalStatus): Promise<void>;
}
