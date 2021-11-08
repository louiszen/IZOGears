const Initializable = require("./Initializable");
const _config = require("$/__SYSDefault/SYSConfig");

const _ = require("lodash");
const CouchDB = require("../Modules/Database/NoSQL/CouchDB/CouchDB");
const MongoDB = require("../Modules/Database/NoSQL/MongoDB/MongoDB");

// eslint-disable-next-line no-unused-vars
const Database = require("../Modules/Database/Database");

class RemoteConfig extends Initializable {

  /**
   * 
   * @param {Database} db 
   */
  static async Init(db = null){
    this.DB = db? db : this.getDatabase();
    this.Cache = {};
    this.CacheWithDocs = {};
    this._RemoteDB = {};
    return {Success: true};
  }

  static getDatabase(env = process.env.NODE_ENV){
    let {Provider, Backup} = _config.BaseDB;
    switch(Provider){
      case "CouchDB":
        return new CouchDB(env, _config.BaseDB.CouchDB, Backup, {Cloudant: false});
      case "Cloudant":
        return new CouchDB(env, _config.BaseDB.CouchDB, Backup, {Cloudant: true});
      case "MongoDB":
        return new MongoDB(env, _config.BaseDB.MongoDB, Backup);
    }
  }

  /**
   * Clear Cache to force RemoteConfig ReInit
   */
  static ClearCache(){
    this.Cache = {};
    this.CacheWithDocs = {};
    this._RemoteDB = {};
  }

  /**
   * 
   * @param {String} name 
   * @param {Boolean} include_doc 
   */
  static async GetConfig(name, include_doc = false){
    await this.ReInit();
    if(include_doc && this.CacheWithDocs[name]){
      return this.CacheWithDocs[name];
    }
    if(!include_doc && this.Cache[name]){
      return this.Cache[name];
    }
    try{
      let res = await this.DB.getDocQ("config", name);
      if(res.Success){
        if(include_doc || !res.payload.Config){
          this.CacheWithDocs[name] = res.payload;
          return res.payload;
        }else{
          this.Cache[name] = res.payload.Config;
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

  static async GetUsers(){
    await this.ReInit();
    try{
      let res = await this.DB.List2Docs("user");
      if(res.Success){
        return res.payload;
      }else{
        throw Error();
      }
    }catch(e){
      let msg = "Cannot load users from remote database.";
      console.error(this.CLog(msg, "[x]"));
      throw Error(msg);
    }
  }

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

  static async BaseDB(){
    await this.ReInit();
    if(this.DB){
      return this.DB;
    }
    this.DB = this.getDatabase();
    return this.DB;
  }

  static async GetDatabase(include_doc = false){
    await this.ReInit();
    return await this.GetConfig("Database", include_doc);
  }

  static async GetDBNames(){
    await this.ReInit();
    return await this.GetConfig("DBNAME", true);
  }

  static async GetDBName(name){
    await this.ReInit();
    let doc = await this.GetConfig("DBNAME", true);
    if(doc[name]){
      return doc[name];
    }
    return null;
  }

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