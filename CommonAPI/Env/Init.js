const _base = require("../../_CoreWheels");
const SYSConfig = require("../../SYSConfig");
const _remote = require("../../../remoteConfig");
const _DBMAP = require("../../../__SYSDefault/_DBMAP");
const _init = require("../../InitDocs");
const _initdocs = require("../../../__SYSDefault/InitDocs");
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
      let msg = "Database Connection Problem";
      console.log(Chalk.CLog("[!]", msg, [catName, actName]));
      return Response.Send(true, null, msg);
    }

    let {Backup, CleanDB} = SYSConfig.Init;

    if(Backup){
      console.log(Chalk.CLog("[-]", "Backup project for [" + env + "] before Initialization", [catName, actName]));
      rtn = await db.Backup();
      if(!rtn.Success) {throw new Error(rtn.payload);}
    }

    if(CleanDB === true){
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
    if(CleanDB && !rtn.Success) {throw new Error(rtn.payload);}

    //Create User Database
    dbName = _DBMAP.User;
    rtn = await db.CreateDrawer(dbName);
    if(CleanDB && !rtn.Success) {throw new Error(rtn.payload);}

    //Create User Role
    dbName = _DBMAP.UserRole;
    rtn = await db.CreateDrawer(dbName);
    if(CleanDB && !rtn.Success) {throw new Error(rtn.payload);}

    //Create User Group
    dbName = _DBMAP.ResGroup;
    rtn = await db.CreateDrawer(dbName);
    if(CleanDB && !rtn.Success) {throw new Error(rtn.payload);}

    //create other database
    await Promise.all(_.map(_DBMAP, async(o, i) => {
      if(i.endsWith("$") || i.startsWith("_")){ return; }
      if(["Config", "User", "UserRole", "ResGroup"].includes(i)){ return; }
      rtn = await db.CreateDrawer(o);
      if(CleanDB && !rtn.Success) {throw new Error(rtn.payload);}
    }));

    //init dbdocs from __SYSDefault
    let DBDocs = await _initdocs();
    await Promise.all(_.map(_DBMAP, async (o, i) => {
      if(i.endsWith("$") || i.startsWith("_")){ return; }
      
      let docs = [];

      switch(i){
        case "User": docs.push(..._init.User); break;
        case "UserRole": docs.push(..._init.UserRole); break;
        case "ResGroup": docs.push(..._init.ResGroup); break;
        case "Company": docs.push(..._init.Company); break;
        default: break;
      }

      if(DBDocs[i]){
        let v = DBDocs[i];
        if(_.isFunction(v)){
          v = await v();
        }
        _.map(v, (k, w) => {
          docs.push(k);
        });
      }
      if(!CleanDB){
        await db.UpdateMany(o, docs);
      }else{
        await db.InsertMany(o, docs);
      }

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

    //add dbname config
    dbName = _DBMAP.Config;
    await Promise.all(_.map(_init.ConfigDocs, async (o, i) => {
      if(i === "INITIALIZED") return;
      if(i === "Database") {

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
      if(i === "PROJECT"){
        //sync ctrl role
        let inRes = await db.List2Docs(_DBMAP.UserRole);
        if(inRes.Success){
          _.map(inRes.payload, (v, x) => {
            if(!o.SYSAuth.Roles.includes(v._id)){
              o.SYSAuth.Roles.push(v._id);
            }
            o.SYSAuthCtrl.Roles[v._id] = true;
          });
        }
        
        //sync ctrl group
        inRes = await db.List2Docs(_DBMAP.ResGroup);
        if(inRes.Success){
          _.map(inRes.payload, (v, x) => {
            if(!o.SYSAuth.Groups.includes(v._id)){
              o.SYSAuth.Groups.push(v._id);
            }
            o.SYSAuthCtrl.Groups[v._id] = true;
          });
        }

        //sync ctrl user
        inRes = await db.List2Docs(_DBMAP.User);
        if(inRes.Success){
          _.map(inRes.payload, (v, x) => {
            if(!o.SYSAuth.Users.includes(v._id)){
              o.SYSAuth.Users.push(v._id);
            }
            o.SYSAuthCtrl.Users[v._id] = true;
          });
        }
      }

      if(!CleanDB){
        rtn = await db.Update(dbName, o);
      }else{
        rtn = await db.Insert(dbName, o);
      }
      
      if(!rtn.Success) { throw new Error(rtn.payload.Error);}
    }));


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