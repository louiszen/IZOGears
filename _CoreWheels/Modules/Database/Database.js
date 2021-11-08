const BaseClass = require("$/IZOGears/_CoreWheels/BaseClass");
const ZError = require("../../Utils/ZError");

const { default: PQueue } = require("p-queue");
// eslint-disable-next-line no-unused-vars
const { MongoClient, Db } = require("mongodb");
// eslint-disable-next-line no-unused-vars
const nano = require("nano");
// eslint-disable-next-line no-unused-vars
const Cloudant = require("@cloudant/cloudant");
const operationQ = new PQueue({ concurrency: 10 });

/**
 * Usage: 
 * Interface of all database connectors
 * 
 * Drawers: 
 * Database for CouchDB
 * Collection for MongoDB
 * Table for SQLDB 
 */
class Database extends BaseClass{

  /**
   * @param {String} env 
   * @param {{
   *   envs: Object.<string, *>
   * }} config 
   * @param {{
   *   Include?: "All" | [String],
   *   Exclude?: [String]
   * }} backup
   * @param {String} backupDir
   * @param {*} option
   */
  constructor(env, config, backup, option = {}){
    super();
    this.env = env;
    this.backup = backup;
    this.config = config;
    this.backupPath = "./ΩRUNTIME/_backup/";
  }

  /** 
   * @returns {Db | nano.ServerScope | Cloudant.ServerScope }
   */
  async Connect(){
    if(!this.CLIENT){
      this.CLIENT = await this.createClient();
    }
    return this.CLIENT;
  }

  /**
   * @override
   * @returns {MongoClient | nano.ServerScope | Cloudant.ServerScope }
   * Create Client Instance
   */
  async createClient(){
    throw ZError.NotImplemented;
  }

  /**
   * @override
   * @param {String} drawerName
   * @param {*} option 
   */
  async CreateDrawer(drawerName, option = {}){
    throw ZError.NotImplemented;
  }

  /**
   * @override
   * @param {String} drawerName
   * @param {*} option 
   */
  async DestroyDrawer(drawerName, option = {}){
    throw ZError.NotImplemented;
  }

  /**
   * @override
   * @param {*} option 
   */
  async GetAllDrawers(option = {}){
    throw ZError.NotImplemented;
  }

  /**
   * @override
   * @param {String} drawerName
   * @param {*} option 
   */
  async Info(drawerName, option = {}){
    throw ZError.NotImplemented;
  }

  /**
   * @override
   * @param {String} drawerName
   * @param {*} option 
   */
  async DocCount(drawerName, option = {}){
    throw ZError.NotImplemented;
  }

  /**
   * @override
   * @param {String} drawerName
   * @param {*} option 
   */
  async List2Docs(drawerName, option = {}){
    throw ZError.NotImplemented;
  }

  /**
   * @override
   * @param {String} drawerName
   * @param {*} selector 
   * @param {Number} offset 
   * @param {Number} limit 
   * @param {[String]} fields 
   * @param {[String]} sort 
   * @param {*} option 
   */
  async Find(drawerName, selector = {}, offset = 0, limit = Number.MAX_SAFE_INTEGER, fields = [], sort = [], option = {}){
    throw ZError.NotImplemented;
  }

  /**
   * @override
   * @param {String} drawerName 
   * @param {*} selector 
   * @param {*} option 
   */
  async FindAndDelete(drawerName, selector = {}, option = {}){
    throw ZError.NotImplemented;
  }

  /**
   * @override
   * @param {String} drawerName
   * @param {String} sql 
   * @param {*} option 
   */
  async SQLQuery(drawerName, sql, option = {}){
    throw ZError.NotImplemented;
  }

  /**
   * @override
   * @param {String} drawerName
   * @param {*} doc 
   * @param {*} option 
   */
  async Insert(drawerName, doc, option = {}){
    throw ZError.NotImplemented;
  }

  /**
   * @override
   * @param {String} drawerName 
   * @param {[*]} docs 
   * @param {*} option 
   */
  async InsertMany(drawerName, docs, option = {}){
    throw ZError.NotImplemented;
  }

  /**
   * @override
   * @param {String} drawerName 
   * @param {*} doc 
   * @param {Boolean} insert 
   * @param {*} option 
   */
  async Update(drawerName, doc, insert = true, option = {}){
    throw ZError.NotImplemented;
  }

  /**
   * @override
   * @param {String} drawerName
   * @param {*} docs 
   * @param {Boolean} insert 
   * @param {*} option 
   */
  async UpdateMany(drawerName, docs, insert = true, option = {}){
    throw ZError.NotImplemented;
  }

  /**
   * @override
   * @param {String} drawerName
   * @param {String} id 
   * @param {String} rev 
   * @param {*} option 
   */
  async Delete(drawerName, id, rev = null, option = {}){
    throw ZError.NotImplemented;
  }

  /**
   * @override
   * @param {String} drawerName
   * @param {*} docs 
   * @param {*} option 
   */
  async DeleteMany(drawerName, docs = [], option = {}){
    throw ZError.NotImplemented;
  }

  /**
   * @override
   * @param {String} drawerName 
   * @param {*} option 
   */
  async DeleteAll(drawerName, option = {}){
    throw ZError.NotImplemented;
  }

  /**
   * @override
   * @param {String} dbName 
   * @param {String} id 
   * @param {*} option 
   */
  async getDoc(dbName, id, option = {}){
    throw ZError.NotImplemented;
  }

  /**
   * @override
   * @param {String} dbName 
   * @param {String} id 
   * @param {*} option 
   */
   async getDocQ(dbName, id, option = {}){
   return await operationQ.add(() => this.getDoc(dbName, id, option));
  }

  /**
   * @override
   * @param {*} option 
   */
  async Backup(option = {}){
    throw ZError.NotImplemented;
  }

  /**
   * @override
   * @param {*} option 
   */
  async Restore(option = {}){
    throw ZError.NotImplemented;
  }
}

module.exports = Database;