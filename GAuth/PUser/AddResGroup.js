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

  let rtn = {};
  let db = await _remote.BaseDB();

  //get Project
  let {addOns, data} = _opt;
  let {ID, Role, Level} = data;
  let {selectedUserDoc, reason} = addOns;

  let configDB = _DBMAP.Config;

  let res = await db.getDocQ(configDB, "PROJECT");
  if(!res.Success){return Response.SendErrorX(db.ErrorX(res.payload));}

  let projDoc = res.payload;
  let {userDB, groupDB} = projDoc;
  let userID = selectedUserDoc._id;

  // get GroupDoc
  res = await db.getDocQ(groupDB, ID);
  if(!res.Success){return Response.SendErrorX(db.ErrorX(res.payload));}
  let groupDoc = res.payload;

  //check if exists
  let existUser = groupDoc.users.find(o => o.username === userID);
  if(existUser){
    let msg = "User [" + userID + "] in Group [" + groupDoc._id + "] exists.";
    console.log(Chalk.CLog("[x]", msg, [_param.subcat, _param.action]));
    return Response.SendError(9001, msg);
  }

  groupDoc.users.push({
    username: userID,
    role: Role,
    level: Level
  });
  groupDoc.userCtrl[userID] = true;
  
  // update GroupDoc 
  res = await db.Update(groupDB, groupDoc);
  if(!res.Success){return Response.SendErrorX(db.ErrorX(res.payload));}

  // get UserDoc
  res = await db.getDocQ(userDB, userID);
  if(!res.Success){return Response.SendErrorX(db.ErrorX(res.payload));}
  let userDoc = res.payload;

  userDoc.Groups.push({
    ID: ID,
    override: {}
  });

  // update UserDoc
  res = await db.Update(userDB, userDoc);
  if(!res.Success){return Response.SendErrorX(db.ErrorX(res.payload));}

  LAuth.Write(LAuth.__CODE.UserGroupCreated, 
    {user: userID, group: groupDoc._id},
    reason, _username);

  console.log(Chalk.CLog("[-]", "<MESSAGE>", [_param.cat, _param.subcat]));

  if(!res.Success){
    let msg = res.payload.Message;
    console.log(Chalk.CLog("[!]", msg, [_param.cat, _param.subcat]));
  }

  return Response.Send(true, rtn, "");

  

};