const { default: axios } = require("axios");
const { v1 } = require("uuid");
const SYSCredentials = require("../../../../../SYSCredentials");
const SYSConfig = require("../../../../../__SYSDefault/SYSConfig");
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
    let code = ZGen.Number(6).join();
    let message = encodeURIComponent(SYSConfig.General.Name + " OTP Verification: " + code);
    let url = SYSCredentials.SMS.PATH.replace("{{TEL}}", user.TelNo).replace("{{MSG}}", message);
    await axios.get(url);
    return {
      key: key,
      code: code
    };
  }



}

module.exports = SMSOTP;