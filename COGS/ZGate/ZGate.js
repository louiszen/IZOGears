const _remote = require("$/remoteConfig");
const SYSConfig = require("$/__SYSDefault/SYSConfig");
const { RemoteStorage } = require("$/IZOGears/_CoreWheels/Extensible");
const Authenticator = require("./Authentication/Authenticator");
const SysUsers = require("./SysUsers");
const LSignIn = require("$/IZOGears/COGS/Log/LSignIn");
const Authorizer = require("./Authorization/Authorizer");
const { v1 } = require("uuid");

class ZGate extends RemoteStorage{

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
      DBName: "xcmsgate", 
      keep: SYSConfig.LogKeep.Gate, 
      mode: "M"
    });
  }

  /**
   * 
   * @param {String} username 
   * @returns 
   */
  static async HasUser(username){
    return await SysUsers.HasUser(username);
  }

  /**
   * 
   * @param {String} username 
   * @returns 
   */
  static async GetUser(username){
    return await SysUsers.GetUser(username);
  }

  /**
   * 
   * @param {String} username 
   * @returns 
   */
  static async GetDisplayName(username){
    return await SysUsers.GetDisplayName(username);
  }

  static async SignIn(params){
    let success = await Authenticator.SignIn(params);
    await LSignIn.Write(params.username, "SignIn", success);
    return success;
  }

  static NeedTwoFactor(){
    return Authenticator.NeedTwoFactor();
  }

  static async SendTwoFactor(username){
    let res = await Authenticator.SendTwoFactor(username);
    let {Success, payload} = res;
    if(Success){
      await this.Push("TwoFactor", username, payload);
      return true;
    }
    return false;
  }

  static async Prove(params){

  }

  /**
   * 
   * @param {{
   *  username: String,
   *  password: String,
   *  UserDisplayName: String,
   *  Version: Number,
   *  Level: Number,
   *  authority: *
   * }} user 
   * @returns 
   */
  static async Grant(user){
    let seed = v1();
    await this.Set(user.username, "Seed", seed);
    return await Authorizer.Grant(user, seed);
  }

  /**
   * 
   * @param {*} params
   * @returns {Promise<{
   *  Success: Boolean, 
   *  payload: String
   * }}>} 
   */
  static async Validate(params){
    let res = await Authorizer.Validate(params);
    if(res.Success){
      //verify Seed
      let {username, seed} = res.payload;
      let seedInDB = await this.Get(username, "Seed");
      if(seed === seedInDB){
        return {
          Success: true,
          payload: username
        };
      }
      return {
        Success: false,
        payload: "Seed Not Match"
      };
    }else{
      return {
        Success: false,
        payload: res.payload.error
      };
    }
    
  }

  static async HasAuthority(params){

  }




}

module.exports = ZGate;