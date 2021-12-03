/**
 * @typedef {("Username-Password" 
 *  | "MSAL" | "SMSOTP" | "EmailOTP"
 *  | "GitHub" | "Facebook" | "Instagram"
 *  | "Twitter" | "Google" | "LinkedIn")} authMethod
 * 
 * @typedef {("CouchDB" | "Cloudant" | "MongoDB")} provider
 * 
 * @typedef {{
 *  General: {
 *    ID: String,
 *    Name: String
 *  },
 *  Server: {
 *    Port: Number,
 *    UseHttps: Boolean,
 *  },
 *  Authentication: {
 *    Method: authMethod | [authMethod],
 *    TwoFactorExpires: Number
 *  },
 *  Authorization: {
 *    Method: "JWT",
 *    GAuthZ: Boolean
 *  },
 *  Debug: {
 *    Console: Boolean,
 *    Color: Boolean,
 *    InstanceID: Boolean
 *  },
 *  Init: {
 *    OnStart: Boolean,
 *    CleanDB: Boolean
 *  },
 *  BaseDB: {
 *    Provider: provider,
 *    Backup: {
 *      Include?: "All" | [String],
 *      Exclude?: [String]
 *    },
 *  },
 *  Blob: {
 *    Provider: "Local",
 *    Local?: {
 *      Path: {
 *        Upload: String,
 *        Download: String
 *      }
 *    }
 *  },
 *  LogKeep: {
 *    Request: Number,
 *    SignIn: Number,
 *    Gate: Number
 *  }
 * }} sysconfig
 */