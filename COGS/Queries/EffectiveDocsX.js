const _base = require("$/IZOGears/_CoreWheels");
const _remote = require("$/remoteConfig");
const _DBMAP = require("$/__SYSDefault/_DBMAP");

const _ = require("lodash");

const {Chalk, Time} = _base.Utils;

class EffectiveDocsX {

  static async GetAllWithin(dbKey, refID, dateStart, dateEnd){
    let db = await _remote.BaseDB();
    let dbname = _DBMAP[dbKey];

    let res = await db.Find(dbname, {
      refID: {
        $eq: refID
      }
    });
    
    if(!res.Success){
      let msg = res.payload.Message;
      console.log(Chalk.CLog("[!]", msg, [this.name]));
      return {
        Success: false,
        message: msg
      };
    }

    let docs = res.payload;
    docs = docs.filter(o => Time.Moment(o.effective.Start) < dateEnd && (!o.effective.End || Time.Moment(o.effective.End) > dateStart));

    return {
      Success: true,
      payload: docs
    };
  }

  static async GetAllUnique(dbKey, date){
    let db = await _remote.BaseDB();
    let dbname = _DBMAP[dbKey];

    let res = await db.Find(dbname, {});

    if(!res.Success){
      let msg = res.payload.Message;
      console.log(Chalk.CLog("[!]", msg, [this.name]));
      return {
        Success: false,
        message: msg
      };
    }

    let docs = res.payload;
    docs = docs.filter(o => Time.Moment(o.effective.Start) < date && (!o.effective.End || Time.Moment(o.effective.End) > date));
    let temp = [];
    let rtnDocs = [];

    _.map(docs, (o, i) => {
      let existDoc = _.find(temp, v => v.refID === o.refID);
      if(existDoc){
        if(!_.isNull(existDoc.endDate)){
          if(existDoc.endDate < o.effective.End){
            temp = temp.filter(v => v.refID !== existDoc.refID);
            temp.push({
              refID: o.refID,
              endDate: o.effective.End,
              _id: o._id
            });
          }
        }
      }else{
        temp.push({
          refID: o.refID,
          endDate: o.effective.End,
          _id: o._id
        });
      }
    });

    _.map(temp, (o, i) => {
      let doc = _.find(docs, v => v._id === o._id);
      rtnDocs.push(doc);
    });

    return {
      Success: true,
      payload: rtnDocs
    };
  }

  static async GetByRefID(dbKey, refID, date){
    let db = await _remote.BaseDB();
    let dbname = _DBMAP[dbKey];

    let res = await db.Find(dbname, {
      refID: {
        $eq: refID
      }
    });

    if(!res.Success){
      let msg = res.payload.Message;
      console.log(Chalk.CLog("[!]", msg, [this.name]));
      return {
        Success: false,
        message: msg
      };
    }

    let docs = res.payload;
    docs = docs.filter(o => Time.Moment(o.effective.Start) < date && (!o.effective.End || Time.Moment(o.effective.End) > date));
    let doc = null;
    if(docs.length == 0){
      let msg = "Cannot find related documents.";
      return {
        Success: false,
        message: msg
      };
    }else if(docs.length > 1){
      doc = _.find(docs, o => _.isNull(o.effective.End));
    }else{
      doc = docs[0];
    }

    let expired = false;

    if(doc.effective){
      if(!_.isNull(doc.effective.End)){
        let endTime = Time.Parse(doc.effective.End);
        if(endTime < Time.Now()){
          expired = true;
        }
      }
    }

    return {
      Success: true,
      payload: {
        doc: doc,
        expired: expired
      }
    };
  }


}

module.exports = EffectiveDocsX;