const _base = require("$/IZOGears/__ZBase");
const _config = require("$/__SYSDefault/SYSConfig");
const Version = require("$/Version");

const {Response} = _base.Utils; 

module.exports = async (_opt) => {

  let rtn = {
    Name: _config.General.Name, 
    Env: process.env.NODE_ENV,
    backendVersion: Version
  };

  return Response.Send(true, rtn, "");

};