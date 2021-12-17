const BaseClass = require("../../BaseClass");
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
   * @param {*} config 
   * @param {{
   *   Include?: "All" | [String],
   *   Exclude?: [String]
   * }} backup
   * @param {String} backupDir
   * @param {*} option
   */
  constructor(config, backup, option = {}){
    super();
    this.backup = backup;
    this.config = config;
    this.backupPath = "./ΩRUNTIME/_backup/";
  }

  /** 
   * @returns {Promise<Db | nano.ServerScope | Cloudant.ServerScope>}
   */
  async Connect(){
    if(!this.CLIENT){
      this.CLIENT = await this.createClient();
    }
    return this.CLIENT;
  }

  /**
   * @override
   * @returns {MongoClient | nano.ServerScope | Cloudant.ServerScope}
   * Create Client Instance
   */
  async createClient(){
    throw ZError.NotImplemented;
  }

  /**
   * @override
   * @param {String} drawerName
   * @param {Boolean} noMSG
	 * @param {*} option 
   * @returns {Promise<{
   *  Success: Boolean, 
   *  payload: *
   * } | {
   *  Success: Boolean, 
   *  payload: {
   *    Message: String, 
   *    Error: *
   * }}>}
   */
  async CreateDrawer(drawerName, noMSG = false, option = {}){
    throw ZError.NotImplemented;
  }

  /**
   * @override
   * @param {String} drawerName
   * @param {Boolean} noMSG
	 * @param {*} option 
   * @returns {Promise<{
   *  Success: Boolean, 
   *  payload: *
   * } | {
   *  Success: Boolean, 
   *  payload: {
   *    Message: String, 
   *    Error: *
   * }}>}
   */
  async DestroyDrawer(drawerName, noMSG = true, option = {}){
    throw ZError.NotImplemented;
  }

  /**
   * @override
   * @param {Boolean} noMSG
	 * @param {*} option 
   * @returns {Promise<{
   *  Success: Boolean, 
   *  payload: [String]
   * } | {
   *  Success: Boolean, 
   *  payload: {
   *    Message: String, 
   *    Error: *
   * }}>}
   */
  async GetAllDrawers(noMSG = false, option = {}){
    throw ZError.NotImplemented;
  }

  /**
   * @override
   * @param {String} drawerName
   * @param {*} option 
   * @returns {Promise<{
   *  Success: Boolean, 
   *  payload: *
   * } | {
   *  Success: Boolean, 
   *  payload: {
   *    Message: String, 
   *    Error: *
   * }}>}
   */
  async Info(drawerName, option = {}){
    throw ZError.NotImplemented;
  }

  /**
   * @override
   * @param {String} drawerName
   * @param {*} option 
   * @returns {Promise<{
   *  Success: Boolean, 
   *  payload: Number
   * } | {
   *  Success: Boolean, 
   *  payload: {
   *    Message: String, 
   *    Error: *
   * }}>}
   */
  async DocCount(drawerName, option = {}){
    throw ZError.NotImplemented;
  }

  /**
   * @override
   * @param {String} drawerName
   * @param {*} option 
   * @returns {Promise<{
   *  Success: Boolean, 
   *  payload: [*]
   * } | {
   *  Success: Boolean, 
   *  payload: {
   *    Message: String, 
   *    Error: *
   * }}>}
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
   * @returns {Promise<{
   *  Success: Boolean, 
   *  payload: [*]
   * } | {
   *  Success: Boolean, 
   *  payload: {
   *    Message: String, 
   *    Error: *
   * }}>}
   */
  async Find(drawerName, selector = {}, offset = 0, limit = Number.MAX_SAFE_INTEGER, fields = [], sort = [], option = {}){
    throw ZError.NotImplemented;
  }

  async FindAndListFields(drawerName, fields, option = {}){
    return await this.Find(drawerName, {}, 0, Number.MAX_SAFE_INTEGER, fields, [], option);
  }

  /**
   * @override
   * @param {String} drawerName 
   * @param {*} selector 
   * @param {*} option 
   * @returns {Promise<{
   *  Success: Boolean, 
   *  payload: *
   * } | {
   *  Success: Boolean, 
   *  payload: {
   *    Message: String, 
   *    Error: *
   * }}>}
   */
  async FindAndDelete(drawerName, selector = {}, option = {}){
    throw ZError.NotImplemented;
  }

  /**
   * @override
   * @param {String} drawerName
   * @param {String} sql 
   * @param {*} option 
   * @returns {Promise<{
   *  Success: Boolean, 
   *  payload: [*]
   * } | {
   *  Success: Boolean, 
   *  payload: {
   *    Message: String, 
   *    Error: *
   * }}>}
   */
  async SQLQuery(drawerName, sql, option = {}){
    throw ZError.NotImplemented;
  }

  /**
   * @override
   * @param {String} drawerName
   * @param {*} doc 
   * @param {*} option 
   * @returns {Promise<{
   *  Success: Boolean, 
   *  payload: *
   * } | {
   *  Success: Boolean, 
   *  payload: {
   *    Message: String, 
   *    Error: *
   * }}>}
   */
  async Insert(drawerName, doc, option = {}){
    throw ZError.NotImplemented;
  }

  /**
   * @override
   * @param {String} drawerName 
   * @param {[*]} docs 
   * @param {*} option 
   * @returns {Promise<{
   *  Success: Boolean, 
   *  payload: *
   * } | {
   *  Success: Boolean, 
   *  payload: {
   *    Message: String, 
   *    Error: *
   * }}>}
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
   * @returns {Promise<{
   *  Success: Boolean, 
   *  payload: *
   * } | {
   *  Success: Boolean, 
   *  payload: {
   *    Message: String, 
   *    Error: *
   * }}>}
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
   * @returns {Promise<{
   *  Success: Boolean, 
   *  payload: *
   * } | {
   *  Success: Boolean, 
   *  payload: {
   *    Message: String, 
   *    Error: *
   * }}>}
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
   * @returns {Promise<{
   *  Success: Boolean, 
   *  payload: *
   * } | {
   *  Success: Boolean, 
   *  payload: {
   *    Message: String, 
   *    Error: *
   * }}>}
   */
  async Delete(drawerName, id, rev = null, option = {}){
    throw ZError.NotImplemented;
  }

  /**
   * @override
   * @param {String} drawerName
   * @param {*} docs 
   * @param {*} option 
   * @returns {Promise<{
   *  Success: Boolean, 
   *  payload: *
   * } | {
   *  Success: Boolean, 
   *  payload: {
   *    Message: String, 
   *    Error: *
   * }}>}
   */
  async DeleteMany(drawerName, docs = [], option = {}){
    throw ZError.NotImplemented;
  }

  /**
   * @override
   * @param {String} drawerName 
   * @param {*} option 
   * @returns {Promise<{
   *  Success: Boolean, 
   *  payload: *
   * } | {
   *  Success: Boolean, 
   *  payload: {
   *    Message: String, 
   *    Error: *
   * }}>}
   */
  async DeleteAll(drawerName, option = {}){
    throw ZError.NotImplemented;
  }

  /**
   * @override
   * @param {String} dbName 
   * @param {String} id 
   * @param {*} option 
   * @returns {Promise<{
   *  Success: Boolean, 
   *  payload: *
   * } | {
   *  Success: Boolean, 
   *  payload: {
   *    Message: String, 
   *    Error: *
   * }}>}
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
   * @returns {Promise<{
   *  Success: Boolean, 
   *  payload: *
   * } | {
   *  Success: Boolean, 
   *  payload: {
   *    Message: String, 
   *    Error: *
   * }}>}
   */
  async Backup(option = {}){
    throw ZError.NotImplemented;
  }

  /**
   * @override
   * @param {*} option 
   * @returns {Promise<{
   *  Success: Boolean, 
   *  payload: *
   * } | {
   *  Success: Boolean, 
   *  payload: {
   *    Message: String, 
   *    Error: *
   * }}>}
   */
  async Restore(option = {}){
    throw ZError.NotImplemented;
  }

  /**
   * @override
   * @param {*} errorObj
   * @returns {{
   *  Success: Boolean,
   *  errCode: Number,
   *  errName: String,
   *  Message: String 
   * }}
   */
  ErrorX(errorObj){
    throw ZError.NotImplemented;
  }
}

module.exports = Database;