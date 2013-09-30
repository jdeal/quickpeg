var pegjs = require('pegjs');
var fsCompare = require('fs-compare');
var fs = require('fs');
var Path = require('path');

var parseFile = function (parser, file, cb) {
  fs.readFile(file, 'utf-8', function (err, source) {
    if (err) {
      return cb(err);
    }
    try {
      var result = parser.parse(source);
      return cb(null, result);
    } catch (e) {
      return cb(e);
    }
  });
};

var saveParser = function (source, parserFile, cb) {
  var moduleSource = 'module.exports = ' + source;
  fs.writeFile(parserFile, moduleSource, function (err) {
    if (err) {
      return cb(err);
    }
    cb(null);
  });
};

var extendParser = function (parser) {
  parser.parseFile = parseFile.bind(null, parser);
};

var loadParser = function (grammarFile, options, cb) {
  fs.readFile(grammarFile, 'utf8', function (err, grammarSource) {
    if (err) {
      return cb(err);
    }
    try {
      var parser = pegjs.buildParser(grammarSource, options.pegjs || {});
      extendParser(parser);
      return cb(null, parser);
    } catch (e) {
      return cb(e);
    }
  });
};

var loadAndSaveParser = function (grammarFile, parserFile, options, cb) {
  loadParser(grammarFile, options, function (err, parser) {
    if (err) {
      return cb(err);
    }
    saveParser(parser.toSource(), parserFile, function (err) {
      if (err) {
        return cb(err);
      }
      return cb(null, parser);
    });
  });
};

var cachedParserFromFile = function (grammarFile, parserFile, options, cb) {
  fsCompare.mtime(grammarFile, parserFile, function (err, diff) {
    var parser;
    if (err) {
      return cb(err);
    }
    if (diff > 0) {
      return loadAndSaveParser(grammarFile, parserFile, options, cb);
    } else {
      try {
        parser = require(parserFile);
        extendParser(parser);
      } catch (e) {
        return cb(e);
      }
      return cb(null, parser);
    }
  });
};

var cachedParserFile = function (grammarFile, cache, cb) {
  var parserFilename = Path.basename(grammarFile + '.js');
  if (typeof cache === 'string') {
    fs.stat(cache, function (err, stat) {
      if (err) {
        // maybe file doesn't exist, try dir
        fs.stat(Path.dirname(cache), function (err, stat) {
          if (err) {
            return cb(err);
          }
          return cb(null, cache);
        });
      } else {
        if (stat.isDirectory()) {
          return cb(null, Path.join(cache, parserFilename));
        } else {
          return cb(null, cache);
        }
      }
    });
  } else {
    return cb(null, grammarFile + '.js');
  }
};

var parserCache = [];

var parserFromFile = function (defaultOptions, grammarFile, extraOptions, cb) {
  var options = {};
  Object.keys(defaultOptions).forEach(function (key) {
    options[key] = defaultOptions[key];
  });
  if (typeof cb === 'undefined') {
    cb = extraOptions;
    extraOptions = {};
  }
  Object.keys(extraOptions).forEach(function (key) {
    options[key] = extraOptions[key];
  });
  if (options.cache) {
    if (grammarFile in parserCache) {
      return cb(null, parserCache[grammarFile]);
    }
    cachedParserFile(grammarFile, options.cache, function (err, parserFile) {
      if (err) {
        return cb(err);
      }
      cachedParserFromFile(grammarFile, parserFile, options, function (err, parser) {
        if (err) {
          return cb(err);
        }
        parserCache[grammarFile] = parser;
        return cb(null, parser);
      });
    });
  } else {
    loadParser(grammarFile, options, cb);
  }
};

var parserFromMemory = function (grammarFile) {
  return (grammarFile in parserCache) ? parserCache[grammarFile] : null;
};

var flushMemory = function () {
  parserCache = [];
};

var config = function (options) {
  options = options || {};
  if (typeof options.cache === 'undefined') {
    options.cache = true;
  }
  var fn = parserFromFile.bind(null, options);
  fn.config = config;
  fn.flushMemory = flushMemory;
  fn.parserFromMemory = parserFromMemory;
  return fn;
};

module.exports = config();