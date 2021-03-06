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

  static async VerifyUser(username, password){
    return await SysUsers.Verify(username, password);
  }

  static NeedTwoFactor(method){
    return Authenticator.NeedTwoFactor(method);
  }

  static async RequireOTP(username){
    let res = await Authenticator.SendTwoFactor(username, "SMSOTP");
    let {Success, payload} = res;
    if(Success){
      let {key, code} = payload;
      await this.Set(username, "OTPCode", code);
      await this.Set(username, "OTPTime", Time.Now().toISOString());
      return key;
    }
    return false;
  }

  static async VerifyOTP(username, code){
    let _code = await this.Get(username, "OTPCode");
    let _time = await this.Get(username, "OTPTime");

    let expires = 10;
    if(SYSConfig.Authentication.TwoFactorExpires){
      expires = SYSConfig.Authentication.TwoFactorExpires;
    }else{
      console.log(this.CLog("Default OTP Expires: 10 minutes", "[!]"));
    }

    _time = Time.Add(_time, expires, "minutes");

    if(_code == code && !Time.NowIsAfter(_time)){
      return true;
    }else{
      return false;
    }
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
      return true;
    }else{
      return false;
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
        payload: res.payload
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
   * @param {String | [String]} reqRole 
   */
  static RoleCheck = (role, reqRole) => {
    if(_.isEmpty(reqRole)) return true;
    if(_.isArray(reqRole)) return reqRole.includes(role);
    return role === reqRole;
  };

  /**
   * 
   * @param {String} username 
   * @param {sysuser} user
   * @param {{
   *  reqAuth: String,
   *  reqLevel: Number,
   *  reqFunc: String,
   *  reqGroup: String,
   *  reqRole: String | [String]
   * }} param1 
   * @returns 
   */
  static async IsAccessibleBase(username, user, {
    reqAuth = "", 
    reqLevel = Number.MAX_SAFE_INTEGER, 
    reqFunc = "", 
    reqGroup = "", 
    reqRole = ""}){

    let project = await _remote.GetProject();
    if(!project.SYSAuthCtrl.Companies[user.Company]) return false;
    if(!project.SYSAuthCtrl.Users[username]) return false;
    if(!project.SYSAuthCtrl.Roles[user.Role]) return false;
    if(!_.isEmpty(reqAuth) && !project.SYSAuthCtrl.AuthTree[reqAuth]) return false;
    if(!_.isEmpty(reqAuth) && !_.isEmpty(reqFunc) && !project.SYSAuthCtrl.AuthTree[reqAuth + "." + reqFunc]) return false;
    if(!_.isEmpty(reqGroup) && !project.SYSAuthCtrl.Groups[reqGroup]) return false;
    if(!_.isEmpty(reqRole) && !project.SYSAuthCtrl.Roles[user.Role]) return false;
    return true;
  }

  /**
   * 
   * @param {String} username 
   * @param {{
   *  reqAuth: String,
   *  reqLevel: Number,
   *  reqFunc: String,
   *  reqGroup: String,
   *  reqRole: String | [String]
   * }} param1 
   * @returns 
   */
  static async IsAccessible(username, {
    reqAuth = "", 
    reqLevel = Number.MAX_SAFE_INTEGER, 
    reqFunc = "", 
    reqGroup = "", 
    reqRole = ""}, DEBUG = false){

    try{
      let user = await this.GetUser(username);
      let {authority, Level, Groups, Role} = user;

      if(!await this.IsAccessibleBase(username, user, {reqAuth, reqLevel, reqFunc, reqGroup, reqRole})){
        return false;
      }

      let check = {G: false, A: false, L: false, F: false, R: false};
      if(_.isEmpty(reqGroup)){
        check.G = true;
        check.A = this.AuthCheck(authority, reqAuth);
        check.L = this.LevelCheck(Level, reqLevel);
        check.F = this.FuncCheck(authority, reqAuth, reqFunc);
        check.R = this.RoleCheck(Role, reqRole);
      }else{
        let group = Groups.find(o => o.ID === reqGroup);
        if(!group) {
          check.G = false;
        }else{
          check.G = true;
          check.A = this.AuthCheck(group.authority, reqAuth);
          check.L = this.LevelCheck(Level, reqLevel);
          check.F = this.FuncCheck(group.authority, reqAuth, reqFunc);
          check.R = this.RoleCheck(group.role, reqRole);
        }
      }
  
      if(DEBUG){
        console.log(check);
      }
      let {G, A, L, F, R} = check;
      return G && A && L && F && R;

    }catch(e){
      return false;
    }
  }

}

module.exports = ZGate;