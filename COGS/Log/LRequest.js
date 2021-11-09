const _base = require("$/IZOGears/_CoreWheels");
const _remote = require("$/remoteConfig");

const {v4} = require("uuid");
const SYSConfig = require("$/__SYSDefault/SYSConfig");

class LRequest extends _base.Extensible.ExpirableDB {

  static async Init({db} = {db: null}){
    if(!db) {
      try{
        db = await _remote.BaseDB();
      }catch(e){
        return {Success: false};
      }
    }
    return await super.Init({
      db: db, 
      DBName: "xcmsrequestlog", 
      keep: SYSConfig.LogKeep.Request, 
      mode: "D"
    });
  }

  static async Write(username, req){
    await this.ReInit();
    
    let {params, body, headers, ip} = req;
    let {action, cat, subcat} = params;
    let {host, origin, referer} = headers;

    let payload = {
      _id: v4(),
      username: username,
      action: action,
      cat: cat,
      subcat: subcat,
      url: "/" + [action, cat, subcat].join("/"),
      body: body,
      host: host,
      origin: origin,
      referrer: referer,
      ip: ip
    };
    
    try{
      let res = await this.Insert(payload);
      if(!res.Success){
        throw new Error();
      }

    }catch(e){
      console.error(this.CLog("[x]", "Cannot insert Request Log."));
    }
  }

}

module.exports = LRequest;