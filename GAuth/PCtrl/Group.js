const _base = require("../../../IZOGears/_CoreWheels");
const _remote = require("../../../remoteConfig");
const _DBMAP = require("../../../__SYSDefault/_DBMAP");
const _ = require("lodash");
const LAuth = require("../../COGS/Log/LAuth");
const DEVGroup = require("../../InitDocs/ResGroup/J0000");

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
  let {cat, subcat, action} = _param;

  let {group, value, reason} = _opt.data;

  //protection
  if(group === DEVGroup._id){
    let msg = "Cannot disable [" + DEVGroup._id + "] at this level.";
    console.log(Chalk.CLog("[x]", msg, [cat, subcat, action]));
    return Response.SendError(9001, msg);
  }

  let configDB = _DBMAP.Config;

  let res = await db.getDocQ(configDB, "PROJECT");
  if(!res.Success){
    let msg = res.payload.Message;
    console.log(Chalk.CLog("[x]", msg, [cat, subcat, action]));
    return Response.SendErrorX(db.ErrorX(res.payload));
  }

  let projDoc = res.payload;
  if(!projDoc.SYSAuthCtrl || !projDoc.SYSAuthCtrl.Groups || _.isUndefined(projDoc.SYSAuthCtrl.Groups[group])){
    let msg = "No Group [" + group + "] is found.";
    console.log(Chalk.CLog("[x]", msg, [cat, subcat, action]));
    return Response.SendError(4004, msg);
  }
  projDoc.SYSAuthCtrl.Groups[group] = value;

  res = await db.Update(configDB, projDoc);

  _remote.ClearCache();

  LAuth.Write(value? LAuth.__CODE.GroupEnable : LAuth.__CODE.GroupDisable,
    {group: group}, 
    reason, _username);

  if(!res.Success){
    let msg = res.payload.Message;
    console.log(Chalk.CLog("[!]", msg, [cat, subcat, action]));
  }

  return Response.Send(true, res.payload, "");

};