const Fs = require("../_CoreWheels/Utils/Fs");
const Chalk = require("../_CoreWheels/Utils/Chalk/Chalk");
const SYSGeneral = require("../../__SYSDefault/SYSGeneral");

( async () => {

  let syscredentials = `/**
  * @type {syscredentials}
  */
const SYSCredentials = {
  ENV: "local",
  Version: "0.0.1",
  Authentication: {
    MSAL: {
      auth: {
        clientId: "",
        authority: "",
        redirectUri: ""
      }
    },
  },
  Authorization: {
    JWT: {
      TokenSecret: "QSK_BE",
      Expire: 1000 * 60 * 60 * 24 * 7
    },
    GAuthZ: {
      Path: ""
    }
  },
  Email: {
    sender: "",
    user: "",
    pass: ""
  },
  SMS: {
    PATH: ""
  },
  BaseDB: {
    CouchDB: {
      BASE: "http://",
      USERNAME: "root",
      PASSWORD: "root",
      URL: "localhost:5984"
    },
    MongoDB: {
      ConnectString: "",
      DATABASE: ""
    }
  }
}

module.exports = SYSCredentials;`;

  let filename = SYSGeneral.ID.toLowerCase() + "_SYSCredentials.js";
  let exists = await Fs.exists(filename);

  if(!exists){
    await Fs.writeFile(filename, syscredentials);
    console.log(Chalk.Log("[v] " + filename + " generated."));
  }else{
    console.log(Chalk.Log("[!] " + filename + " exists."));
  }

})();