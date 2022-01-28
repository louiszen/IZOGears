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
  
  let {cat, subcat, action} = _param;
  let db = await _remote.BaseDB();

  let {role, accessor, value, reason} = _opt.data;

  let configDB = _DBMAP.Config;

  let res = await db.getDocQ(configDB, "PROJECT");
  if(!res.Success){
    let msg = res.payload.Message;
    console.log(Chalk.CLog("[x]", msg, [cat, subcat, action]));
    return Response.SendErrorX(db.ErrorX(res.payload));
  }

  let projDoc = res.payload;
  
  let roleDB = projDoc.roleDB;
  
  res = await db.getDocQ(roleDB, role);
  if(!res.Success){
    let msg = res.payload.Message;
    console.log(Chalk.CLog("[x]", msg, [cat, subcat, action]));
    return Response.SendErrorX(db.ErrorX(res.payload));
  }
  let roleDoc = res.payload;

  roleDoc.override = roleDoc.override || {};
  roleDoc.override[accessor] = value;

  res = await db.Update(roleDB, roleDoc);

  _remote.ClearCache();

  LAuth.Write(value? LAuth.__CODE.RoleAuthTreeEnable : LAuth.__CODE.RoleAuthTreeDisable, 
    {role: role, accessor: accessor},
    reason, _username);

  if(!res.Success){
    let msg = res.payload.Message;
    console.log(Chalk.CLog("[!]", msg, [cat, subcat, action]));
  }

  return Response.Send(true, res.payload, "");

};