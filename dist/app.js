/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.getVoteTitle = exports.annexCsvLine = exports.shouldHaveNumericalValues = undefined;

	var _fs = __webpack_require__(1);

	var _fs2 = _interopRequireDefault(_fs);

	var _readline = __webpack_require__(2);

	var _readline2 = _interopRequireDefault(_readline);

	var _fastCsv = __webpack_require__(4);

	var _fastCsv2 = _interopRequireDefault(_fastCsv);

	var _config = __webpack_require__(28);

	var _cli = __webpack_require__(29);

	var _cli2 = _interopRequireDefault(_cli);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

	var spawn = __webpack_require__(32).spawn;

	var pdftoTextProcess = function pdftoTextProcess() {
	  return spawn('pdftotext', ['-layout', '-f', _cli2.default.first, '-l', _cli2.default.last, _cli2.default.args[0]]);
	};

	// returns a file stream, which the csv stream pipes into
	var writableStream = function writableStream() {
	  var date = new Date();
	  var time = date.getTime();
	  var csvFileName = _cli2.default.name || time;
	  var stream = _fs2.default.createWriteStream(csvFileName + '.csv');
	  return stream;
	};

	// configuring csv stream object which feeds into the file stream
	var csvStream = function csvStream() {
	  var writeStream = writableStream();
	  var stream = _fastCsv2.default.createWriteStream({ headers: true });
	  // adding a transformation function that is responsible for the row titles
	  var transform = null;
	  if (_cli2.default.annex) {
	    transform = _config.transformForAnnexTables;
	  } else {
	    transform = _cli2.default.overview ? _config.transformOverview : _config.transformRegular;
	  }
	  stream.transform(transform).pipe(writeStream);
	  return stream;
	};

	// transform sentences to array and removes empty elements(space) in the array
	var csvLineTowrite = function csvLineTowrite(line) {
	  return line.split('  ').filter(function (word) {
	    return word.length > 1;
	  });
	};

	// we are only interested in sentence lines that have numerical values
	var shouldHaveNumericalValues = exports.shouldHaveNumericalValues = function shouldHaveNumericalValues(line) {
	  var chunkedLine = csvLineTowrite(line);
	  if (chunkedLine.length < 7) return false;
	  var lastValues = chunkedLine.slice(2, chunkedLine.length);
	  var values = lastValues.map(function (val) {
	    var value = val;
	    if (val.includes('N/A')) value = 0;
	    return parseInt(value, 10);
	  });
	  var isLineValid = values.every(function (val) {
	    return Number.isInteger(val);
	  });
	  return isLineValid;
	};
	var annexCsvLine = exports.annexCsvLine = function annexCsvLine(line) {
	  // get line name or title
	  var csvLine = csvLineTowrite(line);
	  var lineName = csvLine[0].replace(/^\s+/, '');
	  // remove lineName from line
	  var newLine = /[ab-z]/.test(lineName) ? line.replace(lineName, '') : line;
	  // replace all double spaces with single spaces
	  var chunkedLine = newLine.replace(/\s+/g, ' ').split(' ');
	  // console.log(lineName, lineName);
	  if (/^\d+/.test(lineName)) {
	    console.log(line);
	    return chunkedLine.filter(function (word) {
	      return word.length > 1;
	    });
	  }
	  // add lineName back to the newLine and remove any empty spaces
	  return [lineName].concat(_toConsumableArray(chunkedLine)).filter(function (word) {
	    return word.length > 1;
	  });
	};

	// coz of line numbers at the bottom of the page
	// the line is returned at the end of that number
	// hence turning out shorter
	// so we cache that line as prevShortLine and return false
	// then we wait for the next line which is also short and we add them together
	var prevShortLine = null;

	var writeLineForAnnexTables = function writeLineForAnnexTables(line, _ref) {
	  var title = _ref.title;
	  var stream = _ref.stream;

	  if (!title.includes('Annex')) return false;
	  var hasNumericalValues = shouldHaveNumericalValues(line);
	  if (!hasNumericalValues) return false;
	  var csvLine = annexCsvLine(line);
	  console.log('line length:', csvLine.length);
	  if (csvLine.length < 9) {
	    prevShortLine = [title].concat(_toConsumableArray(csvLine));
	    return false;
	  }
	  if (prevShortLine && csvLine.length < 19) {
	    // remove last item coz its just a page number
	    prevShortLine.pop();
	    stream.write([].concat(_toConsumableArray(prevShortLine), _toConsumableArray(csvLine)));
	    prevShortLine = null;
	    return true;
	  }
	  stream.write([title].concat(_toConsumableArray(csvLine)));
	  return true;
	};
	// function we use to writing out csv lines for regular tables
	// to the csv file
	var writeLineToFileRegular = function writeLineToFileRegular(line, _ref2) {
	  var title = _ref2.title;
	  var voteTitle = _ref2.voteTitle;
	  var stream = _ref2.stream;

	  if (title.includes('Overview of Vote Expenditures') || title.includes('Annex')) return false;
	  var hasNumericalValues = shouldHaveNumericalValues(line);
	  // check whether we have numbers after the first items in the array
	  if (!hasNumericalValues) return false;
	  var csvLine = csvLineTowrite(line);
	  if (csvLine.length !== 7) csvLine.splice(0, 2, csvLine[0] + ' ' + csvLine[1]);
	  stream.write([].concat(_toConsumableArray(csvLine), [title, voteTitle]));
	  return true;
	};

	// looks bad global variable FIXME
	// the missing value we are looking for is on a previous line
	// so we cache it till the line that needs it comes up and we use it
	// and we cant do that with in a function that is continuosly being called
	var missingValue = null;
	// function we use to writing out csv lines for the overviewVoteExpenditure table
	// which is abit different from the rest of the tables
	var writeLineToOverView = function writeLineToOverView(line, _ref3) {
	  var title = _ref3.title;
	  var voteTitle = _ref3.voteTitle;
	  var stream = _ref3.stream;

	  if (!title.includes('Overview of Vote Expenditures')) return false;
	  var csvLine = csvLineTowrite(line);
	  if (line.includes('Recurrent')) missingValue = csvLine[1];
	  // check whether we have numbers after the first items in the array
	  var hasNumericalValues = shouldHaveNumericalValues(line);
	  if (!hasNumericalValues) return false;
	  // table structure quacks
	  if (line.includes('Non Wage') && missingValue) csvLine.splice(2, 0, missingValue);
	  if (line.includes('and Taxes')) csvLine.splice(0, 2, csvLine[1]);
	  stream.write([].concat(_toConsumableArray(csvLine), [title, voteTitle]));
	  return true;
	};

	var getVoteTitle = exports.getVoteTitle = function getVoteTitle(line, currentVote) {
	  // remove extra white space at the beginning of the line if any
	  var newLine = line.replace(/^\s+/, '');
	  // the line should start with Vote:
	  var hasVoteHasFirstLine = /^Vote:/.test(newLine);
	  if (!hasVoteHasFirstLine) return currentVote;
	  // should have the vote Number
	  var chunkedLine = newLine.replace(/\s{2,}/, ' ').split(' ');
	  // test whether 2nd element is a number and third a string
	  var isNumber = Number.isInteger(parseInt(chunkedLine[1], 10));
	  if (!isNumber) return currentVote;
	  if (isNumber && typeof chunkedLine[2] === 'string') {
	    var voteTitle = newLine.replace(/(Vote:)(.*[0-9])(.\s)/, '');
	    // console.log('line:', line); ;
	    return voteTitle.replace(/^\s+/, '');
	  }
	  return currentVote;
	};

	var isNewTableTitle = function isNewTableTitle(segments, line) {
	  return segments.some(function (segment) {
	    return line.includes(segment.tableTitle);
	  });
	};

	function writeCSVFile(segments, readFileByLine, stream) {
	  var startMining = false;
	  var isTableTitle = false;
	  var title = null;
	  var voteTitle = null;
	  var writeCsvLine = null; // function
	  if (_cli2.default.annex) {
	    writeCsvLine = writeLineForAnnexTables;
	  } else {
	    writeCsvLine = _cli2.default.overview ? writeLineToOverView : writeLineToFileRegular;
	  }
	  readFileByLine.on('line', function (line) {
	    isTableTitle = isNewTableTitle(segments, line);
	    voteTitle = getVoteTitle(line, voteTitle);
	    if (isTableTitle) {
	      title = segments.find(function (segment) {
	        return line.includes(segment.tableTitle);
	      }).tableTitle;
	      startMining = true;
	      console.log('voteTitle: ' + voteTitle + ' Title : ' + title);
	    }
	    if (startMining) writeCsvLine(line, { title: title, voteTitle: voteTitle, stream: stream });
	  });
	}

	var readByLine = function readByLine() {
	  var minedTextFile = _cli2.default.args[0].split('.');
	  return _readline2.default.createInterface({
	    input: _fs2.default.createReadStream(minedTextFile[0] + '.txt')
	  });
	};

	var closeReadingTextFile = function closeReadingTextFile(readFileByLine, stream) {
	  readFileByLine.on('close', function () {
	    stream.end();
	    console.log('*finished reading files closing*');
	    setTimeout(function () {
	      return process.exit;
	    }, 2000); // exit process
	  });
	};

	function main() {
	  var pdfMining = pdftoTextProcess();
	  var csvWriteStream = csvStream();

	  pdfMining.stderr.on('data', function (data) {
	    console.log('stderr : ' + data);
	    process.exit();
	  });

	  pdfMining.on('close', function (code) {
	    console.log('child process for PDFtoText exited with code  ' + code);
	    setTimeout(function () {
	      var readFileByLine = readByLine();
	      writeCSVFile(_config.budgetSegmentsToRead, readFileByLine, csvWriteStream);
	      closeReadingTextFile(readFileByLine, csvWriteStream);
	    }, 2000);
	  });
	}

	if (_cli2.default.args.length && process.env.NODE_ENV !== 'test') main();

/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = require("fs");

/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = require("readline");

/***/ },
/* 3 */,
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(5);

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @projectName fast-csv
	 * @github https://github.com/C2FO/fast-csv
	 * @includeDoc [Change Log] ../History.md
	 * @header [../README.md]
	 */

	var fs = __webpack_require__(1),
	    parser = __webpack_require__(6),
	    formatter = __webpack_require__(25);

	function csv() {
	    return parser.apply(void 0, arguments);
	}

	csv.parse = csv;
	csv.fromString = parser.fromString;
	csv.fromPath = parser.fromPath;
	csv.fromStream = parser.fromStream;
	csv.format = formatter;
	csv.write = formatter.write;
	csv.writeToStream = formatter.writeToStream;
	csv.writeToString = formatter.writeToString;
	csv.writeToBuffer = formatter.writeToBuffer;
	csv.writeToPath = formatter.writeToPath;
	csv.createWriteStream = formatter.createWriteStream;
	csv.createReadStream = formatter.createWriteStream;

	module.exports = csv;

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	var extended = __webpack_require__(7),
	    out = process.stdout,
	    stream = __webpack_require__(20),
	    fs = __webpack_require__(1),
	    ParserStream = __webpack_require__(21);


	function parse(options) {
	    return new ParserStream(options);
	}

	function fromStream(stream, options) {
	    return stream.pipe(new ParserStream(options));
	}

	function fromPath(location, options) {
	    return fs.createReadStream(location).pipe(new ParserStream(options));
	}

	function fromString(string, options) {
	    var rs = new stream.Readable();
	    rs.push(string);
	    rs.push(null);
	    return rs.pipe(new ParserStream(options));
	}

	parse.fromStream = fromStream;
	parse.fromPath = fromPath;
	parse.fromString = fromString;
	module.exports = parse;


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	var is = __webpack_require__(8);
	module.exports = __webpack_require__(9)()
	    .register(is)
	    .register(__webpack_require__(14))
	    .register(__webpack_require__(17))
	    .register("LINE_BREAK", __webpack_require__(19).EOL)
	    .register("asyncEach", function (arr, iter, cb) {


	        (function asyncIterator(i, l, rows, cb) {
	            if (++i < l) {
	                iter(rows[i], function (err) {
	                    if (err) {
	                        cb(err);
	                    } else {
	                        if ((i % 100) === 0) {
	                            //dont overflow the stack
	                            setImmediate(function () {
	                                asyncIterator(i, l, rows, cb);
	                            });
	                        } else {
	                            asyncIterator(i, l, rows, cb);
	                        }
	                    }
	                });
	            } else {
	                //get out of stack
	                cb(null, arr);
	            }
	        }(-1, arr.length, arr, cb));
	    })
	    .register("spreadArgs", function spreadArgs(f, args, scope) {
	        var ret;
	        switch ((args || []).length) {
	            case 0:
	                ret = f.call(scope);
	                break;
	            case 1:
	                ret = f.call(scope, args[0]);
	                break;
	            case 2:
	                ret = f.call(scope, args[0], args[1]);
	                break;
	            case 3:
	                ret = f.call(scope, args[0], args[1], args[2]);
	                break;
	            default:
	                ret = f.apply(scope, args);
	        }
	        return ret;
	    })
	    .register("keys", function (obj) {
	        var ret = [];
	        if (is.isObject(obj)) {
	            for (var i in obj) {
	                ret.push(i);
	            }
	        }
	        return ret;
	    });

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	(function () {
	    "use strict";

	    function defineIsa(extended) {

	        var pSlice = Array.prototype.slice;

	        var hasOwn = Object.prototype.hasOwnProperty;
	        var toStr = Object.prototype.toString;

	        function argsToArray(args, slice) {
	            var i = -1, j = 0, l = args.length, ret = [];
	            slice = slice || 0;
	            i += slice;
	            while (++i < l) {
	                ret[j++] = args[i];
	            }
	            return ret;
	        }

	        function keys(obj) {
	            var ret = [];
	            for (var i in obj) {
	                if (hasOwn.call(obj, i)) {
	                    ret.push(i);
	                }
	            }
	            return ret;
	        }

	        //taken from node js assert.js
	        //https://github.com/joyent/node/blob/master/lib/assert.js
	        function deepEqual(actual, expected) {
	            // 7.1. All identical values are equivalent, as determined by ===.
	            if (actual === expected) {
	                return true;

	            } else if (typeof Buffer !== "undefined" && Buffer.isBuffer(actual) && Buffer.isBuffer(expected)) {
	                if (actual.length !== expected.length) {
	                    return false;
	                }
	                for (var i = 0; i < actual.length; i++) {
	                    if (actual[i] !== expected[i]) {
	                        return false;
	                    }
	                }
	                return true;

	                // 7.2. If the expected value is a Date object, the actual value is
	                // equivalent if it is also a Date object that refers to the same time.
	            } else if (isDate(actual) && isDate(expected)) {
	                return actual.getTime() === expected.getTime();

	                // 7.3 If the expected value is a RegExp object, the actual value is
	                // equivalent if it is also a RegExp object with the same source and
	                // properties (`global`, `multiline`, `lastIndex`, `ignoreCase`).
	            } else if (isRegExp(actual) && isRegExp(expected)) {
	                return actual.source === expected.source &&
	                    actual.global === expected.global &&
	                    actual.multiline === expected.multiline &&
	                    actual.lastIndex === expected.lastIndex &&
	                    actual.ignoreCase === expected.ignoreCase;

	                // 7.4. Other pairs that do not both pass typeof value == 'object',
	                // equivalence is determined by ==.
	            } else if (isString(actual) && isString(expected) && actual !== expected) {
	                return false;
	            } else if (typeof actual !== 'object' && typeof expected !== 'object') {
	                return actual === expected;

	                // 7.5 For all other Object pairs, including Array objects, equivalence is
	                // determined by having the same number of owned properties (as verified
	                // with Object.prototype.hasOwnProperty.call), the same set of keys
	                // (although not necessarily the same order), equivalent values for every
	                // corresponding key, and an identical 'prototype' property. Note: this
	                // accounts for both named and indexed properties on Arrays.
	            } else {
	                return objEquiv(actual, expected);
	            }
	        }


	        function objEquiv(a, b) {
	            var key;
	            if (isUndefinedOrNull(a) || isUndefinedOrNull(b)) {
	                return false;
	            }
	            // an identical 'prototype' property.
	            if (a.prototype !== b.prototype) {
	                return false;
	            }
	            //~~~I've managed to break Object.keys through screwy arguments passing.
	            //   Converting to array solves the problem.
	            if (isArguments(a)) {
	                if (!isArguments(b)) {
	                    return false;
	                }
	                a = pSlice.call(a);
	                b = pSlice.call(b);
	                return deepEqual(a, b);
	            }
	            try {
	                var ka = keys(a),
	                    kb = keys(b),
	                    i;
	                // having the same number of owned properties (keys incorporates
	                // hasOwnProperty)
	                if (ka.length !== kb.length) {
	                    return false;
	                }
	                //the same set of keys (although not necessarily the same order),
	                ka.sort();
	                kb.sort();
	                //~~~cheap key test
	                for (i = ka.length - 1; i >= 0; i--) {
	                    if (ka[i] !== kb[i]) {
	                        return false;
	                    }
	                }
	                //equivalent values for every corresponding key, and
	                //~~~possibly expensive deep test
	                for (i = ka.length - 1; i >= 0; i--) {
	                    key = ka[i];
	                    if (!deepEqual(a[key], b[key])) {
	                        return false;
	                    }
	                }
	            } catch (e) {//happens when one is a string literal and the other isn't
	                return false;
	            }
	            return true;
	        }


	        var isFunction = function (obj) {
	            return toStr.call(obj) === '[object Function]';
	        };

	        //ie hack
	        if ("undefined" !== typeof window && !isFunction(window.alert)) {
	            (function (alert) {
	                isFunction = function (obj) {
	                    return toStr.call(obj) === '[object Function]' || obj === alert;
	                };
	            }(window.alert));
	        }

	        function isObject(obj) {
	            var undef;
	            return obj !== null && typeof obj === "object";
	        }

	        function isHash(obj) {
	            var ret = isObject(obj);
	            return ret && obj.constructor === Object && !obj.nodeType && !obj.setInterval;
	        }

	        function isEmpty(object) {
	            if (isArguments(object)) {
	                return object.length === 0;
	            } else if (isObject(object)) {
	                return keys(object).length === 0;
	            } else if (isString(object) || isArray(object)) {
	                return object.length === 0;
	            }
	            return true;
	        }

	        function isBoolean(obj) {
	            return obj === true || obj === false || toStr.call(obj) === "[object Boolean]";
	        }

	        function isUndefined(obj) {
	            return typeof obj === 'undefined';
	        }

	        function isDefined(obj) {
	            return !isUndefined(obj);
	        }

	        function isUndefinedOrNull(obj) {
	            return isUndefined(obj) || isNull(obj);
	        }

	        function isNull(obj) {
	            return obj === null;
	        }


	        var isArguments = function _isArguments(object) {
	            return toStr.call(object) === '[object Arguments]';
	        };

	        if (!isArguments(arguments)) {
	            isArguments = function _isArguments(obj) {
	                return !!(obj && hasOwn.call(obj, "callee"));
	            };
	        }


	        function isInstanceOf(obj, clazz) {
	            if (isFunction(clazz)) {
	                return obj instanceof clazz;
	            } else {
	                return false;
	            }
	        }

	        function isRegExp(obj) {
	            return toStr.call(obj) === '[object RegExp]';
	        }

	        var isArray = Array.isArray || function isArray(obj) {
	            return toStr.call(obj) === "[object Array]";
	        };

	        function isDate(obj) {
	            return toStr.call(obj) === '[object Date]';
	        }

	        function isString(obj) {
	            return toStr.call(obj) === '[object String]';
	        }

	        function isNumber(obj) {
	            return toStr.call(obj) === '[object Number]';
	        }

	        function isTrue(obj) {
	            return obj === true;
	        }

	        function isFalse(obj) {
	            return obj === false;
	        }

	        function isNotNull(obj) {
	            return !isNull(obj);
	        }

	        function isEq(obj, obj2) {
	            /*jshint eqeqeq:false*/
	            return obj == obj2;
	        }

	        function isNeq(obj, obj2) {
	            /*jshint eqeqeq:false*/
	            return obj != obj2;
	        }

	        function isSeq(obj, obj2) {
	            return obj === obj2;
	        }

	        function isSneq(obj, obj2) {
	            return obj !== obj2;
	        }

	        function isIn(obj, arr) {
	            if ((isArray(arr) && Array.prototype.indexOf) || isString(arr)) {
	                return arr.indexOf(obj) > -1;
	            } else if (isArray(arr)) {
	                for (var i = 0, l = arr.length; i < l; i++) {
	                    if (isEq(obj, arr[i])) {
	                        return true;
	                    }
	                }
	            }
	            return false;
	        }

	        function isNotIn(obj, arr) {
	            return !isIn(obj, arr);
	        }

	        function isLt(obj, obj2) {
	            return obj < obj2;
	        }

	        function isLte(obj, obj2) {
	            return obj <= obj2;
	        }

	        function isGt(obj, obj2) {
	            return obj > obj2;
	        }

	        function isGte(obj, obj2) {
	            return obj >= obj2;
	        }

	        function isLike(obj, reg) {
	            if (isString(reg)) {
	                return ("" + obj).match(reg) !== null;
	            } else if (isRegExp(reg)) {
	                return reg.test(obj);
	            }
	            return false;
	        }

	        function isNotLike(obj, reg) {
	            return !isLike(obj, reg);
	        }

	        function contains(arr, obj) {
	            return isIn(obj, arr);
	        }

	        function notContains(arr, obj) {
	            return !isIn(obj, arr);
	        }

	        function containsAt(arr, obj, index) {
	            if (isArray(arr) && arr.length > index) {
	                return isEq(arr[index], obj);
	            }
	            return false;
	        }

	        function notContainsAt(arr, obj, index) {
	            if (isArray(arr)) {
	                return !isEq(arr[index], obj);
	            }
	            return false;
	        }

	        function has(obj, prop) {
	            return hasOwn.call(obj, prop);
	        }

	        function notHas(obj, prop) {
	            return !has(obj, prop);
	        }

	        function length(obj, l) {
	            if (has(obj, "length")) {
	                return obj.length === l;
	            }
	            return false;
	        }

	        function notLength(obj, l) {
	            if (has(obj, "length")) {
	                return obj.length !== l;
	            }
	            return false;
	        }

	        var isa = {
	            isFunction: isFunction,
	            isObject: isObject,
	            isEmpty: isEmpty,
	            isHash: isHash,
	            isNumber: isNumber,
	            isString: isString,
	            isDate: isDate,
	            isArray: isArray,
	            isBoolean: isBoolean,
	            isUndefined: isUndefined,
	            isDefined: isDefined,
	            isUndefinedOrNull: isUndefinedOrNull,
	            isNull: isNull,
	            isArguments: isArguments,
	            instanceOf: isInstanceOf,
	            isRegExp: isRegExp,
	            deepEqual: deepEqual,
	            isTrue: isTrue,
	            isFalse: isFalse,
	            isNotNull: isNotNull,
	            isEq: isEq,
	            isNeq: isNeq,
	            isSeq: isSeq,
	            isSneq: isSneq,
	            isIn: isIn,
	            isNotIn: isNotIn,
	            isLt: isLt,
	            isLte: isLte,
	            isGt: isGt,
	            isGte: isGte,
	            isLike: isLike,
	            isNotLike: isNotLike,
	            contains: contains,
	            notContains: notContains,
	            has: has,
	            notHas: notHas,
	            isLength: length,
	            isNotLength: notLength,
	            containsAt: containsAt,
	            notContainsAt: notContainsAt
	        };

	        var tester = {
	            constructor: function () {
	                this._testers = [];
	            },

	            noWrap: {
	                tester: function () {
	                    var testers = this._testers;
	                    return function tester(value) {
	                        var isa = false;
	                        for (var i = 0, l = testers.length; i < l && !isa; i++) {
	                            isa = testers[i](value);
	                        }
	                        return isa;
	                    };
	                }
	            }
	        };

	        var switcher = {
	            constructor: function () {
	                this._cases = [];
	                this.__default = null;
	            },

	            def: function (val, fn) {
	                this.__default = fn;
	            },

	            noWrap: {
	                switcher: function () {
	                    var testers = this._cases, __default = this.__default;
	                    return function tester() {
	                        var handled = false, args = argsToArray(arguments), caseRet;
	                        for (var i = 0, l = testers.length; i < l && !handled; i++) {
	                            caseRet = testers[i](args);
	                            if (caseRet.length > 1) {
	                                if (caseRet[1] || caseRet[0]) {
	                                    return caseRet[1];
	                                }
	                            }
	                        }
	                        if (!handled && __default) {
	                            return  __default.apply(this, args);
	                        }
	                    };
	                }
	            }
	        };

	        function addToTester(func) {
	            tester[func] = function isaTester() {
	                this._testers.push(isa[func]);
	            };
	        }

	        function addToSwitcher(func) {
	            switcher[func] = function isaTester() {
	                var args = argsToArray(arguments, 1), isFunc = isa[func], handler, doBreak = true;
	                if (args.length <= isFunc.length - 1) {
	                    throw new TypeError("A handler must be defined when calling using switch");
	                } else {
	                    handler = args.pop();
	                    if (isBoolean(handler)) {
	                        doBreak = handler;
	                        handler = args.pop();
	                    }
	                }
	                if (!isFunction(handler)) {
	                    throw new TypeError("handler must be defined");
	                }
	                this._cases.push(function (testArgs) {
	                    if (isFunc.apply(isa, testArgs.concat(args))) {
	                        return [doBreak, handler.apply(this, testArgs)];
	                    }
	                    return [false];
	                });
	            };
	        }

	        for (var i in isa) {
	            if (hasOwn.call(isa, i)) {
	                addToSwitcher(i);
	                addToTester(i);
	            }
	        }

	        var is = extended.define(isa).expose(isa);
	        is.tester = extended.define(tester);
	        is.switcher = extended.define(switcher);
	        return is;

	    }

	    if (true) {
	        if ("undefined" !== typeof module && module.exports) {
	            module.exports = defineIsa(__webpack_require__(9));

	        }
	    } else if ("function" === typeof define && define.amd) {
	        define(["extended"], function (extended) {
	            return defineIsa(extended);
	        });
	    } else {
	        this.isExtended = defineIsa(this.extended);
	    }

	}).call(this);



/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	(function () {
	    "use strict";
	    /*global extender is, dateExtended*/

	    function defineExtended(extender) {


	        var merge = (function merger() {
	            function _merge(target, source) {
	                var name, s;
	                for (name in source) {
	                    if (source.hasOwnProperty(name)) {
	                        s = source[name];
	                        if (!(name in target) || (target[name] !== s)) {
	                            target[name] = s;
	                        }
	                    }
	                }
	                return target;
	            }

	            return function merge(obj) {
	                if (!obj) {
	                    obj = {};
	                }
	                for (var i = 1, l = arguments.length; i < l; i++) {
	                    _merge(obj, arguments[i]);
	                }
	                return obj; // Object
	            };
	        }());

	        function getExtended() {

	            var loaded = {};


	            //getInitial instance;
	            var extended = extender.define();
	            extended.expose({
	                register: function register(alias, extendWith) {
	                    if (!extendWith) {
	                        extendWith = alias;
	                        alias = null;
	                    }
	                    var type = typeof extendWith;
	                    if (alias) {
	                        extended[alias] = extendWith;
	                    } else if (extendWith && type === "function") {
	                        extended.extend(extendWith);
	                    } else if (type === "object") {
	                        extended.expose(extendWith);
	                    } else {
	                        throw new TypeError("extended.register must be called with an extender function");
	                    }
	                    return extended;
	                },

	                define: function () {
	                    return extender.define.apply(extender, arguments);
	                }
	            });

	            return extended;
	        }

	        function extended() {
	            return getExtended();
	        }

	        extended.define = function define() {
	            return extender.define.apply(extender, arguments);
	        };

	        return extended;
	    }

	    if (true) {
	        if ("undefined" !== typeof module && module.exports) {
	            module.exports = defineExtended(__webpack_require__(10));

	        }
	    } else if ("function" === typeof define && define.amd) {
	        define(["extender"], function (extender) {
	            return defineExtended(extender);
	        });
	    } else {
	        this.extended = defineExtended(this.extender);
	    }

	}).call(this);








/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(11);

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	(function () {
	    /*jshint strict:false*/


	    /**
	     *
	     * @projectName extender
	     * @github http://github.com/doug-martin/extender
	     * @header
	     * [![build status](https://secure.travis-ci.org/doug-martin/extender.png)](http://travis-ci.org/doug-martin/extender)
	     * # Extender
	     *
	     * `extender` is a library that helps in making chainable APIs, by creating a function that accepts different values and returns an object decorated with functions based on the type.
	     *
	     * ## Why Is Extender Different?
	     *
	     * Extender is different than normal chaining because is does more than return `this`. It decorates your values in a type safe manner.
	     *
	     * For example if you return an array from a string based method then the returned value will be decorated with array methods and not the string methods. This allow you as the developer to focus on your API and not worrying about how to properly build and connect your API.
	     *
	     *
	     * ## Installation
	     *
	     * ```
	     * npm install extender
	     * ```
	     *
	     * Or [download the source](https://raw.github.com/doug-martin/extender/master/extender.js) ([minified](https://raw.github.com/doug-martin/extender/master/extender-min.js))
	     *
	     * **Note** `extender` depends on [`declare.js`](http://doug-martin.github.com/declare.js/).
	     *
	     * ### Requirejs
	     *
	     * To use with requirejs place the `extend` source in the root scripts directory
	     *
	     * ```javascript
	     *
	     * define(["extender"], function(extender){
	     * });
	     *
	     * ```
	     *
	     *
	     * ## Usage
	     *
	     * **`extender.define(tester, decorations)`**
	     *
	     * To create your own extender call the `extender.define` function.
	     *
	     * This function accepts an optional tester which is used to determine a value should be decorated with the specified `decorations`
	     *
	     * ```javascript
	     * function isString(obj) {
	     *     return !isUndefinedOrNull(obj) && (typeof obj === "string" || obj instanceof String);
	     * }
	     *
	     *
	     * var myExtender = extender.define(isString, {
	     *		multiply: function (str, times) {
	     *			var ret = str;
	     *			for (var i = 1; i < times; i++) {
	     *				ret += str;
	     *			}
	     *			return ret;
	     *		},
	     *		toArray: function (str, delim) {
	     *			delim = delim || "";
	     *			return str.split(delim);
	     *		}
	     *	});
	     *
	     * myExtender("hello").multiply(2).value(); //hellohello
	     *
	     * ```
	     *
	     * If you do not specify a tester function and just pass in an object of `functions` then all values passed in will be decorated with methods.
	     *
	     * ```javascript
	     *
	     * function isUndefined(obj) {
	     *     var undef;
	     *     return obj === undef;
	     * }
	     *
	     * function isUndefinedOrNull(obj) {
	     *	var undef;
	     *     return obj === undef || obj === null;
	     * }
	     *
	     * function isArray(obj) {
	     *     return Object.prototype.toString.call(obj) === "[object Array]";
	     * }
	     *
	     * function isBoolean(obj) {
	     *     var undef, type = typeof obj;
	     *     return !isUndefinedOrNull(obj) && type === "boolean" || type === "Boolean";
	     * }
	     *
	     * function isString(obj) {
	     *     return !isUndefinedOrNull(obj) && (typeof obj === "string" || obj instanceof String);
	     * }
	     *
	     * var myExtender = extender.define({
	     *	isUndefined : isUndefined,
	     *	isUndefinedOrNull : isUndefinedOrNull,
	     *	isArray : isArray,
	     *	isBoolean : isBoolean,
	     *	isString : isString
	     * });
	     *
	     * ```
	     *
	     * To use
	     *
	     * ```
	     * var undef;
	     * myExtender("hello").isUndefined().value(); //false
	     * myExtender(undef).isUndefined().value(); //true
	     * ```
	     *
	     * You can also chain extenders so that they accept multiple types and decorates accordingly.
	     *
	     * ```javascript
	     * myExtender
	     *     .define(isArray, {
	     *		pluck: function (arr, m) {
	     *			var ret = [];
	     *			for (var i = 0, l = arr.length; i < l; i++) {
	     *				ret.push(arr[i][m]);
	     *			}
	     *			return ret;
	     *		}
	     *	})
	     *     .define(isBoolean, {
	     *		invert: function (val) {
	     *			return !val;
	     *		}
	     *	});
	     *
	     * myExtender([{a: "a"},{a: "b"},{a: "c"}]).pluck("a").value(); //["a", "b", "c"]
	     * myExtender("I love javascript!").toArray(/\s+/).pluck("0"); //["I", "l", "j"]
	     *
	     * ```
	     *
	     * Notice that we reuse the same extender as defined above.
	     *
	     * **Return Values**
	     *
	     * When creating an extender if you return a value from one of the decoration functions then that value will also be decorated. If you do not return any values then the extender will be returned.
	     *
	     * **Default decoration methods**
	     *
	     * By default every value passed into an extender is decorated with the following methods.
	     *
	     * * `value` : The value this extender represents.
	     * * `eq(otherValue)` : Tests strict equality of the currently represented value to the `otherValue`
	     * * `neq(oterValue)` : Tests strict inequality of the currently represented value.
	     * * `print` : logs the current value to the console.
	     *
	     * **Extender initialization**
	     *
	     * When creating an extender you can also specify a constructor which will be invoked with the current value.
	     *
	     * ```javascript
	     * myExtender.define(isString, {
	     *	constructor : function(val){
	     *     //set our value to the string trimmed
	     *		this._value = val.trimRight().trimLeft();
	     *	}
	     * });
	     * ```
	     *
	     * **`noWrap`**
	     *
	     * `extender` also allows you to specify methods that should not have the value wrapped providing a cleaner exit function other than `value()`.
	     *
	     * For example suppose you have an API that allows you to build a validator, rather than forcing the user to invoke the `value` method you could add a method called `validator` which makes more syntactic sense.
	     *
	     * ```
	     *
	     * var myValidator = extender.define({
	     *     //chainable validation methods
	     *     //...
	     *     //end chainable validation methods
	     *
	     *     noWrap : {
	     *         validator : function(){
	     *             //return your validator
	     *         }
	     *     }
	     * });
	     *
	     * myValidator().isNotNull().isEmailAddress().validator(); //now you dont need to call .value()
	     *
	     *
	     * ```
	     * **`extender.extend(extendr)`**
	     *
	     * You may also compose extenders through the use of `extender.extend(extender)`, which will return an entirely new extender that is the composition of extenders.
	     *
	     * Suppose you have the following two extenders.
	     *
	     * ```javascript
	     * var myExtender = extender
	     *        .define({
	     *            isFunction: is.function,
	     *            isNumber: is.number,
	     *            isString: is.string,
	     *            isDate: is.date,
	     *            isArray: is.array,
	     *            isBoolean: is.boolean,
	     *            isUndefined: is.undefined,
	     *            isDefined: is.defined,
	     *            isUndefinedOrNull: is.undefinedOrNull,
	     *            isNull: is.null,
	     *            isArguments: is.arguments,
	     *            isInstanceOf: is.instanceOf,
	     *            isRegExp: is.regExp
	     *        });
	     * var myExtender2 = extender.define(is.array, {
	     *     pluck: function (arr, m) {
	     *         var ret = [];
	     *         for (var i = 0, l = arr.length; i < l; i++) {
	     *             ret.push(arr[i][m]);
	     *         }
	     *         return ret;
	     *     },
	     *
	     *     noWrap: {
	     *         pluckPlain: function (arr, m) {
	     *             var ret = [];
	     *             for (var i = 0, l = arr.length; i < l; i++) {
	     *                 ret.push(arr[i][m]);
	     *             }
	     *             return ret;
	     *         }
	     *     }
	     * });
	     *
	     *
	     * ```
	     *
	     * And you do not want to alter either of them but instead what to create a third that is the union of the two.
	     *
	     *
	     * ```javascript
	     * var composed = extender.extend(myExtender).extend(myExtender2);
	     * ```
	     * So now you can use the new extender with the joined functionality if `myExtender` and `myExtender2`.
	     *
	     * ```javascript
	     * var extended = composed([
	     *      {a: "a"},
	     *      {a: "b"},
	     *      {a: "c"}
	     * ]);
	     * extended.isArray().value(); //true
	     * extended.pluck("a").value(); // ["a", "b", "c"]);
	     *
	     * ```
	     *
	     * **Note** `myExtender` and `myExtender2` will **NOT** be altered.
	     *
	     * **`extender.expose(methods)`**
	     *
	     * The `expose` method allows you to add methods to your extender that are not wrapped or automatically chained by exposing them on the extender directly.
	     *
	     * ```
	     * var isMethods = {
	     *      isFunction: is.function,
	     *      isNumber: is.number,
	     *      isString: is.string,
	     *      isDate: is.date,
	     *      isArray: is.array,
	     *      isBoolean: is.boolean,
	     *      isUndefined: is.undefined,
	     *      isDefined: is.defined,
	     *      isUndefinedOrNull: is.undefinedOrNull,
	     *      isNull: is.null,
	     *      isArguments: is.arguments,
	     *      isInstanceOf: is.instanceOf,
	     *      isRegExp: is.regExp
	     * };
	     *
	     * var myExtender = extender.define(isMethods).expose(isMethods);
	     *
	     * myExtender.isArray([]); //true
	     * myExtender([]).isArray([]).value(); //true
	     *
	     * ```
	     *
	     *
	     * **Using `instanceof`**
	     *
	     * When using extenders you can test if a value is an `instanceof` of an extender by using the instanceof operator.
	     *
	     * ```javascript
	     * var str = myExtender("hello");
	     *
	     * str instanceof myExtender; //true
	     * ```
	     *
	     * ## Examples
	     *
	     * To see more examples click [here](https://github.com/doug-martin/extender/tree/master/examples)
	     */
	    function defineExtender(declare) {


	        var slice = Array.prototype.slice, undef;

	        function indexOf(arr, item) {
	            if (arr && arr.length) {
	                for (var i = 0, l = arr.length; i < l; i++) {
	                    if (arr[i] === item) {
	                        return i;
	                    }
	                }
	            }
	            return -1;
	        }

	        function isArray(obj) {
	            return Object.prototype.toString.call(obj) === "[object Array]";
	        }

	        var merge = (function merger() {
	            function _merge(target, source, exclude) {
	                var name, s;
	                for (name in source) {
	                    if (source.hasOwnProperty(name) && indexOf(exclude, name) === -1) {
	                        s = source[name];
	                        if (!(name in target) || (target[name] !== s)) {
	                            target[name] = s;
	                        }
	                    }
	                }
	                return target;
	            }

	            return function merge(obj) {
	                if (!obj) {
	                    obj = {};
	                }
	                var l = arguments.length;
	                var exclude = arguments[arguments.length - 1];
	                if (isArray(exclude)) {
	                    l--;
	                } else {
	                    exclude = [];
	                }
	                for (var i = 1; i < l; i++) {
	                    _merge(obj, arguments[i], exclude);
	                }
	                return obj; // Object
	            };
	        }());


	        function extender(supers) {
	            supers = supers || [];
	            var Base = declare({
	                instance: {
	                    constructor: function (value) {
	                        this._value = value;
	                    },

	                    value: function () {
	                        return this._value;
	                    },

	                    eq: function eq(val) {
	                        return this["__extender__"](this._value === val);
	                    },

	                    neq: function neq(other) {
	                        return this["__extender__"](this._value !== other);
	                    },
	                    print: function () {
	                        console.log(this._value);
	                        return this;
	                    }
	                }
	            }), defined = [];

	            function addMethod(proto, name, func) {
	                if ("function" !== typeof func) {
	                    throw new TypeError("when extending type you must provide a function");
	                }
	                var extendedMethod;
	                if (name === "constructor") {
	                    extendedMethod = function () {
	                        this._super(arguments);
	                        func.apply(this, arguments);
	                    };
	                } else {
	                    extendedMethod = function extendedMethod() {
	                        var args = slice.call(arguments);
	                        args.unshift(this._value);
	                        var ret = func.apply(this, args);
	                        return ret !== undef ? this["__extender__"](ret) : this;
	                    };
	                }
	                proto[name] = extendedMethod;
	            }

	            function addNoWrapMethod(proto, name, func) {
	                if ("function" !== typeof func) {
	                    throw new TypeError("when extending type you must provide a function");
	                }
	                var extendedMethod;
	                if (name === "constructor") {
	                    extendedMethod = function () {
	                        this._super(arguments);
	                        func.apply(this, arguments);
	                    };
	                } else {
	                    extendedMethod = function extendedMethod() {
	                        var args = slice.call(arguments);
	                        args.unshift(this._value);
	                        return func.apply(this, args);
	                    };
	                }
	                proto[name] = extendedMethod;
	            }

	            function decorateProto(proto, decoration, nowrap) {
	                for (var i in decoration) {
	                    if (decoration.hasOwnProperty(i)) {
	                        if (i !== "getters" && i !== "setters") {
	                            if (i === "noWrap") {
	                                decorateProto(proto, decoration[i], true);
	                            } else if (nowrap) {
	                                addNoWrapMethod(proto, i, decoration[i]);
	                            } else {
	                                addMethod(proto, i, decoration[i]);
	                            }
	                        } else {
	                            proto[i] = decoration[i];
	                        }
	                    }
	                }
	            }

	            function _extender(obj) {
	                var ret = obj, i, l;
	                if (!(obj instanceof Base)) {
	                    var OurBase = Base;
	                    for (i = 0, l = defined.length; i < l; i++) {
	                        var definer = defined[i];
	                        if (definer[0](obj)) {
	                            OurBase = OurBase.extend({instance: definer[1]});
	                        }
	                    }
	                    ret = new OurBase(obj);
	                    ret["__extender__"] = _extender;
	                }
	                return ret;
	            }

	            function always() {
	                return true;
	            }

	            function define(tester, decorate) {
	                if (arguments.length) {
	                    if (typeof tester === "object") {
	                        decorate = tester;
	                        tester = always;
	                    }
	                    decorate = decorate || {};
	                    var proto = {};
	                    decorateProto(proto, decorate);
	                    //handle browsers like which skip over the constructor while looping
	                    if (!proto.hasOwnProperty("constructor")) {
	                        if (decorate.hasOwnProperty("constructor")) {
	                            addMethod(proto, "constructor", decorate.constructor);
	                        } else {
	                            proto.constructor = function () {
	                                this._super(arguments);
	                            };
	                        }
	                    }
	                    defined.push([tester, proto]);
	                }
	                return _extender;
	            }

	            function extend(supr) {
	                if (supr && supr.hasOwnProperty("__defined__")) {
	                    _extender["__defined__"] = defined = defined.concat(supr["__defined__"]);
	                }
	                merge(_extender, supr, ["define", "extend", "expose", "__defined__"]);
	                return _extender;
	            }

	            _extender.define = define;
	            _extender.extend = extend;
	            _extender.expose = function expose() {
	                var methods;
	                for (var i = 0, l = arguments.length; i < l; i++) {
	                    methods = arguments[i];
	                    if (typeof methods === "object") {
	                        merge(_extender, methods, ["define", "extend", "expose", "__defined__"]);
	                    }
	                }
	                return _extender;
	            };
	            _extender["__defined__"] = defined;


	            return _extender;
	        }

	        return {
	            define: function () {
	                return extender().define.apply(extender, arguments);
	            },

	            extend: function (supr) {
	                return extender().define().extend(supr);
	            }
	        };

	    }

	    if (true) {
	        if ("undefined" !== typeof module && module.exports) {
	            module.exports = defineExtender(__webpack_require__(12));

	        }
	    } else if ("function" === typeof define && define.amd) {
	        define(["declare"], function (declare) {
	            return defineExtender(declare);
	        });
	    } else {
	        this.extender = defineExtender(this.declare);
	    }

	}).call(this);

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(13);

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	(function () {

	    /**
	     * @projectName declare
	     * @github http://github.com/doug-martin/declare.js
	     * @header
	     *
	     * Declare is a library designed to allow writing object oriented code the same way in both the browser and node.js.
	     *
	     * ##Installation
	     *
	     * `npm install declare.js`
	     *
	     * Or [download the source](https://raw.github.com/doug-martin/declare.js/master/declare.js) ([minified](https://raw.github.com/doug-martin/declare.js/master/declare-min.js))
	     *
	     * ###Requirejs
	     *
	     * To use with requirejs place the `declare` source in the root scripts directory
	     *
	     * ```
	     *
	     * define(["declare"], function(declare){
	     *      return declare({
	     *          instance : {
	     *              hello : function(){
	     *                  return "world";
	     *              }
	     *          }
	     *      });
	     * });
	     *
	     * ```
	     *
	     *
	     * ##Usage
	     *
	     * declare.js provides
	     *
	     * Class methods
	     *
	     * * `as(module | object, name)` : exports the object to module or the object with the name
	     * * `mixin(mixin)` : mixes in an object but does not inherit directly from the object. **Note** this does not return a new class but changes the original class.
	     * * `extend(proto)` : extend a class with the given properties. A shortcut to `declare(Super, {})`;
	     *
	     * Instance methods
	     *
	     * * `_super(arguments)`: calls the super of the current method, you can pass in either the argments object or an array with arguments you want passed to super
	     * * `_getSuper()`: returns a this methods direct super.
	     * * `_static` : use to reference class properties and methods.
	     * * `get(prop)` : gets a property invoking the getter if it exists otherwise it just returns the named property on the object.
	     * * `set(prop, val)` : sets a property invoking the setter if it exists otherwise it just sets the named property on the object.
	     *
	     *
	     * ###Declaring a new Class
	     *
	     * Creating a new class with declare is easy!
	     *
	     * ```
	     *
	     * var Mammal = declare({
	     *      //define your instance methods and properties
	     *      instance : {
	     *
	     *          //will be called whenever a new instance is created
	     *          constructor: function(options) {
	     *              options = options || {};
	     *              this._super(arguments);
	     *              this._type = options.type || "mammal";
	     *          },
	     *
	     *          speak : function() {
	     *              return  "A mammal of type " + this._type + " sounds like";
	     *          },
	     *
	     *          //Define your getters
	     *          getters : {
	     *
	     *              //can be accessed by using the get method. (mammal.get("type"))
	     *              type : function() {
	     *                  return this._type;
	     *              }
	     *          },
	     *
	     *           //Define your setters
	     *          setters : {
	     *
	     *                //can be accessed by using the set method. (mammal.set("type", "mammalType"))
	     *              type : function(t) {
	     *                  this._type = t;
	     *              }
	     *          }
	     *      },
	     *
	     *      //Define your static methods
	     *      static : {
	     *
	     *          //Mammal.soundOff(); //"Im a mammal!!"
	     *          soundOff : function() {
	     *              return "Im a mammal!!";
	     *          }
	     *      }
	     * });
	     *
	     *
	     * ```
	     *
	     * You can use Mammal just like you would any other class.
	     *
	     * ```
	     * Mammal.soundOff("Im a mammal!!");
	     *
	     * var myMammal = new Mammal({type : "mymammal"});
	     * myMammal.speak(); // "A mammal of type mymammal sounds like"
	     * myMammal.get("type"); //"mymammal"
	     * myMammal.set("type", "mammal");
	     * myMammal.get("type"); //"mammal"
	     *
	     *
	     * ```
	     *
	     * ###Extending a class
	     *
	     * If you want to just extend a single class use the .extend method.
	     *
	     * ```
	     *
	     * var Wolf = Mammal.extend({
	     *
	     *   //define your instance method
	     *   instance: {
	     *
	     *        //You can override super constructors just be sure to call `_super`
	     *       constructor: function(options) {
	     *          options = options || {};
	     *          this._super(arguments); //call our super constructor.
	     *          this._sound = "growl";
	     *          this._color = options.color || "grey";
	     *      },
	     *
	     *      //override Mammals `speak` method by appending our own data to it.
	     *      speak : function() {
	     *          return this._super(arguments) + " a " + this._sound;
	     *      },
	     *
	     *      //add new getters for sound and color
	     *      getters : {
	     *
	     *           //new Wolf().get("type")
	     *           //notice color is read only as we did not define a setter
	     *          color : function() {
	     *              return this._color;
	     *          },
	     *
	     *          //new Wolf().get("sound")
	     *          sound : function() {
	     *              return this._sound;
	     *          }
	     *      },
	     *
	     *      setters : {
	     *
	     *          //new Wolf().set("sound", "howl")
	     *          sound : function(s) {
	     *              this._sound = s;
	     *          }
	     *      }
	     *
	     *  },
	     *
	     *  static : {
	     *
	     *      //You can override super static methods also! And you can still use _super
	     *      soundOff : function() {
	     *          //You can even call super in your statics!!!
	     *          //should return "I'm a mammal!! that growls"
	     *          return this._super(arguments) + " that growls";
	     *      }
	     *  }
	     * });
	     *
	     * Wolf.soundOff(); //Im a mammal!! that growls
	     *
	     * var myWolf = new Wolf();
	     * myWolf instanceof Mammal //true
	     * myWolf instanceof Wolf //true
	     *
	     * ```
	     *
	     * You can also extend a class by using the declare method and just pass in the super class.
	     *
	     * ```
	     * //Typical hierarchical inheritance
	     * // Mammal->Wolf->Dog
	     * var Dog = declare(Wolf, {
	     *    instance: {
	     *        constructor: function(options) {
	     *            options = options || {};
	     *            this._super(arguments);
	     *            //override Wolfs initialization of sound to woof.
	     *            this._sound = "woof";
	     *
	     *        },
	     *
	     *        speak : function() {
	     *            //Should return "A mammal of type mammal sounds like a growl thats domesticated"
	     *            return this._super(arguments) + " thats domesticated";
	     *        }
	     *    },
	     *
	     *    static : {
	     *        soundOff : function() {
	     *            //should return "I'm a mammal!! that growls but now barks"
	     *            return this._super(arguments) + " but now barks";
	     *        }
	     *    }
	     * });
	     *
	     * Dog.soundOff(); //Im a mammal!! that growls but now barks
	     *
	     * var myDog = new Dog();
	     * myDog instanceof Mammal //true
	     * myDog instanceof Wolf //true
	     * myDog instanceof Dog //true
	     *
	     *
	     * //Notice you still get the extend method.
	     *
	     * // Mammal->Wolf->Dog->Breed
	     * var Breed = Dog.extend({
	     *    instance: {
	     *
	     *        //initialize outside of constructor
	     *        _pitch : "high",
	     *
	     *        constructor: function(options) {
	     *            options = options || {};
	     *            this._super(arguments);
	     *            this.breed = options.breed || "lab";
	     *        },
	     *
	     *        speak : function() {
	     *            //Should return "A mammal of type mammal sounds like a
	     *            //growl thats domesticated with a high pitch!"
	     *            return this._super(arguments) + " with a " + this._pitch + " pitch!";
	     *        },
	     *
	     *        getters : {
	     *            pitch : function() {
	     *                return this._pitch;
	     *            }
	     *        }
	     *    },
	     *
	     *    static : {
	     *        soundOff : function() {
	     *            //should return "I'M A MAMMAL!! THAT GROWLS BUT NOW BARKS!"
	     *            return this._super(arguments).toUpperCase() + "!";
	     *        }
	     *    }
	     * });
	     *
	     *
	     * Breed.soundOff()//"IM A MAMMAL!! THAT GROWLS BUT NOW BARKS!"
	     *
	     * var myBreed = new Breed({color : "gold", type : "lab"}),
	     * myBreed instanceof Dog //true
	     * myBreed instanceof Wolf //true
	     * myBreed instanceof Mammal //true
	     * myBreed.speak() //"A mammal of type lab sounds like a woof thats domesticated with a high pitch!"
	     * myBreed.get("type") //"lab"
	     * myBreed.get("color") //"gold"
	     * myBreed.get("sound")" //"woof"
	     * ```
	     *
	     * ###Multiple Inheritance / Mixins
	     *
	     * declare also allows the use of multiple super classes.
	     * This is useful if you have generic classes that provide functionality but shouldnt be used on their own.
	     *
	     * Lets declare a mixin that allows us to watch for property changes.
	     *
	     * ```
	     * //Notice that we set up the functions outside of declare because we can reuse them
	     *
	     * function _set(prop, val) {
	     *     //get the old value
	     *     var oldVal = this.get(prop);
	     *     //call super to actually set the property
	     *     var ret = this._super(arguments);
	     *     //call our handlers
	     *     this.__callHandlers(prop, oldVal, val);
	     *     return ret;
	     * }
	     *
	     * function _callHandlers(prop, oldVal, newVal) {
	     *    //get our handlers for the property
	     *     var handlers = this.__watchers[prop], l;
	     *     //if the handlers exist and their length does not equal 0 then we call loop through them
	     *     if (handlers && (l = handlers.length) !== 0) {
	     *         for (var i = 0; i < l; i++) {
	     *             //call the handler
	     *             handlers[i].call(null, prop, oldVal, newVal);
	     *         }
	     *     }
	     * }
	     *
	     *
	     * //the watch function
	     * function _watch(prop, handler) {
	     *     if ("function" !== typeof handler) {
	     *         //if its not a function then its an invalid handler
	     *         throw new TypeError("Invalid handler.");
	     *     }
	     *     if (!this.__watchers[prop]) {
	     *         //create the watchers if it doesnt exist
	     *         this.__watchers[prop] = [handler];
	     *     } else {
	     *         //otherwise just add it to the handlers array
	     *         this.__watchers[prop].push(handler);
	     *     }
	     * }
	     *
	     * function _unwatch(prop, handler) {
	     *     if ("function" !== typeof handler) {
	     *         throw new TypeError("Invalid handler.");
	     *     }
	     *     var handlers = this.__watchers[prop], index;
	     *     if (handlers && (index = handlers.indexOf(handler)) !== -1) {
	     *        //remove the handler if it is found
	     *         handlers.splice(index, 1);
	     *     }
	     * }
	     *
	     * declare({
	     *     instance:{
	     *         constructor:function () {
	     *             this._super(arguments);
	     *             //set up our watchers
	     *             this.__watchers = {};
	     *         },
	     *
	     *         //override the default set function so we can watch values
	     *         "set":_set,
	     *         //set up our callhandlers function
	     *         __callHandlers:_callHandlers,
	     *         //add the watch function
	     *         watch:_watch,
	     *         //add the unwatch function
	     *         unwatch:_unwatch
	     *     },
	     *
	     *     "static":{
	     *
	     *         init:function () {
	     *             this._super(arguments);
	     *             this.__watchers = {};
	     *         },
	     *         //override the default set function so we can watch values
	     *         "set":_set,
	     *         //set our callHandlers function
	     *         __callHandlers:_callHandlers,
	     *         //add the watch
	     *         watch:_watch,
	     *         //add the unwatch function
	     *         unwatch:_unwatch
	     *     }
	     * })
	     *
	     * ```
	     *
	     * Now lets use the mixin
	     *
	     * ```
	     * var WatchDog = declare([Dog, WatchMixin]);
	     *
	     * var watchDog = new WatchDog();
	     * //create our handler
	     * function watch(id, oldVal, newVal) {
	     *     console.log("watchdog's %s was %s, now %s", id, oldVal, newVal);
	     * }
	     *
	     * //watch for property changes
	     * watchDog.watch("type", watch);
	     * watchDog.watch("color", watch);
	     * watchDog.watch("sound", watch);
	     *
	     * //now set the properties each handler will be called
	     * watchDog.set("type", "newDog");
	     * watchDog.set("color", "newColor");
	     * watchDog.set("sound", "newSound");
	     *
	     *
	     * //unwatch the property changes
	     * watchDog.unwatch("type", watch);
	     * watchDog.unwatch("color", watch);
	     * watchDog.unwatch("sound", watch);
	     *
	     * //no handlers will be called this time
	     * watchDog.set("type", "newDog");
	     * watchDog.set("color", "newColor");
	     * watchDog.set("sound", "newSound");
	     *
	     *
	     * ```
	     *
	     * ###Accessing static methods and properties witin an instance.
	     *
	     * To access static properties on an instance use the `_static` property which is a reference to your constructor.
	     *
	     * For example if your in your constructor and you want to have configurable default values.
	     *
	     * ```
	     * consturctor : function constructor(opts){
	     *     this.opts = opts || {};
	     *     this._type = opts.type || this._static.DEFAULT_TYPE;
	     * }
	     * ```
	     *
	     *
	     *
	     * ###Creating a new instance of within an instance.
	     *
	     * Often times you want to create a new instance of an object within an instance. If your subclassed however you cannot return a new instance of the parent class as it will not be the right sub class. `declare` provides a way around this by setting the `_static` property on each isntance of the class.
	     *
	     * Lets add a reproduce method `Mammal`
	     *
	     * ```
	     * reproduce : function(options){
	     *     return new this._static(options);
	     * }
	     * ```
	     *
	     * Now in each subclass you can call reproduce and get the proper type.
	     *
	     * ```
	     * var myDog = new Dog();
	     * var myDogsChild = myDog.reproduce();
	     *
	     * myDogsChild instanceof Dog; //true
	     * ```
	     *
	     * ###Using the `as`
	     *
	     * `declare` also provides an `as` method which allows you to add your class to an object or if your using node.js you can pass in `module` and the class will be exported as the module.
	     *
	     * ```
	     * var animals = {};
	     *
	     * Mammal.as(animals, "Dog");
	     * Wolf.as(animals, "Wolf");
	     * Dog.as(animals, "Dog");
	     * Breed.as(animals, "Breed");
	     *
	     * var myDog = new animals.Dog();
	     *
	     * ```
	     *
	     * Or in node
	     *
	     * ```
	     * Mammal.as(exports, "Dog");
	     * Wolf.as(exports, "Wolf");
	     * Dog.as(exports, "Dog");
	     * Breed.as(exports, "Breed");
	     *
	     * ```
	     *
	     * To export a class as the `module` in node
	     *
	     * ```
	     * Mammal.as(module);
	     * ```
	     *
	     *
	     */
	    function createDeclared() {
	        var arraySlice = Array.prototype.slice, classCounter = 0, Base, forceNew = new Function();

	        var SUPER_REGEXP = /(super)/g;

	        function argsToArray(args, slice) {
	            slice = slice || 0;
	            return arraySlice.call(args, slice);
	        }

	        function isArray(obj) {
	            return Object.prototype.toString.call(obj) === "[object Array]";
	        }

	        function isObject(obj) {
	            var undef;
	            return obj !== null && obj !== undef && typeof obj === "object";
	        }

	        function isHash(obj) {
	            var ret = isObject(obj);
	            return ret && obj.constructor === Object;
	        }

	        var isArguments = function _isArguments(object) {
	            return Object.prototype.toString.call(object) === '[object Arguments]';
	        };

	        if (!isArguments(arguments)) {
	            isArguments = function _isArguments(obj) {
	                return !!(obj && obj.hasOwnProperty("callee"));
	            };
	        }

	        function indexOf(arr, item) {
	            if (arr && arr.length) {
	                for (var i = 0, l = arr.length; i < l; i++) {
	                    if (arr[i] === item) {
	                        return i;
	                    }
	                }
	            }
	            return -1;
	        }

	        function merge(target, source, exclude) {
	            var name, s;
	            for (name in source) {
	                if (source.hasOwnProperty(name) && indexOf(exclude, name) === -1) {
	                    s = source[name];
	                    if (!(name in target) || (target[name] !== s)) {
	                        target[name] = s;
	                    }
	                }
	            }
	            return target;
	        }

	        function callSuper(args, a) {
	            var meta = this.__meta,
	                supers = meta.supers,
	                l = supers.length, superMeta = meta.superMeta, pos = superMeta.pos;
	            if (l > pos) {
	                args = !args ? [] : (!isArguments(args) && !isArray(args)) ? [args] : args;
	                var name = superMeta.name, f = superMeta.f, m;
	                do {
	                    m = supers[pos][name];
	                    if ("function" === typeof m && (m = m._f || m) !== f) {
	                        superMeta.pos = 1 + pos;
	                        return m.apply(this, args);
	                    }
	                } while (l > ++pos);
	            }

	            return null;
	        }

	        function getSuper() {
	            var meta = this.__meta,
	                supers = meta.supers,
	                l = supers.length, superMeta = meta.superMeta, pos = superMeta.pos;
	            if (l > pos) {
	                var name = superMeta.name, f = superMeta.f, m;
	                do {
	                    m = supers[pos][name];
	                    if ("function" === typeof m && (m = m._f || m) !== f) {
	                        superMeta.pos = 1 + pos;
	                        return m.bind(this);
	                    }
	                } while (l > ++pos);
	            }
	            return null;
	        }

	        function getter(name) {
	            var getters = this.__getters__;
	            if (getters.hasOwnProperty(name)) {
	                return getters[name].apply(this);
	            } else {
	                return this[name];
	            }
	        }

	        function setter(name, val) {
	            var setters = this.__setters__;
	            if (isHash(name)) {
	                for (var i in name) {
	                    var prop = name[i];
	                    if (setters.hasOwnProperty(i)) {
	                        setters[name].call(this, prop);
	                    } else {
	                        this[i] = prop;
	                    }
	                }
	            } else {
	                if (setters.hasOwnProperty(name)) {
	                    return setters[name].apply(this, argsToArray(arguments, 1));
	                } else {
	                    return this[name] = val;
	                }
	            }
	        }


	        function defaultFunction() {
	            var meta = this.__meta || {},
	                supers = meta.supers,
	                l = supers.length, superMeta = meta.superMeta, pos = superMeta.pos;
	            if (l > pos) {
	                var name = superMeta.name, f = superMeta.f, m;
	                do {
	                    m = supers[pos][name];
	                    if ("function" === typeof m && (m = m._f || m) !== f) {
	                        superMeta.pos = 1 + pos;
	                        return m.apply(this, arguments);
	                    }
	                } while (l > ++pos);
	            }
	            return null;
	        }


	        function functionWrapper(f, name) {
	            if (f.toString().match(SUPER_REGEXP)) {
	                var wrapper = function wrapper() {
	                    var ret, meta = this.__meta || {};
	                    var orig = meta.superMeta;
	                    meta.superMeta = {f: f, pos: 0, name: name};
	                    switch (arguments.length) {
	                    case 0:
	                        ret = f.call(this);
	                        break;
	                    case 1:
	                        ret = f.call(this, arguments[0]);
	                        break;
	                    case 2:
	                        ret = f.call(this, arguments[0], arguments[1]);
	                        break;

	                    case 3:
	                        ret = f.call(this, arguments[0], arguments[1], arguments[2]);
	                        break;
	                    default:
	                        ret = f.apply(this, arguments);
	                    }
	                    meta.superMeta = orig;
	                    return ret;
	                };
	                wrapper._f = f;
	                return wrapper;
	            } else {
	                f._f = f;
	                return f;
	            }
	        }

	        function defineMixinProps(child, proto) {

	            var operations = proto.setters || {}, __setters = child.__setters__, __getters = child.__getters__;
	            for (var i in operations) {
	                if (!__setters.hasOwnProperty(i)) {  //make sure that the setter isnt already there
	                    __setters[i] = operations[i];
	                }
	            }
	            operations = proto.getters || {};
	            for (i in operations) {
	                if (!__getters.hasOwnProperty(i)) {  //make sure that the setter isnt already there
	                    __getters[i] = operations[i];
	                }
	            }
	            for (var j in proto) {
	                if (j !== "getters" && j !== "setters") {
	                    var p = proto[j];
	                    if ("function" === typeof p) {
	                        if (!child.hasOwnProperty(j)) {
	                            child[j] = functionWrapper(defaultFunction, j);
	                        }
	                    } else {
	                        child[j] = p;
	                    }
	                }
	            }
	        }

	        function mixin() {
	            var args = argsToArray(arguments), l = args.length;
	            var child = this.prototype;
	            var childMeta = child.__meta, thisMeta = this.__meta, bases = child.__meta.bases, staticBases = bases.slice(),
	                staticSupers = thisMeta.supers || [], supers = childMeta.supers || [];
	            for (var i = 0; i < l; i++) {
	                var m = args[i], mProto = m.prototype;
	                var protoMeta = mProto.__meta, meta = m.__meta;
	                !protoMeta && (protoMeta = (mProto.__meta = {proto: mProto || {}}));
	                !meta && (meta = (m.__meta = {proto: m.__proto__ || {}}));
	                defineMixinProps(child, protoMeta.proto || {});
	                defineMixinProps(this, meta.proto || {});
	                //copy the bases for static,

	                mixinSupers(m.prototype, supers, bases);
	                mixinSupers(m, staticSupers, staticBases);
	            }
	            return this;
	        }

	        function mixinSupers(sup, arr, bases) {
	            var meta = sup.__meta;
	            !meta && (meta = (sup.__meta = {}));
	            var unique = sup.__meta.unique;
	            !unique && (meta.unique = "declare" + ++classCounter);
	            //check it we already have this super mixed into our prototype chain
	            //if true then we have already looped their supers!
	            if (indexOf(bases, unique) === -1) {
	                //add their id to our bases
	                bases.push(unique);
	                var supers = sup.__meta.supers || [], i = supers.length - 1 || 0;
	                while (i >= 0) {
	                    mixinSupers(supers[i--], arr, bases);
	                }
	                arr.unshift(sup);
	            }
	        }

	        function defineProps(child, proto) {
	            var operations = proto.setters,
	                __setters = child.__setters__,
	                __getters = child.__getters__;
	            if (operations) {
	                for (var i in operations) {
	                    __setters[i] = operations[i];
	                }
	            }
	            operations = proto.getters || {};
	            if (operations) {
	                for (i in operations) {
	                    __getters[i] = operations[i];
	                }
	            }
	            for (i in proto) {
	                if (i != "getters" && i != "setters") {
	                    var f = proto[i];
	                    if ("function" === typeof f) {
	                        var meta = f.__meta || {};
	                        if (!meta.isConstructor) {
	                            child[i] = functionWrapper(f, i);
	                        } else {
	                            child[i] = f;
	                        }
	                    } else {
	                        child[i] = f;
	                    }
	                }
	            }

	        }

	        function _export(obj, name) {
	            if (obj && name) {
	                obj[name] = this;
	            } else {
	                obj.exports = obj = this;
	            }
	            return this;
	        }

	        function extend(proto) {
	            return declare(this, proto);
	        }

	        function getNew(ctor) {
	            // create object with correct prototype using a do-nothing
	            // constructor
	            forceNew.prototype = ctor.prototype;
	            var t = new forceNew();
	            forceNew.prototype = null;	// clean up
	            return t;
	        }


	        function __declare(child, sup, proto) {
	            var childProto = {}, supers = [];
	            var unique = "declare" + ++classCounter, bases = [], staticBases = [];
	            var instanceSupers = [], staticSupers = [];
	            var meta = {
	                supers: instanceSupers,
	                unique: unique,
	                bases: bases,
	                superMeta: {
	                    f: null,
	                    pos: 0,
	                    name: null
	                }
	            };
	            var childMeta = {
	                supers: staticSupers,
	                unique: unique,
	                bases: staticBases,
	                isConstructor: true,
	                superMeta: {
	                    f: null,
	                    pos: 0,
	                    name: null
	                }
	            };

	            if (isHash(sup) && !proto) {
	                proto = sup;
	                sup = Base;
	            }

	            if ("function" === typeof sup || isArray(sup)) {
	                supers = isArray(sup) ? sup : [sup];
	                sup = supers.shift();
	                child.__meta = childMeta;
	                childProto = getNew(sup);
	                childProto.__meta = meta;
	                childProto.__getters__ = merge({}, childProto.__getters__ || {});
	                childProto.__setters__ = merge({}, childProto.__setters__ || {});
	                child.__getters__ = merge({}, child.__getters__ || {});
	                child.__setters__ = merge({}, child.__setters__ || {});
	                mixinSupers(sup.prototype, instanceSupers, bases);
	                mixinSupers(sup, staticSupers, staticBases);
	            } else {
	                child.__meta = childMeta;
	                childProto.__meta = meta;
	                childProto.__getters__ = childProto.__getters__ || {};
	                childProto.__setters__ = childProto.__setters__ || {};
	                child.__getters__ = child.__getters__ || {};
	                child.__setters__ = child.__setters__ || {};
	            }
	            child.prototype = childProto;
	            if (proto) {
	                var instance = meta.proto = proto.instance || {};
	                var stat = childMeta.proto = proto.static || {};
	                stat.init = stat.init || defaultFunction;
	                defineProps(childProto, instance);
	                defineProps(child, stat);
	                if (!instance.hasOwnProperty("constructor")) {
	                    childProto.constructor = instance.constructor = functionWrapper(defaultFunction, "constructor");
	                } else {
	                    childProto.constructor = functionWrapper(instance.constructor, "constructor");
	                }
	            } else {
	                meta.proto = {};
	                childMeta.proto = {};
	                child.init = functionWrapper(defaultFunction, "init");
	                childProto.constructor = functionWrapper(defaultFunction, "constructor");
	            }
	            if (supers.length) {
	                mixin.apply(child, supers);
	            }
	            if (sup) {
	                //do this so we mixin our super methods directly but do not ov
	                merge(child, merge(merge({}, sup), child));
	            }
	            childProto._super = child._super = callSuper;
	            childProto._getSuper = child._getSuper = getSuper;
	            childProto._static = child;
	        }

	        function declare(sup, proto) {
	            function declared() {
	                switch (arguments.length) {
	                case 0:
	                    this.constructor.call(this);
	                    break;
	                case 1:
	                    this.constructor.call(this, arguments[0]);
	                    break;
	                case 2:
	                    this.constructor.call(this, arguments[0], arguments[1]);
	                    break;
	                case 3:
	                    this.constructor.call(this, arguments[0], arguments[1], arguments[2]);
	                    break;
	                default:
	                    this.constructor.apply(this, arguments);
	                }
	            }

	            __declare(declared, sup, proto);
	            return declared.init() || declared;
	        }

	        function singleton(sup, proto) {
	            var retInstance;

	            function declaredSingleton() {
	                if (!retInstance) {
	                    this.constructor.apply(this, arguments);
	                    retInstance = this;
	                }
	                return retInstance;
	            }

	            __declare(declaredSingleton, sup, proto);
	            return  declaredSingleton.init() || declaredSingleton;
	        }

	        Base = declare({
	            instance: {
	                "get": getter,
	                "set": setter
	            },

	            "static": {
	                "get": getter,
	                "set": setter,
	                mixin: mixin,
	                extend: extend,
	                as: _export
	            }
	        });

	        declare.singleton = singleton;
	        return declare;
	    }

	    if (true) {
	        if ("undefined" !== typeof module && module.exports) {
	            module.exports = createDeclared();
	        }
	    } else if ("function" === typeof define && define.amd) {
	        define(createDeclared);
	    } else {
	        this.declare = createDeclared();
	    }
	}());





/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	(function () {
	    "use strict";
	    /*global extended isExtended*/

	    function defineObject(extended, is, arr) {

	        var deepEqual = is.deepEqual,
	            isString = is.isString,
	            isHash = is.isHash,
	            difference = arr.difference,
	            hasOwn = Object.prototype.hasOwnProperty,
	            isFunction = is.isFunction;

	        function _merge(target, source) {
	            var name, s;
	            for (name in source) {
	                if (hasOwn.call(source, name)) {
	                    s = source[name];
	                    if (!(name in target) || (target[name] !== s)) {
	                        target[name] = s;
	                    }
	                }
	            }
	            return target;
	        }

	        function _deepMerge(target, source) {
	            var name, s, t;
	            for (name in source) {
	                if (hasOwn.call(source, name)) {
	                    s = source[name];
	                    t = target[name];
	                    if (!deepEqual(t, s)) {
	                        if (isHash(t) && isHash(s)) {
	                            target[name] = _deepMerge(t, s);
	                        } else if (isHash(s)) {
	                            target[name] = _deepMerge({}, s);
	                        } else {
	                            target[name] = s;
	                        }
	                    }
	                }
	            }
	            return target;
	        }


	        function merge(obj) {
	            if (!obj) {
	                obj = {};
	            }
	            for (var i = 1, l = arguments.length; i < l; i++) {
	                _merge(obj, arguments[i]);
	            }
	            return obj; // Object
	        }

	        function deepMerge(obj) {
	            if (!obj) {
	                obj = {};
	            }
	            for (var i = 1, l = arguments.length; i < l; i++) {
	                _deepMerge(obj, arguments[i]);
	            }
	            return obj; // Object
	        }


	        function extend(parent, child) {
	            var proto = parent.prototype || parent;
	            merge(proto, child);
	            return parent;
	        }

	        function forEach(hash, iterator, scope) {
	            if (!isHash(hash) || !isFunction(iterator)) {
	                throw new TypeError();
	            }
	            var objKeys = keys(hash), key;
	            for (var i = 0, len = objKeys.length; i < len; ++i) {
	                key = objKeys[i];
	                iterator.call(scope || hash, hash[key], key, hash);
	            }
	            return hash;
	        }

	        function filter(hash, iterator, scope) {
	            if (!isHash(hash) || !isFunction(iterator)) {
	                throw new TypeError();
	            }
	            var objKeys = keys(hash), key, value, ret = {};
	            for (var i = 0, len = objKeys.length; i < len; ++i) {
	                key = objKeys[i];
	                value = hash[key];
	                if (iterator.call(scope || hash, value, key, hash)) {
	                    ret[key] = value;
	                }
	            }
	            return ret;
	        }

	        function values(hash) {
	            if (!isHash(hash)) {
	                throw new TypeError();
	            }
	            var objKeys = keys(hash), ret = [];
	            for (var i = 0, len = objKeys.length; i < len; ++i) {
	                ret.push(hash[objKeys[i]]);
	            }
	            return ret;
	        }


	        function keys(hash) {
	            if (!isHash(hash)) {
	                throw new TypeError();
	            }
	            var ret = [];
	            for (var i in hash) {
	                if (hasOwn.call(hash, i)) {
	                    ret.push(i);
	                }
	            }
	            return ret;
	        }

	        function invert(hash) {
	            if (!isHash(hash)) {
	                throw new TypeError();
	            }
	            var objKeys = keys(hash), key, ret = {};
	            for (var i = 0, len = objKeys.length; i < len; ++i) {
	                key = objKeys[i];
	                ret[hash[key]] = key;
	            }
	            return ret;
	        }

	        function toArray(hash) {
	            if (!isHash(hash)) {
	                throw new TypeError();
	            }
	            var objKeys = keys(hash), key, ret = [];
	            for (var i = 0, len = objKeys.length; i < len; ++i) {
	                key = objKeys[i];
	                ret.push([key, hash[key]]);
	            }
	            return ret;
	        }

	        function omit(hash, omitted) {
	            if (!isHash(hash)) {
	                throw new TypeError();
	            }
	            if (isString(omitted)) {
	                omitted = [omitted];
	            }
	            var objKeys = difference(keys(hash), omitted), key, ret = {};
	            for (var i = 0, len = objKeys.length; i < len; ++i) {
	                key = objKeys[i];
	                ret[key] = hash[key];
	            }
	            return ret;
	        }

	        var hash = {
	            forEach: forEach,
	            filter: filter,
	            invert: invert,
	            values: values,
	            toArray: toArray,
	            keys: keys,
	            omit: omit
	        };


	        var obj = {
	            extend: extend,
	            merge: merge,
	            deepMerge: deepMerge,
	            omit: omit
	        };

	        var ret = extended.define(is.isObject, obj).define(isHash, hash).define(is.isFunction, {extend: extend}).expose({hash: hash}).expose(obj);
	        var orig = ret.extend;
	        ret.extend = function __extend() {
	            if (arguments.length === 1) {
	                return orig.extend.apply(ret, arguments);
	            } else {
	                extend.apply(null, arguments);
	            }
	        };
	        return ret;

	    }

	    if (true) {
	        if ("undefined" !== typeof module && module.exports) {
	            module.exports = defineObject(__webpack_require__(9), __webpack_require__(8), __webpack_require__(15));

	        }
	    } else if ("function" === typeof define && define.amd) {
	        define(["extended", "is-extended", "array-extended"], function (extended, is, array) {
	            return defineObject(extended, is, array);
	        });
	    } else {
	        this.objectExtended = defineObject(this.extended, this.isExtended, this.arrayExtended);
	    }

	}).call(this);








/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	(function () {
	    "use strict";
	    /*global define*/

	    function defineArray(extended, is, args) {

	        var isString = is.isString,
	            isArray = Array.isArray || is.isArray,
	            isDate = is.isDate,
	            floor = Math.floor,
	            abs = Math.abs,
	            mathMax = Math.max,
	            mathMin = Math.min,
	            arrayProto = Array.prototype,
	            arrayIndexOf = arrayProto.indexOf,
	            arrayForEach = arrayProto.forEach,
	            arrayMap = arrayProto.map,
	            arrayReduce = arrayProto.reduce,
	            arrayReduceRight = arrayProto.reduceRight,
	            arrayFilter = arrayProto.filter,
	            arrayEvery = arrayProto.every,
	            arraySome = arrayProto.some,
	            argsToArray = args.argsToArray;


	        function cross(num, cros) {
	            return reduceRight(cros, function (a, b) {
	                if (!isArray(b)) {
	                    b = [b];
	                }
	                b.unshift(num);
	                a.unshift(b);
	                return a;
	            }, []);
	        }

	        function permute(num, cross, length) {
	            var ret = [];
	            for (var i = 0; i < cross.length; i++) {
	                ret.push([num].concat(rotate(cross, i)).slice(0, length));
	            }
	            return ret;
	        }


	        function intersection(a, b) {
	            var ret = [], aOne, i = -1, l;
	            l = a.length;
	            while (++i < l) {
	                aOne = a[i];
	                if (indexOf(b, aOne) !== -1) {
	                    ret.push(aOne);
	                }
	            }
	            return ret;
	        }


	        var _sort = (function () {

	            var isAll = function (arr, test) {
	                return every(arr, test);
	            };

	            var defaultCmp = function (a, b) {
	                return a - b;
	            };

	            var dateSort = function (a, b) {
	                return a.getTime() - b.getTime();
	            };

	            return function _sort(arr, property) {
	                var ret = [];
	                if (isArray(arr)) {
	                    ret = arr.slice();
	                    if (property) {
	                        if (typeof property === "function") {
	                            ret.sort(property);
	                        } else {
	                            ret.sort(function (a, b) {
	                                var aProp = a[property], bProp = b[property];
	                                if (isString(aProp) && isString(bProp)) {
	                                    return aProp > bProp ? 1 : aProp < bProp ? -1 : 0;
	                                } else if (isDate(aProp) && isDate(bProp)) {
	                                    return aProp.getTime() - bProp.getTime();
	                                } else {
	                                    return aProp - bProp;
	                                }
	                            });
	                        }
	                    } else {
	                        if (isAll(ret, isString)) {
	                            ret.sort();
	                        } else if (isAll(ret, isDate)) {
	                            ret.sort(dateSort);
	                        } else {
	                            ret.sort(defaultCmp);
	                        }
	                    }
	                }
	                return ret;
	            };

	        })();

	        function indexOf(arr, searchElement, from) {
	            var index = (from || 0) - 1,
	                length = arr.length;
	            while (++index < length) {
	                if (arr[index] === searchElement) {
	                    return index;
	                }
	            }
	            return -1;
	        }

	        function lastIndexOf(arr, searchElement, from) {
	            if (!isArray(arr)) {
	                throw new TypeError();
	            }

	            var t = Object(arr);
	            var len = t.length >>> 0;
	            if (len === 0) {
	                return -1;
	            }

	            var n = len;
	            if (arguments.length > 2) {
	                n = Number(arguments[2]);
	                if (n !== n) {
	                    n = 0;
	                } else if (n !== 0 && n !== (1 / 0) && n !== -(1 / 0)) {
	                    n = (n > 0 || -1) * floor(abs(n));
	                }
	            }

	            var k = n >= 0 ? mathMin(n, len - 1) : len - abs(n);

	            for (; k >= 0; k--) {
	                if (k in t && t[k] === searchElement) {
	                    return k;
	                }
	            }
	            return -1;
	        }

	        function filter(arr, iterator, scope) {
	            if (arr && arrayFilter && arrayFilter === arr.filter) {
	                return arr.filter(iterator, scope);
	            }
	            if (!isArray(arr) || typeof iterator !== "function") {
	                throw new TypeError();
	            }

	            var t = Object(arr);
	            var len = t.length >>> 0;
	            var res = [];
	            for (var i = 0; i < len; i++) {
	                if (i in t) {
	                    var val = t[i]; // in case fun mutates this
	                    if (iterator.call(scope, val, i, t)) {
	                        res.push(val);
	                    }
	                }
	            }
	            return res;
	        }

	        function forEach(arr, iterator, scope) {
	            if (!isArray(arr) || typeof iterator !== "function") {
	                throw new TypeError();
	            }
	            if (arr && arrayForEach && arrayForEach === arr.forEach) {
	                arr.forEach(iterator, scope);
	                return arr;
	            }
	            for (var i = 0, len = arr.length; i < len; ++i) {
	                iterator.call(scope || arr, arr[i], i, arr);
	            }

	            return arr;
	        }

	        function every(arr, iterator, scope) {
	            if (arr && arrayEvery && arrayEvery === arr.every) {
	                return arr.every(iterator, scope);
	            }
	            if (!isArray(arr) || typeof iterator !== "function") {
	                throw new TypeError();
	            }
	            var t = Object(arr);
	            var len = t.length >>> 0;
	            for (var i = 0; i < len; i++) {
	                if (i in t && !iterator.call(scope, t[i], i, t)) {
	                    return false;
	                }
	            }
	            return true;
	        }

	        function some(arr, iterator, scope) {
	            if (arr && arraySome && arraySome === arr.some) {
	                return arr.some(iterator, scope);
	            }
	            if (!isArray(arr) || typeof iterator !== "function") {
	                throw new TypeError();
	            }
	            var t = Object(arr);
	            var len = t.length >>> 0;
	            for (var i = 0; i < len; i++) {
	                if (i in t && iterator.call(scope, t[i], i, t)) {
	                    return true;
	                }
	            }
	            return false;
	        }

	        function map(arr, iterator, scope) {
	            if (arr && arrayMap && arrayMap === arr.map) {
	                return arr.map(iterator, scope);
	            }
	            if (!isArray(arr) || typeof iterator !== "function") {
	                throw new TypeError();
	            }

	            var t = Object(arr);
	            var len = t.length >>> 0;
	            var res = [];
	            for (var i = 0; i < len; i++) {
	                if (i in t) {
	                    res.push(iterator.call(scope, t[i], i, t));
	                }
	            }
	            return res;
	        }

	        function reduce(arr, accumulator, curr) {
	            var initial = arguments.length > 2;
	            if (arr && arrayReduce && arrayReduce === arr.reduce) {
	                return initial ? arr.reduce(accumulator, curr) : arr.reduce(accumulator);
	            }
	            if (!isArray(arr) || typeof accumulator !== "function") {
	                throw new TypeError();
	            }
	            var i = 0, l = arr.length >> 0;
	            if (arguments.length < 3) {
	                if (l === 0) {
	                    throw new TypeError("Array length is 0 and no second argument");
	                }
	                curr = arr[0];
	                i = 1; // start accumulating at the second element
	            } else {
	                curr = arguments[2];
	            }
	            while (i < l) {
	                if (i in arr) {
	                    curr = accumulator.call(undefined, curr, arr[i], i, arr);
	                }
	                ++i;
	            }
	            return curr;
	        }

	        function reduceRight(arr, accumulator, curr) {
	            var initial = arguments.length > 2;
	            if (arr && arrayReduceRight && arrayReduceRight === arr.reduceRight) {
	                return initial ? arr.reduceRight(accumulator, curr) : arr.reduceRight(accumulator);
	            }
	            if (!isArray(arr) || typeof accumulator !== "function") {
	                throw new TypeError();
	            }

	            var t = Object(arr);
	            var len = t.length >>> 0;

	            // no value to return if no initial value, empty array
	            if (len === 0 && arguments.length === 2) {
	                throw new TypeError();
	            }

	            var k = len - 1;
	            if (arguments.length >= 3) {
	                curr = arguments[2];
	            } else {
	                do {
	                    if (k in arr) {
	                        curr = arr[k--];
	                        break;
	                    }
	                }
	                while (true);
	            }
	            while (k >= 0) {
	                if (k in t) {
	                    curr = accumulator.call(undefined, curr, t[k], k, t);
	                }
	                k--;
	            }
	            return curr;
	        }


	        function toArray(o) {
	            var ret = [];
	            if (o !== null) {
	                var args = argsToArray(arguments);
	                if (args.length === 1) {
	                    if (isArray(o)) {
	                        ret = o;
	                    } else if (is.isHash(o)) {
	                        for (var i in o) {
	                            if (o.hasOwnProperty(i)) {
	                                ret.push([i, o[i]]);
	                            }
	                        }
	                    } else {
	                        ret.push(o);
	                    }
	                } else {
	                    forEach(args, function (a) {
	                        ret = ret.concat(toArray(a));
	                    });
	                }
	            }
	            return ret;
	        }

	        function sum(array) {
	            array = array || [];
	            if (array.length) {
	                return reduce(array, function (a, b) {
	                    return a + b;
	                });
	            } else {
	                return 0;
	            }
	        }

	        function avg(arr) {
	            arr = arr || [];
	            if (arr.length) {
	                var total = sum(arr);
	                if (is.isNumber(total)) {
	                    return  total / arr.length;
	                } else {
	                    throw new Error("Cannot average an array of non numbers.");
	                }
	            } else {
	                return 0;
	            }
	        }

	        function sort(arr, cmp) {
	            return _sort(arr, cmp);
	        }

	        function min(arr, cmp) {
	            return _sort(arr, cmp)[0];
	        }

	        function max(arr, cmp) {
	            return _sort(arr, cmp)[arr.length - 1];
	        }

	        function difference(arr1) {
	            var ret = arr1, args = flatten(argsToArray(arguments, 1));
	            if (isArray(arr1)) {
	                ret = filter(arr1, function (a) {
	                    return indexOf(args, a) === -1;
	                });
	            }
	            return ret;
	        }

	        function removeDuplicates(arr) {
	            var ret = [], i = -1, l, retLength = 0;
	            if (arr) {
	                l = arr.length;
	                while (++i < l) {
	                    var item = arr[i];
	                    if (indexOf(ret, item) === -1) {
	                        ret[retLength++] = item;
	                    }
	                }
	            }
	            return ret;
	        }


	        function unique(arr) {
	            return removeDuplicates(arr);
	        }


	        function rotate(arr, numberOfTimes) {
	            var ret = arr.slice();
	            if (typeof numberOfTimes !== "number") {
	                numberOfTimes = 1;
	            }
	            if (numberOfTimes && isArray(arr)) {
	                if (numberOfTimes > 0) {
	                    ret.push(ret.shift());
	                    numberOfTimes--;
	                } else {
	                    ret.unshift(ret.pop());
	                    numberOfTimes++;
	                }
	                return rotate(ret, numberOfTimes);
	            } else {
	                return ret;
	            }
	        }

	        function permutations(arr, length) {
	            var ret = [];
	            if (isArray(arr)) {
	                var copy = arr.slice(0);
	                if (typeof length !== "number") {
	                    length = arr.length;
	                }
	                if (!length) {
	                    ret = [
	                        []
	                    ];
	                } else if (length <= arr.length) {
	                    ret = reduce(arr, function (a, b, i) {
	                        var ret;
	                        if (length > 1) {
	                            ret = permute(b, rotate(copy, i).slice(1), length);
	                        } else {
	                            ret = [
	                                [b]
	                            ];
	                        }
	                        return a.concat(ret);
	                    }, []);
	                }
	            }
	            return ret;
	        }

	        function zip() {
	            var ret = [];
	            var arrs = argsToArray(arguments);
	            if (arrs.length > 1) {
	                var arr1 = arrs.shift();
	                if (isArray(arr1)) {
	                    ret = reduce(arr1, function (a, b, i) {
	                        var curr = [b];
	                        for (var j = 0; j < arrs.length; j++) {
	                            var currArr = arrs[j];
	                            if (isArray(currArr) && !is.isUndefined(currArr[i])) {
	                                curr.push(currArr[i]);
	                            } else {
	                                curr.push(null);
	                            }
	                        }
	                        a.push(curr);
	                        return a;
	                    }, []);
	                }
	            }
	            return ret;
	        }

	        function transpose(arr) {
	            var ret = [];
	            if (isArray(arr) && arr.length) {
	                var last;
	                forEach(arr, function (a) {
	                    if (isArray(a) && (!last || a.length === last.length)) {
	                        forEach(a, function (b, i) {
	                            if (!ret[i]) {
	                                ret[i] = [];
	                            }
	                            ret[i].push(b);
	                        });
	                        last = a;
	                    }
	                });
	            }
	            return ret;
	        }

	        function valuesAt(arr, indexes) {
	            var ret = [];
	            indexes = argsToArray(arguments);
	            arr = indexes.shift();
	            if (isArray(arr) && indexes.length) {
	                for (var i = 0, l = indexes.length; i < l; i++) {
	                    ret.push(arr[indexes[i]] || null);
	                }
	            }
	            return ret;
	        }

	        function union() {
	            var ret = [];
	            var arrs = argsToArray(arguments);
	            if (arrs.length > 1) {
	                for (var i = 0, l = arrs.length; i < l; i++) {
	                    ret = ret.concat(arrs[i]);
	                }
	                ret = removeDuplicates(ret);
	            }
	            return ret;
	        }

	        function intersect() {
	            var collect = [], sets, i = -1 , l;
	            if (arguments.length > 1) {
	                //assume we are intersections all the lists in the array
	                sets = argsToArray(arguments);
	            } else {
	                sets = arguments[0];
	            }
	            if (isArray(sets)) {
	                collect = sets[0];
	                i = 0;
	                l = sets.length;
	                while (++i < l) {
	                    collect = intersection(collect, sets[i]);
	                }
	            }
	            return removeDuplicates(collect);
	        }

	        function powerSet(arr) {
	            var ret = [];
	            if (isArray(arr) && arr.length) {
	                ret = reduce(arr, function (a, b) {
	                    var ret = map(a, function (c) {
	                        return c.concat(b);
	                    });
	                    return a.concat(ret);
	                }, [
	                    []
	                ]);
	            }
	            return ret;
	        }

	        function cartesian(a, b) {
	            var ret = [];
	            if (isArray(a) && isArray(b) && a.length && b.length) {
	                ret = cross(a[0], b).concat(cartesian(a.slice(1), b));
	            }
	            return ret;
	        }

	        function compact(arr) {
	            var ret = [];
	            if (isArray(arr) && arr.length) {
	                ret = filter(arr, function (item) {
	                    return !is.isUndefinedOrNull(item);
	                });
	            }
	            return ret;
	        }

	        function multiply(arr, times) {
	            times = is.isNumber(times) ? times : 1;
	            if (!times) {
	                //make sure times is greater than zero if it is zero then dont multiply it
	                times = 1;
	            }
	            arr = toArray(arr || []);
	            var ret = [], i = 0;
	            while (++i <= times) {
	                ret = ret.concat(arr);
	            }
	            return ret;
	        }

	        function flatten(arr) {
	            var set;
	            var args = argsToArray(arguments);
	            if (args.length > 1) {
	                //assume we are intersections all the lists in the array
	                set = args;
	            } else {
	                set = toArray(arr);
	            }
	            return reduce(set, function (a, b) {
	                return a.concat(b);
	            }, []);
	        }

	        function pluck(arr, prop) {
	            prop = prop.split(".");
	            var result = arr.slice(0);
	            forEach(prop, function (prop) {
	                var exec = prop.match(/(\w+)\(\)$/);
	                result = map(result, function (item) {
	                    return exec ? item[exec[1]]() : item[prop];
	                });
	            });
	            return result;
	        }

	        function invoke(arr, func, args) {
	            args = argsToArray(arguments, 2);
	            return map(arr, function (item) {
	                var exec = isString(func) ? item[func] : func;
	                return exec.apply(item, args);
	            });
	        }


	        var array = {
	            toArray: toArray,
	            sum: sum,
	            avg: avg,
	            sort: sort,
	            min: min,
	            max: max,
	            difference: difference,
	            removeDuplicates: removeDuplicates,
	            unique: unique,
	            rotate: rotate,
	            permutations: permutations,
	            zip: zip,
	            transpose: transpose,
	            valuesAt: valuesAt,
	            union: union,
	            intersect: intersect,
	            powerSet: powerSet,
	            cartesian: cartesian,
	            compact: compact,
	            multiply: multiply,
	            flatten: flatten,
	            pluck: pluck,
	            invoke: invoke,
	            forEach: forEach,
	            map: map,
	            filter: filter,
	            reduce: reduce,
	            reduceRight: reduceRight,
	            some: some,
	            every: every,
	            indexOf: indexOf,
	            lastIndexOf: lastIndexOf
	        };

	        return extended.define(isArray, array).expose(array);
	    }

	    if (true) {
	        if ("undefined" !== typeof module && module.exports) {
	            module.exports = defineArray(__webpack_require__(9), __webpack_require__(8), __webpack_require__(16));
	        }
	    } else if ("function" === typeof define && define.amd) {
	        define(["extended", "is-extended", "arguments-extended"], function (extended, is, args) {
	            return defineArray(extended, is, args);
	        });
	    } else {
	        this.arrayExtended = defineArray(this.extended, this.isExtended, this.argumentsExtended);
	    }

	}).call(this);








/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	(function () {
	    "use strict";

	    function defineArgumentsExtended(extended, is) {

	        var pSlice = Array.prototype.slice,
	            isArguments = is.isArguments;

	        function argsToArray(args, slice) {
	            var i = -1, j = 0, l = args.length, ret = [];
	            slice = slice || 0;
	            i += slice;
	            while (++i < l) {
	                ret[j++] = args[i];
	            }
	            return ret;
	        }


	        return extended
	            .define(isArguments, {
	                toArray: argsToArray
	            })
	            .expose({
	                argsToArray: argsToArray
	            });
	    }

	    if (true) {
	        if ("undefined" !== typeof module && module.exports) {
	            module.exports = defineArgumentsExtended(__webpack_require__(9), __webpack_require__(8));

	        }
	    } else if ("function" === typeof define && define.amd) {
	        define(["extended", "is-extended"], function (extended, is) {
	            return defineArgumentsExtended(extended, is);
	        });
	    } else {
	        this.argumentsExtended = defineArgumentsExtended(this.extended, this.isExtended);
	    }

	}).call(this);



/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	(function () {
	    "use strict";

	    function defineString(extended, is, date, arr) {

	        var stringify;
	        if (typeof JSON === "undefined") {
	            /*
	             json2.js
	             2012-10-08

	             Public Domain.

	             NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
	             */

	            (function () {
	                function f(n) {
	                    // Format integers to have at least two digits.
	                    return n < 10 ? '0' + n : n;
	                }

	                var isPrimitive = is.tester().isString().isNumber().isBoolean().tester();

	                function toJSON(obj) {
	                    if (is.isDate(obj)) {
	                        return isFinite(obj.valueOf()) ? obj.getUTCFullYear() + '-' +
	                            f(obj.getUTCMonth() + 1) + '-' +
	                            f(obj.getUTCDate()) + 'T' +
	                            f(obj.getUTCHours()) + ':' +
	                            f(obj.getUTCMinutes()) + ':' +
	                            f(obj.getUTCSeconds()) + 'Z'
	                            : null;
	                    } else if (isPrimitive(obj)) {
	                        return obj.valueOf();
	                    }
	                    return obj;
	                }

	                var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
	                    escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
	                    gap,
	                    indent,
	                    meta = {    // table of character substitutions
	                        '\b': '\\b',
	                        '\t': '\\t',
	                        '\n': '\\n',
	                        '\f': '\\f',
	                        '\r': '\\r',
	                        '"': '\\"',
	                        '\\': '\\\\'
	                    },
	                    rep;


	                function quote(string) {
	                    escapable.lastIndex = 0;
	                    return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
	                        var c = meta[a];
	                        return typeof c === 'string' ? c : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
	                    }) + '"' : '"' + string + '"';
	                }


	                function str(key, holder) {

	                    var i, k, v, length, mind = gap, partial, value = holder[key];
	                    if (value) {
	                        value = toJSON(value);
	                    }
	                    if (typeof rep === 'function') {
	                        value = rep.call(holder, key, value);
	                    }
	                    switch (typeof value) {
	                    case 'string':
	                        return quote(value);
	                    case 'number':
	                        return isFinite(value) ? String(value) : 'null';
	                    case 'boolean':
	                    case 'null':
	                        return String(value);
	                    case 'object':
	                        if (!value) {
	                            return 'null';
	                        }
	                        gap += indent;
	                        partial = [];
	                        if (Object.prototype.toString.apply(value) === '[object Array]') {
	                            length = value.length;
	                            for (i = 0; i < length; i += 1) {
	                                partial[i] = str(i, value) || 'null';
	                            }
	                            v = partial.length === 0 ? '[]' : gap ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']' : '[' + partial.join(',') + ']';
	                            gap = mind;
	                            return v;
	                        }
	                        if (rep && typeof rep === 'object') {
	                            length = rep.length;
	                            for (i = 0; i < length; i += 1) {
	                                if (typeof rep[i] === 'string') {
	                                    k = rep[i];
	                                    v = str(k, value);
	                                    if (v) {
	                                        partial.push(quote(k) + (gap ? ': ' : ':') + v);
	                                    }
	                                }
	                            }
	                        } else {
	                            for (k in value) {
	                                if (Object.prototype.hasOwnProperty.call(value, k)) {
	                                    v = str(k, value);
	                                    if (v) {
	                                        partial.push(quote(k) + (gap ? ': ' : ':') + v);
	                                    }
	                                }
	                            }
	                        }
	                        v = partial.length === 0 ? '{}' : gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}' : '{' + partial.join(',') + '}';
	                        gap = mind;
	                        return v;
	                    }
	                }

	                stringify = function (value, replacer, space) {
	                    var i;
	                    gap = '';
	                    indent = '';
	                    if (typeof space === 'number') {
	                        for (i = 0; i < space; i += 1) {
	                            indent += ' ';
	                        }
	                    } else if (typeof space === 'string') {
	                        indent = space;
	                    }
	                    rep = replacer;
	                    if (replacer && typeof replacer !== 'function' &&
	                        (typeof replacer !== 'object' ||
	                            typeof replacer.length !== 'number')) {
	                        throw new Error('JSON.stringify');
	                    }
	                    return str('', {'': value});
	                };
	            }());
	        } else {
	            stringify = JSON.stringify;
	        }


	        var isHash = is.isHash, aSlice = Array.prototype.slice;

	        var FORMAT_REGEX = /%((?:-?\+?.?\d*)?|(?:\[[^\[|\]]*\]))?([sjdDZ])/g;
	        var INTERP_REGEX = /\{(?:\[([^\[|\]]*)\])?(\w+)\}/g;
	        var STR_FORMAT = /(-?)(\+?)([A-Z|a-z|\W]?)([1-9][0-9]*)?$/;
	        var OBJECT_FORMAT = /([1-9][0-9]*)$/g;

	        function formatString(string, format) {
	            var ret = string;
	            if (STR_FORMAT.test(format)) {
	                var match = format.match(STR_FORMAT);
	                var isLeftJustified = match[1], padChar = match[3], width = match[4];
	                if (width) {
	                    width = parseInt(width, 10);
	                    if (ret.length < width) {
	                        ret = pad(ret, width, padChar, isLeftJustified);
	                    } else {
	                        ret = truncate(ret, width);
	                    }
	                }
	            }
	            return ret;
	        }

	        function formatNumber(number, format) {
	            var ret;
	            if (is.isNumber(number)) {
	                ret = "" + number;
	                if (STR_FORMAT.test(format)) {
	                    var match = format.match(STR_FORMAT);
	                    var isLeftJustified = match[1], signed = match[2], padChar = match[3], width = match[4];
	                    if (signed) {
	                        ret = (number > 0 ? "+" : "") + ret;
	                    }
	                    if (width) {
	                        width = parseInt(width, 10);
	                        if (ret.length < width) {
	                            ret = pad(ret, width, padChar || "0", isLeftJustified);
	                        } else {
	                            ret = truncate(ret, width);
	                        }
	                    }

	                }
	            } else {
	                throw new Error("stringExtended.format : when using %d the parameter must be a number!");
	            }
	            return ret;
	        }

	        function formatObject(object, format) {
	            var ret, match = format.match(OBJECT_FORMAT), spacing = 0;
	            if (match) {
	                spacing = parseInt(match[0], 10);
	                if (isNaN(spacing)) {
	                    spacing = 0;
	                }
	            }
	            try {
	                ret = stringify(object, null, spacing);
	            } catch (e) {
	                throw new Error("stringExtended.format : Unable to parse json from ", object);
	            }
	            return ret;
	        }


	        var styles = {
	            //styles
	            bold: 1,
	            bright: 1,
	            italic: 3,
	            underline: 4,
	            blink: 5,
	            inverse: 7,
	            crossedOut: 9,

	            red: 31,
	            green: 32,
	            yellow: 33,
	            blue: 34,
	            magenta: 35,
	            cyan: 36,
	            white: 37,

	            redBackground: 41,
	            greenBackground: 42,
	            yellowBackground: 43,
	            blueBackground: 44,
	            magentaBackground: 45,
	            cyanBackground: 46,
	            whiteBackground: 47,

	            encircled: 52,
	            overlined: 53,
	            grey: 90,
	            black: 90
	        };

	        var characters = {
	            SMILEY: "☺",
	            SOLID_SMILEY: "☻",
	            HEART: "♥",
	            DIAMOND: "♦",
	            CLOVE: "♣",
	            SPADE: "♠",
	            DOT: "•",
	            SQUARE_CIRCLE: "◘",
	            CIRCLE: "○",
	            FILLED_SQUARE_CIRCLE: "◙",
	            MALE: "♂",
	            FEMALE: "♀",
	            EIGHT_NOTE: "♪",
	            DOUBLE_EIGHTH_NOTE: "♫",
	            SUN: "☼",
	            PLAY: "►",
	            REWIND: "◄",
	            UP_DOWN: "↕",
	            PILCROW: "¶",
	            SECTION: "§",
	            THICK_MINUS: "▬",
	            SMALL_UP_DOWN: "↨",
	            UP_ARROW: "↑",
	            DOWN_ARROW: "↓",
	            RIGHT_ARROW: "→",
	            LEFT_ARROW: "←",
	            RIGHT_ANGLE: "∟",
	            LEFT_RIGHT_ARROW: "↔",
	            TRIANGLE: "▲",
	            DOWN_TRIANGLE: "▼",
	            HOUSE: "⌂",
	            C_CEDILLA: "Ç",
	            U_UMLAUT: "ü",
	            E_ACCENT: "é",
	            A_LOWER_CIRCUMFLEX: "â",
	            A_LOWER_UMLAUT: "ä",
	            A_LOWER_GRAVE_ACCENT: "à",
	            A_LOWER_CIRCLE_OVER: "å",
	            C_LOWER_CIRCUMFLEX: "ç",
	            E_LOWER_CIRCUMFLEX: "ê",
	            E_LOWER_UMLAUT: "ë",
	            E_LOWER_GRAVE_ACCENT: "è",
	            I_LOWER_UMLAUT: "ï",
	            I_LOWER_CIRCUMFLEX: "î",
	            I_LOWER_GRAVE_ACCENT: "ì",
	            A_UPPER_UMLAUT: "Ä",
	            A_UPPER_CIRCLE: "Å",
	            E_UPPER_ACCENT: "É",
	            A_E_LOWER: "æ",
	            A_E_UPPER: "Æ",
	            O_LOWER_CIRCUMFLEX: "ô",
	            O_LOWER_UMLAUT: "ö",
	            O_LOWER_GRAVE_ACCENT: "ò",
	            U_LOWER_CIRCUMFLEX: "û",
	            U_LOWER_GRAVE_ACCENT: "ù",
	            Y_LOWER_UMLAUT: "ÿ",
	            O_UPPER_UMLAUT: "Ö",
	            U_UPPER_UMLAUT: "Ü",
	            CENTS: "¢",
	            POUND: "£",
	            YEN: "¥",
	            CURRENCY: "¤",
	            PTS: "₧",
	            FUNCTION: "ƒ",
	            A_LOWER_ACCENT: "á",
	            I_LOWER_ACCENT: "í",
	            O_LOWER_ACCENT: "ó",
	            U_LOWER_ACCENT: "ú",
	            N_LOWER_TILDE: "ñ",
	            N_UPPER_TILDE: "Ñ",
	            A_SUPER: "ª",
	            O_SUPER: "º",
	            UPSIDEDOWN_QUESTION: "¿",
	            SIDEWAYS_L: "⌐",
	            NEGATION: "¬",
	            ONE_HALF: "½",
	            ONE_FOURTH: "¼",
	            UPSIDEDOWN_EXCLAMATION: "¡",
	            DOUBLE_LEFT: "«",
	            DOUBLE_RIGHT: "»",
	            LIGHT_SHADED_BOX: "░",
	            MEDIUM_SHADED_BOX: "▒",
	            DARK_SHADED_BOX: "▓",
	            VERTICAL_LINE: "│",
	            MAZE__SINGLE_RIGHT_T: "┤",
	            MAZE_SINGLE_RIGHT_TOP: "┐",
	            MAZE_SINGLE_RIGHT_BOTTOM_SMALL: "┘",
	            MAZE_SINGLE_LEFT_TOP_SMALL: "┌",
	            MAZE_SINGLE_LEFT_BOTTOM_SMALL: "└",
	            MAZE_SINGLE_LEFT_T: "├",
	            MAZE_SINGLE_BOTTOM_T: "┴",
	            MAZE_SINGLE_TOP_T: "┬",
	            MAZE_SINGLE_CENTER: "┼",
	            MAZE_SINGLE_HORIZONTAL_LINE: "─",
	            MAZE_SINGLE_RIGHT_DOUBLECENTER_T: "╡",
	            MAZE_SINGLE_RIGHT_DOUBLE_BL: "╛",
	            MAZE_SINGLE_RIGHT_DOUBLE_T: "╢",
	            MAZE_SINGLE_RIGHT_DOUBLEBOTTOM_TOP: "╖",
	            MAZE_SINGLE_RIGHT_DOUBLELEFT_TOP: "╕",
	            MAZE_SINGLE_LEFT_DOUBLE_T: "╞",
	            MAZE_SINGLE_BOTTOM_DOUBLE_T: "╧",
	            MAZE_SINGLE_TOP_DOUBLE_T: "╤",
	            MAZE_SINGLE_TOP_DOUBLECENTER_T: "╥",
	            MAZE_SINGLE_BOTTOM_DOUBLECENTER_T: "╨",
	            MAZE_SINGLE_LEFT_DOUBLERIGHT_BOTTOM: "╘",
	            MAZE_SINGLE_LEFT_DOUBLERIGHT_TOP: "╒",
	            MAZE_SINGLE_LEFT_DOUBLEBOTTOM_TOP: "╓",
	            MAZE_SINGLE_LEFT_DOUBLETOP_BOTTOM: "╙",
	            MAZE_SINGLE_LEFT_TOP: "Γ",
	            MAZE_SINGLE_RIGHT_BOTTOM: "╜",
	            MAZE_SINGLE_LEFT_CENTER: "╟",
	            MAZE_SINGLE_DOUBLECENTER_CENTER: "╫",
	            MAZE_SINGLE_DOUBLECROSS_CENTER: "╪",
	            MAZE_DOUBLE_LEFT_CENTER: "╣",
	            MAZE_DOUBLE_VERTICAL: "║",
	            MAZE_DOUBLE_RIGHT_TOP: "╗",
	            MAZE_DOUBLE_RIGHT_BOTTOM: "╝",
	            MAZE_DOUBLE_LEFT_BOTTOM: "╚",
	            MAZE_DOUBLE_LEFT_TOP: "╔",
	            MAZE_DOUBLE_BOTTOM_T: "╩",
	            MAZE_DOUBLE_TOP_T: "╦",
	            MAZE_DOUBLE_LEFT_T: "╠",
	            MAZE_DOUBLE_HORIZONTAL: "═",
	            MAZE_DOUBLE_CROSS: "╬",
	            SOLID_RECTANGLE: "█",
	            THICK_LEFT_VERTICAL: "▌",
	            THICK_RIGHT_VERTICAL: "▐",
	            SOLID_SMALL_RECTANGLE_BOTTOM: "▄",
	            SOLID_SMALL_RECTANGLE_TOP: "▀",
	            PHI_UPPER: "Φ",
	            INFINITY: "∞",
	            INTERSECTION: "∩",
	            DEFINITION: "≡",
	            PLUS_MINUS: "±",
	            GT_EQ: "≥",
	            LT_EQ: "≤",
	            THEREFORE: "⌠",
	            SINCE: "∵",
	            DOESNOT_EXIST: "∄",
	            EXISTS: "∃",
	            FOR_ALL: "∀",
	            EXCLUSIVE_OR: "⊕",
	            BECAUSE: "⌡",
	            DIVIDE: "÷",
	            APPROX: "≈",
	            DEGREE: "°",
	            BOLD_DOT: "∙",
	            DOT_SMALL: "·",
	            CHECK: "√",
	            ITALIC_X: "✗",
	            SUPER_N: "ⁿ",
	            SQUARED: "²",
	            CUBED: "³",
	            SOLID_BOX: "■",
	            PERMILE: "‰",
	            REGISTERED_TM: "®",
	            COPYRIGHT: "©",
	            TRADEMARK: "™",
	            BETA: "β",
	            GAMMA: "γ",
	            ZETA: "ζ",
	            ETA: "η",
	            IOTA: "ι",
	            KAPPA: "κ",
	            LAMBDA: "λ",
	            NU: "ν",
	            XI: "ξ",
	            OMICRON: "ο",
	            RHO: "ρ",
	            UPSILON: "υ",
	            CHI_LOWER: "φ",
	            CHI_UPPER: "χ",
	            PSI: "ψ",
	            ALPHA: "α",
	            ESZETT: "ß",
	            PI: "π",
	            SIGMA_UPPER: "Σ",
	            SIGMA_LOWER: "σ",
	            MU: "µ",
	            TAU: "τ",
	            THETA: "Θ",
	            OMEGA: "Ω",
	            DELTA: "δ",
	            PHI_LOWER: "φ",
	            EPSILON: "ε"
	        };

	        function pad(string, length, ch, end) {
	            string = "" + string; //check for numbers
	            ch = ch || " ";
	            var strLen = string.length;
	            while (strLen < length) {
	                if (end) {
	                    string += ch;
	                } else {
	                    string = ch + string;
	                }
	                strLen++;
	            }
	            return string;
	        }

	        function truncate(string, length, end) {
	            var ret = string;
	            if (is.isString(ret)) {
	                if (string.length > length) {
	                    if (end) {
	                        var l = string.length;
	                        ret = string.substring(l - length, l);
	                    } else {
	                        ret = string.substring(0, length);
	                    }
	                }
	            } else {
	                ret = truncate("" + ret, length);
	            }
	            return ret;
	        }

	        function format(str, obj) {
	            if (obj instanceof Array) {
	                var i = 0, len = obj.length;
	                //find the matches
	                return str.replace(FORMAT_REGEX, function (m, format, type) {
	                    var replacer, ret;
	                    if (i < len) {
	                        replacer = obj[i++];
	                    } else {
	                        //we are out of things to replace with so
	                        //just return the match?
	                        return m;
	                    }
	                    if (m === "%s" || m === "%d" || m === "%D") {
	                        //fast path!
	                        ret = replacer + "";
	                    } else if (m === "%Z") {
	                        ret = replacer.toUTCString();
	                    } else if (m === "%j") {
	                        try {
	                            ret = stringify(replacer);
	                        } catch (e) {
	                            throw new Error("stringExtended.format : Unable to parse json from ", replacer);
	                        }
	                    } else {
	                        format = format.replace(/^\[|\]$/g, "");
	                        switch (type) {
	                        case "s":
	                            ret = formatString(replacer, format);
	                            break;
	                        case "d":
	                            ret = formatNumber(replacer, format);
	                            break;
	                        case "j":
	                            ret = formatObject(replacer, format);
	                            break;
	                        case "D":
	                            ret = date.format(replacer, format);
	                            break;
	                        case "Z":
	                            ret = date.format(replacer, format, true);
	                            break;
	                        }
	                    }
	                    return ret;
	                });
	            } else if (isHash(obj)) {
	                return str.replace(INTERP_REGEX, function (m, format, value) {
	                    value = obj[value];
	                    if (!is.isUndefined(value)) {
	                        if (format) {
	                            if (is.isString(value)) {
	                                return formatString(value, format);
	                            } else if (is.isNumber(value)) {
	                                return formatNumber(value, format);
	                            } else if (is.isDate(value)) {
	                                return date.format(value, format);
	                            } else if (is.isObject(value)) {
	                                return formatObject(value, format);
	                            }
	                        } else {
	                            return "" + value;
	                        }
	                    }
	                    return m;
	                });
	            } else {
	                var args = aSlice.call(arguments).slice(1);
	                return format(str, args);
	            }
	        }

	        function toArray(testStr, delim) {
	            var ret = [];
	            if (testStr) {
	                if (testStr.indexOf(delim) > 0) {
	                    ret = testStr.replace(/\s+/g, "").split(delim);
	                }
	                else {
	                    ret.push(testStr);
	                }
	            }
	            return ret;
	        }

	        function multiply(str, times) {
	            var ret = [];
	            if (times) {
	                for (var i = 0; i < times; i++) {
	                    ret.push(str);
	                }
	            }
	            return ret.join("");
	        }


	        function style(str, options) {
	            var ret, i, l;
	            if (options) {
	                if (is.isArray(str)) {
	                    ret = [];
	                    for (i = 0, l = str.length; i < l; i++) {
	                        ret.push(style(str[i], options));
	                    }
	                } else if (options instanceof Array) {
	                    ret = str;
	                    for (i = 0, l = options.length; i < l; i++) {
	                        ret = style(ret, options[i]);
	                    }
	                } else if (options in styles) {
	                    ret = '\x1B[' + styles[options] + 'm' + str + '\x1B[0m';
	                }
	            }
	            return ret;
	        }

	        function escape(str, except) {
	            return str.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, function (ch) {
	                if (except && arr.indexOf(except, ch) !== -1) {
	                    return ch;
	                }
	                return "\\" + ch;
	            });
	        }

	        function trim(str) {
	            return str.replace(/^\s*|\s*$/g, "");
	        }

	        function trimLeft(str) {
	            return str.replace(/^\s*/, "");
	        }

	        function trimRight(str) {
	            return str.replace(/\s*$/, "");
	        }

	        function isEmpty(str) {
	            return str.length === 0;
	        }


	        var string = {
	            toArray: toArray,
	            pad: pad,
	            truncate: truncate,
	            multiply: multiply,
	            format: format,
	            style: style,
	            escape: escape,
	            trim: trim,
	            trimLeft: trimLeft,
	            trimRight: trimRight,
	            isEmpty: isEmpty
	        };
	        return extended.define(is.isString, string).define(is.isArray, {style: style}).expose(string).expose({characters: characters});
	    }

	    if (true) {
	        if ("undefined" !== typeof module && module.exports) {
	            module.exports = defineString(__webpack_require__(9), __webpack_require__(8), __webpack_require__(18), __webpack_require__(15));

	        }
	    } else if ("function" === typeof define && define.amd) {
	        define(["extended", "is-extended", "date-extended", "array-extended"], function (extended, is, date, arr) {
	            return defineString(extended, is, date, arr);
	        });
	    } else {
	        this.stringExtended = defineString(this.extended, this.isExtended, this.dateExtended, this.arrayExtended);
	    }

	}).call(this);








/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	(function () {
	    "use strict";

	    function defineDate(extended, is, array) {

	        function _pad(string, length, ch, end) {
	            string = "" + string; //check for numbers
	            ch = ch || " ";
	            var strLen = string.length;
	            while (strLen < length) {
	                if (end) {
	                    string += ch;
	                } else {
	                    string = ch + string;
	                }
	                strLen++;
	            }
	            return string;
	        }

	        function _truncate(string, length, end) {
	            var ret = string;
	            if (is.isString(ret)) {
	                if (string.length > length) {
	                    if (end) {
	                        var l = string.length;
	                        ret = string.substring(l - length, l);
	                    } else {
	                        ret = string.substring(0, length);
	                    }
	                }
	            } else {
	                ret = _truncate("" + ret, length);
	            }
	            return ret;
	        }

	        function every(arr, iterator, scope) {
	            if (!is.isArray(arr) || typeof iterator !== "function") {
	                throw new TypeError();
	            }
	            var t = Object(arr);
	            var len = t.length >>> 0;
	            for (var i = 0; i < len; i++) {
	                if (i in t && !iterator.call(scope, t[i], i, t)) {
	                    return false;
	                }
	            }
	            return true;
	        }


	        var transforms = (function () {
	                var floor = Math.floor, round = Math.round;

	                var addMap = {
	                    day: function addDay(date, amount) {
	                        return [amount, "Date", false];
	                    },
	                    weekday: function addWeekday(date, amount) {
	                        // Divide the increment time span into weekspans plus leftover days
	                        // e.g., 8 days is one 5-day weekspan / and two leftover days
	                        // Can't have zero leftover days, so numbers divisible by 5 get
	                        // a days value of 5, and the remaining days make up the number of weeks
	                        var days, weeks, mod = amount % 5, strt = date.getDay(), adj = 0;
	                        if (!mod) {
	                            days = (amount > 0) ? 5 : -5;
	                            weeks = (amount > 0) ? ((amount - 5) / 5) : ((amount + 5) / 5);
	                        } else {
	                            days = mod;
	                            weeks = parseInt(amount / 5, 10);
	                        }
	                        if (strt === 6 && amount > 0) {
	                            adj = 1;
	                        } else if (strt === 0 && amount < 0) {
	                            // Orig date is Sun / negative increment
	                            // Jump back over Sat
	                            adj = -1;
	                        }
	                        // Get weekday val for the new date
	                        var trgt = strt + days;
	                        // New date is on Sat or Sun
	                        if (trgt === 0 || trgt === 6) {
	                            adj = (amount > 0) ? 2 : -2;
	                        }
	                        // Increment by number of weeks plus leftover days plus
	                        // weekend adjustments
	                        return [(7 * weeks) + days + adj, "Date", false];
	                    },
	                    year: function addYear(date, amount) {
	                        return [amount, "FullYear", true];
	                    },
	                    week: function addWeek(date, amount) {
	                        return [amount * 7, "Date", false];
	                    },
	                    quarter: function addYear(date, amount) {
	                        return [amount * 3, "Month", true];
	                    },
	                    month: function addYear(date, amount) {
	                        return [amount, "Month", true];
	                    }
	                };

	                function addTransform(interval, date, amount) {
	                    interval = interval.replace(/s$/, "");
	                    if (addMap.hasOwnProperty(interval)) {
	                        return addMap[interval](date, amount);
	                    }
	                    return [amount, "UTC" + interval.charAt(0).toUpperCase() + interval.substring(1) + "s", false];
	                }


	                var differenceMap = {
	                    "quarter": function quarterDifference(date1, date2, utc) {
	                        var yearDiff = date2.getFullYear() - date1.getFullYear();
	                        var m1 = date1[utc ? "getUTCMonth" : "getMonth"]();
	                        var m2 = date2[utc ? "getUTCMonth" : "getMonth"]();
	                        // Figure out which quarter the months are in
	                        var q1 = floor(m1 / 3) + 1;
	                        var q2 = floor(m2 / 3) + 1;
	                        // Add quarters for any year difference between the dates
	                        q2 += (yearDiff * 4);
	                        return q2 - q1;
	                    },

	                    "weekday": function weekdayDifference(date1, date2, utc) {
	                        var days = differenceTransform("day", date1, date2, utc), weeks;
	                        var mod = days % 7;
	                        // Even number of weeks
	                        if (mod === 0) {
	                            days = differenceTransform("week", date1, date2, utc) * 5;
	                        } else {
	                            // Weeks plus spare change (< 7 days)
	                            var adj = 0, aDay = date1[utc ? "getUTCDay" : "getDay"](), bDay = date2[utc ? "getUTCDay" : "getDay"]();
	                            weeks = parseInt(days / 7, 10);
	                            // Mark the date advanced by the number of
	                            // round weeks (may be zero)
	                            var dtMark = new Date(+date1);
	                            dtMark.setDate(dtMark[utc ? "getUTCDate" : "getDate"]() + (weeks * 7));
	                            var dayMark = dtMark[utc ? "getUTCDay" : "getDay"]();

	                            // Spare change days -- 6 or less
	                            if (days > 0) {
	                                if (aDay === 6 || bDay === 6) {
	                                    adj = -1;
	                                } else if (aDay === 0) {
	                                    adj = 0;
	                                } else if (bDay === 0 || (dayMark + mod) > 5) {
	                                    adj = -2;
	                                }
	                            } else if (days < 0) {
	                                if (aDay === 6) {
	                                    adj = 0;
	                                } else if (aDay === 0 || bDay === 0) {
	                                    adj = 1;
	                                } else if (bDay === 6 || (dayMark + mod) < 0) {
	                                    adj = 2;
	                                }
	                            }
	                            days += adj;
	                            days -= (weeks * 2);
	                        }
	                        return days;
	                    },
	                    year: function (date1, date2) {
	                        return date2.getFullYear() - date1.getFullYear();
	                    },
	                    month: function (date1, date2, utc) {
	                        var m1 = date1[utc ? "getUTCMonth" : "getMonth"]();
	                        var m2 = date2[utc ? "getUTCMonth" : "getMonth"]();
	                        return (m2 - m1) + ((date2.getFullYear() - date1.getFullYear()) * 12);
	                    },
	                    week: function (date1, date2, utc) {
	                        return round(differenceTransform("day", date1, date2, utc) / 7);
	                    },
	                    day: function (date1, date2) {
	                        return 1.1574074074074074e-8 * (date2.getTime() - date1.getTime());
	                    },
	                    hour: function (date1, date2) {
	                        return 2.7777777777777776e-7 * (date2.getTime() - date1.getTime());
	                    },
	                    minute: function (date1, date2) {
	                        return 0.000016666666666666667 * (date2.getTime() - date1.getTime());
	                    },
	                    second: function (date1, date2) {
	                        return 0.001 * (date2.getTime() - date1.getTime());
	                    },
	                    millisecond: function (date1, date2) {
	                        return date2.getTime() - date1.getTime();
	                    }
	                };


	                function differenceTransform(interval, date1, date2, utc) {
	                    interval = interval.replace(/s$/, "");
	                    return round(differenceMap[interval](date1, date2, utc));
	                }


	                return {
	                    addTransform: addTransform,
	                    differenceTransform: differenceTransform
	                };
	            }()),
	            addTransform = transforms.addTransform,
	            differenceTransform = transforms.differenceTransform;


	        /**
	         * @ignore
	         * Based on DOJO Date Implementation
	         *
	         * Dojo is available under *either* the terms of the modified BSD license *or* the
	         * Academic Free License version 2.1. As a recipient of Dojo, you may choose which
	         * license to receive this code under (except as noted in per-module LICENSE
	         * files). Some modules may not be the copyright of the Dojo Foundation. These
	         * modules contain explicit declarations of copyright in both the LICENSE files in
	         * the directories in which they reside and in the code itself. No external
	         * contributions are allowed under licenses which are fundamentally incompatible
	         * with the AFL or BSD licenses that Dojo is distributed under.
	         *
	         */

	        var floor = Math.floor, round = Math.round, min = Math.min, pow = Math.pow, ceil = Math.ceil, abs = Math.abs;
	        var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
	        var monthAbbr = ["Jan.", "Feb.", "Mar.", "Apr.", "May.", "Jun.", "Jul.", "Aug.", "Sep.", "Oct.", "Nov.", "Dec."];
	        var dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
	        var dayAbbr = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
	        var eraNames = ["Before Christ", "Anno Domini"];
	        var eraAbbr = ["BC", "AD"];


	        function getDayOfYear(/*Date*/dateObject, utc) {
	            // summary: gets the day of the year as represented by dateObject
	            return date.difference(new Date(dateObject.getFullYear(), 0, 1, dateObject.getHours()), dateObject, null, utc) + 1; // Number
	        }

	        function getWeekOfYear(/*Date*/dateObject, /*Number*/firstDayOfWeek, utc) {
	            firstDayOfWeek = firstDayOfWeek || 0;
	            var fullYear = dateObject[utc ? "getUTCFullYear" : "getFullYear"]();
	            var firstDayOfYear = new Date(fullYear, 0, 1).getDay(),
	                adj = (firstDayOfYear - firstDayOfWeek + 7) % 7,
	                week = floor((getDayOfYear(dateObject) + adj - 1) / 7);

	            // if year starts on the specified day, start counting weeks at 1
	            if (firstDayOfYear === firstDayOfWeek) {
	                week++;
	            }

	            return week; // Number
	        }

	        function getTimezoneName(/*Date*/dateObject) {
	            var str = dateObject.toString();
	            var tz = '';
	            var pos = str.indexOf('(');
	            if (pos > -1) {
	                tz = str.substring(++pos, str.indexOf(')'));
	            }
	            return tz; // String
	        }


	        function buildDateEXP(pattern, tokens) {
	            return pattern.replace(/([a-z])\1*/ig,function (match) {
	                // Build a simple regexp.  Avoid captures, which would ruin the tokens list
	                var s,
	                    c = match.charAt(0),
	                    l = match.length,
	                    p2 = '0?',
	                    p3 = '0{0,2}';
	                if (c === 'y') {
	                    s = '\\d{2,4}';
	                } else if (c === "M") {
	                    s = (l > 2) ? '\\S+?' : '1[0-2]|' + p2 + '[1-9]';
	                } else if (c === "D") {
	                    s = '[12][0-9][0-9]|3[0-5][0-9]|36[0-6]|' + p3 + '[1-9][0-9]|' + p2 + '[1-9]';
	                } else if (c === "d") {
	                    s = '3[01]|[12]\\d|' + p2 + '[1-9]';
	                } else if (c === "w") {
	                    s = '[1-4][0-9]|5[0-3]|' + p2 + '[1-9]';
	                } else if (c === "E") {
	                    s = '\\S+';
	                } else if (c === "h") {
	                    s = '1[0-2]|' + p2 + '[1-9]';
	                } else if (c === "K") {
	                    s = '1[01]|' + p2 + '\\d';
	                } else if (c === "H") {
	                    s = '1\\d|2[0-3]|' + p2 + '\\d';
	                } else if (c === "k") {
	                    s = '1\\d|2[0-4]|' + p2 + '[1-9]';
	                } else if (c === "m" || c === "s") {
	                    s = '[0-5]\\d';
	                } else if (c === "S") {
	                    s = '\\d{' + l + '}';
	                } else if (c === "a") {
	                    var am = 'AM', pm = 'PM';
	                    s = am + '|' + pm;
	                    if (am !== am.toLowerCase()) {
	                        s += '|' + am.toLowerCase();
	                    }
	                    if (pm !== pm.toLowerCase()) {
	                        s += '|' + pm.toLowerCase();
	                    }
	                    s = s.replace(/\./g, "\\.");
	                } else if (c === 'v' || c === 'z' || c === 'Z' || c === 'G' || c === 'q' || c === 'Q') {
	                    s = ".*";
	                } else {
	                    s = c === " " ? "\\s*" : c + "*";
	                }
	                if (tokens) {
	                    tokens.push(match);
	                }

	                return "(" + s + ")"; // add capture
	            }).replace(/[\xa0 ]/g, "[\\s\\xa0]"); // normalize whitespace.  Need explicit handling of \xa0 for IE.
	        }


	        /**
	         * @namespace Utilities for Dates
	         */
	        var date = {

	            /**@lends date*/

	            /**
	             * Returns the number of days in the month of a date
	             *
	             * @example
	             *
	             *  dateExtender.getDaysInMonth(new Date(2006, 1, 1)); //28
	             *  dateExtender.getDaysInMonth(new Date(2004, 1, 1)); //29
	             *  dateExtender.getDaysInMonth(new Date(2006, 2, 1)); //31
	             *  dateExtender.getDaysInMonth(new Date(2006, 3, 1)); //30
	             *  dateExtender.getDaysInMonth(new Date(2006, 4, 1)); //31
	             *  dateExtender.getDaysInMonth(new Date(2006, 5, 1)); //30
	             *  dateExtender.getDaysInMonth(new Date(2006, 6, 1)); //31
	             * @param {Date} dateObject the date containing the month
	             * @return {Number} the number of days in the month
	             */
	            getDaysInMonth: function (/*Date*/dateObject) {
	                //	summary:
	                //		Returns the number of days in the month used by dateObject
	                var month = dateObject.getMonth();
	                var days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
	                if (month === 1 && date.isLeapYear(dateObject)) {
	                    return 29;
	                } // Number
	                return days[month]; // Number
	            },

	            /**
	             * Determines if a date is a leap year
	             *
	             * @example
	             *
	             *  dateExtender.isLeapYear(new Date(1600, 0, 1)); //true
	             *  dateExtender.isLeapYear(new Date(2004, 0, 1)); //true
	             *  dateExtender.isLeapYear(new Date(2000, 0, 1)); //true
	             *  dateExtender.isLeapYear(new Date(2006, 0, 1)); //false
	             *  dateExtender.isLeapYear(new Date(1900, 0, 1)); //false
	             *  dateExtender.isLeapYear(new Date(1800, 0, 1)); //false
	             *  dateExtender.isLeapYear(new Date(1700, 0, 1)); //false
	             *
	             * @param {Date} dateObject
	             * @returns {Boolean} true if it is a leap year false otherwise
	             */
	            isLeapYear: function (/*Date*/dateObject, utc) {
	                var year = dateObject[utc ? "getUTCFullYear" : "getFullYear"]();
	                return (year % 400 === 0) || (year % 4 === 0 && year % 100 !== 0);

	            },

	            /**
	             * Determines if a date is on a weekend
	             *
	             * @example
	             *
	             * var thursday = new Date(2006, 8, 21);
	             * var saturday = new Date(2006, 8, 23);
	             * var sunday = new Date(2006, 8, 24);
	             * var monday = new Date(2006, 8, 25);
	             * dateExtender.isWeekend(thursday)); //false
	             * dateExtender.isWeekend(saturday); //true
	             * dateExtender.isWeekend(sunday); //true
	             * dateExtender.isWeekend(monday)); //false
	             *
	             * @param {Date} dateObject the date to test
	             *
	             * @returns {Boolean} true if the date is a weekend
	             */
	            isWeekend: function (/*Date?*/dateObject, utc) {
	                // summary:
	                //	Determines if the date falls on a weekend, according to local custom.
	                var day = (dateObject || new Date())[utc ? "getUTCDay" : "getDay"]();
	                return day === 0 || day === 6;
	            },

	            /**
	             * Get the timezone of a date
	             *
	             * @example
	             *  //just setting the strLocal to simulate the toString() of a date
	             *  dt.str = 'Sun Sep 17 2006 22:25:51 GMT-0500 (CDT)';
	             *  //just setting the strLocal to simulate the locale
	             *  dt.strLocale = 'Sun 17 Sep 2006 10:25:51 PM CDT';
	             *  dateExtender.getTimezoneName(dt); //'CDT'
	             *  dt.str = 'Sun Sep 17 2006 22:57:18 GMT-0500 (CDT)';
	             *  dt.strLocale = 'Sun Sep 17 22:57:18 2006';
	             *  dateExtender.getTimezoneName(dt); //'CDT'
	             * @param dateObject the date to get the timezone from
	             *
	             * @returns {String} the timezone of the date
	             */
	            getTimezoneName: getTimezoneName,

	            /**
	             * Compares two dates
	             *
	             * @example
	             *
	             * var d1 = new Date();
	             * d1.setHours(0);
	             * dateExtender.compare(d1, d1); // 0
	             *
	             *  var d1 = new Date();
	             *  d1.setHours(0);
	             *  var d2 = new Date();
	             *  d2.setFullYear(2005);
	             *  d2.setHours(12);
	             *  dateExtender.compare(d1, d2, "date"); // 1
	             *  dateExtender.compare(d1, d2, "datetime"); // 1
	             *
	             *  var d1 = new Date();
	             *  d1.setHours(0);
	             *  var d2 = new Date();
	             *  d2.setFullYear(2005);
	             *  d2.setHours(12);
	             *  dateExtender.compare(d2, d1, "date"); // -1
	             *  dateExtender.compare(d1, d2, "time"); //-1
	             *
	             * @param {Date|String} date1 the date to comapare
	             * @param {Date|String} [date2=new Date()] the date to compare date1 againse
	             * @param {"date"|"time"|"datetime"} portion compares the portion specified
	             *
	             * @returns -1 if date1 is < date2 0 if date1 === date2  1 if date1 > date2
	             */
	            compare: function (/*Date*/date1, /*Date*/date2, /*String*/portion) {
	                date1 = new Date(+date1);
	                date2 = new Date(+(date2 || new Date()));

	                if (portion === "date") {
	                    // Ignore times and compare dates.
	                    date1.setHours(0, 0, 0, 0);
	                    date2.setHours(0, 0, 0, 0);
	                } else if (portion === "time") {
	                    // Ignore dates and compare times.
	                    date1.setFullYear(0, 0, 0);
	                    date2.setFullYear(0, 0, 0);
	                }
	                return date1 > date2 ? 1 : date1 < date2 ? -1 : 0;
	            },


	            /**
	             * Adds a specified interval and amount to a date
	             *
	             * @example
	             *  var dtA = new Date(2005, 11, 27);
	             *  dateExtender.add(dtA, "year", 1); //new Date(2006, 11, 27);
	             *  dateExtender.add(dtA, "years", 1); //new Date(2006, 11, 27);
	             *
	             *  dtA = new Date(2000, 0, 1);
	             *  dateExtender.add(dtA, "quarter", 1); //new Date(2000, 3, 1);
	             *  dateExtender.add(dtA, "quarters", 1); //new Date(2000, 3, 1);
	             *
	             *  dtA = new Date(2000, 0, 1);
	             *  dateExtender.add(dtA, "month", 1); //new Date(2000, 1, 1);
	             *  dateExtender.add(dtA, "months", 1); //new Date(2000, 1, 1);
	             *
	             *  dtA = new Date(2000, 0, 31);
	             *  dateExtender.add(dtA, "month", 1); //new Date(2000, 1, 29);
	             *  dateExtender.add(dtA, "months", 1); //new Date(2000, 1, 29);
	             *
	             *  dtA = new Date(2000, 0, 1);
	             *  dateExtender.add(dtA, "week", 1); //new Date(2000, 0, 8);
	             *  dateExtender.add(dtA, "weeks", 1); //new Date(2000, 0, 8);
	             *
	             *  dtA = new Date(2000, 0, 1);
	             *  dateExtender.add(dtA, "day", 1); //new Date(2000, 0, 2);
	             *
	             *  dtA = new Date(2000, 0, 1);
	             *  dateExtender.add(dtA, "weekday", 1); //new Date(2000, 0, 3);
	             *
	             *  dtA = new Date(2000, 0, 1, 11);
	             *  dateExtender.add(dtA, "hour", 1); //new Date(2000, 0, 1, 12);
	             *
	             *  dtA = new Date(2000, 11, 31, 23, 59);
	             *  dateExtender.add(dtA, "minute", 1); //new Date(2001, 0, 1, 0, 0);
	             *
	             *  dtA = new Date(2000, 11, 31, 23, 59, 59);
	             *  dateExtender.add(dtA, "second", 1); //new Date(2001, 0, 1, 0, 0, 0);
	             *
	             *  dtA = new Date(2000, 11, 31, 23, 59, 59, 999);
	             *  dateExtender.add(dtA, "millisecond", 1); //new Date(2001, 0, 1, 0, 0, 0, 0);
	             *
	             * @param {Date} date
	             * @param {String} interval the interval to add
	             *  <ul>
	             *      <li>day | days</li>
	             *      <li>weekday | weekdays</li>
	             *      <li>year | years</li>
	             *      <li>week | weeks</li>
	             *      <li>quarter | quarters</li>
	             *      <li>months | months</li>
	             *      <li>hour | hours</li>
	             *      <li>minute | minutes</li>
	             *      <li>second | seconds</li>
	             *      <li>millisecond | milliseconds</li>
	             *  </ul>
	             * @param {Number} [amount=0] the amount to add
	             */
	            add: function (/*Date*/date, /*String*/interval, /*int*/amount) {
	                var res = addTransform(interval, date, amount || 0);
	                amount = res[0];
	                var property = res[1];
	                var sum = new Date(+date);
	                var fixOvershoot = res[2];
	                if (property) {
	                    sum["set" + property](sum["get" + property]() + amount);
	                }

	                if (fixOvershoot && (sum.getDate() < date.getDate())) {
	                    sum.setDate(0);
	                }

	                return sum; // Date
	            },

	            /**
	             * Finds the difference between two dates based on the specified interval
	             *
	             * @example
	             *
	             * var dtA, dtB;
	             *
	             * dtA = new Date(2005, 11, 27);
	             * dtB = new Date(2006, 11, 27);
	             * dateExtender.difference(dtA, dtB, "year"); //1
	             *
	             * dtA = new Date(2000, 1, 29);
	             * dtB = new Date(2001, 2, 1);
	             * dateExtender.difference(dtA, dtB, "quarter"); //4
	             * dateExtender.difference(dtA, dtB, "month"); //13
	             *
	             * dtA = new Date(2000, 1, 1);
	             * dtB = new Date(2000, 1, 8);
	             * dateExtender.difference(dtA, dtB, "week"); //1
	             *
	             * dtA = new Date(2000, 1, 29);
	             * dtB = new Date(2000, 2, 1);
	             * dateExtender.difference(dtA, dtB, "day"); //1
	             *
	             * dtA = new Date(2006, 7, 3);
	             * dtB = new Date(2006, 7, 11);
	             * dateExtender.difference(dtA, dtB, "weekday"); //6
	             *
	             * dtA = new Date(2000, 11, 31, 23);
	             * dtB = new Date(2001, 0, 1, 0);
	             * dateExtender.difference(dtA, dtB, "hour"); //1
	             *
	             * dtA = new Date(2000, 11, 31, 23, 59);
	             * dtB = new Date(2001, 0, 1, 0, 0);
	             * dateExtender.difference(dtA, dtB, "minute"); //1
	             *
	             * dtA = new Date(2000, 11, 31, 23, 59, 59);
	             * dtB = new Date(2001, 0, 1, 0, 0, 0);
	             * dateExtender.difference(dtA, dtB, "second"); //1
	             *
	             * dtA = new Date(2000, 11, 31, 23, 59, 59, 999);
	             * dtB = new Date(2001, 0, 1, 0, 0, 0, 0);
	             * dateExtender.difference(dtA, dtB, "millisecond"); //1
	             *
	             *
	             * @param {Date} date1
	             * @param {Date} [date2 = new Date()]
	             * @param {String} [interval = "day"] the intercal to find the difference of.
	             *   <ul>
	             *      <li>day | days</li>
	             *      <li>weekday | weekdays</li>
	             *      <li>year | years</li>
	             *      <li>week | weeks</li>
	             *      <li>quarter | quarters</li>
	             *      <li>months | months</li>
	             *      <li>hour | hours</li>
	             *      <li>minute | minutes</li>
	             *      <li>second | seconds</li>
	             *      <li>millisecond | milliseconds</li>
	             *  </ul>
	             */
	            difference: function (/*Date*/date1, /*Date?*/date2, /*String*/interval, utc) {
	                date2 = date2 || new Date();
	                interval = interval || "day";
	                return differenceTransform(interval, date1, date2, utc);
	            },

	            /**
	             * Formats a date to the specidifed format string
	             *
	             * @example
	             *
	             * var date = new Date(2006, 7, 11, 0, 55, 12, 345);
	             * dateExtender.format(date, "EEEE, MMMM dd, yyyy"); //"Friday, August 11, 2006"
	             * dateExtender.format(date, "M/dd/yy"); //"8/11/06"
	             * dateExtender.format(date, "E"); //"6"
	             * dateExtender.format(date, "h:m a"); //"12:55 AM"
	             * dateExtender.format(date, 'h:m:s'); //"12:55:12"
	             * dateExtender.format(date, 'h:m:s.SS'); //"12:55:12.35"
	             * dateExtender.format(date, 'k:m:s.SS'); //"24:55:12.35"
	             * dateExtender.format(date, 'H:m:s.SS'); //"0:55:12.35"
	             * dateExtender.format(date, "ddMMyyyy"); //"11082006"
	             *
	             * @param date the date to format
	             * @param {String} format the format of the date composed of the following options
	             * <ul>
	             *                  <li> G    Era designator    Text    AD</li>
	             *                  <li> y    Year    Year    1996; 96</li>
	             *                  <li> M    Month in year    Month    July; Jul; 07</li>
	             *                  <li> w    Week in year    Number    27</li>
	             *                  <li> W    Week in month    Number    2</li>
	             *                  <li> D    Day in year    Number    189</li>
	             *                  <li> d    Day in month    Number    10</li>
	             *                  <li> E    Day in week    Text    Tuesday; Tue</li>
	             *                  <li> a    Am/pm marker    Text    PM</li>
	             *                  <li> H    Hour in day (0-23)    Number    0</li>
	             *                  <li> k    Hour in day (1-24)    Number    24</li>
	             *                  <li> K    Hour in am/pm (0-11)    Number    0</li>
	             *                  <li> h    Hour in am/pm (1-12)    Number    12</li>
	             *                  <li> m    Minute in hour    Number    30</li>
	             *                  <li> s    Second in minute    Number    55</li>
	             *                  <li> S    Millisecond    Number    978</li>
	             *                  <li> z    Time zone    General time zone    Pacific Standard Time; PST; GMT-08:00</li>
	             *                  <li> Z    Time zone    RFC 822 time zone    -0800 </li>
	             * </ul>
	             */
	            format: function (date, format, utc) {
	                utc = utc || false;
	                var fullYear, month, day, d, hour, minute, second, millisecond;
	                if (utc) {
	                    fullYear = date.getUTCFullYear();
	                    month = date.getUTCMonth();
	                    day = date.getUTCDay();
	                    d = date.getUTCDate();
	                    hour = date.getUTCHours();
	                    minute = date.getUTCMinutes();
	                    second = date.getUTCSeconds();
	                    millisecond = date.getUTCMilliseconds();
	                } else {
	                    fullYear = date.getFullYear();
	                    month = date.getMonth();
	                    d = date.getDate();
	                    day = date.getDay();
	                    hour = date.getHours();
	                    minute = date.getMinutes();
	                    second = date.getSeconds();
	                    millisecond = date.getMilliseconds();
	                }
	                return format.replace(/([A-Za-z])\1*/g, function (match) {
	                    var s, pad,
	                        c = match.charAt(0),
	                        l = match.length;
	                    if (c === 'd') {
	                        s = "" + d;
	                        pad = true;
	                    } else if (c === "H" && !s) {
	                        s = "" + hour;
	                        pad = true;
	                    } else if (c === 'm' && !s) {
	                        s = "" + minute;
	                        pad = true;
	                    } else if (c === 's') {
	                        if (!s) {
	                            s = "" + second;
	                        }
	                        pad = true;
	                    } else if (c === "G") {
	                        s = ((l < 4) ? eraAbbr : eraNames)[fullYear < 0 ? 0 : 1];
	                    } else if (c === "y") {
	                        s = fullYear;
	                        if (l > 1) {
	                            if (l === 2) {
	                                s = _truncate("" + s, 2, true);
	                            } else {
	                                pad = true;
	                            }
	                        }
	                    } else if (c.toUpperCase() === "Q") {
	                        s = ceil((month + 1) / 3);
	                        pad = true;
	                    } else if (c === "M") {
	                        if (l < 3) {
	                            s = month + 1;
	                            pad = true;
	                        } else {
	                            s = (l === 3 ? monthAbbr : monthNames)[month];
	                        }
	                    } else if (c === "w") {
	                        s = getWeekOfYear(date, 0, utc);
	                        pad = true;
	                    } else if (c === "D") {
	                        s = getDayOfYear(date, utc);
	                        pad = true;
	                    } else if (c === "E") {
	                        if (l < 3) {
	                            s = day + 1;
	                            pad = true;
	                        } else {
	                            s = (l === -3 ? dayAbbr : dayNames)[day];
	                        }
	                    } else if (c === 'a') {
	                        s = (hour < 12) ? 'AM' : 'PM';
	                    } else if (c === "h") {
	                        s = (hour % 12) || 12;
	                        pad = true;
	                    } else if (c === "K") {
	                        s = (hour % 12);
	                        pad = true;
	                    } else if (c === "k") {
	                        s = hour || 24;
	                        pad = true;
	                    } else if (c === "S") {
	                        s = round(millisecond * pow(10, l - 3));
	                        pad = true;
	                    } else if (c === "z" || c === "v" || c === "Z") {
	                        s = getTimezoneName(date);
	                        if ((c === "z" || c === "v") && !s) {
	                            l = 4;
	                        }
	                        if (!s || c === "Z") {
	                            var offset = date.getTimezoneOffset();
	                            var tz = [
	                                (offset >= 0 ? "-" : "+"),
	                                _pad(floor(abs(offset) / 60), 2, "0"),
	                                _pad(abs(offset) % 60, 2, "0")
	                            ];
	                            if (l === 4) {
	                                tz.splice(0, 0, "GMT");
	                                tz.splice(3, 0, ":");
	                            }
	                            s = tz.join("");
	                        }
	                    } else {
	                        s = match;
	                    }
	                    if (pad) {
	                        s = _pad(s, l, '0');
	                    }
	                    return s;
	                });
	            }

	        };

	        var numberDate = {};

	        function addInterval(interval) {
	            numberDate[interval + "sFromNow"] = function (val) {
	                return date.add(new Date(), interval, val);
	            };
	            numberDate[interval + "sAgo"] = function (val) {
	                return date.add(new Date(), interval, -val);
	            };
	        }

	        var intervals = ["year", "month", "day", "hour", "minute", "second"];
	        for (var i = 0, l = intervals.length; i < l; i++) {
	            addInterval(intervals[i]);
	        }

	        var stringDate = {

	            parseDate: function (dateStr, format) {
	                if (!format) {
	                    throw new Error('format required when calling dateExtender.parse');
	                }
	                var tokens = [], regexp = buildDateEXP(format, tokens),
	                    re = new RegExp("^" + regexp + "$", "i"),
	                    match = re.exec(dateStr);
	                if (!match) {
	                    return null;
	                } // null
	                var result = [1970, 0, 1, 0, 0, 0, 0], // will get converted to a Date at the end
	                    amPm = "",
	                    valid = every(match, function (v, i) {
	                        if (i) {
	                            var token = tokens[i - 1];
	                            var l = token.length, type = token.charAt(0);
	                            if (type === 'y') {
	                                if (v < 100) {
	                                    v = parseInt(v, 10);
	                                    //choose century to apply, according to a sliding window
	                                    //of 80 years before and 20 years after present year
	                                    var year = '' + new Date().getFullYear(),
	                                        century = year.substring(0, 2) * 100,
	                                        cutoff = min(year.substring(2, 4) + 20, 99);
	                                    result[0] = (v < cutoff) ? century + v : century - 100 + v;
	                                } else {
	                                    result[0] = v;
	                                }
	                            } else if (type === "M") {
	                                if (l > 2) {
	                                    var months = monthNames, j, k;
	                                    if (l === 3) {
	                                        months = monthAbbr;
	                                    }
	                                    //Tolerate abbreviating period in month part
	                                    //Case-insensitive comparison
	                                    v = v.replace(".", "").toLowerCase();
	                                    var contains = false;
	                                    for (j = 0, k = months.length; j < k && !contains; j++) {
	                                        var s = months[j].replace(".", "").toLocaleLowerCase();
	                                        if (s === v) {
	                                            v = j;
	                                            contains = true;
	                                        }
	                                    }
	                                    if (!contains) {
	                                        return false;
	                                    }
	                                } else {
	                                    v--;
	                                }
	                                result[1] = v;
	                            } else if (type === "E" || type === "e") {
	                                var days = dayNames;
	                                if (l === 3) {
	                                    days = dayAbbr;
	                                }
	                                //Case-insensitive comparison
	                                v = v.toLowerCase();
	                                days = array.map(days, function (d) {
	                                    return d.toLowerCase();
	                                });
	                                var d = array.indexOf(days, v);
	                                if (d === -1) {
	                                    v = parseInt(v, 10);
	                                    if (isNaN(v) || v > days.length) {
	                                        return false;
	                                    }
	                                } else {
	                                    v = d;
	                                }
	                            } else if (type === 'D' || type === "d") {
	                                if (type === "D") {
	                                    result[1] = 0;
	                                }
	                                result[2] = v;
	                            } else if (type === "a") {
	                                var am = "am";
	                                var pm = "pm";
	                                var period = /\./g;
	                                v = v.replace(period, '').toLowerCase();
	                                // we might not have seen the hours field yet, so store the state and apply hour change later
	                                amPm = (v === pm) ? 'p' : (v === am) ? 'a' : '';
	                            } else if (type === "k" || type === "h" || type === "H" || type === "K") {
	                                if (type === "k" && (+v) === 24) {
	                                    v = 0;
	                                }
	                                result[3] = v;
	                            } else if (type === "m") {
	                                result[4] = v;
	                            } else if (type === "s") {
	                                result[5] = v;
	                            } else if (type === "S") {
	                                result[6] = v;
	                            }
	                        }
	                        return true;
	                    });
	                if (valid) {
	                    var hours = +result[3];
	                    //account for am/pm
	                    if (amPm === 'p' && hours < 12) {
	                        result[3] = hours + 12; //e.g., 3pm -> 15
	                    } else if (amPm === 'a' && hours === 12) {
	                        result[3] = 0; //12am -> 0
	                    }
	                    var dateObject = new Date(result[0], result[1], result[2], result[3], result[4], result[5], result[6]); // Date
	                    var dateToken = (array.indexOf(tokens, 'd') !== -1),
	                        monthToken = (array.indexOf(tokens, 'M') !== -1),
	                        month = result[1],
	                        day = result[2],
	                        dateMonth = dateObject.getMonth(),
	                        dateDay = dateObject.getDate();
	                    if ((monthToken && dateMonth > month) || (dateToken && dateDay > day)) {
	                        return null;
	                    }
	                    return dateObject; // Date
	                } else {
	                    return null;
	                }
	            }
	        };


	        var ret = extended.define(is.isDate, date).define(is.isString, stringDate).define(is.isNumber, numberDate);
	        for (i in date) {
	            if (date.hasOwnProperty(i)) {
	                ret[i] = date[i];
	            }
	        }

	        for (i in stringDate) {
	            if (stringDate.hasOwnProperty(i)) {
	                ret[i] = stringDate[i];
	            }
	        }
	        for (i in numberDate) {
	            if (numberDate.hasOwnProperty(i)) {
	                ret[i] = numberDate[i];
	            }
	        }
	        return ret;
	    }

	    if (true) {
	        if ("undefined" !== typeof module && module.exports) {
	            module.exports = defineDate(__webpack_require__(9), __webpack_require__(8), __webpack_require__(15));

	        }
	    } else if ("function" === typeof define && define.amd) {
	        define(["extended", "is-extended", "array-extended"], function (extended, is, arr) {
	            return defineDate(extended, is, arr);
	        });
	    } else {
	        this.dateExtended = defineDate(this.extended, this.isExtended, this.arrayExtended);
	    }

	}).call(this);








/***/ },
/* 19 */
/***/ function(module, exports) {

	module.exports = require("os");

/***/ },
/* 20 */
/***/ function(module, exports) {

	module.exports = require("stream");

/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	var extended = __webpack_require__(7),
	    isUndefined = extended.isUndefined,
	    spreadArgs = extended.spreadArgs,
	    util = __webpack_require__(22),
	    out = process.stdout,
	    stream = __webpack_require__(20),
	    EMPTY = /^\s*(?:''|"")?\s*(?:,\s*(?:''|"")?\s*)*$/,
	    DEFAULT_DELIMITER = ",",
	    createParser = __webpack_require__(23),
	    fs = __webpack_require__(1),
	    StringDecoder = __webpack_require__(24).StringDecoder,
	    hasIsPaused = !!stream.Transform.prototype.isPaused;

	function ParserStream(options) {
	    options = options || {};
	    options.objectMode = extended.has(options, "objectMode") ? options.objectMode : true;
	    stream.Transform.call(this, options);
	    this.lines = "";
	    this.decoder = new StringDecoder();
	    this._parsedHeaders = false;
	    this._rowCount = -1;
	    this._emitData = false;
	    var delimiter;
	    if (extended.has(options, "delimiter")) {
	        delimiter = options.delimiter;
	        if (delimiter.length > 1) {
	            throw new Error("delimiter option must be one character long");
	        }
	        delimiter = extended.escape(delimiter);
	    } else {
	        delimiter = DEFAULT_DELIMITER;
	    }
	    options.delimiter = delimiter;
	    this.parser = createParser(options);
	    this._headers = options.headers;
	    this._ignoreEmpty = options.ignoreEmpty;
	    this._discardUnmappedColumns = options.discardUnmappedColumns;
	    this._strictColumnHandling = options.strictColumnHandling;
	    this.__objectMode = options.objectMode;
	    this.__buffered = [];
	    return this;
	}

	util.inherits(ParserStream, stream.Transform);

	var origOn = ParserStream.prototype.on,
	    origEmit = ParserStream.prototype.emit;


	extended(ParserStream).extend({

	    __pausedDone: null,

	    __endEmitted: false,

	    __emittedData: false,

	    __handleLine: function __parseLineData(line, index, ignore, next) {
	        var ignoreEmpty = this._ignoreEmpty, self = this;
	        if (extended.isBoolean(ignoreEmpty) && ignoreEmpty && (!line || EMPTY.test(line.join("")))) {
	            return next(null, null);
	        }
	        if (!ignore) {
	            this.__transform(line, function (err, line) {
	                if (err) {
	                    next(err);
	                } else {
	                    self.__validate(line, function (err, isValid, reason) {
	                        if (err) {
	                            next(err);
	                        } else if (isValid) {
	                            next(null, line);
	                        } else {
	                            self.emit("data-invalid", line, index, reason);
	                            next(null, null);
	                        }
	                    });
	                }
	            });
	        } else {
	            return next(null, line);
	        }
	    },

	    __processRows: function (rows, data, cb) {
	        var self = this, count;
	        extended.asyncEach(rows, function (row, cb) {
	            if (row) {
	                self.__handleLine(row, (count = ++self._rowCount), false, function (err, dataRow) {
	                    if (err) {
	                        cb(err);
	                    } else {
	                        if (dataRow) {
	                            if (!self.isStreamPaused()) {
	                                self.__emitRecord(dataRow, count);
	                            } else {
	                                self.__buffered.push([dataRow, count]);
	                            }
	                        } else {
	                            count = --self._rowCount;
	                        }
	                        cb();
	                    }
	                });
	            }
	        }, function (err) {
	            if (err) {
	                cb(err);
	            } else {
	                cb(null, data.line);
	            }
	        });
	    },

	    __processHeaders: function (rows, cb) {
	        var headers = this._headers,
	            discardUnmappedColumns = this._discardUnmappedColumns,
	            strictColumnHandling = this._strictColumnHandling,
	            self = this;

	        function headerHandler(err, headers) {
	            if (err) {
	                cb(err);
	            } else if (extended.isArray(headers)) {
	                var headersLength = headers.length,
	                    orig = self.__transform;
	                self.__transform = function (data, cb) {
	                    var ret = {}, i = -1, val;
	                    if (data.length > headersLength) {
	                        if (discardUnmappedColumns) {
	                            data.splice(headersLength);
	                        } else if (strictColumnHandling) {
	                            self.emit("data-invalid", data);
	                            return orig(null, cb);
	                        } else {
	                            self.emit("error", new Error("Unexpected Error: column header mismatch expected: " + headersLength + " columns got: " + data.length));
	                            return orig(null, cb);
	                        }
	                    } else if (strictColumnHandling && (data.length < headersLength)) {
	                        self.emit("data-invalid", data);
	                        return orig(null, cb);
	                    }
	                    while (++i < headersLength) {
	                        if (isUndefined(headers[i])) {
	                          continue;
	                        }
	                        val = data[i];
	                        ret[headers[i]] = isUndefined(val) ? '' : val;
	                    }

	                    return orig(ret, cb);
	                };
	            }
	            self._parsedHeaders = true;
	            cb(null);
	        }

	        if (extended.isBoolean(headers) && headers) {
	            this.__handleLine(rows.shift(), 0, true, headerHandler);
	        } else {
	            headerHandler(null, headers);
	        }

	    },

	    _parse: function _parseLine(data, hasMoreData, cb) {
	        var rows, self = this;
	        try {
	            data = this.parser(data, hasMoreData);
	            rows = data.rows;
	            if (rows.length) {
	                if (!this._parsedHeaders) {
	                    this.__processHeaders(rows, function (err) {
	                        if (err) {
	                            cb(err);
	                        } else {
	                            self.__processRows(rows, data, cb);
	                        }
	                    });
	                } else {
	                    this.__processRows(rows, data, cb);
	                }
	            } else {
	                cb(null, data.line);
	            }
	        } catch (e) {
	            cb(e);
	        }
	    },

	    __emitRecord: function (dataRow, count) {
	        if (this._emitData) {
	            this.push(this.__objectMode ? dataRow : JSON.stringify(dataRow));
	        }
	    },

	    _transform: function (data, encoding, done) {
	        var lines = this.lines,
	            lineData = (lines + this.decoder.write(data)),
	            self = this;
	        if (lineData.length > 1) {
	            this._parse(lineData, true, function (err, lineData) {
	                if (err) {
	                    done(err);
	                } else {
	                    self.lines = lineData;
	                    if (!self.isStreamPaused()) {
	                        done();
	                    } else {
	                        self.__pausedDone = done;
	                    }
	                }
	            });
	        } else {
	            this.lines = lineData;
	            if (!this.isStreamPaused()) {
	                done();
	            } else {
	                this.__pausedDone = done;
	            }
	        }

	    },

	    __doFlush: function (callback) {
	        try {
	            callback();
	        } catch (e) {
	            callback(e);
	        }
	    },

	    _flush: function (callback) {
	        var self = this;
	        if (this.lines) {
	            this._parse(this.lines, false, function (err) {
	                if (err) {
	                    callback(err);
	                } else if (!self.isStreamPaused()) {
	                    self.__doFlush(callback);
	                } else {
	                    self.__pausedDone = function () {
	                        self.__doFlush(callback);
	                    };
	                }
	            });
	        } else {
	            if (!this.isStreamPaused()) {
	                this.__doFlush(callback);
	            } else {
	                this.__pausedDone = function () {
	                    self.__doFlush(callback);
	                };
	            }
	        }
	    },

	    __validate: function (data, next) {
	        return next(null, true);
	    },

	    __transform: function (data, next) {
	        return next(null, data);
	    },

	    __flushPausedBuffer: function () {
	        var buffered = this.__buffered, l = buffered.length;
	        if (l) {
	            var entry;
	            while (buffered.length) {
	                entry = buffered.shift();
	                this.__emitRecord(entry[0], entry[1]);
	                //handle case where paused is called while emitting data
	                if (this.isStreamPaused()) {
	                    return;
	                }
	            }
	            buffered.length = 0;
	        }
	        if (this.__pausedDone) {
	            var done = this.__pausedDone;
	            this.__pausedDone = null;
	            done();
	        }
	    },

	    isStreamPaused: function () {
	        return this.__paused;
	    },

	    emit: function (event) {
	        if (event === "end") {
	            if (!this.__endEmitted) {
	                this.__endEmitted = true;
	                spreadArgs(origEmit, ["end", ++this._rowCount], this);
	            }
	        } else {
	            if (!hasIsPaused) {
	                if (event === "pause") {
	                    this.__paused = true;
	                } else if (event === "resume") {
	                    this.__paused = false;
	                    this.__flushPausedBuffer();
	                }
	            }
	            spreadArgs(origEmit, arguments, this);
	        }
	    },

	    on: function (evt) {
	        if (evt === "data" || evt === "readable") {
	            this._emitData = true;
	        }
	        spreadArgs(origOn, arguments, this);
	        return this;
	    },

	    validate: function (cb) {
	        if (!extended.isFunction(cb)) {
	            this.emit("error", new TypeError("fast-csv.Parser#validate requires a function"));
	        }
	        if (cb.length === 2) {
	            this.__validate = cb;
	        } else {
	            this.__validate = function (data, next) {
	                return next(null, cb(data));
	            };
	        }
	        return this;
	    },
	    transform: function (cb) {
	        if (!extended.isFunction(cb)) {
	            this.emit("error", new TypeError("fast-csv.Parser#transform requires a function"));
	        }
	        if (cb.length === 2) {
	            this.__transform = cb;
	        } else {
	            this.__transform = function (data, next) {
	                return next(null, cb(data));
	            };
	        }
	        return this;
	    }

	});

	module.exports = ParserStream;


/***/ },
/* 22 */
/***/ function(module, exports) {

	module.exports = require("util");

/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	var extended = __webpack_require__(7),
	    has = extended.has,
	    isUndefinedOrNull = extended.isUndefinedOrNull,
	    trim = extended.trim,
	    trimLeft = extended.trimLeft,
	    trimRight = extended.trimRight;

	function createParser(options) {
	    options = options || {};
	    var delimiter = options.delimiter || ",",
	        doLtrim = options.ltrim || false,
	        doRtrim = options.rtrim || false,
	        doTrim = options.trim || false,
	        ESCAPE = has(options, "quote") ? options.quote : '"',
	        VALUE_REGEXP = new RegExp("([^" + delimiter + "'\"\\s\\\\]*(?:\\s+[^" + delimiter + "'\"\\s\\\\]+)*)"),
	        SEARCH_REGEXP = new RegExp("(?:\\n|\\r|" + delimiter + ")"),
	        ESCAPE_CHAR = options.escape || '"',
	        NEXT_TOKEN_REGEXP = new RegExp("([^\\s]|\\r\\n|\\n|\\r|" + delimiter + ")"),
	        ROW_DELIMITER = /(\r\n|\n|\r)/,
	        COMMENT, hasComments;
	    if (has(options, "comment")) {
	        COMMENT = options.comment;
	        hasComments = true;
	    }

	    function formatItem(item) {
	        if (doTrim) {
	            item = trim(item);
	        } else if (doLtrim) {
	            item = trimLeft(item);
	        } else if (doRtrim) {
	            item = trimRight(item);
	        }
	        return item;
	    }

	    function parseEscapedItem(str, items, cursor, hasMoreData) {
	        var depth = 0, ret = [];
	        var startPushing = false, token, i = 0, l = str.length, escapeIsEscape = ESCAPE_CHAR === ESCAPE;
	        if (l) {
	            while (cursor < l && (token = str.charAt(cursor))) {
	                if (token === ESCAPE) {
	                    if (!startPushing) {
	                        depth++;
	                        startPushing = true;
	                    } else if (escapeIsEscape && str.charAt(cursor + 1) === ESCAPE) {
	                        cursor++;
	                        ret[i++] = token;
	                    } else if (!escapeIsEscape && ret[i - 1] === ESCAPE_CHAR) {
	                        ret[i - 1] = token;
	                    } else {
	                        if (!(--depth)) {
	                            ++cursor;
	                            break;
	                        }
	                    }
	                } else {
	                    ret[i++] = token;
	                }
	                ++cursor;
	            }
	        }
	        ret = ret.join("");
	        var next = getNextToken(str, cursor),
	            nextToken = next.token;
	        if (nextToken && nextToken.search(delimiter) === 0) {
	            if (hasMoreData && (next.cursor + 1) >= l) {
	                cursor = null;
	            } else {
	                cursor++;
	            }
	        } else if (depth && !nextToken) {
	            if (hasMoreData) {
	                cursor = null;
	            } else {
	                throw new Error("Parse Error: expected: '" + ESCAPE + "' got: '" + nextToken + "'. at '" + str.substr(cursor).replace(/[r\n]/g, "\\n" + "'"));
	            }
	        } else if ((!depth && nextToken && nextToken.search(SEARCH_REGEXP) === -1)) {
	            throw new Error("Parse Error: expected: '" + ESCAPE + "' got: '" + nextToken + "'. at '" + str.substr(cursor, 10).replace(/[\r\n]/g, "\\n" + "'"));
	        } else if (hasMoreData && (!nextToken || !ROW_DELIMITER.test(nextToken))) {
	            cursor = null;
	        }
	        if (cursor !== null) {
	            items.push(formatItem(ret));
	        }
	        return cursor;
	    }

	    function parseCommentLine(line, cursor, hasMoreData) {
	        var nextIndex = line.substr(cursor).search(ROW_DELIMITER);
	        if (nextIndex === -1) {
	            if (hasMoreData) {
	                nextIndex = null;
	            } else {
	                nextIndex = line.length + 1;
	            }
	        } else {
	            nextIndex = (cursor + nextIndex) + 1; //go past the next line break
	        }
	        return nextIndex;
	    }

	    function parseItem(line, items, cursor, hasMoreData) {
	        var searchStr = line.substr(cursor),
	            nextIndex = searchStr.search(SEARCH_REGEXP);
	        if (nextIndex === -1) {
	            if (!VALUE_REGEXP.test(searchStr)) {
	                throw new Error("Parse Error: delimiter '" + delimiter + "' not found at '" + searchStr.replace(/\n/g, "\\n" + "'"));
	            } else {
	                nextIndex = searchStr.length;
	            }
	        }
	        var nextChar = searchStr.charAt(nextIndex);
	        if (nextChar.search(delimiter) !== -1) {
	            if (hasMoreData && (cursor + (nextIndex + 1) >= line.length)) {
	                cursor = null;
	            } else {
	                items.push(formatItem(searchStr.substr(0, nextIndex)));
	                cursor += nextIndex + 1;
	                // if ends with a comma, append an empty element, unless strict column handling
	                if (!options.strictColumnHandling && (ROW_DELIMITER.test(line.charAt(cursor)) || cursor >= line.length)) { 
	                    items.push('');
	                }
	            }
	        } else if (ROW_DELIMITER.test(nextChar)) {
	            items.push(formatItem(searchStr.substr(0, nextIndex)));
	            cursor += nextIndex;
	        } else if (!hasMoreData) {
	            items.push(formatItem(searchStr.substr(0, nextIndex)));
	            cursor += nextIndex + 1;
	        } else {
	            cursor = null;
	        }

	        return cursor;
	    }

	    function getNextToken(line, cursor) {
	        var token, nextIndex, subStr = line.substr(cursor);
	        if ((nextIndex = subStr.search(NEXT_TOKEN_REGEXP)) !== -1) {
	            token = line[cursor += nextIndex];
	            cursor += subStr.match(NEXT_TOKEN_REGEXP)[1].length - 1;
	        }
	        return {token: token, cursor: cursor};
	    }

	    return function parseLine(line, hasMoreData) {
	        var i = 0, l = line.length, rows = [], items = [], token, nextToken, cursor, lastLineI = 0;
	        while (i < l) {
	            nextToken = getNextToken(line, i);
	            token = nextToken.token;
	            if (isUndefinedOrNull(token)) {
	                i = lastLineI;
	                cursor = null;
	                break;
	            } else if (ROW_DELIMITER.test(token)) {
	                i = nextToken.cursor + 1;
	                if (i < l) {
	                    rows.push(items);
	                    items = [];
	                    lastLineI = i;
	                } else {
	                    break;
	                }
	            } else if (hasComments && token === COMMENT) {
	                cursor = parseCommentLine(line, i, hasMoreData);
	                if (cursor === null) {
	                    i = lastLineI;
	                    break;
	                } else if (cursor < l) {
	                    lastLineI = i = cursor;
	                } else {
	                    i = cursor;
	                    cursor = null;
	                    break;
	                }
	            } else {
	                if (token === ESCAPE) {
	                    cursor = parseEscapedItem(line, items, nextToken.cursor, hasMoreData);
	                } else {
	                    cursor = parseItem(line, items, i, hasMoreData);
	                }
	                if (cursor === null) {
	                    i = lastLineI;
	                    break;
	                } else {
	                    i = cursor;
	                }
	            }

	        }
	        cursor !== null && rows.push(items);
	        return {line: line.substr(i), rows: rows};
	    };

	}
	module.exports = createParser;


/***/ },
/* 24 */
/***/ function(module, exports) {

	module.exports = require("string_decoder");

/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	var fs = __webpack_require__(1),
	    extended = __webpack_require__(7),
	    escape = extended.escape,
	    stream = __webpack_require__(20),
	    LINE_BREAK = extended.LINE_BREAK,
	    CsvTransformStream = __webpack_require__(26);


	function createWriteStream(options) {
	    return new CsvTransformStream(options);
	}

	function write(arr, options, ws) {
	    var csvStream = createWriteStream(options), i = -1, l = arr.length;
	    extended.asyncEach(arr, function (item, cb) {
	        csvStream.write(item, null, cb);
	    }, function (err) {
	        if (err) {
	            csvStream.emit("error", err);
	        } else {
	            csvStream.end();
	        }
	    });
	    return csvStream;
	}

	function writeToStream(ws, arr, options) {
	    return write(arr, options).pipe(ws);
	}

	function writeToString(arr, options, cb) {
	    if (extended.isFunction(options)) {
	        cb = options;
	        options = {};
	    }
	    var ws = new stream.Writable(), written = [];
	    ws._write = function (data, enc, cb) {
	        written.push(data + "");
	        cb();
	    };
	    ws
	        .on("error", cb)
	        .on("finish", function () {
	            cb(null, written.join(""));
	        });
	    write(arr, options).pipe(ws);
	}


	function writeToBuffer(arr, options, cb) {
	    if (extended.isFunction(options)) {
	        cb = options;
	        options = {};
	    }
	    var ws = new stream.Writable(), buffers = [], l = 0;
	    ws._write = function (data, enc, cb) {
	        buffers.push(data);
	        l++;
	        cb();
	    };
	    ws
	        .on("error", cb)
	        .on("finish", function () {
	            cb(null, Buffer.concat(buffers));
	        });
	    write(arr, options).pipe(ws);
	}

	function writeToPath(path, arr, options) {
	    var stream = fs.createWriteStream(path, {encoding: "utf8"});
	    return write(arr, options).pipe(stream);
	}

	createWriteStream.writeToBuffer = writeToBuffer;
	createWriteStream.write = write;
	createWriteStream.createWriteStream = createWriteStream;
	createWriteStream.writeToString = writeToString;
	createWriteStream.writeToPath = writeToPath;
	createWriteStream.writeToStream = writeToStream;
	module.exports = createWriteStream;


/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	var fs = __webpack_require__(1),
	    util = __webpack_require__(22),
	    extended = __webpack_require__(7),
	    escape = extended.escape,
	    isArray = extended.isArray,
	    has = extended.has,
	    stream = __webpack_require__(20),
	    Transform = stream.Transform,
	    LINE_BREAK = extended.LINE_BREAK,
	    formatter = __webpack_require__(27),
	    createFormatter = formatter.createFormatter,
	    checkHeaders = formatter.checkHeaders,
	    transformItem = formatter.transformItem,
	    defaultTransform = formatter.defaultTransform;

	function CsvTransformStream(options) {
	    options = options || {};
	    options.objectMode = true;

	    if (has(options, "transform")) {
	        // remove so its not set to _transform in Transform constructor
	        options.consumerTransform = options.transform;
	        delete options.transform;
	    }

	    Transform.call(this, options);
	    this.formatter = createFormatter(options, this);
	    this.rowDelimiter = options.rowDelimiter || "\n";
	    var hasHeaders = has(options, "headers") ? !!options.headers : null,
	        headers = (hasHeaders && isArray(options.headers)) ? options.headers : null;
	    this.hasHeaders = hasHeaders;
	    this.headers = headers;
	    if (hasHeaders) {
	        if (headers) {
	            this.parsedHeaders = true;
	            this.headersLength = headers.length;
	        } else {
	            this.parsedHeaders = false;
	        }
	    }
	    this.hasWrittenHeaders = hasHeaders ? false : true;
	    this.includeEndRowDelimiter = !!options.includeEndRowDelimiter,
	    has(options, "consumerTransform") && this.transform(options.consumerTransform);
	}
	util.inherits(CsvTransformStream, Transform);

	extended(CsvTransformStream).extend({

	    headers: null,

	    headersLength: 0,

	    totalCount: 0,

	    _transform: function (item, encoding, cb) {
	        var self = this;
	        this.__transform(item, function (err, item) {
	            if (err) {
	                cb(err);
	            } else {
	                if (checkHeaders(self, item)) {
	                    self.push(new Buffer(transformItem(self, item), "utf8"));
	                }
	                cb();
	            }
	        });
	    },

	    __transform: defaultTransform,

	    transform: function (cb) {
	        if (!extended.isFunction(cb)) {
	            this.emit("error", new TypeError("fast-csv.FormatterStream#transform requires a function"));
	        }
	        if (cb.length === 2) {
	            this.__transform = cb;
	        } else {
	            this.__transform = function (data, next) {
	                next(null, cb(data));
	            };
	        }
	        return this;
	    },

	    _flush: function (cb) {
	        if (this.includeEndRowDelimiter) {
	            this.push(this.rowDelimiter);
	        }
	        cb();
	    }
	});

	module.exports = CsvTransformStream;


/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	var fs = __webpack_require__(1),
	    extended = __webpack_require__(7),
	    has = extended.has,
	    isBoolean = extended.isBoolean,
	    isUndefinedOrNull = extended.isUndefinedOrNull,
	    escape = extended.escape,
	    isArray = extended.isArray,
	    keys = extended.keys,
	    stream = __webpack_require__(20),
	    LINE_BREAK = extended.LINE_BREAK;

	function createQuoteChecker(stream, quoteColumns, quoteHeaders) {
	    var shouldQuote;
	    if (isBoolean(quoteColumns)) {
	        if (isBoolean(quoteHeaders)) {
	            shouldQuote = function shouldQuote(index, isHeader) {
	                return (isHeader ? quoteHeaders : quoteColumns);
	            };
	        } else if (isArray(quoteHeaders)) {
	            shouldQuote = function shouldQuote(index, isHeader) {
	                return isHeader ? quoteHeaders[index] : quoteColumns;
	            };
	        } else {
	            shouldQuote = function shouldQuote(index, isHeader) {
	                return isHeader ? quoteHeaders[stream.headers[index]] : quoteColumns;
	            };
	        }
	    } else if (isArray(quoteColumns)) {
	        if (isBoolean(quoteHeaders)) {
	            shouldQuote = function shouldQuote(index, isHeader) {
	                return isHeader ? quoteHeaders : quoteColumns[index];
	            };
	        } else {
	            shouldQuote = function shouldQuote(index, isHeader) {
	                return isHeader ? quoteHeaders[index] : quoteColumns[index];
	            };
	        }
	    } else {
	        if (isBoolean(quoteHeaders)) {
	            shouldQuote = function shouldQuote(index, isHeader) {
	                return isHeader ? quoteHeaders : quoteColumns[stream.headers[index]];
	            };
	        } else {
	            shouldQuote = function shouldQuote(index, isHeader) {
	                return isHeader ? quoteHeaders[stream.headers[index]] : quoteColumns[stream.headers[index]];
	            };
	        }
	    }
	    return shouldQuote;
	}

	function createFormatter(options, stream) {
	    options = options || {};
	    var delimiter = options.delimiter || ",",
	        ESCAPE_REGEXP = new RegExp("[" + delimiter + escape(options.rowDelimiter || LINE_BREAK) + "']"),
	        QUOTE = options.quote || '"',
	        ESCAPE = options.escape || '"',
	        REPLACE_REGEXP = new RegExp(QUOTE, "g"),
	        quoteColumns = has(options, "quoteColumns") ? options.quoteColumns : false,
	        quoteHeaders = has(options, "quoteHeaders") ? options.quoteHeaders : quoteColumns,
	        shouldQuote = createQuoteChecker(stream, quoteColumns, quoteHeaders);


	    function escapeField(field, index, isHeader) {
	        var escape;
	        field = field.replace(/\0/g, '');
	        if ((escape = field.indexOf(QUOTE) !== -1)) {
	            field = field.replace(REPLACE_REGEXP, ESCAPE + QUOTE);
	            escape = true;
	        } else {
	            escape = field.search(ESCAPE_REGEXP) !== -1;
	        }
	        escape = escape || shouldQuote(index, isHeader);
	        if (escape) {
	            field = [QUOTE + field + QUOTE];
	        } else {
	            field = [field];
	        }
	        return field.join("");
	    }

	    return function escapeFields(fields, isHeader) {
	        var i = -1, l = fields.length, ret = [], field;
	        while (++i < l) {
	            field = fields[i];
	            field = (isUndefinedOrNull(field) ? "" : field) + "";
	            ret.push(escapeField(field, i, isHeader));
	        }
	        return ret.join(delimiter);
	    };
	}

	function defaultTransform(row, cb) {
	    return cb(null, row);
	}


	function isHashArray(arr) {
	    return isArray(arr) && isArray(arr[0]) && arr[0].length === 2;
	}

	//get headers from a row item
	function gatherHeaders(item) {
	    var ret, i, l;
	    if (isHashArray(item)) {
	        //lets assume a multidimesional array with item 0 bing the title
	        i = -1;
	        l = item.length;
	        ret = [];
	        while (++i < l) {
	            ret[i] = item[i][0];
	        }
	    } else if (isArray(item)) {
	        ret = item;
	    } else {
	        ret = keys(item);
	    }
	    return ret;
	}

	//check if we need to write header return true if we should also write a row
	//could be false if headers is true and the header row(first item) is passed in
	function checkHeaders(stream, item) {
	    var headers, ret = true;
	    if (!stream.parsedHeaders) {
	        stream.parsedHeaders = true;
	        headers = stream.headers = gatherHeaders(item);
	        stream.headersLength = headers.length;
	    }
	    if (!stream.hasWrittenHeaders) {
	        stream.totalCount++;
	        stream.push(new Buffer(stream.formatter(stream.headers, true), "utf8"));
	        stream.hasWrittenHeaders = true;
	        ret = isHashArray(item) || !isArray(item);
	    }
	    return ret;
	}

	//transform an object into a CSV row
	function transformHashData(stream, item) {
	    var vals = [], row = [], headers = stream.headers, i = -1, headersLength = stream.headersLength;
	    if (stream.totalCount++) {
	        row.push(stream.rowDelimiter);
	    }
	    while (++i < headersLength) {
	        vals[i] = item[headers[i]];
	    }
	    row.push(stream.formatter(vals));
	    return row.join("");
	}

	//transform an array into a CSV row
	function transformArrayData(stream, item, cb) {
	    var row = [];
	    if (stream.totalCount++) {
	        row.push(stream.rowDelimiter);
	    }
	    row.push(stream.formatter(item));
	    return row.join("");
	}

	//transform an array of two item arrays into a CSV row
	function transformHashArrayData(stream, item) {
	    var vals = [], row = [], i = -1, headersLength = stream.headersLength;
	    if (stream.totalCount++) {
	        row.push(stream.rowDelimiter);
	    }
	    while (++i < headersLength) {
	        vals[i] = item[i][1];
	    }
	    row.push(stream.formatter(vals));
	    return row.join("");
	}

	//wrapper to determin what transform to run
	function transformItem(stream, item) {
	    var ret;
	    if (isArray(item)) {
	        if (isHashArray(item)) {
	            ret = transformHashArrayData(stream, item);
	        } else {
	            ret = transformArrayData(stream, item);
	        }
	    } else {
	        ret = transformHashData(stream, item);
	    }
	    return ret;
	}

	exports.createFormatter = createFormatter;
	exports.transformItem = transformItem;
	exports.checkHeaders = checkHeaders;
	exports.defaultTransform = defaultTransform;


/***/ },
/* 28 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var budgetSegmentsToRead = exports.budgetSegmentsToRead = [{
	  tableTitle: 'GoU Releases and Expenditure by Output'
	}, {
	  tableTitle: 'Highlights of Vote Performance'
	}, {
	  tableTitle: 'GoU Expenditure by Item'
	}, {
	  tableTitle: 'GoU Releases and Expenditure by Project and Programme'
	}, {
	  tableTitle: 'External Financing Releases and Expenditure'
	}, {
	  tableTitle: 'Releases and Expenditure by Vote Function'
	}, {
	  tableTitle: 'Overview of Vote Expenditures'
	}, {
	  tableTitle: 'Overview of Vote Expenditures'
	}, {
	  tableTitle: 'Annex A1.1'
	}, {
	  tableTitle: 'Annex A1.2'
	}];

	// responsible for table titles
	// this is for all the tables that are alike
	var transformRegular = exports.transformRegular = function transformRegular(row) {
	  return {
	    'Vote Name': row[8],
	    'Table Name': row[7],
	    Sector: row[0],
	    'Approved Budget': row[1],
	    released: row[2],
	    spent: row[3],
	    '% Budget released': row[4],
	    '% budget spent': row[5],
	    '% releases spent': row[6]
	  };
	};
	// overviewVoteExpenditure tables have different table names and structure
	// 2011 -2012 overview tables dont have the Cashlimits column and hence have less fields
	var rowStructure = function rowStructure(row) {
	  if (row.length === 10) {
	    return { // rest of the years
	      'Vote Name': row[9],
	      'Table Name': row[8],
	      Category: row[0],
	      'Approved Budget': row[1],
	      'Cashlimits by End': row[2],
	      'Released by End': row[3],
	      'Spent by End Jun': row[4],
	      '% Budget Released': row[5],
	      '% Budget spent': row[6],
	      '% Releases spent': row[7]
	    };
	  }
	  return { // 2011-12 tables
	    'Vote Name': row[8],
	    'Table Name': row[7],
	    Category: row[0],
	    'Approved Budget': row[1],
	    'Released by End': row[2],
	    'Spent by End Jun': row[3],
	    '% Budget Released': row[4],
	    '% Budget spent': row[5],
	    '% Releases spent': row[6]
	  };
	};

	var transformOverview = exports.transformOverview = function transformOverview(row) {
	  return rowStructure(row);
	};

	var transformForAnnexTables = exports.transformForAnnexTables = function transformForAnnexTables(row) {
	  return {
	    'Annex Type': row[0],
	    'Approved Estimates wage': row[1],
	    'Approved Estimates Non Wage': row[2],
	    'Approved Estimates GoU Dev': row[3],
	    'Approved Estimates GoU Total': row[4],
	    'Releases by End June Wage': row[5],
	    'Releases by End June Non Wage': row[6],
	    'Releases by End June Gou Dev': row[7],
	    'Releases by End June GoU Total': row[8],
	    'Expenditure by End June Wage': row[9],
	    'Expenditure by End June Non Wage': row[10],
	    'Expenditure by End June Gou Dev': row[11],
	    'Expenditure by End June GoU Total': row[12],
	    'Performance by End June Wage': row[13],
	    'Performance by End June Non Wage': row[14],
	    'Performance by End June Gou Dev': row[15],
	    'Performance by End June GoU Total': row[16]

	  };
	};

/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _commander = __webpack_require__(30);

	var _commander2 = _interopRequireDefault(_commander);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	_commander2.default.version('0.0.1').option('-f, --first <n>', 'Add first page').option('-l, --last <n>', 'Add last page').option('-o, --overview', 'indicates we are mining from overview vote expenditure tables').option('-a, --annex', 'indicates that we want to mine annex tables').option('-n, --name [name]', 'Add resulting csv file name');

	_commander2.default.on('--help', function () {
	  console.log('  Example:');
	  console.log('');
	  console.log('   Pass in file location as last argument');
	  console.log('');
	  console.log('    $ budget -f 443 -l 447 -n health 2014-15.pdf');
	  console.log('');
	});

	_commander2.default.parse(process.argv);

	exports.default = _commander2.default;

/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Module dependencies.
	 */

	var EventEmitter = __webpack_require__(31).EventEmitter;
	var spawn = __webpack_require__(32).spawn;
	var readlink = __webpack_require__(33).readlinkSync;
	var path = __webpack_require__(34);
	var dirname = path.dirname;
	var basename = path.basename;
	var fs = __webpack_require__(1);

	/**
	 * Expose the root command.
	 */

	exports = module.exports = new Command();

	/**
	 * Expose `Command`.
	 */

	exports.Command = Command;

	/**
	 * Expose `Option`.
	 */

	exports.Option = Option;

	/**
	 * Initialize a new `Option` with the given `flags` and `description`.
	 *
	 * @param {String} flags
	 * @param {String} description
	 * @api public
	 */

	function Option(flags, description) {
	  this.flags = flags;
	  this.required = ~flags.indexOf('<');
	  this.optional = ~flags.indexOf('[');
	  this.bool = !~flags.indexOf('-no-');
	  flags = flags.split(/[ ,|]+/);
	  if (flags.length > 1 && !/^[[<]/.test(flags[1])) this.short = flags.shift();
	  this.long = flags.shift();
	  this.description = description || '';
	}

	/**
	 * Return option name.
	 *
	 * @return {String}
	 * @api private
	 */

	Option.prototype.name = function() {
	  return this.long
	    .replace('--', '')
	    .replace('no-', '');
	};

	/**
	 * Check if `arg` matches the short or long flag.
	 *
	 * @param {String} arg
	 * @return {Boolean}
	 * @api private
	 */

	Option.prototype.is = function(arg) {
	  return arg == this.short || arg == this.long;
	};

	/**
	 * Initialize a new `Command`.
	 *
	 * @param {String} name
	 * @api public
	 */

	function Command(name) {
	  this.commands = [];
	  this.options = [];
	  this._execs = {};
	  this._allowUnknownOption = false;
	  this._args = [];
	  this._name = name || '';
	}

	/**
	 * Inherit from `EventEmitter.prototype`.
	 */

	Command.prototype.__proto__ = EventEmitter.prototype;

	/**
	 * Add command `name`.
	 *
	 * The `.action()` callback is invoked when the
	 * command `name` is specified via __ARGV__,
	 * and the remaining arguments are applied to the
	 * function for access.
	 *
	 * When the `name` is "*" an un-matched command
	 * will be passed as the first arg, followed by
	 * the rest of __ARGV__ remaining.
	 *
	 * Examples:
	 *
	 *      program
	 *        .version('0.0.1')
	 *        .option('-C, --chdir <path>', 'change the working directory')
	 *        .option('-c, --config <path>', 'set config path. defaults to ./deploy.conf')
	 *        .option('-T, --no-tests', 'ignore test hook')
	 *
	 *      program
	 *        .command('setup')
	 *        .description('run remote setup commands')
	 *        .action(function() {
	 *          console.log('setup');
	 *        });
	 *
	 *      program
	 *        .command('exec <cmd>')
	 *        .description('run the given remote command')
	 *        .action(function(cmd) {
	 *          console.log('exec "%s"', cmd);
	 *        });
	 *
	 *      program
	 *        .command('teardown <dir> [otherDirs...]')
	 *        .description('run teardown commands')
	 *        .action(function(dir, otherDirs) {
	 *          console.log('dir "%s"', dir);
	 *          if (otherDirs) {
	 *            otherDirs.forEach(function (oDir) {
	 *              console.log('dir "%s"', oDir);
	 *            });
	 *          }
	 *        });
	 *
	 *      program
	 *        .command('*')
	 *        .description('deploy the given env')
	 *        .action(function(env) {
	 *          console.log('deploying "%s"', env);
	 *        });
	 *
	 *      program.parse(process.argv);
	  *
	 * @param {String} name
	 * @param {String} [desc] for git-style sub-commands
	 * @return {Command} the new command
	 * @api public
	 */

	Command.prototype.command = function(name, desc, opts) {
	  opts = opts || {};
	  var args = name.split(/ +/);
	  var cmd = new Command(args.shift());

	  if (desc) {
	    cmd.description(desc);
	    this.executables = true;
	    this._execs[cmd._name] = true;
	    if (opts.isDefault) this.defaultExecutable = cmd._name;
	  }

	  cmd._noHelp = !!opts.noHelp;
	  this.commands.push(cmd);
	  cmd.parseExpectedArgs(args);
	  cmd.parent = this;

	  if (desc) return this;
	  return cmd;
	};

	/**
	 * Define argument syntax for the top-level command.
	 *
	 * @api public
	 */

	Command.prototype.arguments = function (desc) {
	  return this.parseExpectedArgs(desc.split(/ +/));
	};

	/**
	 * Add an implicit `help [cmd]` subcommand
	 * which invokes `--help` for the given command.
	 *
	 * @api private
	 */

	Command.prototype.addImplicitHelpCommand = function() {
	  this.command('help [cmd]', 'display help for [cmd]');
	};

	/**
	 * Parse expected `args`.
	 *
	 * For example `["[type]"]` becomes `[{ required: false, name: 'type' }]`.
	 *
	 * @param {Array} args
	 * @return {Command} for chaining
	 * @api public
	 */

	Command.prototype.parseExpectedArgs = function(args) {
	  if (!args.length) return;
	  var self = this;
	  args.forEach(function(arg) {
	    var argDetails = {
	      required: false,
	      name: '',
	      variadic: false
	    };

	    switch (arg[0]) {
	      case '<':
	        argDetails.required = true;
	        argDetails.name = arg.slice(1, -1);
	        break;
	      case '[':
	        argDetails.name = arg.slice(1, -1);
	        break;
	    }

	    if (argDetails.name.length > 3 && argDetails.name.slice(-3) === '...') {
	      argDetails.variadic = true;
	      argDetails.name = argDetails.name.slice(0, -3);
	    }
	    if (argDetails.name) {
	      self._args.push(argDetails);
	    }
	  });
	  return this;
	};

	/**
	 * Register callback `fn` for the command.
	 *
	 * Examples:
	 *
	 *      program
	 *        .command('help')
	 *        .description('display verbose help')
	 *        .action(function() {
	 *           // output help here
	 *        });
	 *
	 * @param {Function} fn
	 * @return {Command} for chaining
	 * @api public
	 */

	Command.prototype.action = function(fn) {
	  var self = this;
	  var listener = function(args, unknown) {
	    // Parse any so-far unknown options
	    args = args || [];
	    unknown = unknown || [];

	    var parsed = self.parseOptions(unknown);

	    // Output help if necessary
	    outputHelpIfNecessary(self, parsed.unknown);

	    // If there are still any unknown options, then we simply
	    // die, unless someone asked for help, in which case we give it
	    // to them, and then we die.
	    if (parsed.unknown.length > 0) {
	      self.unknownOption(parsed.unknown[0]);
	    }

	    // Leftover arguments need to be pushed back. Fixes issue #56
	    if (parsed.args.length) args = parsed.args.concat(args);

	    self._args.forEach(function(arg, i) {
	      if (arg.required && null == args[i]) {
	        self.missingArgument(arg.name);
	      } else if (arg.variadic) {
	        if (i !== self._args.length - 1) {
	          self.variadicArgNotLast(arg.name);
	        }

	        args[i] = args.splice(i);
	      }
	    });

	    // Always append ourselves to the end of the arguments,
	    // to make sure we match the number of arguments the user
	    // expects
	    if (self._args.length) {
	      args[self._args.length] = self;
	    } else {
	      args.push(self);
	    }

	    fn.apply(self, args);
	  };
	  var parent = this.parent || this;
	  var name = parent === this ? '*' : this._name;
	  parent.on(name, listener);
	  if (this._alias) parent.on(this._alias, listener);
	  return this;
	};

	/**
	 * Define option with `flags`, `description` and optional
	 * coercion `fn`.
	 *
	 * The `flags` string should contain both the short and long flags,
	 * separated by comma, a pipe or space. The following are all valid
	 * all will output this way when `--help` is used.
	 *
	 *    "-p, --pepper"
	 *    "-p|--pepper"
	 *    "-p --pepper"
	 *
	 * Examples:
	 *
	 *     // simple boolean defaulting to false
	 *     program.option('-p, --pepper', 'add pepper');
	 *
	 *     --pepper
	 *     program.pepper
	 *     // => Boolean
	 *
	 *     // simple boolean defaulting to true
	 *     program.option('-C, --no-cheese', 'remove cheese');
	 *
	 *     program.cheese
	 *     // => true
	 *
	 *     --no-cheese
	 *     program.cheese
	 *     // => false
	 *
	 *     // required argument
	 *     program.option('-C, --chdir <path>', 'change the working directory');
	 *
	 *     --chdir /tmp
	 *     program.chdir
	 *     // => "/tmp"
	 *
	 *     // optional argument
	 *     program.option('-c, --cheese [type]', 'add cheese [marble]');
	 *
	 * @param {String} flags
	 * @param {String} description
	 * @param {Function|Mixed} fn or default
	 * @param {Mixed} defaultValue
	 * @return {Command} for chaining
	 * @api public
	 */

	Command.prototype.option = function(flags, description, fn, defaultValue) {
	  var self = this
	    , option = new Option(flags, description)
	    , oname = option.name()
	    , name = camelcase(oname);

	  // default as 3rd arg
	  if (typeof fn != 'function') {
	    if (fn instanceof RegExp) {
	      var regex = fn;
	      fn = function(val, def) {
	        var m = regex.exec(val);
	        return m ? m[0] : def;
	      }
	    }
	    else {
	      defaultValue = fn;
	      fn = null;
	    }
	  }

	  // preassign default value only for --no-*, [optional], or <required>
	  if (false == option.bool || option.optional || option.required) {
	    // when --no-* we make sure default is true
	    if (false == option.bool) defaultValue = true;
	    // preassign only if we have a default
	    if (undefined !== defaultValue) self[name] = defaultValue;
	  }

	  // register the option
	  this.options.push(option);

	  // when it's passed assign the value
	  // and conditionally invoke the callback
	  this.on(oname, function(val) {
	    // coercion
	    if (null !== val && fn) val = fn(val, undefined === self[name]
	      ? defaultValue
	      : self[name]);

	    // unassigned or bool
	    if ('boolean' == typeof self[name] || 'undefined' == typeof self[name]) {
	      // if no value, bool true, and we have a default, then use it!
	      if (null == val) {
	        self[name] = option.bool
	          ? defaultValue || true
	          : false;
	      } else {
	        self[name] = val;
	      }
	    } else if (null !== val) {
	      // reassign
	      self[name] = val;
	    }
	  });

	  return this;
	};

	/**
	 * Allow unknown options on the command line.
	 *
	 * @param {Boolean} arg if `true` or omitted, no error will be thrown
	 * for unknown options.
	 * @api public
	 */
	Command.prototype.allowUnknownOption = function(arg) {
	    this._allowUnknownOption = arguments.length === 0 || arg;
	    return this;
	};

	/**
	 * Parse `argv`, settings options and invoking commands when defined.
	 *
	 * @param {Array} argv
	 * @return {Command} for chaining
	 * @api public
	 */

	Command.prototype.parse = function(argv) {
	  // implicit help
	  if (this.executables) this.addImplicitHelpCommand();

	  // store raw args
	  this.rawArgs = argv;

	  // guess name
	  this._name = this._name || basename(argv[1], '.js');

	  // github-style sub-commands with no sub-command
	  if (this.executables && argv.length < 3 && !this.defaultExecutable) {
	    // this user needs help
	    argv.push('--help');
	  }

	  // process argv
	  var parsed = this.parseOptions(this.normalize(argv.slice(2)));
	  var args = this.args = parsed.args;

	  var result = this.parseArgs(this.args, parsed.unknown);

	  // executable sub-commands
	  var name = result.args[0];
	  if (this._execs[name] && typeof this._execs[name] != "function") {
	    return this.executeSubCommand(argv, args, parsed.unknown);
	  } else if (this.defaultExecutable) {
	    // use the default subcommand
	    args.unshift(name = this.defaultExecutable);
	    return this.executeSubCommand(argv, args, parsed.unknown);
	  }

	  return result;
	};

	/**
	 * Execute a sub-command executable.
	 *
	 * @param {Array} argv
	 * @param {Array} args
	 * @param {Array} unknown
	 * @api private
	 */

	Command.prototype.executeSubCommand = function(argv, args, unknown) {
	  args = args.concat(unknown);

	  if (!args.length) this.help();
	  if ('help' == args[0] && 1 == args.length) this.help();

	  // <cmd> --help
	  if ('help' == args[0]) {
	    args[0] = args[1];
	    args[1] = '--help';
	  }

	  // executable
	  var f = argv[1];
	  // name of the subcommand, link `pm-install`
	  var bin = basename(f, '.js') + '-' + args[0];


	  // In case of globally installed, get the base dir where executable
	  //  subcommand file should be located at
	  var baseDir
	    , link = readlink(f);

	  // when symbolink is relative path
	  if (link !== f && link.charAt(0) !== '/') {
	    link = path.join(dirname(f), link)
	  }
	  baseDir = dirname(link);

	  // prefer local `./<bin>` to bin in the $PATH
	  var localBin = path.join(baseDir, bin);

	  // whether bin file is a js script with explicit `.js` extension
	  var isExplicitJS = false;
	  if (exists(localBin + '.js')) {
	    bin = localBin + '.js';
	    isExplicitJS = true;
	  } else if (exists(localBin)) {
	    bin = localBin;
	  }

	  args = args.slice(1);

	  var proc;
	  if (process.platform !== 'win32') {
	    if (isExplicitJS) {
	      args.unshift(localBin);
	      // add executable arguments to spawn
	      args = (process.execArgv || []).concat(args);

	      proc = spawn('node', args, { stdio: 'inherit', customFds: [0, 1, 2] });
	    } else {
	      proc = spawn(bin, args, { stdio: 'inherit', customFds: [0, 1, 2] });
	    }
	  } else {
	    args.unshift(localBin);
	    proc = spawn(process.execPath, args, { stdio: 'inherit'});
	  }

	  proc.on('close', process.exit.bind(process));
	  proc.on('error', function(err) {
	    if (err.code == "ENOENT") {
	      console.error('\n  %s(1) does not exist, try --help\n', bin);
	    } else if (err.code == "EACCES") {
	      console.error('\n  %s(1) not executable. try chmod or run with root\n', bin);
	    }
	    process.exit(1);
	  });

	  // Store the reference to the child process
	  this.runningCommand = proc;
	};

	/**
	 * Normalize `args`, splitting joined short flags. For example
	 * the arg "-abc" is equivalent to "-a -b -c".
	 * This also normalizes equal sign and splits "--abc=def" into "--abc def".
	 *
	 * @param {Array} args
	 * @return {Array}
	 * @api private
	 */

	Command.prototype.normalize = function(args) {
	  var ret = []
	    , arg
	    , lastOpt
	    , index;

	  for (var i = 0, len = args.length; i < len; ++i) {
	    arg = args[i];
	    if (i > 0) {
	      lastOpt = this.optionFor(args[i-1]);
	    }

	    if (arg === '--') {
	      // Honor option terminator
	      ret = ret.concat(args.slice(i));
	      break;
	    } else if (lastOpt && lastOpt.required) {
	      ret.push(arg);
	    } else if (arg.length > 1 && '-' == arg[0] && '-' != arg[1]) {
	      arg.slice(1).split('').forEach(function(c) {
	        ret.push('-' + c);
	      });
	    } else if (/^--/.test(arg) && ~(index = arg.indexOf('='))) {
	      ret.push(arg.slice(0, index), arg.slice(index + 1));
	    } else {
	      ret.push(arg);
	    }
	  }

	  return ret;
	};

	/**
	 * Parse command `args`.
	 *
	 * When listener(s) are available those
	 * callbacks are invoked, otherwise the "*"
	 * event is emitted and those actions are invoked.
	 *
	 * @param {Array} args
	 * @return {Command} for chaining
	 * @api private
	 */

	Command.prototype.parseArgs = function(args, unknown) {
	  var name;

	  if (args.length) {
	    name = args[0];
	    if (this.listeners(name).length) {
	      this.emit(args.shift(), args, unknown);
	    } else {
	      this.emit('*', args);
	    }
	  } else {
	    outputHelpIfNecessary(this, unknown);

	    // If there were no args and we have unknown options,
	    // then they are extraneous and we need to error.
	    if (unknown.length > 0) {
	      this.unknownOption(unknown[0]);
	    }
	  }

	  return this;
	};

	/**
	 * Return an option matching `arg` if any.
	 *
	 * @param {String} arg
	 * @return {Option}
	 * @api private
	 */

	Command.prototype.optionFor = function(arg) {
	  for (var i = 0, len = this.options.length; i < len; ++i) {
	    if (this.options[i].is(arg)) {
	      return this.options[i];
	    }
	  }
	};

	/**
	 * Parse options from `argv` returning `argv`
	 * void of these options.
	 *
	 * @param {Array} argv
	 * @return {Array}
	 * @api public
	 */

	Command.prototype.parseOptions = function(argv) {
	  var args = []
	    , len = argv.length
	    , literal
	    , option
	    , arg;

	  var unknownOptions = [];

	  // parse options
	  for (var i = 0; i < len; ++i) {
	    arg = argv[i];

	    // literal args after --
	    if ('--' == arg) {
	      literal = true;
	      continue;
	    }

	    if (literal) {
	      args.push(arg);
	      continue;
	    }

	    // find matching Option
	    option = this.optionFor(arg);

	    // option is defined
	    if (option) {
	      // requires arg
	      if (option.required) {
	        arg = argv[++i];
	        if (null == arg) return this.optionMissingArgument(option);
	        this.emit(option.name(), arg);
	      // optional arg
	      } else if (option.optional) {
	        arg = argv[i+1];
	        if (null == arg || ('-' == arg[0] && '-' != arg)) {
	          arg = null;
	        } else {
	          ++i;
	        }
	        this.emit(option.name(), arg);
	      // bool
	      } else {
	        this.emit(option.name());
	      }
	      continue;
	    }

	    // looks like an option
	    if (arg.length > 1 && '-' == arg[0]) {
	      unknownOptions.push(arg);

	      // If the next argument looks like it might be
	      // an argument for this option, we pass it on.
	      // If it isn't, then it'll simply be ignored
	      if (argv[i+1] && '-' != argv[i+1][0]) {
	        unknownOptions.push(argv[++i]);
	      }
	      continue;
	    }

	    // arg
	    args.push(arg);
	  }

	  return { args: args, unknown: unknownOptions };
	};

	/**
	 * Return an object containing options as key-value pairs
	 *
	 * @return {Object}
	 * @api public
	 */
	Command.prototype.opts = function() {
	  var result = {}
	    , len = this.options.length;

	  for (var i = 0 ; i < len; i++) {
	    var key = camelcase(this.options[i].name());
	    result[key] = key === 'version' ? this._version : this[key];
	  }
	  return result;
	};

	/**
	 * Argument `name` is missing.
	 *
	 * @param {String} name
	 * @api private
	 */

	Command.prototype.missingArgument = function(name) {
	  console.error();
	  console.error("  error: missing required argument `%s'", name);
	  console.error();
	  process.exit(1);
	};

	/**
	 * `Option` is missing an argument, but received `flag` or nothing.
	 *
	 * @param {String} option
	 * @param {String} flag
	 * @api private
	 */

	Command.prototype.optionMissingArgument = function(option, flag) {
	  console.error();
	  if (flag) {
	    console.error("  error: option `%s' argument missing, got `%s'", option.flags, flag);
	  } else {
	    console.error("  error: option `%s' argument missing", option.flags);
	  }
	  console.error();
	  process.exit(1);
	};

	/**
	 * Unknown option `flag`.
	 *
	 * @param {String} flag
	 * @api private
	 */

	Command.prototype.unknownOption = function(flag) {
	  if (this._allowUnknownOption) return;
	  console.error();
	  console.error("  error: unknown option `%s'", flag);
	  console.error();
	  process.exit(1);
	};

	/**
	 * Variadic argument with `name` is not the last argument as required.
	 *
	 * @param {String} name
	 * @api private
	 */

	Command.prototype.variadicArgNotLast = function(name) {
	  console.error();
	  console.error("  error: variadic arguments must be last `%s'", name);
	  console.error();
	  process.exit(1);
	};

	/**
	 * Set the program version to `str`.
	 *
	 * This method auto-registers the "-V, --version" flag
	 * which will print the version number when passed.
	 *
	 * @param {String} str
	 * @param {String} flags
	 * @return {Command} for chaining
	 * @api public
	 */

	Command.prototype.version = function(str, flags) {
	  if (0 == arguments.length) return this._version;
	  this._version = str;
	  flags = flags || '-V, --version';
	  this.option(flags, 'output the version number');
	  this.on('version', function() {
	    process.stdout.write(str + '\n');
	    process.exit(0);
	  });
	  return this;
	};

	/**
	 * Set the description to `str`.
	 *
	 * @param {String} str
	 * @return {String|Command}
	 * @api public
	 */

	Command.prototype.description = function(str) {
	  if (0 === arguments.length) return this._description;
	  this._description = str;
	  return this;
	};

	/**
	 * Set an alias for the command
	 *
	 * @param {String} alias
	 * @return {String|Command}
	 * @api public
	 */

	Command.prototype.alias = function(alias) {
	  if (0 == arguments.length) return this._alias;
	  this._alias = alias;
	  return this;
	};

	/**
	 * Set / get the command usage `str`.
	 *
	 * @param {String} str
	 * @return {String|Command}
	 * @api public
	 */

	Command.prototype.usage = function(str) {
	  var args = this._args.map(function(arg) {
	    return humanReadableArgName(arg);
	  });

	  var usage = '[options]'
	    + (this.commands.length ? ' [command]' : '')
	    + (this._args.length ? ' ' + args.join(' ') : '');

	  if (0 == arguments.length) return this._usage || usage;
	  this._usage = str;

	  return this;
	};

	/**
	 * Get the name of the command
	 *
	 * @param {String} name
	 * @return {String|Command}
	 * @api public
	 */

	Command.prototype.name = function() {
	  return this._name;
	};

	/**
	 * Return the largest option length.
	 *
	 * @return {Number}
	 * @api private
	 */

	Command.prototype.largestOptionLength = function() {
	  return this.options.reduce(function(max, option) {
	    return Math.max(max, option.flags.length);
	  }, 0);
	};

	/**
	 * Return help for options.
	 *
	 * @return {String}
	 * @api private
	 */

	Command.prototype.optionHelp = function() {
	  var width = this.largestOptionLength();

	  // Prepend the help information
	  return [pad('-h, --help', width) + '  ' + 'output usage information']
	      .concat(this.options.map(function(option) {
	        return pad(option.flags, width) + '  ' + option.description;
	      }))
	      .join('\n');
	};

	/**
	 * Return command help documentation.
	 *
	 * @return {String}
	 * @api private
	 */

	Command.prototype.commandHelp = function() {
	  if (!this.commands.length) return '';

	  var commands = this.commands.filter(function(cmd) {
	    return !cmd._noHelp;
	  }).map(function(cmd) {
	    var args = cmd._args.map(function(arg) {
	      return humanReadableArgName(arg);
	    }).join(' ');

	    return [
	      cmd._name
	        + (cmd._alias ? '|' + cmd._alias : '')
	        + (cmd.options.length ? ' [options]' : '')
	        + ' ' + args
	      , cmd.description()
	    ];
	  });

	  var width = commands.reduce(function(max, command) {
	    return Math.max(max, command[0].length);
	  }, 0);

	  return [
	    ''
	    , '  Commands:'
	    , ''
	    , commands.map(function(cmd) {
	      var desc = cmd[1] ? '  ' + cmd[1] : '';
	      return pad(cmd[0], width) + desc;
	    }).join('\n').replace(/^/gm, '    ')
	    , ''
	  ].join('\n');
	};

	/**
	 * Return program help documentation.
	 *
	 * @return {String}
	 * @api private
	 */

	Command.prototype.helpInformation = function() {
	  var desc = [];
	  if (this._description) {
	    desc = [
	      '  ' + this._description
	      , ''
	    ];
	  }

	  var cmdName = this._name;
	  if (this._alias) {
	    cmdName = cmdName + '|' + this._alias;
	  }
	  var usage = [
	    ''
	    ,'  Usage: ' + cmdName + ' ' + this.usage()
	    , ''
	  ];

	  var cmds = [];
	  var commandHelp = this.commandHelp();
	  if (commandHelp) cmds = [commandHelp];

	  var options = [
	    '  Options:'
	    , ''
	    , '' + this.optionHelp().replace(/^/gm, '    ')
	    , ''
	    , ''
	  ];

	  return usage
	    .concat(cmds)
	    .concat(desc)
	    .concat(options)
	    .join('\n');
	};

	/**
	 * Output help information for this command
	 *
	 * @api public
	 */

	Command.prototype.outputHelp = function(cb) {
	  if (!cb) {
	    cb = function(passthru) {
	      return passthru;
	    }
	  }
	  process.stdout.write(cb(this.helpInformation()));
	  this.emit('--help');
	};

	/**
	 * Output help information and exit.
	 *
	 * @api public
	 */

	Command.prototype.help = function(cb) {
	  this.outputHelp(cb);
	  process.exit();
	};

	/**
	 * Camel-case the given `flag`
	 *
	 * @param {String} flag
	 * @return {String}
	 * @api private
	 */

	function camelcase(flag) {
	  return flag.split('-').reduce(function(str, word) {
	    return str + word[0].toUpperCase() + word.slice(1);
	  });
	}

	/**
	 * Pad `str` to `width`.
	 *
	 * @param {String} str
	 * @param {Number} width
	 * @return {String}
	 * @api private
	 */

	function pad(str, width) {
	  var len = Math.max(0, width - str.length);
	  return str + Array(len + 1).join(' ');
	}

	/**
	 * Output help information if necessary
	 *
	 * @param {Command} command to output help for
	 * @param {Array} array of options to search for -h or --help
	 * @api private
	 */

	function outputHelpIfNecessary(cmd, options) {
	  options = options || [];
	  for (var i = 0; i < options.length; i++) {
	    if (options[i] == '--help' || options[i] == '-h') {
	      cmd.outputHelp();
	      process.exit(0);
	    }
	  }
	}

	/**
	 * Takes an argument an returns its human readable equivalent for help usage.
	 *
	 * @param {Object} arg
	 * @return {String}
	 * @api private
	 */

	function humanReadableArgName(arg) {
	  var nameOutput = arg.name + (arg.variadic === true ? '...' : '');

	  return arg.required
	    ? '<' + nameOutput + '>'
	    : '[' + nameOutput + ']'
	}

	// for versions before node v0.8 when there weren't `fs.existsSync`
	function exists(file) {
	  try {
	    if (fs.statSync(file).isFile()) {
	      return true;
	    }
	  } catch (e) {
	    return false;
	  }
	}



/***/ },
/* 31 */
/***/ function(module, exports) {

	module.exports = require("events");

/***/ },
/* 32 */
/***/ function(module, exports) {

	module.exports = require("child_process");

/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	var fs = __webpack_require__(1)
	  , lstat = fs.lstatSync;

	exports.readlinkSync = function (p) {
	  if (lstat(p).isSymbolicLink()) {
	    return fs.readlinkSync(p);
	  } else {
	    return p;
	  }
	};




/***/ },
/* 34 */
/***/ function(module, exports) {

	module.exports = require("path");

/***/ }
/******/ ]);