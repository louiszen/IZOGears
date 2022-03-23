const { BaseClass } = require("../../../_CoreWheels");
const SYSConfig = require("../../../SYSConfig");
const AOJWT = require("./Methods/AOJWT");

class Authorizer extends BaseClass{

  /**
   * 
   * @param {sysuser} user 
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
   * @param {String} params 
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
        return await AOJWT.Validate(params.replace("Bearer ", ""));
    }
  }

}

module.exports = Authorizer;