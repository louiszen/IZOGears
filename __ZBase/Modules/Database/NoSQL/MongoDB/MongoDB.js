const _config = require('$/__SYSDefault/SYSConfig');

const BaseClass = require("$/IZOGears/__ZBase/BaseClass");
const { MongoClient, Db } = require('mongodb');
const NoSQLDB = require('../NoSQLDB');

class MongoDB extends NoSQLDB{

  /**
   * @param {String} env 
   * @param {{
   *   envs: Object.<string, {
   *     ConnectString: String,
   *     DATABASE: String
   *   } | {
   *     BASE: String,
   *     USERNAME: String,
   *     PASSWORD: String,
   *     URL: String,
   *     DATABASE: String
   *   }>
   * }} config 
   * @param {{
   *   Include?: "All" | [String],
   *   Exclude?: [String]
   * }} backup
   * @param {String} backupDir
   * @param {{
   *  Cloudant: Boolean
   * }} option
   */
  constructor(env, config, backup, option = {}){
    super(env, config, backup, option);

    let envConfig = config.envs[env];
    if(envConfig.ConnectString){
      this.connectURL = envConfig.ConnectString;
    }else{
      let {BASE, USERNAME, PASSWORD, URL} = envConfig;
      this.connectURL = (BASE || "mongodb+srv://") + USERNAME + ":" + PASSWORD + "@" + URL;  
    }

    this.DATABASE = envConfig.DATABASE;
    
    console.log(this.CLog("MongoDB Connected to [" + this.DATABASE + "]@ " + this.connectURL));	
  } 

  /** 
   * @returns {Db}
   */
   async Connect(){
    let client = await super.Connect();
  }

  /**
   * 
   * @returns {Db}
   */
  async createClient(){
    let client = new MongoClient(this.connectURL);
    let db = await client.connect();
    return db.db(this.DATABASE);
  }

  /**
   * Create Database if not exists
   * @param {String} dbName 
   * @param {{noMSG: Boolean}} option  
   */
   async CreateDatabase(dbName, option = {noMSG: false}){
    try{
      let client = await this.Connect();
      let rtn = await client.createCollection(dbName);
			console.log(this.CLog(dbName + " created."));
			return {Success: true, payload: rtn};
		}catch(e){
			let msg = "Cannot Create Database (" + dbName + ") :: " + e.message;
			if(!option.noMSG) console.error(this.CLog(msg, '[x]'));
			return {Success: false, payload: {Message: msg, Error: e}};
		}
  }

  /**
	 * Destroy Database if exists
	 * @param {String} dbName 
	 * @param {{noMSG: Boolean}} option 
	 */
	async DestroyDatabase(dbName, option = {noMSG: false}){
		try{
      let client = await this.Connect();
			let rtn = await client.dropCollection(dbName);
			console.log(this.CLog(dbName + " destroyed."));
			return {Success: true, payload: rtn};
		}catch(e){
			let msg = "Cannot Destroy Database (" + dbName + ") :: " + e.message;
			if(!option.noMSG) console.error(this.CLog(msg, '[!]'));
			return {Success: false, payload: {Message: msg, Error: e}};
		}
	}

  /**
	 * nano.db.list
	 * @param {{noMSG: Boolean}} option 
	 */
	async GetAllDatabases(option = {noMSG: true}){
		try{
      let client = await this.Connect();
			let rtn = await client.listCollections();
			rtn = rtn.filter(o => !o.startsWith("_"));
			if(!option.noMSG) console.log(this.CLog("All Databases Listed."));
			return {Success: true, payload: rtn};
		}catch(e){
			let msg = "Cannot List All Databases :: " + e.message;
			console.error(this.CLog(msg, '[x]'));
			return {Success: false, payload: {Message: msg, Error: e}};
		}
	}

  /**
	 * nano.db.get
	 * @param {String} dbName 
	 */
	async Info(dbName){
		try{
      let client = await this.Connect();
			let rtn = await client.collection(dbName).stats();
			return {Success: true, payload: rtn};
		}catch(e){
			let msg = "Info Error  (" + dbName + ") :: " + e.message;
			console.error(this.CLog(msg, '[x]'));
			return {Success: false, payload: {Message: msg, Error: e}};
		}
	}

  /**
	 * Count the number of docs (exclude design doc)
	 * @param {dbName} dbName
	 */
	async DocCount(dbName){
		try {
			let rtn = await this.Find(dbName, {}, 0, Number.MAX_SAFE_INTEGER, ["_id"]);
			return {Success: true, payload: {doc_count: rtn.payload.docs.length}};
		}catch(e){
			let msg = "DocCount Error (" + dbName + ") :: " + e.message;
			console.error(this.CLog(msg, '[x]'));
			return {Success: false, payload: {Message: msg, Error: e}};
		}
	}

  /**
	 * List all documents (exclude Design doc)
	 * @param {String} dbName 
	 */
	async List2Docs(dbName){

		try{
      let client = await this.Connect();
			let res = await client.collection(dbName).find(_ => true).toArray();
			let rtn = [];

			_.map(res.rows, (o, i) => {
				//filter out design doc
				if(!o.doc._id.startsWith("_")){
					rtn.push(o.doc);
				}
			});

			return {Success: true, payload: rtn};
		}catch(e){
			let msg = "List Error (" + dbName + ") :: " + e.message;
			console.error(this.CLog(msg, '[x]'));
			return {Success: false, payload: {Message: msg, Error: e}};
		}
	}

  /**
	 * nano.db.use.find
	 * @param {String} dbName 
	 * @param {Number} skip 
	 * @param {Number} limit 
	 * @param {[String]} fields 
	 * @param {[String]} sort 
	 * @param {*} selector 
	 */
	async Find(dbName, selector = {}, skip = 0, limit = Number.MAX_SAFE_INTEGER, fields = [], sort = []){
		try {
      let client = await this.Connect();
			let rtn = await client.collection(dbName).find(selector).limit(limit).skip(skip);
			return {Success: true, payload: rtn};

		}catch(e){
			let msg = "Find Error (" + dbName + ") :: " + e.message;
			console.error(this.CLog(msg, '[x]'));
			return {Success: false, payload: {Message: msg, Error: e}};
		}
	}

  /**
	 * nano.db.use.get
	 * Queue and get the document
	 * @param {String} dbName 
	 * @param {String} id 
	 * @param {Boolean} debug 
	 */
	async getDoc(dbName, id, debug = true){
		try{
      let client = await this.Connect();
			let rtn = await client.collection(dbName).find(ObjectId(id));
			return {Success: true, payload: rtn};
		}catch(e){
			let msg = "Cannot get doc " + id + " from " + dbName + " :: " + e.message;
			if(debug) console.error(this.CLog(msg, '[x]'));
			return {Success: false, payload: {Message: msg, Error: e}};
		}
	}

}

module.exports = MongoDB;