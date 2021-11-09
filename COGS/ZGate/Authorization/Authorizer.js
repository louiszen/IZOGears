const { BaseClass } = require("$/IZOGears/_CoreWheels");
const SYSConfig = require("$/__SYSDefault/SYSConfig");
const AOJWT = require("./Methods/AOJWT");

class Authorizer extends BaseClass{

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
   * @param {String} seed 
   * @returns 
   */
  static async Grant(user, seed){
    switch(SYSConfig.Authorization.Method){
      case "JWT":
        return await AOJWT.Grant(user, seed);
    }
  }

  /**
   * 
   * @param {*} params 
   * @returns {Promise<{
   *  Success: Boolean, 
   *  payload: {
   *    username: String,
   *    seed: String,
   *    version: Number
   *  } | {
   *    error: String
   *  }
   * }}>}
   */
  static async Validate(params){
    switch(SYSConfig.Authorization.Method){
      case "JWT":
        return await AOJWT.Validate(params.JWT);
    }
  }

}

module.exports = Authorizer;