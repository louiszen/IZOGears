const _base = require("../../../_CoreWheels");
const _remote = require("../../../../remoteConfig");
const _DBMAP = require("../../../../__SYSDefault/_DBMAP");

const _ = require("lodash");
const Excel = require("exceljs");

const {Chalk, Response, Accessor} = _base.Utils;

/* IMPORTANT: Generic Scripts Automation depends on SUBCAT name */

module.exports = async (_opt, _param, _username, _file, _res) => {

  let {cat, subcat, action} = _param;

  function toType(value, format){
    if(typeof value === "string"){
      switch(format){
        case "string": return value;
        case "number": return Number(value);
        case "boolean": return (value.toLowerCase() === "true");
        default: return null;
      }
    }else if(typeof value === "boolean"){
      switch(format){
        case "string": return value.toString();
        case "number": return value ? 1: 0;
        case "boolean": return value;
        default: return null;
      }
    }else if(typeof value === "number"){
      switch(format){
        case "string": return value.toString();
        case "number": return value;
        case "boolean": return value!==0;
        default: return null;
      }
    }else{
      return value;
    }
  }

  let replace = true;

  let rtn = {}; 
  let db = await _remote.BaseDB();
  let dbname = _DBMAP[subcat];
  
  _opt.data = JSON.parse(_opt.data);
  _opt.schema = JSON.parse(_opt.schema);

  try{
    if(_file){
      let workbook = new Excel.Workbook();
      await workbook.xlsx.load(_file.buffer);

      let worksheet;
      let i = 0;
      while(worksheet === undefined){
        i++;
        worksheet = workbook.getWorksheet(i);
      }

      let rows = [];
      let docs = [];

      worksheet.eachRow((o, i) => {
        if(i !== 1){
          rows = [
            ...rows,
            o.values
          ];
        }
      });

      for(let o of rows){
        let doc = {};
        for(let i=0; i<_opt.schema.length; i++){ 
          let v = _opt.schema[i]; 
          let value = o[i+1];
          
          try{
            if(v.array && v.separator && value){
              let values;
              if(v.separator){
                values = value.split(v.separator);
              }

              let payload = [];
              
              for(let w of values){
                payload = [...payload, toType(w, v.format)];
              }
            
              Accessor.Set(doc, v.name, values);
              
            }else{
              value = toType(value, v.format);
              Accessor.Set(doc, v.name, value);
            }
            
          }catch(e){
            console.error(Chalk.CLog("[x]", e, [cat, subcat, action]));
          }
        }
         
        docs = [
          ...docs,
          {
            ..._.cloneDeep(doc)
          }
        ];

      }

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