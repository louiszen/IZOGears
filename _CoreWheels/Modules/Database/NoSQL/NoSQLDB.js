const { ZError } = require("$/IZOGears/_CoreWheels/Utils");
const Database = require("../Database");

/**
 * Drawers: 
 * Database for CouchDB
 * Collection for MongoDB
 * Table for SQLDB 
 * 
 * Database:
 * Database for CouchDB,
 * Collection for MongoDB
 * 
 * Usage:
 * Interface for all noSQL database connectors
 */
class NoSQLDB extends Database {

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
    super(env, config, backup, option);
  }

  /**
   * @readonly
   * @param {String} drawerName
   * @param {*} option 
   */
  async CreateDrawer(drawerName, option = {}){
    return await this.CreateDatabase(drawerName, option);
  }

  /**
   * @override
   * @param {String} drawerName
   * @param {*} option 
   */
  async CreateDatabase(drawerName, option = {}){
    throw ZError.NotImplemented;
  }

  /**
   * @readonly
   * @param {String} drawerName
   * @param {*} option 
   */
  async DestroyDrawer(drawerName, option = {}){
    return await this.DestroyDatabase(drawerName, option);
  }

  /**
   * @override
   * @param {String} drawerName
   * @param {*} option 
   */
  async DestroyDatabase(drawerName, option = {}){
    throw ZError.NotImplemented;
  }

  /**
   * @readonly
   * @param {*} option 
   */
  async GetAllDrawers(option = {}){
    return await this.GetAllDatabases(option);
  }

  /**
   * @override
   * @param {*} option 
   */
  async GetAllDatabases(option = {}){
    throw ZError.NotImplemented;
  }

  /**
   * @readonly
   * @param {String} drawerName 
   * @param {[*]} docs 
   * @param {*} option 
   */
   async InsertMany(drawerName, docs, option = {}){
    return await this.InsertBulk(drawerName, docs, option);
  }

  /**
   * @override
   * @param {String} drawerName 
   * @param {[*]} docs 
   * @param {*} option 
   */
  async InsertBulk(drawerName, docs, option = {}){
    throw ZError.NotImplemented;
  }

  /**
   * @readonly
   * @param {String} drawerName
   * @param {*} docs 
   * @param {Boolean} insert 
   * @param {*} option 
   */
  async UpdateMany(drawerName, docs, insert = true, option = {}){
    return await this.UpdateBulk(drawerName, docs, insert, option);
  }

  /**
   * @override
   * @param {String} drawerName
   * @param {*} docs 
   * @param {Boolean} insert 
   * @param {*} option 
   */
  async UpdateBulk(drawerName, docs, insert = true, option = {}){
    throw ZError.NotImplemented;
  }

  /**
   * @readonly
   * @param {String} drawerName
   * @param {*} docs 
   * @param {*} option 
   */
  async DeleteMany(drawerName, docs = [], option = {}){
    return await this.DeleteBulk(drawerName, docs, option);
  }

  /**
   * @override
   * @param {String} drawerName
   * @param {*} docs 
   * @param {*} option 
   */
   async DeleteBulk(drawerName, docs = [], option = {}){
    throw ZError.NotImplemented;
  }

}

module.exports = NoSQLDB;