const _base = require('../../__ZBase');
const _remote = require('../../../remoteConfig');

const path = require('path');
const catName = path.basename(__dirname);
const actName = path.basename(__filename, path.extname(__filename));

const {Chalk, Response} = _base.Utils;

/* IMPORTANT: Generic Scripts Automation depends on FOLDER name */

module.exports = async (_opt, _param) => {

  let db = await _remote.BaseDB();
  let dbname = await _remote.GetDBName(_param.subcat);

  let rtn = await db.getDocQ(dbname, _opt.data._id);
  if(!rtn.Success){
    return Response.SendError(9001, rtn.payload);
  }

  let doc = rtn.payload;
  delete doc._id;
  delete doc._rev;

  rtn = await db.Insert(dbname, doc);

  console.log(Chalk.CLog("[-]", _opt.data._id, [_param.subcat, _param.action]));

  if(!rtn.Success){
    return Response.SendError(9001, rtn.payload);
  }
  return Response.Send(true, rtn.payload, "");

}