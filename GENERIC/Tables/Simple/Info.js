const _base = require("../../../_CoreWheels");
const _remote = require("../../../../remoteConfig");
const _DBMAP = require("../../../../__SYSDefault/_DBMAP");

const { Response } = _base.Utils;

/* IMPORTANT: Generic Scripts Automation depends on FOLDER name */

module.exports = async (_opt, _param, _username) => {
  
  let db = await _remote.BaseDB();

  let {addOns} = _opt;

  let {projID} = addOns;

  let res = await db.getDocQ(_DBMAP.Project, projID);
  if(!res.Success){return Response.SendErrorX(db.ErrorX(res.payload));}

  let projDoc = res.payload;
  let dbname = projDoc.roleDB;

  res = await db.DocCount(dbname);

  let {Success, payload} = res;
  if(!Success){
    return Response.SendError(9001, res.payload);
  }

  let rtn = {
    doc_count: payload
  };

  return Response.Send(true, rtn.payload, "");
  
};
