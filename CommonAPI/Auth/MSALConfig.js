const _base = require("../../../IZOGears/_CoreWheels");
const SYSConfig = require("../../../__SYSDefault/SYSConfig");

const _ = require("lodash");

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
  
  let isMSAL = false;
  let methods = SYSConfig.Authentication.Method;

  if((_.isArray(methods) && methods.includes("MSAL")) || methods == "MSAL"){
    isMSAL = true;
  } 

  let rtn = {};
  if(isMSAL){
    rtn = SYSConfig.Authentication.MSAL;
  }
  console.log(Chalk.CLog("[-]", "Get MSAL Config", [_param.cat, _param.subcat]));

  return Response.Send(true, rtn, "");


};