const ZError = require("../../../Utils/ZError");
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
   * @param {*} config 
   * @param {{
   *   Include?: "All" | [String],
   *   Exclude?: [String]
   * }} backup
   * @param {String} backupDir
   * @param {*} option
   */
  constructor(config, backup, option = {}){
    super(config, backup, option);
  }

  /**
   * @readonly
   * @param {String} drawerName
   * @param {Boolean} noMSG
	 * @param {*} option 
   */
  async CreateDrawer(drawerName, noMSG, option){
    return await this.CreateDatabase(drawerName, noMSG, option);
  }

  /**
   * @override
   * @param {String} drawerName
   * @param {Boolean} noMSG
	 * @param {*} option 
   */
  async CreateDatabase(drawerName, noMSG, option){
    throw ZError.NotImplemented;
  }

  /**
   * @readonly
   * @param {String} drawerName
   * @param {Boolean} noMSG
	 * @param {*} option  
   */
  async DestroyDrawer(drawerName, noMSG, option){
    return await this.DestroyDatabase(drawerName, noMSG, option);
  }

  /**
   * @override
   * @param {String} drawerName
   * @param {Boolean} noMSG
	 * @param {*} option 
   */
  async DestroyDatabase(drawerName, noMSG, option){
    throw ZError.NotImplemented;
  }

  /**
   * @readonly
   * @param {Boolean} noMSG
	 * @param {*} option 
   */
  async GetAllDrawers(noMSG, option){
    return await this.GetAllDatabases(noMSG, option);
  }

  /**
   * @override
   * @param {Boolean} noMSG
	 * @param {*} option  
   */
  async GetAllDatabases(noMSG, option){
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