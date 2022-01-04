const _base = require("../../../IZOGears/_CoreWheels");
const _remote = require("../../../remoteConfig");
const _DBMAP = require("../../../__SYSDefault/_DBMAP");
const _ = require("lodash");
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

  let {role, value, reason} = _opt.data;

  //protection
  if(role === "Devs"){
    let msg = "Cannot disable [Devs] at this level.";
    console.log(Chalk.CLog("[x]", msg, [_param.subcat, _param.action]));
    return Response.SendError(9001, msg);
  }

  let configDB = _DBMAP.Config;

  let res = await db.getDocQ(configDB, "PROJECT");
  if(!res.Success){
    let msg = res.payload.Message;
    console.log(Chalk.CLog("[x]", msg, [_param.cat, _param.subcat]));
    return Response.SendErrorX(db.ErrorX(res.payload));
  }

  let projDoc = res.payload;
  if(!projDoc.SYSAuthCtrl || !projDoc.SYSAuthCtrl.Roles || _.isUndefined(projDoc.SYSAuthCtrl.Roles[role])){
    let msg = "No Role [" + role + "] is found.";
    console.log(Chalk.CLog("[x]", msg, [_param.cat, _param.subcat]));
    return Response.SendError(4004, msg);
  }
  projDoc.SYSAuthCtrl.Roles[role] = value;

  res = await db.Update(configDB, projDoc);

  LAuth.Write(value? LAuth.__CODE.RoleEnable : LAuth.__CODE.RoleDisable, 
    {role: role},
    reason, _username);

  if(!res.Success){
    let msg = res.payload.Message;
    console.log(Chalk.CLog("[!]", msg, [_param.cat, _param.subcat]));
  }

  return Response.Send(true, res.payload, "");

};