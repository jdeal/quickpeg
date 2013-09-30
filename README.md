quickpeg
========

[![Build Status](https://secure.travis-ci.org/jdeal/quickpeg.png)](http://travis-ci.org/jdeal/quickpeg)

Simple wrapper around pegjs; caches parsers built from grammar files; provides callback interface for parsing files.

See <http://pegjs.majda.cz/documentation#grammar-syntax-and-semantics> for details on grammar files.

## Installation

```bash
npm install quickpeg
```

## Usage

```js
var quickpeg = require('quickpeg');

quickpeg('my.grammar', function (err, parser) {
  parser.parseFile('my.source', function (err, result) {
    // result of parsing my.source with my.grammar
    // by default, parser is now cached to my.grammar.js
  });
});
```

## API

### quickpeg(grammarFile, [options], cb)

Converts a grammar file to a parser and caches the result (if caching is not
disabled). Returns the parser to the callback.

- `grammarFile` - The path to the peg grammar file.
- `options` - Options:
    - `cache` - Set to one of the following values:
        - `true` - Append `.js` to grammar file path and cache to that location.
        - `false` - Disable parser caching.
        - `some/dir` - Append `.js` to grammar filename and cache to `some/dir`.
        - `some/filename` - Cache to `some/filename`.
    - `pegjs` - Pass through options to PEG.js. See documentation for `buildParser`
      at <https://github.com/dmajda/pegjs#javascript-api>
- `cb` - Callback called with `(err, parser)`. See below for the parser API.

### quickpeg.config(options) : quickpegFunction

Creates a quickpeg function with default options.

- `options` - Default options for the quickpeg function.
- `quickpegFunction` - Configured quickpeg function.

### parser.parse(sourceString) : result

Parses a string with the parser and returns the result.

- `sourceString` - Source string to be parsed.
- `result` - Result of parsing `sourceString` with the parser.

See <http://pegjs.majda.cz/documentation#using-the-parser> for more details.

### parser.parseFile(sourceFile, cb)

Parses a file with the parser and returns the result on a callback.

- `sourceFile` - The path to the source file.
- `cb` - Callback called with `(err, result)`.