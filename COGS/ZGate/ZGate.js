const _remote = require("$/remoteConfig");
const SYSConfig = require("$/__SYSDefault/SYSConfig");
const { RemoteStorage } = require("$/IZOGears/_CoreWheels/Extensible");
const Authenticator = require("./Authentication/Authenticator");
const SysUsers = require("./SysUsers");
const LSignIn = require("$/IZOGears/COGS/Log/LSignIn");
const Authorizer = require("./Authorization/Authorizer");
const { v1 } = require("uuid");
const { Accessor } = require("../../_CoreWheels/Utils");

const _ = require("lodash");

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

  static async SignOut(params){
    let res = await this.Remove(user.username);
    await LSignIn.Write(params.username, "SignOut", success);
    return res.Success;
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

  /**
   * Extract Access Level from username
   * @param {String} username 
   */
   static async UserLevel(username){
    try{
      let user = await this.GetUser(username);
      return user.Level;
    }catch(e){
      return Number.MAX_SAFE_INTEGER;
    }
  }

  /**
   * Extract Authority Tree from username
   * @param {String} jwt 
   */
  static async UserAuthority(username){
    try{
      let user = await this.GetUser(username);
      return user.authority;
    }catch(e){
      return null;
    }
  }

  /**
   * Check the authority tree
   * @param {*} authority 
   * @param {String} reqAuth 
   * @returns 
   */
  static AuthCheck(authority, reqAuth){
    if(_.isEmpty(reqAuth) || Accessor.Get(authority, reqAuth) !== undefined){
      return true;
    }
    return false;
  }

  /**
   * Check the level of accessibility
   * @param {Number} level 
   * @param {Number} reqLevel 
   * @returns 
   */
  static LevelCheck(level, reqLevel){
    return level <= reqLevel;
  }

  /**
   * Check the inner accessibility
   * @param {*} authority 
   * @param {String} reqAuth 
   * @param {String} reqFunc 
   * @returns 
   */
  static FuncCheck(authority, reqAuth, reqFunc){
    if(_.isEmpty(reqAuth) || _.isEmpty(reqFunc)) return true;
    let func = Accessor.Get(authority, reqAuth);
    if(!func || !_.isArray(func)) return false;
    if(func.includes("*") || func.includes(reqFunc)) return true;
    return false;
  }

  /**
   * 
   * @param {[String]} groups 
   * @param {String} reqGroup 
   * @returns 
   */
   static GroupCheck = (groups, reqGroup) => {
    if(_.isEmpty(reqGroup)) return true;
    return groups.includes(reqGroup) || groups.includes("*");
  }

  /**
   * 
   * @param {String} role 
   * @param {String} reqRole 
   */
  static RoleCheck = (role, reqRole) => {
    if(_.isEmpty(reqRole)) return true;
    return role === reqRole;
  }
  /**
   * Check if the user is permitted
   * @param {String} username 
   * @param {Number} reqLevel 
   * @param {String} reqAuth 
   * @param {String} reqFunc
   * @param {String} reqGroup
   * @param {String} reqRole
   */
  static async IsAccessible(username, reqAuth = "", reqLevel = Number.MAX_SAFE_INTEGER, reqFunc = "", reqGroup = "", reqRole = ""){
    try{
      let authority = await this.UserAuthority(username);
      let level = await this.UserLevel(username);

      return this.AuthCheck(authority, reqAuth) 
        && this.LevelCheck(level, reqLevel) 
        && this.FuncCheck(authority, reqAuth, reqFunc)
        && this.GroupCheck(groups, reqGroup)
        && this.RoleCheck(role, reqRole);

    }catch(e){
      return false;
    }
  }




}

module.exports = ZGate;