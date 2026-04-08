import Text "mo:base/Text";
import OrderedMap "mo:base/OrderedMap";
import Principal "mo:base/Principal";
import Int "mo:base/Int";

module {
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

  type OldUserProfile = {
    name : Text;
  };

  type NewUserProfile = {
    name : Text;
    notificationPreferences : ?NotificationPreferences;
  };

  type Camper = {
    name : Text;
    plannedArrival : ?Int;
    plannedDeparture : ?Int;
    status : {
      #planning;
      #onTheWay;
      #atTheLake;
    };
    siteNumber : ?Text;
    numberOfCampers : Nat;
  };

  type Message = {
    sender : Text;
    content : Text;
    timestamp : Int;
  };

  type CampfireEvent = {
    organizer : Text;
    date : Int;
    time : Text;
    campsiteNumber : Text;
    owner : Principal;
  };

  type LakeLocationEvent = {
    id : Text;
    organizer : Text;
    time : Text;
    location : {
      #marina;
      #bigIslandBeach;
      #bigIslandCove;
      #sandBar;
      #karenCove;
      #sandyBeach;
      #skylineBar;
    };
    owner : Principal;
  };

  type OldActor = {
    campers : OrderedMap.Map<Text, Camper>;
    messages : OrderedMap.Map<Int, Message>;
    events : OrderedMap.Map<Int, CampfireEvent>;
    lakeLocationEvents : OrderedMap.Map<Text, LakeLocationEvent>;
    userProfiles : OrderedMap.Map<Principal, OldUserProfile>;
  };

  type NewActor = {
    campers : OrderedMap.Map<Text, Camper>;
    messages : OrderedMap.Map<Int, Message>;
    events : OrderedMap.Map<Int, CampfireEvent>;
    lakeLocationEvents : OrderedMap.Map<Text, LakeLocationEvent>;
    userProfiles : OrderedMap.Map<Principal, NewUserProfile>;
  };

  public func run(old : OldActor) : NewActor {
    let principalMap = OrderedMap.Make<Principal>(Principal.compare);

    let systemDefaultTriggers : NotificationTriggers = {
      lakeArrivalAlert = true;
      campfireInvitation = true;
      messageReceived = true;
      eventReminder = true;
      lakeLocationUpdate = true;
      departureWarning = true;
    };

    let systemDefaultAppearance : ToastAppearance = {
      position = "top-right";
      style = "default";
      animation = "fade";
    };

    var newUserProfiles = principalMap.empty<NewUserProfile>();
    for ((principal, profile) in principalMap.entries(old.userProfiles)) {
      newUserProfiles := principalMap.put(
        newUserProfiles,
        principal,
        {
          name = profile.name;
          notificationPreferences = ?{
            triggers = systemDefaultTriggers;
            appearance = systemDefaultAppearance;
          };
        },
      );
    };

    {
      campers = old.campers;
      messages = old.messages;
      events = old.events;
      lakeLocationEvents = old.lakeLocationEvents;
      userProfiles = newUserProfiles;
    };
  };
};
