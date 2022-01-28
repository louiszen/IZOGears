const _base = require("../../../IZOGears/_CoreWheels");
const _remote = require("../../../remoteConfig");
const _DBMAP = require("../../../__SYSDefault/_DBMAP");
const LAuth = require("../../COGS/Log/LAuth");
const ZGate = require("../../COGS/ZGate/ZGate");

const {Chalk, Response} = _base.Utils;

/* IMPORTANT: Generic Scripts Automation depends on SUBCAT name */

module.exports = async (_opt, _param, _username) => {

  let rtn = {};
  let db = await _remote.BaseDB();
  let {cat, subcat, action} = _param;

  //get Project
  let {addOns, data} = _opt;
  let {reason} = addOns;

  let configDB = _DBMAP.Config;

  let res = await db.getDocQ(configDB, "PROJECT");
  if(!res.Success){return Response.SendErrorX(db.ErrorX(res.payload));}

  let projDoc = res.payload;
  let {userDB, groupDB} = projDoc;

  let userDoc = data;
  let userID = userDoc._id;

  //protection
  if((await ZGate.UserLevel(_username)) >= userDoc.Level){
    let msg = "Cannot create User in upper hierarchy.";
    console.error(Chalk.CLog("[x]", msg, [cat, subcat, action]));
    return Response.SendError(9001, msg);
  }

  //check user exists
  res = await db.getDocQ(userDB, userID);
  if(res.Success && res.payload.length === 1) {
    let msg = "Users [" + userID + "] exists.";
    console.log(Chalk.CLog("[x]", msg, [cat, subcat, action]));
    return Response.SendError(9001, msg);
  }

  //add Ctrl in proj
  projDoc.SYSAuth.Users.push(userID);
  projDoc.SYSAuthCtrl.Users[userID] = true;

  res = await db.Update(configDB, projDoc);
  if(!res.Success){return Response.SendErrorX(db.ErrorX(res.payload));}

  // add Ctrl in Group
  // get GroupDoc
  res = await db.getDocQ(groupDB, userDoc.ProjectGroup);
  if(!res.Success){return Response.SendErrorX(db.ErrorX(res.payload));}
  let groupDoc = res.payload;

  //check if exists
  let existUser = groupDoc.users.find(o => o.username === userID);
  if(existUser){
    let msg = "User [" + userID + "] in Group [" + groupDoc._id + "] exists.";
    console.log(Chalk.CLog("[x]", msg, [cat, subcat, action]));
    return Response.SendError(9001, msg);
  }

  groupDoc.users.push({
    username: userID,
    role: userDoc.GroupRole,
    level: userDoc.Level
  });
  groupDoc.userCtrl[userID] = true;
  
  // update GroupDoc 
  res = await db.Update(groupDB, groupDoc);
  if(!res.Success){return Response.SendErrorX(db.ErrorX(res.payload));}

 //add User Doc

  userDoc.override = {};
  userDoc.Version = 0;
  userDoc.Groups = [{
    ID: userDoc.ProjectGroup,
    override: {}
  }];
  delete userDoc.ProjectGroup;
  delete userDoc.GroupRole;

  rtn = await db.Insert(userDB, userDoc);

  LAuth.Write(LAuth.__CODE.UserCreated, 
    {user: userID},
    reason, _username);

  console.log(Chalk.CLog("[-]", userDoc, [cat, subcat, action]));

  _remote.ClearCache();

  if(!rtn.Success){
    return Response.SendError(9001, rtn.payload);
  }
  return Response.Send(true, rtn.payload, "");

};