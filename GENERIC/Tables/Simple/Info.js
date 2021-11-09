const _base = require("$/IZOGears/_CoreWheels");
const _remote = require("$/remoteConfig");
const _DBMAP = require("$/__SYSDefault/_DBMAP");

const { Response } = _base.Utils;

/* IMPORTANT: Generic Scripts Automation depends on FOLDER name */

module.exports = async (_opt, _param, _username) => {
  
  let db = await _remote.BaseDB();

  let dbname = _DBMAP[_param.subcat];
  let res = await db.DocCount(dbname);

  let {Success, payload} = res;
  if(!Success){
    return Response.SendError(9001, res.payload);
  }

  let rtn = {
    doc_count: payload
  };

  return Response.Send(true, rtn.payload, "");
  
};
