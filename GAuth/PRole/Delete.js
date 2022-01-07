const _base = require("../../../IZOGears/_CoreWheels");
const _remote = require("../../../remoteConfig");
const _DBMAP = require("../../../__SYSDefault/_DBMAP");
const LAuth = require("../../COGS/Log/LAuth");

const {Chalk, Response} = _base.Utils;

/* IMPORTANT: Generic Scripts Automation depends on FOLDER name */

module.exports = async (_opt, _param, _username) => {

  let rtn = {};
  let db = await _remote.BaseDB();

  let {data, addOns} = _opt;

  let roleID = data._id;
  if(roleID === "Devs"){
    let msg = "Cannot Delete Role [Devs].";
    return Response.SendError(9403, msg);
  }

  //getProject
  let { reason} = addOns;

  let configDB = _DBMAP.Config;
  let res = await db.getDocQ(configDB, "PROJECT");
  if(!res.Success){return Response.SendErrorX(db.ErrorX(res.payload));}

  let projDoc = res.payload;
  let {roleDB} = projDoc;

  //remove Ctrl in proj
  projDoc.SYSAuth.Roles = projDoc.SYSAuth.Roles.filter(o => o !== roleID);
  delete projDoc.SYSAuthCtrl.Roles[roleID];

  res = await db.Update(configDB, projDoc);
  if(!res.Success){return Response.SendErrorX(db.ErrorX(res.payload));}

  //do not remove anything in Groups or Users, user ctrl to guide access

  rtn = await db.Delete(roleDB, roleID, data._rev);

  _remote.ClearCache();

  LAuth.Write(LAuth.__CODE.RoleDeleted, 
    {role: roleID},
    reason, _username);

  console.log(Chalk.CLog("[-]", roleID, [_param.subcat, _param.action]));

  if(!rtn.Success){
    return Response.SendError(9001, rtn.payload);
  }
  return Response.Send(true, rtn.payload, "");

};