const _base = require("../../../IZOGears/_CoreWheels");
const { USYSTicket } = require("../../COGS/Utils");

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

  let {severity, discipline, description} = data;
  let res = await USYSTicket.SubmitBugReport(severity, discipline, description, _username);

  if(!res.Success){
    let msg = "Cannot submit Bug Report: " + res.payload;
    console.error(Chalk.CLog("[x]", msg, [cat, subcat, action]));
    return Response.SendError(9001, msg);
  }

  return Response.Send(true, rtn, "");

};