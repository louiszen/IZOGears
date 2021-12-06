const SYSCredentials = require("../../../SYSCredentials");
const Version = require("../../../Version");
const SYSConfig = require("../../../__SYSDefault/SYSConfig");
const SYSGeneral = require("../../../__SYSDefault/SYSGeneral");
const { Response } = require("../../_CoreWheels/Utils");

module.exports = async (_opt) => {

  let rtn = {
    Name: SYSGeneral.Name, 
    Env: SYSCredentials.ENV,
    backendVersion: Version,
    Authentication: SYSConfig.Authentication.Method,
    Authorization: SYSConfig.Authorization.Method
  };

  return Response.Send(true, rtn, "");

};