const BaseClass = require("../../_CoreWheels/BaseClass");
const _remote = require("../../../remoteConfig");
const DEVUSER = require("../../../__SYSDefault/DevUser");
const SYSAuth = require("../../../__SYSDefault/SYSAuth");
const { AuthCtrl } = require("./Utils");

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
   * @returns {Promise<user>}
   */
  static async GetUser(username){

    let remoteUsers = await _remote.GetUsers();

    const users = remoteUsers;

    /**
     * @type {user}
     */
    let user = null;
    for(let i=0; i<users.length; i++){
      if(username == users[i].username){
        user = users[i];
        break;
      }
    }
    if(!user) return null;

    let roles = await _remote.GetUserRoles();
    let role;
    for(let i=0; i<roles.length; i++){
      if(user.Role == roles[i]._id){
        role = roles[i];
        break;
      }
    }
    if(!user) return null;

    user.authority = AuthCtrl.CombineOverride(role.authority, user.override);
    return user;

  }

}

module.exports = SysUsers;