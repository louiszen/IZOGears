const _base = require("../../../IZOGears/_CoreWheels");
const _remote = require("../../../remoteConfig");
const _DBMAP = require("../../../__SYSDefault/_DBMAP");
const LAuth = require("../../COGS/Log/LAuth");

const {Chalk, Response} = _base.Utils;

/* IMPORTANT: Generic Scripts Automation depends on FOLDER name */

module.exports = async (_opt, _param, _username) => {

  let rtn = {};
  let db = await _remote.BaseDB();

  let {addOns, data} = _opt;
  let {reason} = addOns;
  let groupID = data._id;

  let configDB = _DBMAP.Config;

  let res = await db.getDocQ(configDB, "PROJECT");
  if(!res.Success){return Response.SendErrorX(db.ErrorX(res.payload));}

  let projDoc = res.payload;
  let {groupDB} = projDoc;
  rtn = await db.Update(groupDB, data);

  _remote.ClearCache();

  LAuth.Write(LAuth.__CODE.GroupEdit, 
    {group: groupID},
    reason, _username);

  console.log(Chalk.CLog("[-]", groupID + " Edit Successfully", [_param.subcat, _param.action]));

  if(!rtn.Success){
    return Response.SendError(9001, rtn.payload);
  }

  return Response.Send(true, rtn.payload, "");

};