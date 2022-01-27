const { Time } = require("../../../IZOGears/_CoreWheels/Utils");
// eslint-disable-next-line no-unused-vars
const moment = require("moment");

/**
 * @type {{
 *  _id: "INITIALIZED",
 *  Created: moment.Moment
 * }}
 */
const doc = {
  _id: "INITIALIZED",
  Created: Time.Now().toISOString(),
};

module.exports = doc;
