const _base = require("../../_CoreWheels");
const SYSConfig = require("../../SYSConfig");
const _remote = require("../../../remoteConfig");
const _DBMAP = require("../../../__SYSDefault/_DBMAP");
const _init = require("../../InitDocs");
const _initdocs = require("../../../__SYSDefault/InitDocs/DBDocs");
const _initopers = require("../../../__SYSDefault/InitOperations");

const path = require("path");
const catName = path.basename(__dirname);
const actName = path.basename(__filename, path.extname(__filename));

const _ = require("lodash");
const SYSCredentials = require("../../SYSCredentials");
const LAuth = require("../../COGS/Log/LAuth");
const { Task } = require("../../_CoreWheels/Utils");

const {Chalk, Response} = _base.Utils;

module.exports = async (_opt, _param, _username) => {

  let env = _opt.env || SYSCredentials.ENV;

  let db = await _remote.BaseDB();
  let rtn;

  console.log(Chalk.CLog("[-]", "Initialize project for [" + env + "]", [catName, actName]));

  try {
    //Create Config Database
    let dbName = _DBMAP.Config;
    rtn = await Task.Retry(async () => {
        return await db.getDocQ(dbName, "INITIALIZED");
      }, 5);
    if(rtn.Success) { 
      let msg = "Project already initialized.";
      console.log(Chalk.CLog("[!]", msg, [catName, actName]));
      return Response.Send(true, null, msg);
    }
    if(!rtn.payload.NotFound){
      let msg = "Database connect error.";
      console.log(Chalk.CLog("[!]", msg, [catName, actName]));
      return Response.Send(true, null, msg);
    }

    if(rtn.payload.Fatal){
      let msg = "Database Connection Problem";
      console.log(Chalk.CLog("[x]", msg, [catName, actName]));
      return Response.Send(false, null, msg);
    }

    if(SYSConfig.Init.Backup){
      console.log(Chalk.CLog("[-]", "Backup project for [" + env + "] before Initialization", [catName, actName]));
      rtn = await db.Backup();
      if(!rtn.Success) {throw new Error(rtn.payload);}
    }

    if(SYSConfig.Init.CleanDB === true){
      console.log(Chalk.CLog("[!]", "Destory all databases for [" + env + "]", [catName, actName]));
      let res = await db.GetAllDrawers();
      if(res.Success){
        let alldbnames = res.payload;
        await Promise.all(_.map(alldbnames, async(o, i) => {
          rtn = await db.DestroyDrawer(o);
        }));
      }
    }

    rtn = await db.CreateDrawer(dbName);
    if(!rtn.Success) {throw new Error(rtn.payload);}

    //Create User Database
    dbName = _DBMAP.User;
    rtn = await db.CreateDrawer(dbName);
    if(!rtn.Success) {throw new Error(rtn.payload);}

    //Add Default Users
    rtn = await db.InsertMany(dbName, _init.User);

    //Create User Role
    dbName = _DBMAP.UserRole;
    rtn = await db.CreateDrawer(dbName);
    if(!rtn.Success) {throw new Error(rtn.payload);}

    rtn = await db.InsertMany(dbName, _init.UserRole);

    //Create User Group
    dbName = _DBMAP.ResGroup;
    rtn = await db.CreateDrawer(dbName);
    if(!rtn.Success) {throw new Error(rtn.payload);}

    rtn = await db.InsertMany(dbName, _init.ResGroup);
    
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

    //create other database
    await Promise.all(_.map(_DBMAP, async(o, i) => {
      if(i.endsWith("$") || i.startsWith("_")){ return; }
      if(["Config", "User", "UserRole", "ResGroup"].includes(i)){ return; }
      rtn = await db.CreateDrawer(o);
      if(!rtn.Success) {throw new Error(rtn.payload);}
    }));

    //init dbdocs from __SYSDefault
    await Promise.all(_.map(_initdocs, async (o, i) => {
      let dbname = _DBMAP[i];
      if(!dbname){
        console.log(Chalk.CLog("[!]", "No database map for " + i));
        return;
      }
      
      let docs = [];
      _.map(o, (v, x) => {
        docs.push(v);
      });
      await db.InsertMany(dbname, docs);

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

    //add log to logDB
    await LAuth.Write(LAuth.__CODE.Created, 
      {},
      "Project created", "SYSTEM");

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