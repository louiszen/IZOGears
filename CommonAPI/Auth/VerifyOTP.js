const _base = require('../../_CoreWheels');
const _remote = require('../../../remoteConfig');
const _DBMAP = require('../../../__SYSDefault/_DBMAP');

const path = require('path');
const ZGate = require('../../COGS/ZGate/ZGate');
const catName = path.basename(__dirname);
const actName = path.basename(__filename, path.extname(__filename));

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
  
  let {username, key, otp} = _opt;
  let res = await ZGate.VerifyTwoFactor(username, key, otp);
  if(!res.Success){
    console.error(Chalk.CLog("[-][x]", "VerifyOTP :: Failed.", [catName, actName]));
    return Response.Send(false, "", "OTP Invalid or Expired.");
  }

  //Get User
  let user = await ZGate.GetUser(username);

  //Get Authorized Key
  let JWT = await ZGate.Grant(user);

  console.log(Chalk.CLog("[-][o]", "signIn :: Success.", [catName, actName]));

  let payload = {
    JWT: JWT,
    UserDisplayName: user.UserDisplayName,
    authority: user.authority,
    level: user.Level,
    groups: user.Groups,
    role: user.Role
  };
  
  return Response.Send(true, payload, "Login Succeeded.");

  

}