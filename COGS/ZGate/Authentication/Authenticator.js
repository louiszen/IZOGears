const { BaseClass } = require("../../../_CoreWheels");
const AEPassword = require("./Methods/AEPassword");

class Authenticator extends BaseClass{

  /**
   * @typedef {import("../../../../__SYSDefault/SYSConfig").authMethod} method
   * 
   * @param {*} param 
   * @param {method} method 
   * @returns 
   */
  static async SignIn(param, method){
    switch(method){
      case "Username-Password": 
        return await AEPassword.SignIn(param.username, param.password);
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
   * @returns 
   */
  static async SendTwoFactor(username, method){
    switch(method){
      case "Username-Password": 
        return;
      case "SMSOTP": 
        return;
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