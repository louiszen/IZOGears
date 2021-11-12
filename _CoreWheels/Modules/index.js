const Database = require("./Database/Database");
const MongoDB = require("./Database/NoSQL/MongoDB/MongoDB");
const CouchDB = require("./Database/NoSQL/CouchDB/CouchDB");
const DesignDoc = require("./Database/NoSQL/CouchDB/DesignDocs");

/**
 * Generic Module for External Libraries
 */
module.exports = {
  Database,
  MongoDB,
  CouchDB,
  DesignDoc
};