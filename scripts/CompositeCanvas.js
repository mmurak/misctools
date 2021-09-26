/*
 * class CompositeCanvas(width, height, fontInfo, vmargin, hmargin, vextra)
 */
class CompositeCanvas {
  constructor(width, height, fontInfo, vmargin, hmargin, vextra, magFactor) {
    this.width = width;
    this.height = height;
    this.fontInfo = fontInfo;
    this.vmargin = vmargin;
    this.hmargin = hmargin;
    this.vextra = vextra;
    this.magFactor = magFactor;
    this.textCanvas = document.createElement("canvas");
    this.textCtx = null;
    this.cursorCanvas = document.createElement("canvas");
    this.cursorCtx = null;
    this._configCanvas(width, height);
    let dim = this.textCtx.measureText("M");
    this.charHeight = dim.actualBoundingBoxAscent + dim.actualBoundingBoxDescent;
    this.vCursor = true;
  }
  // Internal method - Cursor position finder
  _cursorInfo(text, csrp) {
    let sentText = text + "\n";
    let sstr = sentText.substr(0, csrp);
    let ar = sstr.split(/\n/);
    let ll = ar.length - 1;
    let rest = sentText.substring(csrp, sentText.indexOf("\n", csrp));
    return [ll, ar[ll], rest];
  }
  // Draw V cursor
  _drawVcursor(text, csr) {
    let rc = this._cursorInfo(text, csr);
    this.cursorCtx.beginPath();
    this.cursorCtx.moveTo(this.textCtx.measureText(rc[1]).width + this.hmargin, rc[0] * (this.vextra + this.charHeight) +this.vmargin - 5);
    this.cursorCtx.lineTo(this.textCtx.measureText(rc[1]).width + this.hmargin, rc[0] * (this.vextra + this.charHeight) + this.vmargin + this.charHeight + 5);
    this.cursorCtx.stroke();
  }
  // Stop cursor blinking (internal use)
  _hideBlinkingCursor() {
    clearInterval(this.intervalId);
    if (this.vCursor)
      this.cursorCtx.clearRect(0, 0, this.width, this.height);
  }
  // Process for vertical cursor with blinker
  _displayVcursor(text, csr) {
    let flag = true;
    this.vCursor = true;
    this._drawVcursor(text, csr);
    this.intervalId = setInterval(() => {
      if (flag == false) {
        flag = true;
        this._drawVcursor(text, csr);
      } else {
        flag = false;
        this.cursorCtx.clearRect(0, 0, this.width, this.height);
      }
    }, 500);
  }
  // Process for range cursor
  _displayRcursor(text, csr1, csr2) {
    this.vCursor = false;
    if (csr1 > csr2) {
      let temp = csr2;
      csr2 = csr1;
      csr1 = temp;
    }
    let startrc = this._cursorInfo(text, csr1);
    let endrc = this._cursorInfo(text, csr2);
    if (startrc[0] == endrc[0]) {
      this.cursorCtx.beginPath();
      let startX = this.textCtx.measureText(startrc[1]).width;
      let endX = this.textCtx.measureText(endrc[1]).width;
      this.cursorCtx.fillRect(startX + this.hmargin, startrc[0] * (this.vextra + this.charHeight) + this.vmargin - 5, endX - startX, this.charHeight + 10);
      this.cursorCtx.stroke();
    } else {
      this.cursorCtx.beginPath();
      let startX = this.textCtx.measureText(startrc[1]).width;
      let endX = this.textCtx.measureText(endrc[1]).width;
      this.cursorCtx.fillRect(startX + this.hmargin, startrc[0] * (this.vextra + this.charHeight) + this.vmargin - 5, this.textCtx.measureText(startrc[2]).width, this.charHeight + 10);
      let lptr = startrc[0]+1;
      let lineArray  = text.split(/\n/);
      while(lptr < endrc[0]) {
        let line = lineArray[lptr];
        this.cursorCtx.fillRect(this.hmargin, lptr *  (this.vextra + this.charHeight) + this.vmargin - 5, this.textCtx.measureText(line).width, this.charHeight + 10);
        lptr += 1;
      }
      this.cursorCtx.fillRect(this.hmargin, endrc[0] * (this.vextra + this.charHeight) + this.vmargin - 5, this.textCtx.measureText(endrc[1]).width, this.charHeight + 10);
      this.cursorCtx.stroke();
    }
  }
  _configCanvas(pHsize, pVsize) {
    this.width = pHsize;
    this.height = pVsize;
    this.textCanvas.width = pHsize;
    this.textCanvas.height = pVsize;
    this.textCtx = this.textCanvas.getContext("2d");
    this.textCtx.font = this.fontInfo;
    this.textCtx.strokeStyle = this.colour;
    this.textCtx.fillStyle = this.fillColour;
    this.textCtx.lineWidth = 2;
    this.textCtx.lineCap = "round";
    this.cursorCanvas.width = pHsize;
    this.cursorCanvas.height = pVsize;
    this.cursorCtx = this.cursorCanvas.getContext("2d");
    this.cursorCtx.strokeStyle = "rgb(0, 120, 0, 1.0)";
    this.cursorCtx.fillStyle = "rgb(180, 190, 240, 0.4)";
    this.cursorCtx.lineWidth = 2;
    this.cursorCtx.lineCap = "round";
  }
  // check canvas size and stretch if necessary
  _canvasStretcher(rowNo, text) {
    let eachText = text.split(/\n/);
    let preferredV = Math.trunc((rowNo + 1) * (this.vextra + this.charHeight) + this.vmargin + this.charHeight);
    preferredV = Math.max(preferredV, this.textCanvas.height);
    let preferredH = Math.trunc(this.textCtx.measureText(eachText[rowNo]).width + (this.hmargin * 2));
    preferredH = Math.max(preferredH, this.textCanvas.width);
    if ((this.textCanvas.height <  preferredV) || (this.textCanvas.width < preferredH)) {
      this._configCanvas(preferredH, preferredV);
    }
  }
  // display text
  display(text, csr1, csr2, tsmMgr) {
    // Text section
    this.textCtx.fillStyle = "rgb(255,255,255)";
    this.textCtx.fillRect(0, 0, this.width, this.height);
    this.textCtx.fillStyle = "rgb(0,0,0)";
    text.split(/\n/).forEach((aLine, index) => {
      let hstart = this.hmargin;
      this._canvasStretcher(index, text.replaceAll(tsmMgr.regexpG, "\u{2004}"));
      while(aLine.length > 0) {
        let pt = aLine.search(tsmMgr.regexp);
        if (pt < 0) {
          this.textCtx.fillText(aLine, hstart, index * (this.vextra + this.charHeight) + this.vmargin + this.charHeight);
          break;
        } else {
          // display pre-text part
          let preTSM = aLine.substr(0, pt);
          this.textCtx.fillText(preTSM, hstart, index * (this.vextra + this.charHeight) + this.vmargin + this.charHeight);
          hstart += this.textCtx.measureText(preTSM).width;
          // display TSM part
          let tsmChar = aLine.substr(pt, 1);
          tsmMgr.drawObject(tsmChar, this.textCtx, hstart, index * (this.vextra + this.charHeight) + this.vmargin + this.charHeight, this.magFactor);
          hstart += this.textCtx.measureText("\u{2004}").width;
          // preparation for the next step
          aLine = aLine.substr(pt + 1);
        }
      }
//      this.textCtx.fillText(aLine, this.hmargin, index * (this.vextra + this.charHeight) + this.vmargin + this.charHeight);
    });
    // Cursor section
    this.cursorCtx.clearRect(0, 0, this.width, this.height);
    clearInterval(this.intervalId);
    let fixedText = text.replaceAll(tsmMgr.regexpG, "\u{2004}");
    if (csr1 == csr2) {
      this._displayVcursor(fixedText, csr1);
    } else {
      this._displayRcursor(fixedText, csr1, csr2);
    }
  }
}

/*
 * function wrapWithDiv(elementsArray, parm)
 */
function wrapWithDiv(elems, parm) {
  let wrappingDiv = document.createElement("div");
  wrappingDiv.style = parm;
  for (let e of elems) {
    wrappingDiv.appendChild(e);
  }
  return wrappingDiv;
}
