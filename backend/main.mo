import Time "mo:base/Time";
import BlobStorage "blob-storage/Mixin";
import Text "mo:base/Text";
import OrderedMap "mo:base/OrderedMap";
import Int "mo:base/Int";
import Debug "mo:base/Debug";
import Iter "mo:base/Iter";
import Registry "blob-storage/registry";
import List "mo:base/List";
import AccessControl "authorization/access-control";
import Principal "mo:base/Principal";
import Migration "migration";

(with migration = Migration.run)
actor {
  type ArrivalStatus = {
    #planning;
    #onTheWay;
    #atTheLake;
  };

  type Camper = {
    name : Text;
    plannedArrival : ?Int;
    plannedDeparture : ?Int;
    status : ArrivalStatus;
    siteNumber : ?Text;
    numberOfCampers : Nat;
  };

  type Message = {
    sender : Text;
    content : Text;
    timestamp : Time.Time;
  };

  type CampfireEvent = {
    organizer : Text;
    date : Int;
    time : Text;
    campsiteNumber : Text;
    owner : Principal;
  };

  type LakeLocation = {
    #marina;
    #bigIslandBeach;
    #bigIslandCove;
    #sandBar;
    #karenCove;
    #sandyBeach;
    #skylineBar;
  };

  type LakeLocationEvent = {
    id : Text;
    organizer : Text;
    time : Text;
    location : LakeLocation;
    owner : Principal;
  };

  type ToastAppearance = {
    position : Text;
    style : Text;
    animation : Text;
  };

  type NotificationTriggers = {
    lakeArrivalAlert : Bool;
    campfireInvitation : Bool;
    messageReceived : Bool;
    eventReminder : Bool;
    lakeLocationUpdate : Bool;
    departureWarning : Bool;
  };

  type NotificationPreferences = {
    triggers : NotificationTriggers;
    appearance : ToastAppearance;
  };

  type UserProfile = {
    name : Text;
    notificationPreferences : ?NotificationPreferences;
  };

  transient let camperMap = OrderedMap.Make<Text>(Text.compare);
  transient let messageMap = OrderedMap.Make<Int>(Int.compare);
  transient let eventMap = OrderedMap.Make<Int>(Int.compare);
  transient let locationEventMap = OrderedMap.Make<Text>(Text.compare);
  transient let principalMap = OrderedMap.Make<Principal>(Principal.compare);

  var campers : OrderedMap.Map<Text, Camper> = camperMap.empty();
  var messages : OrderedMap.Map<Int, Message> = messageMap.empty();
  var events : OrderedMap.Map<Int, CampfireEvent> = eventMap.empty();
  var lakeLocationEvents : OrderedMap.Map<Text, LakeLocationEvent> = locationEventMap.empty();
  var userProfiles : OrderedMap.Map<Principal, UserProfile> = principalMap.empty();

  let registry = Registry.new();
  let accessControlState = AccessControl.initState();

  public shared ({ caller }) func initializeAccessControl() : async () {
    AccessControl.initialize(accessControlState, caller);
  };

  public query ({ caller }) func getCallerUserRole() : async AccessControl.UserRole {
    AccessControl.getUserRole(accessControlState, caller);
  };

  public shared ({ caller }) func assignCallerUserRole(user : Principal, role : AccessControl.UserRole) : async () {
    AccessControl.assignRole(accessControlState, caller, user, role);
  };

  public query ({ caller }) func isCallerAdmin() : async Bool {
    AccessControl.isAdmin(accessControlState, caller);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can access profiles");
    };
    principalMap.get(userProfiles, caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Debug.trap("Unauthorized: Can only view your own profile");
    };
    principalMap.get(userProfiles, user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles := principalMap.put(userProfiles, caller, profile);
  };

  // Notification Preferences APIs

  public query ({ caller }) func getCallerNotificationPreferences() : async ?NotificationPreferences {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can access notification preferences");
    };
    switch (principalMap.get(userProfiles, caller)) {
      case (null) { Debug.trap("User profile not found") };
      case (?profile) { profile.notificationPreferences };
    };
  };

  public shared ({ caller }) func updateCallerNotificationPreferences(preferences : NotificationPreferences) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can update notification preferences");
    };
    switch (principalMap.get(userProfiles, caller)) {
      case (null) { Debug.trap("User profile not found") };
      case (?profile) {
        let updatedProfile = { profile with notificationPreferences = ?preferences };
        userProfiles := principalMap.put(userProfiles, caller, updatedProfile);
      };
    };
  };

  // Notification Preferences APIs (admin-only)

  public query ({ caller }) func getUserNotificationPreferences(user : Principal) : async ?NotificationPreferences {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Unauthorized: Only admins can fetch other users' preferences");
    };

    switch (principalMap.get(userProfiles, user)) {
      case (null) { Debug.trap("User profile not found") };
      case (?profile) { profile.notificationPreferences };
    };
  };

  public shared ({ caller }) func addOrUpdateCamper(name : Text, plannedArrival : ?Int, plannedDeparture : ?Int, siteNumber : ?Text, numberOfCampers : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can manage campers");
    };
    let camper = {
      name;
      plannedArrival;
      plannedDeparture;
      status = #planning;
      siteNumber;
      numberOfCampers;
    };
    campers := camperMap.put(campers, name, camper);
  };

  public shared ({ caller }) func updateStatus(name : Text, status : ArrivalStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can update status");
    };
    switch (camperMap.get(campers, name)) {
      case (null) { Debug.trap("Camper not found") };
      case (?camper) {
        campers := camperMap.put(campers, name, { camper with status });
      };
    };
  };

  public shared ({ caller }) func updatePlannedDeparture(name : Text, plannedDeparture : ?Int) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can update planned departure");
    };
    switch (camperMap.get(campers, name)) {
      case (null) { Debug.trap("Camper not found") };
      case (?camper) {
        campers := camperMap.put(campers, name, { camper with plannedDeparture });
      };
    };
  };

  public shared ({ caller }) func updateSiteNumber(name : Text, siteNumber : ?Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can update site number");
    };
    switch (camperMap.get(campers, name)) {
      case (null) { Debug.trap("Camper not found") };
      case (?camper) {
        campers := camperMap.put(campers, name, { camper with siteNumber });
      };
    };
  };

  public shared ({ caller }) func updateNumberOfCampers(name : Text, numberOfCampers : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can update number of campers");
    };
    switch (camperMap.get(campers, name)) {
      case (null) { Debug.trap("Camper not found") };
      case (?camper) {
        campers := camperMap.put(campers, name, { camper with numberOfCampers });
      };
    };
  };

  public query func getCampers() : async [Camper] {
    let currentTime = Time.now();
    var validCampers = List.nil<Camper>();

    for (camper in camperMap.vals(campers)) {
      switch (camper.plannedArrival, camper.plannedDeparture) {
        case (?_, ?_) {
          switch (camper.plannedDeparture) {
            case (null) {
              validCampers := List.push(camper, validCampers);
            };
            case (?departureTime) {
              if (departureTime + 86_400_000_000_000 > currentTime) {
                validCampers := List.push(camper, validCampers);
              };
            };
          };
        };
        case (_, _) {};
      };
    };

    List.toArray(validCampers);
  };

  public shared ({ caller }) func clearCamper(name : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can clear campers");
    };
    switch (camperMap.get(campers, name)) {
      case (null) { Debug.trap("Camper not found") };
      case (?_) {
        campers := camperMap.delete(campers, name);
      };
    };
  };

  public shared ({ caller }) func sendMessage(sender : Text, content : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can send messages");
    };
    let timestamp = Time.now();
    let message = {
      sender;
      content;
      timestamp;
    };
    messages := messageMap.put(messages, Int.abs(timestamp), message);
  };

  public query func getMessages() : async [Message] {
    let currentTime = Time.now();
    let sevenDaysInNanos = 7 * 24 * 60 * 60 * 1_000_000_000;

    var recentMessages = List.nil<Message>();

    for (message in messageMap.vals(messages)) {
      if (currentTime - message.timestamp <= sevenDaysInNanos) {
        recentMessages := List.push(message, recentMessages);
      };
    };

    List.toArray(recentMessages);
  };

  public shared ({ caller }) func createCampfireEvent(organizer : Text, date : Int, time : Text, campsiteNumber : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can create events");
    };
    let event = {
      organizer;
      date;
      time;
      campsiteNumber;
      owner = caller;
    };
    events := eventMap.put(events, Int.abs(date), event);
  };

  public shared ({ caller }) func updateCampfireEvent(organizer : Text, date : Int, time : Text, campsiteNumber : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can update events");
    };
    switch (eventMap.get(events, Int.abs(date))) {
      case (null) {};
      case (?existingEvent) {
        if (existingEvent.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Debug.trap("Unauthorized: Can only update your own events");
        };
      };
    };
    let event = {
      organizer;
      date;
      time;
      campsiteNumber;
      owner = caller;
    };
    events := eventMap.put(events, Int.abs(date), event);
  };

  public shared ({ caller }) func deleteCampfireEvent(eventId : Int) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can delete events");
    };
    switch (eventMap.get(events, eventId)) {
      case (null) { Debug.trap("Event not found") };
      case (?event) {
        if (event.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Debug.trap("Unauthorized: Can only delete your own events");
        };
        events := eventMap.delete(events, eventId);
      };
    };
  };

  public query func getCampfireEvents() : async [CampfireEvent] {
    Iter.toArray(eventMap.vals(events));
  };

  public shared ({ caller }) func createLakeLocationEvent(organizer : Text, time : Text, location : LakeLocation) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can create lake location events");
    };
    let eventId = organizer # time # debug_show (location);
    let event = {
      id = eventId;
      organizer;
      time;
      location;
      owner = caller;
    };
    lakeLocationEvents := locationEventMap.put(lakeLocationEvents, eventId, event);
  };

  public shared ({ caller }) func updateLakeLocationEvent(organizer : Text, time : Text, location : LakeLocation) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can update lake location events");
    };
    let eventId = organizer # time # debug_show (location);
    switch (locationEventMap.get(lakeLocationEvents, eventId)) {
      case (null) {};
      case (?existingEvent) {
        if (existingEvent.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Debug.trap("Unauthorized: Can only update your own events");
        };
      };
    };
    let event = {
      id = eventId;
      organizer;
      time;
      location;
      owner = caller;
    };
    lakeLocationEvents := locationEventMap.put(lakeLocationEvents, eventId, event);
  };

  public shared ({ caller }) func deleteLakeLocationEvent(eventId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can delete lake location events");
    };
    switch (locationEventMap.get(lakeLocationEvents, eventId)) {
      case (null) { Debug.trap("Lake location event not found") };
      case (?event) {
        if (event.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Debug.trap("Unauthorized: Can only delete your own events");
        };
        lakeLocationEvents := locationEventMap.delete(lakeLocationEvents, eventId);
      };
    };
  };

  public query func getLakeLocationEvents() : async [LakeLocationEvent] {
    Iter.toArray(locationEventMap.vals(lakeLocationEvents));
  };

  public shared ({ caller }) func registerFileReference(path : Text, hash : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can register file references");
    };
    Registry.add(registry, path, hash);
  };

  public query func getFileReference(path : Text) : async Registry.FileReference {
    Registry.get(registry, path);
  };

  public query func listFileReferences() : async [Registry.FileReference] {
    Registry.list(registry);
  };

  public shared ({ caller }) func dropFileReference(path : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Unauthorized: Only admins can drop file references");
    };
    Registry.remove(registry, path);
  };

  include BlobStorage(registry);
};
