const Fs = require("../_CoreWheels/Utils/Fs");
const Chalk = require("../_CoreWheels/Utils/Chalk/Chalk");

( async () => {
  Fs.copyFolderRecursiveSync("./IZOGears/__CodeGen/cpfiles/.custom-template", "./");
  console.log(Chalk.Log("[o] Copied files to .custom-template to root. "));
  Fs.copyFolderRecursiveSync("./IZOGears/__CodeGen/cpfiles/.vscode", "./");
  console.log(Chalk.Log("[o] Copied files to .vscode to root. "));
})();