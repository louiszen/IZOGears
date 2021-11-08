const _base = require("../../_CoreWheels");
const _remote = require("$/remoteConfig");
const _DBMAP = require("../../../__SYSDefault/_DBMAP");

const { Excel } = _base.Utils;

const {Chalk, Response} = _base.Utils;

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
  let dbname = _DBMAP[_param.subcat];

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

};