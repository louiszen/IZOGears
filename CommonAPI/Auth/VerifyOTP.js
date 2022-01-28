const _base = require("../../_CoreWheels");

const ZGate = require("../../COGS/ZGate/ZGate");

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
  
  let {cat, subcat, action} = _param;
  let {username, key, otp} = _opt.data;
  let pass = await ZGate.VerifyTwoFactor(username, key, otp);
  if(!pass){
    console.error(Chalk.CLog("[-][x]", "VerifyOTP :: Failed.", [cat, subcat, action]));
    return Response.Send(false, "", "OTP Invalid or Expired.");
  }

  //Get User
  let user = await ZGate.GetUser(username);

  //Get Authorized Key
  let JWT = await ZGate.Grant(user);

  console.log(Chalk.CLog("[-][o]", "signIn :: Success.", [cat, subcat, action]));

  let payload = {
    JWT: JWT,
    UserDisplayName: user.UserDisplayName,
    authority: user.authority,
    level: user.Level,
    groups: user.Groups,
    role: user.Role
  };
  
  return Response.Send(true, payload, "Login Succeeded.");

};