/**
 * @typedef {("Username-Password" 
 *  | "MSAL" | "SMSOTP" | "EmailOTP"
 *  | "GitHub" | "Facebook" | "Instagram"
 *  | "Twitter" | "Google" | "LinkedIn")} authMethod
 * 
 * @typedef {("CouchDB" | "Cloudant" | "MongoDB")} provider
 * 
 * @typedef {{
 *  Server: {
 *    Port: Number,
 *    UseHttps: Boolean,
 *  },
 *  Authentication: {
 *    Method: authMethod | [authMethod],
 *    TwoFactorExpires: Number,
 *    SeedChecking: Boolean
 *  },
 *  Authorization: {
 *    Method: "JWT",
 *    GAuthZ: Boolean
 *  },
 *  Debug: {
 *    Console: Boolean,
 *    Color: Boolean
 *  },
 *  Init: {
 *    OnStart: Boolean,
 *    CleanDB: Boolean,
 *    Backup: Boolean,
 *  },
 *  SyncOnLoad: {
 *    SysGAuth: Boolean,
 *    GAuth: Boolean
 *  },
 *  RecoverDBOnLoad: {
 *    Check: Boolean,
 *    Create: Boolean,
 *    InitDocs: Boolean
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
 *    Gate: Number,
 *    Auth: Number
 *  },
 *  External: {
 *    ApplicationInsights: Boolean
 *  }
 * }} sysconfig
 */