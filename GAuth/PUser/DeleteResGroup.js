const _base = require("../../../IZOGears/_CoreWheels");
const _remote = require("../../../remoteConfig");
const _DBMAP = require("../../../__SYSDefault/_DBMAP");

const {Response} = _base.Utils;
const DEVUSER = require("../../../__SYSDefault/DevUser");
const LAuth = require("../../COGS/Log/LAuth");

/**
 * 
 * @param {*} _opt 
 * @param {{
 *  cat: String,
 *  subcat: String,
 *  action: String
 * }} _param
 * @returns 
 */
module.exports = async (_opt, _param, _username) => {
  
  let db = await _remote.BaseDB();

  //get Project
  let {addOns, data} = _opt;
  let {ID} = data;
  let {selectedUserDoc, reason} = addOns;

  let configDB = _DBMAP.Config;

  let res = await db.getDocQ(configDB, "PROJECT");
  if(!res.Success){return Response.SendErrorX(db.ErrorX(res.payload));}

  let projDoc = res.payload;
  let {userDB, groupDB} = projDoc;
  let userID = selectedUserDoc._id;

  if(userID === DEVUSER._id && ID === "DevResGroup"){
    let msg = "Cannot Delete User [" + userID + "] in Group [DevResGroup].";
    return Response.SendError(9403, msg);
  }

  // get GroupDoc
  res = await db.getDocQ(groupDB, ID);
  if(!res.Success){return Response.SendErrorX(db.ErrorX(res.payload));}
  let groupDoc = res.payload;

  groupDoc.users = groupDoc.users.filter(o => o.username !== userID);
  delete groupDoc.userCtrl[userID];

  // update GroupDoc 
  res = await db.Update(groupDB, groupDoc);
  if(!res.Success){return Response.SendErrorX(db.ErrorX(res.payload));}
  
  // get UserDoc
  res = await db.getDocQ(userDB, userID);
  if(!res.Success){return Response.SendErrorX(db.ErrorX(res.payload));}
  let userDoc = res.payload;

  userDoc.Groups = userDoc.Groups.filter(o => o.ID !== ID);

  // update UserDoc
  res = await db.Update(userDB, userDoc);
  if(!res.Success){return Response.SendErrorX(db.ErrorX(res.payload));}

  _remote.ClearCache();

  LAuth.Write(LAuth.__CODE.UserGroupDeleted,
    {user: userID, group: ID},
    reason, _username);

  return Response.Send(true, "Delete Group User Successfully.", "");
};