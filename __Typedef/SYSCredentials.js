/**
 * @typedef {{
 *  ENV: String,
 *  Version: String,
 *  Server: {
 *    Https?: {
 *      key: String,
 *      cert: String,
 *      intermediate: String,
 *      passphrase: String
 *    }
 *  },
 *  Email: {
 *    Service: String,
 *    Sender: String,
 *    User: String,
 *    Password: String
 *  },
 *  SMS: {
 *    User: String,
 *    Password: String,
 *    PATH: String
 *  },
 *  Authentication: {
 *    Password: {
 *      HashSeed: String
 *    },
 *    MSAL?: {
 *      auth: {
 *        clientId: String,
 *        authority: String,
 *        redirectUri: String
 *      },
 *      cache?: {
 *        cacheLocation: String,
 *        storeAuthStateInCookie: Boolean
 *      }
 *    }
 *  },
 *  Authorization: {
 *    JWT?: {
 *      TokenSecret: String,
 *      Expire: Number
 *    },
 *    GAuthZ?: {
 *      Path: String
 *    }
 *  },
 *  BaseDB: {
 *    CouchDB?: {
 *      BASE: String,
 *      USERNAME: String,
 *      PASSWORD: String,
 *      URL: String
 *    },
 *    Cloudant?: {
 *      USERNAME: String,
 *      APIKEY: String
 *    }, 
 *    MongoDB?: {
 *      ConnectString: String,
 *      DATABASE: String
 *    } | {
 *      BASE: String,
 *      USERNAME: String,
 *      PASSWORD: String,
 *      URL: String,
 *      DATABASE: String
 *    }
 *  },
 *  External: {
 *    ApplicationInsights?: {
 *      ConnectionString: String
 *    },
 *    AzureBlobStorage?: {
 *      Account: String,
 *      AccountKey: String
 *    }
 *  }
 * }} syscredentials
 */

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
    } | {
      BASE: "",
      USERNAME: "",
      PASSWORD: "",
      URL: "",
      DATABASE: ""
    }
  },
  External: {
    ApplicationInsights: {
      ConnectionString: ""
    },
    AzureBlobStorage: {
      Account: "",
      AccountKey: ""
    }
  }
};

module.exports = template;