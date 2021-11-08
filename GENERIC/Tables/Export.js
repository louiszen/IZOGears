const _base = require("../../__ZBase");
const _remote = require("$/remoteConfig");

const _ = require("lodash");

const {Chalk, Response, Excel} = _base.Utils;

/* IMPORTANT: Generic Scripts Automation depends on FOLDER name */

/**
 * schema
 * [
 *    {
 *        Header|header: 'string',
 *        accessor|name: 'string',
 *        format?: 'value' | 'array' | 'json',
 *        separator?: 'char',
 *        nextRow?: 'bool'
 *    }
 * ]
 */
module.exports = async (_opt, _param, _file, _res) => {

  let {data} = _opt;
  let db = await _remote.BaseDB();
  let dbname = await _remote.GetDBName(_param.subcat);

  let res = {};

  console.log(Chalk.CLog("[-]", "Load All Data", [_param.subcat, _param.action]));
  if(!data.fields) data.fields = [];

  res = await db.Find(dbname, {}, data.skip, data.limit, data.fields, data.sort);
  if(!res.Success){
    return Response.SendError(9001, res.payload);
  }

  let exportDocs = res.payload.docs;

  if(!_.isEmpty(data.selected)){
    exportDocs = _.filter(exportDocs, o => data.selected.includes(o._id));
  }

  console.log(Chalk.CLog("[-]", "Data Rows: " + (exportDocs? exportDocs.length: 0), [_param.subcat, _param.action]));

  let sheetName = data.sheetName || "Sheet1";

  console.log(Chalk.CLog("[-]", "Generating Xlsx", [_param.subcat, _param.action]));

  let wb = Excel.Docs2Excel(exportDocs, data.schema, sheetName, data.noHeader);

  res = await wb.xlsx.write(_res);

  console.log(Chalk.CLog("[>]", "Sent Excel", [_param.subcat, _param.action]));

  _res.end();

};