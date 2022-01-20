/**
 * This script is to generate SYSAPI.js / SYSAPICtrl.js / SYSAuthCtrl.js / SYSReqAuth.js 
 * for authority settings.
 * 
 * Use `npm run auth` to run this script.
 */

const _ = require("lodash");
 
const SYSAuth = require("../../__SYSDefault/SYSAuth");
const AuthCtrl = require("../COGS/Utils/AuthCtrl");
const Fs = require("../_CoreWheels/Utils/Fs");
const Chalk = require("../_CoreWheels/Utils/Chalk/Chalk");

let core = {};
try {
  core = require("../../__SYSDefault/APIConfig/cores");
}catch{
  console.log(Chalk.Log("[x] File missing & recovered. Please run `npm run auth` again."));
}

let SYSReqAuth;
let exists = false;
try {
  SYSReqAuth = require("../../SYSReqAuth");
  exists = true;
}catch{
  SYSReqAuth = null;
  exists = false;
}

let SYSAPICtrl;
try {
  SYSAPICtrl = require("../../SYSAPICtrl");
}catch{
  SYSAPICtrl = null;
}

let SYSAuthCtrl;
try {
  SYSAuthCtrl = require("../../SYSAuthCtrl");
}catch{
  SYSAuthCtrl = null;
}

/**
 * @type {[String]}
 */
let SYSAPI;
try {
  SYSAPI = require("../../SYSAPI");
}catch{
  SYSAPI = [];
}

function ObjectToTree(src, origin = null, result = null, stack = null, level = ""){
  if (!result) result = {};
  if (!stack) stack = [];
  _.map(src, (o, i) => {
    let nextlevel = level + (level === ""? i : ("/" + i)); 
    if(_.isFunction(o)){
      stack.push(nextlevel);
      result[i] = origin && origin[i]? origin[i] : {
        reqAuth: "",
        reqFunc: "",
        reqGroup: "",
        reqRole: ""
      };
    }else{
      let res = ObjectToTree(o, origin && origin[i], result[i], stack, nextlevel);
      result[i] = res.result;
      stack = res.stack;
    }
  });
  return {result, stack};
}

( async () => {

  //extract core
  let {result, stack} = ObjectToTree(core, _.cloneDeep(SYSReqAuth));
  let newSYSReqAuth = result;
  let treeJSON = JSON.stringify(newSYSReqAuth, null, 2);
  let unquoted = treeJSON.replace(/"([^"]+)":/g, "$1:");

  //SYSAuthCtrl
  let newSYSAuthCtrl = AuthCtrl.SYSAuth2Ctrl(SYSAuth, SYSAuthCtrl);
  let newSYSAuthCtrlJSON = JSON.stringify(newSYSAuthCtrl, null, 2);

  let APIJSON = JSON.stringify(stack, null, 2);
  let APIJSONunquoted = APIJSON.replace(/"([^"]+)":/g, "$1:");

  let added = [];
  let deleted = SYSAPI;
  _.map(stack, (o, i) => {
    if(!SYSAPI.includes(o)){
      added.push(o);
    }else {
      deleted = _.filter(deleted, v => v !== o);
    }
  });

  //SYSAPICtrl
  let newSYSAPICtrl = {};
  _.map(stack, (o, i) => {
    if(SYSAPICtrl && SYSAPICtrl[o] !== undefined){
      newSYSAPICtrl[o] = SYSAPICtrl[o];
    }else{
      newSYSAPICtrl[o] = true;
    }
  });

  console.log(SYSAPI)

  let APICtrlJSON = JSON.stringify(newSYSAPICtrl, null, 2);

  Chalk.Title("APIReqAuth Summary");
  console.log(Chalk.Log("[-] Added API:\n" + Chalk.Color(added.join("\n"), "white")));
  console.log(Chalk.Log("[-] Deleted API:\n" + Chalk.Color(deleted.join("\n"), "white")));
  Chalk.Break();

  let comment = `/**
 * Code Generated for 3-Layer-API Authority Settings
 * reqAuth - Node exists in Authority Tree
 * reqFunc - Func String exists in Authority Tree Node Value
 * reqLevel - Level of assessment
 * reqGroup - Group assessment
 * reqRole - Role assessment
 * @typedef {{
 *    reqAuth: String, 
 *    reqFunc: String,
 *    reqLevel: Number,
 *    reqGroup: String,
 *    reqRole: String
 * }} auth
 * @type {Object.<string, Object.<string, Object.<string, auth>>}
 */`;

  await Fs.writeFile("SYSReqAuth.js", comment + "const SYSReqAuth = " + unquoted + ";\n\nmodule.exports = SYSReqAuth;");
  await Fs.writeFile("SYSAuthCtrl.js", "const SYSAuthCtrl = " + newSYSAuthCtrlJSON + ";\n\nmodule.exports = SYSAuthCtrl;");
  await Fs.writeFile("SYSAPI.js", "const SYSAPI = " + APIJSONunquoted + ";\n\nmodule.exports = SYSAPI;");
  await Fs.writeFile("SYSAPICtrl.js", "const SYSAPICtrl = " + APICtrlJSON + ";\n\nmodule.exports = SYSAPICtrl;");
  await Fs.writeFile("SYSAPI.txt", stack.join("\n"));

  console.log(Chalk.Log("[v]" + (exists? "[!]" : "") + " SYSReqAuth & APIList " + (exists ? "updated." : "generated.")));
})();