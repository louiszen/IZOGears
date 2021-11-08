const _base = require("$/IZOGears/_CoreWheels");

const AllAuth = require("$/__SYSDefault/AllAuth");

const {Response} = _base.Utils;

/* IMPORTANT: Generic Scripts Automation depends on FOLDER name */

module.exports = async (_opt, _param) => {

  let rtn = AllAuth;

  if(rtn.Success){
    return Response.Send(true, rtn, "");
  }else{
    return Response.SendError(9001, rtn.payload);
  }

};