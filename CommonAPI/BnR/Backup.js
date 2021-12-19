const _base = require("../../_CoreWheels");
const _remote = require("../../../remoteConfig");

const path = require("path");
const _DBMAP = require("../../../__SYSDefault/_DBMAP");
const catName = path.basename(__dirname);
const actName = path.basename(__filename, path.extname(__filename));

const {Chalk, Response} = _base.Utils;

module.exports = async (_opt, _param, _username) => {

  let db = await _remote.BaseDB();
  
  let res = await db.getDocQ(_DBMAP.Config, "Database");
  if(!res.Success){
    let msg = res.payload.Message;
    console.error(Chalk.CLog("[x]", msg, [catName, actName]));
    return Response.SendError(9001, msg);
  }

  let doc = res.payload;
  let backuplist = doc.Config.include;

  res = await db.Backup(backuplist);
  
  if(!res.Success){
    let msg = res.payload.Message;
    console.error(Chalk.CLog("[x]", msg, [catName, actName]));
    return Response.SendError(9001, msg);
  }

  console.log(Chalk.CLog("[<][o]", "CouchDB Successfully Backup-ed", [catName, actName]));

  return Response.Send(true, "", "");

};