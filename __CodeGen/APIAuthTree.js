const _ = require("lodash");

const core = require("../../__SYSDefault/APIConfig/cores");
const { Fs } = require("../_CoreWheels/Utils");

let APIAuthTree;
try {
  APIAuthTree = require("../../APIAuthTree");
}catch{
  APIAuthTree = null;
}

function ObjectToTree(src, result = null, stack = null, level = ""){
  if (!result) result = {};
  if (!stack) stack = [];
  _.map(src, (o, i) => {
    let nextlevel = level + (level === ""? i : ("/" + i)); 
    if(_.isFunction(o)){
      stack.push(nextlevel);
      result[i] = result[i]? result[i] : {
        reqAuth: "",
        reqFunc: "",
        reqGroup: "",
        reqRole: ""
      };
    }else{
      let res = ObjectToTree(o, result[i], stack, nextlevel);
      result[i] = res.result;
      stack = res.stack;
    }
  });
  return {result, stack};
}

( async () => {

  //extract core
  let {result, stack} = ObjectToTree(core, _.cloneDeep(APIAuthTree));
  let newAPIAuthTree = result;
  let treeJSON = JSON.stringify(newAPIAuthTree, null, 2);
  let unquoted = treeJSON.replace(/"([^"]+)":/g, '$1:');

  let comment = `
/**
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
 */
`;

  await Fs.writeFile("SYSAuthTree.js", comment + "const SYSAuthTree = " + unquoted + ";\n\nmodule.exports = SYSAuthTree;");
  await Fs.writeFile("SYSAPI.txt", stack.join("\n"));
})();