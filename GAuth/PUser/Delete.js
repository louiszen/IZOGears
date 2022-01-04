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
  let userID = data._id;

  if(userID === "Sys@Dev"){
    let msg = "Cannot Delete User [Sys@Dev].";
    return Response.SendError(9403, msg);
  }

  let {reason} = addOns;

  let configDB = _DBMAP.Config;

  let res = await db.getDocQ(configDB, "PROJECT");
  if(!res.Success){return Response.SendErrorX(db.ErrorX(res.payload));}

  let projDoc = res.payload;
  //remove Ctrl in proj

  delete projDoc.SYSAuthCtrl.Users[userID];

  res = await db.Update(configDB, projDoc);
  if(!res.Success){return Response.SendErrorX(db.ErrorX(res.payload));}

  let {userDB} = projDoc;

  rtn = await db.Delete(userDB, userID, data._rev);

  LAuth.Write(LAuth.__CODE.UserDeleted, 
    {user: userID}, 
    reason, _username);

  console.log(Chalk.CLog("[-]", userID, [_param.subcat, _param.action]));

  if(!rtn.Success){
    return Response.SendError(9001, rtn.payload);
  }
  return Response.Send(true, rtn.payload, "");

};