const _base = require("../../_CoreWheels");

const path = require("path");
const catName = path.basename(__dirname);
const actName = path.basename(__filename, path.extname(__filename));

const ZGate = require("../../COGS/ZGate/ZGate");
const {Chalk, Response} = _base.Utils;

module.exports = async (_opt) => {

  let {username} = _opt;

  let hasUser = await ZGate.HasUser(username);
  let payload = {
    hasUser
  };

  if(hasUser){
    console.log(Chalk.CLog("[-][o]", "signIn :: Success.", [catName, actName]));

    let UserDisplayName = await ZGate.GetDisplayName(username);
    payload = {
      hasUser,
      UserDisplayName
    };
  }

  return Response.Send(true, payload, "Username checked.");

};