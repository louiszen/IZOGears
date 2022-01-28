const _base = require("../../../IZOGears/_CoreWheels");
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
  let {cat, subcat, action} = _param;

  let pass = await ZGate.IsAccessible(_username, {
    reqLevel: 0,
    reqAuth: "System.DANGER",
    reqFunc: "ReInit"
  }, true);
  if(!pass){
    let msg = "No Authority.";
    console.error(Chalk.CLog("[x]", msg, [cat, subcat, action]));
    return Response.SendError(9001, msg);
  }

  try{
    await ZGate.RequireOTP(_username);
  }catch{
    let msg = "Cannot send SMS.";
    console.error(Chalk.CLog("[x]", msg, [cat, subcat, action]));
    return Response.SendError(9001, msg);
  }

  console.log(Chalk.CLog("[-]", "OTP sent.", [cat, subcat, action]));

  return Response.Send(true, rtn, "");

  

};