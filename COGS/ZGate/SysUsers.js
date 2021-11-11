const { BaseClass } = require("$/IZOGears/_CoreWheels");
const _remote = require("$/remoteConfig");

class SysUsers extends BaseClass {

  static async HasUser(username){

    let user = await this.GetUser(username);
    if(user){
      return true;
    }
    return false;
  }

  static async GetDisplayName(username){

    let user = await this.GetUser(username);
    if(user){
      return user.UserDisplayName;
    }
    return "";
  }

  /**
   * 
   * @param {String} username 
   * @param {String} password 
   * @returns 
   */
  static async Verify(username, password){

    let remoteUsers = await _remote.GetUsers();

    const users = remoteUsers;

    for(let i=0; i<users.length; i++){
      if(username == users[i].username && password == users[i].password){
        return true;
      }
    }

    return false;
  }

  /**
   * 
   * @param {String} username 
   * @returns {Promise<{
   *  username: String,
   *  password: String,
   *  UserDisplayName: String,
   *  Version: Number,
   *  Level: Number,
   *  Groups: [String],
   *  Role: String,
   *  authority: *
   * }>}
   */
  static async GetUser(username){

    let remoteUsers = await _remote.GetUsers();

    const users = remoteUsers;

    for(let i=0; i<users.length; i++){
      if(username == users[i].username){
        return users[i];
      }
    }

    return null;
  }

}

module.exports = SysUsers;