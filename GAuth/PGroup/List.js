const _base = require("../../../IZOGears/_CoreWheels");
const _remote = require("../../../remoteConfig");
const _DBMAP = require("../../../__SYSDefault/_DBMAP");

const _ = require("lodash");

const {Chalk, Response} = _base.Utils;

/* IMPORTANT: Generic Scripts Automation depends on FOLDER name */

module.exports = async (_opt, _param, _username) => {

  let rtn = {};
  let db = await _remote.BaseDB();

  let {data} = _opt;

  let configDB = _DBMAP.Config;

  let res = await db.getDocQ(configDB, "PROJECT");
  if(!res.Success){return Response.SendErrorX(db.ErrorX(res.payload));}

  let projDoc = res.payload;
  let {groupDB} = projDoc;

  if(!_.isEmpty(data.selector) && data.limit){
    data.limit = data.limit + 1;
  }

  console.log(Chalk.CLog("[-]", data.skip + "~" + data.limit, [_param.subcat, _param.action]));
  console.log(data.fields, data.sort, data.selector);

  rtn = await db.Find(groupDB, 
    data.selector,
    data.skip, data.limit, 
    data.fields, data.sort
  );

  if(!rtn.Success){
    return Response.SendError(9001, rtn.payload);
  }
  return Response.Send(true, rtn.payload, "");

};