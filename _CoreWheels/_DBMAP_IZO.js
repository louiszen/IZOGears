/**
 * keys start with _ OR end with $ 
 * will NOT automatically create on initialization
 * which are used for combination or runtime purpose.
 */

/**
 * @typedef {{
 *   User: "user",
 *   Config: "config",
 *   AllUsers: "allusers",
 *   UserRole: "userrole",
 *   ResGroup: "resgroup",
 *   AuthLog$: "xauthlog",
 *   Meta: "meta",
 *   Ticket: "ticket"
 * }} dbmapizo
 * 
 * @type {dbmapizo}
 */
 const _DBMAP_IZO = {
  User: "user",
  Config: "config",
  AllUsers: "allusers",
  UserRole: "userrole",
  ResGroup: "resgroup",
  AuthLog$: "xauthlog",
  Meta: "meta",
  Ticket: "ticket",
};

module.exports = _DBMAP_IZO;