const _base = require("../../../_CoreWheels");
const _remote = require("../../../../remoteConfig");
const _DBMAP = require("../../../../__SYSDefault/_DBMAP");

const {Chalk, Response, Time} = _base.Utils;

/* IMPORTANT: Generic Scripts Automation depends on FOLDER name */

module.exports = async (_opt, _param, _username) => {

  let db = await _remote.BaseDB();
  let dbname = _DBMAP[_param.subcat];

  let rtn = await db.getDocQ(dbname, _opt.data._id);
  if(!rtn.Success){
    return Response.SendError(9001, rtn.payload);
  }

  let doc = rtn.payload;
  delete doc._id;
  delete doc._rev;

  doc.lastUpdate = Time.Now().toISOString();

  rtn = await db.Insert(dbname, doc);

  console.log(Chalk.CLog("[-]", _opt.data._id, [_param.subcat, _param.action]));

  if(!rtn.Success){
    return Response.SendError(9001, rtn.payload);
  }
  return Response.Send(true, rtn.payload, "");

};