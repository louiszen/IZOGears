/**
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