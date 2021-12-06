const http = require("http");
const https = require("https");
const nomalizePort = require("normalize-port");

const IZOGearsVersion = require("../../Version");
const Fs = require("./Fs");
const Chalk = require("./Chalk/Chalk");
const Time = require("./Time");
const SYSCredentials = require("../../SYSCredentials");
const SYSGeneral = require("../../../__SYSDefault/SYSGeneral");

class ZServer {

  /**
   * serverConfig: {
   *  port: 5034,
   *  domain: "https://robot.mobinology.com:3300",
   *  useHttps: true, 
   *  https: {
   *    key: "../../151.key",
   *    cert: "../../151.crt",
   *    intermediate: "../../intermediate.crt",
   *    passphrase: "P@ssw0rd"
   *  }
   * }
   * 
   * @param {{
   *  Port: Number,
   *  UseHttps: Boolean,
   * }} serverConfig 
   * @param {{
   *  Https?: {
   *    key: String,
   *    cert: String,
   *    intermediate: String,
   *    passphrase: String
   *  }
   * }} serverCredentials
   * @param {*} app 
   * @param {Boolean} showConsole
   */
  static async Start(serverConfig, serverCredentials, app, showConsole = true){
    let server;
    let useHttps = serverConfig.UseHttps;

    let _PORT = null;
    if(process.env.SERVER_PORT){
      console.log(Chalk.Log("[!] Using SERVER_PORT from .env", [], false));
      _PORT = process.env.SERVER_PORT;
    }

    const port = nomalizePort(_PORT || serverConfig.Port);

    if(useHttps){
      try{
        let credentials = {
          key: await Fs.readFile(serverCredentials.Https.key),
          cert: await Fs.readFile(serverCredentials.Https.cert),
          ca: await Fs.readFile(serverCredentials.Https.intermediate),
          passphrase: serverCredentials.Https.passphrase
        };
        server = https.createServer(credentials, app);
      }catch(e){
        useHttps = false;
        server = http.createServer(app);
      }
    }else{
      server = http.createServer(app);
    }

    const Messages = [
      "[-] PROJECT: " + Chalk.Color(SYSGeneral.Name.toUpperCase(), "BrightWhite"),
      "[-] ENV: " +  SYSCredentials.ENV.toUpperCase(),
      "[-] IZOGears Version: " + IZOGearsVersion,
      "[-] NodeJS Version: " + process.version,
      "[-] Credentials Version: " + SYSCredentials.Version,
      "[-] Running Port: " + port,
      "[-] Https: " + (useHttps ? "YES" : "NO"),
      "[-] Start Time: " + Time.Now().toLocaleString()
    ];
    
    server.listen(port, "0.0.0.0", () => {
      Messages.forEach(e => console.log(Chalk.Log(e, [], false)));
      Chalk.Break();
      if(!showConsole){
        console.log(Chalk.Log("[!] Console Log Disabled."));
        console.log = () => {};
        Chalk.Log = (msg) => msg;
      } 
    });
  }
}

module.exports = ZServer;