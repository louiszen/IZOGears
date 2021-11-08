const _base = require("../../_CoreWheels");
const _remote = require("$/remoteConfig");
const _DBMAP = require("$/__SYSDefault/_DBMAP");

const _ = require("lodash");


const {Chalk, Response} = _base.Utils;

/* IMPORTANT: Generic Scripts Automation depends on FOLDER name */

module.exports = async (_opt, _param) => {

  let db = await _remote.BaseDB();
  let dbname = _DBMAP[_param.subcat];

  let {data} = _opt;

  let res = await db.Find(dbname, {}, data.skip, data.limit, data.fields, data.sort);

  if(!res.Success){
    return Response.SendError(9001, res.payload);
  }

  let deleteDocs = res.payload.docs;
  deleteDocs = _.filter(deleteDocs, o => data.selected.includes(o._id));

  let rtn = await db.DeleteMany(dbname, deleteDocs);

  console.log(Chalk.CLog("[-]", _opt.data._id, [_param.subcat, _param.action]));

  if(!rtn.Success){
    return Response.SendError(9001, rtn.payload);
  }
  return Response.Send(true, rtn.payload, "");

};