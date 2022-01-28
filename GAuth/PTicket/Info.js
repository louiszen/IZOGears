const _base = require("../../../IZOGears/_CoreWheels");
const _remote = require("../../../remoteConfig");
const _DBMAP = require("../../../__SYSDefault/_DBMAP");

const {Response} = _base.Utils;

/* IMPORTANT: Generic Scripts Automation depends on SUBCAT name */

module.exports = async (_opt, _param, _username) => {

  let rtn = {};
  let db = await _remote.BaseDB();

  let configDB = _DBMAP.Config;

  let res = await db.getDocQ(configDB, "PROJECT");
  if(!res.Success){return Response.SendErrorX(db.ErrorX(res.payload));}

  let projDoc = res.payload;
  let {ticketDB} = projDoc;

  res = await db.DocCount(ticketDB);

  if(!res.Success){
    return Response.SendError(9001, res.payload);
  }

  rtn = {
    doc_count: res.payload
  };

  return Response.Send(true, rtn.payload, "");
  
};
