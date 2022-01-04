const ExpirableDB = require("../../_CoreWheels/Extensible/ExpirableDB");
const _remote = require("../../../remoteConfig");

const {v1} = require("uuid");
const SYSConfig = require("../../SYSConfig");
const { Time } = require("../../_CoreWheels/Utils");
const _DBMAP = require("../../../__SYSDefault/_DBMAP");

const _ = require("lodash");

class LAuth extends ExpirableDB {

  static __CODE = {
    //project important
    Created: 0,
    Updated: 1,
    Deleted: 99,
    //project level
    Disable: 10,
    Enable: 11,
    //API level
    APIDisable: 20,
    APIEnable: 21,
    //Auth Tree Level
    AuthTreeDisable: 30,
    AuthTreeEnable: 31,
    //Role
    RoleDisable: 40,
    RoleEnable: 41,
    RoleAuthTreeDisable: 42,
    RoleAuthTreeEnable: 43,
    RoleDeleted: 44,
    RoleCreated: 45,
    RoleEdit: 49, 
    //Group
    GroupDisable: 50,
    GroupEnable: 51,
    GroupAuthTreeDisable: 52,
    GroupAuthTreeEnable: 53,
    GroupDeleted: 54,
    GroupCreated: 55,
    GroupUserDisable: 56,
    GroupUserEnable: 57,
    GroupUserEdit: 58,
    GroupEdit: 59,
    //User
    UserDisable: 60,
    UserEnable: 61,
    UserAuthTreeDisable: 62,
    UserAuthTreeEnable: 63,
    UserDeleted: 64,
    UserCreated: 65,
    UserRoleUnlink: 66,
    UserRoleLink: 67,
    UserRoleEdit: 68,
    UserEdit: 69,
    //User-Group
    UserGroupDisable: 70,
    UserGroupEnable: 71,
    UserGroupAuthTreeDisable: 72,
    UserGroupAuthTreeEnable: 73,
    UserGroupDeleted: 74,
    UserGroupCreated: 75,
    UserGroupEdit: 79
  };

  static async Init({db} = {db: null}){
    if(!db) {
      try{
        db = await _remote.BaseDB();
      }catch(e){
        return {Success: false};
      }
    }
    return await super.Init({
      db: db, 
      DBName: _DBMAP.AuthLog$, 
      keep: SYSConfig.LogKeep.Auth, 
      mode: "M"
    });
  }

  static async Write(code, affected, reason, username){

    let obj = _.pickBy(this.__CODE, o => o === code);
    let theKey = Object.keys(obj)[0];

    let _id;
    switch(code){
      case this.__CODE.Created:
        _id = "CREATED";
        break;
      case this.__CODE.Deleted:
        _id = "DELETED";
        break;
      default:
        _id = theKey + "-" + v1();
        break;
    }

    let logDoc = {
      _id: _id,
      code: code,
      reason: reason,
      affected: affected,
      createdAt: Time.Now().toISOString(),
      createdBy: username
    };

    return await this.Insert(logDoc);

  }

}

module.exports = LAuth;