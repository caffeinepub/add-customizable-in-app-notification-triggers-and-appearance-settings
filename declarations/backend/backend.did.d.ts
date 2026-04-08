import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export type ArrivalStatus = { 'onTheWay' : null } |
  { 'atTheLake' : null } |
  { 'planning' : null };
export interface Camper {
  'status' : ArrivalStatus,
  'siteNumber' : [] | [string],
  'plannedArrival' : [] | [bigint],
  'name' : string,
  'plannedDeparture' : [] | [bigint],
  'numberOfCampers' : bigint,
}
export interface CampfireEvent {
  'organizer' : string,
  'campsiteNumber' : string,
  'owner' : Principal,
  'date' : bigint,
  'time' : string,
}
export interface FileReference { 'hash' : string, 'path' : string }
export type LakeLocation = { 'sandBar' : null } |
  { 'karenCove' : null } |
  { 'bigIslandBeach' : null } |
  { 'skylineBar' : null } |
  { 'marina' : null } |
  { 'bigIslandCove' : null } |
  { 'sandyBeach' : null };
export interface LakeLocationEvent {
  'organizer' : string,
  'owner' : Principal,
  'time' : string,
  'location' : LakeLocation,
}
export interface Message {
  'content' : string,
  'sender' : string,
  'timestamp' : Time,
}
export type Time = bigint;
export interface UserProfile { 'name' : string }
export type UserRole = { 'admin' : null } |
  { 'user' : null } |
  { 'guest' : null };
export interface _SERVICE {
  'addOrUpdateCamper' : ActorMethod<
    [string, [] | [bigint], [] | [bigint], [] | [string], bigint],
    undefined
  >,
  'assignCallerUserRole' : ActorMethod<[Principal, UserRole], undefined>,
  'clearCamper' : ActorMethod<[string], undefined>,
  'createCampfireEvent' : ActorMethod<
    [string, bigint, string, string],
    undefined
  >,
  'createLakeLocationEvent' : ActorMethod<
    [string, string, LakeLocation],
    undefined
  >,
  'deleteCampfireEvent' : ActorMethod<[bigint], undefined>,
  'deleteLakeLocationEvent' : ActorMethod<[bigint], undefined>,
  'dropFileReference' : ActorMethod<[string], undefined>,
  'getCallerUserProfile' : ActorMethod<[], [] | [UserProfile]>,
  'getCallerUserRole' : ActorMethod<[], UserRole>,
  'getCampers' : ActorMethod<[], Array<Camper>>,
  'getCampfireEvents' : ActorMethod<[], Array<CampfireEvent>>,
  'getFileReference' : ActorMethod<[string], FileReference>,
  'getLakeLocationEvents' : ActorMethod<[], Array<LakeLocationEvent>>,
  'getMessages' : ActorMethod<[], Array<Message>>,
  'getUserProfile' : ActorMethod<[Principal], [] | [UserProfile]>,
  'initializeAccessControl' : ActorMethod<[], undefined>,
  'isCallerAdmin' : ActorMethod<[], boolean>,
  'listFileReferences' : ActorMethod<[], Array<FileReference>>,
  'registerFileReference' : ActorMethod<[string, string], undefined>,
  'saveCallerUserProfile' : ActorMethod<[UserProfile], undefined>,
  'sendMessage' : ActorMethod<[string, string], undefined>,
  'updateCampfireEvent' : ActorMethod<
    [string, bigint, string, string],
    undefined
  >,
  'updateLakeLocationEvent' : ActorMethod<
    [string, string, LakeLocation],
    undefined
  >,
  'updateNumberOfCampers' : ActorMethod<[string, bigint], undefined>,
  'updatePlannedDeparture' : ActorMethod<[string, [] | [bigint]], undefined>,
  'updateSiteNumber' : ActorMethod<[string, [] | [string]], undefined>,
  'updateStatus' : ActorMethod<[string, ArrivalStatus], undefined>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
