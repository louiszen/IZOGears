const _base = require("../../../_CoreWheels");
const _remote = require("../../../../remoteConfig");
const _DBMAP = require("../../../../__SYSDefault/_DBMAP");

const {Chalk, Response} = _base.Utils;

/* IMPORTANT: Generic Scripts Automation depends on SUBCAT name */

module.exports = async (_opt, _param, _username) => {

  let {cat, subcat, action} = _param;

  let db = await _remote.BaseDB();
  let dbname = _DBMAP[subcat];

  let rtn = await db.Delete(dbname, _opt.data._id, _opt.data._rev);

  console.log(Chalk.CLog("[-]", _opt.data._id, [cat, subcat, action]));

  if(!rtn.Success){
    return Response.SendError(9001, rtn.payload);
  }
  return Response.Send(true, rtn.payload, "");

};