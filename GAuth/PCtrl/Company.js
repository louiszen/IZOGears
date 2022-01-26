const _base = require("../../../IZOGears/_CoreWheels");
const _remote = require("../../../remoteConfig");
const _DBMAP = require("../../../__SYSDefault/_DBMAP");
const _ = require("lodash");
const LAuth = require("../../COGS/Log/LAuth");
const DEVCompany = require("../../InitDocs/Company/gammon");

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

  let {company, value, reason} = _opt.data;

  //protection
  if(company === DEVCompany._id){
    let msg = "Cannot disable [" + DEVCompany._id + "] at this level.";
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
  if(!projDoc.SYSAuthCtrl || !projDoc.SYSAuthCtrl.Companies || _.isUndefined(projDoc.SYSAuthCtrl.Companies[company])){
    let msg = "No Company [" + company + "] is found.";
    console.log(Chalk.CLog("[x]", msg, [_param.cat, _param.subcat]));
    return Response.SendError(4004, msg);
  }
  projDoc.SYSAuthCtrl.Companies[company] = value;

  res = await db.Update(configDB, projDoc);

  _remote.ClearCache();

  LAuth.Write(value? LAuth.__CODE.CompanyEnable : LAuth.__CODE.CompanyDisable, 
    {company: company},
    reason, _username);

  if(!res.Success){
    let msg = res.payload.Message;
    console.log(Chalk.CLog("[!]", msg, [_param.cat, _param.subcat]));
  }

  return Response.Send(true, res.payload, "");

};