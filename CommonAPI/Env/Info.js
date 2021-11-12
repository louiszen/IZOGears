const Version = require("../../../Version");
const SYSConfig = require("../../../__SYSDefault/SYSConfig");
const { Response } = require("../../_CoreWheels/Utils");

module.exports = async (_opt) => {

  let rtn = {
    Name: SYSConfig.General.Name, 
    Env: process.env.NODE_ENV,
    backendVersion: Version,
    Authentication: SYSConfig.Authentication.Method,
    Authorization: SYSConfig.Authentication.Method
  };

  return Response.Send(true, rtn, "");

};