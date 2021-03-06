const _base = require("../../_CoreWheels");
const _remote = require("../../../remoteConfig");

const path = require("path");
const catName = path.basename(__dirname);
const actName = path.basename(__filename, path.extname(__filename));

const {Chalk, Response} = _base.Utils;
const Backup = require("./Backup");
const SYSCredentials = require("../../SYSCredentials");

module.exports = async (_opt, _param, _username) => {

  let db = await _remote.BaseDB();

  let {datestr} = _opt.data;
  
  //Backup first to avoid mis-replacement
  let res = await Backup(_opt, _param, _username);

  res = await db.Restore(SYSCredentials.ENV, datestr);

  if(!res.Success){
    let msg = res.payload.Message;
    console.log(Chalk.CLog("[!]", msg, [catName, actName]));
  }

  console.log(Chalk.CLog("[<][o]", "CouchDB Successfully Restored", [catName, actName]));

  _remote.ClearCache();

  return Response.Send(true, res.payload, "");
  
};