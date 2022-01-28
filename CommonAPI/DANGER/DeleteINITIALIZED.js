const _base = require("../../../IZOGears/_CoreWheels");
const _remote = require("../../../remoteConfig");
const _DBMAP = require("../../../__SYSDefault/_DBMAP");
const { ZGate } = require("../../COGS");

const {Chalk, Response} = _base.Utils;

/**
 * 
 * @param {*} _opt 
 * @param {{
 *  cat: String,
 *  subcat: String,
 *  action: String
 * }} _param
 * @returns 
 */
module.exports = async (_opt, _param, _username) => {

  let rtn = {};
  let {data} = _opt;
  let {cat, subcat, action} = _param;

  let {password, otp} = data;

  let db = await _remote.BaseDB();

  let pass = await ZGate.VerifyUser(_username, password);
  if(!pass){
    let msg = "Incorrect password.";
    console.error(Chalk.CLog("[x]", msg, [cat, subcat, action]));
    return Response.SendError(9001, msg);
  }

  pass = await ZGate.VerifyOTP(_username, otp);
  if(!pass){
    let msg = "Incorrect OTP.";
    console.error(Chalk.CLog("[x]", msg, [cat, subcat, action]));
    return Response.SendError(9001, msg);
  }

  pass = await ZGate.IsAccessible(_username, {
    reqLevel: 0,
    reqAuth: "System.DANGER",
    reqFunc: "ReInit"
  });
  if(!pass){
    let msg = "No Authority.";
    console.error(Chalk.CLog("[x]", msg, [cat, subcat, action]));
    return Response.SendError(9001, msg);
  }

  await db.Delete(_DBMAP.Config, "INITIALIZED");

  console.log(Chalk.CLog("[-]", "<MESSAGE>", [cat, subcat, action]));

  return Response.Send(true, rtn, "");

  

};