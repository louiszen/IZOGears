const fs = require("fs");
const mkdir = require("make-dir");
const rimraf = require("rimraf");

const { promisify } = require("util");

/**
 * Promisify fs module
 */
 module.exports = {
  ...fs.promises,
  mkdir: mkdir,
  rmdir: promisify(rimraf),
  exists: promisify(fs.exists),
  constants: fs.constants,
  createWriteStream: fs.createWriteStream,
  createReadStream: fs.createReadStream,
};