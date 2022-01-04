const _base = require("../../../IZOGears/_CoreWheels");
const _remote = require("../../../remoteConfig");
const _DBMAP = require("../../../__SYSDefault/_DBMAP");
const LAuth = require("../../COGS/Log/LAuth");

const {Chalk, Response} = _base.Utils;

/* IMPORTANT: Generic Scripts Automation depends on FOLDER name */

module.exports = async (_opt, _param, _username) => {

  let rtn = {};
  let db = await _remote.BaseDB();

  //get Project
  let {addOns, data} = _opt;
  let {reason} = addOns;

  let configDB = _DBMAP.Config;

  let res = await db.getDocQ(configDB, "PROJECT");
  if(!res.Success){return Response.SendErrorX(db.ErrorX(res.payload));}

  let projDoc = res.payload;
  let {userDB} = projDoc;

  let userDoc = data;
  let userID = userDoc._id;

  //check user exists
  res = await db.getDocQ(userDB, userID);
  if(res.Success && res.payload.length === 1) {
    let msg = "Users [" + userID + "] exists.";
    console.log(Chalk.CLog("[x]", msg, [_param.subcat, _param.action]));
    return Response.SendError(9001, msg);
  }

  //add Ctrl in proj
  projDoc.SYSAuthCtrl.Users[userID] = true;

  res = await db.Update(configDB, projDoc);
  if(!res.Success){return Response.SendErrorX(db.ErrorX(res.payload));}

  userDoc.override = {};
  userDoc.Version = 0;
  userDoc.Groups = [];

  rtn = await db.Insert(userDB, userDoc);

  LAuth.Write(LAuth.__CODE.UserCreated, 
    {user: userID},
    reason, _username);

  console.log(Chalk.CLog("[-]", userDoc, [_param.subcat, _param.action]));

  if(!rtn.Success){
    return Response.SendError(9001, rtn.payload);
  }
  return Response.Send(true, rtn.payload, "");

};