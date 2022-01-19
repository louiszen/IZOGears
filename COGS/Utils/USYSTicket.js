const _remote = require("../../../remoteConfig");
const _DBMAP = require("../../../__SYSDefault/_DBMAP");
const { Time, ZGen } = require("../../_CoreWheels/Utils");

class USYSTicket {

  static __TYPE = {
    BUG: 0,
    REQUEST: 1
  };

  static __CODE = {
    SUBMITTED: 0,
    REVIEWED: 1,
    FOLLOWUP: 2,
    INPROGRESS: 3,
    ONHOLD: 4,
    PENDING: 5,
    RESOLVED: 6,
    CLOSED: 7
  };

  static async SubmitBugReport(severity, discipline, description, _username){
    let db = await _remote.BaseDB();
    let doc = {
      _id: Time.Now().format("YYYYMMDD") + "_" + ZGen.Key(12, 0b0111),
      severity: severity,
      type: this.__TYPE.BUG,
      discipline: discipline,
      description: description,
      status: this.__CODE.SUBMITTED,
      createdAt: Time.Now(),
      createdBy: _username,
      assignedTo: null,
      assignedBy: null,
      assignedAt: null,
      comment: "",
      lastModifiedBy: null,
      lastModifiedAt: null
    };

    return await db.Update(_DBMAP.Ticket, doc);
  }
}

module.exports = USYSTicket;