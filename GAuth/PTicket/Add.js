const _base = require("../../../IZOGears/_CoreWheels");
const _remote = require("../../../remoteConfig");
const _DBMAP = require("../../../__SYSDefault/_DBMAP");
const { USYSTicket } = require("../../COGS/Utils");
const { Time, ZGen } = require("../../_CoreWheels/Utils");

const {Response} = _base.Utils;

/* IMPORTANT: Generic Scripts Automation depends on SUBCAT name */

module.exports = async (_opt, _param, _username) => {

  let rtn = {};
  let db = await _remote.BaseDB();

  let {data} = _opt;

  let configDB = _DBMAP.Config;

  let res = await db.getDocQ(configDB, "PROJECT");
  if(!res.Success){return Response.SendErrorX(db.ErrorX(res.payload));}

  let projDoc = res.payload;
  let {ticketDB} = projDoc;

  let doc = {
    ...data,
    _id: Time.Now().format("YYYYMMDD") + "_" + ZGen.Key(12, 0b0111),
    type: data.type || USYSTicket.__TYPE.BUG,
    status: USYSTicket.__CODE.SUBMITTED,
    createdAt: Time.Now(),
    createdBy: _username,
    assignedTo: null,
    assignedBy: null,
    assignedAt: null,
    comment: "",
    lastModifiedBy: null,
    lastModifiedAt: null
  };

  res = await db.Update(ticketDB, doc);

  if(!res.Success){
    return Response.SendError(9001, res.payload);
  }

  return Response.Send(true, rtn, "");
  
};
