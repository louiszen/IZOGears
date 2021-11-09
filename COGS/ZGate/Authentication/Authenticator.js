const { BaseClass } = require("$/IZOGears/_CoreWheels");
const SYSConfig = require("$/__SYSDefault/SYSConfig");
const AEPassword = require("./Methods/AEPassword");

class Authenticator extends BaseClass{

  /**
   * 
   * @param {*} param 
   */
  static async SignIn(param){
    switch(SYSConfig.Authentication.Method){
      case "Username-Password": 
        return await AEPassword.SignIn(param.username, param.password);
    }
  }

  static NeedTwoFactor(){
    switch(SYSConfig.Authentication.Method){
      case "Username-Password": 
        return false;
    }
  }

  static async SendTwoFactor(){
    switch(SYSConfig.Authentication.Method){
      case "Username-Password": 
        return;
    }
  }

  static async Prove(){
    switch(SYSConfig.Authentication.Method){
      case "Username-Password": 
        return true;
    }
  }
}

module.exports = Authenticator;