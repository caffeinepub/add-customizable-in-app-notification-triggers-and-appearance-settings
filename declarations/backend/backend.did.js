export const idlFactory = ({ IDL }) => {
  const UserRole = IDL.Variant({
    'admin' : IDL.Null,
    'user' : IDL.Null,
    'guest' : IDL.Null,
  });
  const LakeLocation = IDL.Variant({
    'sandBar' : IDL.Null,
    'karenCove' : IDL.Null,
    'bigIslandBeach' : IDL.Null,
    'skylineBar' : IDL.Null,
    'marina' : IDL.Null,
    'bigIslandCove' : IDL.Null,
    'sandyBeach' : IDL.Null,
  });
  const UserProfile = IDL.Record({ 'name' : IDL.Text });
  const ArrivalStatus = IDL.Variant({
    'onTheWay' : IDL.Null,
    'atTheLake' : IDL.Null,
    'planning' : IDL.Null,
  });
  const Camper = IDL.Record({
    'status' : ArrivalStatus,
    'siteNumber' : IDL.Opt(IDL.Text),
    'plannedArrival' : IDL.Opt(IDL.Int),
    'name' : IDL.Text,
    'plannedDeparture' : IDL.Opt(IDL.Int),
    'numberOfCampers' : IDL.Nat,
  });
  const CampfireEvent = IDL.Record({
    'organizer' : IDL.Text,
    'campsiteNumber' : IDL.Text,
    'owner' : IDL.Principal,
    'date' : IDL.Int,
    'time' : IDL.Text,
  });
  const FileReference = IDL.Record({ 'hash' : IDL.Text, 'path' : IDL.Text });
  const LakeLocationEvent = IDL.Record({
    'organizer' : IDL.Text,
    'owner' : IDL.Principal,
    'time' : IDL.Text,
    'location' : LakeLocation,
  });
  const Time = IDL.Int;
  const Message = IDL.Record({
    'content' : IDL.Text,
    'sender' : IDL.Text,
    'timestamp' : Time,
  });
  return IDL.Service({
    'addOrUpdateCamper' : IDL.Func(
        [
          IDL.Text,
          IDL.Opt(IDL.Int),
          IDL.Opt(IDL.Int),
          IDL.Opt(IDL.Text),
          IDL.Nat,
        ],
        [],
        [],
      ),
    'assignCallerUserRole' : IDL.Func([IDL.Principal, UserRole], [], []),
    'clearCamper' : IDL.Func([IDL.Text], [], []),
    'createCampfireEvent' : IDL.Func(
        [IDL.Text, IDL.Int, IDL.Text, IDL.Text],
        [],
        [],
      ),
    'createLakeLocationEvent' : IDL.Func(
        [IDL.Text, IDL.Text, LakeLocation],
        [],
        [],
      ),
    'deleteCampfireEvent' : IDL.Func([IDL.Int], [], []),
    'deleteLakeLocationEvent' : IDL.Func([IDL.Int], [], []),
    'dropFileReference' : IDL.Func([IDL.Text], [], []),
    'getCallerUserProfile' : IDL.Func([], [IDL.Opt(UserProfile)], ['query']),
    'getCallerUserRole' : IDL.Func([], [UserRole], ['query']),
    'getCampers' : IDL.Func([], [IDL.Vec(Camper)], ['query']),
    'getCampfireEvents' : IDL.Func([], [IDL.Vec(CampfireEvent)], ['query']),
    'getFileReference' : IDL.Func([IDL.Text], [FileReference], ['query']),
    'getLakeLocationEvents' : IDL.Func(
        [],
        [IDL.Vec(LakeLocationEvent)],
        ['query'],
      ),
    'getMessages' : IDL.Func([], [IDL.Vec(Message)], ['query']),
    'getUserProfile' : IDL.Func(
        [IDL.Principal],
        [IDL.Opt(UserProfile)],
        ['query'],
      ),
    'initializeAccessControl' : IDL.Func([], [], []),
    'isCallerAdmin' : IDL.Func([], [IDL.Bool], ['query']),
    'listFileReferences' : IDL.Func([], [IDL.Vec(FileReference)], ['query']),
    'registerFileReference' : IDL.Func([IDL.Text, IDL.Text], [], []),
    'saveCallerUserProfile' : IDL.Func([UserProfile], [], []),
    'sendMessage' : IDL.Func([IDL.Text, IDL.Text], [], []),
    'updateCampfireEvent' : IDL.Func(
        [IDL.Text, IDL.Int, IDL.Text, IDL.Text],
        [],
        [],
      ),
    'updateLakeLocationEvent' : IDL.Func(
        [IDL.Text, IDL.Text, LakeLocation],
        [],
        [],
      ),
    'updateNumberOfCampers' : IDL.Func([IDL.Text, IDL.Nat], [], []),
    'updatePlannedDeparture' : IDL.Func([IDL.Text, IDL.Opt(IDL.Int)], [], []),
    'updateSiteNumber' : IDL.Func([IDL.Text, IDL.Opt(IDL.Text)], [], []),
    'updateStatus' : IDL.Func([IDL.Text, ArrivalStatus], [], []),
  });
};
export const init = ({ IDL }) => { return []; };
