const _base = require("../../../_CoreWheels");
const _remote = require("../../../../remoteConfig");
const _DBMAP = require("../../../../__SYSDefault/_DBMAP");

const { Excel } = _base.Utils;

const {Chalk, Response} = _base.Utils;

/* IMPORTANT: Generic Scripts Automation depends on SUBCAT name */

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
module.exports = async (_opt, _param, _username, _file, _res) => {

  let {cat, subcat, action} = _param;

  let rtn = {}; 
  let db = await _remote.BaseDB();
  let dbname = _DBMAP[subcat];

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
    console.error(Chalk.CLog("[x]", e, [cat, subcat, action]));
    return Response.SendError(9004, e, "");
  }

};