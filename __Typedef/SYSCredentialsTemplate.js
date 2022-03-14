/**
 * @type {syscredentials}
 */
 const template = {
  ENV: "",
  Version: "",
  Server: {
    Https: {
      key: "",
      cert: "",
      intermediate: "",
      passphrase: ""
    }
  },
  Email: {
    Service: "",
    Sender: "",
    User: "",
    Password: ""
  },
  SMS: {
    User: "",
    Password: "",
    PATH: ""
  },
  Authentication: {
    Password: {
      HashSeed: ""
    },
    MSAL: {
      auth: {
        clientId: "",
        authority: "",
        redirectUri: ""
      },
      cache: {
        cacheLocation: "",
        storeAuthStateInCookie: true
      }
    }
  },
  Authorization: {
    JWT: {
      TokenSecret: "",
      Expire: 1000 * 60 * 60 * 24 * 7
    },
    GAuthZ: {
      Path: ""
    }
  },
  BaseDB: {
    CouchDB: {
      BASE: "",
      USERNAME: "",
      PASSWORD: "",
      URL: ""
    },
    Cloudant: {
      USERNAME: "",
      APIKEY: ""
    }, 
    MongoDB: {
      ConnectionString: "",
      DATABASE: ""
    }
  },
  External: {
    ApplicationInsights: {
      ConnectionString: ""
    },
    AzureStorageBlob: {
      Account: "",
      AccountKey: ""
    }
  }
};

module.exports = template;