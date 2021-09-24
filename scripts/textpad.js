// HTML側は container というIDのdivを用意しておくこと。
const container = document.getElementById("container");



// ========== start ==========
let base = new BaseContainer();       // Create base wrapper

// gate indicator
let gate = new GateIndicator(16, 1, processInput);    //  Gate Indicator
let br1 = document.createElement("br");
// input button
let button = document.createElement("input");
button.type = "button";
button.value = "行間（高さ）の変更";
button.addEventListener("click", function() {
  let val = prompt("Input vertical space in pixel (now " + cCanvas.vextra + "): ");
  if ((val != null) && (val.match(/^[0-9]+$/) != null)) {
    cCanvas.vextra = Math.trunc(val);
  }
});

// preparation for usecase - I
let br2 = document.createElement("br");
const stepback = document.createElement("input");
stepback.type = "button";
stepback.value = "最終ストロークを削除";
stepback.disabled = true;
stepback.addEventListener("click", function() {
  if (imageArray.length == 0) return;
  let image = imageArray.pop();
  toneCtx.putImageData(image, 0, 0);
  if (imageArray.length == 0) stepback.disabled = true;
  GlobalGate.getGate().focus();
});
// end preparation for usecase - I

let nd = wrapWithDiv([gate.getGate(), br1, button, br2, stepback], "float:right;");
base.addLayer(nd, "right:10px !important;", 80)

let cCanvas = new CompositeCanvas(800, 500, "27pt Times New Roman", 20, 20, 30);
window.addEventListener("blur", function (evt) {
  cCanvas._hideBlinkingCursor();
});
window.addEventListener("focus", function (evt) {
  processInput();
});
base.addLayer(cCanvas.textCanvas, "", 60);        // Add text canvas
base.addLayer(cCanvas.cursorCanvas, "", 40);    // Add cursor canvas

// usecase - I
let imageArray = [];
const coldColor = "rgb(224, 255, 255);"
const hotColor = "rgb(255, 192, 203);"
stepback.disabled = true;
let isDrag = false;
let lastX = null;
let lastY = null;
const redColour = "rgb(255,0,0,0.05)";
const blueColour = "rgb(0,0,255,0.05)";
const greenColour = "rgb(0,255,0,0.05)";
let penColour = blueColour;
const penCentreColour = "rgb(255,255,255,0.5)";
const nibSize = 7;
const centreNibSize = 1;
let toneCanvas = document.createElement("canvas");
toneCanvas.width = window.innerWidth;
toneCanvas.height = window.innerHeight;
console.log("w:" + window.innerWidth + "  h:" + window.innerHeight);
toneCanvas.addEventListener("mousedown", (evt) => { dragStart(evt); });
toneCanvas.addEventListener("mouseup", (evt) => { dragEnd(evt); });
toneCanvas.addEventListener("mouseout", (evt) => { dragEnd(evt); });
toneCanvas.addEventListener("mousemove", (evt) => { draw(fixedX(evt), fixedY(evt)); });
toneCanvas.addEventListener("touchstart", (evt) => { touchStart(evt); });
toneCanvas.addEventListener("touchend", (evt) => { touchEnd(evt); });
toneCanvas.addEventListener("touchmove", (evt) => { touchMove(evt); });
let toneCtx = toneCanvas.getContext("2d");
base.addLayer(toneCanvas, "", 70);

// end of usecase - I

container.appendChild(base.getBase());          // put them altogether
gate.getGate().focus();




function dragStart(evt) {
  imageArray.push(toneCtx.getImageData(0, 0, toneCanvas.width, toneCanvas.height));
  stepback.disabled = false;
  if (evt.shiftKey) {
    penColour = redColour;
  } else if (evt.altKey) {
    penColour = greenColour;
  } else {
    penColour = blueColour;
  }
  toneCtx.beginPath();
  isDrag = true;
}

function dragEnd(evt) {
  toneCtx.closePath();
  isDrag = false;
  lastX = null;
  lastY = null;
  GlobalGate.getGate().focus();
}

function touchStart(evt) {
  evt.preventDefault();
  imageArray.push(toneCtx.getImageData(0, 0, toneCanvas.width, toneCanvas.height));
  stepback.disabled = false;
  toneCtx.beginPath();
  isDrag = true;
}

function touchEnd(evt) {
  toneCtx.closePath();
  isDrag = false;
  lastX = null;
  lastY = null;
  GlobalGate.getGate().focus();
}

function touchMove(evt) {
  let x = evt.changedTouches[0].pageX;
  let y = evt.changedTouches[0].pageY;
  draw(x, y);
}

function fixedX(evt) {
  return evt.clientX - toneCanvas.getBoundingClientRect().left;
}

function fixedY(evt) {
  return evt.clientY - toneCanvas.getBoundingClientRect().top;
}

function draw(x, y) {
  if (!isDrag) return;
  toneCtx.lineCap = "round";
  toneCtx.lineJoin = "round";
  toneCtx.strokeStyle = penColour;
  toneCtx.lineWidth = nibSize;
  if (lastX == null || lastY == null) {
    toneCtx.moveTo(x, y);
  } else {
    toneCtx.moveTo(lastX, lastY);
  }
  toneCtx.lineTo(x, y);
  toneCtx.stroke();
  toneCtx.strokeStyle = penCentreColour;
  toneCtx.lineWidth = centreNibSize;
  if (lastX == null || lastY == null) {
    toneCtx.moveTo(x, y);
  } else {
    toneCtx.moveTo(lastX, lastY);
  }
  toneCtx.lineTo(x, y);
  toneCtx.stroke();
  lastX = x;
  lastY = y;
}

function eraseLastStroke() {
  if (imageArray.length == 0) return;
  let image = imageArray.pop();
  toneCtx.putImageData(image, 0, 0);
  if (imageArray.length == 0) stepback.disabled = true;
}
