const _base = require("../../../IZOGears/_CoreWheels");
const _remote = require("../../../remoteConfig");
const _DBMAP = require("../../../__SYSDefault/_DBMAP");
const LAuth = require("../../COGS/Log/LAuth");

const {Chalk, Response} = _base.Utils;

/* IMPORTANT: Generic Scripts Automation depends on FOLDER name */

module.exports = async (_opt, _param, _username) => {

  let rtn = {};
  let db = await _remote.BaseDB();

  let {addOns} = _opt;

  let {reason} = addOns;
  let userID = _opt.data._id;

  let configDB = _DBMAP.Config;

  let res = await db.getDocQ(configDB, "PROJECT");
  if(!res.Success){return Response.SendErrorX(db.ErrorX(res.payload));}

  let projDoc = res.payload;
  let {userDB} = projDoc;

  //get doc first
  res = await db.getDocQ(userDB, userID);
  if(!res.Success){return Response.SendErrorX(db.ErrorX(res.payload));}
  let oriDoc = res.payload;
  delete oriDoc._rev;

  let newDoc = {
    ...oriDoc, 
    ..._opt.data
  };

  rtn = await db.Update(userDB, newDoc);

  LAuth.Write(LAuth.__CODE.UserEdit, 
    {user: userID},
    reason, _username);

  console.log(Chalk.CLog("[-]", _opt.data, [_param.subcat, _param.action]));

  if(!rtn.Success){
    return Response.SendError(9001, rtn.payload);
  }

  return Response.Send(true, rtn.payload, "");

};