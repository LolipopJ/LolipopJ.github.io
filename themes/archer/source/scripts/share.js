/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/qrcode-generator/qrcode.js":
/*!*************************************************!*\
  !*** ./node_modules/qrcode-generator/qrcode.js ***!
  \*************************************************/
/***/ ((module, exports) => {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;//---------------------------------------------------------------------
//
// QR Code Generator for JavaScript
//
// Copyright (c) 2009 Kazuhiko Arase
//
// URL: http://www.d-project.com/
//
// Licensed under the MIT license:
//  http://www.opensource.org/licenses/mit-license.php
//
// The word 'QR Code' is registered trademark of
// DENSO WAVE INCORPORATED
//  http://www.denso-wave.com/qrcode/faqpatent-e.html
//
//---------------------------------------------------------------------

var qrcode = function() {

  //---------------------------------------------------------------------
  // qrcode
  //---------------------------------------------------------------------

  /**
   * qrcode
   * @param typeNumber 1 to 40
   * @param errorCorrectionLevel 'L','M','Q','H'
   */
  var qrcode = function(typeNumber, errorCorrectionLevel) {

    var PAD0 = 0xEC;
    var PAD1 = 0x11;

    var _typeNumber = typeNumber;
    var _errorCorrectionLevel = QRErrorCorrectionLevel[errorCorrectionLevel];
    var _modules = null;
    var _moduleCount = 0;
    var _dataCache = null;
    var _dataList = [];

    var _this = {};

    var makeImpl = function(test, maskPattern) {

      _moduleCount = _typeNumber * 4 + 17;
      _modules = function(moduleCount) {
        var modules = new Array(moduleCount);
        for (var row = 0; row < moduleCount; row += 1) {
          modules[row] = new Array(moduleCount);
          for (var col = 0; col < moduleCount; col += 1) {
            modules[row][col] = null;
          }
        }
        return modules;
      }(_moduleCount);

      setupPositionProbePattern(0, 0);
      setupPositionProbePattern(_moduleCount - 7, 0);
      setupPositionProbePattern(0, _moduleCount - 7);
      setupPositionAdjustPattern();
      setupTimingPattern();
      setupTypeInfo(test, maskPattern);

      if (_typeNumber >= 7) {
        setupTypeNumber(test);
      }

      if (_dataCache == null) {
        _dataCache = createData(_typeNumber, _errorCorrectionLevel, _dataList);
      }

      mapData(_dataCache, maskPattern);
    };

    var setupPositionProbePattern = function(row, col) {

      for (var r = -1; r <= 7; r += 1) {

        if (row + r <= -1 || _moduleCount <= row + r) continue;

        for (var c = -1; c <= 7; c += 1) {

          if (col + c <= -1 || _moduleCount <= col + c) continue;

          if ( (0 <= r && r <= 6 && (c == 0 || c == 6) )
              || (0 <= c && c <= 6 && (r == 0 || r == 6) )
              || (2 <= r && r <= 4 && 2 <= c && c <= 4) ) {
            _modules[row + r][col + c] = true;
          } else {
            _modules[row + r][col + c] = false;
          }
        }
      }
    };

    var getBestMaskPattern = function() {

      var minLostPoint = 0;
      var pattern = 0;

      for (var i = 0; i < 8; i += 1) {

        makeImpl(true, i);

        var lostPoint = QRUtil.getLostPoint(_this);

        if (i == 0 || minLostPoint > lostPoint) {
          minLostPoint = lostPoint;
          pattern = i;
        }
      }

      return pattern;
    };

    var setupTimingPattern = function() {

      for (var r = 8; r < _moduleCount - 8; r += 1) {
        if (_modules[r][6] != null) {
          continue;
        }
        _modules[r][6] = (r % 2 == 0);
      }

      for (var c = 8; c < _moduleCount - 8; c += 1) {
        if (_modules[6][c] != null) {
          continue;
        }
        _modules[6][c] = (c % 2 == 0);
      }
    };

    var setupPositionAdjustPattern = function() {

      var pos = QRUtil.getPatternPosition(_typeNumber);

      for (var i = 0; i < pos.length; i += 1) {

        for (var j = 0; j < pos.length; j += 1) {

          var row = pos[i];
          var col = pos[j];

          if (_modules[row][col] != null) {
            continue;
          }

          for (var r = -2; r <= 2; r += 1) {

            for (var c = -2; c <= 2; c += 1) {

              if (r == -2 || r == 2 || c == -2 || c == 2
                  || (r == 0 && c == 0) ) {
                _modules[row + r][col + c] = true;
              } else {
                _modules[row + r][col + c] = false;
              }
            }
          }
        }
      }
    };

    var setupTypeNumber = function(test) {

      var bits = QRUtil.getBCHTypeNumber(_typeNumber);

      for (var i = 0; i < 18; i += 1) {
        var mod = (!test && ( (bits >> i) & 1) == 1);
        _modules[Math.floor(i / 3)][i % 3 + _moduleCount - 8 - 3] = mod;
      }

      for (var i = 0; i < 18; i += 1) {
        var mod = (!test && ( (bits >> i) & 1) == 1);
        _modules[i % 3 + _moduleCount - 8 - 3][Math.floor(i / 3)] = mod;
      }
    };

    var setupTypeInfo = function(test, maskPattern) {

      var data = (_errorCorrectionLevel << 3) | maskPattern;
      var bits = QRUtil.getBCHTypeInfo(data);

      // vertical
      for (var i = 0; i < 15; i += 1) {

        var mod = (!test && ( (bits >> i) & 1) == 1);

        if (i < 6) {
          _modules[i][8] = mod;
        } else if (i < 8) {
          _modules[i + 1][8] = mod;
        } else {
          _modules[_moduleCount - 15 + i][8] = mod;
        }
      }

      // horizontal
      for (var i = 0; i < 15; i += 1) {

        var mod = (!test && ( (bits >> i) & 1) == 1);

        if (i < 8) {
          _modules[8][_moduleCount - i - 1] = mod;
        } else if (i < 9) {
          _modules[8][15 - i - 1 + 1] = mod;
        } else {
          _modules[8][15 - i - 1] = mod;
        }
      }

      // fixed module
      _modules[_moduleCount - 8][8] = (!test);
    };

    var mapData = function(data, maskPattern) {

      var inc = -1;
      var row = _moduleCount - 1;
      var bitIndex = 7;
      var byteIndex = 0;
      var maskFunc = QRUtil.getMaskFunction(maskPattern);

      for (var col = _moduleCount - 1; col > 0; col -= 2) {

        if (col == 6) col -= 1;

        while (true) {

          for (var c = 0; c < 2; c += 1) {

            if (_modules[row][col - c] == null) {

              var dark = false;

              if (byteIndex < data.length) {
                dark = ( ( (data[byteIndex] >>> bitIndex) & 1) == 1);
              }

              var mask = maskFunc(row, col - c);

              if (mask) {
                dark = !dark;
              }

              _modules[row][col - c] = dark;
              bitIndex -= 1;

              if (bitIndex == -1) {
                byteIndex += 1;
                bitIndex = 7;
              }
            }
          }

          row += inc;

          if (row < 0 || _moduleCount <= row) {
            row -= inc;
            inc = -inc;
            break;
          }
        }
      }
    };

    var createBytes = function(buffer, rsBlocks) {

      var offset = 0;

      var maxDcCount = 0;
      var maxEcCount = 0;

      var dcdata = new Array(rsBlocks.length);
      var ecdata = new Array(rsBlocks.length);

      for (var r = 0; r < rsBlocks.length; r += 1) {

        var dcCount = rsBlocks[r].dataCount;
        var ecCount = rsBlocks[r].totalCount - dcCount;

        maxDcCount = Math.max(maxDcCount, dcCount);
        maxEcCount = Math.max(maxEcCount, ecCount);

        dcdata[r] = new Array(dcCount);

        for (var i = 0; i < dcdata[r].length; i += 1) {
          dcdata[r][i] = 0xff & buffer.getBuffer()[i + offset];
        }
        offset += dcCount;

        var rsPoly = QRUtil.getErrorCorrectPolynomial(ecCount);
        var rawPoly = qrPolynomial(dcdata[r], rsPoly.getLength() - 1);

        var modPoly = rawPoly.mod(rsPoly);
        ecdata[r] = new Array(rsPoly.getLength() - 1);
        for (var i = 0; i < ecdata[r].length; i += 1) {
          var modIndex = i + modPoly.getLength() - ecdata[r].length;
          ecdata[r][i] = (modIndex >= 0)? modPoly.getAt(modIndex) : 0;
        }
      }

      var totalCodeCount = 0;
      for (var i = 0; i < rsBlocks.length; i += 1) {
        totalCodeCount += rsBlocks[i].totalCount;
      }

      var data = new Array(totalCodeCount);
      var index = 0;

      for (var i = 0; i < maxDcCount; i += 1) {
        for (var r = 0; r < rsBlocks.length; r += 1) {
          if (i < dcdata[r].length) {
            data[index] = dcdata[r][i];
            index += 1;
          }
        }
      }

      for (var i = 0; i < maxEcCount; i += 1) {
        for (var r = 0; r < rsBlocks.length; r += 1) {
          if (i < ecdata[r].length) {
            data[index] = ecdata[r][i];
            index += 1;
          }
        }
      }

      return data;
    };

    var createData = function(typeNumber, errorCorrectionLevel, dataList) {

      var rsBlocks = QRRSBlock.getRSBlocks(typeNumber, errorCorrectionLevel);

      var buffer = qrBitBuffer();

      for (var i = 0; i < dataList.length; i += 1) {
        var data = dataList[i];
        buffer.put(data.getMode(), 4);
        buffer.put(data.getLength(), QRUtil.getLengthInBits(data.getMode(), typeNumber) );
        data.write(buffer);
      }

      // calc num max data.
      var totalDataCount = 0;
      for (var i = 0; i < rsBlocks.length; i += 1) {
        totalDataCount += rsBlocks[i].dataCount;
      }

      if (buffer.getLengthInBits() > totalDataCount * 8) {
        throw 'code length overflow. ('
          + buffer.getLengthInBits()
          + '>'
          + totalDataCount * 8
          + ')';
      }

      // end code
      if (buffer.getLengthInBits() + 4 <= totalDataCount * 8) {
        buffer.put(0, 4);
      }

      // padding
      while (buffer.getLengthInBits() % 8 != 0) {
        buffer.putBit(false);
      }

      // padding
      while (true) {

        if (buffer.getLengthInBits() >= totalDataCount * 8) {
          break;
        }
        buffer.put(PAD0, 8);

        if (buffer.getLengthInBits() >= totalDataCount * 8) {
          break;
        }
        buffer.put(PAD1, 8);
      }

      return createBytes(buffer, rsBlocks);
    };

    _this.addData = function(data, mode) {

      mode = mode || 'Byte';

      var newData = null;

      switch(mode) {
      case 'Numeric' :
        newData = qrNumber(data);
        break;
      case 'Alphanumeric' :
        newData = qrAlphaNum(data);
        break;
      case 'Byte' :
        newData = qr8BitByte(data);
        break;
      case 'Kanji' :
        newData = qrKanji(data);
        break;
      default :
        throw 'mode:' + mode;
      }

      _dataList.push(newData);
      _dataCache = null;
    };

    _this.isDark = function(row, col) {
      if (row < 0 || _moduleCount <= row || col < 0 || _moduleCount <= col) {
        throw row + ',' + col;
      }
      return _modules[row][col];
    };

    _this.getModuleCount = function() {
      return _moduleCount;
    };

    _this.make = function() {
      if (_typeNumber < 1) {
        var typeNumber = 1;

        for (; typeNumber < 40; typeNumber++) {
          var rsBlocks = QRRSBlock.getRSBlocks(typeNumber, _errorCorrectionLevel);
          var buffer = qrBitBuffer();

          for (var i = 0; i < _dataList.length; i++) {
            var data = _dataList[i];
            buffer.put(data.getMode(), 4);
            buffer.put(data.getLength(), QRUtil.getLengthInBits(data.getMode(), typeNumber) );
            data.write(buffer);
          }

          var totalDataCount = 0;
          for (var i = 0; i < rsBlocks.length; i++) {
            totalDataCount += rsBlocks[i].dataCount;
          }

          if (buffer.getLengthInBits() <= totalDataCount * 8) {
            break;
          }
        }

        _typeNumber = typeNumber;
      }

      makeImpl(false, getBestMaskPattern() );
    };

    _this.createTableTag = function(cellSize, margin) {

      cellSize = cellSize || 2;
      margin = (typeof margin == 'undefined')? cellSize * 4 : margin;

      var qrHtml = '';

      qrHtml += '<table style="';
      qrHtml += ' border-width: 0px; border-style: none;';
      qrHtml += ' border-collapse: collapse;';
      qrHtml += ' padding: 0px; margin: ' + margin + 'px;';
      qrHtml += '">';
      qrHtml += '<tbody>';

      for (var r = 0; r < _this.getModuleCount(); r += 1) {

        qrHtml += '<tr>';

        for (var c = 0; c < _this.getModuleCount(); c += 1) {
          qrHtml += '<td style="';
          qrHtml += ' border-width: 0px; border-style: none;';
          qrHtml += ' border-collapse: collapse;';
          qrHtml += ' padding: 0px; margin: 0px;';
          qrHtml += ' width: ' + cellSize + 'px;';
          qrHtml += ' height: ' + cellSize + 'px;';
          qrHtml += ' background-color: ';
          qrHtml += _this.isDark(r, c)? '#000000' : '#ffffff';
          qrHtml += ';';
          qrHtml += '"/>';
        }

        qrHtml += '</tr>';
      }

      qrHtml += '</tbody>';
      qrHtml += '</table>';

      return qrHtml;
    };

    _this.createSvgTag = function(cellSize, margin, alt, title) {

      var opts = {};
      if (typeof arguments[0] == 'object') {
        // Called by options.
        opts = arguments[0];
        // overwrite cellSize and margin.
        cellSize = opts.cellSize;
        margin = opts.margin;
        alt = opts.alt;
        title = opts.title;
      }

      cellSize = cellSize || 2;
      margin = (typeof margin == 'undefined')? cellSize * 4 : margin;

      // Compose alt property surrogate
      alt = (typeof alt === 'string') ? {text: alt} : alt || {};
      alt.text = alt.text || null;
      alt.id = (alt.text) ? alt.id || 'qrcode-description' : null;

      // Compose title property surrogate
      title = (typeof title === 'string') ? {text: title} : title || {};
      title.text = title.text || null;
      title.id = (title.text) ? title.id || 'qrcode-title' : null;

      var size = _this.getModuleCount() * cellSize + margin * 2;
      var c, mc, r, mr, qrSvg='', rect;

      rect = 'l' + cellSize + ',0 0,' + cellSize +
        ' -' + cellSize + ',0 0,-' + cellSize + 'z ';

      qrSvg += '<svg version="1.1" xmlns="http://www.w3.org/2000/svg"';
      qrSvg += !opts.scalable ? ' width="' + size + 'px" height="' + size + 'px"' : '';
      qrSvg += ' viewBox="0 0 ' + size + ' ' + size + '" ';
      qrSvg += ' preserveAspectRatio="xMinYMin meet"';
      qrSvg += (title.text || alt.text) ? ' role="img" aria-labelledby="' +
          escapeXml([title.id, alt.id].join(' ').trim() ) + '"' : '';
      qrSvg += '>';
      qrSvg += (title.text) ? '<title id="' + escapeXml(title.id) + '">' +
          escapeXml(title.text) + '</title>' : '';
      qrSvg += (alt.text) ? '<description id="' + escapeXml(alt.id) + '">' +
          escapeXml(alt.text) + '</description>' : '';
      qrSvg += '<rect width="100%" height="100%" fill="white" cx="0" cy="0"/>';
      qrSvg += '<path d="';

      for (r = 0; r < _this.getModuleCount(); r += 1) {
        mr = r * cellSize + margin;
        for (c = 0; c < _this.getModuleCount(); c += 1) {
          if (_this.isDark(r, c) ) {
            mc = c*cellSize+margin;
            qrSvg += 'M' + mc + ',' + mr + rect;
          }
        }
      }

      qrSvg += '" stroke="transparent" fill="black"/>';
      qrSvg += '</svg>';

      return qrSvg;
    };

    _this.createDataURL = function(cellSize, margin) {

      cellSize = cellSize || 2;
      margin = (typeof margin == 'undefined')? cellSize * 4 : margin;

      var size = _this.getModuleCount() * cellSize + margin * 2;
      var min = margin;
      var max = size - margin;

      return createDataURL(size, size, function(x, y) {
        if (min <= x && x < max && min <= y && y < max) {
          var c = Math.floor( (x - min) / cellSize);
          var r = Math.floor( (y - min) / cellSize);
          return _this.isDark(r, c)? 0 : 1;
        } else {
          return 1;
        }
      } );
    };

    _this.createImgTag = function(cellSize, margin, alt) {

      cellSize = cellSize || 2;
      margin = (typeof margin == 'undefined')? cellSize * 4 : margin;

      var size = _this.getModuleCount() * cellSize + margin * 2;

      var img = '';
      img += '<img';
      img += '\u0020src="';
      img += _this.createDataURL(cellSize, margin);
      img += '"';
      img += '\u0020width="';
      img += size;
      img += '"';
      img += '\u0020height="';
      img += size;
      img += '"';
      if (alt) {
        img += '\u0020alt="';
        img += escapeXml(alt);
        img += '"';
      }
      img += '/>';

      return img;
    };

    var escapeXml = function(s) {
      var escaped = '';
      for (var i = 0; i < s.length; i += 1) {
        var c = s.charAt(i);
        switch(c) {
        case '<': escaped += '&lt;'; break;
        case '>': escaped += '&gt;'; break;
        case '&': escaped += '&amp;'; break;
        case '"': escaped += '&quot;'; break;
        default : escaped += c; break;
        }
      }
      return escaped;
    };

    var _createHalfASCII = function(margin) {
      var cellSize = 1;
      margin = (typeof margin == 'undefined')? cellSize * 2 : margin;

      var size = _this.getModuleCount() * cellSize + margin * 2;
      var min = margin;
      var max = size - margin;

      var y, x, r1, r2, p;

      var blocks = {
        '██': '█',
        '█ ': '▀',
        ' █': '▄',
        '  ': ' '
      };

      var blocksLastLineNoMargin = {
        '██': '▀',
        '█ ': '▀',
        ' █': ' ',
        '  ': ' '
      };

      var ascii = '';
      for (y = 0; y < size; y += 2) {
        r1 = Math.floor((y - min) / cellSize);
        r2 = Math.floor((y + 1 - min) / cellSize);
        for (x = 0; x < size; x += 1) {
          p = '█';

          if (min <= x && x < max && min <= y && y < max && _this.isDark(r1, Math.floor((x - min) / cellSize))) {
            p = ' ';
          }

          if (min <= x && x < max && min <= y+1 && y+1 < max && _this.isDark(r2, Math.floor((x - min) / cellSize))) {
            p += ' ';
          }
          else {
            p += '█';
          }

          // Output 2 characters per pixel, to create full square. 1 character per pixels gives only half width of square.
          ascii += (margin < 1 && y+1 >= max) ? blocksLastLineNoMargin[p] : blocks[p];
        }

        ascii += '\n';
      }

      if (size % 2 && margin > 0) {
        return ascii.substring(0, ascii.length - size - 1) + Array(size+1).join('▀');
      }

      return ascii.substring(0, ascii.length-1);
    };

    _this.createASCII = function(cellSize, margin) {
      cellSize = cellSize || 1;

      if (cellSize < 2) {
        return _createHalfASCII(margin);
      }

      cellSize -= 1;
      margin = (typeof margin == 'undefined')? cellSize * 2 : margin;

      var size = _this.getModuleCount() * cellSize + margin * 2;
      var min = margin;
      var max = size - margin;

      var y, x, r, p;

      var white = Array(cellSize+1).join('██');
      var black = Array(cellSize+1).join('  ');

      var ascii = '';
      var line = '';
      for (y = 0; y < size; y += 1) {
        r = Math.floor( (y - min) / cellSize);
        line = '';
        for (x = 0; x < size; x += 1) {
          p = 1;

          if (min <= x && x < max && min <= y && y < max && _this.isDark(r, Math.floor((x - min) / cellSize))) {
            p = 0;
          }

          // Output 2 characters per pixel, to create full square. 1 character per pixels gives only half width of square.
          line += p ? white : black;
        }

        for (r = 0; r < cellSize; r += 1) {
          ascii += line + '\n';
        }
      }

      return ascii.substring(0, ascii.length-1);
    };

    _this.renderTo2dContext = function(context, cellSize) {
      cellSize = cellSize || 2;
      var length = _this.getModuleCount();
      for (var row = 0; row < length; row++) {
        for (var col = 0; col < length; col++) {
          context.fillStyle = _this.isDark(row, col) ? 'black' : 'white';
          context.fillRect(row * cellSize, col * cellSize, cellSize, cellSize);
        }
      }
    }

    return _this;
  };

  //---------------------------------------------------------------------
  // qrcode.stringToBytes
  //---------------------------------------------------------------------

  qrcode.stringToBytesFuncs = {
    'default' : function(s) {
      var bytes = [];
      for (var i = 0; i < s.length; i += 1) {
        var c = s.charCodeAt(i);
        bytes.push(c & 0xff);
      }
      return bytes;
    }
  };

  qrcode.stringToBytes = qrcode.stringToBytesFuncs['default'];

  //---------------------------------------------------------------------
  // qrcode.createStringToBytes
  //---------------------------------------------------------------------

  /**
   * @param unicodeData base64 string of byte array.
   * [16bit Unicode],[16bit Bytes], ...
   * @param numChars
   */
  qrcode.createStringToBytes = function(unicodeData, numChars) {

    // create conversion map.

    var unicodeMap = function() {

      var bin = base64DecodeInputStream(unicodeData);
      var read = function() {
        var b = bin.read();
        if (b == -1) throw 'eof';
        return b;
      };

      var count = 0;
      var unicodeMap = {};
      while (true) {
        var b0 = bin.read();
        if (b0 == -1) break;
        var b1 = read();
        var b2 = read();
        var b3 = read();
        var k = String.fromCharCode( (b0 << 8) | b1);
        var v = (b2 << 8) | b3;
        unicodeMap[k] = v;
        count += 1;
      }
      if (count != numChars) {
        throw count + ' != ' + numChars;
      }

      return unicodeMap;
    }();

    var unknownChar = '?'.charCodeAt(0);

    return function(s) {
      var bytes = [];
      for (var i = 0; i < s.length; i += 1) {
        var c = s.charCodeAt(i);
        if (c < 128) {
          bytes.push(c);
        } else {
          var b = unicodeMap[s.charAt(i)];
          if (typeof b == 'number') {
            if ( (b & 0xff) == b) {
              // 1byte
              bytes.push(b);
            } else {
              // 2bytes
              bytes.push(b >>> 8);
              bytes.push(b & 0xff);
            }
          } else {
            bytes.push(unknownChar);
          }
        }
      }
      return bytes;
    };
  };

  //---------------------------------------------------------------------
  // QRMode
  //---------------------------------------------------------------------

  var QRMode = {
    MODE_NUMBER :    1 << 0,
    MODE_ALPHA_NUM : 1 << 1,
    MODE_8BIT_BYTE : 1 << 2,
    MODE_KANJI :     1 << 3
  };

  //---------------------------------------------------------------------
  // QRErrorCorrectionLevel
  //---------------------------------------------------------------------

  var QRErrorCorrectionLevel = {
    L : 1,
    M : 0,
    Q : 3,
    H : 2
  };

  //---------------------------------------------------------------------
  // QRMaskPattern
  //---------------------------------------------------------------------

  var QRMaskPattern = {
    PATTERN000 : 0,
    PATTERN001 : 1,
    PATTERN010 : 2,
    PATTERN011 : 3,
    PATTERN100 : 4,
    PATTERN101 : 5,
    PATTERN110 : 6,
    PATTERN111 : 7
  };

  //---------------------------------------------------------------------
  // QRUtil
  //---------------------------------------------------------------------

  var QRUtil = function() {

    var PATTERN_POSITION_TABLE = [
      [],
      [6, 18],
      [6, 22],
      [6, 26],
      [6, 30],
      [6, 34],
      [6, 22, 38],
      [6, 24, 42],
      [6, 26, 46],
      [6, 28, 50],
      [6, 30, 54],
      [6, 32, 58],
      [6, 34, 62],
      [6, 26, 46, 66],
      [6, 26, 48, 70],
      [6, 26, 50, 74],
      [6, 30, 54, 78],
      [6, 30, 56, 82],
      [6, 30, 58, 86],
      [6, 34, 62, 90],
      [6, 28, 50, 72, 94],
      [6, 26, 50, 74, 98],
      [6, 30, 54, 78, 102],
      [6, 28, 54, 80, 106],
      [6, 32, 58, 84, 110],
      [6, 30, 58, 86, 114],
      [6, 34, 62, 90, 118],
      [6, 26, 50, 74, 98, 122],
      [6, 30, 54, 78, 102, 126],
      [6, 26, 52, 78, 104, 130],
      [6, 30, 56, 82, 108, 134],
      [6, 34, 60, 86, 112, 138],
      [6, 30, 58, 86, 114, 142],
      [6, 34, 62, 90, 118, 146],
      [6, 30, 54, 78, 102, 126, 150],
      [6, 24, 50, 76, 102, 128, 154],
      [6, 28, 54, 80, 106, 132, 158],
      [6, 32, 58, 84, 110, 136, 162],
      [6, 26, 54, 82, 110, 138, 166],
      [6, 30, 58, 86, 114, 142, 170]
    ];
    var G15 = (1 << 10) | (1 << 8) | (1 << 5) | (1 << 4) | (1 << 2) | (1 << 1) | (1 << 0);
    var G18 = (1 << 12) | (1 << 11) | (1 << 10) | (1 << 9) | (1 << 8) | (1 << 5) | (1 << 2) | (1 << 0);
    var G15_MASK = (1 << 14) | (1 << 12) | (1 << 10) | (1 << 4) | (1 << 1);

    var _this = {};

    var getBCHDigit = function(data) {
      var digit = 0;
      while (data != 0) {
        digit += 1;
        data >>>= 1;
      }
      return digit;
    };

    _this.getBCHTypeInfo = function(data) {
      var d = data << 10;
      while (getBCHDigit(d) - getBCHDigit(G15) >= 0) {
        d ^= (G15 << (getBCHDigit(d) - getBCHDigit(G15) ) );
      }
      return ( (data << 10) | d) ^ G15_MASK;
    };

    _this.getBCHTypeNumber = function(data) {
      var d = data << 12;
      while (getBCHDigit(d) - getBCHDigit(G18) >= 0) {
        d ^= (G18 << (getBCHDigit(d) - getBCHDigit(G18) ) );
      }
      return (data << 12) | d;
    };

    _this.getPatternPosition = function(typeNumber) {
      return PATTERN_POSITION_TABLE[typeNumber - 1];
    };

    _this.getMaskFunction = function(maskPattern) {

      switch (maskPattern) {

      case QRMaskPattern.PATTERN000 :
        return function(i, j) { return (i + j) % 2 == 0; };
      case QRMaskPattern.PATTERN001 :
        return function(i, j) { return i % 2 == 0; };
      case QRMaskPattern.PATTERN010 :
        return function(i, j) { return j % 3 == 0; };
      case QRMaskPattern.PATTERN011 :
        return function(i, j) { return (i + j) % 3 == 0; };
      case QRMaskPattern.PATTERN100 :
        return function(i, j) { return (Math.floor(i / 2) + Math.floor(j / 3) ) % 2 == 0; };
      case QRMaskPattern.PATTERN101 :
        return function(i, j) { return (i * j) % 2 + (i * j) % 3 == 0; };
      case QRMaskPattern.PATTERN110 :
        return function(i, j) { return ( (i * j) % 2 + (i * j) % 3) % 2 == 0; };
      case QRMaskPattern.PATTERN111 :
        return function(i, j) { return ( (i * j) % 3 + (i + j) % 2) % 2 == 0; };

      default :
        throw 'bad maskPattern:' + maskPattern;
      }
    };

    _this.getErrorCorrectPolynomial = function(errorCorrectLength) {
      var a = qrPolynomial([1], 0);
      for (var i = 0; i < errorCorrectLength; i += 1) {
        a = a.multiply(qrPolynomial([1, QRMath.gexp(i)], 0) );
      }
      return a;
    };

    _this.getLengthInBits = function(mode, type) {

      if (1 <= type && type < 10) {

        // 1 - 9

        switch(mode) {
        case QRMode.MODE_NUMBER    : return 10;
        case QRMode.MODE_ALPHA_NUM : return 9;
        case QRMode.MODE_8BIT_BYTE : return 8;
        case QRMode.MODE_KANJI     : return 8;
        default :
          throw 'mode:' + mode;
        }

      } else if (type < 27) {

        // 10 - 26

        switch(mode) {
        case QRMode.MODE_NUMBER    : return 12;
        case QRMode.MODE_ALPHA_NUM : return 11;
        case QRMode.MODE_8BIT_BYTE : return 16;
        case QRMode.MODE_KANJI     : return 10;
        default :
          throw 'mode:' + mode;
        }

      } else if (type < 41) {

        // 27 - 40

        switch(mode) {
        case QRMode.MODE_NUMBER    : return 14;
        case QRMode.MODE_ALPHA_NUM : return 13;
        case QRMode.MODE_8BIT_BYTE : return 16;
        case QRMode.MODE_KANJI     : return 12;
        default :
          throw 'mode:' + mode;
        }

      } else {
        throw 'type:' + type;
      }
    };

    _this.getLostPoint = function(qrcode) {

      var moduleCount = qrcode.getModuleCount();

      var lostPoint = 0;

      // LEVEL1

      for (var row = 0; row < moduleCount; row += 1) {
        for (var col = 0; col < moduleCount; col += 1) {

          var sameCount = 0;
          var dark = qrcode.isDark(row, col);

          for (var r = -1; r <= 1; r += 1) {

            if (row + r < 0 || moduleCount <= row + r) {
              continue;
            }

            for (var c = -1; c <= 1; c += 1) {

              if (col + c < 0 || moduleCount <= col + c) {
                continue;
              }

              if (r == 0 && c == 0) {
                continue;
              }

              if (dark == qrcode.isDark(row + r, col + c) ) {
                sameCount += 1;
              }
            }
          }

          if (sameCount > 5) {
            lostPoint += (3 + sameCount - 5);
          }
        }
      };

      // LEVEL2

      for (var row = 0; row < moduleCount - 1; row += 1) {
        for (var col = 0; col < moduleCount - 1; col += 1) {
          var count = 0;
          if (qrcode.isDark(row, col) ) count += 1;
          if (qrcode.isDark(row + 1, col) ) count += 1;
          if (qrcode.isDark(row, col + 1) ) count += 1;
          if (qrcode.isDark(row + 1, col + 1) ) count += 1;
          if (count == 0 || count == 4) {
            lostPoint += 3;
          }
        }
      }

      // LEVEL3

      for (var row = 0; row < moduleCount; row += 1) {
        for (var col = 0; col < moduleCount - 6; col += 1) {
          if (qrcode.isDark(row, col)
              && !qrcode.isDark(row, col + 1)
              &&  qrcode.isDark(row, col + 2)
              &&  qrcode.isDark(row, col + 3)
              &&  qrcode.isDark(row, col + 4)
              && !qrcode.isDark(row, col + 5)
              &&  qrcode.isDark(row, col + 6) ) {
            lostPoint += 40;
          }
        }
      }

      for (var col = 0; col < moduleCount; col += 1) {
        for (var row = 0; row < moduleCount - 6; row += 1) {
          if (qrcode.isDark(row, col)
              && !qrcode.isDark(row + 1, col)
              &&  qrcode.isDark(row + 2, col)
              &&  qrcode.isDark(row + 3, col)
              &&  qrcode.isDark(row + 4, col)
              && !qrcode.isDark(row + 5, col)
              &&  qrcode.isDark(row + 6, col) ) {
            lostPoint += 40;
          }
        }
      }

      // LEVEL4

      var darkCount = 0;

      for (var col = 0; col < moduleCount; col += 1) {
        for (var row = 0; row < moduleCount; row += 1) {
          if (qrcode.isDark(row, col) ) {
            darkCount += 1;
          }
        }
      }

      var ratio = Math.abs(100 * darkCount / moduleCount / moduleCount - 50) / 5;
      lostPoint += ratio * 10;

      return lostPoint;
    };

    return _this;
  }();

  //---------------------------------------------------------------------
  // QRMath
  //---------------------------------------------------------------------

  var QRMath = function() {

    var EXP_TABLE = new Array(256);
    var LOG_TABLE = new Array(256);

    // initialize tables
    for (var i = 0; i < 8; i += 1) {
      EXP_TABLE[i] = 1 << i;
    }
    for (var i = 8; i < 256; i += 1) {
      EXP_TABLE[i] = EXP_TABLE[i - 4]
        ^ EXP_TABLE[i - 5]
        ^ EXP_TABLE[i - 6]
        ^ EXP_TABLE[i - 8];
    }
    for (var i = 0; i < 255; i += 1) {
      LOG_TABLE[EXP_TABLE[i] ] = i;
    }

    var _this = {};

    _this.glog = function(n) {

      if (n < 1) {
        throw 'glog(' + n + ')';
      }

      return LOG_TABLE[n];
    };

    _this.gexp = function(n) {

      while (n < 0) {
        n += 255;
      }

      while (n >= 256) {
        n -= 255;
      }

      return EXP_TABLE[n];
    };

    return _this;
  }();

  //---------------------------------------------------------------------
  // qrPolynomial
  //---------------------------------------------------------------------

  function qrPolynomial(num, shift) {

    if (typeof num.length == 'undefined') {
      throw num.length + '/' + shift;
    }

    var _num = function() {
      var offset = 0;
      while (offset < num.length && num[offset] == 0) {
        offset += 1;
      }
      var _num = new Array(num.length - offset + shift);
      for (var i = 0; i < num.length - offset; i += 1) {
        _num[i] = num[i + offset];
      }
      return _num;
    }();

    var _this = {};

    _this.getAt = function(index) {
      return _num[index];
    };

    _this.getLength = function() {
      return _num.length;
    };

    _this.multiply = function(e) {

      var num = new Array(_this.getLength() + e.getLength() - 1);

      for (var i = 0; i < _this.getLength(); i += 1) {
        for (var j = 0; j < e.getLength(); j += 1) {
          num[i + j] ^= QRMath.gexp(QRMath.glog(_this.getAt(i) ) + QRMath.glog(e.getAt(j) ) );
        }
      }

      return qrPolynomial(num, 0);
    };

    _this.mod = function(e) {

      if (_this.getLength() - e.getLength() < 0) {
        return _this;
      }

      var ratio = QRMath.glog(_this.getAt(0) ) - QRMath.glog(e.getAt(0) );

      var num = new Array(_this.getLength() );
      for (var i = 0; i < _this.getLength(); i += 1) {
        num[i] = _this.getAt(i);
      }

      for (var i = 0; i < e.getLength(); i += 1) {
        num[i] ^= QRMath.gexp(QRMath.glog(e.getAt(i) ) + ratio);
      }

      // recursive call
      return qrPolynomial(num, 0).mod(e);
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // QRRSBlock
  //---------------------------------------------------------------------

  var QRRSBlock = function() {

    var RS_BLOCK_TABLE = [

      // L
      // M
      // Q
      // H

      // 1
      [1, 26, 19],
      [1, 26, 16],
      [1, 26, 13],
      [1, 26, 9],

      // 2
      [1, 44, 34],
      [1, 44, 28],
      [1, 44, 22],
      [1, 44, 16],

      // 3
      [1, 70, 55],
      [1, 70, 44],
      [2, 35, 17],
      [2, 35, 13],

      // 4
      [1, 100, 80],
      [2, 50, 32],
      [2, 50, 24],
      [4, 25, 9],

      // 5
      [1, 134, 108],
      [2, 67, 43],
      [2, 33, 15, 2, 34, 16],
      [2, 33, 11, 2, 34, 12],

      // 6
      [2, 86, 68],
      [4, 43, 27],
      [4, 43, 19],
      [4, 43, 15],

      // 7
      [2, 98, 78],
      [4, 49, 31],
      [2, 32, 14, 4, 33, 15],
      [4, 39, 13, 1, 40, 14],

      // 8
      [2, 121, 97],
      [2, 60, 38, 2, 61, 39],
      [4, 40, 18, 2, 41, 19],
      [4, 40, 14, 2, 41, 15],

      // 9
      [2, 146, 116],
      [3, 58, 36, 2, 59, 37],
      [4, 36, 16, 4, 37, 17],
      [4, 36, 12, 4, 37, 13],

      // 10
      [2, 86, 68, 2, 87, 69],
      [4, 69, 43, 1, 70, 44],
      [6, 43, 19, 2, 44, 20],
      [6, 43, 15, 2, 44, 16],

      // 11
      [4, 101, 81],
      [1, 80, 50, 4, 81, 51],
      [4, 50, 22, 4, 51, 23],
      [3, 36, 12, 8, 37, 13],

      // 12
      [2, 116, 92, 2, 117, 93],
      [6, 58, 36, 2, 59, 37],
      [4, 46, 20, 6, 47, 21],
      [7, 42, 14, 4, 43, 15],

      // 13
      [4, 133, 107],
      [8, 59, 37, 1, 60, 38],
      [8, 44, 20, 4, 45, 21],
      [12, 33, 11, 4, 34, 12],

      // 14
      [3, 145, 115, 1, 146, 116],
      [4, 64, 40, 5, 65, 41],
      [11, 36, 16, 5, 37, 17],
      [11, 36, 12, 5, 37, 13],

      // 15
      [5, 109, 87, 1, 110, 88],
      [5, 65, 41, 5, 66, 42],
      [5, 54, 24, 7, 55, 25],
      [11, 36, 12, 7, 37, 13],

      // 16
      [5, 122, 98, 1, 123, 99],
      [7, 73, 45, 3, 74, 46],
      [15, 43, 19, 2, 44, 20],
      [3, 45, 15, 13, 46, 16],

      // 17
      [1, 135, 107, 5, 136, 108],
      [10, 74, 46, 1, 75, 47],
      [1, 50, 22, 15, 51, 23],
      [2, 42, 14, 17, 43, 15],

      // 18
      [5, 150, 120, 1, 151, 121],
      [9, 69, 43, 4, 70, 44],
      [17, 50, 22, 1, 51, 23],
      [2, 42, 14, 19, 43, 15],

      // 19
      [3, 141, 113, 4, 142, 114],
      [3, 70, 44, 11, 71, 45],
      [17, 47, 21, 4, 48, 22],
      [9, 39, 13, 16, 40, 14],

      // 20
      [3, 135, 107, 5, 136, 108],
      [3, 67, 41, 13, 68, 42],
      [15, 54, 24, 5, 55, 25],
      [15, 43, 15, 10, 44, 16],

      // 21
      [4, 144, 116, 4, 145, 117],
      [17, 68, 42],
      [17, 50, 22, 6, 51, 23],
      [19, 46, 16, 6, 47, 17],

      // 22
      [2, 139, 111, 7, 140, 112],
      [17, 74, 46],
      [7, 54, 24, 16, 55, 25],
      [34, 37, 13],

      // 23
      [4, 151, 121, 5, 152, 122],
      [4, 75, 47, 14, 76, 48],
      [11, 54, 24, 14, 55, 25],
      [16, 45, 15, 14, 46, 16],

      // 24
      [6, 147, 117, 4, 148, 118],
      [6, 73, 45, 14, 74, 46],
      [11, 54, 24, 16, 55, 25],
      [30, 46, 16, 2, 47, 17],

      // 25
      [8, 132, 106, 4, 133, 107],
      [8, 75, 47, 13, 76, 48],
      [7, 54, 24, 22, 55, 25],
      [22, 45, 15, 13, 46, 16],

      // 26
      [10, 142, 114, 2, 143, 115],
      [19, 74, 46, 4, 75, 47],
      [28, 50, 22, 6, 51, 23],
      [33, 46, 16, 4, 47, 17],

      // 27
      [8, 152, 122, 4, 153, 123],
      [22, 73, 45, 3, 74, 46],
      [8, 53, 23, 26, 54, 24],
      [12, 45, 15, 28, 46, 16],

      // 28
      [3, 147, 117, 10, 148, 118],
      [3, 73, 45, 23, 74, 46],
      [4, 54, 24, 31, 55, 25],
      [11, 45, 15, 31, 46, 16],

      // 29
      [7, 146, 116, 7, 147, 117],
      [21, 73, 45, 7, 74, 46],
      [1, 53, 23, 37, 54, 24],
      [19, 45, 15, 26, 46, 16],

      // 30
      [5, 145, 115, 10, 146, 116],
      [19, 75, 47, 10, 76, 48],
      [15, 54, 24, 25, 55, 25],
      [23, 45, 15, 25, 46, 16],

      // 31
      [13, 145, 115, 3, 146, 116],
      [2, 74, 46, 29, 75, 47],
      [42, 54, 24, 1, 55, 25],
      [23, 45, 15, 28, 46, 16],

      // 32
      [17, 145, 115],
      [10, 74, 46, 23, 75, 47],
      [10, 54, 24, 35, 55, 25],
      [19, 45, 15, 35, 46, 16],

      // 33
      [17, 145, 115, 1, 146, 116],
      [14, 74, 46, 21, 75, 47],
      [29, 54, 24, 19, 55, 25],
      [11, 45, 15, 46, 46, 16],

      // 34
      [13, 145, 115, 6, 146, 116],
      [14, 74, 46, 23, 75, 47],
      [44, 54, 24, 7, 55, 25],
      [59, 46, 16, 1, 47, 17],

      // 35
      [12, 151, 121, 7, 152, 122],
      [12, 75, 47, 26, 76, 48],
      [39, 54, 24, 14, 55, 25],
      [22, 45, 15, 41, 46, 16],

      // 36
      [6, 151, 121, 14, 152, 122],
      [6, 75, 47, 34, 76, 48],
      [46, 54, 24, 10, 55, 25],
      [2, 45, 15, 64, 46, 16],

      // 37
      [17, 152, 122, 4, 153, 123],
      [29, 74, 46, 14, 75, 47],
      [49, 54, 24, 10, 55, 25],
      [24, 45, 15, 46, 46, 16],

      // 38
      [4, 152, 122, 18, 153, 123],
      [13, 74, 46, 32, 75, 47],
      [48, 54, 24, 14, 55, 25],
      [42, 45, 15, 32, 46, 16],

      // 39
      [20, 147, 117, 4, 148, 118],
      [40, 75, 47, 7, 76, 48],
      [43, 54, 24, 22, 55, 25],
      [10, 45, 15, 67, 46, 16],

      // 40
      [19, 148, 118, 6, 149, 119],
      [18, 75, 47, 31, 76, 48],
      [34, 54, 24, 34, 55, 25],
      [20, 45, 15, 61, 46, 16]
    ];

    var qrRSBlock = function(totalCount, dataCount) {
      var _this = {};
      _this.totalCount = totalCount;
      _this.dataCount = dataCount;
      return _this;
    };

    var _this = {};

    var getRsBlockTable = function(typeNumber, errorCorrectionLevel) {

      switch(errorCorrectionLevel) {
      case QRErrorCorrectionLevel.L :
        return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 0];
      case QRErrorCorrectionLevel.M :
        return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 1];
      case QRErrorCorrectionLevel.Q :
        return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 2];
      case QRErrorCorrectionLevel.H :
        return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 3];
      default :
        return undefined;
      }
    };

    _this.getRSBlocks = function(typeNumber, errorCorrectionLevel) {

      var rsBlock = getRsBlockTable(typeNumber, errorCorrectionLevel);

      if (typeof rsBlock == 'undefined') {
        throw 'bad rs block @ typeNumber:' + typeNumber +
            '/errorCorrectionLevel:' + errorCorrectionLevel;
      }

      var length = rsBlock.length / 3;

      var list = [];

      for (var i = 0; i < length; i += 1) {

        var count = rsBlock[i * 3 + 0];
        var totalCount = rsBlock[i * 3 + 1];
        var dataCount = rsBlock[i * 3 + 2];

        for (var j = 0; j < count; j += 1) {
          list.push(qrRSBlock(totalCount, dataCount) );
        }
      }

      return list;
    };

    return _this;
  }();

  //---------------------------------------------------------------------
  // qrBitBuffer
  //---------------------------------------------------------------------

  var qrBitBuffer = function() {

    var _buffer = [];
    var _length = 0;

    var _this = {};

    _this.getBuffer = function() {
      return _buffer;
    };

    _this.getAt = function(index) {
      var bufIndex = Math.floor(index / 8);
      return ( (_buffer[bufIndex] >>> (7 - index % 8) ) & 1) == 1;
    };

    _this.put = function(num, length) {
      for (var i = 0; i < length; i += 1) {
        _this.putBit( ( (num >>> (length - i - 1) ) & 1) == 1);
      }
    };

    _this.getLengthInBits = function() {
      return _length;
    };

    _this.putBit = function(bit) {

      var bufIndex = Math.floor(_length / 8);
      if (_buffer.length <= bufIndex) {
        _buffer.push(0);
      }

      if (bit) {
        _buffer[bufIndex] |= (0x80 >>> (_length % 8) );
      }

      _length += 1;
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // qrNumber
  //---------------------------------------------------------------------

  var qrNumber = function(data) {

    var _mode = QRMode.MODE_NUMBER;
    var _data = data;

    var _this = {};

    _this.getMode = function() {
      return _mode;
    };

    _this.getLength = function(buffer) {
      return _data.length;
    };

    _this.write = function(buffer) {

      var data = _data;

      var i = 0;

      while (i + 2 < data.length) {
        buffer.put(strToNum(data.substring(i, i + 3) ), 10);
        i += 3;
      }

      if (i < data.length) {
        if (data.length - i == 1) {
          buffer.put(strToNum(data.substring(i, i + 1) ), 4);
        } else if (data.length - i == 2) {
          buffer.put(strToNum(data.substring(i, i + 2) ), 7);
        }
      }
    };

    var strToNum = function(s) {
      var num = 0;
      for (var i = 0; i < s.length; i += 1) {
        num = num * 10 + chatToNum(s.charAt(i) );
      }
      return num;
    };

    var chatToNum = function(c) {
      if ('0' <= c && c <= '9') {
        return c.charCodeAt(0) - '0'.charCodeAt(0);
      }
      throw 'illegal char :' + c;
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // qrAlphaNum
  //---------------------------------------------------------------------

  var qrAlphaNum = function(data) {

    var _mode = QRMode.MODE_ALPHA_NUM;
    var _data = data;

    var _this = {};

    _this.getMode = function() {
      return _mode;
    };

    _this.getLength = function(buffer) {
      return _data.length;
    };

    _this.write = function(buffer) {

      var s = _data;

      var i = 0;

      while (i + 1 < s.length) {
        buffer.put(
          getCode(s.charAt(i) ) * 45 +
          getCode(s.charAt(i + 1) ), 11);
        i += 2;
      }

      if (i < s.length) {
        buffer.put(getCode(s.charAt(i) ), 6);
      }
    };

    var getCode = function(c) {

      if ('0' <= c && c <= '9') {
        return c.charCodeAt(0) - '0'.charCodeAt(0);
      } else if ('A' <= c && c <= 'Z') {
        return c.charCodeAt(0) - 'A'.charCodeAt(0) + 10;
      } else {
        switch (c) {
        case ' ' : return 36;
        case '$' : return 37;
        case '%' : return 38;
        case '*' : return 39;
        case '+' : return 40;
        case '-' : return 41;
        case '.' : return 42;
        case '/' : return 43;
        case ':' : return 44;
        default :
          throw 'illegal char :' + c;
        }
      }
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // qr8BitByte
  //---------------------------------------------------------------------

  var qr8BitByte = function(data) {

    var _mode = QRMode.MODE_8BIT_BYTE;
    var _data = data;
    var _bytes = qrcode.stringToBytes(data);

    var _this = {};

    _this.getMode = function() {
      return _mode;
    };

    _this.getLength = function(buffer) {
      return _bytes.length;
    };

    _this.write = function(buffer) {
      for (var i = 0; i < _bytes.length; i += 1) {
        buffer.put(_bytes[i], 8);
      }
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // qrKanji
  //---------------------------------------------------------------------

  var qrKanji = function(data) {

    var _mode = QRMode.MODE_KANJI;
    var _data = data;

    var stringToBytes = qrcode.stringToBytesFuncs['SJIS'];
    if (!stringToBytes) {
      throw 'sjis not supported.';
    }
    !function(c, code) {
      // self test for sjis support.
      var test = stringToBytes(c);
      if (test.length != 2 || ( (test[0] << 8) | test[1]) != code) {
        throw 'sjis not supported.';
      }
    }('\u53cb', 0x9746);

    var _bytes = stringToBytes(data);

    var _this = {};

    _this.getMode = function() {
      return _mode;
    };

    _this.getLength = function(buffer) {
      return ~~(_bytes.length / 2);
    };

    _this.write = function(buffer) {

      var data = _bytes;

      var i = 0;

      while (i + 1 < data.length) {

        var c = ( (0xff & data[i]) << 8) | (0xff & data[i + 1]);

        if (0x8140 <= c && c <= 0x9FFC) {
          c -= 0x8140;
        } else if (0xE040 <= c && c <= 0xEBBF) {
          c -= 0xC140;
        } else {
          throw 'illegal char at ' + (i + 1) + '/' + c;
        }

        c = ( (c >>> 8) & 0xff) * 0xC0 + (c & 0xff);

        buffer.put(c, 13);

        i += 2;
      }

      if (i < data.length) {
        throw 'illegal char at ' + (i + 1);
      }
    };

    return _this;
  };

  //=====================================================================
  // GIF Support etc.
  //

  //---------------------------------------------------------------------
  // byteArrayOutputStream
  //---------------------------------------------------------------------

  var byteArrayOutputStream = function() {

    var _bytes = [];

    var _this = {};

    _this.writeByte = function(b) {
      _bytes.push(b & 0xff);
    };

    _this.writeShort = function(i) {
      _this.writeByte(i);
      _this.writeByte(i >>> 8);
    };

    _this.writeBytes = function(b, off, len) {
      off = off || 0;
      len = len || b.length;
      for (var i = 0; i < len; i += 1) {
        _this.writeByte(b[i + off]);
      }
    };

    _this.writeString = function(s) {
      for (var i = 0; i < s.length; i += 1) {
        _this.writeByte(s.charCodeAt(i) );
      }
    };

    _this.toByteArray = function() {
      return _bytes;
    };

    _this.toString = function() {
      var s = '';
      s += '[';
      for (var i = 0; i < _bytes.length; i += 1) {
        if (i > 0) {
          s += ',';
        }
        s += _bytes[i];
      }
      s += ']';
      return s;
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // base64EncodeOutputStream
  //---------------------------------------------------------------------

  var base64EncodeOutputStream = function() {

    var _buffer = 0;
    var _buflen = 0;
    var _length = 0;
    var _base64 = '';

    var _this = {};

    var writeEncoded = function(b) {
      _base64 += String.fromCharCode(encode(b & 0x3f) );
    };

    var encode = function(n) {
      if (n < 0) {
        // error.
      } else if (n < 26) {
        return 0x41 + n;
      } else if (n < 52) {
        return 0x61 + (n - 26);
      } else if (n < 62) {
        return 0x30 + (n - 52);
      } else if (n == 62) {
        return 0x2b;
      } else if (n == 63) {
        return 0x2f;
      }
      throw 'n:' + n;
    };

    _this.writeByte = function(n) {

      _buffer = (_buffer << 8) | (n & 0xff);
      _buflen += 8;
      _length += 1;

      while (_buflen >= 6) {
        writeEncoded(_buffer >>> (_buflen - 6) );
        _buflen -= 6;
      }
    };

    _this.flush = function() {

      if (_buflen > 0) {
        writeEncoded(_buffer << (6 - _buflen) );
        _buffer = 0;
        _buflen = 0;
      }

      if (_length % 3 != 0) {
        // padding
        var padlen = 3 - _length % 3;
        for (var i = 0; i < padlen; i += 1) {
          _base64 += '=';
        }
      }
    };

    _this.toString = function() {
      return _base64;
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // base64DecodeInputStream
  //---------------------------------------------------------------------

  var base64DecodeInputStream = function(str) {

    var _str = str;
    var _pos = 0;
    var _buffer = 0;
    var _buflen = 0;

    var _this = {};

    _this.read = function() {

      while (_buflen < 8) {

        if (_pos >= _str.length) {
          if (_buflen == 0) {
            return -1;
          }
          throw 'unexpected end of file./' + _buflen;
        }

        var c = _str.charAt(_pos);
        _pos += 1;

        if (c == '=') {
          _buflen = 0;
          return -1;
        } else if (c.match(/^\s$/) ) {
          // ignore if whitespace.
          continue;
        }

        _buffer = (_buffer << 6) | decode(c.charCodeAt(0) );
        _buflen += 6;
      }

      var n = (_buffer >>> (_buflen - 8) ) & 0xff;
      _buflen -= 8;
      return n;
    };

    var decode = function(c) {
      if (0x41 <= c && c <= 0x5a) {
        return c - 0x41;
      } else if (0x61 <= c && c <= 0x7a) {
        return c - 0x61 + 26;
      } else if (0x30 <= c && c <= 0x39) {
        return c - 0x30 + 52;
      } else if (c == 0x2b) {
        return 62;
      } else if (c == 0x2f) {
        return 63;
      } else {
        throw 'c:' + c;
      }
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // gifImage (B/W)
  //---------------------------------------------------------------------

  var gifImage = function(width, height) {

    var _width = width;
    var _height = height;
    var _data = new Array(width * height);

    var _this = {};

    _this.setPixel = function(x, y, pixel) {
      _data[y * _width + x] = pixel;
    };

    _this.write = function(out) {

      //---------------------------------
      // GIF Signature

      out.writeString('GIF87a');

      //---------------------------------
      // Screen Descriptor

      out.writeShort(_width);
      out.writeShort(_height);

      out.writeByte(0x80); // 2bit
      out.writeByte(0);
      out.writeByte(0);

      //---------------------------------
      // Global Color Map

      // black
      out.writeByte(0x00);
      out.writeByte(0x00);
      out.writeByte(0x00);

      // white
      out.writeByte(0xff);
      out.writeByte(0xff);
      out.writeByte(0xff);

      //---------------------------------
      // Image Descriptor

      out.writeString(',');
      out.writeShort(0);
      out.writeShort(0);
      out.writeShort(_width);
      out.writeShort(_height);
      out.writeByte(0);

      //---------------------------------
      // Local Color Map

      //---------------------------------
      // Raster Data

      var lzwMinCodeSize = 2;
      var raster = getLZWRaster(lzwMinCodeSize);

      out.writeByte(lzwMinCodeSize);

      var offset = 0;

      while (raster.length - offset > 255) {
        out.writeByte(255);
        out.writeBytes(raster, offset, 255);
        offset += 255;
      }

      out.writeByte(raster.length - offset);
      out.writeBytes(raster, offset, raster.length - offset);
      out.writeByte(0x00);

      //---------------------------------
      // GIF Terminator
      out.writeString(';');
    };

    var bitOutputStream = function(out) {

      var _out = out;
      var _bitLength = 0;
      var _bitBuffer = 0;

      var _this = {};

      _this.write = function(data, length) {

        if ( (data >>> length) != 0) {
          throw 'length over';
        }

        while (_bitLength + length >= 8) {
          _out.writeByte(0xff & ( (data << _bitLength) | _bitBuffer) );
          length -= (8 - _bitLength);
          data >>>= (8 - _bitLength);
          _bitBuffer = 0;
          _bitLength = 0;
        }

        _bitBuffer = (data << _bitLength) | _bitBuffer;
        _bitLength = _bitLength + length;
      };

      _this.flush = function() {
        if (_bitLength > 0) {
          _out.writeByte(_bitBuffer);
        }
      };

      return _this;
    };

    var getLZWRaster = function(lzwMinCodeSize) {

      var clearCode = 1 << lzwMinCodeSize;
      var endCode = (1 << lzwMinCodeSize) + 1;
      var bitLength = lzwMinCodeSize + 1;

      // Setup LZWTable
      var table = lzwTable();

      for (var i = 0; i < clearCode; i += 1) {
        table.add(String.fromCharCode(i) );
      }
      table.add(String.fromCharCode(clearCode) );
      table.add(String.fromCharCode(endCode) );

      var byteOut = byteArrayOutputStream();
      var bitOut = bitOutputStream(byteOut);

      // clear code
      bitOut.write(clearCode, bitLength);

      var dataIndex = 0;

      var s = String.fromCharCode(_data[dataIndex]);
      dataIndex += 1;

      while (dataIndex < _data.length) {

        var c = String.fromCharCode(_data[dataIndex]);
        dataIndex += 1;

        if (table.contains(s + c) ) {

          s = s + c;

        } else {

          bitOut.write(table.indexOf(s), bitLength);

          if (table.size() < 0xfff) {

            if (table.size() == (1 << bitLength) ) {
              bitLength += 1;
            }

            table.add(s + c);
          }

          s = c;
        }
      }

      bitOut.write(table.indexOf(s), bitLength);

      // end code
      bitOut.write(endCode, bitLength);

      bitOut.flush();

      return byteOut.toByteArray();
    };

    var lzwTable = function() {

      var _map = {};
      var _size = 0;

      var _this = {};

      _this.add = function(key) {
        if (_this.contains(key) ) {
          throw 'dup key:' + key;
        }
        _map[key] = _size;
        _size += 1;
      };

      _this.size = function() {
        return _size;
      };

      _this.indexOf = function(key) {
        return _map[key];
      };

      _this.contains = function(key) {
        return typeof _map[key] != 'undefined';
      };

      return _this;
    };

    return _this;
  };

  var createDataURL = function(width, height, getPixel) {
    var gif = gifImage(width, height);
    for (var y = 0; y < height; y += 1) {
      for (var x = 0; x < width; x += 1) {
        gif.setPixel(x, y, getPixel(x, y) );
      }
    }

    var b = byteArrayOutputStream();
    gif.write(b);

    var base64 = base64EncodeOutputStream();
    var bytes = b.toByteArray();
    for (var i = 0; i < bytes.length; i += 1) {
      base64.writeByte(bytes[i]);
    }
    base64.flush();

    return 'data:image/gif;base64,' + base64;
  };

  //---------------------------------------------------------------------
  // returns qrcode function.

  return qrcode;
}();

// multibyte support
!function() {

  qrcode.stringToBytesFuncs['UTF-8'] = function(s) {
    // http://stackoverflow.com/questions/18729405/how-to-convert-utf8-string-to-byte-array
    function toUTF8Array(str) {
      var utf8 = [];
      for (var i=0; i < str.length; i++) {
        var charcode = str.charCodeAt(i);
        if (charcode < 0x80) utf8.push(charcode);
        else if (charcode < 0x800) {
          utf8.push(0xc0 | (charcode >> 6),
              0x80 | (charcode & 0x3f));
        }
        else if (charcode < 0xd800 || charcode >= 0xe000) {
          utf8.push(0xe0 | (charcode >> 12),
              0x80 | ((charcode>>6) & 0x3f),
              0x80 | (charcode & 0x3f));
        }
        // surrogate pair
        else {
          i++;
          // UTF-16 encodes 0x10000-0x10FFFF by
          // subtracting 0x10000 and splitting the
          // 20 bits of 0x0-0xFFFFF into two halves
          charcode = 0x10000 + (((charcode & 0x3ff)<<10)
            | (str.charCodeAt(i) & 0x3ff));
          utf8.push(0xf0 | (charcode >>18),
              0x80 | ((charcode>>12) & 0x3f),
              0x80 | ((charcode>>6) & 0x3f),
              0x80 | (charcode & 0x3f));
        }
      }
      return utf8;
    }
    return toUTF8Array(s);
  };

}();

(function (factory) {
  if (true) {
      !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
		__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
		(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
  } else {}
}(function () {
    return qrcode;
}));


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
/*!*************************!*\
  !*** ./src/js/share.js ***!
  \*************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var qrcode_generator__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! qrcode-generator */ "./node_modules/qrcode-generator/qrcode.js");
/* harmony import */ var qrcode_generator__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(qrcode_generator__WEBPACK_IMPORTED_MODULE_0__);
/**
 * special thanks to hexo-theme-yilia
 * https://github.com/litten/hexo-theme-yilia/blob/master/source-src/js/share.js
 */


function initQR(sURL) {
  var typeNumber = 0;
  var errorCorrectionLevel = 'L';
  var qr = qrcode_generator__WEBPACK_IMPORTED_MODULE_0___default()(typeNumber, errorCorrectionLevel);
  qr.addData(sURL);
  qr.make();
  document.getElementsByClassName('share-qrcode')[0].innerHTML = qr.createImgTag();
}

function generate(templateURL, param) {
  var shareURL = templateURL.replace(/<%-sURL%>/g, encodeURIComponent(param.sURL)).replace(/<%-sTitle%>/g, param.sTitle).replace(/<%-sDesc%>/g, param.sDesc).replace(/<%-sAuthor%>/g, param.sAuthor).replace(/<%-sImg%>/g, encodeURIComponent(param.sImg));
  window.open(shareURL);
}

function handleShareClick(type, param) {
  if (type === 'weibo') {
    generate('http://service.weibo.com/share/share.php?url=<%-sURL%>&title=<%-sTitle%>&pic=<%-sImg%>', param);
  } else if (type === 'qzone') {
    generate('http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url=<%-sURL%>&title=<%-sTitle%>&pics=<%-sImg%>&summary=<%-sDesc%>', param);
  } else if (type === 'facebook') {
    generate('https://www.facebook.com/sharer/sharer.php?u=<%-sURL%>', param);
  } else if (type === 'twitter') {
    generate('https://twitter.com/intent/tweet?text=<%-sTitle%>&url=<%-sURL%>&via=<%-sAuthor%>', param);
  } else if (type === 'qr') {// pre init qr
  }
}

function init() {
  var sURL = window.location.href;
  var sTitle = document.querySelector('title').innerHTML;
  var sImg = document.querySelector('.article-entry img') && document.querySelector('.article-entry img').getAttribute('src');
  sImg = window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port : '') + sImg;
  var sDesc = document.querySelector('.article-entry') && document.querySelector('.article-entry').innerText.substring(0, 30) + '...';
  var sAuthor = window.siteMeta.author;
  var param = {
    sURL: sURL,
    sTitle: sTitle,
    sImg: sImg,
    sDesc: sDesc,
    sAuthor: sAuthor
  };
  var shareWrapper = document.querySelector('.shareList');

  if (!shareWrapper) {
    return;
  }

  initQR(sURL);
  shareWrapper.addEventListener('click', function (e) {
    if (!e.target.getAttribute('data-type')) {
      return;
    }

    handleShareClick(e.target.getAttribute('data-type'), param);
  });
}

init();
})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9oZXhvLXRoZW1lLWFyY2hlci8uL25vZGVfbW9kdWxlcy9xcmNvZGUtZ2VuZXJhdG9yL3FyY29kZS5qcyIsIndlYnBhY2s6Ly9oZXhvLXRoZW1lLWFyY2hlci93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9oZXhvLXRoZW1lLWFyY2hlci93ZWJwYWNrL3J1bnRpbWUvY29tcGF0IGdldCBkZWZhdWx0IGV4cG9ydCIsIndlYnBhY2s6Ly9oZXhvLXRoZW1lLWFyY2hlci93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vaGV4by10aGVtZS1hcmNoZXIvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9oZXhvLXRoZW1lLWFyY2hlci93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL2hleG8tdGhlbWUtYXJjaGVyLy4vc3JjL2pzL3NoYXJlLmpzIl0sIm5hbWVzIjpbImluaXRRUiIsInNVUkwiLCJ0eXBlTnVtYmVyIiwiZXJyb3JDb3JyZWN0aW9uTGV2ZWwiLCJxciIsInFyY29kZSIsImFkZERhdGEiLCJtYWtlIiwiZG9jdW1lbnQiLCJnZXRFbGVtZW50c0J5Q2xhc3NOYW1lIiwiaW5uZXJIVE1MIiwiY3JlYXRlSW1nVGFnIiwiZ2VuZXJhdGUiLCJ0ZW1wbGF0ZVVSTCIsInBhcmFtIiwic2hhcmVVUkwiLCJyZXBsYWNlIiwiZW5jb2RlVVJJQ29tcG9uZW50Iiwic1RpdGxlIiwic0Rlc2MiLCJzQXV0aG9yIiwic0ltZyIsIndpbmRvdyIsIm9wZW4iLCJoYW5kbGVTaGFyZUNsaWNrIiwidHlwZSIsImluaXQiLCJsb2NhdGlvbiIsImhyZWYiLCJxdWVyeVNlbGVjdG9yIiwiZ2V0QXR0cmlidXRlIiwicHJvdG9jb2wiLCJob3N0bmFtZSIsInBvcnQiLCJpbm5lclRleHQiLCJzdWJzdHJpbmciLCJzaXRlTWV0YSIs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QUNBLHFCQUFxQix5QkFBeUI7QUFDOUM7QUFDQTtBQUNBO0FBQ0EsS0FBSzs7QUFFTDs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBLHFCQUFxQix1QkFBdUI7QUFDNUMsdUJBQXVCLG1CQUFtQjtBQUMxQztBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQSxxQkFBcUIsdUJBQXVCO0FBQzVDO0FBQ0E7O0FBRUEscUJBQXFCLG1CQUFtQjtBQUN4QztBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBLHFCQUFxQixZQUFZOztBQUVqQztBQUNBO0FBQ0E7O0FBRUEsdUJBQXVCLFdBQVc7QUFDbEM7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQSxHQUFHOztBQUVIO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLHFCQUFxQixZQUFZO0FBQ2pDO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EscUJBQXFCLGNBQWM7QUFDbkM7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxxQkFBcUIsbUJBQW1CO0FBQ3hDO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSzs7QUFFTDs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQSxTQUFTO0FBQ1Q7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EscUJBQXFCLFNBQVM7QUFDOUI7QUFDQTtBQUNBOztBQUVBO0FBQ0EscUJBQXFCLGNBQWM7QUFDbkM7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUIsbUJBQW1CO0FBQ3hDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBLE9BQU87QUFDUDtBQUNBLE9BQU87QUFDUDtBQUNBLE9BQU87QUFDUDtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLHVCQUF1QixZQUFZO0FBQ25DO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQSxPQUFPO0FBQ1A7QUFDQSxPQUFPO0FBQ1A7QUFDQSxPQUFPO0FBQ1A7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUEsMEJBQTBCO0FBQzFCO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0Esd0JBQXdCO0FBQ3hCOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQSxxQkFBcUIsZUFBZTtBQUNwQztBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBOztBQUVBLFNBQVM7O0FBRVQ7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FB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V0FBTyxFQUFQQTtBQUxVLEdBQVo7QUFRQSxNQUFJa0IsWUFBWSxHQUFHOUIsUUFBUSxDQUFDcUIsYUFBVCxDQUF1QixZQUF2QixDQUFuQjs7QUFDQSxNQUFJLENBQUNTLFlBQUwsRUFBbUI7QUFDakI7QUFDRDs7QUFDRHRDLFFBQU0sQ0FBQ0MsSUFBRCxDQUFOO0FBQ0FxQyxjQUFZLENBQUNDLGdCQUFiLENBQThCLE9BQTlCLEVBQXVDLFVBQVVDLENBQVYsRUFBYTtBQUNsRCxRQUFJLENBQUNBLENBQUMsQ0FBQ0MsTUFBRixDQUFTWCxZQUFULENBQXNCLFdBQXRCLENBQUwsRUFBeUM7QUFDdkM7QUFDRDs7QUFDRE4sb0JBQWdCLENBQUNnQixDQUFDLENBQUNDLE1BQUYsQ0FBU1gsWUFBVCxDQUFzQixXQUF0QixDQUFELEVBQXFDaEIsS0FBckMsQ0FBaEI7QUFDRCxHQUxEO0FBTUQ7O0FBRURZLElBQUksRyIsImZpbGUiOiJzaGFyZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vL1xuLy8gUVIgQ29kZSBHZW5lcmF0b3IgZm9yIEphdmFTY3JpcHRcbi8vXG4vLyBDb3B5cmlnaHQgKGMpIDIwMDkgS2F6dWhpa28gQXJhc2Vcbi8vXG4vLyBVUkw6IGh0dHA6Ly93d3cuZC1wcm9qZWN0LmNvbS9cbi8vXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2U6XG4vLyAgaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZS5waHBcbi8vXG4vLyBUaGUgd29yZCAnUVIgQ29kZScgaXMgcmVnaXN0ZXJlZCB0cmFkZW1hcmsgb2Zcbi8vIERFTlNPIFdBVkUgSU5DT1JQT1JBVEVEXG4vLyAgaHR0cDovL3d3dy5kZW5zby13YXZlLmNvbS9xcmNvZGUvZmFxcGF0ZW50LWUuaHRtbFxuLy9cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbnZhciBxcmNvZGUgPSBmdW5jdGlvbigpIHtcblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBxcmNvZGVcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAvKipcbiAgICogcXJjb2RlXG4gICAqIEBwYXJhbSB0eXBlTnVtYmVyIDEgdG8gNDBcbiAgICogQHBhcmFtIGVycm9yQ29ycmVjdGlvbkxldmVsICdMJywnTScsJ1EnLCdIJ1xuICAgKi9cbiAgdmFyIHFyY29kZSA9IGZ1bmN0aW9uKHR5cGVOdW1iZXIsIGVycm9yQ29ycmVjdGlvbkxldmVsKSB7XG5cbiAgICB2YXIgUEFEMCA9IDB4RUM7XG4gICAgdmFyIFBBRDEgPSAweDExO1xuXG4gICAgdmFyIF90eXBlTnVtYmVyID0gdHlwZU51bWJlcjtcbiAgICB2YXIgX2Vycm9yQ29ycmVjdGlvbkxldmVsID0gUVJFcnJvckNvcnJlY3Rpb25MZXZlbFtlcnJvckNvcnJlY3Rpb25MZXZlbF07XG4gICAgdmFyIF9tb2R1bGVzID0gbnVsbDtcbiAgICB2YXIgX21vZHVsZUNvdW50ID0gMDtcbiAgICB2YXIgX2RhdGFDYWNoZSA9IG51bGw7XG4gICAgdmFyIF9kYXRhTGlzdCA9IFtdO1xuXG4gICAgdmFyIF90aGlzID0ge307XG5cbiAgICB2YXIgbWFrZUltcGwgPSBmdW5jdGlvbih0ZXN0LCBtYXNrUGF0dGVybikge1xuXG4gICAgICBfbW9kdWxlQ291bnQgPSBfdHlwZU51bWJlciAqIDQgKyAxNztcbiAgICAgIF9tb2R1bGVzID0gZnVuY3Rpb24obW9kdWxlQ291bnQpIHtcbiAgICAgICAgdmFyIG1vZHVsZXMgPSBuZXcgQXJyYXkobW9kdWxlQ291bnQpO1xuICAgICAgICBmb3IgKHZhciByb3cgPSAwOyByb3cgPCBtb2R1bGVDb3VudDsgcm93ICs9IDEpIHtcbiAgICAgICAgICBtb2R1bGVzW3Jvd10gPSBuZXcgQXJyYXkobW9kdWxlQ291bnQpO1xuICAgICAgICAgIGZvciAodmFyIGNvbCA9IDA7IGNvbCA8IG1vZHVsZUNvdW50OyBjb2wgKz0gMSkge1xuICAgICAgICAgICAgbW9kdWxlc1tyb3ddW2NvbF0gPSBudWxsO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbW9kdWxlcztcbiAgICAgIH0oX21vZHVsZUNvdW50KTtcblxuICAgICAgc2V0dXBQb3NpdGlvblByb2JlUGF0dGVybigwLCAwKTtcbiAgICAgIHNldHVwUG9zaXRpb25Qcm9iZVBhdHRlcm4oX21vZHVsZUNvdW50IC0gNywgMCk7XG4gICAgICBzZXR1cFBvc2l0aW9uUHJvYmVQYXR0ZXJuKDAsIF9tb2R1bGVDb3VudCAtIDcpO1xuICAgICAgc2V0dXBQb3NpdGlvbkFkanVzdFBhdHRlcm4oKTtcbiAgICAgIHNldHVwVGltaW5nUGF0dGVybigpO1xuICAgICAgc2V0dXBUeXBlSW5mbyh0ZXN0LCBtYXNrUGF0dGVybik7XG5cbiAgICAgIGlmIChfdHlwZU51bWJlciA+PSA3KSB7XG4gICAgICAgIHNldHVwVHlwZU51bWJlcih0ZXN0KTtcbiAgICAgIH1cblxuICAgICAgaWYgKF9kYXRhQ2FjaGUgPT0gbnVsbCkge1xuICAgICAgICBfZGF0YUNhY2hlID0gY3JlYXRlRGF0YShfdHlwZU51bWJlciwgX2Vycm9yQ29ycmVjdGlvbkxldmVsLCBfZGF0YUxpc3QpO1xuICAgICAgfVxuXG4gICAgICBtYXBEYXRhKF9kYXRhQ2FjaGUsIG1hc2tQYXR0ZXJuKTtcbiAgICB9O1xuXG4gICAgdmFyIHNldHVwUG9zaXRpb25Qcm9iZVBhdHRlcm4gPSBmdW5jdGlvbihyb3csIGNvbCkge1xuXG4gICAgICBmb3IgKHZhciByID0gLTE7IHIgPD0gNzsgciArPSAxKSB7XG5cbiAgICAgICAgaWYgKHJvdyArIHIgPD0gLTEgfHwgX21vZHVsZUNvdW50IDw9IHJvdyArIHIpIGNvbnRpbnVlO1xuXG4gICAgICAgIGZvciAodmFyIGMgPSAtMTsgYyA8PSA3OyBjICs9IDEpIHtcblxuICAgICAgICAgIGlmIChjb2wgKyBjIDw9IC0xIHx8IF9tb2R1bGVDb3VudCA8PSBjb2wgKyBjKSBjb250aW51ZTtcblxuICAgICAgICAgIGlmICggKDAgPD0gciAmJiByIDw9IDYgJiYgKGMgPT0gMCB8fCBjID09IDYpIClcbiAgICAgICAgICAgICAgfHwgKDAgPD0gYyAmJiBjIDw9IDYgJiYgKHIgPT0gMCB8fCByID09IDYpIClcbiAgICAgICAgICAgICAgfHwgKDIgPD0gciAmJiByIDw9IDQgJiYgMiA8PSBjICYmIGMgPD0gNCkgKSB7XG4gICAgICAgICAgICBfbW9kdWxlc1tyb3cgKyByXVtjb2wgKyBjXSA9IHRydWU7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIF9tb2R1bGVzW3JvdyArIHJdW2NvbCArIGNdID0gZmFsc2U7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuICAgIHZhciBnZXRCZXN0TWFza1BhdHRlcm4gPSBmdW5jdGlvbigpIHtcblxuICAgICAgdmFyIG1pbkxvc3RQb2ludCA9IDA7XG4gICAgICB2YXIgcGF0dGVybiA9IDA7XG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgODsgaSArPSAxKSB7XG5cbiAgICAgICAgbWFrZUltcGwodHJ1ZSwgaSk7XG5cbiAgICAgICAgdmFyIGxvc3RQb2ludCA9IFFSVXRpbC5nZXRMb3N0UG9pbnQoX3RoaXMpO1xuXG4gICAgICAgIGlmIChpID09IDAgfHwgbWluTG9zdFBvaW50ID4gbG9zdFBvaW50KSB7XG4gICAgICAgICAgbWluTG9zdFBvaW50ID0gbG9zdFBvaW50O1xuICAgICAgICAgIHBhdHRlcm4gPSBpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBwYXR0ZXJuO1xuICAgIH07XG5cbiAgICB2YXIgc2V0dXBUaW1pbmdQYXR0ZXJuID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgIGZvciAodmFyIHIgPSA4OyByIDwgX21vZHVsZUNvdW50IC0gODsgciArPSAxKSB7XG4gICAgICAgIGlmIChfbW9kdWxlc1tyXVs2XSAhPSBudWxsKSB7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgX21vZHVsZXNbcl1bNl0gPSAociAlIDIgPT0gMCk7XG4gICAgICB9XG5cbiAgICAgIGZvciAodmFyIGMgPSA4OyBjIDwgX21vZHVsZUNvdW50IC0gODsgYyArPSAxKSB7XG4gICAgICAgIGlmIChfbW9kdWxlc1s2XVtjXSAhPSBudWxsKSB7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgX21vZHVsZXNbNl1bY10gPSAoYyAlIDIgPT0gMCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHZhciBzZXR1cFBvc2l0aW9uQWRqdXN0UGF0dGVybiA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICB2YXIgcG9zID0gUVJVdGlsLmdldFBhdHRlcm5Qb3NpdGlvbihfdHlwZU51bWJlcik7XG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcG9zLmxlbmd0aDsgaSArPSAxKSB7XG5cbiAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBwb3MubGVuZ3RoOyBqICs9IDEpIHtcblxuICAgICAgICAgIHZhciByb3cgPSBwb3NbaV07XG4gICAgICAgICAgdmFyIGNvbCA9IHBvc1tqXTtcblxuICAgICAgICAgIGlmIChfbW9kdWxlc1tyb3ddW2NvbF0gIT0gbnVsbCkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgZm9yICh2YXIgciA9IC0yOyByIDw9IDI7IHIgKz0gMSkge1xuXG4gICAgICAgICAgICBmb3IgKHZhciBjID0gLTI7IGMgPD0gMjsgYyArPSAxKSB7XG5cbiAgICAgICAgICAgICAgaWYgKHIgPT0gLTIgfHwgciA9PSAyIHx8IGMgPT0gLTIgfHwgYyA9PSAyXG4gICAgICAgICAgICAgICAgICB8fCAociA9PSAwICYmIGMgPT0gMCkgKSB7XG4gICAgICAgICAgICAgICAgX21vZHVsZXNbcm93ICsgcl1bY29sICsgY10gPSB0cnVlO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIF9tb2R1bGVzW3JvdyArIHJdW2NvbCArIGNdID0gZmFsc2U7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuXG4gICAgdmFyIHNldHVwVHlwZU51bWJlciA9IGZ1bmN0aW9uKHRlc3QpIHtcblxuICAgICAgdmFyIGJpdHMgPSBRUlV0aWwuZ2V0QkNIVHlwZU51bWJlcihfdHlwZU51bWJlcik7XG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMTg7IGkgKz0gMSkge1xuICAgICAgICB2YXIgbW9kID0gKCF0ZXN0ICYmICggKGJpdHMgPj4gaSkgJiAxKSA9PSAxKTtcbiAgICAgICAgX21vZHVsZXNbTWF0aC5mbG9vcihpIC8gMyldW2kgJSAzICsgX21vZHVsZUNvdW50IC0gOCAtIDNdID0gbW9kO1xuICAgICAgfVxuXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDE4OyBpICs9IDEpIHtcbiAgICAgICAgdmFyIG1vZCA9ICghdGVzdCAmJiAoIChiaXRzID4+IGkpICYgMSkgPT0gMSk7XG4gICAgICAgIF9tb2R1bGVzW2kgJSAzICsgX21vZHVsZUNvdW50IC0gOCAtIDNdW01hdGguZmxvb3IoaSAvIDMpXSA9IG1vZDtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgdmFyIHNldHVwVHlwZUluZm8gPSBmdW5jdGlvbih0ZXN0LCBtYXNrUGF0dGVybikge1xuXG4gICAgICB2YXIgZGF0YSA9IChfZXJyb3JDb3JyZWN0aW9uTGV2ZWwgPDwgMykgfCBtYXNrUGF0dGVybjtcbiAgICAgIHZhciBiaXRzID0gUVJVdGlsLmdldEJDSFR5cGVJbmZvKGRhdGEpO1xuXG4gICAgICAvLyB2ZXJ0aWNhbFxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCAxNTsgaSArPSAxKSB7XG5cbiAgICAgICAgdmFyIG1vZCA9ICghdGVzdCAmJiAoIChiaXRzID4+IGkpICYgMSkgPT0gMSk7XG5cbiAgICAgICAgaWYgKGkgPCA2KSB7XG4gICAgICAgICAgX21vZHVsZXNbaV1bOF0gPSBtb2Q7XG4gICAgICAgIH0gZWxzZSBpZiAoaSA8IDgpIHtcbiAgICAgICAgICBfbW9kdWxlc1tpICsgMV1bOF0gPSBtb2Q7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgX21vZHVsZXNbX21vZHVsZUNvdW50IC0gMTUgKyBpXVs4XSA9IG1vZDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBob3Jpem9udGFsXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDE1OyBpICs9IDEpIHtcblxuICAgICAgICB2YXIgbW9kID0gKCF0ZXN0ICYmICggKGJpdHMgPj4gaSkgJiAxKSA9PSAxKTtcblxuICAgICAgICBpZiAoaSA8IDgpIHtcbiAgICAgICAgICBfbW9kdWxlc1s4XVtfbW9kdWxlQ291bnQgLSBpIC0gMV0gPSBtb2Q7XG4gICAgICAgIH0gZWxzZSBpZiAoaSA8IDkpIHtcbiAgICAgICAgICBfbW9kdWxlc1s4XVsxNSAtIGkgLSAxICsgMV0gPSBtb2Q7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgX21vZHVsZXNbOF1bMTUgLSBpIC0gMV0gPSBtb2Q7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gZml4ZWQgbW9kdWxlXG4gICAgICBfbW9kdWxlc1tfbW9kdWxlQ291bnQgLSA4XVs4XSA9ICghdGVzdCk7XG4gICAgfTtcblxuICAgIHZhciBtYXBEYXRhID0gZnVuY3Rpb24oZGF0YSwgbWFza1BhdHRlcm4pIHtcblxuICAgICAgdmFyIGluYyA9IC0xO1xuICAgICAgdmFyIHJvdyA9IF9tb2R1bGVDb3VudCAtIDE7XG4gICAgICB2YXIgYml0SW5kZXggPSA3O1xuICAgICAgdmFyIGJ5dGVJbmRleCA9IDA7XG4gICAgICB2YXIgbWFza0Z1bmMgPSBRUlV0aWwuZ2V0TWFza0Z1bmN0aW9uKG1hc2tQYXR0ZXJuKTtcblxuICAgICAgZm9yICh2YXIgY29sID0gX21vZHVsZUNvdW50IC0gMTsgY29sID4gMDsgY29sIC09IDIpIHtcblxuICAgICAgICBpZiAoY29sID09IDYpIGNvbCAtPSAxO1xuXG4gICAgICAgIHdoaWxlICh0cnVlKSB7XG5cbiAgICAgICAgICBmb3IgKHZhciBjID0gMDsgYyA8IDI7IGMgKz0gMSkge1xuXG4gICAgICAgICAgICBpZiAoX21vZHVsZXNbcm93XVtjb2wgLSBjXSA9PSBudWxsKSB7XG5cbiAgICAgICAgICAgICAgdmFyIGRhcmsgPSBmYWxzZTtcblxuICAgICAgICAgICAgICBpZiAoYnl0ZUluZGV4IDwgZGF0YS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBkYXJrID0gKCAoIChkYXRhW2J5dGVJbmRleF0gPj4+IGJpdEluZGV4KSAmIDEpID09IDEpO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgdmFyIG1hc2sgPSBtYXNrRnVuYyhyb3csIGNvbCAtIGMpO1xuXG4gICAgICAgICAgICAgIGlmIChtYXNrKSB7XG4gICAgICAgICAgICAgICAgZGFyayA9ICFkYXJrO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgX21vZHVsZXNbcm93XVtjb2wgLSBjXSA9IGRhcms7XG4gICAgICAgICAgICAgIGJpdEluZGV4IC09IDE7XG5cbiAgICAgICAgICAgICAgaWYgKGJpdEluZGV4ID09IC0xKSB7XG4gICAgICAgICAgICAgICAgYnl0ZUluZGV4ICs9IDE7XG4gICAgICAgICAgICAgICAgYml0SW5kZXggPSA3O1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcm93ICs9IGluYztcblxuICAgICAgICAgIGlmIChyb3cgPCAwIHx8IF9tb2R1bGVDb3VudCA8PSByb3cpIHtcbiAgICAgICAgICAgIHJvdyAtPSBpbmM7XG4gICAgICAgICAgICBpbmMgPSAtaW5jO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuICAgIHZhciBjcmVhdGVCeXRlcyA9IGZ1bmN0aW9uKGJ1ZmZlciwgcnNCbG9ja3MpIHtcblxuICAgICAgdmFyIG9mZnNldCA9IDA7XG5cbiAgICAgIHZhciBtYXhEY0NvdW50ID0gMDtcbiAgICAgIHZhciBtYXhFY0NvdW50ID0gMDtcblxuICAgICAgdmFyIGRjZGF0YSA9IG5ldyBBcnJheShyc0Jsb2Nrcy5sZW5ndGgpO1xuICAgICAgdmFyIGVjZGF0YSA9IG5ldyBBcnJheShyc0Jsb2Nrcy5sZW5ndGgpO1xuXG4gICAgICBmb3IgKHZhciByID0gMDsgciA8IHJzQmxvY2tzLmxlbmd0aDsgciArPSAxKSB7XG5cbiAgICAgICAgdmFyIGRjQ291bnQgPSByc0Jsb2Nrc1tyXS5kYXRhQ291bnQ7XG4gICAgICAgIHZhciBlY0NvdW50ID0gcnNCbG9ja3Nbcl0udG90YWxDb3VudCAtIGRjQ291bnQ7XG5cbiAgICAgICAgbWF4RGNDb3VudCA9IE1hdGgubWF4KG1heERjQ291bnQsIGRjQ291bnQpO1xuICAgICAgICBtYXhFY0NvdW50ID0gTWF0aC5tYXgobWF4RWNDb3VudCwgZWNDb3VudCk7XG5cbiAgICAgICAgZGNkYXRhW3JdID0gbmV3IEFycmF5KGRjQ291bnQpO1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGNkYXRhW3JdLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgICAgZGNkYXRhW3JdW2ldID0gMHhmZiAmIGJ1ZmZlci5nZXRCdWZmZXIoKVtpICsgb2Zmc2V0XTtcbiAgICAgICAgfVxuICAgICAgICBvZmZzZXQgKz0gZGNDb3VudDtcblxuICAgICAgICB2YXIgcnNQb2x5ID0gUVJVdGlsLmdldEVycm9yQ29ycmVjdFBvbHlub21pYWwoZWNDb3VudCk7XG4gICAgICAgIHZhciByYXdQb2x5ID0gcXJQb2x5bm9taWFsKGRjZGF0YVtyXSwgcnNQb2x5LmdldExlbmd0aCgpIC0gMSk7XG5cbiAgICAgICAgdmFyIG1vZFBvbHkgPSByYXdQb2x5Lm1vZChyc1BvbHkpO1xuICAgICAgICBlY2RhdGFbcl0gPSBuZXcgQXJyYXkocnNQb2x5LmdldExlbmd0aCgpIC0gMSk7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZWNkYXRhW3JdLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgICAgdmFyIG1vZEluZGV4ID0gaSArIG1vZFBvbHkuZ2V0TGVuZ3RoKCkgLSBlY2RhdGFbcl0ubGVuZ3RoO1xuICAgICAgICAgIGVjZGF0YVtyXVtpXSA9IChtb2RJbmRleCA+PSAwKT8gbW9kUG9seS5nZXRBdChtb2RJbmRleCkgOiAwO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHZhciB0b3RhbENvZGVDb3VudCA9IDA7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJzQmxvY2tzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIHRvdGFsQ29kZUNvdW50ICs9IHJzQmxvY2tzW2ldLnRvdGFsQ291bnQ7XG4gICAgICB9XG5cbiAgICAgIHZhciBkYXRhID0gbmV3IEFycmF5KHRvdGFsQ29kZUNvdW50KTtcbiAgICAgIHZhciBpbmRleCA9IDA7XG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbWF4RGNDb3VudDsgaSArPSAxKSB7XG4gICAgICAgIGZvciAodmFyIHIgPSAwOyByIDwgcnNCbG9ja3MubGVuZ3RoOyByICs9IDEpIHtcbiAgICAgICAgICBpZiAoaSA8IGRjZGF0YVtyXS5sZW5ndGgpIHtcbiAgICAgICAgICAgIGRhdGFbaW5kZXhdID0gZGNkYXRhW3JdW2ldO1xuICAgICAgICAgICAgaW5kZXggKz0gMTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBtYXhFY0NvdW50OyBpICs9IDEpIHtcbiAgICAgICAgZm9yICh2YXIgciA9IDA7IHIgPCByc0Jsb2Nrcy5sZW5ndGg7IHIgKz0gMSkge1xuICAgICAgICAgIGlmIChpIDwgZWNkYXRhW3JdLmxlbmd0aCkge1xuICAgICAgICAgICAgZGF0YVtpbmRleF0gPSBlY2RhdGFbcl1baV07XG4gICAgICAgICAgICBpbmRleCArPSAxO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gZGF0YTtcbiAgICB9O1xuXG4gICAgdmFyIGNyZWF0ZURhdGEgPSBmdW5jdGlvbih0eXBlTnVtYmVyLCBlcnJvckNvcnJlY3Rpb25MZXZlbCwgZGF0YUxpc3QpIHtcblxuICAgICAgdmFyIHJzQmxvY2tzID0gUVJSU0Jsb2NrLmdldFJTQmxvY2tzKHR5cGVOdW1iZXIsIGVycm9yQ29ycmVjdGlvbkxldmVsKTtcblxuICAgICAgdmFyIGJ1ZmZlciA9IHFyQml0QnVmZmVyKCk7XG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YUxpc3QubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgdmFyIGRhdGEgPSBkYXRhTGlzdFtpXTtcbiAgICAgICAgYnVmZmVyLnB1dChkYXRhLmdldE1vZGUoKSwgNCk7XG4gICAgICAgIGJ1ZmZlci5wdXQoZGF0YS5nZXRMZW5ndGgoKSwgUVJVdGlsLmdldExlbmd0aEluQml0cyhkYXRhLmdldE1vZGUoKSwgdHlwZU51bWJlcikgKTtcbiAgICAgICAgZGF0YS53cml0ZShidWZmZXIpO1xuICAgICAgfVxuXG4gICAgICAvLyBjYWxjIG51bSBtYXggZGF0YS5cbiAgICAgIHZhciB0b3RhbERhdGFDb3VudCA9IDA7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJzQmxvY2tzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIHRvdGFsRGF0YUNvdW50ICs9IHJzQmxvY2tzW2ldLmRhdGFDb3VudDtcbiAgICAgIH1cblxuICAgICAgaWYgKGJ1ZmZlci5nZXRMZW5ndGhJbkJpdHMoKSA+IHRvdGFsRGF0YUNvdW50ICogOCkge1xuICAgICAgICB0aHJvdyAnY29kZSBsZW5ndGggb3ZlcmZsb3cuICgnXG4gICAgICAgICAgKyBidWZmZXIuZ2V0TGVuZ3RoSW5CaXRzKClcbiAgICAgICAgICArICc+J1xuICAgICAgICAgICsgdG90YWxEYXRhQ291bnQgKiA4XG4gICAgICAgICAgKyAnKSc7XG4gICAgICB9XG5cbiAgICAgIC8vIGVuZCBjb2RlXG4gICAgICBpZiAoYnVmZmVyLmdldExlbmd0aEluQml0cygpICsgNCA8PSB0b3RhbERhdGFDb3VudCAqIDgpIHtcbiAgICAgICAgYnVmZmVyLnB1dCgwLCA0KTtcbiAgICAgIH1cblxuICAgICAgLy8gcGFkZGluZ1xuICAgICAgd2hpbGUgKGJ1ZmZlci5nZXRMZW5ndGhJbkJpdHMoKSAlIDggIT0gMCkge1xuICAgICAgICBidWZmZXIucHV0Qml0KGZhbHNlKTtcbiAgICAgIH1cblxuICAgICAgLy8gcGFkZGluZ1xuICAgICAgd2hpbGUgKHRydWUpIHtcblxuICAgICAgICBpZiAoYnVmZmVyLmdldExlbmd0aEluQml0cygpID49IHRvdGFsRGF0YUNvdW50ICogOCkge1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGJ1ZmZlci5wdXQoUEFEMCwgOCk7XG5cbiAgICAgICAgaWYgKGJ1ZmZlci5nZXRMZW5ndGhJbkJpdHMoKSA+PSB0b3RhbERhdGFDb3VudCAqIDgpIHtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBidWZmZXIucHV0KFBBRDEsIDgpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gY3JlYXRlQnl0ZXMoYnVmZmVyLCByc0Jsb2Nrcyk7XG4gICAgfTtcblxuICAgIF90aGlzLmFkZERhdGEgPSBmdW5jdGlvbihkYXRhLCBtb2RlKSB7XG5cbiAgICAgIG1vZGUgPSBtb2RlIHx8ICdCeXRlJztcblxuICAgICAgdmFyIG5ld0RhdGEgPSBudWxsO1xuXG4gICAgICBzd2l0Y2gobW9kZSkge1xuICAgICAgY2FzZSAnTnVtZXJpYycgOlxuICAgICAgICBuZXdEYXRhID0gcXJOdW1iZXIoZGF0YSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnQWxwaGFudW1lcmljJyA6XG4gICAgICAgIG5ld0RhdGEgPSBxckFscGhhTnVtKGRhdGEpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ0J5dGUnIDpcbiAgICAgICAgbmV3RGF0YSA9IHFyOEJpdEJ5dGUoZGF0YSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnS2FuamknIDpcbiAgICAgICAgbmV3RGF0YSA9IHFyS2FuamkoZGF0YSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdCA6XG4gICAgICAgIHRocm93ICdtb2RlOicgKyBtb2RlO1xuICAgICAgfVxuXG4gICAgICBfZGF0YUxpc3QucHVzaChuZXdEYXRhKTtcbiAgICAgIF9kYXRhQ2FjaGUgPSBudWxsO1xuICAgIH07XG5cbiAgICBfdGhpcy5pc0RhcmsgPSBmdW5jdGlvbihyb3csIGNvbCkge1xuICAgICAgaWYgKHJvdyA8IDAgfHwgX21vZHVsZUNvdW50IDw9IHJvdyB8fCBjb2wgPCAwIHx8IF9tb2R1bGVDb3VudCA8PSBjb2wpIHtcbiAgICAgICAgdGhyb3cgcm93ICsgJywnICsgY29sO1xuICAgICAgfVxuICAgICAgcmV0dXJuIF9tb2R1bGVzW3Jvd11bY29sXTtcbiAgICB9O1xuXG4gICAgX3RoaXMuZ2V0TW9kdWxlQ291bnQgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBfbW9kdWxlQ291bnQ7XG4gICAgfTtcblxuICAgIF90aGlzLm1ha2UgPSBmdW5jdGlvbigpIHtcbiAgICAgIGlmIChfdHlwZU51bWJlciA8IDEpIHtcbiAgICAgICAgdmFyIHR5cGVOdW1iZXIgPSAxO1xuXG4gICAgICAgIGZvciAoOyB0eXBlTnVtYmVyIDwgNDA7IHR5cGVOdW1iZXIrKykge1xuICAgICAgICAgIHZhciByc0Jsb2NrcyA9IFFSUlNCbG9jay5nZXRSU0Jsb2Nrcyh0eXBlTnVtYmVyLCBfZXJyb3JDb3JyZWN0aW9uTGV2ZWwpO1xuICAgICAgICAgIHZhciBidWZmZXIgPSBxckJpdEJ1ZmZlcigpO1xuXG4gICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBfZGF0YUxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBkYXRhID0gX2RhdGFMaXN0W2ldO1xuICAgICAgICAgICAgYnVmZmVyLnB1dChkYXRhLmdldE1vZGUoKSwgNCk7XG4gICAgICAgICAgICBidWZmZXIucHV0KGRhdGEuZ2V0TGVuZ3RoKCksIFFSVXRpbC5nZXRMZW5ndGhJbkJpdHMoZGF0YS5nZXRNb2RlKCksIHR5cGVOdW1iZXIpICk7XG4gICAgICAgICAgICBkYXRhLndyaXRlKGJ1ZmZlcik7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdmFyIHRvdGFsRGF0YUNvdW50ID0gMDtcbiAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJzQmxvY2tzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB0b3RhbERhdGFDb3VudCArPSByc0Jsb2Nrc1tpXS5kYXRhQ291bnQ7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKGJ1ZmZlci5nZXRMZW5ndGhJbkJpdHMoKSA8PSB0b3RhbERhdGFDb3VudCAqIDgpIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIF90eXBlTnVtYmVyID0gdHlwZU51bWJlcjtcbiAgICAgIH1cblxuICAgICAgbWFrZUltcGwoZmFsc2UsIGdldEJlc3RNYXNrUGF0dGVybigpICk7XG4gICAgfTtcblxuICAgIF90aGlzLmNyZWF0ZVRhYmxlVGFnID0gZnVuY3Rpb24oY2VsbFNpemUsIG1hcmdpbikge1xuXG4gICAgICBjZWxsU2l6ZSA9IGNlbGxTaXplIHx8IDI7XG4gICAgICBtYXJnaW4gPSAodHlwZW9mIG1hcmdpbiA9PSAndW5kZWZpbmVkJyk/IGNlbGxTaXplICogNCA6IG1hcmdpbjtcblxuICAgICAgdmFyIHFySHRtbCA9ICcnO1xuXG4gICAgICBxckh0bWwgKz0gJzx0YWJsZSBzdHlsZT1cIic7XG4gICAgICBxckh0bWwgKz0gJyBib3JkZXItd2lkdGg6IDBweDsgYm9yZGVyLXN0eWxlOiBub25lOyc7XG4gICAgICBxckh0bWwgKz0gJyBib3JkZXItY29sbGFwc2U6IGNvbGxhcHNlOyc7XG4gICAgICBxckh0bWwgKz0gJyBwYWRkaW5nOiAwcHg7IG1hcmdpbjogJyArIG1hcmdpbiArICdweDsnO1xuICAgICAgcXJIdG1sICs9ICdcIj4nO1xuICAgICAgcXJIdG1sICs9ICc8dGJvZHk+JztcblxuICAgICAgZm9yICh2YXIgciA9IDA7IHIgPCBfdGhpcy5nZXRNb2R1bGVDb3VudCgpOyByICs9IDEpIHtcblxuICAgICAgICBxckh0bWwgKz0gJzx0cj4nO1xuXG4gICAgICAgIGZvciAodmFyIGMgPSAwOyBjIDwgX3RoaXMuZ2V0TW9kdWxlQ291bnQoKTsgYyArPSAxKSB7XG4gICAgICAgICAgcXJIdG1sICs9ICc8dGQgc3R5bGU9XCInO1xuICAgICAgICAgIHFySHRtbCArPSAnIGJvcmRlci13aWR0aDogMHB4OyBib3JkZXItc3R5bGU6IG5vbmU7JztcbiAgICAgICAgICBxckh0bWwgKz0gJyBib3JkZXItY29sbGFwc2U6IGNvbGxhcHNlOyc7XG4gICAgICAgICAgcXJIdG1sICs9ICcgcGFkZGluZzogMHB4OyBtYXJnaW46IDBweDsnO1xuICAgICAgICAgIHFySHRtbCArPSAnIHdpZHRoOiAnICsgY2VsbFNpemUgKyAncHg7JztcbiAgICAgICAgICBxckh0bWwgKz0gJyBoZWlnaHQ6ICcgKyBjZWxsU2l6ZSArICdweDsnO1xuICAgICAgICAgIHFySHRtbCArPSAnIGJhY2tncm91bmQtY29sb3I6ICc7XG4gICAgICAgICAgcXJIdG1sICs9IF90aGlzLmlzRGFyayhyLCBjKT8gJyMwMDAwMDAnIDogJyNmZmZmZmYnO1xuICAgICAgICAgIHFySHRtbCArPSAnOyc7XG4gICAgICAgICAgcXJIdG1sICs9ICdcIi8+JztcbiAgICAgICAgfVxuXG4gICAgICAgIHFySHRtbCArPSAnPC90cj4nO1xuICAgICAgfVxuXG4gICAgICBxckh0bWwgKz0gJzwvdGJvZHk+JztcbiAgICAgIHFySHRtbCArPSAnPC90YWJsZT4nO1xuXG4gICAgICByZXR1cm4gcXJIdG1sO1xuICAgIH07XG5cbiAgICBfdGhpcy5jcmVhdGVTdmdUYWcgPSBmdW5jdGlvbihjZWxsU2l6ZSwgbWFyZ2luLCBhbHQsIHRpdGxlKSB7XG5cbiAgICAgIHZhciBvcHRzID0ge307XG4gICAgICBpZiAodHlwZW9mIGFyZ3VtZW50c1swXSA9PSAnb2JqZWN0Jykge1xuICAgICAgICAvLyBDYWxsZWQgYnkgb3B0aW9ucy5cbiAgICAgICAgb3B0cyA9IGFyZ3VtZW50c1swXTtcbiAgICAgICAgLy8gb3ZlcndyaXRlIGNlbGxTaXplIGFuZCBtYXJnaW4uXG4gICAgICAgIGNlbGxTaXplID0gb3B0cy5jZWxsU2l6ZTtcbiAgICAgICAgbWFyZ2luID0gb3B0cy5tYXJnaW47XG4gICAgICAgIGFsdCA9IG9wdHMuYWx0O1xuICAgICAgICB0aXRsZSA9IG9wdHMudGl0bGU7XG4gICAgICB9XG5cbiAgICAgIGNlbGxTaXplID0gY2VsbFNpemUgfHwgMjtcbiAgICAgIG1hcmdpbiA9ICh0eXBlb2YgbWFyZ2luID09ICd1bmRlZmluZWQnKT8gY2VsbFNpemUgKiA0IDogbWFyZ2luO1xuXG4gICAgICAvLyBDb21wb3NlIGFsdCBwcm9wZXJ0eSBzdXJyb2dhdGVcbiAgICAgIGFsdCA9ICh0eXBlb2YgYWx0ID09PSAnc3RyaW5nJykgPyB7dGV4dDogYWx0fSA6IGFsdCB8fCB7fTtcbiAgICAgIGFsdC50ZXh0ID0gYWx0LnRleHQgfHwgbnVsbDtcbiAgICAgIGFsdC5pZCA9IChhbHQudGV4dCkgPyBhbHQuaWQgfHwgJ3FyY29kZS1kZXNjcmlwdGlvbicgOiBudWxsO1xuXG4gICAgICAvLyBDb21wb3NlIHRpdGxlIHByb3BlcnR5IHN1cnJvZ2F0ZVxuICAgICAgdGl0bGUgPSAodHlwZW9mIHRpdGxlID09PSAnc3RyaW5nJykgPyB7dGV4dDogdGl0bGV9IDogdGl0bGUgfHwge307XG4gICAgICB0aXRsZS50ZXh0ID0gdGl0bGUudGV4dCB8fCBudWxsO1xuICAgICAgdGl0bGUuaWQgPSAodGl0bGUudGV4dCkgPyB0aXRsZS5pZCB8fCAncXJjb2RlLXRpdGxlJyA6IG51bGw7XG5cbiAgICAgIHZhciBzaXplID0gX3RoaXMuZ2V0TW9kdWxlQ291bnQoKSAqIGNlbGxTaXplICsgbWFyZ2luICogMjtcbiAgICAgIHZhciBjLCBtYywgciwgbXIsIHFyU3ZnPScnLCByZWN0O1xuXG4gICAgICByZWN0ID0gJ2wnICsgY2VsbFNpemUgKyAnLDAgMCwnICsgY2VsbFNpemUgK1xuICAgICAgICAnIC0nICsgY2VsbFNpemUgKyAnLDAgMCwtJyArIGNlbGxTaXplICsgJ3ogJztcblxuICAgICAgcXJTdmcgKz0gJzxzdmcgdmVyc2lvbj1cIjEuMVwiIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIic7XG4gICAgICBxclN2ZyArPSAhb3B0cy5zY2FsYWJsZSA/ICcgd2lkdGg9XCInICsgc2l6ZSArICdweFwiIGhlaWdodD1cIicgKyBzaXplICsgJ3B4XCInIDogJyc7XG4gICAgICBxclN2ZyArPSAnIHZpZXdCb3g9XCIwIDAgJyArIHNpemUgKyAnICcgKyBzaXplICsgJ1wiICc7XG4gICAgICBxclN2ZyArPSAnIHByZXNlcnZlQXNwZWN0UmF0aW89XCJ4TWluWU1pbiBtZWV0XCInO1xuICAgICAgcXJTdmcgKz0gKHRpdGxlLnRleHQgfHwgYWx0LnRleHQpID8gJyByb2xlPVwiaW1nXCIgYXJpYS1sYWJlbGxlZGJ5PVwiJyArXG4gICAgICAgICAgZXNjYXBlWG1sKFt0aXRsZS5pZCwgYWx0LmlkXS5qb2luKCcgJykudHJpbSgpICkgKyAnXCInIDogJyc7XG4gICAgICBxclN2ZyArPSAnPic7XG4gICAgICBxclN2ZyArPSAodGl0bGUudGV4dCkgPyAnPHRpdGxlIGlkPVwiJyArIGVzY2FwZVhtbCh0aXRsZS5pZCkgKyAnXCI+JyArXG4gICAgICAgICAgZXNjYXBlWG1sKHRpdGxlLnRleHQpICsgJzwvdGl0bGU+JyA6ICcnO1xuICAgICAgcXJTdmcgKz0gKGFsdC50ZXh0KSA/ICc8ZGVzY3JpcHRpb24gaWQ9XCInICsgZXNjYXBlWG1sKGFsdC5pZCkgKyAnXCI+JyArXG4gICAgICAgICAgZXNjYXBlWG1sKGFsdC50ZXh0KSArICc8L2Rlc2NyaXB0aW9uPicgOiAnJztcbiAgICAgIHFyU3ZnICs9ICc8cmVjdCB3aWR0aD1cIjEwMCVcIiBoZWlnaHQ9XCIxMDAlXCIgZmlsbD1cIndoaXRlXCIgY3g9XCIwXCIgY3k9XCIwXCIvPic7XG4gICAgICBxclN2ZyArPSAnPHBhdGggZD1cIic7XG5cbiAgICAgIGZvciAociA9IDA7IHIgPCBfdGhpcy5nZXRNb2R1bGVDb3VudCgpOyByICs9IDEpIHtcbiAgICAgICAgbXIgPSByICogY2VsbFNpemUgKyBtYXJnaW47XG4gICAgICAgIGZvciAoYyA9IDA7IGMgPCBfdGhpcy5nZXRNb2R1bGVDb3VudCgpOyBjICs9IDEpIHtcbiAgICAgICAgICBpZiAoX3RoaXMuaXNEYXJrKHIsIGMpICkge1xuICAgICAgICAgICAgbWMgPSBjKmNlbGxTaXplK21hcmdpbjtcbiAgICAgICAgICAgIHFyU3ZnICs9ICdNJyArIG1jICsgJywnICsgbXIgKyByZWN0O1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBxclN2ZyArPSAnXCIgc3Ryb2tlPVwidHJhbnNwYXJlbnRcIiBmaWxsPVwiYmxhY2tcIi8+JztcbiAgICAgIHFyU3ZnICs9ICc8L3N2Zz4nO1xuXG4gICAgICByZXR1cm4gcXJTdmc7XG4gICAgfTtcblxuICAgIF90aGlzLmNyZWF0ZURhdGFVUkwgPSBmdW5jdGlvbihjZWxsU2l6ZSwgbWFyZ2luKSB7XG5cbiAgICAgIGNlbGxTaXplID0gY2VsbFNpemUgfHwgMjtcbiAgICAgIG1hcmdpbiA9ICh0eXBlb2YgbWFyZ2luID09ICd1bmRlZmluZWQnKT8gY2VsbFNpemUgKiA0IDogbWFyZ2luO1xuXG4gICAgICB2YXIgc2l6ZSA9IF90aGlzLmdldE1vZHVsZUNvdW50KCkgKiBjZWxsU2l6ZSArIG1hcmdpbiAqIDI7XG4gICAgICB2YXIgbWluID0gbWFyZ2luO1xuICAgICAgdmFyIG1heCA9IHNpemUgLSBtYXJnaW47XG5cbiAgICAgIHJldHVybiBjcmVhdGVEYXRhVVJMKHNpemUsIHNpemUsIGZ1bmN0aW9uKHgsIHkpIHtcbiAgICAgICAgaWYgKG1pbiA8PSB4ICYmIHggPCBtYXggJiYgbWluIDw9IHkgJiYgeSA8IG1heCkge1xuICAgICAgICAgIHZhciBjID0gTWF0aC5mbG9vciggKHggLSBtaW4pIC8gY2VsbFNpemUpO1xuICAgICAgICAgIHZhciByID0gTWF0aC5mbG9vciggKHkgLSBtaW4pIC8gY2VsbFNpemUpO1xuICAgICAgICAgIHJldHVybiBfdGhpcy5pc0RhcmsociwgYyk/IDAgOiAxO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICB9XG4gICAgICB9ICk7XG4gICAgfTtcblxuICAgIF90aGlzLmNyZWF0ZUltZ1RhZyA9IGZ1bmN0aW9uKGNlbGxTaXplLCBtYXJnaW4sIGFsdCkge1xuXG4gICAgICBjZWxsU2l6ZSA9IGNlbGxTaXplIHx8IDI7XG4gICAgICBtYXJnaW4gPSAodHlwZW9mIG1hcmdpbiA9PSAndW5kZWZpbmVkJyk/IGNlbGxTaXplICogNCA6IG1hcmdpbjtcblxuICAgICAgdmFyIHNpemUgPSBfdGhpcy5nZXRNb2R1bGVDb3VudCgpICogY2VsbFNpemUgKyBtYXJnaW4gKiAyO1xuXG4gICAgICB2YXIgaW1nID0gJyc7XG4gICAgICBpbWcgKz0gJzxpbWcnO1xuICAgICAgaW1nICs9ICdcXHUwMDIwc3JjPVwiJztcbiAgICAgIGltZyArPSBfdGhpcy5jcmVhdGVEYXRhVVJMKGNlbGxTaXplLCBtYXJnaW4pO1xuICAgICAgaW1nICs9ICdcIic7XG4gICAgICBpbWcgKz0gJ1xcdTAwMjB3aWR0aD1cIic7XG4gICAgICBpbWcgKz0gc2l6ZTtcbiAgICAgIGltZyArPSAnXCInO1xuICAgICAgaW1nICs9ICdcXHUwMDIwaGVpZ2h0PVwiJztcbiAgICAgIGltZyArPSBzaXplO1xuICAgICAgaW1nICs9ICdcIic7XG4gICAgICBpZiAoYWx0KSB7XG4gICAgICAgIGltZyArPSAnXFx1MDAyMGFsdD1cIic7XG4gICAgICAgIGltZyArPSBlc2NhcGVYbWwoYWx0KTtcbiAgICAgICAgaW1nICs9ICdcIic7XG4gICAgICB9XG4gICAgICBpbWcgKz0gJy8+JztcblxuICAgICAgcmV0dXJuIGltZztcbiAgICB9O1xuXG4gICAgdmFyIGVzY2FwZVhtbCA9IGZ1bmN0aW9uKHMpIHtcbiAgICAgIHZhciBlc2NhcGVkID0gJyc7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgdmFyIGMgPSBzLmNoYXJBdChpKTtcbiAgICAgICAgc3dpdGNoKGMpIHtcbiAgICAgICAgY2FzZSAnPCc6IGVzY2FwZWQgKz0gJyZsdDsnOyBicmVhaztcbiAgICAgICAgY2FzZSAnPic6IGVzY2FwZWQgKz0gJyZndDsnOyBicmVhaztcbiAgICAgICAgY2FzZSAnJic6IGVzY2FwZWQgKz0gJyZhbXA7JzsgYnJlYWs7XG4gICAgICAgIGNhc2UgJ1wiJzogZXNjYXBlZCArPSAnJnF1b3Q7JzsgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQgOiBlc2NhcGVkICs9IGM7IGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gZXNjYXBlZDtcbiAgICB9O1xuXG4gICAgdmFyIF9jcmVhdGVIYWxmQVNDSUkgPSBmdW5jdGlvbihtYXJnaW4pIHtcbiAgICAgIHZhciBjZWxsU2l6ZSA9IDE7XG4gICAgICBtYXJnaW4gPSAodHlwZW9mIG1hcmdpbiA9PSAndW5kZWZpbmVkJyk/IGNlbGxTaXplICogMiA6IG1hcmdpbjtcblxuICAgICAgdmFyIHNpemUgPSBfdGhpcy5nZXRNb2R1bGVDb3VudCgpICogY2VsbFNpemUgKyBtYXJnaW4gKiAyO1xuICAgICAgdmFyIG1pbiA9IG1hcmdpbjtcbiAgICAgIHZhciBtYXggPSBzaXplIC0gbWFyZ2luO1xuXG4gICAgICB2YXIgeSwgeCwgcjEsIHIyLCBwO1xuXG4gICAgICB2YXIgYmxvY2tzID0ge1xuICAgICAgICAn4paI4paIJzogJ+KWiCcsXG4gICAgICAgICfiloggJzogJ+KWgCcsXG4gICAgICAgICcg4paIJzogJ+KWhCcsXG4gICAgICAgICcgICc6ICcgJ1xuICAgICAgfTtcblxuICAgICAgdmFyIGJsb2Nrc0xhc3RMaW5lTm9NYXJnaW4gPSB7XG4gICAgICAgICfilojilognOiAn4paAJyxcbiAgICAgICAgJ+KWiCAnOiAn4paAJyxcbiAgICAgICAgJyDilognOiAnICcsXG4gICAgICAgICcgICc6ICcgJ1xuICAgICAgfTtcblxuICAgICAgdmFyIGFzY2lpID0gJyc7XG4gICAgICBmb3IgKHkgPSAwOyB5IDwgc2l6ZTsgeSArPSAyKSB7XG4gICAgICAgIHIxID0gTWF0aC5mbG9vcigoeSAtIG1pbikgLyBjZWxsU2l6ZSk7XG4gICAgICAgIHIyID0gTWF0aC5mbG9vcigoeSArIDEgLSBtaW4pIC8gY2VsbFNpemUpO1xuICAgICAgICBmb3IgKHggPSAwOyB4IDwgc2l6ZTsgeCArPSAxKSB7XG4gICAgICAgICAgcCA9ICfilognO1xuXG4gICAgICAgICAgaWYgKG1pbiA8PSB4ICYmIHggPCBtYXggJiYgbWluIDw9IHkgJiYgeSA8IG1heCAmJiBfdGhpcy5pc0RhcmsocjEsIE1hdGguZmxvb3IoKHggLSBtaW4pIC8gY2VsbFNpemUpKSkge1xuICAgICAgICAgICAgcCA9ICcgJztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAobWluIDw9IHggJiYgeCA8IG1heCAmJiBtaW4gPD0geSsxICYmIHkrMSA8IG1heCAmJiBfdGhpcy5pc0RhcmsocjIsIE1hdGguZmxvb3IoKHggLSBtaW4pIC8gY2VsbFNpemUpKSkge1xuICAgICAgICAgICAgcCArPSAnICc7XG4gICAgICAgICAgfVxuICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcCArPSAn4paIJztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBPdXRwdXQgMiBjaGFyYWN0ZXJzIHBlciBwaXhlbCwgdG8gY3JlYXRlIGZ1bGwgc3F1YXJlLiAxIGNoYXJhY3RlciBwZXIgcGl4ZWxzIGdpdmVzIG9ubHkgaGFsZiB3aWR0aCBvZiBzcXVhcmUuXG4gICAgICAgICAgYXNjaWkgKz0gKG1hcmdpbiA8IDEgJiYgeSsxID49IG1heCkgPyBibG9ja3NMYXN0TGluZU5vTWFyZ2luW3BdIDogYmxvY2tzW3BdO1xuICAgICAgICB9XG5cbiAgICAgICAgYXNjaWkgKz0gJ1xcbic7XG4gICAgICB9XG5cbiAgICAgIGlmIChzaXplICUgMiAmJiBtYXJnaW4gPiAwKSB7XG4gICAgICAgIHJldHVybiBhc2NpaS5zdWJzdHJpbmcoMCwgYXNjaWkubGVuZ3RoIC0gc2l6ZSAtIDEpICsgQXJyYXkoc2l6ZSsxKS5qb2luKCfiloAnKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGFzY2lpLnN1YnN0cmluZygwLCBhc2NpaS5sZW5ndGgtMSk7XG4gICAgfTtcblxuICAgIF90aGlzLmNyZWF0ZUFTQ0lJID0gZnVuY3Rpb24oY2VsbFNpemUsIG1hcmdpbikge1xuICAgICAgY2VsbFNpemUgPSBjZWxsU2l6ZSB8fCAxO1xuXG4gICAgICBpZiAoY2VsbFNpemUgPCAyKSB7XG4gICAgICAgIHJldHVybiBfY3JlYXRlSGFsZkFTQ0lJKG1hcmdpbik7XG4gICAgICB9XG5cbiAgICAgIGNlbGxTaXplIC09IDE7XG4gICAgICBtYXJnaW4gPSAodHlwZW9mIG1hcmdpbiA9PSAndW5kZWZpbmVkJyk/IGNlbGxTaXplICogMiA6IG1hcmdpbjtcblxuICAgICAgdmFyIHNpemUgPSBfdGhpcy5nZXRNb2R1bGVDb3VudCgpICogY2VsbFNpemUgKyBtYXJnaW4gKiAyO1xuICAgICAgdmFyIG1pbiA9IG1hcmdpbjtcbiAgICAgIHZhciBtYXggPSBzaXplIC0gbWFyZ2luO1xuXG4gICAgICB2YXIgeSwgeCwgciwgcDtcblxuICAgICAgdmFyIHdoaXRlID0gQXJyYXkoY2VsbFNpemUrMSkuam9pbign4paI4paIJyk7XG4gICAgICB2YXIgYmxhY2sgPSBBcnJheShjZWxsU2l6ZSsxKS5qb2luKCcgICcpO1xuXG4gICAgICB2YXIgYXNjaWkgPSAnJztcbiAgICAgIHZhciBsaW5lID0gJyc7XG4gICAgICBmb3IgKHkgPSAwOyB5IDwgc2l6ZTsgeSArPSAxKSB7XG4gICAgICAgIHIgPSBNYXRoLmZsb29yKCAoeSAtIG1pbikgLyBjZWxsU2l6ZSk7XG4gICAgICAgIGxpbmUgPSAnJztcbiAgICAgICAgZm9yICh4ID0gMDsgeCA8IHNpemU7IHggKz0gMSkge1xuICAgICAgICAgIHAgPSAxO1xuXG4gICAgICAgICAgaWYgKG1pbiA8PSB4ICYmIHggPCBtYXggJiYgbWluIDw9IHkgJiYgeSA8IG1heCAmJiBfdGhpcy5pc0RhcmsociwgTWF0aC5mbG9vcigoeCAtIG1pbikgLyBjZWxsU2l6ZSkpKSB7XG4gICAgICAgICAgICBwID0gMDtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBPdXRwdXQgMiBjaGFyYWN0ZXJzIHBlciBwaXhlbCwgdG8gY3JlYXRlIGZ1bGwgc3F1YXJlLiAxIGNoYXJhY3RlciBwZXIgcGl4ZWxzIGdpdmVzIG9ubHkgaGFsZiB3aWR0aCBvZiBzcXVhcmUuXG4gICAgICAgICAgbGluZSArPSBwID8gd2hpdGUgOiBibGFjaztcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAociA9IDA7IHIgPCBjZWxsU2l6ZTsgciArPSAxKSB7XG4gICAgICAgICAgYXNjaWkgKz0gbGluZSArICdcXG4nO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBhc2NpaS5zdWJzdHJpbmcoMCwgYXNjaWkubGVuZ3RoLTEpO1xuICAgIH07XG5cbiAgICBfdGhpcy5yZW5kZXJUbzJkQ29udGV4dCA9IGZ1bmN0aW9uKGNvbnRleHQsIGNlbGxTaXplKSB7XG4gICAgICBjZWxsU2l6ZSA9IGNlbGxTaXplIHx8IDI7XG4gICAgICB2YXIgbGVuZ3RoID0gX3RoaXMuZ2V0TW9kdWxlQ291bnQoKTtcbiAgICAgIGZvciAodmFyIHJvdyA9IDA7IHJvdyA8IGxlbmd0aDsgcm93KyspIHtcbiAgICAgICAgZm9yICh2YXIgY29sID0gMDsgY29sIDwgbGVuZ3RoOyBjb2wrKykge1xuICAgICAgICAgIGNvbnRleHQuZmlsbFN0eWxlID0gX3RoaXMuaXNEYXJrKHJvdywgY29sKSA/ICdibGFjaycgOiAnd2hpdGUnO1xuICAgICAgICAgIGNvbnRleHQuZmlsbFJlY3Qocm93ICogY2VsbFNpemUsIGNvbCAqIGNlbGxTaXplLCBjZWxsU2l6ZSwgY2VsbFNpemUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIF90aGlzO1xuICB9O1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIHFyY29kZS5zdHJpbmdUb0J5dGVzXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgcXJjb2RlLnN0cmluZ1RvQnl0ZXNGdW5jcyA9IHtcbiAgICAnZGVmYXVsdCcgOiBmdW5jdGlvbihzKSB7XG4gICAgICB2YXIgYnl0ZXMgPSBbXTtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICB2YXIgYyA9IHMuY2hhckNvZGVBdChpKTtcbiAgICAgICAgYnl0ZXMucHVzaChjICYgMHhmZik7XG4gICAgICB9XG4gICAgICByZXR1cm4gYnl0ZXM7XG4gICAgfVxuICB9O1xuXG4gIHFyY29kZS5zdHJpbmdUb0J5dGVzID0gcXJjb2RlLnN0cmluZ1RvQnl0ZXNGdW5jc1snZGVmYXVsdCddO1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIHFyY29kZS5jcmVhdGVTdHJpbmdUb0J5dGVzXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgLyoqXG4gICAqIEBwYXJhbSB1bmljb2RlRGF0YSBiYXNlNjQgc3RyaW5nIG9mIGJ5dGUgYXJyYXkuXG4gICAqIFsxNmJpdCBVbmljb2RlXSxbMTZiaXQgQnl0ZXNdLCAuLi5cbiAgICogQHBhcmFtIG51bUNoYXJzXG4gICAqL1xuICBxcmNvZGUuY3JlYXRlU3RyaW5nVG9CeXRlcyA9IGZ1bmN0aW9uKHVuaWNvZGVEYXRhLCBudW1DaGFycykge1xuXG4gICAgLy8gY3JlYXRlIGNvbnZlcnNpb24gbWFwLlxuXG4gICAgdmFyIHVuaWNvZGVNYXAgPSBmdW5jdGlvbigpIHtcblxuICAgICAgdmFyIGJpbiA9IGJhc2U2NERlY29kZUlucHV0U3RyZWFtKHVuaWNvZGVEYXRhKTtcbiAgICAgIHZhciByZWFkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBiID0gYmluLnJlYWQoKTtcbiAgICAgICAgaWYgKGIgPT0gLTEpIHRocm93ICdlb2YnO1xuICAgICAgICByZXR1cm4gYjtcbiAgICAgIH07XG5cbiAgICAgIHZhciBjb3VudCA9IDA7XG4gICAgICB2YXIgdW5pY29kZU1hcCA9IHt9O1xuICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgdmFyIGIwID0gYmluLnJlYWQoKTtcbiAgICAgICAgaWYgKGIwID09IC0xKSBicmVhaztcbiAgICAgICAgdmFyIGIxID0gcmVhZCgpO1xuICAgICAgICB2YXIgYjIgPSByZWFkKCk7XG4gICAgICAgIHZhciBiMyA9IHJlYWQoKTtcbiAgICAgICAgdmFyIGsgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKCAoYjAgPDwgOCkgfCBiMSk7XG4gICAgICAgIHZhciB2ID0gKGIyIDw8IDgpIHwgYjM7XG4gICAgICAgIHVuaWNvZGVNYXBba10gPSB2O1xuICAgICAgICBjb3VudCArPSAxO1xuICAgICAgfVxuICAgICAgaWYgKGNvdW50ICE9IG51bUNoYXJzKSB7XG4gICAgICAgIHRocm93IGNvdW50ICsgJyAhPSAnICsgbnVtQ2hhcnM7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB1bmljb2RlTWFwO1xuICAgIH0oKTtcblxuICAgIHZhciB1bmtub3duQ2hhciA9ICc/Jy5jaGFyQ29kZUF0KDApO1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uKHMpIHtcbiAgICAgIHZhciBieXRlcyA9IFtdO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIHZhciBjID0gcy5jaGFyQ29kZUF0KGkpO1xuICAgICAgICBpZiAoYyA8IDEyOCkge1xuICAgICAgICAgIGJ5dGVzLnB1c2goYyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdmFyIGIgPSB1bmljb2RlTWFwW3MuY2hhckF0KGkpXTtcbiAgICAgICAgICBpZiAodHlwZW9mIGIgPT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgIGlmICggKGIgJiAweGZmKSA9PSBiKSB7XG4gICAgICAgICAgICAgIC8vIDFieXRlXG4gICAgICAgICAgICAgIGJ5dGVzLnB1c2goYik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAvLyAyYnl0ZXNcbiAgICAgICAgICAgICAgYnl0ZXMucHVzaChiID4+PiA4KTtcbiAgICAgICAgICAgICAgYnl0ZXMucHVzaChiICYgMHhmZik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGJ5dGVzLnB1c2godW5rbm93bkNoYXIpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIGJ5dGVzO1xuICAgIH07XG4gIH07XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gUVJNb2RlXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgdmFyIFFSTW9kZSA9IHtcbiAgICBNT0RFX05VTUJFUiA6ICAgIDEgPDwgMCxcbiAgICBNT0RFX0FMUEhBX05VTSA6IDEgPDwgMSxcbiAgICBNT0RFXzhCSVRfQllURSA6IDEgPDwgMixcbiAgICBNT0RFX0tBTkpJIDogICAgIDEgPDwgM1xuICB9O1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIFFSRXJyb3JDb3JyZWN0aW9uTGV2ZWxcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICB2YXIgUVJFcnJvckNvcnJlY3Rpb25MZXZlbCA9IHtcbiAgICBMIDogMSxcbiAgICBNIDogMCxcbiAgICBRIDogMyxcbiAgICBIIDogMlxuICB9O1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIFFSTWFza1BhdHRlcm5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICB2YXIgUVJNYXNrUGF0dGVybiA9IHtcbiAgICBQQVRURVJOMDAwIDogMCxcbiAgICBQQVRURVJOMDAxIDogMSxcbiAgICBQQVRURVJOMDEwIDogMixcbiAgICBQQVRURVJOMDExIDogMyxcbiAgICBQQVRURVJOMTAwIDogNCxcbiAgICBQQVRURVJOMTAxIDogNSxcbiAgICBQQVRURVJOMTEwIDogNixcbiAgICBQQVRURVJOMTExIDogN1xuICB9O1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIFFSVXRpbFxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIHZhciBRUlV0aWwgPSBmdW5jdGlvbigpIHtcblxuICAgIHZhciBQQVRURVJOX1BPU0lUSU9OX1RBQkxFID0gW1xuICAgICAgW10sXG4gICAgICBbNiwgMThdLFxuICAgICAgWzYsIDIyXSxcbiAgICAgIFs2LCAyNl0sXG4gICAgICBbNiwgMzBdLFxuICAgICAgWzYsIDM0XSxcbiAgICAgIFs2LCAyMiwgMzhdLFxuICAgICAgWzYsIDI0LCA0Ml0sXG4gICAgICBbNiwgMjYsIDQ2XSxcbiAgICAgIFs2LCAyOCwgNTBdLFxuICAgICAgWzYsIDMwLCA1NF0sXG4gICAgICBbNiwgMzIsIDU4XSxcbiAgICAgIFs2LCAzNCwgNjJdLFxuICAgICAgWzYsIDI2LCA0NiwgNjZdLFxuICAgICAgWzYsIDI2LCA0OCwgNzBdLFxuICAgICAgWzYsIDI2LCA1MCwgNzRdLFxuICAgICAgWzYsIDMwLCA1NCwgNzhdLFxuICAgICAgWzYsIDMwLCA1NiwgODJdLFxuICAgICAgWzYsIDMwLCA1OCwgODZdLFxuICAgICAgWzYsIDM0LCA2MiwgOTBdLFxuICAgICAgWzYsIDI4LCA1MCwgNzIsIDk0XSxcbiAgICAgIFs2LCAyNiwgNTAsIDc0LCA5OF0sXG4gICAgICBbNiwgMzAsIDU0LCA3OCwgMTAyXSxcbiAgICAgIFs2LCAyOCwgNTQsIDgwLCAxMDZdLFxuICAgICAgWzYsIDMyLCA1OCwgODQsIDExMF0sXG4gICAgICBbNiwgMzAsIDU4LCA4NiwgMTE0XSxcbiAgICAgIFs2LCAzNCwgNjIsIDkwLCAxMThdLFxuICAgICAgWzYsIDI2LCA1MCwgNzQsIDk4LCAxMjJdLFxuICAgICAgWzYsIDMwLCA1NCwgNzgsIDEwMiwgMTI2XSxcbiAgICAgIFs2LCAyNiwgNTIsIDc4LCAxMDQsIDEzMF0sXG4gICAgICBbNiwgMzAsIDU2LCA4MiwgMTA4LCAxMzRdLFxuICAgICAgWzYsIDM0LCA2MCwgODYsIDExMiwgMTM4XSxcbiAgICAgIFs2LCAzMCwgNTgsIDg2LCAxMTQsIDE0Ml0sXG4gICAgICBbNiwgMzQsIDYyLCA5MCwgMTE4LCAxNDZdLFxuICAgICAgWzYsIDMwLCA1NCwgNzgsIDEwMiwgMTI2LCAxNTBdLFxuICAgICAgWzYsIDI0LCA1MCwgNzYsIDEwMiwgMTI4LCAxNTRdLFxuICAgICAgWzYsIDI4LCA1NCwgODAsIDEwNiwgMTMyLCAxNThdLFxuICAgICAgWzYsIDMyLCA1OCwgODQsIDExMCwgMTM2LCAxNjJdLFxuICAgICAgWzYsIDI2LCA1NCwgODIsIDExMCwgMTM4LCAxNjZdLFxuICAgICAgWzYsIDMwLCA1OCwgODYsIDExNCwgMTQyLCAxNzBdXG4gICAgXTtcbiAgICB2YXIgRzE1ID0gKDEgPDwgMTApIHwgKDEgPDwgOCkgfCAoMSA8PCA1KSB8ICgxIDw8IDQpIHwgKDEgPDwgMikgfCAoMSA8PCAxKSB8ICgxIDw8IDApO1xuICAgIHZhciBHMTggPSAoMSA8PCAxMikgfCAoMSA8PCAxMSkgfCAoMSA8PCAxMCkgfCAoMSA8PCA5KSB8ICgxIDw8IDgpIHwgKDEgPDwgNSkgfCAoMSA8PCAyKSB8ICgxIDw8IDApO1xuICAgIHZhciBHMTVfTUFTSyA9ICgxIDw8IDE0KSB8ICgxIDw8IDEyKSB8ICgxIDw8IDEwKSB8ICgxIDw8IDQpIHwgKDEgPDwgMSk7XG5cbiAgICB2YXIgX3RoaXMgPSB7fTtcblxuICAgIHZhciBnZXRCQ0hEaWdpdCA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIHZhciBkaWdpdCA9IDA7XG4gICAgICB3aGlsZSAoZGF0YSAhPSAwKSB7XG4gICAgICAgIGRpZ2l0ICs9IDE7XG4gICAgICAgIGRhdGEgPj4+PSAxO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGRpZ2l0O1xuICAgIH07XG5cbiAgICBfdGhpcy5nZXRCQ0hUeXBlSW5mbyA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIHZhciBkID0gZGF0YSA8PCAxMDtcbiAgICAgIHdoaWxlIChnZXRCQ0hEaWdpdChkKSAtIGdldEJDSERpZ2l0KEcxNSkgPj0gMCkge1xuICAgICAgICBkIF49IChHMTUgPDwgKGdldEJDSERpZ2l0KGQpIC0gZ2V0QkNIRGlnaXQoRzE1KSApICk7XG4gICAgICB9XG4gICAgICByZXR1cm4gKCAoZGF0YSA8PCAxMCkgfCBkKSBeIEcxNV9NQVNLO1xuICAgIH07XG5cbiAgICBfdGhpcy5nZXRCQ0hUeXBlTnVtYmVyID0gZnVuY3Rpb24oZGF0YSkge1xuICAgICAgdmFyIGQgPSBkYXRhIDw8IDEyO1xuICAgICAgd2hpbGUgKGdldEJDSERpZ2l0KGQpIC0gZ2V0QkNIRGlnaXQoRzE4KSA+PSAwKSB7XG4gICAgICAgIGQgXj0gKEcxOCA8PCAoZ2V0QkNIRGlnaXQoZCkgLSBnZXRCQ0hEaWdpdChHMTgpICkgKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiAoZGF0YSA8PCAxMikgfCBkO1xuICAgIH07XG5cbiAgICBfdGhpcy5nZXRQYXR0ZXJuUG9zaXRpb24gPSBmdW5jdGlvbih0eXBlTnVtYmVyKSB7XG4gICAgICByZXR1cm4gUEFUVEVSTl9QT1NJVElPTl9UQUJMRVt0eXBlTnVtYmVyIC0gMV07XG4gICAgfTtcblxuICAgIF90aGlzLmdldE1hc2tGdW5jdGlvbiA9IGZ1bmN0aW9uKG1hc2tQYXR0ZXJuKSB7XG5cbiAgICAgIHN3aXRjaCAobWFza1BhdHRlcm4pIHtcblxuICAgICAgY2FzZSBRUk1hc2tQYXR0ZXJuLlBBVFRFUk4wMDAgOlxuICAgICAgICByZXR1cm4gZnVuY3Rpb24oaSwgaikgeyByZXR1cm4gKGkgKyBqKSAlIDIgPT0gMDsgfTtcbiAgICAgIGNhc2UgUVJNYXNrUGF0dGVybi5QQVRURVJOMDAxIDpcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGksIGopIHsgcmV0dXJuIGkgJSAyID09IDA7IH07XG4gICAgICBjYXNlIFFSTWFza1BhdHRlcm4uUEFUVEVSTjAxMCA6XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihpLCBqKSB7IHJldHVybiBqICUgMyA9PSAwOyB9O1xuICAgICAgY2FzZSBRUk1hc2tQYXR0ZXJuLlBBVFRFUk4wMTEgOlxuICAgICAgICByZXR1cm4gZnVuY3Rpb24oaSwgaikgeyByZXR1cm4gKGkgKyBqKSAlIDMgPT0gMDsgfTtcbiAgICAgIGNhc2UgUVJNYXNrUGF0dGVybi5QQVRURVJOMTAwIDpcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGksIGopIHsgcmV0dXJuIChNYXRoLmZsb29yKGkgLyAyKSArIE1hdGguZmxvb3IoaiAvIDMpICkgJSAyID09IDA7IH07XG4gICAgICBjYXNlIFFSTWFza1BhdHRlcm4uUEFUVEVSTjEwMSA6XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihpLCBqKSB7IHJldHVybiAoaSAqIGopICUgMiArIChpICogaikgJSAzID09IDA7IH07XG4gICAgICBjYXNlIFFSTWFza1BhdHRlcm4uUEFUVEVSTjExMCA6XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihpLCBqKSB7IHJldHVybiAoIChpICogaikgJSAyICsgKGkgKiBqKSAlIDMpICUgMiA9PSAwOyB9O1xuICAgICAgY2FzZSBRUk1hc2tQYXR0ZXJuLlBBVFRFUk4xMTEgOlxuICAgICAgICByZXR1cm4gZnVuY3Rpb24oaSwgaikgeyByZXR1cm4gKCAoaSAqIGopICUgMyArIChpICsgaikgJSAyKSAlIDIgPT0gMDsgfTtcblxuICAgICAgZGVmYXVsdCA6XG4gICAgICAgIHRocm93ICdiYWQgbWFza1BhdHRlcm46JyArIG1hc2tQYXR0ZXJuO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBfdGhpcy5nZXRFcnJvckNvcnJlY3RQb2x5bm9taWFsID0gZnVuY3Rpb24oZXJyb3JDb3JyZWN0TGVuZ3RoKSB7XG4gICAgICB2YXIgYSA9IHFyUG9seW5vbWlhbChbMV0sIDApO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBlcnJvckNvcnJlY3RMZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICBhID0gYS5tdWx0aXBseShxclBvbHlub21pYWwoWzEsIFFSTWF0aC5nZXhwKGkpXSwgMCkgKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBhO1xuICAgIH07XG5cbiAgICBfdGhpcy5nZXRMZW5ndGhJbkJpdHMgPSBmdW5jdGlvbihtb2RlLCB0eXBlKSB7XG5cbiAgICAgIGlmICgxIDw9IHR5cGUgJiYgdHlwZSA8IDEwKSB7XG5cbiAgICAgICAgLy8gMSAtIDlcblxuICAgICAgICBzd2l0Y2gobW9kZSkge1xuICAgICAgICBjYXNlIFFSTW9kZS5NT0RFX05VTUJFUiAgICA6IHJldHVybiAxMDtcbiAgICAgICAgY2FzZSBRUk1vZGUuTU9ERV9BTFBIQV9OVU0gOiByZXR1cm4gOTtcbiAgICAgICAgY2FzZSBRUk1vZGUuTU9ERV84QklUX0JZVEUgOiByZXR1cm4gODtcbiAgICAgICAgY2FzZSBRUk1vZGUuTU9ERV9LQU5KSSAgICAgOiByZXR1cm4gODtcbiAgICAgICAgZGVmYXVsdCA6XG4gICAgICAgICAgdGhyb3cgJ21vZGU6JyArIG1vZGU7XG4gICAgICAgIH1cblxuICAgICAgfSBlbHNlIGlmICh0eXBlIDwgMjcpIHtcblxuICAgICAgICAvLyAxMCAtIDI2XG5cbiAgICAgICAgc3dpdGNoKG1vZGUpIHtcbiAgICAgICAgY2FzZSBRUk1vZGUuTU9ERV9OVU1CRVIgICAgOiByZXR1cm4gMTI7XG4gICAgICAgIGNhc2UgUVJNb2RlLk1PREVfQUxQSEFfTlVNIDogcmV0dXJuIDExO1xuICAgICAgICBjYXNlIFFSTW9kZS5NT0RFXzhCSVRfQllURSA6IHJldHVybiAxNjtcbiAgICAgICAgY2FzZSBRUk1vZGUuTU9ERV9LQU5KSSAgICAgOiByZXR1cm4gMTA7XG4gICAgICAgIGRlZmF1bHQgOlxuICAgICAgICAgIHRocm93ICdtb2RlOicgKyBtb2RlO1xuICAgICAgICB9XG5cbiAgICAgIH0gZWxzZSBpZiAodHlwZSA8IDQxKSB7XG5cbiAgICAgICAgLy8gMjcgLSA0MFxuXG4gICAgICAgIHN3aXRjaChtb2RlKSB7XG4gICAgICAgIGNhc2UgUVJNb2RlLk1PREVfTlVNQkVSICAgIDogcmV0dXJuIDE0O1xuICAgICAgICBjYXNlIFFSTW9kZS5NT0RFX0FMUEhBX05VTSA6IHJldHVybiAxMztcbiAgICAgICAgY2FzZSBRUk1vZGUuTU9ERV84QklUX0JZVEUgOiByZXR1cm4gMTY7XG4gICAgICAgIGNhc2UgUVJNb2RlLk1PREVfS0FOSkkgICAgIDogcmV0dXJuIDEyO1xuICAgICAgICBkZWZhdWx0IDpcbiAgICAgICAgICB0aHJvdyAnbW9kZTonICsgbW9kZTtcbiAgICAgICAgfVxuXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyAndHlwZTonICsgdHlwZTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgX3RoaXMuZ2V0TG9zdFBvaW50ID0gZnVuY3Rpb24ocXJjb2RlKSB7XG5cbiAgICAgIHZhciBtb2R1bGVDb3VudCA9IHFyY29kZS5nZXRNb2R1bGVDb3VudCgpO1xuXG4gICAgICB2YXIgbG9zdFBvaW50ID0gMDtcblxuICAgICAgLy8gTEVWRUwxXG5cbiAgICAgIGZvciAodmFyIHJvdyA9IDA7IHJvdyA8IG1vZHVsZUNvdW50OyByb3cgKz0gMSkge1xuICAgICAgICBmb3IgKHZhciBjb2wgPSAwOyBjb2wgPCBtb2R1bGVDb3VudDsgY29sICs9IDEpIHtcblxuICAgICAgICAgIHZhciBzYW1lQ291bnQgPSAwO1xuICAgICAgICAgIHZhciBkYXJrID0gcXJjb2RlLmlzRGFyayhyb3csIGNvbCk7XG5cbiAgICAgICAgICBmb3IgKHZhciByID0gLTE7IHIgPD0gMTsgciArPSAxKSB7XG5cbiAgICAgICAgICAgIGlmIChyb3cgKyByIDwgMCB8fCBtb2R1bGVDb3VudCA8PSByb3cgKyByKSB7XG4gICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmb3IgKHZhciBjID0gLTE7IGMgPD0gMTsgYyArPSAxKSB7XG5cbiAgICAgICAgICAgICAgaWYgKGNvbCArIGMgPCAwIHx8IG1vZHVsZUNvdW50IDw9IGNvbCArIGMpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIGlmIChyID09IDAgJiYgYyA9PSAwKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBpZiAoZGFyayA9PSBxcmNvZGUuaXNEYXJrKHJvdyArIHIsIGNvbCArIGMpICkge1xuICAgICAgICAgICAgICAgIHNhbWVDb3VudCArPSAxO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHNhbWVDb3VudCA+IDUpIHtcbiAgICAgICAgICAgIGxvc3RQb2ludCArPSAoMyArIHNhbWVDb3VudCAtIDUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgLy8gTEVWRUwyXG5cbiAgICAgIGZvciAodmFyIHJvdyA9IDA7IHJvdyA8IG1vZHVsZUNvdW50IC0gMTsgcm93ICs9IDEpIHtcbiAgICAgICAgZm9yICh2YXIgY29sID0gMDsgY29sIDwgbW9kdWxlQ291bnQgLSAxOyBjb2wgKz0gMSkge1xuICAgICAgICAgIHZhciBjb3VudCA9IDA7XG4gICAgICAgICAgaWYgKHFyY29kZS5pc0Rhcmsocm93LCBjb2wpICkgY291bnQgKz0gMTtcbiAgICAgICAgICBpZiAocXJjb2RlLmlzRGFyayhyb3cgKyAxLCBjb2wpICkgY291bnQgKz0gMTtcbiAgICAgICAgICBpZiAocXJjb2RlLmlzRGFyayhyb3csIGNvbCArIDEpICkgY291bnQgKz0gMTtcbiAgICAgICAgICBpZiAocXJjb2RlLmlzRGFyayhyb3cgKyAxLCBjb2wgKyAxKSApIGNvdW50ICs9IDE7XG4gICAgICAgICAgaWYgKGNvdW50ID09IDAgfHwgY291bnQgPT0gNCkge1xuICAgICAgICAgICAgbG9zdFBvaW50ICs9IDM7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIExFVkVMM1xuXG4gICAgICBmb3IgKHZhciByb3cgPSAwOyByb3cgPCBtb2R1bGVDb3VudDsgcm93ICs9IDEpIHtcbiAgICAgICAgZm9yICh2YXIgY29sID0gMDsgY29sIDwgbW9kdWxlQ291bnQgLSA2OyBjb2wgKz0gMSkge1xuICAgICAgICAgIGlmIChxcmNvZGUuaXNEYXJrKHJvdywgY29sKVxuICAgICAgICAgICAgICAmJiAhcXJjb2RlLmlzRGFyayhyb3csIGNvbCArIDEpXG4gICAgICAgICAgICAgICYmICBxcmNvZGUuaXNEYXJrKHJvdywgY29sICsgMilcbiAgICAgICAgICAgICAgJiYgIHFyY29kZS5pc0Rhcmsocm93LCBjb2wgKyAzKVxuICAgICAgICAgICAgICAmJiAgcXJjb2RlLmlzRGFyayhyb3csIGNvbCArIDQpXG4gICAgICAgICAgICAgICYmICFxcmNvZGUuaXNEYXJrKHJvdywgY29sICsgNSlcbiAgICAgICAgICAgICAgJiYgIHFyY29kZS5pc0Rhcmsocm93LCBjb2wgKyA2KSApIHtcbiAgICAgICAgICAgIGxvc3RQb2ludCArPSA0MDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgZm9yICh2YXIgY29sID0gMDsgY29sIDwgbW9kdWxlQ291bnQ7IGNvbCArPSAxKSB7XG4gICAgICAgIGZvciAodmFyIHJvdyA9IDA7IHJvdyA8IG1vZHVsZUNvdW50IC0gNjsgcm93ICs9IDEpIHtcbiAgICAgICAgICBpZiAocXJjb2RlLmlzRGFyayhyb3csIGNvbClcbiAgICAgICAgICAgICAgJiYgIXFyY29kZS5pc0Rhcmsocm93ICsgMSwgY29sKVxuICAgICAgICAgICAgICAmJiAgcXJjb2RlLmlzRGFyayhyb3cgKyAyLCBjb2wpXG4gICAgICAgICAgICAgICYmICBxcmNvZGUuaXNEYXJrKHJvdyArIDMsIGNvbClcbiAgICAgICAgICAgICAgJiYgIHFyY29kZS5pc0Rhcmsocm93ICsgNCwgY29sKVxuICAgICAgICAgICAgICAmJiAhcXJjb2RlLmlzRGFyayhyb3cgKyA1LCBjb2wpXG4gICAgICAgICAgICAgICYmICBxcmNvZGUuaXNEYXJrKHJvdyArIDYsIGNvbCkgKSB7XG4gICAgICAgICAgICBsb3N0UG9pbnQgKz0gNDA7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIExFVkVMNFxuXG4gICAgICB2YXIgZGFya0NvdW50ID0gMDtcblxuICAgICAgZm9yICh2YXIgY29sID0gMDsgY29sIDwgbW9kdWxlQ291bnQ7IGNvbCArPSAxKSB7XG4gICAgICAgIGZvciAodmFyIHJvdyA9IDA7IHJvdyA8IG1vZHVsZUNvdW50OyByb3cgKz0gMSkge1xuICAgICAgICAgIGlmIChxcmNvZGUuaXNEYXJrKHJvdywgY29sKSApIHtcbiAgICAgICAgICAgIGRhcmtDb3VudCArPSAxO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB2YXIgcmF0aW8gPSBNYXRoLmFicygxMDAgKiBkYXJrQ291bnQgLyBtb2R1bGVDb3VudCAvIG1vZHVsZUNvdW50IC0gNTApIC8gNTtcbiAgICAgIGxvc3RQb2ludCArPSByYXRpbyAqIDEwO1xuXG4gICAgICByZXR1cm4gbG9zdFBvaW50O1xuICAgIH07XG5cbiAgICByZXR1cm4gX3RoaXM7XG4gIH0oKTtcblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBRUk1hdGhcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICB2YXIgUVJNYXRoID0gZnVuY3Rpb24oKSB7XG5cbiAgICB2YXIgRVhQX1RBQkxFID0gbmV3IEFycmF5KDI1Nik7XG4gICAgdmFyIExPR19UQUJMRSA9IG5ldyBBcnJheSgyNTYpO1xuXG4gICAgLy8gaW5pdGlhbGl6ZSB0YWJsZXNcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDg7IGkgKz0gMSkge1xuICAgICAgRVhQX1RBQkxFW2ldID0gMSA8PCBpO1xuICAgIH1cbiAgICBmb3IgKHZhciBpID0gODsgaSA8IDI1NjsgaSArPSAxKSB7XG4gICAgICBFWFBfVEFCTEVbaV0gPSBFWFBfVEFCTEVbaSAtIDRdXG4gICAgICAgIF4gRVhQX1RBQkxFW2kgLSA1XVxuICAgICAgICBeIEVYUF9UQUJMRVtpIC0gNl1cbiAgICAgICAgXiBFWFBfVEFCTEVbaSAtIDhdO1xuICAgIH1cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDI1NTsgaSArPSAxKSB7XG4gICAgICBMT0dfVEFCTEVbRVhQX1RBQkxFW2ldIF0gPSBpO1xuICAgIH1cblxuICAgIHZhciBfdGhpcyA9IHt9O1xuXG4gICAgX3RoaXMuZ2xvZyA9IGZ1bmN0aW9uKG4pIHtcblxuICAgICAgaWYgKG4gPCAxKSB7XG4gICAgICAgIHRocm93ICdnbG9nKCcgKyBuICsgJyknO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gTE9HX1RBQkxFW25dO1xuICAgIH07XG5cbiAgICBfdGhpcy5nZXhwID0gZnVuY3Rpb24obikge1xuXG4gICAgICB3aGlsZSAobiA8IDApIHtcbiAgICAgICAgbiArPSAyNTU7XG4gICAgICB9XG5cbiAgICAgIHdoaWxlIChuID49IDI1Nikge1xuICAgICAgICBuIC09IDI1NTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIEVYUF9UQUJMRVtuXTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIF90aGlzO1xuICB9KCk7XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gcXJQb2x5bm9taWFsXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgZnVuY3Rpb24gcXJQb2x5bm9taWFsKG51bSwgc2hpZnQpIHtcblxuICAgIGlmICh0eXBlb2YgbnVtLmxlbmd0aCA9PSAndW5kZWZpbmVkJykge1xuICAgICAgdGhyb3cgbnVtLmxlbmd0aCArICcvJyArIHNoaWZ0O1xuICAgIH1cblxuICAgIHZhciBfbnVtID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgb2Zmc2V0ID0gMDtcbiAgICAgIHdoaWxlIChvZmZzZXQgPCBudW0ubGVuZ3RoICYmIG51bVtvZmZzZXRdID09IDApIHtcbiAgICAgICAgb2Zmc2V0ICs9IDE7XG4gICAgICB9XG4gICAgICB2YXIgX251bSA9IG5ldyBBcnJheShudW0ubGVuZ3RoIC0gb2Zmc2V0ICsgc2hpZnQpO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBudW0ubGVuZ3RoIC0gb2Zmc2V0OyBpICs9IDEpIHtcbiAgICAgICAgX251bVtpXSA9IG51bVtpICsgb2Zmc2V0XTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBfbnVtO1xuICAgIH0oKTtcblxuICAgIHZhciBfdGhpcyA9IHt9O1xuXG4gICAgX3RoaXMuZ2V0QXQgPSBmdW5jdGlvbihpbmRleCkge1xuICAgICAgcmV0dXJuIF9udW1baW5kZXhdO1xuICAgIH07XG5cbiAgICBfdGhpcy5nZXRMZW5ndGggPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBfbnVtLmxlbmd0aDtcbiAgICB9O1xuXG4gICAgX3RoaXMubXVsdGlwbHkgPSBmdW5jdGlvbihlKSB7XG5cbiAgICAgIHZhciBudW0gPSBuZXcgQXJyYXkoX3RoaXMuZ2V0TGVuZ3RoKCkgKyBlLmdldExlbmd0aCgpIC0gMSk7XG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgX3RoaXMuZ2V0TGVuZ3RoKCk7IGkgKz0gMSkge1xuICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGUuZ2V0TGVuZ3RoKCk7IGogKz0gMSkge1xuICAgICAgICAgIG51bVtpICsgal0gXj0gUVJNYXRoLmdleHAoUVJNYXRoLmdsb2coX3RoaXMuZ2V0QXQoaSkgKSArIFFSTWF0aC5nbG9nKGUuZ2V0QXQoaikgKSApO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBxclBvbHlub21pYWwobnVtLCAwKTtcbiAgICB9O1xuXG4gICAgX3RoaXMubW9kID0gZnVuY3Rpb24oZSkge1xuXG4gICAgICBpZiAoX3RoaXMuZ2V0TGVuZ3RoKCkgLSBlLmdldExlbmd0aCgpIDwgMCkge1xuICAgICAgICByZXR1cm4gX3RoaXM7XG4gICAgICB9XG5cbiAgICAgIHZhciByYXRpbyA9IFFSTWF0aC5nbG9nKF90aGlzLmdldEF0KDApICkgLSBRUk1hdGguZ2xvZyhlLmdldEF0KDApICk7XG5cbiAgICAgIHZhciBudW0gPSBuZXcgQXJyYXkoX3RoaXMuZ2V0TGVuZ3RoKCkgKTtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgX3RoaXMuZ2V0TGVuZ3RoKCk7IGkgKz0gMSkge1xuICAgICAgICBudW1baV0gPSBfdGhpcy5nZXRBdChpKTtcbiAgICAgIH1cblxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBlLmdldExlbmd0aCgpOyBpICs9IDEpIHtcbiAgICAgICAgbnVtW2ldIF49IFFSTWF0aC5nZXhwKFFSTWF0aC5nbG9nKGUuZ2V0QXQoaSkgKSArIHJhdGlvKTtcbiAgICAgIH1cblxuICAgICAgLy8gcmVjdXJzaXZlIGNhbGxcbiAgICAgIHJldHVybiBxclBvbHlub21pYWwobnVtLCAwKS5tb2QoZSk7XG4gICAgfTtcblxuICAgIHJldHVybiBfdGhpcztcbiAgfTtcblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBRUlJTQmxvY2tcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICB2YXIgUVJSU0Jsb2NrID0gZnVuY3Rpb24oKSB7XG5cbiAgICB2YXIgUlNfQkxPQ0tfVEFCTEUgPSBbXG5cbiAgICAgIC8vIExcbiAgICAgIC8vIE1cbiAgICAgIC8vIFFcbiAgICAgIC8vIEhcblxuICAgICAgLy8gMVxuICAgICAgWzEsIDI2LCAxOV0sXG4gICAgICBbMSwgMjYsIDE2XSxcbiAgICAgIFsxLCAyNiwgMTNdLFxuICAgICAgWzEsIDI2LCA5XSxcblxuICAgICAgLy8gMlxuICAgICAgWzEsIDQ0LCAzNF0sXG4gICAgICBbMSwgNDQsIDI4XSxcbiAgICAgIFsxLCA0NCwgMjJdLFxuICAgICAgWzEsIDQ0LCAxNl0sXG5cbiAgICAgIC8vIDNcbiAgICAgIFsxLCA3MCwgNTVdLFxuICAgICAgWzEsIDcwLCA0NF0sXG4gICAgICBbMiwgMzUsIDE3XSxcbiAgICAgIFsyLCAzNSwgMTNdLFxuXG4gICAgICAvLyA0XG4gICAgICBbMSwgMTAwLCA4MF0sXG4gICAgICBbMiwgNTAsIDMyXSxcbiAgICAgIFsyLCA1MCwgMjRdLFxuICAgICAgWzQsIDI1LCA5XSxcblxuICAgICAgLy8gNVxuICAgICAgWzEsIDEzNCwgMTA4XSxcbiAgICAgIFsyLCA2NywgNDNdLFxuICAgICAgWzIsIDMzLCAxNSwgMiwgMzQsIDE2XSxcbiAgICAgIFsyLCAzMywgMTEsIDIsIDM0LCAxMl0sXG5cbiAgICAgIC8vIDZcbiAgICAgIFsyLCA4NiwgNjhdLFxuICAgICAgWzQsIDQzLCAyN10sXG4gICAgICBbNCwgNDMsIDE5XSxcbiAgICAgIFs0LCA0MywgMTVdLFxuXG4gICAgICAvLyA3XG4gICAgICBbMiwgOTgsIDc4XSxcbiAgICAgIFs0LCA0OSwgMzFdLFxuICAgICAgWzIsIDMyLCAxNCwgNCwgMzMsIDE1XSxcbiAgICAgIFs0LCAzOSwgMTMsIDEsIDQwLCAxNF0sXG5cbiAgICAgIC8vIDhcbiAgICAgIFsyLCAxMjEsIDk3XSxcbiAgICAgIFsyLCA2MCwgMzgsIDIsIDYxLCAzOV0sXG4gICAgICBbNCwgNDAsIDE4LCAyLCA0MSwgMTldLFxuICAgICAgWzQsIDQwLCAxNCwgMiwgNDEsIDE1XSxcblxuICAgICAgLy8gOVxuICAgICAgWzIsIDE0NiwgMTE2XSxcbiAgICAgIFszLCA1OCwgMzYsIDIsIDU5LCAzN10sXG4gICAgICBbNCwgMzYsIDE2LCA0LCAzNywgMTddLFxuICAgICAgWzQsIDM2LCAxMiwgNCwgMzcsIDEzXSxcblxuICAgICAgLy8gMTBcbiAgICAgIFsyLCA4NiwgNjgsIDIsIDg3LCA2OV0sXG4gICAgICBbNCwgNjksIDQzLCAxLCA3MCwgNDRdLFxuICAgICAgWzYsIDQzLCAxOSwgMiwgNDQsIDIwXSxcbiAgICAgIFs2LCA0MywgMTUsIDIsIDQ0LCAxNl0sXG5cbiAgICAgIC8vIDExXG4gICAgICBbNCwgMTAxLCA4MV0sXG4gICAgICBbMSwgODAsIDUwLCA0LCA4MSwgNTFdLFxuICAgICAgWzQsIDUwLCAyMiwgNCwgNTEsIDIzXSxcbiAgICAgIFszLCAzNiwgMTIsIDgsIDM3LCAxM10sXG5cbiAgICAgIC8vIDEyXG4gICAgICBbMiwgMTE2LCA5MiwgMiwgMTE3LCA5M10sXG4gICAgICBbNiwgNTgsIDM2LCAyLCA1OSwgMzddLFxuICAgICAgWzQsIDQ2LCAyMCwgNiwgNDcsIDIxXSxcbiAgICAgIFs3LCA0MiwgMTQsIDQsIDQzLCAxNV0sXG5cbiAgICAgIC8vIDEzXG4gICAgICBbNCwgMTMzLCAxMDddLFxuICAgICAgWzgsIDU5LCAzNywgMSwgNjAsIDM4XSxcbiAgICAgIFs4LCA0NCwgMjAsIDQsIDQ1LCAyMV0sXG4gICAgICBbMTIsIDMzLCAxMSwgNCwgMzQsIDEyXSxcblxuICAgICAgLy8gMTRcbiAgICAgIFszLCAxNDUsIDExNSwgMSwgMTQ2LCAxMTZdLFxuICAgICAgWzQsIDY0LCA0MCwgNSwgNjUsIDQxXSxcbiAgICAgIFsxMSwgMzYsIDE2LCA1LCAzNywgMTddLFxuICAgICAgWzExLCAzNiwgMTIsIDUsIDM3LCAxM10sXG5cbiAgICAgIC8vIDE1XG4gICAgICBbNSwgMTA5LCA4NywgMSwgMTEwLCA4OF0sXG4gICAgICBbNSwgNjUsIDQxLCA1LCA2NiwgNDJdLFxuICAgICAgWzUsIDU0LCAyNCwgNywgNTUsIDI1XSxcbiAgICAgIFsxMSwgMzYsIDEyLCA3LCAzNywgMTNdLFxuXG4gICAgICAvLyAxNlxuICAgICAgWzUsIDEyMiwgOTgsIDEsIDEyMywgOTldLFxuICAgICAgWzcsIDczLCA0NSwgMywgNzQsIDQ2XSxcbiAgICAgIFsxNSwgNDMsIDE5LCAyLCA0NCwgMjBdLFxuICAgICAgWzMsIDQ1LCAxNSwgMTMsIDQ2LCAxNl0sXG5cbiAgICAgIC8vIDE3XG4gICAgICBbMSwgMTM1LCAxMDcsIDUsIDEzNiwgMTA4XSxcbiAgICAgIFsxMCwgNzQsIDQ2LCAxLCA3NSwgNDddLFxuICAgICAgWzEsIDUwLCAyMiwgMTUsIDUxLCAyM10sXG4gICAgICBbMiwgNDIsIDE0LCAxNywgNDMsIDE1XSxcblxuICAgICAgLy8gMThcbiAgICAgIFs1LCAxNTAsIDEyMCwgMSwgMTUxLCAxMjFdLFxuICAgICAgWzksIDY5LCA0MywgNCwgNzAsIDQ0XSxcbiAgICAgIFsxNywgNTAsIDIyLCAxLCA1MSwgMjNdLFxuICAgICAgWzIsIDQyLCAxNCwgMTksIDQzLCAxNV0sXG5cbiAgICAgIC8vIDE5XG4gICAgICBbMywgMTQxLCAxMTMsIDQsIDE0MiwgMTE0XSxcbiAgICAgIFszLCA3MCwgNDQsIDExLCA3MSwgNDVdLFxuICAgICAgWzE3LCA0NywgMjEsIDQsIDQ4LCAyMl0sXG4gICAgICBbOSwgMzksIDEzLCAxNiwgNDAsIDE0XSxcblxuICAgICAgLy8gMjBcbiAgICAgIFszLCAxMzUsIDEwNywgNSwgMTM2LCAxMDhdLFxuICAgICAgWzMsIDY3LCA0MSwgMTMsIDY4LCA0Ml0sXG4gICAgICBbMTUsIDU0LCAyNCwgNSwgNTUsIDI1XSxcbiAgICAgIFsxNSwgNDMsIDE1LCAxMCwgNDQsIDE2XSxcblxuICAgICAgLy8gMjFcbiAgICAgIFs0LCAxNDQsIDExNiwgNCwgMTQ1LCAxMTddLFxuICAgICAgWzE3LCA2OCwgNDJdLFxuICAgICAgWzE3LCA1MCwgMjIsIDYsIDUxLCAyM10sXG4gICAgICBbMTksIDQ2LCAxNiwgNiwgNDcsIDE3XSxcblxuICAgICAgLy8gMjJcbiAgICAgIFsyLCAxMzksIDExMSwgNywgMTQwLCAxMTJdLFxuICAgICAgWzE3LCA3NCwgNDZdLFxuICAgICAgWzcsIDU0LCAyNCwgMTYsIDU1LCAyNV0sXG4gICAgICBbMzQsIDM3LCAxM10sXG5cbiAgICAgIC8vIDIzXG4gICAgICBbNCwgMTUxLCAxMjEsIDUsIDE1MiwgMTIyXSxcbiAgICAgIFs0LCA3NSwgNDcsIDE0LCA3NiwgNDhdLFxuICAgICAgWzExLCA1NCwgMjQsIDE0LCA1NSwgMjVdLFxuICAgICAgWzE2LCA0NSwgMTUsIDE0LCA0NiwgMTZdLFxuXG4gICAgICAvLyAyNFxuICAgICAgWzYsIDE0NywgMTE3LCA0LCAxNDgsIDExOF0sXG4gICAgICBbNiwgNzMsIDQ1LCAxNCwgNzQsIDQ2XSxcbiAgICAgIFsxMSwgNTQsIDI0LCAxNiwgNTUsIDI1XSxcbiAgICAgIFszMCwgNDYsIDE2LCAyLCA0NywgMTddLFxuXG4gICAgICAvLyAyNVxuICAgICAgWzgsIDEzMiwgMTA2LCA0LCAxMzMsIDEwN10sXG4gICAgICBbOCwgNzUsIDQ3LCAxMywgNzYsIDQ4XSxcbiAgICAgIFs3LCA1NCwgMjQsIDIyLCA1NSwgMjVdLFxuICAgICAgWzIyLCA0NSwgMTUsIDEzLCA0NiwgMTZdLFxuXG4gICAgICAvLyAyNlxuICAgICAgWzEwLCAxNDIsIDExNCwgMiwgMTQzLCAxMTVdLFxuICAgICAgWzE5LCA3NCwgNDYsIDQsIDc1LCA0N10sXG4gICAgICBbMjgsIDUwLCAyMiwgNiwgNTEsIDIzXSxcbiAgICAgIFszMywgNDYsIDE2LCA0LCA0NywgMTddLFxuXG4gICAgICAvLyAyN1xuICAgICAgWzgsIDE1MiwgMTIyLCA0LCAxNTMsIDEyM10sXG4gICAgICBbMjIsIDczLCA0NSwgMywgNzQsIDQ2XSxcbiAgICAgIFs4LCA1MywgMjMsIDI2LCA1NCwgMjRdLFxuICAgICAgWzEyLCA0NSwgMTUsIDI4LCA0NiwgMTZdLFxuXG4gICAgICAvLyAyOFxuICAgICAgWzMsIDE0NywgMTE3LCAxMCwgMTQ4LCAxMThdLFxuICAgICAgWzMsIDczLCA0NSwgMjMsIDc0LCA0Nl0sXG4gICAgICBbNCwgNTQsIDI0LCAzMSwgNTUsIDI1XSxcbiAgICAgIFsxMSwgNDUsIDE1LCAzMSwgNDYsIDE2XSxcblxuICAgICAgLy8gMjlcbiAgICAgIFs3LCAxNDYsIDExNiwgNywgMTQ3LCAxMTddLFxuICAgICAgWzIxLCA3MywgNDUsIDcsIDc0LCA0Nl0sXG4gICAgICBbMSwgNTMsIDIzLCAzNywgNTQsIDI0XSxcbiAgICAgIFsxOSwgNDUsIDE1LCAyNiwgNDYsIDE2XSxcblxuICAgICAgLy8gMzBcbiAgICAgIFs1LCAxNDUsIDExNSwgMTAsIDE0NiwgMTE2XSxcbiAgICAgIFsxOSwgNzUsIDQ3LCAxMCwgNzYsIDQ4XSxcbiAgICAgIFsxNSwgNTQsIDI0LCAyNSwgNTUsIDI1XSxcbiAgICAgIFsyMywgNDUsIDE1LCAyNSwgNDYsIDE2XSxcblxuICAgICAgLy8gMzFcbiAgICAgIFsxMywgMTQ1LCAxMTUsIDMsIDE0NiwgMTE2XSxcbiAgICAgIFsyLCA3NCwgNDYsIDI5LCA3NSwgNDddLFxuICAgICAgWzQyLCA1NCwgMjQsIDEsIDU1LCAyNV0sXG4gICAgICBbMjMsIDQ1LCAxNSwgMjgsIDQ2LCAxNl0sXG5cbiAgICAgIC8vIDMyXG4gICAgICBbMTcsIDE0NSwgMTE1XSxcbiAgICAgIFsxMCwgNzQsIDQ2LCAyMywgNzUsIDQ3XSxcbiAgICAgIFsxMCwgNTQsIDI0LCAzNSwgNTUsIDI1XSxcbiAgICAgIFsxOSwgNDUsIDE1LCAzNSwgNDYsIDE2XSxcblxuICAgICAgLy8gMzNcbiAgICAgIFsxNywgMTQ1LCAxMTUsIDEsIDE0NiwgMTE2XSxcbiAgICAgIFsxNCwgNzQsIDQ2LCAyMSwgNzUsIDQ3XSxcbiAgICAgIFsyOSwgNTQsIDI0LCAxOSwgNTUsIDI1XSxcbiAgICAgIFsxMSwgNDUsIDE1LCA0NiwgNDYsIDE2XSxcblxuICAgICAgLy8gMzRcbiAgICAgIFsxMywgMTQ1LCAxMTUsIDYsIDE0NiwgMTE2XSxcbiAgICAgIFsxNCwgNzQsIDQ2LCAyMywgNzUsIDQ3XSxcbiAgICAgIFs0NCwgNTQsIDI0LCA3LCA1NSwgMjVdLFxuICAgICAgWzU5LCA0NiwgMTYsIDEsIDQ3LCAxN10sXG5cbiAgICAgIC8vIDM1XG4gICAgICBbMTIsIDE1MSwgMTIxLCA3LCAxNTIsIDEyMl0sXG4gICAgICBbMTIsIDc1LCA0NywgMjYsIDc2LCA0OF0sXG4gICAgICBbMzksIDU0LCAyNCwgMTQsIDU1LCAyNV0sXG4gICAgICBbMjIsIDQ1LCAxNSwgNDEsIDQ2LCAxNl0sXG5cbiAgICAgIC8vIDM2XG4gICAgICBbNiwgMTUxLCAxMjEsIDE0LCAxNTIsIDEyMl0sXG4gICAgICBbNiwgNzUsIDQ3LCAzNCwgNzYsIDQ4XSxcbiAgICAgIFs0NiwgNTQsIDI0LCAxMCwgNTUsIDI1XSxcbiAgICAgIFsyLCA0NSwgMTUsIDY0LCA0NiwgMTZdLFxuXG4gICAgICAvLyAzN1xuICAgICAgWzE3LCAxNTIsIDEyMiwgNCwgMTUzLCAxMjNdLFxuICAgICAgWzI5LCA3NCwgNDYsIDE0LCA3NSwgNDddLFxuICAgICAgWzQ5LCA1NCwgMjQsIDEwLCA1NSwgMjVdLFxuICAgICAgWzI0LCA0NSwgMTUsIDQ2LCA0NiwgMTZdLFxuXG4gICAgICAvLyAzOFxuICAgICAgWzQsIDE1MiwgMTIyLCAxOCwgMTUzLCAxMjNdLFxuICAgICAgWzEzLCA3NCwgNDYsIDMyLCA3NSwgNDddLFxuICAgICAgWzQ4LCA1NCwgMjQsIDE0LCA1NSwgMjVdLFxuICAgICAgWzQyLCA0NSwgMTUsIDMyLCA0NiwgMTZdLFxuXG4gICAgICAvLyAzOVxuICAgICAgWzIwLCAxNDcsIDExNywgNCwgMTQ4LCAxMThdLFxuICAgICAgWzQwLCA3NSwgNDcsIDcsIDc2LCA0OF0sXG4gICAgICBbNDMsIDU0LCAyNCwgMjIsIDU1LCAyNV0sXG4gICAgICBbMTAsIDQ1LCAxNSwgNjcsIDQ2LCAxNl0sXG5cbiAgICAgIC8vIDQwXG4gICAgICBbMTksIDE0OCwgMTE4LCA2LCAxNDksIDExOV0sXG4gICAgICBbMTgsIDc1LCA0NywgMzEsIDc2LCA0OF0sXG4gICAgICBbMzQsIDU0LCAyNCwgMzQsIDU1LCAyNV0sXG4gICAgICBbMjAsIDQ1LCAxNSwgNjEsIDQ2LCAxNl1cbiAgICBdO1xuXG4gICAgdmFyIHFyUlNCbG9jayA9IGZ1bmN0aW9uKHRvdGFsQ291bnQsIGRhdGFDb3VudCkge1xuICAgICAgdmFyIF90aGlzID0ge307XG4gICAgICBfdGhpcy50b3RhbENvdW50ID0gdG90YWxDb3VudDtcbiAgICAgIF90aGlzLmRhdGFDb3VudCA9IGRhdGFDb3VudDtcbiAgICAgIHJldHVybiBfdGhpcztcbiAgICB9O1xuXG4gICAgdmFyIF90aGlzID0ge307XG5cbiAgICB2YXIgZ2V0UnNCbG9ja1RhYmxlID0gZnVuY3Rpb24odHlwZU51bWJlciwgZXJyb3JDb3JyZWN0aW9uTGV2ZWwpIHtcblxuICAgICAgc3dpdGNoKGVycm9yQ29ycmVjdGlvbkxldmVsKSB7XG4gICAgICBjYXNlIFFSRXJyb3JDb3JyZWN0aW9uTGV2ZWwuTCA6XG4gICAgICAgIHJldHVybiBSU19CTE9DS19UQUJMRVsodHlwZU51bWJlciAtIDEpICogNCArIDBdO1xuICAgICAgY2FzZSBRUkVycm9yQ29ycmVjdGlvbkxldmVsLk0gOlxuICAgICAgICByZXR1cm4gUlNfQkxPQ0tfVEFCTEVbKHR5cGVOdW1iZXIgLSAxKSAqIDQgKyAxXTtcbiAgICAgIGNhc2UgUVJFcnJvckNvcnJlY3Rpb25MZXZlbC5RIDpcbiAgICAgICAgcmV0dXJuIFJTX0JMT0NLX1RBQkxFWyh0eXBlTnVtYmVyIC0gMSkgKiA0ICsgMl07XG4gICAgICBjYXNlIFFSRXJyb3JDb3JyZWN0aW9uTGV2ZWwuSCA6XG4gICAgICAgIHJldHVybiBSU19CTE9DS19UQUJMRVsodHlwZU51bWJlciAtIDEpICogNCArIDNdO1xuICAgICAgZGVmYXVsdCA6XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICB9XG4gICAgfTtcblxuICAgIF90aGlzLmdldFJTQmxvY2tzID0gZnVuY3Rpb24odHlwZU51bWJlciwgZXJyb3JDb3JyZWN0aW9uTGV2ZWwpIHtcblxuICAgICAgdmFyIHJzQmxvY2sgPSBnZXRSc0Jsb2NrVGFibGUodHlwZU51bWJlciwgZXJyb3JDb3JyZWN0aW9uTGV2ZWwpO1xuXG4gICAgICBpZiAodHlwZW9mIHJzQmxvY2sgPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgdGhyb3cgJ2JhZCBycyBibG9jayBAIHR5cGVOdW1iZXI6JyArIHR5cGVOdW1iZXIgK1xuICAgICAgICAgICAgJy9lcnJvckNvcnJlY3Rpb25MZXZlbDonICsgZXJyb3JDb3JyZWN0aW9uTGV2ZWw7XG4gICAgICB9XG5cbiAgICAgIHZhciBsZW5ndGggPSByc0Jsb2NrLmxlbmd0aCAvIDM7XG5cbiAgICAgIHZhciBsaXN0ID0gW107XG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpICs9IDEpIHtcblxuICAgICAgICB2YXIgY291bnQgPSByc0Jsb2NrW2kgKiAzICsgMF07XG4gICAgICAgIHZhciB0b3RhbENvdW50ID0gcnNCbG9ja1tpICogMyArIDFdO1xuICAgICAgICB2YXIgZGF0YUNvdW50ID0gcnNCbG9ja1tpICogMyArIDJdO1xuXG4gICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgY291bnQ7IGogKz0gMSkge1xuICAgICAgICAgIGxpc3QucHVzaChxclJTQmxvY2sodG90YWxDb3VudCwgZGF0YUNvdW50KSApO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBsaXN0O1xuICAgIH07XG5cbiAgICByZXR1cm4gX3RoaXM7XG4gIH0oKTtcblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBxckJpdEJ1ZmZlclxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIHZhciBxckJpdEJ1ZmZlciA9IGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIF9idWZmZXIgPSBbXTtcbiAgICB2YXIgX2xlbmd0aCA9IDA7XG5cbiAgICB2YXIgX3RoaXMgPSB7fTtcblxuICAgIF90aGlzLmdldEJ1ZmZlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIF9idWZmZXI7XG4gICAgfTtcblxuICAgIF90aGlzLmdldEF0ID0gZnVuY3Rpb24oaW5kZXgpIHtcbiAgICAgIHZhciBidWZJbmRleCA9IE1hdGguZmxvb3IoaW5kZXggLyA4KTtcbiAgICAgIHJldHVybiAoIChfYnVmZmVyW2J1ZkluZGV4XSA+Pj4gKDcgLSBpbmRleCAlIDgpICkgJiAxKSA9PSAxO1xuICAgIH07XG5cbiAgICBfdGhpcy5wdXQgPSBmdW5jdGlvbihudW0sIGxlbmd0aCkge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICBfdGhpcy5wdXRCaXQoICggKG51bSA+Pj4gKGxlbmd0aCAtIGkgLSAxKSApICYgMSkgPT0gMSk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIF90aGlzLmdldExlbmd0aEluQml0cyA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIF9sZW5ndGg7XG4gICAgfTtcblxuICAgIF90aGlzLnB1dEJpdCA9IGZ1bmN0aW9uKGJpdCkge1xuXG4gICAgICB2YXIgYnVmSW5kZXggPSBNYXRoLmZsb29yKF9sZW5ndGggLyA4KTtcbiAgICAgIGlmIChfYnVmZmVyLmxlbmd0aCA8PSBidWZJbmRleCkge1xuICAgICAgICBfYnVmZmVyLnB1c2goMCk7XG4gICAgICB9XG5cbiAgICAgIGlmIChiaXQpIHtcbiAgICAgICAgX2J1ZmZlcltidWZJbmRleF0gfD0gKDB4ODAgPj4+IChfbGVuZ3RoICUgOCkgKTtcbiAgICAgIH1cblxuICAgICAgX2xlbmd0aCArPSAxO1xuICAgIH07XG5cbiAgICByZXR1cm4gX3RoaXM7XG4gIH07XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gcXJOdW1iZXJcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICB2YXIgcXJOdW1iZXIgPSBmdW5jdGlvbihkYXRhKSB7XG5cbiAgICB2YXIgX21vZGUgPSBRUk1vZGUuTU9ERV9OVU1CRVI7XG4gICAgdmFyIF9kYXRhID0gZGF0YTtcblxuICAgIHZhciBfdGhpcyA9IHt9O1xuXG4gICAgX3RoaXMuZ2V0TW9kZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIF9tb2RlO1xuICAgIH07XG5cbiAgICBfdGhpcy5nZXRMZW5ndGggPSBmdW5jdGlvbihidWZmZXIpIHtcbiAgICAgIHJldHVybiBfZGF0YS5sZW5ndGg7XG4gICAgfTtcblxuICAgIF90aGlzLndyaXRlID0gZnVuY3Rpb24oYnVmZmVyKSB7XG5cbiAgICAgIHZhciBkYXRhID0gX2RhdGE7XG5cbiAgICAgIHZhciBpID0gMDtcblxuICAgICAgd2hpbGUgKGkgKyAyIDwgZGF0YS5sZW5ndGgpIHtcbiAgICAgICAgYnVmZmVyLnB1dChzdHJUb051bShkYXRhLnN1YnN0cmluZyhpLCBpICsgMykgKSwgMTApO1xuICAgICAgICBpICs9IDM7XG4gICAgICB9XG5cbiAgICAgIGlmIChpIDwgZGF0YS5sZW5ndGgpIHtcbiAgICAgICAgaWYgKGRhdGEubGVuZ3RoIC0gaSA9PSAxKSB7XG4gICAgICAgICAgYnVmZmVyLnB1dChzdHJUb051bShkYXRhLnN1YnN0cmluZyhpLCBpICsgMSkgKSwgNCk7XG4gICAgICAgIH0gZWxzZSBpZiAoZGF0YS5sZW5ndGggLSBpID09IDIpIHtcbiAgICAgICAgICBidWZmZXIucHV0KHN0clRvTnVtKGRhdGEuc3Vic3RyaW5nKGksIGkgKyAyKSApLCA3KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICB2YXIgc3RyVG9OdW0gPSBmdW5jdGlvbihzKSB7XG4gICAgICB2YXIgbnVtID0gMDtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICBudW0gPSBudW0gKiAxMCArIGNoYXRUb051bShzLmNoYXJBdChpKSApO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG51bTtcbiAgICB9O1xuXG4gICAgdmFyIGNoYXRUb051bSA9IGZ1bmN0aW9uKGMpIHtcbiAgICAgIGlmICgnMCcgPD0gYyAmJiBjIDw9ICc5Jykge1xuICAgICAgICByZXR1cm4gYy5jaGFyQ29kZUF0KDApIC0gJzAnLmNoYXJDb2RlQXQoMCk7XG4gICAgICB9XG4gICAgICB0aHJvdyAnaWxsZWdhbCBjaGFyIDonICsgYztcbiAgICB9O1xuXG4gICAgcmV0dXJuIF90aGlzO1xuICB9O1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIHFyQWxwaGFOdW1cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICB2YXIgcXJBbHBoYU51bSA9IGZ1bmN0aW9uKGRhdGEpIHtcblxuICAgIHZhciBfbW9kZSA9IFFSTW9kZS5NT0RFX0FMUEhBX05VTTtcbiAgICB2YXIgX2RhdGEgPSBkYXRhO1xuXG4gICAgdmFyIF90aGlzID0ge307XG5cbiAgICBfdGhpcy5nZXRNb2RlID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gX21vZGU7XG4gICAgfTtcblxuICAgIF90aGlzLmdldExlbmd0aCA9IGZ1bmN0aW9uKGJ1ZmZlcikge1xuICAgICAgcmV0dXJuIF9kYXRhLmxlbmd0aDtcbiAgICB9O1xuXG4gICAgX3RoaXMud3JpdGUgPSBmdW5jdGlvbihidWZmZXIpIHtcblxuICAgICAgdmFyIHMgPSBfZGF0YTtcblxuICAgICAgdmFyIGkgPSAwO1xuXG4gICAgICB3aGlsZSAoaSArIDEgPCBzLmxlbmd0aCkge1xuICAgICAgICBidWZmZXIucHV0KFxuICAgICAgICAgIGdldENvZGUocy5jaGFyQXQoaSkgKSAqIDQ1ICtcbiAgICAgICAgICBnZXRDb2RlKHMuY2hhckF0KGkgKyAxKSApLCAxMSk7XG4gICAgICAgIGkgKz0gMjtcbiAgICAgIH1cblxuICAgICAgaWYgKGkgPCBzLmxlbmd0aCkge1xuICAgICAgICBidWZmZXIucHV0KGdldENvZGUocy5jaGFyQXQoaSkgKSwgNik7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHZhciBnZXRDb2RlID0gZnVuY3Rpb24oYykge1xuXG4gICAgICBpZiAoJzAnIDw9IGMgJiYgYyA8PSAnOScpIHtcbiAgICAgICAgcmV0dXJuIGMuY2hhckNvZGVBdCgwKSAtICcwJy5jaGFyQ29kZUF0KDApO1xuICAgICAgfSBlbHNlIGlmICgnQScgPD0gYyAmJiBjIDw9ICdaJykge1xuICAgICAgICByZXR1cm4gYy5jaGFyQ29kZUF0KDApIC0gJ0EnLmNoYXJDb2RlQXQoMCkgKyAxMDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHN3aXRjaCAoYykge1xuICAgICAgICBjYXNlICcgJyA6IHJldHVybiAzNjtcbiAgICAgICAgY2FzZSAnJCcgOiByZXR1cm4gMzc7XG4gICAgICAgIGNhc2UgJyUnIDogcmV0dXJuIDM4O1xuICAgICAgICBjYXNlICcqJyA6IHJldHVybiAzOTtcbiAgICAgICAgY2FzZSAnKycgOiByZXR1cm4gNDA7XG4gICAgICAgIGNhc2UgJy0nIDogcmV0dXJuIDQxO1xuICAgICAgICBjYXNlICcuJyA6IHJldHVybiA0MjtcbiAgICAgICAgY2FzZSAnLycgOiByZXR1cm4gNDM7XG4gICAgICAgIGNhc2UgJzonIDogcmV0dXJuIDQ0O1xuICAgICAgICBkZWZhdWx0IDpcbiAgICAgICAgICB0aHJvdyAnaWxsZWdhbCBjaGFyIDonICsgYztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gX3RoaXM7XG4gIH07XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gcXI4Qml0Qnl0ZVxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIHZhciBxcjhCaXRCeXRlID0gZnVuY3Rpb24oZGF0YSkge1xuXG4gICAgdmFyIF9tb2RlID0gUVJNb2RlLk1PREVfOEJJVF9CWVRFO1xuICAgIHZhciBfZGF0YSA9IGRhdGE7XG4gICAgdmFyIF9ieXRlcyA9IHFyY29kZS5zdHJpbmdUb0J5dGVzKGRhdGEpO1xuXG4gICAgdmFyIF90aGlzID0ge307XG5cbiAgICBfdGhpcy5nZXRNb2RlID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gX21vZGU7XG4gICAgfTtcblxuICAgIF90aGlzLmdldExlbmd0aCA9IGZ1bmN0aW9uKGJ1ZmZlcikge1xuICAgICAgcmV0dXJuIF9ieXRlcy5sZW5ndGg7XG4gICAgfTtcblxuICAgIF90aGlzLndyaXRlID0gZnVuY3Rpb24oYnVmZmVyKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IF9ieXRlcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICBidWZmZXIucHV0KF9ieXRlc1tpXSwgOCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiBfdGhpcztcbiAgfTtcblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBxckthbmppXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgdmFyIHFyS2FuamkgPSBmdW5jdGlvbihkYXRhKSB7XG5cbiAgICB2YXIgX21vZGUgPSBRUk1vZGUuTU9ERV9LQU5KSTtcbiAgICB2YXIgX2RhdGEgPSBkYXRhO1xuXG4gICAgdmFyIHN0cmluZ1RvQnl0ZXMgPSBxcmNvZGUuc3RyaW5nVG9CeXRlc0Z1bmNzWydTSklTJ107XG4gICAgaWYgKCFzdHJpbmdUb0J5dGVzKSB7XG4gICAgICB0aHJvdyAnc2ppcyBub3Qgc3VwcG9ydGVkLic7XG4gICAgfVxuICAgICFmdW5jdGlvbihjLCBjb2RlKSB7XG4gICAgICAvLyBzZWxmIHRlc3QgZm9yIHNqaXMgc3VwcG9ydC5cbiAgICAgIHZhciB0ZXN0ID0gc3RyaW5nVG9CeXRlcyhjKTtcbiAgICAgIGlmICh0ZXN0Lmxlbmd0aCAhPSAyIHx8ICggKHRlc3RbMF0gPDwgOCkgfCB0ZXN0WzFdKSAhPSBjb2RlKSB7XG4gICAgICAgIHRocm93ICdzamlzIG5vdCBzdXBwb3J0ZWQuJztcbiAgICAgIH1cbiAgICB9KCdcXHU1M2NiJywgMHg5NzQ2KTtcblxuICAgIHZhciBfYnl0ZXMgPSBzdHJpbmdUb0J5dGVzKGRhdGEpO1xuXG4gICAgdmFyIF90aGlzID0ge307XG5cbiAgICBfdGhpcy5nZXRNb2RlID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gX21vZGU7XG4gICAgfTtcblxuICAgIF90aGlzLmdldExlbmd0aCA9IGZ1bmN0aW9uKGJ1ZmZlcikge1xuICAgICAgcmV0dXJuIH5+KF9ieXRlcy5sZW5ndGggLyAyKTtcbiAgICB9O1xuXG4gICAgX3RoaXMud3JpdGUgPSBmdW5jdGlvbihidWZmZXIpIHtcblxuICAgICAgdmFyIGRhdGEgPSBfYnl0ZXM7XG5cbiAgICAgIHZhciBpID0gMDtcblxuICAgICAgd2hpbGUgKGkgKyAxIDwgZGF0YS5sZW5ndGgpIHtcblxuICAgICAgICB2YXIgYyA9ICggKDB4ZmYgJiBkYXRhW2ldKSA8PCA4KSB8ICgweGZmICYgZGF0YVtpICsgMV0pO1xuXG4gICAgICAgIGlmICgweDgxNDAgPD0gYyAmJiBjIDw9IDB4OUZGQykge1xuICAgICAgICAgIGMgLT0gMHg4MTQwO1xuICAgICAgICB9IGVsc2UgaWYgKDB4RTA0MCA8PSBjICYmIGMgPD0gMHhFQkJGKSB7XG4gICAgICAgICAgYyAtPSAweEMxNDA7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhyb3cgJ2lsbGVnYWwgY2hhciBhdCAnICsgKGkgKyAxKSArICcvJyArIGM7XG4gICAgICAgIH1cblxuICAgICAgICBjID0gKCAoYyA+Pj4gOCkgJiAweGZmKSAqIDB4QzAgKyAoYyAmIDB4ZmYpO1xuXG4gICAgICAgIGJ1ZmZlci5wdXQoYywgMTMpO1xuXG4gICAgICAgIGkgKz0gMjtcbiAgICAgIH1cblxuICAgICAgaWYgKGkgPCBkYXRhLmxlbmd0aCkge1xuICAgICAgICB0aHJvdyAnaWxsZWdhbCBjaGFyIGF0ICcgKyAoaSArIDEpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gX3RoaXM7XG4gIH07XG5cbiAgLy89PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgLy8gR0lGIFN1cHBvcnQgZXRjLlxuICAvL1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIGJ5dGVBcnJheU91dHB1dFN0cmVhbVxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIHZhciBieXRlQXJyYXlPdXRwdXRTdHJlYW0gPSBmdW5jdGlvbigpIHtcblxuICAgIHZhciBfYnl0ZXMgPSBbXTtcblxuICAgIHZhciBfdGhpcyA9IHt9O1xuXG4gICAgX3RoaXMud3JpdGVCeXRlID0gZnVuY3Rpb24oYikge1xuICAgICAgX2J5dGVzLnB1c2goYiAmIDB4ZmYpO1xuICAgIH07XG5cbiAgICBfdGhpcy53cml0ZVNob3J0ID0gZnVuY3Rpb24oaSkge1xuICAgICAgX3RoaXMud3JpdGVCeXRlKGkpO1xuICAgICAgX3RoaXMud3JpdGVCeXRlKGkgPj4+IDgpO1xuICAgIH07XG5cbiAgICBfdGhpcy53cml0ZUJ5dGVzID0gZnVuY3Rpb24oYiwgb2ZmLCBsZW4pIHtcbiAgICAgIG9mZiA9IG9mZiB8fCAwO1xuICAgICAgbGVuID0gbGVuIHx8IGIubGVuZ3RoO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkgKz0gMSkge1xuICAgICAgICBfdGhpcy53cml0ZUJ5dGUoYltpICsgb2ZmXSk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIF90aGlzLndyaXRlU3RyaW5nID0gZnVuY3Rpb24ocykge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIF90aGlzLndyaXRlQnl0ZShzLmNoYXJDb2RlQXQoaSkgKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgX3RoaXMudG9CeXRlQXJyYXkgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBfYnl0ZXM7XG4gICAgfTtcblxuICAgIF90aGlzLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgcyA9ICcnO1xuICAgICAgcyArPSAnWyc7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IF9ieXRlcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICBpZiAoaSA+IDApIHtcbiAgICAgICAgICBzICs9ICcsJztcbiAgICAgICAgfVxuICAgICAgICBzICs9IF9ieXRlc1tpXTtcbiAgICAgIH1cbiAgICAgIHMgKz0gJ10nO1xuICAgICAgcmV0dXJuIHM7XG4gICAgfTtcblxuICAgIHJldHVybiBfdGhpcztcbiAgfTtcblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBiYXNlNjRFbmNvZGVPdXRwdXRTdHJlYW1cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICB2YXIgYmFzZTY0RW5jb2RlT3V0cHV0U3RyZWFtID0gZnVuY3Rpb24oKSB7XG5cbiAgICB2YXIgX2J1ZmZlciA9IDA7XG4gICAgdmFyIF9idWZsZW4gPSAwO1xuICAgIHZhciBfbGVuZ3RoID0gMDtcbiAgICB2YXIgX2Jhc2U2NCA9ICcnO1xuXG4gICAgdmFyIF90aGlzID0ge307XG5cbiAgICB2YXIgd3JpdGVFbmNvZGVkID0gZnVuY3Rpb24oYikge1xuICAgICAgX2Jhc2U2NCArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGVuY29kZShiICYgMHgzZikgKTtcbiAgICB9O1xuXG4gICAgdmFyIGVuY29kZSA9IGZ1bmN0aW9uKG4pIHtcbiAgICAgIGlmIChuIDwgMCkge1xuICAgICAgICAvLyBlcnJvci5cbiAgICAgIH0gZWxzZSBpZiAobiA8IDI2KSB7XG4gICAgICAgIHJldHVybiAweDQxICsgbjtcbiAgICAgIH0gZWxzZSBpZiAobiA8IDUyKSB7XG4gICAgICAgIHJldHVybiAweDYxICsgKG4gLSAyNik7XG4gICAgICB9IGVsc2UgaWYgKG4gPCA2Mikge1xuICAgICAgICByZXR1cm4gMHgzMCArIChuIC0gNTIpO1xuICAgICAgfSBlbHNlIGlmIChuID09IDYyKSB7XG4gICAgICAgIHJldHVybiAweDJiO1xuICAgICAgfSBlbHNlIGlmIChuID09IDYzKSB7XG4gICAgICAgIHJldHVybiAweDJmO1xuICAgICAgfVxuICAgICAgdGhyb3cgJ246JyArIG47XG4gICAgfTtcblxuICAgIF90aGlzLndyaXRlQnl0ZSA9IGZ1bmN0aW9uKG4pIHtcblxuICAgICAgX2J1ZmZlciA9IChfYnVmZmVyIDw8IDgpIHwgKG4gJiAweGZmKTtcbiAgICAgIF9idWZsZW4gKz0gODtcbiAgICAgIF9sZW5ndGggKz0gMTtcblxuICAgICAgd2hpbGUgKF9idWZsZW4gPj0gNikge1xuICAgICAgICB3cml0ZUVuY29kZWQoX2J1ZmZlciA+Pj4gKF9idWZsZW4gLSA2KSApO1xuICAgICAgICBfYnVmbGVuIC09IDY7XG4gICAgICB9XG4gICAgfTtcblxuICAgIF90aGlzLmZsdXNoID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgIGlmIChfYnVmbGVuID4gMCkge1xuICAgICAgICB3cml0ZUVuY29kZWQoX2J1ZmZlciA8PCAoNiAtIF9idWZsZW4pICk7XG4gICAgICAgIF9idWZmZXIgPSAwO1xuICAgICAgICBfYnVmbGVuID0gMDtcbiAgICAgIH1cblxuICAgICAgaWYgKF9sZW5ndGggJSAzICE9IDApIHtcbiAgICAgICAgLy8gcGFkZGluZ1xuICAgICAgICB2YXIgcGFkbGVuID0gMyAtIF9sZW5ndGggJSAzO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBhZGxlbjsgaSArPSAxKSB7XG4gICAgICAgICAgX2Jhc2U2NCArPSAnPSc7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuXG4gICAgX3RoaXMudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBfYmFzZTY0O1xuICAgIH07XG5cbiAgICByZXR1cm4gX3RoaXM7XG4gIH07XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gYmFzZTY0RGVjb2RlSW5wdXRTdHJlYW1cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICB2YXIgYmFzZTY0RGVjb2RlSW5wdXRTdHJlYW0gPSBmdW5jdGlvbihzdHIpIHtcblxuICAgIHZhciBfc3RyID0gc3RyO1xuICAgIHZhciBfcG9zID0gMDtcbiAgICB2YXIgX2J1ZmZlciA9IDA7XG4gICAgdmFyIF9idWZsZW4gPSAwO1xuXG4gICAgdmFyIF90aGlzID0ge307XG5cbiAgICBfdGhpcy5yZWFkID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgIHdoaWxlIChfYnVmbGVuIDwgOCkge1xuXG4gICAgICAgIGlmIChfcG9zID49IF9zdHIubGVuZ3RoKSB7XG4gICAgICAgICAgaWYgKF9idWZsZW4gPT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aHJvdyAndW5leHBlY3RlZCBlbmQgb2YgZmlsZS4vJyArIF9idWZsZW47XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgYyA9IF9zdHIuY2hhckF0KF9wb3MpO1xuICAgICAgICBfcG9zICs9IDE7XG5cbiAgICAgICAgaWYgKGMgPT0gJz0nKSB7XG4gICAgICAgICAgX2J1ZmxlbiA9IDA7XG4gICAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgICB9IGVsc2UgaWYgKGMubWF0Y2goL15cXHMkLykgKSB7XG4gICAgICAgICAgLy8gaWdub3JlIGlmIHdoaXRlc3BhY2UuXG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICBfYnVmZmVyID0gKF9idWZmZXIgPDwgNikgfCBkZWNvZGUoYy5jaGFyQ29kZUF0KDApICk7XG4gICAgICAgIF9idWZsZW4gKz0gNjtcbiAgICAgIH1cblxuICAgICAgdmFyIG4gPSAoX2J1ZmZlciA+Pj4gKF9idWZsZW4gLSA4KSApICYgMHhmZjtcbiAgICAgIF9idWZsZW4gLT0gODtcbiAgICAgIHJldHVybiBuO1xuICAgIH07XG5cbiAgICB2YXIgZGVjb2RlID0gZnVuY3Rpb24oYykge1xuICAgICAgaWYgKDB4NDEgPD0gYyAmJiBjIDw9IDB4NWEpIHtcbiAgICAgICAgcmV0dXJuIGMgLSAweDQxO1xuICAgICAgfSBlbHNlIGlmICgweDYxIDw9IGMgJiYgYyA8PSAweDdhKSB7XG4gICAgICAgIHJldHVybiBjIC0gMHg2MSArIDI2O1xuICAgICAgfSBlbHNlIGlmICgweDMwIDw9IGMgJiYgYyA8PSAweDM5KSB7XG4gICAgICAgIHJldHVybiBjIC0gMHgzMCArIDUyO1xuICAgICAgfSBlbHNlIGlmIChjID09IDB4MmIpIHtcbiAgICAgICAgcmV0dXJuIDYyO1xuICAgICAgfSBlbHNlIGlmIChjID09IDB4MmYpIHtcbiAgICAgICAgcmV0dXJuIDYzO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgJ2M6JyArIGM7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiBfdGhpcztcbiAgfTtcblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBnaWZJbWFnZSAoQi9XKVxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIHZhciBnaWZJbWFnZSA9IGZ1bmN0aW9uKHdpZHRoLCBoZWlnaHQpIHtcblxuICAgIHZhciBfd2lkdGggPSB3aWR0aDtcbiAgICB2YXIgX2hlaWdodCA9IGhlaWdodDtcbiAgICB2YXIgX2RhdGEgPSBuZXcgQXJyYXkod2lkdGggKiBoZWlnaHQpO1xuXG4gICAgdmFyIF90aGlzID0ge307XG5cbiAgICBfdGhpcy5zZXRQaXhlbCA9IGZ1bmN0aW9uKHgsIHksIHBpeGVsKSB7XG4gICAgICBfZGF0YVt5ICogX3dpZHRoICsgeF0gPSBwaXhlbDtcbiAgICB9O1xuXG4gICAgX3RoaXMud3JpdGUgPSBmdW5jdGlvbihvdXQpIHtcblxuICAgICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgIC8vIEdJRiBTaWduYXR1cmVcblxuICAgICAgb3V0LndyaXRlU3RyaW5nKCdHSUY4N2EnKTtcblxuICAgICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgIC8vIFNjcmVlbiBEZXNjcmlwdG9yXG5cbiAgICAgIG91dC53cml0ZVNob3J0KF93aWR0aCk7XG4gICAgICBvdXQud3JpdGVTaG9ydChfaGVpZ2h0KTtcblxuICAgICAgb3V0LndyaXRlQnl0ZSgweDgwKTsgLy8gMmJpdFxuICAgICAgb3V0LndyaXRlQnl0ZSgwKTtcbiAgICAgIG91dC53cml0ZUJ5dGUoMCk7XG5cbiAgICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAvLyBHbG9iYWwgQ29sb3IgTWFwXG5cbiAgICAgIC8vIGJsYWNrXG4gICAgICBvdXQud3JpdGVCeXRlKDB4MDApO1xuICAgICAgb3V0LndyaXRlQnl0ZSgweDAwKTtcbiAgICAgIG91dC53cml0ZUJ5dGUoMHgwMCk7XG5cbiAgICAgIC8vIHdoaXRlXG4gICAgICBvdXQud3JpdGVCeXRlKDB4ZmYpO1xuICAgICAgb3V0LndyaXRlQnl0ZSgweGZmKTtcbiAgICAgIG91dC53cml0ZUJ5dGUoMHhmZik7XG5cbiAgICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAvLyBJbWFnZSBEZXNjcmlwdG9yXG5cbiAgICAgIG91dC53cml0ZVN0cmluZygnLCcpO1xuICAgICAgb3V0LndyaXRlU2hvcnQoMCk7XG4gICAgICBvdXQud3JpdGVTaG9ydCgwKTtcbiAgICAgIG91dC53cml0ZVNob3J0KF93aWR0aCk7XG4gICAgICBvdXQud3JpdGVTaG9ydChfaGVpZ2h0KTtcbiAgICAgIG91dC53cml0ZUJ5dGUoMCk7XG5cbiAgICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAvLyBMb2NhbCBDb2xvciBNYXBcblxuICAgICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgIC8vIFJhc3RlciBEYXRhXG5cbiAgICAgIHZhciBsendNaW5Db2RlU2l6ZSA9IDI7XG4gICAgICB2YXIgcmFzdGVyID0gZ2V0TFpXUmFzdGVyKGx6d01pbkNvZGVTaXplKTtcblxuICAgICAgb3V0LndyaXRlQnl0ZShsendNaW5Db2RlU2l6ZSk7XG5cbiAgICAgIHZhciBvZmZzZXQgPSAwO1xuXG4gICAgICB3aGlsZSAocmFzdGVyLmxlbmd0aCAtIG9mZnNldCA+IDI1NSkge1xuICAgICAgICBvdXQud3JpdGVCeXRlKDI1NSk7XG4gICAgICAgIG91dC53cml0ZUJ5dGVzKHJhc3Rlciwgb2Zmc2V0LCAyNTUpO1xuICAgICAgICBvZmZzZXQgKz0gMjU1O1xuICAgICAgfVxuXG4gICAgICBvdXQud3JpdGVCeXRlKHJhc3Rlci5sZW5ndGggLSBvZmZzZXQpO1xuICAgICAgb3V0LndyaXRlQnl0ZXMocmFzdGVyLCBvZmZzZXQsIHJhc3Rlci5sZW5ndGggLSBvZmZzZXQpO1xuICAgICAgb3V0LndyaXRlQnl0ZSgweDAwKTtcblxuICAgICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgIC8vIEdJRiBUZXJtaW5hdG9yXG4gICAgICBvdXQud3JpdGVTdHJpbmcoJzsnKTtcbiAgICB9O1xuXG4gICAgdmFyIGJpdE91dHB1dFN0cmVhbSA9IGZ1bmN0aW9uKG91dCkge1xuXG4gICAgICB2YXIgX291dCA9IG91dDtcbiAgICAgIHZhciBfYml0TGVuZ3RoID0gMDtcbiAgICAgIHZhciBfYml0QnVmZmVyID0gMDtcblxuICAgICAgdmFyIF90aGlzID0ge307XG5cbiAgICAgIF90aGlzLndyaXRlID0gZnVuY3Rpb24oZGF0YSwgbGVuZ3RoKSB7XG5cbiAgICAgICAgaWYgKCAoZGF0YSA+Pj4gbGVuZ3RoKSAhPSAwKSB7XG4gICAgICAgICAgdGhyb3cgJ2xlbmd0aCBvdmVyJztcbiAgICAgICAgfVxuXG4gICAgICAgIHdoaWxlIChfYml0TGVuZ3RoICsgbGVuZ3RoID49IDgpIHtcbiAgICAgICAgICBfb3V0LndyaXRlQnl0ZSgweGZmICYgKCAoZGF0YSA8PCBfYml0TGVuZ3RoKSB8IF9iaXRCdWZmZXIpICk7XG4gICAgICAgICAgbGVuZ3RoIC09ICg4IC0gX2JpdExlbmd0aCk7XG4gICAgICAgICAgZGF0YSA+Pj49ICg4IC0gX2JpdExlbmd0aCk7XG4gICAgICAgICAgX2JpdEJ1ZmZlciA9IDA7XG4gICAgICAgICAgX2JpdExlbmd0aCA9IDA7XG4gICAgICAgIH1cblxuICAgICAgICBfYml0QnVmZmVyID0gKGRhdGEgPDwgX2JpdExlbmd0aCkgfCBfYml0QnVmZmVyO1xuICAgICAgICBfYml0TGVuZ3RoID0gX2JpdExlbmd0aCArIGxlbmd0aDtcbiAgICAgIH07XG5cbiAgICAgIF90aGlzLmZsdXNoID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmIChfYml0TGVuZ3RoID4gMCkge1xuICAgICAgICAgIF9vdXQud3JpdGVCeXRlKF9iaXRCdWZmZXIpO1xuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICByZXR1cm4gX3RoaXM7XG4gICAgfTtcblxuICAgIHZhciBnZXRMWldSYXN0ZXIgPSBmdW5jdGlvbihsendNaW5Db2RlU2l6ZSkge1xuXG4gICAgICB2YXIgY2xlYXJDb2RlID0gMSA8PCBsendNaW5Db2RlU2l6ZTtcbiAgICAgIHZhciBlbmRDb2RlID0gKDEgPDwgbHp3TWluQ29kZVNpemUpICsgMTtcbiAgICAgIHZhciBiaXRMZW5ndGggPSBsendNaW5Db2RlU2l6ZSArIDE7XG5cbiAgICAgIC8vIFNldHVwIExaV1RhYmxlXG4gICAgICB2YXIgdGFibGUgPSBsendUYWJsZSgpO1xuXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNsZWFyQ29kZTsgaSArPSAxKSB7XG4gICAgICAgIHRhYmxlLmFkZChTdHJpbmcuZnJvbUNoYXJDb2RlKGkpICk7XG4gICAgICB9XG4gICAgICB0YWJsZS5hZGQoU3RyaW5nLmZyb21DaGFyQ29kZShjbGVhckNvZGUpICk7XG4gICAgICB0YWJsZS5hZGQoU3RyaW5nLmZyb21DaGFyQ29kZShlbmRDb2RlKSApO1xuXG4gICAgICB2YXIgYnl0ZU91dCA9IGJ5dGVBcnJheU91dHB1dFN0cmVhbSgpO1xuICAgICAgdmFyIGJpdE91dCA9IGJpdE91dHB1dFN0cmVhbShieXRlT3V0KTtcblxuICAgICAgLy8gY2xlYXIgY29kZVxuICAgICAgYml0T3V0LndyaXRlKGNsZWFyQ29kZSwgYml0TGVuZ3RoKTtcblxuICAgICAgdmFyIGRhdGFJbmRleCA9IDA7XG5cbiAgICAgIHZhciBzID0gU3RyaW5nLmZyb21DaGFyQ29kZShfZGF0YVtkYXRhSW5kZXhdKTtcbiAgICAgIGRhdGFJbmRleCArPSAxO1xuXG4gICAgICB3aGlsZSAoZGF0YUluZGV4IDwgX2RhdGEubGVuZ3RoKSB7XG5cbiAgICAgICAgdmFyIGMgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKF9kYXRhW2RhdGFJbmRleF0pO1xuICAgICAgICBkYXRhSW5kZXggKz0gMTtcblxuICAgICAgICBpZiAodGFibGUuY29udGFpbnMocyArIGMpICkge1xuXG4gICAgICAgICAgcyA9IHMgKyBjO1xuXG4gICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICBiaXRPdXQud3JpdGUodGFibGUuaW5kZXhPZihzKSwgYml0TGVuZ3RoKTtcblxuICAgICAgICAgIGlmICh0YWJsZS5zaXplKCkgPCAweGZmZikge1xuXG4gICAgICAgICAgICBpZiAodGFibGUuc2l6ZSgpID09ICgxIDw8IGJpdExlbmd0aCkgKSB7XG4gICAgICAgICAgICAgIGJpdExlbmd0aCArPSAxO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0YWJsZS5hZGQocyArIGMpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHMgPSBjO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGJpdE91dC53cml0ZSh0YWJsZS5pbmRleE9mKHMpLCBiaXRMZW5ndGgpO1xuXG4gICAgICAvLyBlbmQgY29kZVxuICAgICAgYml0T3V0LndyaXRlKGVuZENvZGUsIGJpdExlbmd0aCk7XG5cbiAgICAgIGJpdE91dC5mbHVzaCgpO1xuXG4gICAgICByZXR1cm4gYnl0ZU91dC50b0J5dGVBcnJheSgpO1xuICAgIH07XG5cbiAgICB2YXIgbHp3VGFibGUgPSBmdW5jdGlvbigpIHtcblxuICAgICAgdmFyIF9tYXAgPSB7fTtcbiAgICAgIHZhciBfc2l6ZSA9IDA7XG5cbiAgICAgIHZhciBfdGhpcyA9IHt9O1xuXG4gICAgICBfdGhpcy5hZGQgPSBmdW5jdGlvbihrZXkpIHtcbiAgICAgICAgaWYgKF90aGlzLmNvbnRhaW5zKGtleSkgKSB7XG4gICAgICAgICAgdGhyb3cgJ2R1cCBrZXk6JyArIGtleTtcbiAgICAgICAgfVxuICAgICAgICBfbWFwW2tleV0gPSBfc2l6ZTtcbiAgICAgICAgX3NpemUgKz0gMTtcbiAgICAgIH07XG5cbiAgICAgIF90aGlzLnNpemUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIF9zaXplO1xuICAgICAgfTtcblxuICAgICAgX3RoaXMuaW5kZXhPZiA9IGZ1bmN0aW9uKGtleSkge1xuICAgICAgICByZXR1cm4gX21hcFtrZXldO1xuICAgICAgfTtcblxuICAgICAgX3RoaXMuY29udGFpbnMgPSBmdW5jdGlvbihrZXkpIHtcbiAgICAgICAgcmV0dXJuIHR5cGVvZiBfbWFwW2tleV0gIT0gJ3VuZGVmaW5lZCc7XG4gICAgICB9O1xuXG4gICAgICByZXR1cm4gX3RoaXM7XG4gICAgfTtcblxuICAgIHJldHVybiBfdGhpcztcbiAgfTtcblxuICB2YXIgY3JlYXRlRGF0YVVSTCA9IGZ1bmN0aW9uKHdpZHRoLCBoZWlnaHQsIGdldFBpeGVsKSB7XG4gICAgdmFyIGdpZiA9IGdpZkltYWdlKHdpZHRoLCBoZWlnaHQpO1xuICAgIGZvciAodmFyIHkgPSAwOyB5IDwgaGVpZ2h0OyB5ICs9IDEpIHtcbiAgICAgIGZvciAodmFyIHggPSAwOyB4IDwgd2lkdGg7IHggKz0gMSkge1xuICAgICAgICBnaWYuc2V0UGl4ZWwoeCwgeSwgZ2V0UGl4ZWwoeCwgeSkgKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgYiA9IGJ5dGVBcnJheU91dHB1dFN0cmVhbSgpO1xuICAgIGdpZi53cml0ZShiKTtcblxuICAgIHZhciBiYXNlNjQgPSBiYXNlNjRFbmNvZGVPdXRwdXRTdHJlYW0oKTtcbiAgICB2YXIgYnl0ZXMgPSBiLnRvQnl0ZUFycmF5KCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBieXRlcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgYmFzZTY0LndyaXRlQnl0ZShieXRlc1tpXSk7XG4gICAgfVxuICAgIGJhc2U2NC5mbHVzaCgpO1xuXG4gICAgcmV0dXJuICdkYXRhOmltYWdlL2dpZjtiYXNlNjQsJyArIGJhc2U2NDtcbiAgfTtcblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyByZXR1cm5zIHFyY29kZSBmdW5jdGlvbi5cblxuICByZXR1cm4gcXJjb2RlO1xufSgpO1xuXG4vLyBtdWx0aWJ5dGUgc3VwcG9ydFxuIWZ1bmN0aW9uKCkge1xuXG4gIHFyY29kZS5zdHJpbmdUb0J5dGVzRnVuY3NbJ1VURi04J10gPSBmdW5jdGlvbihzKSB7XG4gICAgLy8gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xODcyOTQwNS9ob3ctdG8tY29udmVydC11dGY4LXN0cmluZy10by1ieXRlLWFycmF5XG4gICAgZnVuY3Rpb24gdG9VVEY4QXJyYXkoc3RyKSB7XG4gICAgICB2YXIgdXRmOCA9IFtdO1xuICAgICAgZm9yICh2YXIgaT0wOyBpIDwgc3RyLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBjaGFyY29kZSA9IHN0ci5jaGFyQ29kZUF0KGkpO1xuICAgICAgICBpZiAoY2hhcmNvZGUgPCAweDgwKSB1dGY4LnB1c2goY2hhcmNvZGUpO1xuICAgICAgICBlbHNlIGlmIChjaGFyY29kZSA8IDB4ODAwKSB7XG4gICAgICAgICAgdXRmOC5wdXNoKDB4YzAgfCAoY2hhcmNvZGUgPj4gNiksXG4gICAgICAgICAgICAgIDB4ODAgfCAoY2hhcmNvZGUgJiAweDNmKSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoY2hhcmNvZGUgPCAweGQ4MDAgfHwgY2hhcmNvZGUgPj0gMHhlMDAwKSB7XG4gICAgICAgICAgdXRmOC5wdXNoKDB4ZTAgfCAoY2hhcmNvZGUgPj4gMTIpLFxuICAgICAgICAgICAgICAweDgwIHwgKChjaGFyY29kZT4+NikgJiAweDNmKSxcbiAgICAgICAgICAgICAgMHg4MCB8IChjaGFyY29kZSAmIDB4M2YpKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBzdXJyb2dhdGUgcGFpclxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBpKys7XG4gICAgICAgICAgLy8gVVRGLTE2IGVuY29kZXMgMHgxMDAwMC0weDEwRkZGRiBieVxuICAgICAgICAgIC8vIHN1YnRyYWN0aW5nIDB4MTAwMDAgYW5kIHNwbGl0dGluZyB0aGVcbiAgICAgICAgICAvLyAyMCBiaXRzIG9mIDB4MC0weEZGRkZGIGludG8gdHdvIGhhbHZlc1xuICAgICAgICAgIGNoYXJjb2RlID0gMHgxMDAwMCArICgoKGNoYXJjb2RlICYgMHgzZmYpPDwxMClcbiAgICAgICAgICAgIHwgKHN0ci5jaGFyQ29kZUF0KGkpICYgMHgzZmYpKTtcbiAgICAgICAgICB1dGY4LnB1c2goMHhmMCB8IChjaGFyY29kZSA+PjE4KSxcbiAgICAgICAgICAgICAgMHg4MCB8ICgoY2hhcmNvZGU+PjEyKSAmIDB4M2YpLFxuICAgICAgICAgICAgICAweDgwIHwgKChjaGFyY29kZT4+NikgJiAweDNmKSxcbiAgICAgICAgICAgICAgMHg4MCB8IChjaGFyY29kZSAmIDB4M2YpKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHV0Zjg7XG4gICAgfVxuICAgIHJldHVybiB0b1VURjhBcnJheShzKTtcbiAgfTtcblxufSgpO1xuXG4oZnVuY3Rpb24gKGZhY3RvcnkpIHtcbiAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgZGVmaW5lKFtdLCBmYWN0b3J5KTtcbiAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpO1xuICB9XG59KGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gcXJjb2RlO1xufSkpO1xuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSAobW9kdWxlKSA9PiB7XG5cdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuXHRcdCgpID0+IChtb2R1bGVbJ2RlZmF1bHQnXSkgOlxuXHRcdCgpID0+IChtb2R1bGUpO1xuXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCB7IGE6IGdldHRlciB9KTtcblx0cmV0dXJuIGdldHRlcjtcbn07IiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsIi8qKlxuICogc3BlY2lhbCB0aGFua3MgdG8gaGV4by10aGVtZS15aWxpYVxuICogaHR0cHM6Ly9naXRodWIuY29tL2xpdHRlbi9oZXhvLXRoZW1lLXlpbGlhL2Jsb2IvbWFzdGVyL3NvdXJjZS1zcmMvanMvc2hhcmUuanNcbiAqL1xuXG5pbXBvcnQgcXJjb2RlIGZyb20gJ3FyY29kZS1nZW5lcmF0b3InXG5cbmZ1bmN0aW9uIGluaXRRUihzVVJMKSB7XG4gIGxldCB0eXBlTnVtYmVyID0gMFxuICBsZXQgZXJyb3JDb3JyZWN0aW9uTGV2ZWwgPSAnTCdcbiAgbGV0IHFyID0gcXJjb2RlKHR5cGVOdW1iZXIsIGVycm9yQ29ycmVjdGlvbkxldmVsKVxuICBxci5hZGREYXRhKHNVUkwpXG4gIHFyLm1ha2UoKVxuICBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdzaGFyZS1xcmNvZGUnKVswXS5pbm5lckhUTUwgPVxuICAgIHFyLmNyZWF0ZUltZ1RhZygpXG59XG5cbmZ1bmN0aW9uIGdlbmVyYXRlKHRlbXBsYXRlVVJMLCBwYXJhbSkge1xuICBsZXQgc2hhcmVVUkwgPSB0ZW1wbGF0ZVVSTFxuICAgIC5yZXBsYWNlKC88JS1zVVJMJT4vZywgZW5jb2RlVVJJQ29tcG9uZW50KHBhcmFtLnNVUkwpKVxuICAgIC5yZXBsYWNlKC88JS1zVGl0bGUlPi9nLCBwYXJhbS5zVGl0bGUpXG4gICAgLnJlcGxhY2UoLzwlLXNEZXNjJT4vZywgcGFyYW0uc0Rlc2MpXG4gICAgLnJlcGxhY2UoLzwlLXNBdXRob3IlPi9nLCBwYXJhbS5zQXV0aG9yKVxuICAgIC5yZXBsYWNlKC88JS1zSW1nJT4vZywgZW5jb2RlVVJJQ29tcG9uZW50KHBhcmFtLnNJbWcpKVxuICB3aW5kb3cub3BlbihzaGFyZVVSTClcbn1cblxuZnVuY3Rpb24gaGFuZGxlU2hhcmVDbGljayh0eXBlLCBwYXJhbSkge1xuICBpZiAodHlwZSA9PT0gJ3dlaWJvJykge1xuICAgIGdlbmVyYXRlKFxuICAgICAgJ2h0dHA6Ly9zZXJ2aWNlLndlaWJvLmNvbS9zaGFyZS9zaGFyZS5waHA/dXJsPTwlLXNVUkwlPiZ0aXRsZT08JS1zVGl0bGUlPiZwaWM9PCUtc0ltZyU+JyxcbiAgICAgIHBhcmFtXG4gICAgKVxuICB9IGVsc2UgaWYgKHR5cGUgPT09ICdxem9uZScpIHtcbiAgICBnZW5lcmF0ZShcbiAgICAgICdodHRwOi8vc25zLnF6b25lLnFxLmNvbS9jZ2ktYmluL3F6c2hhcmUvY2dpX3F6c2hhcmVfb25la2V5P3VybD08JS1zVVJMJT4mdGl0bGU9PCUtc1RpdGxlJT4mcGljcz08JS1zSW1nJT4mc3VtbWFyeT08JS1zRGVzYyU+JyxcbiAgICAgIHBhcmFtXG4gICAgKVxuICB9IGVsc2UgaWYgKHR5cGUgPT09ICdmYWNlYm9vaycpIHtcbiAgICBnZW5lcmF0ZSgnaHR0cHM6Ly93d3cuZmFjZWJvb2suY29tL3NoYXJlci9zaGFyZXIucGhwP3U9PCUtc1VSTCU+JywgcGFyYW0pXG4gIH0gZWxzZSBpZiAodHlwZSA9PT0gJ3R3aXR0ZXInKSB7XG4gICAgZ2VuZXJhdGUoXG4gICAgICAnaHR0cHM6Ly90d2l0dGVyLmNvbS9pbnRlbnQvdHdlZXQ/dGV4dD08JS1zVGl0bGUlPiZ1cmw9PCUtc1VSTCU+JnZpYT08JS1zQXV0aG9yJT4nLFxuICAgICAgcGFyYW1cbiAgICApXG4gIH0gZWxzZSBpZiAodHlwZSA9PT0gJ3FyJykge1xuICAgIC8vIHByZSBpbml0IHFyXG4gIH1cbn1cblxuZnVuY3Rpb24gaW5pdCgpIHtcbiAgbGV0IHNVUkwgPSB3aW5kb3cubG9jYXRpb24uaHJlZlxuICBsZXQgc1RpdGxlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcigndGl0bGUnKS5pbm5lckhUTUxcbiAgbGV0IHNJbWcgPVxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5hcnRpY2xlLWVudHJ5IGltZycpICYmXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmFydGljbGUtZW50cnkgaW1nJykuZ2V0QXR0cmlidXRlKCdzcmMnKVxuICBzSW1nID1cbiAgICB3aW5kb3cubG9jYXRpb24ucHJvdG9jb2wgK1xuICAgICcvLycgK1xuICAgIHdpbmRvdy5sb2NhdGlvbi5ob3N0bmFtZSArXG4gICAgKHdpbmRvdy5sb2NhdGlvbi5wb3J0ID8gJzonICsgd2luZG93LmxvY2F0aW9uLnBvcnQgOiAnJykgK1xuICAgIHNJbWdcbiAgbGV0IHNEZXNjID1cbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuYXJ0aWNsZS1lbnRyeScpICYmXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmFydGljbGUtZW50cnknKS5pbm5lclRleHQuc3Vic3RyaW5nKDAsIDMwKSArICcuLi4nXG4gIGxldCBzQXV0aG9yID0gd2luZG93LnNpdGVNZXRhLmF1dGhvclxuICBsZXQgcGFyYW0gPSB7XG4gICAgc1VSTCxcbiAgICBzVGl0bGUsXG4gICAgc0ltZyxcbiAgICBzRGVzYyxcbiAgICBzQXV0aG9yLFxuICB9XG5cbiAgbGV0IHNoYXJlV3JhcHBlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5zaGFyZUxpc3QnKVxuICBpZiAoIXNoYXJlV3JhcHBlcikge1xuICAgIHJldHVyblxuICB9XG4gIGluaXRRUihzVVJMKVxuICBzaGFyZVdyYXBwZXIuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xuICAgIGlmICghZS50YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLXR5cGUnKSkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGhhbmRsZVNoYXJlQ2xpY2soZS50YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLXR5cGUnKSwgcGFyYW0pXG4gIH0pXG59XG5cbmluaXQoKVxuIl0sInNvdXJjZVJvb3QiOiIifQ==