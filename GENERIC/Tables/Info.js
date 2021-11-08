const _base = require("../../_CoreWheels");
const _remote = require("$/remoteConfig");
const _DBMAP = require("$/__SYSDefault/_DBMAP");

const { Response } = _base.Utils;

/* IMPORTANT: Generic Scripts Automation depends on FOLDER name */

module.exports = async (_opt, _param) => {
  let rtn = {};
  let db = await _remote.BaseDB();

  let dbname = _DBMAP[_param.subcat];
  rtn = await db.DocCount(dbname);

  if(!rtn.Success){
    return Response.SendError(9001, rtn.payload);
  }
  return Response.Send(true, rtn.payload, "");
  
};
