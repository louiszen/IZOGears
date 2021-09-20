const _Generic = require("../WithLastUpdate");

const Add = require('./Add');
const Delete = _Generic.Delete;
const DeleteBulk = _Generic.DeleteBulk;
const Duplicate = _Generic.Duplicate;
const Edit = _Generic.Edit;
const Export = _Generic.Export;
const Get = _Generic.Get;
const Import = _Generic.Import;
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