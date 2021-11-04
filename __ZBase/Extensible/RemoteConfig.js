const Initializable = require('./Initializable');

const _ = require('lodash');
const CouchDB = require('../Modules/Database/NoSQL/CouchDB/CouchDB');

class RemoteConfig extends Initializable {

  /**
   * 
   * @param {CouchDB} db 
   */
  static Init(db = null){
    this.CouchDB = db? db : new CouchDB();
    this.Cache = {};
    this.CacheWithDocs = {};
    this._RemoteDB = {};
    return {Success: true};
  }

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
      let res = await this.CouchDB.getDocQ('config', name);
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
      let res = await this.CouchDB.List2Docs('user');
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
    if(this.CouchDB){
      return this.CouchDB;
    }
    this.CouchDB = new CouchDB();
    return this.CouchDB;
  }

  /**
   * 
   * @param {String} env 
   * @returns {CouchDB}
   */
  static async RemoteDB(env = process.env.NODE_ENV){
    await this.ReInit();
    if (this._RemoteDB[env]){
      return this._RemoteDB[env];
    }
    let _dbConfig = await this.GetCouchDB();
    this._RemoteDB[env] = new CouchDB(env, _dbConfig);
    return this._RemoteDB[env];
  }

  static async GetCouchDB(include_doc = false){
    await this.ReInit();
    return await this.GetConfig("CouchDB", include_doc);
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