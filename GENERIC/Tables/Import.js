const _base = require('../../__ZBase');
const _remote = require('$/remoteConfig');

const path = require('path');
const catName = path.basename(__dirname);
const actName = path.basename(__filename, path.extname(__filename));

const _ = require('lodash');
const { Excel } = _base.Utils;

const {Chalk, Response, Accessor} = _base.Utils;

/* IMPORTANT: Generic Scripts Automation depends on FOLDER name */

/**
 * schema
 * [
 *    {
 *        accessor: 'string',
 *        format?: 'value' | 'array' | 'json',
 *        separator?: 'char'
 *    }
 * ]
 */
module.exports = async (_opt, _param, _file, _res) => {

  let rtn = {}; 
  let db = await _remote.BaseDB();
  let dbname = await _remote.GetDBName(_param.subcat);

  let schema = JSON.parse(_opt.schema);
  let replace = JSON.parse(_opt.replace) || false;

  try{
    if(_file){
      
      let docs = await Excel.Excel2Docs(_file.buffer, schema);

      if(replace){
        await db.DestroyDatabase(dbname);
        await db.CreateDatabase(dbname);
      }

      rtn = await db.UpdateBulk(dbname, docs);
      if(!rtn.Success){
        return Response.SendError(9001, rtn.payload);
      }

      return Response.Send(true, rtn, "");
    }else{
      return Response.Send(false, "No File Recieved.", "");
    }

  }catch(e){
    console.error(Chalk.CLog("[x]", e, [_param.subcat, _param.action]));
    return Response.SendError(9004, e, "");
  }

}