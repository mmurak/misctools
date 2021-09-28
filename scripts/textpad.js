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
let outButton = document.createElement("input");
outButton.type = "button";
outButton.value = "TSMイメージ出力";
outButton.addEventListener("click", function() {
  let anchortag = document.createElement("a");
  anchortag.href = cCanvas.textCanvas.toDataURL("image/png");
  anchortag.download = "tsmImage.png";
  anchortag.click();
});

// preparation for usecase - I
let br2 = document.createElement("br");
let help = document.createElement("input");
help.type = "button";
help.value = "簡単な説明"
help.addEventListener("click", function() {
  alert("・TSMの入力はESCキーに続いて以下の2文字を入力\n  Low-Fall: lf    High-Fall: hf\n  Low-Rise: lr    High-Rise: hr\n  Fall-Rise: fr    Rise-Fall: rf\n  Mid-Level: ml\n  高ストレス（初）: h1    低ストレス（初）: l1\n  高ストレス: h2    低ストレス: l2\n  下降調: h3    上昇調: l3\n  高前頭部: hp\n  IP: ip    文末: fs\n\n・なお、URLに以下のパラメーターを指定可能\n  フォントサイズ（デフォルトは27）: fontsize\n  TSM倍率（デフォルトは1.0）: magfactor\n  行間（デフォルトは15ピクセル）： spacing\n　　なお、お気に入りは TSMEdit.html?fontsize=15&magfactor=0.6&spacing=10\n\n・また、マウスドラッグでフリーハンド描画が可能（シフトキーを押しながらドラッグで赤、optionキーを押しながらドラッグで緑）\n\n・ファイル保存機能はないものの、内部コード（Unicodeのsubscript領域を流用）で他エディターとコピー&ペーストでのやり取りが可能");
});
let br3 = document.createElement("br");
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

let ParmList = null;

let fontSize = getParm("fontsize", "27");
let magFactor = Number(getParm("magfactor", "1.0"));
let vextra = Number(getParm("spacing", "15"));

let nd = wrapWithDiv([gate.getGate(), br1, button, outButton, br2, help, br3, stepback], "float:right;");
base.addLayer(nd, "right:10px !important;", 80)

let cCanvas = new CompositeCanvas(800, 500, fontSize + "pt Times New Roman", 20, 20, vextra, magFactor);
window.addEventListener("blur", function (evt) {
  cCanvas._hideBlinkingCursor();
});
window.addEventListener("focus", function (evt) {
  processInput();
});
base.addLayer(cCanvas.textCanvas, "", 40);        // Add text canvas
base.addLayer(cCanvas.cursorCanvas, "", 60);    // Add cursor canvas

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
GlobalGate.getGate().focus();
processInput();



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

function getParm(key, defaultValue) {
  if (ParmList == null) {
    ParmList = [];
    var arg = location.search.substring(1);
    if (arg != "") {
      let args = arg.split("&");
      for(let i = 0; i < args.length; i++) {
        parmPair = args[i].split("=");
        ParmList[parmPair[0]] = parmPair[1];
      }
    }
  }
  if (key in ParmList) {
    return ParmList[key];
  } else {
    return defaultValue;
  }
}
