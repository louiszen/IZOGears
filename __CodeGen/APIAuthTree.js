const _ = require("lodash");

const core = require("../../__SYSDefault/APIConfig/cores");
const { Fs } = require("../_CoreWheels/Utils");

let APIAuthTree;
try {
  APIAuthTree = require("../../APIAuthTree");
}catch{
  APIAuthTree = null;
}

function ObjectToTree(src, result = null){
  if (!result) result = {};
  _.map(src, (o, i) => {
    if(_.isFunction(o)){
      result[i] = result[i]? result[i] : {
        reqAuth: "",
        reqFunc: "",
        reqLevel: Number.MAX_SAFE_INTEGER,
        reqGroup: "",
        reqRole: ""
      };
    }else{
      result[i] = ObjectToTree(o, result[i]);
    }
  });
  return result;
}

( async () => {

  //extract core
  let newAPIAuthTree = ObjectToTree(core, _.cloneDeep(APIAuthTree));
  let treeJSON = JSON.stringify(newAPIAuthTree, null, 2);
  let unquoted = treeJSON.replace(/"([^"]+)":/g, '$1:');

  let comment = `
/**
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

  await Fs.writeFile("APIAuthTree.js", comment + "const APIAuthTree = " + unquoted + ";\n\nmodule.exports = APIAuthTree;");

})();