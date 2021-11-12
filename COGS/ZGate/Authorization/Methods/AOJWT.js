const { BaseClass } = require("../../../../_CoreWheels");
const SYSConfig = require("../../../../../__SYSDefault/SYSConfig");

const _ = require("lodash");
const JWT = require("jwt-simple");
const {TokenSecret, Expire} = SYSConfig.Authorization.JWT;

class AOJWT extends BaseClass {

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
   * @param {*} seed 
   * @returns 
   */
  static async Grant(user, seed){
    return this.Encode(user, seed);
  }

  static Encode(user, seed){
    return JWT.encode({
      username: user.username,
      seed: seed,
      expires: Date.now() + Expire,
      version: user.Version,
      level: user.Level
    }, TokenSecret);
  }

  /**
   * 
   * @param {String} jwt 
   * @returns 
   */
  static Decode(jwt){
    return JWT.decode(jwt, TokenSecret);
  }

  /**
   * 
   * @param {String} jwt 
   * @returns 
   */
  static IsExpired(jwt){
    let _JWT = this.Decode(jwt);
    return Date.now() >= _JWT.expires;
  }

  static async Validate(jwt){
    try{
      if(_.isEmpty(jwt)){
        return {
          Success: false,
          payload: "No JWT Token."
        };
      }

      if(this.IsExpired(jwt)){
        return {
          Success: false,
          payload: "JWT Token Expired."
        };
      }

      let decoded = this.Decode(jwt);
      return {
        Success: true,
        payload: {
          username: decoded.username,
          seed: decoded.seed,
          version: decoded.version
        }
      };

    }catch{
      return {
        Success: false,
        payload: "Invalid JWT Token."
      };
    }
    
  }
}

module.exports = AOJWT;