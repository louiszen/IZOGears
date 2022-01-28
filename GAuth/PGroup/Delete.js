const _base = require("../../../IZOGears/_CoreWheels");
const _remote = require("../../../remoteConfig");
const _DBMAP = require("../../../__SYSDefault/_DBMAP");
const _ = require("lodash");
const LAuth = require("../../COGS/Log/LAuth");

const {Chalk, Response} = _base.Utils;

/* IMPORTANT: Generic Scripts Automation depends on SUBCAT name */

module.exports = async (_opt, _param, _username) => {

  let {cat, subcat, action} = _param;

  let rtn = {};
  let db = await _remote.BaseDB();

  let {addOns, data} = _opt;
  let {reason} = addOns;
  let groupID = data._id;

  let configDB = _DBMAP.Config;

  let res = await db.getDocQ(configDB, "PROJECT");
  if(!res.Success){return Response.SendErrorX(db.ErrorX(res.payload));}

  let projDoc = res.payload;
  let {groupDB, userDB} = projDoc;

  //remove Ctrl in proj
  projDoc.SYSAuth.Groups = projDoc.SYSAuth.Groups.filter(o => o !== groupID);
  delete projDoc.SYSAuthCtrl.Groups[groupID];

  res = await db.Update(configDB, projDoc);
  if(!res.Success){return Response.SendErrorX(db.ErrorX(res.payload));}

  
  rtn = await db.Delete(groupDB, groupID, _opt.data._rev);

  _remote.ClearCache();

  LAuth.Write(LAuth.__CODE.GroupDeleted, 
    {group: groupID},
    reason, _username);
  console.log(Chalk.CLog("[-]", groupID, [cat, subcat, action]));

  if(!rtn.Success){
    return Response.SendError(9001, rtn.payload);
  }

  //Select All Users and Delete their Groups
  
  let userRes = await db.List2Docs(userDB);
  if(userRes.Success){
    let userDocs = userRes.payload;
    let needReplace = [];
    _.map(userDocs, (o, i) => {
      let thatgroup = o.Groups.find(v => v.ID === groupID);
      if(thatgroup){
        o.Groups = o.Groups.filter(v => v.ID !== groupID);
        needReplace.push(o);
      }
    });
    await db.UpdateMany(userDB, needReplace);
  }

  return Response.Send(true, rtn.payload, "");

};