const _base = require("../../_CoreWheels");
const _config = require("../../../__SYSDefault/SYSConfig");
const _remote = require("../../../remoteConfig");
const _DBMAP = require("../../../__SYSDefault/_DBMAP");
const _init = require("../../../__SYSDefault/InitDocs");
const _initopers = require("../../../__SYSDefault/InitOperations");

const path = require("path");
const catName = path.basename(__dirname);
const actName = path.basename(__filename, path.extname(__filename));

const _ = require("lodash");


const {Chalk, Response} = _base.Utils;

module.exports = async (_opt, _param, _username) => {

  let env = _opt.env || process.env.NODE_ENV;

  let db = await _remote.BaseDB();
  let rtn;

  console.log(Chalk.CLog("[-]", "Initialize project for [" + env + "]", [catName, actName]));

  try {
    //Create Config Database
    let dbName = _DBMAP.Config;
    rtn = await db.getDocQ(dbName, "INITIALIZED");
    if(rtn.Success) { 
      let msg = "Project already initialized.";
      console.log(Chalk.CLog("[!]", msg, [catName, actName]));
      return Response.Send(true, null, msg);
    }

    if(_config.Init.CleanDB === true){
      console.log(Chalk.CLog("[!]", "Destory all databases for [" + env + "]", [catName, actName]));
      let res = await db.GetAllDrawers();
      if(res.Success){
        let alldbnames = res.payload;
        await Promise.all(_.map(alldbnames, async(o, i) => {
          rtn = await db.DestroyDrawer(o);
        }));
      }
    }

    rtn = await db.DestroyDrawer(dbName);
    rtn = await db.CreateDrawer(dbName);
    if(!rtn.Success) {throw new Error(rtn.payload);}

    //Create User Database
    dbName = _DBMAP.User;
    rtn = await db.DestroyDrawer(dbName);
    rtn = await db.CreateDrawer(dbName);
    if(!rtn.Success) {throw new Error(rtn.payload);}

    //Add Default Users
    rtn = await db.InsertMany(dbName, _init.User);

    //Create User Role
    dbName = _DBMAP.UserRole;
    rtn = await db.DestroyDrawer(dbName);
    rtn = await db.CreateDrawer(dbName);
    if(!rtn.Success) {throw new Error(rtn.payload);}

    rtn = await db.InsertMany(dbName, _init.UserRole);
    
    //add dbname config
    dbName = _DBMAP.Config;
    await Promise.all(_.map(_init.ConfigDocs, async (o, i) => {
      if(i == "INITIALIZED") return;
      if(i == "Database") {

        //pre-include all DBNames except _ & $
        console.log(Chalk.CLog("[-]", "Pre-include all databases except _ & $", [catName, actName]));
        let alldbnames = [];
        _.map(_DBMAP, (o, i) => {
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
    rtn = await BaseDB.GetAllDrawers();
    let zdb = _.filter(rtn.payload, o => o.startsWith("z"));
    await Promise.all(_.map(zdb, async (o, i) => {
      rtn = await BaseDB.DestroyDrawer(o);
    }));

    //init operators from __SYSDefault
    let keys = Object.keys(_initopers);
    for(let i=0; i<keys.length; i++){
      let o = _initopers[keys[i]];
      try{
        let ioRes = await o();
        if(!ioRes.Success){
          throw new Error(ioRes.payload.Error);
        }
      }catch(e){
        let msg = "Init Operations Errors.";
        console.error(Chalk.CLog("[x]", msg, [catName, actName]));
        console.error(e);
        throw new Error(msg);
      }
    }

    //FINISH
    dbName = _DBMAP.Config;
    rtn = await db.Insert(dbName, _init.ConfigDocs.INITIALIZED);
    console.log(Chalk.CLog("[v]", "Project for [" + env + "] initialized successfully.", [catName, actName]));

    _remote.ClearCache();

    return Response.Send(true, rtn.payload, "");

  }catch(e){
    console.log(Chalk.CLog("[!]", e, [catName, actName]));
    return Response.SendError(9001, e);
  }
  
};