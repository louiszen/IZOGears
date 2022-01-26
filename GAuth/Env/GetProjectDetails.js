const _base = require("../../../IZOGears/_CoreWheels");
const _remote = require("../../../remoteConfig");
const _DBMAP = require("../../../__SYSDefault/_DBMAP");

const _ = require("lodash");

const {Chalk, Response} = _base.Utils;

module.exports = async (_opt, _param, _username) => {

  let rtn = {};

  let db = await _remote.BaseDB();

  let configDB = _DBMAP.Config;

  let res = await db.getDocQ(configDB, "PROJECT");
  if(!res.Success){
    let msg = res.payload.Message;
    console.log(Chalk.CLog("[!]", msg, [_param.subcat, _param.action]));
    return Response.SendError(9001, res.payload);
  }

  let projDoc = res.payload;
  let {userDB, roleDB, groupDB, companyDB} = projDoc;

  if(!userDB || !roleDB || !groupDB){
    let msg = "Project files corrupted. Please contact system admin.";
    console.log(Chalk.CLog("[x]", msg, [_param.subcat, _param.action]));
    return Response.SendError(9001, msg);
  }

  res = await db.FindAndListFields(userDB, ["_id", "UserDisplayName", "Role", "override"]);
  if(!res.Success){
    let msg = res.payload.Message;
    console.log(Chalk.CLog("[!]", msg, [_param.subcat, _param.action]));
    return Response.SendError(9001, res.payload);
  }
  let userlist = res.payload;

  res = await db.FindAndListFields(roleDB, ["_id", "name", "override"]);
  if(!res.Success){
    let msg = res.payload.Message;
    console.log(Chalk.CLog("[!]", msg, [_param.subcat, _param.action]));
    return Response.SendError(9001, res.payload);
  }
  let rolelist = res.payload;

  res = await db.FindAndListFields(companyDB, ["_id", "name", "override"]);
  if(!res.Success){
    let msg = res.payload.Message;
    console.log(Chalk.CLog("[!]", msg, [_param.subcat, _param.action]));
    return Response.SendError(9001, res.payload);
  }
  let companylist = res.payload;

  //restrict 
  _.map(rolelist, (o, i) => {
    if(o._id.startsWith("SYS")){
      o.reqLevel = 0;
    }
  });
  
  res = await db.FindAndListFields(groupDB, ["_id", "name", "users", "override"]);
  if(!res.Success){
    let msg = res.payload.Message;
    console.log(Chalk.CLog("[!]", msg, [_param.subcat, _param.action]));
    return Response.SendError(9001, res.payload);
  }
  let grouplist = res.payload;

  rtn = {
    projDoc: projDoc,
    userlist: userlist,
    rolelist: rolelist,
    grouplist: grouplist,
    companylist: companylist
  };

  return Response.Send(true, rtn, "");

  

};