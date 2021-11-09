const _remote = require("$/remoteConfig");
const { ExpirableDB } = require("$/IZOGears/_CoreWheels/Extensible");
const SYSConfig = require("$/__SYSDefault/SYSConfig");
const { v4 } = require("uuid");

class LSignIn extends ExpirableDB{

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
      DBName: "xcmssigninlog", 
      keep: SYSConfig.LogKeep.SignIn, 
      mode: "D"
    });
  }

  /**
   * 
   * @param {String} username 
   * @param {"SignIn" | "SignOut"} mode 
   */
  static async Write(username, mode, success){
    await this.ReInit();

    let payload = {
      _id: v4(),
      username: username,
      action: mode,
      success: success
    };
    
    try{
      let res = await this.Insert(payload);
      if(!res.Success){
        throw new Error();
      }

    }catch(e){
      console.error(this.CLog("[x]", "Cannot insert SignIn Log."));
    }
  }

}

module.exports = LSignIn;