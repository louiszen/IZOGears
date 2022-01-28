const _base = require("../../../_CoreWheels");
const _remote = require("../../../../remoteConfig");
const _DBMAP = require("../../../../__SYSDefault/_DBMAP");

const _ = require("lodash");

const {Chalk, Response, Excel} = _base.Utils;

/* IMPORTANT: Generic Scripts Automation depends on SUBCAT name */

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
module.exports = async (_opt, _param, _username, _file, _res) => {

  let {cat, subcat, action} = _param;

  let {data} = _opt;
  let db = await _remote.BaseDB();
  let dbname = _DBMAP[subcat];

  let res = {};

  console.log(Chalk.CLog("[-]", "Load All Data", [cat, subcat, action]));
  if(!data.fields) data.fields = [];

  res = await db.Find(dbname, {}, data.skip, data.limit, data.fields, data.sort);
  if(!res.Success){
    return Response.SendError(9001, res.payload);
  }

  let exportDocs = res.payload;

  if(!_.isEmpty(data.selected)){
    exportDocs = _.filter(exportDocs, o => data.selected.includes(o._id));
  }

  console.log(Chalk.CLog("[-]", "Data Rows: " + (exportDocs? exportDocs.length: 0), [cat, subcat, action]));

  let sheetName = data.sheetName || "Sheet1";

  console.log(Chalk.CLog("[-]", "Generating Xlsx", [cat, subcat, action]));

  let wb = Excel.Docs2Excel(exportDocs, data.schema, sheetName, data.noHeader);

  res = await wb.xlsx.write(_res);

  console.log(Chalk.CLog("[>]", "Sent Excel", [cat, subcat, action]));

  _res.end();

};