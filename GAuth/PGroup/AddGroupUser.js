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

  // get GroupDoc
  let {groupDB, userDB} = projDoc;

  res = await db.getDocQ(groupDB, groupID);
  if(!res.Success){return Response.SendErrorX(db.ErrorX(res.payload));}
  let groupDoc = res.payload;

  //check if exists
  let existUser = groupDoc.users.find(o => o.username === username);
  if(existUser){
    let msg = "User [" + username + "] in Group [" + groupID + "] exists.";
    console.log(Chalk.CLog("[x]", msg, [_param.subcat, _param.action]));
    return Response.SendError(9001, msg);
  }

  groupDoc.users.push({
    username: username,
    role: role,
    level: level
  });
  groupDoc.userCtrl[username] = true;

  // update GroupDoc 
  res = await db.Update(groupDB, groupDoc);
  if(!res.Success){return Response.SendErrorX(db.ErrorX(res.payload));}

  // get UserDoc
  
  res = await db.getDocQ(userDB, username);
  if(!res.Success){return Response.SendErrorX(db.ErrorX(res.payload));}
  let userDoc = res.payload;

  userDoc.Groups.push({
    ID: selectedGroupDoc._id,
    override: {}
  });

  // update UserDoc
  res = await db.Update(userDB, userDoc);
  if(!res.Success){return Response.SendErrorX(db.ErrorX(res.payload));}

  LAuth.Write(LAuth.__CODE.UserGroupCreated, 
    {user: username, group: groupID},
    reason, _username);

  return Response.Send(true, "Add Group User Successfully.", "");

};