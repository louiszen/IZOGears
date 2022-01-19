const _remote = require("../../../remoteConfig");
const SYSConfig = require("../../SYSConfig");
const { RemoteStorage } = require("../../_CoreWheels/Extensible");
const Authenticator = require("./Authentication/Authenticator");
const SysUsers = require("./SysUsers");
const LSignIn = require("../Log/LSignIn");
const Authorizer = require("./Authorization/Authorizer");
const { v1 } = require("uuid");
const { Accessor, Time } = require("../../_CoreWheels/Utils");

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

  static async SignIn(params, method){
    let success = await Authenticator.SignIn(params, method);
    await LSignIn.Write(params.username, "SignIn", success);
    return success;
  }

  static NeedTwoFactor(method){
    return Authenticator.NeedTwoFactor(method);
  }

  static async SendTwoFactor(username, method){
    let res = await Authenticator.SendTwoFactor(username, method);
    let {Success, payload} = res;
    if(Success){
      let {key, code} = payload;
      await this.Set(username, "TwoFactorKey", key);
      await this.Set(username, "TwoFactorCode", code);
      await this.Set(username, "TwoFactorTime", Time.Now().toISOString());
      return key;
    }
    return false;
  }

  static async VerifyTwoFactor(username, key, code){
    let _key = await this.Get(username, "TwoFactorKey");
    let _code = await this.Get(username, "TwoFactorCode");
    let _time = await this.Get(username, "TwoFactorTime");

    let expires = 10;
    if(SYSConfig.Authentication.TwoFactorExpires){
      expires = SYSConfig.Authentication.TwoFactorExpires;
    }else{
      console.log(this.CLog("Default OTP Expires: 10 minutes", "[!]"));
    }

    _time = Time.Add(_time, expires, "minutes");

    if(_key == key && _code == code && !Time.NowIsAfter(_time)){
      return {
        Success: true
      };
    }else{
      return {
        Success: false
      };
    }
  }

  /**
   * 
   * @param {sysuser} user 
   * @returns 
   */
  static async Grant(user){
    let seed = v1();
    await this.Set(user._id, "Seed", seed);
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
      if(SYSConfig.Authentication.SeedChecking){
        let seedInDB = await this.Get(username, "Seed");
        if(seed !== seedInDB){
          return {
            Success: false,
            payload: "Seed Not Match"
          };
        }
      }
      
      let user = await SysUsers.GetUser(username);
      if(user.Version !== res.payload.version){
        return {
          Success: false,
          payload: "Version Not Match"
        };
      }

      return {
        Success: true,
        payload: username
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
   * Get the user groups
   * @param {String} username 
   * @returns 
   */
  static async UserGroups(username){
    try{
      let user = await this.GetUser(username);
      return user.groups;
    }catch(e){
      return null;
    }
  }

  /**
   * Get the user role
   * @param {String} username 
   * @returns 
   */
  static async UserRole(username){
    try{
      let user = await this.GetUser(username);
      return user.role;
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
   static GroupCheck(groups, reqGroup){
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
  };

  /**
   * 
   * @param {String} username 
   * @param {{
   *  reqAuth: String,
   *  reqLevel: Number,
   *  reqFunc: String,
   *  reqGroup: String,
   *  reqRole: String
   * }} param1 
   * @returns 
   */
  static async IsAccessible(username, {
    reqAuth = "", 
    reqLevel = Number.MAX_SAFE_INTEGER, 
    reqFunc = "", 
    reqGroup = "", 
    reqRole = ""}){
    try{
      let user = await this.GetUser(username);
      let {authority, Level, Groups, Role} = user;
      
      if(!_.isEmpty(reqGroup)){
        let group = Groups.find(o => o.ID === reqGroup);
        if(!group) return false;
        return this.AuthCheck(group.authority, reqAuth) 
          && this.LevelCheck(Level, reqLevel) 
          && this.FuncCheck(group.authority, reqAuth, reqFunc)
          && this.RoleCheck(group.role, reqRole); 

      }else{
        return this.AuthCheck(authority, reqAuth) 
          && this.LevelCheck(Level, reqLevel) 
          && this.FuncCheck(authority, reqAuth, reqFunc)
          && this.RoleCheck(Role, reqRole);
      }

    }catch(e){
      return false;
    }
  }

}

module.exports = ZGate;