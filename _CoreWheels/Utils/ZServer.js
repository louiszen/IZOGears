const http = require("http");
const https = require("https");
const nomalizePort = require("normalize-port");

const IZOGearsVersion = require("$/IZOGears/Version");
const Fs = require("./Fs");
const Chalk = require("./Chalk/Chalk");
const Time = require("./Time");

const _config = require("$/__SYSDefault/SYSConfig");

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
   *  Https?: {
   *    key: String,
   *    cert: String,
   *    intermediate: String,
   *    passphrase: String
   * }} serverConfig 
   * @param {*} app 
   * @param {Boolean} showConsole
   */
  static async Start(serverConfig, app, showConsole = true){
    let server;
    let useHttps = serverConfig.UseHttps;
    const port = nomalizePort(serverConfig.Port);

    if(useHttps){
      try{
        let credentials = {
          key: await Fs.readFile(serverConfig.Https.key),
          cert: await Fs.readFile(serverConfig.Https.cert),
          ca: await Fs.readFile(serverConfig.Https.intermediate),
          passphrase: serverConfig.Https.passphrase
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
      "[-] PROJECT: " + Chalk.Color(_config.General.Name.toUpperCase(), "BrightWhite"),
      "[-] ENV: " + process.env.NODE_ENV.toUpperCase(),
      "[-] IZOGears Version: " + IZOGearsVersion,
      "[-] NodeJS Version: " + process.version,
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