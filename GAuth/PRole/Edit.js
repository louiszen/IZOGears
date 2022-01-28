const _base = require("../../../IZOGears/_CoreWheels");
const _remote = require("../../../remoteConfig");
const _DBMAP = require("../../../__SYSDefault/_DBMAP");
const LAuth = require("../../COGS/Log/LAuth");

const {Chalk, Response} = _base.Utils;

/* IMPORTANT: Generic Scripts Automation depends on SUBCAT name */

module.exports = async (_opt, _param, _username) => {

  let {cat, subcat, action} = _param;
  
  let rtn = {};
  let db = await _remote.BaseDB();

  let {addOns, data} = _opt;

  let {reason} = addOns;
  let roleID = data._id;

  let configDB = _DBMAP.Config;

  let res = await db.getDocQ(configDB, "PROJECT");
  if(!res.Success){return Response.SendErrorX(db.ErrorX(res.payload));}

  let projDoc = res.payload;
  let {roleDB} = projDoc;
  rtn = await db.Update(roleDB, data);

  _remote.ClearCache();

  LAuth.Write(LAuth.__CODE.RoleEdit, 
    {role: roleID},
    reason, _username);

  console.log(Chalk.CLog("[-]", _opt.data, [cat, subcat, action]));

  if(!rtn.Success){
    return Response.SendError(9001, rtn.payload);
  }

  return Response.Send(true, rtn.payload, "");

};