const _remote = require("../remoteConfig");

const { Time, Chalk } = require("./_CoreWheels/Utils");
const _ = require("lodash");
const _initdocs = require("../__SYSDefault/InitDocs");
const _init = require("./InitDocs");

const _DBMAP = require("../__SYSDefault/_DBMAP");
const SYSConfig = require("./SYSConfig");
const SYSAPI = require("../SYSAPI");
const SYSAuth = require("../__SYSDefault/SYSAuth");
const SYSAPICtrl = require("../SYSAPICtrl");
const SYSAuthCtrl = require("../SYSAuthCtrl");
const DEVUSER = require("../__SYSDefault/DevUser");

class SYSOnLoad {

  /**
   * Update GAuth
   * @returns 
   */
  static async UpdateDBAuth(SYSReqAuth){
    let db = await _remote.BaseDB();
    let res = await db.getDocQ(_DBMAP.Config, "PROJECT");
    let { Success, payload } = res;
    if(Success){
      let projDoc = payload;
      projDoc = {
        ...projDoc,
        SYSAuth: {
          ...projDoc.SYSAuth,
          AuthTree: SYSAuth.AuthTree,
        },
        SYSAuthCtrl: {
          Level: {
            ...projDoc.SYSAuthCtrl.Level,
            ...SYSAuthCtrl.Level
          },
          Groups: {
            ...projDoc.SYSAuthCtrl.Groups,
            ...SYSAuthCtrl.Groups
          },
          Roles: {
            ...projDoc.SYSAuthCtrl.Roles,
            ...SYSAuthCtrl.Roles
          },
          AuthTree: {
            ...projDoc.SYSAuthCtrl.AuthTree,
            ...SYSAuthCtrl.AuthTree
          },
          Users: {
            ...projDoc.SYSAuthCtrl.Users,
            ...SYSAuthCtrl.Users
          }
        },
        SYSAPI: SYSAPI,
        SYSAPICtrl: SYSAPICtrl,
        SYSReqAuth: SYSReqAuth,
        lastUpdatedAt: Time.Now().toISOString(),
        lastUpdatedBy: DEVUSER._id
      };
      let upRes = await db.Update(_DBMAP.Config, projDoc);
      if(!upRes.Success){
        let msg = "Cannot update authority settings.";
        console.log(Chalk.Log("[x]" + msg));
        return {Success: false, payload: msg};
      }
      let successMsg = "Authority settings updated to database.";
      console.log(Chalk.Log("[v] " + successMsg));
    }
    return {Success: true};
  }

  static async RecoverDB(){

    let db = await _remote.BaseDB();
    let res = await db.GetAllDrawers();
    if(!res.Success) return {Succes: false};
    let dbnames = res.payload;

    let DBDocs = await _initdocs();

    if(SYSConfig.RecoverDBOnLoad.Create){
      await Promise.all(_.map(_DBMAP, async (o, i) => {
        try{
          if(dbnames.includes(o)) return;
          if(i.endsWith("$") || i.startsWith("_")){ return; }
          if(["Config"].includes(i)){ return; }

          console.log(Chalk.Log("[!] " + o + " is missing. Create Database."));
          let rtn = await db.CreateDrawer(o);
          if(!rtn.Success) {return;}
          if(SYSConfig.RecoverDBOnLoad.InitDocs){
            console.log(Chalk.Log("[!] Recover initial documents after creating " + o + "."));

            let docs = [];

            switch(i){
              case "User": docs.push(..._init.User); break;
              case "UserRole": docs.push(..._init.UserRole); break;
              case "ResGroup": docs.push(..._init.ResGroup); break;
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
            if(docs.length > 0){
              await db.InsertMany(o, docs);
            } 
          }
        }catch(e){
          console.log(e);
        }
      }));
    }

    return {Success: true};
  }

}

module.exports = SYSOnLoad;