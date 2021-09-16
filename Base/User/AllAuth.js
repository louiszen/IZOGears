const _base = require('../../__ZBase');
const _remote = require('../../../remoteConfig');

const path = require('path');
const catName = path.basename(__dirname);
const actName = path.basename(__filename, path.extname(__filename));

const _ = require('lodash');
const AllAuth = require('../../../__SYSDefault/AllAuth');

const {Chalk, Response} = _base.Utils;

/* IMPORTANT: Generic Scripts Automation depends on FOLDER name */

module.exports = async (_opt, _param) => {

  let rtn = AllAuth;

  if(rtn.Success){
    return Response.Send(true, rtn, "");
  }else{
    return Response.SendError(9001, rtn.payload);
  }

}