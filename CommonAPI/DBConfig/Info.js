const _base = require("../../_CoreWheels");
const _remote = require("../../../remoteConfig");
const _DBMAP = require("../../../__SYSDefault/_DBMAP");

const path = require("path");
const catName = path.basename(__dirname);
const actName = path.basename(__filename, path.extname(__filename));

const _ = require("lodash");
const SYSCredentials = require("../../SYSCredentials");

const {Chalk, Response} = _base.Utils;

module.exports = async (_opt, _param, _username) => {

  let db = await _remote.BaseDB();

  let resDBNAME = await db.getDocQ(_DBMAP.Config, "DBNAME");
  let docDBNAME = resDBNAME.payload;
  delete docDBNAME._id;
  delete docDBNAME._rev;

  let docDBConfig = await _remote.GetDatabase();

  let rtnDBName = [];
  _.map(docDBNAME, (o, i) => {
    rtnDBName.push({
      id: i,
      alias: o,
      included: docDBConfig.include.includes(o)
    });
  });

  let rtnEnv = {
    BASE: "",
    USERNAME: "",
    PASSWORD: "",
    URL: ""
  };

  if(docDBConfig.envs[SYSCredentials.ENV]){
    let {BASE, USERNAME, PASSWORD, URL} = docDBConfig.envs[SYSCredentials.ENV];
    rtnEnv = {
      BASE,
      USERNAME,
      PASSWORD,
      URL
    };
  }

  let payload = {
    DBNAME: rtnDBName,
    ENV: rtnEnv
  };

  console.log(Chalk.CLog("[>]", "CouchDB Config Sent", [catName, actName]));

  return Response.Send(true, payload, "");

};