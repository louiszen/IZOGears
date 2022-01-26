/**
 * keys start with _ OR end with $ 
 * will NOT automatically create on initialization
 * which are used for combination or runtime purpose.
 */

/**
 * @typedef {{
 *   User: String,
 *   Config: String,
 *   Company: String,
 *   UserRole: String,
 *   ResGroup: String,
 *   AuthLog$: String,
 *   Meta: String,
 *   Ticket: String
 * }} dbmapizo
 * 
 * @type {dbmapizo}
 */
 const _DBMAP_IZO = {
  User: "user",
  Config: "config",
  Company: "company",
  UserRole: "userrole",
  ResGroup: "resgroup",
  AuthLog$: "xauthlog",
  Meta: "meta",
  Ticket: "ticket",
};

module.exports = _DBMAP_IZO;