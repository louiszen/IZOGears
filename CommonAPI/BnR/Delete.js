const _base = require("../../_CoreWheels");

const path = require("path");
const catName = path.basename(__dirname);
const actName = path.basename(__filename, path.extname(__filename));

const {Chalk, Response, Fs} = _base.Utils;

module.exports = async (_opt, _param, _username) => {

  let {datestr} = _opt.data;

  let backupDir = "./ΩRUNTIME/_backup/" + process.env.NODE_ENV + "/" + datestr;
  
  try{
    let res = await Fs.rmdir(backupDir);
    return Response.Send(true, res, "");

  }catch(e){
    let msg = "Cannot remove backup " + datestr;
    console.error(Chalk.CLog("[x]", msg, [catName, actName]));
    return Response.SendError(9001, msg);
  }
  

};