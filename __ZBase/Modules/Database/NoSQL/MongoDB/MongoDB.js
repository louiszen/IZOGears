const _config = require('$/__SYSDefault/SYSConfig');

const { MongoClient, Db } = require('mongodb');
const NoSQLDB = require('../NoSQLDB');
const _ = require('lodash');
const { v4 } = require('uuid');

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
    return await super.Connect();
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
	async DestroyDatabase(dbName, option = {noMSG: true}){
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
			let rtn = await client.listCollections().toArray();
			rtn = _.map(rtn, o => o.name);
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
			let colection = client.collection(dbName);
			let rtn = await colection.stats();
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
			let collection = client.collection(dbName);
			let res = await collection.find({}).toArray();
			let rtn = [];

			_.map(res, (o, i) => {
				//filter out design doc
				if(!o._id.startsWith("_")){
					rtn.push(o);
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
			let collection = client.collection(dbName);
			let rtn = await collection.find(selector).limit(limit).skip(skip).toArray();
			return {Success: true, payload: rtn};

		}catch(e){
			let msg = "Find Error (" + dbName + ") :: " + e.message;
			console.error(this.CLog(msg, '[x]'));
			return {Success: false, payload: {Message: msg, Error: e}};
		}
	}

	/**
	 * Find and delete docs
	 * @param {String} dbName 
	 * @param {*} selector 
	 */
	 async FindAndDelete(dbName, selector = {}){
		try{
			let res = await this.Find(dbName, selector);
			let docs = res.payload && res.payload.docs;

			if(docs.length == 0){
				console.log(this.CLog(dbName + " :: No documents is found.", "[!]"));
				return {Success: true, payload: "No documents to deleted."};
			}

			let rtn = await this.DeleteBulk(dbName, docs);
			if(!rtn.Success){
				throw new Error();
			}
			console.log(this.CLog(dbName + " :: " + docs.length + " documents are deleted.", "[v]"));

			return {Success: true, payload: rtn};

		}catch(e){
			let msg = "FindAndDelete Error (" + dbName + ") :: " + e.message;
			console.error(this.CLog(msg, '[x]'));
			return {Success: false, payload: {Message: msg, Error: e}};
		}
	}

	/**
	 * nano.db.use.insert
	 * @param {String} dbName 
	 * @param {*} doc 
	 */
	 async Insert(dbName, doc){
		try{
      let client = await this.Connect()
			let collection = client.collection(dbName);
			if(!doc._id){
				doc._id = v4();
			}
			let rtn = await collection.insertOne(doc);
			if(!rtn.acknowledged){
				let msg = "Insert Conflict (" + dbName + ")";
				console.error(this.CLog(msg, '[x]'));
				return {Success: false, payload: rtn};  
			}else{
				return {Success: true, payload: rtn};  
			}
					
		}catch(e){
			let msg = "Insert Error (" + dbName + ") :: " + e.message;
			console.error(this.CLog(msg, '[x]'));
			return {Success: false, payload: {Message: msg, Error: e}};
		}
	}

	/**
	 * nano.db.use.bulk
	 * Automatically split documents if it exceeds the file transfer limit
	 * @param {String} dbName 
	 * @param {[*]} docs 
	 */
	 async InsertBulk(dbName, docs = []){
		if(docs.length == 0) return {Success: true, payload: 'No Doc Input.'};

		try {
      let client = await this.Connect();
			let collection = client.collection(dbName);

			_.map(docs, (o, i) => {
				if(!o._id){
					o._id = v4();
				}
			});

			let rtn = await collection.insertMany({docs: docs});

			let successCount = 0;
			_.map(rtn, (o, i) => {
				if(o.ok) 
					successCount++;
			});

			console.log(this.CLog(dbName + " InsertBulk OK. ( " + successCount + " / " + docs.length + " ) successfully inserted."));
			return {Success: true, payload: rtn};

		}catch(e){
			if (e.statusCode == 413) {
				// Too Large
				console.log(this.CLog("Entity Too Large, chop into two halves and try again (" + dbName +")", '[!]'));
				let mid = Math.round(docs.length / 2);
				let first = docs.slice(0, mid);
				let second = docs.slice(mid);

				let firstRes = await this.InsertBulk(dbName, first);
				let secondRes = await this.InsertBulk(dbName, second);

				let payload = {};
				if(firstRes.Success && secondRes.Success){
					payload = firstRes.payload.concat(secondRes.payload);
				}
				return {Success: true, payload: payload};

			}else{
				let msg = "InsertBulk Error (" + dbName + ") :: " + e.message;
				console.error(this.CLog(msg, '[x]'));
				return {Success: false, payload: {Message: msg, Error: e}};
			}
		}
	}

	/**
	 * Get and check if the document need to update, if yes, replace it. Or if it does not exists, insert?
	 * See also: getDocQ, Insert
	 * @param {String} dbName 
	 * @param {*} doc 
	 * @param {Boolean} insert 
	 * @returns {Promise<{
   *  Success: Boolean,
   *  payload: nano.DocumentInsertResponse
   * } | {
   *  Success: Boolean,
   *  payload: {
   *    Message: String,
   *    Error: *
   *  }
   * }>}
	 */
	async Update(dbName, doc, insert = true){
		try{
			let res = await this.getDocQ(dbName, doc._id, false);
			let rtn = {};
			if(res.Success){
				let docInDB = res.payload;
				
				if(docInDB){
					doc._rev = docInDB._rev;
					if (_.isEqual(doc, docInDB)){
						let msg = "No need to update. (" + dbName + ") : " + doc._id;
						console.log(this.CLog(msg, '[!]'));
						return {Success: true, payload: msg};
					}
	
					let client = await this.Connect()
					let collection = client.collection(dbName);
					let rtn = await collection.replaceOne({_id: doc._id}, doc);
					return {Success: rtn.acknowledged, payload: rtn};
				}
			}
			
			if(insert){
				rtn = await this.Insert(dbName, doc); 
				return rtn;
			}

			let msg = "Doc not found " + doc._id +  " (" + dbName + ")";
			console.error(this.CLog(msg, '[x]'));
			return {Success: false, payload: {Message: msg}};
		}catch(e){
			let msg = "Update Error (" + dbName + ") :: " + e.message;
			console.error(this.CLog(msg, '[x]'));
			return {Success: false, payload: {Message: msg, Error: e}};
		}
	}

	/**
	 * Get and check if the document need to update, if yes, replace it. Or if it does not exists, insert?
	 * See also: getDocQ, InsertBulk
	 * @param {String} dbName 
	 * @param {[*]} docs 
	 * @param {Boolean} insert 
	 */
	 async UpdateBulk(dbName, docs = [], insert = true, blockProcessIfNotExist = false){
		if(docs.length == 0) return {Success: true, payload: 'No Doc Input.'};

		try{
			let docsInDB = [];
			await Promise.all(_.map(docs, async (o, i) => {
				let res = await this.getDocQ(dbName, o._id, false);
				if(res.Success){
					docsInDB.push(res.payload);
				}
			}));

			console.log(this.CLog("No. of Docs found in DB : " + docsInDB.length));

			let insertCount = 0;
			let dropCount = 0;
			let ignoreCount = 0;
			let docsNeedUpdate = [];
			
			_.map(docs, (o, i) => {
				let docInDB = docsInDB.find(v => v._id === o._id);

				if(docInDB){
					o._rev = docInDB._rev;
					if (!_.isEqual(o, docInDB)){
						docsNeedUpdate.push(o);
						return;
					}
					ignoreCount++;
					return;
				}

				if(insert){
					insertCount++;
					docsNeedUpdate.push(o);
					return;
				}else{
					dropCount++;
					return;
				}

			});

			if(blockProcessIfNotExist && !insert && dropCount > 0){
				let msg = "ID missing. Update blocked.";
				console.log(this.CLog(msg, "[!]"));
				return {Success: false, payload: msg};
			}

			console.log(this.CLog('Update ' + docsNeedUpdate.length + ' of ' + docs.length + ", ignored " + ignoreCount + " ..." 
				+ (insert? ' insert ' + insertCount + ' records': ' drop ' + dropCount + ' records') +  " (" + dbName + ")"));

			if(docsNeedUpdate.length > 0){
				let filterednum = docs.length - docsNeedUpdate.length;
				console.log(this.CLog('Number of Docs remains unchanged: ' + filterednum + " (" + dbName + ")"));
				if(!insert){
					console.log(this.CLog('Number of Docs cannot find in database: ' + insertCount + " (" + dbName + ")", '[!]'));
				}
				let res = await this.InsertBulk(dbName, docsNeedUpdate);

				if(res.Success){
					return {
						Success: true,
						payload: {
							docs: res.payload,
							Count: {
								Insert: insertCount,
								Ignore: ignoreCount,
								Drop: dropCount
							}
						}
					};
				}else{
					return {Success: false, payload: res.payload};
				}
				
			}else{
				return {Success: true, payload: 'No Need to Update.'};
			}
		}catch(e){
			let msg = "Updatebulk Error (" + dbName + ") :: " + e.message;
			console.error(this.CLog(msg, '[x]'));
			return {Success: false, payload: {Message: msg, Error: e}};
		}
	}

	/**
	 * mark the document as _deleted: true
	 * See also: nano.db.use.bulk
	 * @param {String} dbName 
	 * @param {String} id 
	 * @param {String} rev 
	 */
	 async Delete(dbName, id, rev = null){
		try {

			let payload = [];

			if(rev == null){
				let res = await this.getDocQ(dbName, id);
				let docInDB = res.payload;

				payload = [
					{
						_id: id,
						_rev: docInDB._rev,
						_deleted: true
					}
				];

			}else{
				payload = [
					{
						_id: id,
						_rev: rev,
						_deleted: true
					}
				];
			}

      let client = await this.Connect();
			let collection = client.collection(dbName);
			let rtn = await collection.deleteMany({_id: {$eq: id }});
			console.log(this.CLog("Record _id: " + id + " Deleted"));
			return {Success: true, payload: rtn};

		}catch(e){
			let msg = "Delete Error (" + dbName + ", ID: " + id + ") :: " + e.message;
			console.error(this.CLog(msg, '[x]'));
			return {Success: false, payload: {Message: msg, Error: e}};
		}
	}

	/**
	 * mark the documents as _deleted: true
	 * See also: nano.db.use.bulk
	 * @param {String} dbName 
	 * @param {[*]} docs 
	 */
	 async DeleteBulk(dbName, docs = []){
		if(docs.length == 0) return {Success: true, payload: []};
		try {
			let payload = _.map(docs, (o, i) => {
				return {
					_id: o._id || o.id,
					_rev: o._rev || o.rev,
					_deleted: true
				}
			});

      let client = await this.Connect();
			let collection = client.collection(dbName);
			let rtn = await collection.deleteMany({docs: payload});
			let okCount = _.countBy(rtn, (o, i) => o.ok);
			console.log(this.CLog("DeleteBulk Return (" + dbName + "): " + okCount.true + " / " + docs.length));
			return {Success: true, payload: rtn};

		}catch(e){
			let msg = "DeleteBulk Error (" + dbName + ") :: " + e.message;
			console.error(this.CLog(msg, '[x]'));
			return {Success: false, payload: {Message: msg, Error: e}};
		}
	}

	/**
	 * List and mark all the documents in dbName as _deleted: true
	 * See also: nano.db.use.list, DeleteBulk
	 * @param {String} dbName 
	 */
	 async DeleteAll(dbName){
		try{

			console.log(this.CLog("Delete ALL docs from " + dbName));

      let client = await this.Connect();
			let colection = client.collection(dbName);
			let rtn = await colection.deleteMany({});
			let payload = _.map(rtn.rows, (o, i) => {
				return {
					id: o.id,
					rev: o.value.rev
				}
			});

			return this.DeleteBulk(dbName, payload);
			
		}catch(e){
			let msg = "DeleteAll Error (" + dbName + ") :: " + e.message;
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
			let collection = client.collection(dbName);
			let rtn = await collection.findOne({_id: id});
			if(!rtn) throw new Error("Cannot find " + id);
			return {Success: true, payload: rtn};
		}catch(e){
			let msg = "Cannot get doc " + id + " from " + dbName + " :: " + e.message;
			if(debug) console.error(this.CLog(msg, '[x]'));
			return {Success: false, payload: {Message: msg, Error: e}};
		}
	}

	/**
	 * Automatically backup the current version of CouchDB to (this.backupDir + this.env + '/CouchDB')
	 */
	 async Backup() {

    let datetime = Time.Now().format('YYYYMMDDHHmmss');

		let dest = this.backupPath + this.env + '/' + datetime
		
		let outfname = dest + "/CouchDB.tar.gz";

		let rtn, allDBs;
		rtn = await this.GetAllDatabases();
		if(rtn.Success){
			allDBs = rtn.payload;
		}else{
			return {Success: false, payload: rtn.payload};
		}

		let pack = tarstream.pack();

		try{
			await Promise.all(_.map(allDBs, async (o, i) => {
        if(this.backup.Include){
          if(this.backup.Include === "All"){

          }else	if(!this.backup.Include.includes(o)){
						console.log(this.CLog('Excluded: ' + o));
						return;
					} 
				}
				else if(this.backup.Exclude.includes(o)) {
					console.log(this.CLog('Excluded: ' + o));
					return;
				}
				let params = {include_docs: true};
			
				let filename = o.replace(/[^a-z0-9-_]+/ig, '_') + '.json';

        let client = await this.Connect();
				let db = client.use(o);
				rtn = await db.list(params);
				pack.entry({name: filename}, JSON.stringify(rtn));  
				return;
			}));
		}catch(e){
			let msg = "Backup Error";
			console.error(this.CLog(msg, '[x]'));
			return {Success: false, payload: {Message: msg, Error: e}};
		}
		pack.finalize();

		let gzipStream = zlib.createGzip();
		pack.pipe(gzipStream);
		await Fs.mkdir(dest).catch(console.error);

		let fsStream = Fs.createWriteStream(outfname);
		gzipStream.pipe(fsStream)

		console.log(this.CLog('Backup ' + this.env + ' to ' + outfname));

		return {Success: true, payload: ""};
	}

	/**
	 * Restore specified version (datetime) to specified environment
	 * @param {String} srcEnv 
	 * @param {String} datetime 
	 */
	async Restore(srcEnv, datetime){

		let fname = this.backupPath + srcEnv + '/' + datetime + '/CouchDB.tar.gz';
		let tempdir = './ΩRUNTIME/_temp';

		let unpack = util.promisify(targz.decompress);

		console.log(this.CLog('Restore ' + this.env + ' from ' + fname));
		let res = {};

		try{
			await Fs.rmdir(tempdir);
			await unpack({
				src: fname,
				dest: tempdir
			});

			let files = await Fs.readdir(tempdir);
			
			await Promise.all(_.map(files, async(o, i) => {

				let basename = path.basename(o, '.json');

				let f = await Fs.readFile(tempdir + '/' + o);
				let fjson = JSON.parse(f);
				let rows = _.map(fjson.rows, (v, x) => {
					return {
						...v.doc,
						_rev: undefined,
						_attachments: undefined
					}
				})

				//Remove DB
				res[basename] = {};

				res[basename].Destory = await this.DestroyDatabase(basename);
				if(!res[basename].Destory.Success){
					console.log(this.CLog("Database " + basename + " not exists", '[!]'));
				}

				//Create DB
				res[basename].Create = await this.CreateDatabase(basename);
				if(!res[basename].Create.Success){
					return {Success: false, payload: res[basename].Create.payload};
				}
				
				//Restore
				res[basename].Insert = await this.InsertBulk(basename, rows);
				if(!res[basename].Insert.Success){
					return {Success: false, payload: res[basename].Insert.payload};
				}

				return {Success: true};

			}));

			//Clear Temp
			await Fs.rmdir(tempdir);

			let success = true;
			let errors = [];
			_.map(res, (o, i) => {
				success = success || o.Success;
				if(!o.Success){
					errors.push(o.payload);
				}
			});

			if(success){
				console.log(this.CLog("Database Successfully Restored", "[<][o]", "<<"));
				return {Success: true, payload: ""};
			}else{
				return {Success: false, payload: {Message: "Restore Error", Error: errors}};
			}
			
		}catch(e){
			let msg = "Restore failed";
			console.error(this.CLog(msg, '[x]'));
			return {Success: false, payload: {Message: "Restore failed", Error: e}};
		}
	}

}

module.exports = MongoDB;