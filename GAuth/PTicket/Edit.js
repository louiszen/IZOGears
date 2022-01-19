const _base = require("../../../IZOGears/_CoreWheels");
const _remote = require("../../../remoteConfig");
const _DBMAP = require("../../../__SYSDefault/_DBMAP");
const { Time } = require("../../_CoreWheels/Utils");

const {Response} = _base.Utils;

/* IMPORTANT: Generic Scripts Automation depends on FOLDER name */

module.exports = async (_opt, _param, _username) => {

  let rtn = {};
  let db = await _remote.BaseDB();

  let {data} = _opt;

  let configDB = _DBMAP.Config;

  let res = await db.getDocQ(configDB, "PROJECT");
  if(!res.Success){return Response.SendErrorX(db.ErrorX(res.payload));}

  let projDoc = res.payload;
  let {ticketDB} = projDoc;

  let oriDoc = await db.getDocQ(ticketDB, data._id);
  let doc = {
    ...oriDoc,
    ...data,
    lastModifiedBy: _username,
    lastModifiedAt: Time.Now()
  };

  res = await db.Update(ticketDB, doc);

  if(!res.Success){
    return Response.SendError(9001, res.payload);
  }

  return Response.Send(true, rtn, "");
  
};
