const _base = require('../../__ZBase');
const _remote = require('$/remoteConfig');

const path = require('path');
const catName = path.basename(__dirname);
const actName = path.basename(__filename, path.extname(__filename));

const _ = require('lodash');

const {Chalk, Response, Time} = _base.Utils;

/* IMPORTANT: Generic Scripts Automation depends on FOLDER name */

module.exports = async (_opt, _param) => {

  let db = await _remote.BaseDB();
  let dbname = await _remote.GetDBName(_param.subcat);

  let now = Time.Now().toISOString();

  let refID = _opt.data.refID;

  _opt.data.lastUpdate = now;

  if(!_opt.data.effective.End){
    _opt.data.effective.End = null;
  }

  if(_opt.data.effective.Start){

    let res = await db.Find(dbname, {
      $or: [
        {
          refID: {
            $eq: refID
          },
          effective: {
            End: {
              $eq: null
            }
          }
        },
        {
          refID: {
            $eq: refID
          },
          effective: {
            End: {
              $exists: false
            }
          }
        }
      ]
    });

    if(res.Success){
      let oldDocs = res.payload.docs;
      let Start = Time.Parse(_opt.data.effective.Start, "YYYY/MM/DD HH:mm:ss");
      let newEnd = Start.add(-1, 'seconds');
      _.map(oldDocs, (o, i) => {
        o.effective.End = newEnd;
        o.lastUpdate = now;
      });

      res = await db.UpdateBulk(dbname, oldDocs);
      if(!res.Success){
        return Response.SendError(9001, res.payload);
      }
    }

  }


  let rtn = await db.Insert(dbname, _opt.data);  

  console.log(Chalk.CLog("[-]", _opt.data, [_param.subcat, _param.action]));

  if(!rtn.Success){
    return Response.SendError(9001, rtn.payload);
  }
  return Response.Send(true, rtn.payload, "");

}