/**
 * This script is to generate *_SYSCredentials.js for Credential settings.
 * 
 * Use `npm run credentials` to run this script.
 */
const Fs = require("../_CoreWheels/Utils/Fs");
const Chalk = require("../_CoreWheels/Utils/Chalk/Chalk");
const SYSGeneral = require("../../__SYSDefault/SYSGeneral");
const ZGen = require("../_CoreWheels/Utils/ZGen");
const template = require("../__Typedef/SYSCredentialsTemplate");
const Accessor = require("../_CoreWheels/Utils/Accessor");

let existCredentials = null;
try {
  existCredentials = require("../SYSCredentials"); 
}catch{
  console.log(Chalk.Log("[!] No existing credentials found. Generate a new one."));  
}

( async () => {

  /**
   * @type {import("../__Typedef/SYSCredentials").syscredentials}
   */
  let syscre = {};
  if(existCredentials){
    syscre = Accessor.FormatMerge(existCredentials, template); 
  }else{
    let token = ZGen.Key(16, 0b0011);
    let ptoken = ZGen.Key(12, 0b0011);
    let expires = 1000 * 60 * 60 * 24 * 7;

    syscre = template;

    syscre.Authentication.Password.HashSeed = ptoken;
    syscre.Authorization.JWT.TokenSecret = token;
    syscre.Authorization.JWT.Expire = expires;
  }

  let syscredentialsJSON = JSON.stringify(syscre, null, 2);
  let syscredentialsJSONUnquoted = syscredentialsJSON.replace(/"([^"]+)":/g, "$1:");

  let syscredentials = `/**
  * @type {import("./IZOGears/__Typedef/SYSCredentials").syscredentials}
  */
const SYSCredentials = ${syscredentialsJSONUnquoted}

module.exports = SYSCredentials;`;

  let filename = SYSGeneral.ID.toLowerCase() + "_SYSCredentials.js";
  let exists = await Fs.exists(filename);

  await Fs.writeFile(filename, syscredentials);

  if(!exists){
    console.log(Chalk.Log("[v] " + filename + " generated."));
  }else{
    console.log(Chalk.Log("[!][U] " + filename + " updated."));
  }

  let filenameJSON = SYSGeneral.ID.toLowerCase() + "_SYSCredentials.json";
  let existsJSON = await Fs.exists(filenameJSON);

  await Fs.writeFile(filenameJSON, syscredentialsJSON);

  if(!existsJSON){
    console.log(Chalk.Log("[v] " + filenameJSON + " generated."));
  }else{
    console.log(Chalk.Log("[!][U] " + filenameJSON + " updated."));
  }

})();