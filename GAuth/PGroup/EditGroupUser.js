const _base = require("../../../IZOGears/_CoreWheels");
const _remote = require("../../../remoteConfig");
const _DBMAP = require("../../../__SYSDefault/_DBMAP");
const LAuth = require("../../COGS/Log/LAuth");

const {Chalk, Response} = _base.Utils;

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
  let {username, role, level} = data;
  let groupID = selectedGroupDoc._id;

  let configDB = _DBMAP.Config;

  let res = await db.getDocQ(configDB, "PROJECT");
  if(!res.Success){return Response.SendErrorX(db.ErrorX(res.payload));}
  let projDoc = res.payload;

  let {groupDB} = projDoc;

  // get GroupDoc
  res = await db.getDocQ(groupDB, groupID);
  if(!res.Success){return Response.SendErrorX(db.ErrorX(res.payload));}
  let groupDoc = res.payload;

  //check if not exists
  let existUser = groupDoc.users.find(o => o.username === username);
  if(!existUser){
    let msg = "User [" + username + "] in Group [" + groupID + "] does not exist.";
    console.log(Chalk.CLog("[x]", msg, [_param.subcat, _param.action]));
    return Response.SendError(9001, msg);
  }

  existUser.role = role;
  existUser.level = level;

  // update GroupDoc 
  res = await db.Update(groupDB, groupDoc);
  if(!res.Success){return Response.SendErrorX(db.ErrorX(res.payload));}

  LAuth.Write(LAuth.__CODE.GroupUserEdit, 
    {group: groupID, user: username},
    reason, _username);

  return Response.Send(true, "Edit Group User Successfully.", "");

};