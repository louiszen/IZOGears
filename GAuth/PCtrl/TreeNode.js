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
  
  let {cat, subcat, action} = _param;
  let db = await _remote.BaseDB();

  let {accessor, value, reason} = _opt.data;

  let configDB = _DBMAP.Config;

  let res = await db.getDocQ(configDB, "PROJECT");
  if(!res.Success){
    let msg = res.payload.Message;
    console.log(Chalk.CLog("[x]", msg, [cat, subcat, action]));
    return Response.SendErrorX(db.ErrorX(res.payload));
  }

  let projDoc = res.payload;
  if(!projDoc.SYSAuthCtrl 
      || !projDoc.SYSAuthCtrl.AuthTree
      || _.isUndefined(projDoc.SYSAuthCtrl.AuthTree[accessor])){
    let msg = "No Tree Node " + accessor + " is found.";
    console.log(Chalk.CLog("[x]", msg, [cat, subcat, action]));
    return Response.SendError(4004, msg);
  }
  projDoc.SYSAuthCtrl.AuthTree[accessor] = value;

  res = await db.Update(configDB, projDoc);

  _remote.ClearCache();

  LAuth.Write(value? LAuth.__CODE.AuthTreeEnable : LAuth.__CODE.AuthTreeDisable,
    {accessor: accessor}, 
    reason, _username);

  if(!res.Success){
    let msg = res.payload.Message;
    console.log(Chalk.CLog("[!]", msg, [cat, subcat, action]));
  }

  return Response.Send(true, res.payload, "");

};