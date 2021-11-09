const _base = require("$/IZOGears/_CoreWheels");
const _remote = require("$/remoteConfig");
const _DBMAP = require("$/__SYSDefault/_DBMAP");

const {Chalk, Response, Time} = _base.Utils;

/* IMPORTANT: Generic Scripts Automation depends on FOLDER name */

module.exports = async (_opt, _param) => {

  let db = await _remote.BaseDB();
  let dbname = _DBMAP[_param.subcat];

  _opt.data.lastUpdate = Time.Now().toISOString();

  let rtn = await db.Update(dbname, _opt.data);

  console.log(Chalk.CLog("[-]", _opt.data, [_param.subcat, _param.action]));

  if(!rtn.Success){
    return Response.SendError(9001, rtn.payload);
  }
  return Response.Send(true, rtn.payload, "");

};