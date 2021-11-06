/*
 * class GateIndicator(columns, rows, callback)
 *
 *   focusIn()
 *   focusOut()
 *   getGate()
 */
function inputProc(evt) {
  GlobalGate.callbackHook();
}


let GlobalGate;   // Make this global to class variable when the JS supports.
class GateIndicator {
  constructor(cols, rows, callbackHook) {
    this.gate  = document.createElement("textarea");
    this.gate.cols = cols;
    this.gate.rows = rows;
    this.gate.wrap = "off";
    this.gate.setAttribute("spellcheck", false);
    this.callbackHook = callbackHook;
    // Constants
    this.coldColor = "rgb(224, 255, 255);"
    this.hotColor = "rgb(100,230,180);";     // "rgb(255, 192, 203);"
    this.commandColor = "rgb(230,230,80);";     // "rgb(255, 192, 203);"
    this.focusOut();
    this.escaped = false;
    this.escapedString = "";
    this.escapedCursor = [0, 0];
    this.tsmMgr = new TSMmanager();
    GlobalGate = this;    // Could be eliminated when the language support class variables
    this.gate.addEventListener("input", inputProc);
    this.gate.addEventListener("keyup", function(evt) {
      let g = GlobalGate.getGate();
      callbackHook();
    });
    this.gate.addEventListener("focusin", function(evt) {
      GlobalGate.focusIn();
    });
    this.gate.addEventListener("focusout", function(evt) {
      GlobalGate.focusOut();
      GlobalGate.getGate().focus();
    });
  }
  focusIn() {
    this.gate.style = "color:" + this.hotColor  + ";text-decoration-color:" + this.hotColor  + ";background-color:" + this.hotColor + "caret-color:" + this.hotColor + "font-size: 200%;overflow:hidden;";
  }
  focusOut() {
    this.gate.style = "color:" + this.coldColor  + ";text-decoration-color:" + this.coldColor  + ";background-color:" + this.coldColor + "caret-color:" + this.coldColor + "font-size:200%;overflow:hidden;";
  }
  commandMode() {
    this.gate.style = "color:black;text-decoration-color:" + this.commandColor  + ";background-color:" + this.commandColor + "caret-color:" + this.commandColor + "font-size:200%;overflow:hidden;";
  }
  getGate() {
    return this.gate;
  }
}

function processInput() {
  let gg = GlobalGate.getGate();
  let divider = Math.min(gg.selectionStart, gg.selectionEnd);
  let b4Ptr = gg.value.substr(0, divider);
  let afPtr = gg.value.substr(divider);
  GlobalGate.tsmMgr.dict.forEach((val, key) => {
    b4Ptr = b4Ptr.replace("\\" + key, val[1]);
  });
  gg.value = b4Ptr + afPtr;
  if (b4Ptr.length != divider) {
    gg.selectionStart = gg.selectionEnd = b4Ptr.length;
  }
  cCanvas.display(gg.value, gg.selectionStart, gg.selectionEnd, GlobalGate.tsmMgr);
}
