const _base = require("../../../_CoreWheels");
const _remote = require("../../../../remoteConfig");
const _DBMAP = require("../../../../__SYSDefault/_DBMAP");

const { Response, Chalk } = _base.Utils;

/* IMPORTANT: Generic Scripts Automation depends on SUBCAT name */

module.exports = async (_opt, _param, _username) => {
  
  let {cat, subcat, action} = _param;
  let db = await _remote.BaseDB();

  let dbname = _DBMAP[subcat];
  let res = await db.DocCount(dbname);

  let {Success, payload} = res;
  if(!Success){
    let msg = "Cannot get database info";
    console.error(Chalk.CLog("[x]", msg, [cat, subcat, action]));
    return Response.SendError(9001, msg);
  }

  let rtn = {
    doc_count: payload
  };

  return Response.Send(true, rtn.payload, "");
  
};
