const SYSGeneral = require("../__SYSDefault/SYSGeneral");
const Chalk = require("./_CoreWheels/Utils/Chalk/Chalk");
const fs = require("fs");

const MODE = "JSON";

/**
 * @type {import("./__Typedef/SYSCredentials").syscredentials}
 */
let SYSCredentials;
if(MODE === "JS"){
  let filename = "../" + SYSGeneral.ID.toLowerCase() + "_SYSCredentials";
  try {
    SYSCredentials = require(filename);
    if(!SYSCredentials) throw Error();
    console.log(Chalk.Log("[-] Using " + filename + " as SYSCredentials."));
  }catch{
    let msg = "[x] " + filename + " not found. Please run `npm run credentials`";
    console.log(Chalk.Log(msg));
    throw Error(msg);
  }
}else{
  let filename = "./" + SYSGeneral.ID.toLowerCase() + "_SYSCredentials.json";
  try{
    let json = fs.readFileSync(filename);
    SYSCredentials = JSON.parse(json);
    console.log(Chalk.Log("[-] Using " + filename + " as SYSCredentials."));
  }catch(e){
    let msg = "[x] " + filename + " not found. Please run `npm run credentials`";
    console.log(Chalk.Log(msg));
    throw Error(msg);
  }
}
 
/**
 * @type {syscredentials}
 */
module.exports = SYSCredentials;