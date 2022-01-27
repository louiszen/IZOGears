const Fs = require("../_CoreWheels/Utils/Fs");
const Chalk = require("../_CoreWheels/Utils/Chalk/Chalk");

( async () => {
  Fs.copyFolderRecursiveSync("./.custom-template", "./IZOGears/__CodeGen/cpfiles/");
  console.log(Chalk.Log("[U][v] Updated files to .custom-template to cpfiles. "));
  Fs.copyFolderRecursiveSync("./.vscode", "./IZOGears/__CodeGen/cpfiles/");
  console.log(Chalk.Log("[U][v] Updated files to .vscode to cpfiles. "));
  Fs.copyFileSync("./package.json", "./IZOGears/__CodeGen/cpfiles/");
  console.log(Chalk.Log("[U][v] Updated files to package.json to cpfiles. "));
})();