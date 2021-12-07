const _ = require("lodash");

const core = require("../../__SYSDefault/APIConfig/cores");
const { Fs, Chalk } = require("../_CoreWheels/Utils");

let SYSReqAuth;
let exists = false;
try {
  SYSReqAuth = require("../../SYSReqAuth");
  exists = true;
}catch{
  SYSReqAuth = null;
  exists = false;
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
  await Fs.writeFile("SYSAPI.txt", stack.join("\n"));

  console.log(Chalk.Log("[v]" + (exists? "[!]" : "") + " SYSReqAuth & APIList " + (exists ? "updated." : "generated.")));
})();