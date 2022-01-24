/**
 * This script is to generate *_SYSCredentials.js for Credential settings.
 * 
 * Use `npm run credentials` to run this script.
 */

const Fs = require("../_CoreWheels/Utils/Fs");
const Chalk = require("../_CoreWheels/Utils/Chalk/Chalk");
const SYSGeneral = require("../../__SYSDefault/SYSGeneral");
const ZGen = require("../_CoreWheels/Utils/ZGen");

( async () => {

  let token = ZGen.Key(16, 0b0011);
  let expires = 1000 * 60 * 60 * 24 * 7;

  let syscredentialsJSON = `
{
  "ENV": "local",
  "Version": "0.0.1",
  "Authentication": {
    "MSAL": {
      "auth": {
        "clientId": "",
        "authority": "",
        "redirectUri": ""
      }
    }
  },
  "Authorization": {
    "JWT": {
      "TokenSecret": "${token}",
      "Expire": "${expires}"
    },
    "GAuthZ": {
      "Path": ""
    }
  },
  "Email": {
    "Service": "",
    "Sender": "",
    "User": "",
    "Password": ""
  },
  "SMS": {
    "PATH": ""
  },
  "BaseDB": {
    "CouchDB": {
      "BASE": "http://",
      "USERNAME": "root",
      "PASSWORD": "root",
      "URL": "localhost:5984"
    },
    "MongoDB": {
      "ConnectString": "",
      "DATABASE": ""
    }
  }
}
`;

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
      TokenSecret: "${token}",
      Expire: 1000 * 60 * 60 * 24 * 7
    },
    GAuthZ: {
      Path: ""
    }
  },
  Email: {
    Service: "",
    Sender: "",
    User: "",
    Password: ""
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

  let filenameJSON = SYSGeneral.ID.toLowerCase() + "_SYSCredentials.json";
  let existsJSON = await Fs.exists(filenameJSON);

  if(!existsJSON){
    await Fs.writeFile(filenameJSON, syscredentialsJSON);
    console.log(Chalk.Log("[v] " + filenameJSON + " generated."));
  }else{
    console.log(Chalk.Log("[!] " + filenameJSON + " exists."));
  }

})();