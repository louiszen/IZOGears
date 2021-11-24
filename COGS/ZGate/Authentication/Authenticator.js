const { BaseClass } = require("../../../_CoreWheels");
const SYSConfig = require("../../../../__SYSDefault/SYSConfig");
const AEPassword = require("./Methods/AEPassword");

class Authenticator extends BaseClass{

  /**
   * 
   * @param {*} param 
   * @param {*} method 
   * @returns 
   */
  static async SignIn(param, method){
    switch(method){
      case "Username-Password": 
        return await AEPassword.SignIn(param.username, param.password);
    }
  }

  static NeedTwoFactor(method){
    switch(method){
      case "Username-Password": 
        return false;
    }
  }

  static async SendTwoFactor(username, method){
    switch(method){
      case "Username-Password": 
        return;
    }
  }

  static async Prove(username, method){
    switch(method){
      case "Username-Password": 
        return true;
    }
  }
}

module.exports = Authenticator;