const Initializable = require("./Initializable");
const SYSConfig = require("../../SYSConfig");
// eslint-disable-next-line no-unused-vars
const Database = require("../Modules/Database/Database");
const CouchDB = require("../Modules/Database/NoSQL/CouchDB/CouchDB");
const MongoDB = require("../Modules/Database/NoSQL/MongoDB/MongoDB");

const _ = require("lodash");
const SYSCredentials = require("../../SYSCredentials");
const _DBMAP = require("../../../__SYSDefault/_DBMAP");
const { Time } = require("../Utils");

class RemoteConfig extends Initializable {

  /**
   * 
   * @param {Database} db 
   */
  static async Init(db = null){
    this.DB = db? db : this.getDatabase();
    this.Cache = {};
    this.CachedProject = {};
    this.CacheWithDocs = {};
    this.CachedUsers = {};
    this.CachedUserRoles = {};
    this.CachedResGroups = {};
    this.lastClear = Time.Now();
    this.timeInterval = 15;
    return {Success: true};
  }

  /**
   * 
   * @param {String} env 
   * @returns {Database}
   */
  static getDatabase(){
    let {Provider, Backup} = SYSConfig.BaseDB;

    let _Provider = null;
    let _Config = null;
    //env override
    if(process.env.DB_PROVIDER){
      let msg = "Using DB_PROVIDER from .env";
      console.log(this.CLog(msg, "[!]"));
      _Provider = process.env.DB_PROVIDER;
    }

    try{
      if(process.env.DB_CONFIG){
        let msg = "Parsing DB_CONFIG from .env";
        console.log(this.CLog(msg, "[!]"));
        _Config = JSON.parse(process.env.DB_CONFIG);
      }
    }catch(e){
      let msg = "JSON parse DB_CONFIG failed from .env: " + e.message;
      console.error(this.CLog(msg, "[x]"));
    }

    switch(_Provider || Provider){
      case "CouchDB":
        return new CouchDB(_Config || SYSCredentials.BaseDB.CouchDB, Backup, {Cloudant: false});
      case "Cloudant":
        return new CouchDB(_Config || SYSCredentials.BaseDB.CouchDB, Backup, {Cloudant: true});
      case "MongoDB":
        return new MongoDB(_Config || SYSCredentials.BaseDB.MongoDB, Backup);
    }
  }

  /**
   * Clear Cache to force RemoteConfig ReInit
   */
  static ClearCache(){
    this.Cache = {};
    this.CacheWithDocs = {};
    this.CachedProject = {};
    this.CachedUsers = {};
    this.CachedUserRoles = {};
    this.CachedResGroups = {};
    
    this.Expire = {
      Cache: Time.Now(),
      CachedProject: Time.Now(),
      CacheWithDocs: Time.Now(),
      CachedUsers: Time.Now(),
      CachedUserRoles: Time.Now(),
      CachedResGroups: Time.Now()
    };
  }

  static setExpire(cache){
    this.Expire = this.Expire || {};
    this.Expire[cache] = Time.Now().add(this.timeInterval, "minutes");
  }

  static isExpired(cache){
    if(!this.Expire[cache]) return true;
    return Time.NowIsAfter(this.Expire[cache]);
  }

  /**
   * 
   * @param {String} name 
   * @param {Boolean} include_doc 
   */
  static async GetConfig(name, include_doc = false){
    await this.ReInit();
    if(include_doc && this.CacheWithDocs[name] && !this.isExpired("CacheWithDocs")){
      return this.CacheWithDocs[name];
    }
    if(!include_doc && this.Cache[name] && !this.isExpired("Cache")){
      return this.Cache[name];
    }
    try{
      let res = await this.DB.getDocQ(_DBMAP.Config, name);
      if(res.Success){
        if(include_doc || !res.payload.Config){
          this.CacheWithDocs[name] = res.payload;
          this.setExpire("CacheWithDocs");
          return res.payload;
        }else{
          this.Cache[name] = res.payload.Config;
          this.setExpire("Cache");
          return res.payload.Config;
        }
      }else{
        throw Error();
      }
    }catch(e){
      let msg = "Cannot load config (" + name + ") from remote database.";
      console.error(this.CLog(msg, "[x]"));
      throw Error(msg);
    }
  }

  /**
   * Get Project in DB
   * @returns {Promise<sys>}
   */
   static async GetProject(){
    await this.ReInit();
    if(this.CachedProject.Project && !this.isExpired("CachedProject")){
      return this.CachedProject.Project;
    }
    try{
      let res = await this.DB.getDocQ(_DBMAP.Config, "PROJECT");
      if(res.Success){
        this.CachedProject.Project = res.payload;
        this.setExpire("CachedProject");
        return this.CachedProject.Project;
      }else{
        throw Error();
      }
    }catch(e){
      let msg = "Cannot load project from remote database.";
      console.error(this.CLog(msg, "[x]"));
      throw Error(msg);
    }
  }

  /**
   * Get Users in DB
   * @returns {Promise<[user]>}
   */
  static async GetUsers(){
    await this.ReInit();
    if(this.CachedUsers.Users && !this.isExpired("CachedUsers")){
      return this.CachedUsers.Users;
    }
    try{
      let res = await this.DB.List2Docs(_DBMAP.User);
      if(res.Success){
        this.CachedUsers.Users = res.payload;
        this.setExpire("CachedUsers");
        return this.CachedUsers.Users;
      }else{
        throw Error();
      }
    }catch(e){
      let msg = "Cannot load users from remote database.";
      console.error(this.CLog(msg, "[x]"));
      throw Error(msg);
    }
  }
  
  /**
   * 
   * @returns {<Promise<[userrole]>}
   */
  static async GetUserRoles(){
    await this.ReInit();
    if(this.CachedUserRoles.Roles && !this.isExpired("CachedUserRoles")){
      return this.CachedUserRoles.Roles;
    }
    try{
      let res = await this.DB.List2Docs(_DBMAP.UserRole);
      if(res.Success){
        this.CachedUserRoles.Roles = res.payload;
        this.setExpire("CachedUserRoles");
        return this.CachedUserRoles.Roles;
      }else{
        throw Error();
      }
    }catch(e){
      let msg = "Cannot load userroles from remote database.";
      console.error(this.CLog(msg, "[x]"));
      throw Error(msg);
    }
  }

  /**
   * 
   * @returns {<Promise<[usergroup]>}
   */
   static async GetResGroups(){
    await this.ReInit();
    if(this.CachedResGroups.Groups && !this.isExpired("CachedResGroups")){
      return this.CachedResGroups.Groups;
    }
    try{
      let res = await this.DB.List2Docs(_DBMAP.ResGroup);
      if(res.Success){
        this.CachedResGroups.Groups = res.payload;
        this.setExpire("CachedResGroups");
        return this.CachedResGroups.Groups;
      }else{
        throw Error();
      }
    }catch(e){
      let msg = "Cannot load resgroups from remote database.";
      console.error(this.CLog(msg, "[x]"));
      throw Error(msg);
    }
  }

  /**
   * Get Services in DB
   */
  static async GetServices(){
    await this.ReInit();
    try{
      let res = await this.GetConfig("SERVICES", true);
      if(res.Success){

        let services = res.payload.Services;
        let rtn = [];

        await Promise.all(_.map(services, async(o, i) => {
          let resService = await this.GetConfig(o);
          if(resService.Success){
            rtn.push(resService.payload);
          }
        }));

        return rtn;

      }else{
        throw Error();
      }
    }catch(e){
      let msg = "Cannot load services from remote database.";
      console.error(this.CLog(msg, "[x]"));
      throw Error(msg);
    }
  }

  /**
   * 
   * @returns {Database}
   */
  static async BaseDB(){
    await this.ReInit();
    if(this.DB){
      return this.DB;
    }
    this.DB = this.getDatabase();
    return this.DB;
  }

  /**
   * Get Database Configs
   * @param {Boolean} include_doc 
   */
  static async GetDatabase(include_doc = false){
    await this.ReInit();
    return await this.GetConfig("Database", include_doc);
  }

  /**
   * Check if the project is initialized
   */
  static async IsInitialized(){
    await this.ReInit();
    try{
      await this.GetConfig("INITIALIZED", true);
      return true;
    }catch(e){
      return false;
    }
  }

}

module.exports = RemoteConfig;