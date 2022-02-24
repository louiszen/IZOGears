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
 *    AzureStorageBlob?: {
 *      Account: String,
 *      AccountKey: String
 *    }
 *  }
 * }} syscredentials
 */

 module.exports = {};