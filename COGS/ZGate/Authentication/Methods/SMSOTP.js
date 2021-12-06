const { default: axios } = require("axios");
const { v1 } = require("uuid");
const SYSCredentials = require("../../../../../SYSCredentials");
const SYSConfig = require("../../../../../__SYSDefault/SYSConfig");
const SYSGeneral = require("../../../../../__SYSDefault/SYSGeneral");
const { BaseClass } = require("../../../../_CoreWheels");
const { ZGen } = require("../../../../_CoreWheels/Utils");
const SysUsers = require("../../../ZGate/SysUsers");

class SMSOTP extends BaseClass{

  static async SignIn(username, password){
    return await SysUsers.Verify(username, password);
  }

  static async SendTwoFactor(username){
    let user = await SysUsers.GetUser(username);
    let key = v1();
    let code = ZGen.Number(6).join("");
    let message = encodeURIComponent(SYSGeneral.Name + " OTP Verification: " + code);
    let url = SYSCredentials.SMS.PATH.replace("{{TEL}}", user.TelNo).replace("{{MSG}}", message);
    try{
      await axios.get(url);
      return {
        Success: true,
        payload: {
          key: key,
          code: code
        }
      };
    }catch(e){
      console.log(this.CLog("Cannot send OTP.", "[x]"));
      return {
        Success: false
      };
    }
  }



}

module.exports = SMSOTP;