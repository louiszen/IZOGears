const { BaseClass } = require("../../../../_CoreWheels");
const SysUsers = require("../../../ZGate/SysUsers");

class AEPassword extends BaseClass{

  static async SignIn(username, password){
    return await SysUsers.Verify(username, password);
  }

}

module.exports = AEPassword;