
const Time = require("./Time");
const DDGen = require("../Modules/Database/NoSQL/CouchDB/DesignDocs/Gen");

const _ = require("lodash");
const moment = require("moment");

// eslint-disable-next-line no-unused-vars
const _remote = require("../../../remoteConfig");

/**
 * CouchDB classes for separating daily/monthly database 
 * with retrieving and housekeeping automation.
 */
class UExpirable {

  static __SETTINGS = {
    mode: "M",
    keep: 12
  };

  /**
   * Search for related databases with specified prefix
   * @override
   * @param {String} DBName
   */
   static async AllRelatedDBs(DBName){
    let db = await _remote.BaseDB();
    let res = await db.GetAllDrawers();
    if(!res.Success){ throw Error("Cannot connect database."); }

    let dbnames = res.payload.filter(o => o.startsWith(DBName));
    return dbnames;
  }

  /**
   * Get the entire DBName by entering time flag
   * @param {String} DBName
   * @param {String} flag 
   */
  static DBNameByFlag(DBName, flag = null){
    let dbName = DBName + (flag? flag : this.CurrentFlag());
    return dbName;
  }

  /**
   * Return flag
   */
  static CurrentFlag(){
    let now = Time.Now();
    let flag = now.format(this.__SETTINGS.mode == "M" ? "YYYYMM" : "YYYYMMDD");
    return flag;
  }

  /**
   * Return current DBName
   * @param {String} DBName
   */
  static CurrentDBName(DBName){
    let dbName = DBName + this.CurrentFlag();
    return dbName;
  }

  /**
   * Return DBName at specific time
   * @param {String} DBName
   * @param {moment.Moment} moment 
   */
  static DBNameAt(DBName, moment){
    let dbName = DBName 
      + moment.format(this.__SETTINGS.mode == "M" ? "YYYYMM" : "YYYYMMDD");
    return dbName;
  }

  /**
   * Create new DB if not exists
   * @param {String} DBName 
   * @param {String} currentDBName
   */
   static async CreateDB(DBName, currentDBName){
    let dbnames = await this.AllRelatedDBs(DBName);
    let db = await _remote.BaseDB();

    if(dbnames.includes(currentDBName)) return;
    let res = await db.CreateDrawer(currentDBName, {noMSG: true});
    if(res.Success){
      await this.AddDesignDoc(currentDBName);
    }
    return res;
  }

  /**
   * Add default create time design doc for sorting
   * @param {String} dbName 
   */
  static async AddDesignDoc(dbName){
    let db = await _remote.BaseDB();
    let payload = DDGen("inTime");
    let res = await db.Insert(dbName, payload);
    return res;
  }

  /**
   * Insert / Update documents to current database
   * @note It will update the field 'inTime' to current timestamp
   * @param {String} DBName 
   * @param {*} doc 
   */
  static async Insert(DBName, doc){
    try{
      let dbName = this.CurrentDBName(DBName);
      doc = {
        ...doc,
        inTime: Time.Now().toISOString() //MongoDB cannot auto convert to ISO string
      };
      if(doc._rev) delete doc._rev;
      await this.CheckClear();
      await this.CreateDB(DBName, dbName);
      let db = await _remote.BaseDB();
      let res = await db.Update(dbName, doc);  
        
      return res;
    }catch(e){
      return {Success: false};
    }
  }

  /**
   * Get the document of specified ID
   * @param {String} ID 
   * @param {String} timeFlag
   */
  static async Doc(DBName, ID, timeFlag = null){
    try{
      let db = await _remote.BaseDB();
      let dbName = this.DBNameByFlag(DBName, timeFlag);
      let res = await db.getDocQ(dbName, ID);
      if(res.Success){
        let doc = res.payload;
        return doc;
      }
    }catch(e){
      return null;
    }
    return null;
  }

  /**
   * Check whether the existing databases expired and can be deleted, then delete it]
   * @param {String} DBName 
   */
  static async CheckClear(DBName){
    let dbnames = await this.AllRelatedDBs(DBName);
    let db = await _remote.BaseDB();
    let now = Time.Now();

    await Promise.all(_.map(dbnames, async (o, i) => {
      let str = o.replace(DBName, "");
      let m = moment(str, (this.__SETTINGS.mode == "M" ? "YYYYMM" : "YYYYMMDD"));
      
      if(now.diff(m, this.__SETTINGS.mode == "M"? "months": "days") > this.__SETTINGS.keep){
        await db.DestroyDatabase(o);
      }
    }));
  }

  /**
   * @param {String} DBName
   * @param {moment.Moment} from 
   * @param {moment.Moment} to 
   */
  static async DocsWithin(DBName, from, to){
    let beginInterval = moment(from.format(this.__SETTINGS.mode == "M" ? "YYYYMM" : "YYYYMMDD"));
    let endInterval = moment(to.format(this.__SETTINGS.mode == "M" ? "YYYYMM" : "YYYYMMDD"));

    let docs = [];
    let res;
    let cur = beginInterval;

    do {
      console.log(cur.format("YYYYMM"));
      res = await this.ListAt(DBName, cur, {$and: [{inTime: { $gte: from }}, {inTime: { $lte: to }}]}, "asc");
      if(res.Success){
        docs.push(...res.payload);
      }
      if(this.__SETTINGS.mode == "M"){
        cur.add(1, "months");
      }else{
        cur.add(1, "days");
      }
    }while(cur <= endInterval);

    return docs.reverse();

  }

  /**
   * @param {String} DBName
   * @param {moment.Moment} interval 
   * @param {*} selector
   * @param {"asc" | "desc"} sort 
   */
  static async ListAt(DBName, interval, selector = {inTime: { $gte: 0 }}, sort = "desc"){
    let db = await _remote.BaseDB();
    let dbname = this.DBNameAt(DBName, interval);
    let _sort = [{ inTime: sort }];
    let rtn = await db.Find(dbname, selector, undefined, undefined, undefined, _sort);
    return rtn;
  }

  /**
   * 
   * @param {String} DBName 
   * @returns 
   */
  static async ListAll(DBName){
    let db = await _remote.BaseDB();
    let filtered = await this.AllRelatedDBs(DBName);

    let allPayload = [];
    for(let i=0; i<filtered.length; i++){
      let dbname = filtered[i];
      let res = await db.List2Docs(dbname);
      if(!res.Success){
        console.log(this.CLog("Cannot list docs from " + dbname, "[!]"));
      }
      allPayload = allPayload.concat(res.payload);
    }

    return {
      Success: true,
      payload: allPayload
    };
  }

}

module.exports = UExpirable;