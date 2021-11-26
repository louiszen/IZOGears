const crypto = require("crypto");

class ZHash{

  static HashPassword(password){
    let hash = crypto.createHash('sha256');
    return hash.update(password).digest("hex");
  }

}

module.exports = ZHash;