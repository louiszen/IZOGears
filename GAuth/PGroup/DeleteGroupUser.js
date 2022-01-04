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
  let {reason, selectedGroupDoc} = addOns;
  let {username} = data;
  let groupID = selectedGroupDoc._id;

  if(username === DEVUSER._id){
    let msg = "Cannot Delete User [" + username + "].";
    return Response.SendError(9403, msg);
  }

  let configDB = _DBMAP.Config;

  let res = await db.getDocQ(configDB, "PROJECT");
  if(!res.Success){return Response.SendErrorX(db.ErrorX(res.payload));}
  let projDoc = res.payload;

  let {groupDB, userDB} = projDoc;

  // get GroupDoc
  res = await db.getDocQ(groupDB, groupID);
  if(!res.Success){return Response.SendErrorX(db.ErrorX(res.payload));}
  let groupDoc = res.payload;

  groupDoc.users = groupDoc.users.filter(o => o.username !== username);
  delete groupDoc.userCtrl[username];

  // update GroupDoc 
  res = await db.Update(groupDB, groupDoc);
  if(!res.Success){return Response.SendErrorX(db.ErrorX(res.payload));}
  
  // get UserDoc
  res = await db.getDocQ(userDB, username);
  if(!res.Success){return Response.SendErrorX(db.ErrorX(res.payload));}
  let userDoc = res.payload;

  userDoc.Groups = userDoc.Groups.filter(o => o.ID !== groupID);

  // update UserDoc
  res = await db.Update(userDB, userDoc);
  if(!res.Success){return Response.SendErrorX(db.ErrorX(res.payload));}

  LAuth.Write(LAuth.__CODE.UserGroupDeleted,
    {user: username, group: groupID},
    reason, _username);

  return Response.Send(true, "Delete Group User Successfully.", "");
};