const _base = require('$/IZOGears/__ZBase');
const _config = require('$/__SYSDefault/SYSConfig');
const _remote = require('$/remoteConfig');
const _DBNAME = require('$/__SYSDefault/InitDocs/ConfigDocs/DBNAME');
const _init = require('$/__SYSDefault/InitDocs');
const _initopers = require('$/__SYSDefault/InitOperations');

const path = require('path');
const catName = path.basename(__dirname);
const actName = path.basename(__filename, path.extname(__filename));

const _ = require("lodash");
const Authorize = require('$/IZOGears/User/Authorize');
const AllAuth = require('$/__SYSDefault/AllAuth');

const {Chalk, Response} = _base.Utils;
const DDGen = _base.Modules.DesignDoc.Gen;

module.exports = async (_opt, _param) => {

  let env = _opt.env || process.env.NODE_ENV;

  let db = await _remote.BaseDB();
  let rtn;

  let sameAsBaseDB = _opt.sameAsBaseDB !== false; //default true

  console.log(Chalk.CLog('[-]', "Initialize project for [" + env + "]", [catName, actName]));

  try {
    //Create Config Database
    dbName = _DBNAME.Config;
    rtn = await db.getDocQ(dbName, "INITIALIZED");
    if(rtn.Success) { 
      let msg = "Project already initialized.";
      console.log(Chalk.CLog('[!]', msg, [catName, actName]));
      return Response.Send(true, null, msg);
    }

    if(_config.Init.CleanDB === true){
      console.log(Chalk.CLog('[!]', "Destory all databases for [" + env + "]", [catName, actName]));
      let res = await db.GetAllDatabases();
      if(res.Success){
        let alldbnames = res.payload;
        await Promise.all(_.map(alldbnames, async(o, i) => {
          rtn = await db.DestroyDatabase(o);
        }));
      }
    }

    rtn = await db.DestroyDatabase(dbName);
    rtn = await db.CreateDatabase(dbName);
    if(!rtn.Success) {throw new Error(rtn.payload);}

    //Create User Database
    dbName = _DBNAME.User;
    rtn = await db.DestroyDatabase(dbName);
    rtn = await db.CreateDatabase(dbName);
    if(!rtn.Success) {throw new Error(rtn.payload);}

    //Add default Root User
    let doc = {
      username: "default",
      password: "default",
      UserDisplayName: "Default Root",
      Version: 1,
      Level: 1,
      authority: AllAuth
    };
    rtn = await db.Insert(dbName, doc);

    await Promise.all(_.map(_init.User, async (o, i) => {
      rtn = await db.Insert(dbName, o);
    }));
    
    //add dbname config
    dbName = _DBNAME.Config;
    await Promise.all(_.map(_init.ConfigDocs, async (o, i) => {
      if(i == 'INITIALIZED') return;
      if(i == 'Database') {

        //pre-include all DBNames except _ & $
        let alldbnames = [];
        _.map(_init.ConfigDocs.DBNAME, (o, i) => {
          if(!i.endsWith("$") && !i.startsWith("_")){
            alldbnames.push(o);
          }
        });
        o.Config.include = alldbnames.sort();
      }

      rtn = await db.Insert(dbName, o);
      if(!rtn.Success) { throw new Error(rtn.payload.Error);}
    })); 

    let BaseDB = await _remote.BaseDB();

    //Destroy All Z database 
    rtn = await BaseDB.GetAllDatabases();
    let zdb = _.filter(rtn.payload, o => o.startsWith("z"));
    await Promise.all(_.map(zdb, async (o, i) => {
      rtn = await BaseDB.DestroyDatabase(o);
    }));

    initoperSuccess = true;

    let keys = Object.keys(_initopers);
    for(let i=0; i<keys.length; i++){
      o = _initopers[keys[i]];
      try{
        let ioRes = await o();
        if(!ioRes.Success){
          throw new Error(ioRes.payload.Error);
        }
      }catch(e){
        let msg = "Init Operations Errors.";
        console.error(Chalk.CLog('[x]', msg, [catName, actName]));
        console.error(e);
        throw new Error(msg);
      }
    };

    //FINISH
    dbName = _DBNAME.Config;
    rtn = await db.Insert(dbName, _init.ConfigDocs.INITIALIZED);
    console.log(Chalk.CLog('[v]', "Project for [" + env + "] initialized successfully.", [catName, actName]));

    _remote.ClearCache();
    Authorize.RefreshRemoteUsers();

    return Response.Send(true, rtn.payload, "");

  }catch(e){
    console.log(Chalk.CLog('[!]', e, [catName, actName]));
    return Response.SendError(9001, e);
  }
  
}