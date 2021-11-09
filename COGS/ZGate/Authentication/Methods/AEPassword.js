const { BaseClass } = require("$/IZOGears/_CoreWheels");
const SysUsers = require("$/IZOGears/COGS/ZGate/SysUsers");

class AEPassword extends BaseClass{

  static async SignIn(username, password){
    return await SysUsers.Verify(username, password);
  }

}

module.exports = AEPassword;