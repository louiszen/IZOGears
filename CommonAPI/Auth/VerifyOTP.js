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
  
  let {username, key, otp} = _opt;
  let res = await ZGate.VerifyTwoFactor(username, key, otp);
  if(!res.Success){
    console.error(Chalk.CLog("[-][x]", "VerifyOTP :: Failed.", [_param.cat, _param.subcat]));
    return Response.Send(false, "", "OTP Invalid or Expired.");
  }

  //Get User
  let user = await ZGate.GetUser(username);

  //Get Authorized Key
  let JWT = await ZGate.Grant(user);

  console.log(Chalk.CLog("[-][o]", "signIn :: Success.", [_param.cat, _param.subcat]));

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