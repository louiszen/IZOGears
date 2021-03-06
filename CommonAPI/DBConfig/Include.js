const _base = require("../../_CoreWheels");
const _remote = require("../../../remoteConfig");
const _DBMAP = require("../../../__SYSDefault/_DBMAP");

const path = require("path");
const catName = path.basename(__dirname);
const actName = path.basename(__filename, path.extname(__filename));

const _ = require("lodash");


const {Chalk, Response} = _base.Utils;

module.exports = async (_opt, _param, _username) => {

  let db = await _remote.BaseDB();

  let {dbname, include} = _opt.data;

  console.log(Chalk.CLog("[<][o]", "CouchDB Config Edit: " + dbname + ".include => " + include, [catName, actName]));

  let docDBConfig = await _remote.GetDatabase(true);
  let incArray = docDBConfig.Config.include;

  if(include){
    if(!incArray.includes(dbname)){
      incArray.push(dbname);
    }
  }else{
    incArray = _.filter(incArray, o => o !== dbname);
  }

  docDBConfig.Config.include = incArray;

  let res = await db.Update(_DBMAP.Config, docDBConfig);

  console.log(Chalk.CLog("[-]", "Updated", [catName, actName]));

  if(!res.Success){
    let msg = res.payload.Message;
    console.log(Chalk.CLog("[!]", msg, [catName, actName]));
  }

  _remote.ClearCache();

  return Response.Send(true, res.payload, "");

  

};