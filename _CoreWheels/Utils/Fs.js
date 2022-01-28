const fs = require("fs");
const mkdir = require("make-dir");
const rimraf = require("rimraf");
const path = require("path");

const { promisify } = require("util");

function copyFileSync( source, target ) {

  let targetFile = target;

  // If target is a directory, a new file with the same name will be created
  if ( fs.existsSync( target ) ) {
    if ( fs.lstatSync( target ).isDirectory() ) {
      targetFile = path.join( target, path.basename( source ) );
    }
  }
  fs.writeFileSync(targetFile, fs.readFileSync(source));
}

function copyFolderRecursiveSync( source, target ) {
  let files = [];

  // Check if folder needs to be created or integrated
  let targetFolder = path.join( target, path.basename( source ) );
  if ( !fs.existsSync( targetFolder ) ) {
    fs.mkdirSync( targetFolder );
  }

  // Copy
  if ( fs.lstatSync( source ).isDirectory() ) {
    files = fs.readdirSync( source );
    files.forEach( function ( file ) {
      var curSource = path.join( source, file );
      if ( fs.lstatSync( curSource ).isDirectory() ) {
        copyFolderRecursiveSync( curSource, targetFolder );
      } else {
        copyFileSync( curSource, targetFolder );
      }
    });
  }
}

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
  readdirSync: fs.readFileSync, 
  copyFileSync: copyFileSync,
  copyFolderRecursiveSync: copyFolderRecursiveSync
};