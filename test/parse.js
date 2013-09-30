/* global describe, it, before */
/* jshint expr: true */

var quickpeg = require('..');
var Path = require('path');
var fs = require('fs');

var fixtureDir = Path.join(__dirname, 'fixture');
var tmpDir = Path.join(__dirname, '../tmp');
var mathGrammarFilename = 'math.grammar';
var mathSourceFilename = 'math.source';
var mathParserFilename = mathGrammarFilename + '.js';
var mathGrammarFile = Path.join(fixtureDir, mathGrammarFilename);
var mathParserFile = Path.join(fixtureDir, mathParserFilename);
var tmpMathParserFile = Path.join(tmpDir, mathParserFilename);
var mathSourceFile = Path.join(fixtureDir, mathSourceFilename);
var jsGrammarFilename = 'javascript.grammar';
var jsParserFilename = jsGrammarFilename + '.js';
var jsGrammarFile = Path.join(fixtureDir, jsGrammarFilename);
var jsParserFile = Path.join(fixtureDir, jsParserFilename);
var jsSourceFilename = 'javascript.source';
var jsSourceFile = Path.join(fixtureDir, jsSourceFilename);

var tmpFiles = [mathParserFile, tmpMathParserFile, jsParserFile];

var expect = require('chai').expect;

var unlinkFiles = function (files, cb) {
  var unlinkCount = 0;
  if (files.length === 0) {
    return cb(null);
  }
  files.forEach(function (file) {
    fs.unlink(file, function (err) {
      unlinkCount++;
      if (unlinkCount === files.length) {
        return cb(null);
      }
    });
  });
};

describe('quickpeg parse', function () {
  before(function (done) {
    unlinkFiles(tmpFiles, function (err) {
      fs.mkdir(tmpDir, function (err) {
        done();
      });
    });
  });
  after(function (done) {
    unlinkFiles(tmpFiles, function (err) {
      done();
    });
  });
  describe('parse file with grammar', function () {
    it('>>> start with no parser file', function (done) {
      fs.exists(mathParserFile, function (exists) {
        expect(exists).to.be.false;
        done();
      });
    });
    it('>>> start with no tmp parser file', function (done) {
      fs.exists(tmpMathParserFile, function (exists) {
        expect(exists).to.be.false;
        done();
      });
    });
    it('should not cache if options.cache is false', function (done) {
      quickpeg(mathGrammarFile, {cache: false}, function (err, parser) {
        fs.exists(mathParserFile, function (exists) {
          expect(exists).to.be.false;
          expect(parser.parse).to.exist;
          done();
        });
      });
    });
    it('should create/load a parser file from a grammar file', function (done) {
      quickpeg(mathGrammarFile, function (err, parser) {
        fs.exists(mathParserFile, function (exists) {
          expect(exists).to.be.true;
          expect(parser.parse).to.exist;
          done();
        });
      });
    });
    it('should cache parser to custom dir from a grammar file', function (done) {
      quickpeg.flushMemory();
      quickpeg(mathGrammarFile, {cache: tmpDir}, function (err, parser) {
        fs.exists(tmpMathParserFile, function (exists) {
          expect(exists).to.be.true;
          expect(parser.parse).to.exist;
          done();
        });
      });
    });
    it('>>> continue with no tmp parser file', function (done) {
      fs.unlink(tmpMathParserFile, function (err) {
        fs.exists(tmpMathParserFile, function (exists) {
          expect(exists).to.be.false;
          done();
        });
      });
    });
    it('should cache parser to custom file from a grammar file', function (done) {
      quickpeg.flushMemory();
      quickpeg(mathGrammarFile, {cache: tmpMathParserFile}, function (err, parser) {
        fs.exists(tmpMathParserFile, function (exists) {
          expect(exists).to.be.true;
          expect(parser.parse).to.exist;
          done();
        });
      });
    });
    it('should be able to parse', function (done) {
      quickpeg(mathGrammarFile, function (err, parser) {
        var result = parser.parse("2*(3+4)");
        expect(result).to.equal(14);
        done();
      });
    });
    it('should be able to parse a file', function (done) {
      quickpeg(mathGrammarFile, function (err, parser) {
        parser.parseFile(mathSourceFile, function (err, result) {
          expect(result).to.equal(14);
          done();
        });
      });
    });
    it('should be able to parse from memory', function () {
      var result = quickpeg.parserFromMemory(mathGrammarFile).parse("2*(3+4)");
      expect(result).to.equal(14);
    });
    it('should be able to parse with complicated grammar', function (done) {
      quickpeg.config({pegjs: {cache: true}})(jsGrammarFile, function (err, parser) {
        parser.parseFile(jsSourceFile, function (err, result) {
          done();
        });
      });
    });
  });
});