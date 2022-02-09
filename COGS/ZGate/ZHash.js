const crypto = require("crypto");
const SYSCredentials = require("../../SYSCredentials");

class ZHash {

  static HashPassword(password){
    let hash = crypto.createHash("sha256");
    let rtn = hash.update(password + SYSCredentials.Authentication.Password.HashSeed).digest("hex");
    return rtn;
  }

}

module.exports = ZHash;