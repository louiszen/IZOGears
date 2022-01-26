const DEVUSER = require("../../../__SYSDefault/DevUser");

/**
 * @type {usergroup}
 */
const doc = {
  _id: "J0000",
  name: {
    EN: "Dev Project Group (J0000)",
    TC: "開發者項目群組 (J0000)"
  },
  userCtrl: {
    [DEVUSER._id]: true
  },
  users: [{username: DEVUSER._id, role: "SYSDevs", level: 0}]
};

module.exports = doc;