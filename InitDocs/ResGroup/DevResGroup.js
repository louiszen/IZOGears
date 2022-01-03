const DEVUSER = require("../../../__SYSDefault/DevUser");

/**
 * @type {usergroup}
 */
const doc = {
  _id: "DevResGroup",
  name: {
    EN: "Dev Resources Group",
    TC: "開發者資源組"
  },
  userCtrl: {
    [DEVUSER._id]: true
  },
  users: [{username: DEVUSER._id, role: "Devs", level: 0}]
};

module.exports = doc;