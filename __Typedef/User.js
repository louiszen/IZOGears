/**
 * @typedef {{
 *  _id: String,
 *  projectID: String,
 *  projectname: String,
 *  active: Boolean,
 *  APIKEY: String,
 *  SYSAuth: sysauth,
 *  SYSAuthCtrl: {
 *    Level: Object.<string, Boolean>,
 *    Groups: Object.<string, Boolean>,
 *    Roles: Object.<string, Boolean>,
 *    AuthTree: Object.<string, Boolean>,
 *    Users: Object.<string, Boolean>,
 *  },
 *  SYSAPI: [String],
 *  SYSAPICtrl: Object.<string, Boolean>,
 *  SYSReqAuth: *,
 *  userDB: String,
 *  roleDB: String,
 *  groupDB: String,
 *  metaDB: String,
 *  ticketDB: String,
 *  lastUpdatedAt: String,
 *  lastUpdatedBy: String,
 *  createdAt: String,
 *  createdBy: String
 * }} sys
 * 
 * @typedef {{
 *  _id: String,
 *  password: String,
 *  UserDisplayName: String,
 *  Company: String,
 *  Email: String,
 *  TelNo: String,
 *  Version: Number,
 *  Level: Number,
 *  Groups: [{
 *    ID: String,
 *    override?: Object.<string, Boolean>
 *  }],
 *  Role: String,
 *  override?: Object.<string, Boolean>
 * }} sysuser
 * 
 * @typedef {{
 *  _id: String,
 *  name: {
 *    EN: String,
 *    TC: String
 *  },
 *  authority: *
 * }} userrole
 * 
 * @typedef {{
 *  _id: String,
 *  name: {
 *    EN: String,
 *    TC: String
 *  },
 *  users: [String]
 * }} usergroup
 */