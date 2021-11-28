
const Renewable = require("./Renewable");
const Time = require("../Utils/Time");
const DDGen = require("../Modules/Database/NoSQL/CouchDB/DesignDocs/Gen");

const _ = require("lodash");
const moment = require("moment");

// eslint-disable-next-line no-unused-vars
const Database = require("../Modules/Database/Database");

/**
 * CouchDB classes for separating daily/monthly database 
 * with retrieving and housekeeping automation.
 */
class ExpirableDB extends Renewable {

  /**
   * Search for related databases with specified prefix
   * @override
   */
  static async Renew(){
    let res = await this.DB.GetAllDrawers();
    if(!res.Success){ return {Success: false}; }

    this.dbnames = res.payload.filter(o => o.startsWith(this.DBName));
    return {Success: true};
  }

  /**
   * Condition for renew
   * @override
   * @param {moment.Moment} now 
   */
  static async needRenew(now){
    return _.isEmpty(this.dbnames) 
      || this.IsExpired(now, this.renewTime, "days");
  }

  /**
   * Initialization - call OnLoad once before using it
   * @note Do NOT directly call this method.
   * @override
   * @param {{
   *  db: Database,
   *  DBName: String,
   *  keep: Number,
   *  mode: 'M' | 'D'
   * }} param0 
   */
  static async Init({db, DBName, keep = 120, mode = "M"}){
    this.DB = db;
    this.DBName = DBName;
    this.mode = mode;
    this.keep = keep;
    this.renewTime = mode == "M"? 7 : 1;
    if(!this.DB){
      return {Success: false};
    }
    return {Success: true};
  }

  /**
   * Get the entire DBName by entering time flag
   * @param {String} flag 
   */
  static DBNameByFlag(flag = null){
    let dbName = this.DBName + (flag? flag : this.CurrentFlag());
    return dbName;
  }

  /**
   * Return flag
   */
  static CurrentFlag(){
    let now = Time.Now();
    let flag = now.format(this.mode == "M" ? "YYYYMM" : "YYYYMMDD");
    return flag;
  }

  /**
   * Return current DBName
   */
  static CurrentDBName(){
    let dbName = this.DBName + this.CurrentFlag();
    return dbName;
  }

  /**
   * Return DBName at specific time
   * @param {moment.Moment} moment 
   */
  static DBNameAt(moment){
    let dbName = this.DBName 
      + moment.format(this.mode == "M" ? "YYYYMM" : "YYYYMMDD");
    return dbName;
  }

  /**
   * Create new DB if not exists
   * @param {String} dbName 
   */
  static async CreateDB(dbName){
    await this.ReInit();
    if(this.dbnames.includes(dbName)) return;
    let res = await this.DB.CreateDrawer(dbName, {noMSG: true});
    if(res.Success){
      await this.AddDesignDoc(dbName);
      await this.Renew();
    }
    return res;
  }

  /**
   * Add default create time design doc for sorting
   * @param {String} dbName 
   */
  static async AddDesignDoc(dbName){
    await this.ReInit();
    let payload = DDGen("inTime");
    let res = await this.DB.Insert(dbName, payload);
    return res;
  }

  /**
   * Insert / Update documents to current database
   * @note It will update the field 'inTime' to current timestamp
   * @param {*} doc 
   */
  static async Insert(doc){
    try{
      await this.Update();
      let dbName = this.CurrentDBName();
      doc = {
        ...doc,
        inTime: Time.Now().toISOString() //MongoDB cannot auto convert to ISO string
      };
      if(doc._rev) delete doc._rev;
      await this.CheckClear();
      await this.CreateDB(dbName);
      let res = await this.DB.Update(dbName, doc);  
        
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
  static async Doc(ID, timeFlag = null){
    await this.ReInit();
    try{
      let dbName = this.DBNameByFlag(timeFlag);
      let res = await this.DB.getDocQ(dbName, ID);
      if(res.Success){
        let doc = res.payload;
        return doc;
      }
    }catch(e){
      console.log("HI");
      return null;
    }
    return null;
  }

  /**
   * Check whether the existing databases expired and can be deleted, then delete it
   */
  static async CheckClear(){
    await this.ReInit();
    let now = Time.Now();
    let destroyed = false;
    await Promise.all(_.map(this.dbnames, async (o, i) => {
      let str = o.replace(this.DBName, "");
      let m = moment(str, (this.mode == "M" ? "YYYYMM" : "YYYYMMDD"));
      
      if(now.diff(m, this.mode == "M"? "months": "days") > this.keep){
        await this.DB.DestroyDatabase(o);
        destroyed = true;
      }
    }));
    if(destroyed){
      await this.Renew();
    }
  }

  /**
   * 
   * @param {moment.Moment} from 
   * @param {moment.Moment} to 
   */
  static async DocsWithin(from, to){
    await this.ReInit();
    let beginInterval = moment(from.format(this.mode == "M" ? "YYYYMM" : "YYYYMMDD"));
    let endInterval = moment(to.format(this.mode == "M" ? "YYYYMM" : "YYYYMMDD"));

    let docs = [];
    let res;
    let cur = beginInterval;

    do {
      console.log(cur.format("YYYYMM"));
      res = await this.ListAt(cur, {$and: [{inTime: { $gte: from }}, {inTime: { $lte: to }}]}, "asc");
      if(res.Success){
        docs.push(...res.payload);
      }
      if(this.mode == "M"){
        cur.add(1, "months");
      }else{
        cur.add(1, "days");
      }
    }while(cur <= endInterval);

    return docs.reverse();

  }

  /**
   * 
   * @param {moment.Moment} interval 
   * @param {String} sort 
   */
  static async ListAt(interval, selector = {inTime: { $gte: 0 }}, sort = "desc"){
    await this.ReInit();
    
    let dbname = this.DBNameAt(interval);
    let _sort = [{ inTime: sort }];
    let rtn = await this.DB.Find(dbname, selector, undefined, undefined, undefined, _sort);
    return rtn;
  }

  static async ListAll(){
    let res = await this.DB.GetAllDrawers();
    if(!res.Success){
      return {
        Success: false,
        payload: "Cannot list all dbs."
      };
    }
    let allDBNames = res.payload;
    let filtered = _.filter(allDBNames, o => o.startsWith(this.DBName));

    let allPayload = [];
    for(let i=0; i<filtered.length; i++){
      let dbname = filtered[i];
      res = await this.DB.List2Docs(dbname);
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

module.exports = ExpirableDB;