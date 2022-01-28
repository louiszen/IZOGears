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

  //get Project
  let configDB = _DBMAP.Config;

  let res = await db.getDocQ(configDB, "PROJECT");
  if(!res.Success){return Response.SendErrorX(db.ErrorX(res.payload));}

  let projDoc = res.payload;
  let {roleDB} = projDoc;

  let newRoleDoc = data;

  //Check if exists
  res = await db.getDocQ(roleDB, newRoleDoc._id);
  if(res.Success && res.payload.length === 1) {
    let msg = "Role [" + newRoleDoc._id + "] exists.";
    console.log(Chalk.CLog("[x]", msg, [cat, subcat, action]));
    return Response.SendError(9001, msg);
  }

  //add Ctrl in proj
  projDoc.SYSAuth.Roles.push(newRoleDoc._id);
  projDoc.SYSAuthCtrl.Roles[newRoleDoc._id] = true;

  res = await db.Update(configDB, projDoc);
  if(!res.Success){return Response.SendErrorX(db.ErrorX(res.payload));}

  //add override field
  newRoleDoc.override = {
    System: false
  };

  rtn = await db.Insert(roleDB, newRoleDoc);

  _remote.ClearCache();

  LAuth.Write(LAuth.__CODE.RoleCreated, 
    {role: newRoleDoc._id},
    reason, _username);

  console.log(Chalk.CLog("[-]", newRoleDoc, [cat, subcat, action]));

  if(!rtn.Success){
    return Response.SendError(9001, rtn.payload);
  }
  return Response.Send(true, rtn.payload, "");

};