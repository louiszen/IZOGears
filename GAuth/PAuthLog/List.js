const LAuth = require("../../COGS/Log/LAuth");
const _base = require("../../_CoreWheels");


const {Response, Time} = _base.Utils;

/* IMPORTANT: Generic Scripts Automation depends on FOLDER name */

module.exports = async (_opt, _param, _username) => {

  let {data} = _opt;
  let {timerange} = data;

  let docs = await LAuth.DocsWithin(Time.Moment(timerange[0]), Time.Moment(timerange[1]));

  return Response.Send(true, docs, "");

};