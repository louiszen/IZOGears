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

  let {api, value, reason} = _opt.data;

  //protection
  //prevent blocking CommonAPI
  if(api.startsWith("CommonAPI")){
    let msg = "CommonAPI is not supposed to be blocked at base level.";
    console.log(Chalk.CLog("[x]", msg, [_param.subcat, _param.action]));
    return Response.SendError(9001, msg);
  }

  //get Proj Doc
  let configDB = _DBMAP.Config;

  let res = await db.getDocQ(configDB, "PROJECT");
  if(!res.Success){
    let msg = res.payload.Message;
    console.log(Chalk.CLog("[x]", msg, [_param.cat, _param.subcat]));
    return Response.SendErrorX(db.ErrorX(res.payload));
  }
  let projDoc = res.payload;

  //Check if API exists
  if(!projDoc.SYSAPICtrl || _.isUndefined(projDoc.SYSAPICtrl[api])){
    let msg = "No API " + api + " is found.";
    console.log(Chalk.CLog("[x]", msg, [_param.cat, _param.subcat]));
    return Response.SendError(4004, msg);
  }
  projDoc.SYSAPICtrl[api] = value;

  res = await db.Update(configDB, projDoc);

  _remote.ClearCache();

  LAuth.Write(value? LAuth.__CODE.APIEnable : LAuth.__CODE.APIDisable,
    {api: api}, 
    reason, _username);

  if(!res.Success){
    let msg = res.payload.Message;
    console.log(Chalk.CLog("[!]", msg, [_param.cat, _param.subcat]));
  }

  return Response.Send(true, res.payload, "");

};