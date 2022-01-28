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

  //get Project
  let {addOns} = _opt;
  let {reason} = addOns;
  let groupID = _opt.data._id;

  let configDB = _DBMAP.Config;

  let res = await db.getDocQ(configDB, "PROJECT");
  if(!res.Success){return Response.SendErrorX(db.ErrorX(res.payload));}

  let projDoc = res.payload;

  //add Ctrl in proj
  projDoc.SYSAuth.Groups.push(groupID);
  projDoc.SYSAuthCtrl.Groups[groupID] = true;

  res = await db.Update(configDB, projDoc);
  if(!res.Success){return Response.SendErrorX(db.ErrorX(res.payload));}

  let {groupDB} = projDoc;

  let newGroupDoc = {
    ..._opt.data,
    userCtrl: {},
    users: []
  };

  rtn = await db.Insert(groupDB, newGroupDoc);

  _remote.ClearCache();

  LAuth.Write(LAuth.__CODE.GroupCreated, 
    {group: groupID},
    reason, _username);

  console.log(Chalk.CLog("[-]", newGroupDoc, [cat, subcat, action]));

  if(!rtn.Success){
    return Response.SendError(9001, rtn.payload);
  }
  return Response.Send(true, rtn.payload, "");

};