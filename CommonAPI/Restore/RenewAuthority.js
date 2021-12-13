const _base = require("../../_CoreWheels");

const path = require("path");
const catName = path.basename(__dirname);
const actName = path.basename(__filename, path.extname(__filename));

const ZGate = require("../../COGS/ZGate/ZGate");
const {Chalk, Response} = _base.Utils;

module.exports = async (_opt, _param, _username) => {

  //Get User
  let user = await ZGate.GetUser(_username);

  //Get Authorized Key
  let JWT = await ZGate.Grant(user);

  console.log(Chalk.CLog("[-][o]", "RenewAuthority :: Success.", [catName, actName]));

  let payload = {
    JWT: JWT,
    UserDisplayName: user.UserDisplayName,
    authority: user.authority,
    level: user.Level,
    groups: user.Groups,
    role: user.Role,
    roleName: user.roleName
  };
  
  return Response.Send(true, payload, "Renew Authority Succeeded.");

};