const _Generic = require("../Tables");

const Add = require('./Add');
const Delete = _Generic.Delete;
const DeleteBulk = _Generic.DeleteBulk;
const Duplicate = require('./Duplicate');
const Edit = require('./Edit');
const Export = _Generic.Export;
const Get = _Generic.Get;
const Import = require('./Import');
const Info = _Generic.Info;
const List = _Generic.List;
const Replace = _Generic.Replace;
const SortedList = _Generic.SortedList;

module.exports = {
  Add,
  Delete,
  DeleteBulk,
  Duplicate,
  Edit,
  Export,
  Get,
  Import,
  Info,
  List,
  Replace,
  SortedList
}