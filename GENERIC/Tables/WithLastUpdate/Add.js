const _base = require("../../../_CoreWheels");
const _remote = require("../../../../remoteConfig");
const _DBMAP = require("../../../../__SYSDefault/_DBMAP");

const {Chalk, Response, Time} = _base.Utils;

/* IMPORTANT: Generic Scripts Automation depends on SUBCAT name */

module.exports = async (_opt, _param, _username) => {

  let {cat, subcat, action} = _param;

  let db = await _remote.BaseDB();
  let dbname = _DBMAP[subcat];

  _opt.data.lastUpdate = Time.Now().toISOString();

  let rtn = await db.Insert(dbname, _opt.data);

  console.log(Chalk.CLog("[-]", _opt.data, [cat, subcat, action]));

  if(!rtn.Success){
    return Response.SendError(9001, rtn.payload);
  }
  return Response.Send(true, rtn.payload, "");

};