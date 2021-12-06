require("dotenv").config();

/*
if(!process.env.NODE_ENV){
  console.error(".env is not found");
  process.exit();
}
*/

const _base = require("./_CoreWheels");
const SYSConfig = require("./SYSConfig");
const Version = require("../Version");
const {Chalk, ZServer} = _base.Utils;

Chalk.Guide();

const app = require("./app");
const SYSCredentials = require("./SYSCredentials");
const SYSGeneral = require("../__SYSDefault/SYSGeneral");

Chalk.Break();
Chalk.Title(SYSGeneral.Name + " (" + Version + ")");
ZServer.Start(SYSConfig.Server, SYSCredentials.Server, app, SYSConfig.Debug.Console);
