const SYSCredentials = require("./SYSCredentials");
const envConfigs = require("../__SYSDefault/ENVConfig");
const Chalk = require("./_CoreWheels/Utils/Chalk/Chalk");

/**
 * @type {sysconfig}
 */
let SYSConfig; 
try {
  SYSConfig = envConfigs[SYSCredentials.ENV];
  if(!SYSConfig) throw Error();
  console.log(Chalk.Log("[-] Using __SYSDefault/ENVConfig/" + SYSCredentials.ENV + ".js as SYSConfig."));
}catch{
  let msg = "[x] Config for [" + SYSCredentials.ENV + "] not found. Please create __SYSDefault/ENVConfig/" + SYSCredentials.ENV + ".js";
  console.log(Chalk.Log(msg));
  throw Error(msg);
}

module.exports = SYSConfig;