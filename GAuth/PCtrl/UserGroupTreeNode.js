const _base = require("../../_CoreWheels");
const _remote = require("../../../remoteConfig");
const _DBMAP = require("../../../__SYSDefault/_DBMAP");
const LAuth = require("../../COGS/Log/LAuth");
const DEVUSER = require("../../../__SYSDefault/DevUser");

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
  
  let {cat, subcat, action} = _param;
  let db = await _remote.BaseDB();

  let {user, accessor, group, value, reason} = _opt.data;

  //protection
  if(user === DEVUSER._id){
    let msg = "Cannot disable user [" + DEVUSER._id +"] at this level.";
    console.log(Chalk.CLog("[x]", msg, [cat, subcat, action]));
    return Response.SendError(9001, msg);
  }

  //get Proj
  let configDB = _DBMAP.Config;

  let res = await db.getDocQ(configDB, "PROJECT");
  if(!res.Success){
    let msg = res.payload.Message;
    console.log(Chalk.CLog("[x]", msg, [cat, subcat, action]));
    return Response.SendErrorX(db.ErrorX(res.payload));
  }
  let projDoc = res.payload;
  let {userDB} = projDoc;

  //get User Doc
  res = await db.getDocQ(userDB, user);
  if(!res.Success){
    let msg = res.payload.Message;
    console.log(Chalk.CLog("[x]", msg, [cat, subcat, action]));
    return Response.SendErrorX(db.ErrorX(res.payload));
  }
  let userDoc = res.payload;

  let usergroup = userDoc.Groups.find(o => o.ID === group);
  usergroup.override = usergroup.override || {};
  usergroup.override[accessor] = value;

  res = await db.Update(userDB, userDoc);

  _remote.ClearCache();

  LAuth.Write(value? LAuth.__CODE.UserGroupAuthTreeEnable : LAuth.__CODE.UserGroupAuthTreeDisable, 
    {group:group, user: user, accessor: accessor},
    reason, _username);

  if(!res.Success){
    let msg = res.payload.Message;
    console.log(Chalk.CLog("[!]", msg, [cat, subcat, action]));
  }

  return Response.Send(true, res.payload, "");

};