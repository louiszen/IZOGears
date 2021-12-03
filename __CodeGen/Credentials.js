const Fs = require("../_CoreWheels/Utils/Fs");
const Chalk = require("../_CoreWheels/Utils/Chalk/Chalk");

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
      envs: {
        local: {
          Path: ""
        }
        dev: {
          Path: ""
        }
      }
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
      envs: {
        local: {
          BASE: "http://",
          USERNAME: "root",
          PASSWORD: "root",
          URL: "localhost:5984"
        },
        dev: {
          BASE: "http://",
          USERNAME: "root",
          PASSWORD: "root",
          URL: "localhost:5984"
        }
      }
    },
    MongoDB: {
      envs: {
        local: {
          ConnectString: "",
          DATABASE: ""
        },
        dev: {
          ConnectString: "",
          DATABASE: ""
        }
      }
    }
  }
}

module.exports = SYSCredentials;`;

  let exists = await Fs.exists("SYSCredentials.js");

  if(!exists){
    await Fs.writeFile("SYSCredentials.js", syscredentials);
    console.log(Chalk.Log("[v] SYSCredentials.js generated."));
  }else{
    console.log(Chalk.Log("[!] SYSCredentials.js exists."));
  }

})();