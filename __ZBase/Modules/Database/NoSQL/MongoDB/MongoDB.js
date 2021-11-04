const _config = require('../../../../../_config');

const BaseClass = require("../../../BaseClass");
const { MongoClient } = require('mongodb');

class MongoDB extends BaseClass{

  constructor(env = process.env.NODE_ENV, Config = _config.Base.MongoDB, project = process.env.NODE_PROJECT){
    super();
    let dbconfig = Config.envs[env];
    
    this.url = dbconfig.BASE + dbconfig.USERNAME + ":" + dbconfig.PASSWORD + "@" + dbconfig.URL;
		console.log(this.CLog('MongoDB Connected to ' +  dbconfig.URL));	
  } 

  getDBConnector(){
    if(!this.client){
      this.client = new MongoClient(this.url);
    }
    return this.client;
  }

  async List2Docs(dbName, collection){
    await this.getDBConnector().connect();
    let db = this.getDBConnector().db(dbName);
    let col = db.collection(collection);
    let docs = await col.find().toArray();

    return docs;
  }

}

module.exports = MongoDB;