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

  let {user, accessor, value, reason} = _opt.data;

  //protection
  if(user === "Sys@Dev"){
    let msg = "Cannot disable user [Sys@Dev] at this level.";
    console.log(Chalk.CLog("[x]", msg, [_param.subcat, _param.action]));
    return Response.SendError(9001, msg);
  }

  //get Proj
  let configDB = _DBMAP.Config;

  let res = await db.getDocQ(configDB, "PROJECT");
  if(!res.Success){
    let msg = res.payload.Message;
    console.log(Chalk.CLog("[x]", msg, [_param.cat, _param.subcat]));
    return Response.SendErrorX(db.ErrorX(res.payload));
  }
  let projDoc = res.payload;
  let {userDB} = projDoc;

  //get User Doc
  res = await db.getDocQ(userDB, user);
  if(!res.Success){
    let msg = res.payload.Message;
    console.log(Chalk.CLog("[x]", msg, [_param.cat, _param.subcat]));
    return Response.SendErrorX(db.ErrorX(res.payload));
  }
  let userDoc = res.payload;

  userDoc.override = userDoc.override || {};
  userDoc.override[accessor] = value;

  res = await db.Update(userDB, userDoc);

  LAuth.Write(value? LAuth.__CODE.UserAuthTreeEnable : LAuth.__CODE.UserAuthTreeDisable,
    {user: user, accessor: accessor}, 
    reason, _username);

  if(!res.Success){
    let msg = res.payload.Message;
    console.log(Chalk.CLog("[!]", msg, [_param.cat, _param.subcat]));
  }

  return Response.Send(true, res.payload, "");

};