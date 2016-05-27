#! /usr/local/bin/node
process.absolute = __filename; // hack adding absolute path to global process object
require('./dist/app.js');
