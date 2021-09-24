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
      if (evt.key == "Escape") {
        if (this.escaped) {
          // Abort Escape-Mode
          console.log("Escaped:" + g.value);
          // Restore values
          g.value = this.escapedString;
          g.setSelectionRange(this.escapedCursor[0], this.escapedCursor[1]);
          this.escaped = false;
          GlobalGate.getGate().addEventListener("input", inputProc);
          GlobalGate.focusIn();
        } else {
          // Entering Escape-Mode
          GlobalGate.commandMode();
          // Backup current status
          this.escapedString = g.value;
          this.escapedCursor = [g.selectionStart, g.selectionEnd];
          // Preparation for escape command
          g.value = "";
          g.selectionStart = g.selectionEnd = 0;
          this.escaped = true;
          GlobalGate.getGate().removeEventListener("input", inputProc);
        }
        return;
      }
      if (this.escaped) {
        if (g.value.length >= 2) {
console.log("COMMAND:" + g.value);
          let iPoint = Math.max(this.escapedCursor[0], this.escapedCursor[1]);
          let newChar = GlobalGate.tsmMgr.getInternalChar(g.value);
          if (newChar != null) {
            g.value = this.escapedString.substring(0, iPoint) + newChar + this.escapedString.slice(iPoint);
            g.setSelectionRange(iPoint+1, iPoint+1);
            processInput();
          } else {
//console.log("start:" + this.escapedCursor[0] + " end:" + this.escapedCursor[1] + " with:" + this.escapedString);
            g.value = this.escapedString;
            g.setSelectionRange(this.escapedCursor[0], this.escapedCursor[1]);
          }
          this.escaped = false;
          GlobalGate.getGate().addEventListener("input", inputProc);
          GlobalGate.focusIn();
        } else {
//console.log("ESC:" + g.value);
        }
      } else {    // Mainly for cursor movement
        callbackHook();
      }
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
  cCanvas.display(gg.value, gg.selectionStart, gg.selectionEnd, GlobalGate.tsmMgr);
}
