const _base = require("../../_CoreWheels");

const path = require("path");
const catName = path.basename(__dirname);
const actName = path.basename(__filename, path.extname(__filename));

const ZGate = require("../../COGS/ZGate/ZGate");
const {Chalk, Response} = _base.Utils;

module.exports = async (_opt) => {

  //SignedIn
  let {username, method} = _opt;
  let success = await ZGate.SignIn(_opt, method);

  if(!success){
    console.error(Chalk.CLog("[-][x]", "signIn :: Failed.", [catName, actName]));
    return Response.Send(false, "", "Login Failed.");
  }

  //Need 2-factor?
  let need2factor = ZGate.NeedTwoFactor(method);
  if(need2factor){
    try{
      let key = await ZGate.SendTwoFactor(username, method);
      if(!key) throw Error();
      return Response.Send(true, {
        key: key
      }, "OTP Sent.");
    }catch{
      return Response.Send(false, {}, "OTP Sent Fails.");
    }
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

};