const SYSAuth = require("../../../__SYSDefault/SYSAuth");
const SYSGeneral = require("../../../__SYSDefault/SYSGeneral");
const { AuthCtrl } = require("../../COGS/Utils");
const SYSAPI = require("../../../SYSAPI");
const SYSReqAuth = require("../../../SYSReqAuth");
const DevUser = require("../../../__SYSDefault/DevUser");
const DevResGroup = require("../ResGroup/J0000");
const _DBMAP = require("../../../__SYSDefault/_DBMAP");
const { Time } = require("../../_CoreWheels/Utils");
const _ = require("lodash");

SYSAuth.Groups = [DevResGroup._id];
SYSAuth.Users = [DevUser._id];
let SYSAuthCtrl = AuthCtrl.SYSAuth2Ctrl(SYSAuth);

let SYSAPICtrl = {};
_.map(SYSAPI, (o, i) => {
  SYSAPICtrl[o] = true;
});

let doc = {
  _id: "PROJECT",
  projectID: SYSGeneral.ID.toLowerCase(),
  projectname: SYSGeneral.Name,
  active: true,
  APIKEY: null,
  SYSAuth: SYSAuth,
  SYSAuthCtrl: SYSAuthCtrl,
  SYSAPI: SYSAPI,
  SYSAPICtrl: SYSAPICtrl,
  SYSReqAuth: SYSReqAuth,
  userDB: _DBMAP.User,
  roleDB: _DBMAP.UserRole,
  groupDB: _DBMAP.ResGroup,
  logDB: _DBMAP.AuthLog,
  metaDB: _DBMAP.Meta,
  ticketDB: _DBMAP.Ticket,
  lastUpdatedAt: Time.Now().toISOString(),
  lastUpdatedBy: DevUser._id,
  createdAt: Time.Now().toISOString(),
  createdBy: DevUser._id
};

module.exports = doc;