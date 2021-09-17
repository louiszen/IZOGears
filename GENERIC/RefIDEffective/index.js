const _Generic = require("../WithLastUpdate");

const Add = require('./Add');
const Delete = _Generic.Delete;
const DeleteBulk = _Generic.DeleteBulk
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
  Edit,
  Export,
  Get,
  Import,
  Info,
  List,
  Replace,
  SortedList
}