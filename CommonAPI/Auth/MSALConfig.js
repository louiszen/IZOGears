const _base = require("../../../IZOGears/_CoreWheels");
const SYSConfig = require("../../SYSConfig");

const _ = require("lodash");
const SYSCredentials = require("../../SYSCredentials");

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
  let {cat, subcat, action} = _param;

  if((_.isArray(methods) && methods.includes("MSAL")) || methods == "MSAL"){
    isMSAL = true;
  } 

  let rtn = {};
  if(isMSAL){
    rtn = SYSCredentials.Authentication.MSAL;
  }
  console.log(Chalk.CLog("[-]", "Get MSAL Config", [cat, subcat, action]));

  return Response.Send(true, rtn, "");


};