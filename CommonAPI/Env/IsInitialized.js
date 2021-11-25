const _base = require("../../_CoreWheels");
const _remote = require("../../../remoteConfig");
const _DBMAP = require("../../../__SYSDefault/_DBMAP");

const path = require("path");
const SYSCredentials = require("../../../SYSCredentials");
const catName = path.basename(__dirname);
const actName = path.basename(__filename, path.extname(__filename));

const {Chalk, Response} = _base.Utils;

module.exports = async (_opt, _param, _username) => {

  let env = _opt.env || SYSCredentials.ENV;

  let db = await _remote.BaseDB();
  let rtn;

  console.log(Chalk.CLog("[-]", "Check project for [" + env + "]", [catName, actName]));

  try {
    //Create Config Database
    rtn = await db.getDocQ(_DBMAP.Config, "INITIALIZED");
    if(rtn.Success) { 
      console.log(Chalk.CLog("[-]", "Project for [" + env + "] is Initialized", [catName, actName]));
      return Response.Send(true, true, "");
    }
    console.error(Chalk.CLog("[-]", "Project for [" + env + "] is NOT Initialized", [catName, actName]));
    return Response.Send(true, false, "");

  }catch(e){
    console.error(Chalk.CLog("[x]", e, [catName, actName]));
    return Response.SendError(9001, e);
  }

};