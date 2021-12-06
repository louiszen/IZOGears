const { BaseClass } = require("../../../_CoreWheels");
const AEPassword = require("./Methods/AEPassword");
const SMSOTP = require("./Methods/SMSOTP");

class Authenticator extends BaseClass{

  /**
   * @typedef {import("../../../SYSConfig").authMethod} method
   * 
   * @param {*} param 
   * @param {method} method 
   * @returns 
   */
  static async SignIn(param, method){
    switch(method){
      case "Username-Password": 
        return await AEPassword.SignIn(param.username, param.password);
      case "SMSOTP": 
        return await SMSOTP.SignIn(param.username, param.password);
    }
  }

  /**
   * 
   * @param {method} method 
   * @returns 
   */
  static NeedTwoFactor(method){
    switch(method){
      case "Username-Password": 
        return false;
      case "SMSOTP": case "EmailOTP":
        return true;
    }
  }

  /**
   * 
   * @param {String} username 
   * @param {method} method 
   * @returns {String} 
   */
  static async SendTwoFactor(username, method){
    switch(method){
      case "Username-Password": 
        return {Success: true, payload: ""};
      case "SMSOTP": {
        let {Success, payload} = await SMSOTP.SendTwoFactor(username);
        if(Success){
          return {
            Success: true,
            payload: payload
          };
        }else{
          return {
            Success: false
          };
        }
      }
      case "EmailOTP":
        return;
    }
  }

  /**
   * 
   * @param {String} username 
   * @param {method} method 
   * @returns 
   */
  static async Prove(username, method){
    switch(method){
      case "Username-Password": 
        return true;
    }
  }
}

module.exports = Authenticator;