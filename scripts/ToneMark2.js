// this module needs margin

class ToneMark {
  constructor() {
  }
  drawCircle(context, hoffset, voffset) {
    context.beginPath();
    context.arc(hoffset+this.deltaX, voffset+this.deltaY, 3, 0, Math.PI*2);
    context.stroke();
  }
  drawVerticalLine(context, hoffset, voffset) {
    context.beginPath();
    context.moveTo(hoffset+this.deltaX, voffset+this.deltaY);
    context.lineTo(hoffset+this.deltaX, voffset+this.deltaY+8.0);
    context.stroke();
  }
  drawLargeVerticalLine(context, hoffset, voffset) {
    context.beginPath();
    context.moveTo(hoffset+this.deltaX, voffset+this.deltaY);
    context.lineTo(hoffset+this.deltaX, voffset+this.deltaY+30.0);
    context.stroke();
  }
  drawHorizontalLine(context, hoffset, voffset) {
    context.beginPath();
    context.moveTo(hoffset+this.deltaX, voffset+this.deltaY);
    context.lineTo(hoffset+this.deltaX+10.0, voffset+this.deltaY);
    context.stroke();
  }
  drawAscendingBar(context, hoffset, voffset) {
    context.beginPath();
    context.moveTo(hoffset+this.deltaX, voffset+this.deltaY+8);
    context.lineTo(hoffset+this.deltaX+8, voffset+this.deltaY);
    context.stroke();
  }
  drawAscendingArrowHead(context, hoffset, voffset) {
    context.beginPath();
    context.moveTo(hoffset+this.deltaX+4, voffset+this.deltaY);
    context.lineTo(hoffset+this.deltaX+8, voffset+this.deltaY);
    context.lineTo(hoffset+this.deltaX+8, voffset+this.deltaY+4);
    context.stroke();
  }
  drawDescendingBar(context, hoffset, voffset) {
    context.beginPath();
    context.moveTo(hoffset+this.deltaX, voffset+this.deltaY);
    context.lineTo(hoffset+this.deltaX+8, voffset+this.deltaY+8);
    context.stroke();
  }
  drawDescendingArrowHead(context, hoffset, voffset) {
    context.beginPath();
    context.moveTo(hoffset+this.deltaX+4, voffset+this.deltaY+8);
    context.lineTo(hoffset+this.deltaX+8, voffset+this.deltaY+8);
    context.lineTo(hoffset+this.deltaX+8, voffset+this.deltaY+4);
    context.stroke();
  }
  drawMountain(context, hoffset, voffset) {
    context.beginPath();
    context.moveTo(hoffset+this.deltaX - 8.0, voffset+this.deltaY + 4.0);
    context.lineTo(hoffset+this.deltaX - 4.0, voffset+this.deltaY);
    context.lineTo(hoffset+this.deltaX, voffset+this.deltaY+4.0);
    context.stroke();
  }
  drawValley(context, hoffset, voffset) {
    context.beginPath();
    context.moveTo(hoffset+this.deltaX - 8.0, voffset+this.deltaY);
    context.lineTo(hoffset+this.deltaX - 4.0, voffset+this.deltaY+4.0);
    context.lineTo(hoffset+this.deltaX, voffset+this.deltaY);
    context.stroke();
  }
  drawBendedLine(context, hoffset, voffset) {
    context.beginPath();
    context.moveTo(hoffset+this.deltaX - 4.0, voffset+this.deltaY);
    context.lineTo(hoffset+this.deltaX, voffset+this.deltaY+4.0);
    context.lineTo(hoffset+this.deltaX-4.0, voffset+this.deltaY+8.0);
    context.stroke();
  }
  size() {    // default value, override the value if necessary
    return 1;
  }
  getClassName() {
    return this.constructor.name;
  }
}

class LowRise extends ToneMark {
  constructor() {
    super();
    this.deltaX = 2.0;
    this.deltaY = -4.0;
  }
  draw(context, hoffset, voffset) {
    super.drawAscendingBar(context, hoffset, voffset);
  }
}

class HighRise extends ToneMark {
  constructor() {
    super();
    this.deltaX = 2.0;
    this.deltaY = -22.0;
  }
  draw(context, hoffset, voffset) {
    super.drawAscendingBar(context, hoffset, voffset);
  }
}

class LowFall extends ToneMark {
  constructor() {
    super();
    this.deltaX = 2.0;
    this.deltaY = -4.0;
  }
  draw(context, hoffset, voffset) {
    super.drawDescendingBar(context, hoffset, voffset);
  }
}

class HighFall extends ToneMark {
  constructor() {
    super();
    this.deltaX = 2.0;
    this.deltaY = -22.0;
  }
  draw(context, hoffset, voffset) {
    super.drawDescendingBar(context, hoffset, voffset);
  }
}

class RiseFall extends ToneMark {
  constructor() {
    super();
    this.deltaX =  10.0;
    this.deltaY =  -20.0;
  }
  draw(context, hoffset, voffset) {
    super.drawMountain(context, hoffset, voffset);
  }
}

class FallRise extends ToneMark {
  constructor() {
    super();
    this.deltaX = 10.0;
    this.deltaY = -20.0;
  }
  draw(context, hoffset, voffset) {
    super.drawValley(context, hoffset, voffset);
  }
}

class MidLevel extends ToneMark {
  constructor() {
    super();
    this.deltaX = 8.0;
    this.deltaY = -20.0;
  }
  draw(context, hoffset, voffset) {
    super.drawBendedLine(context, hoffset, voffset);
  }
}

class HighStressed1 extends ToneMark {
  constructor() {
    super();
    this.deltaX = 7.0;
    this.deltaY = -25.0;
  }
  draw(context, hoffset, voffset) {
    super.drawVerticalLine(context, hoffset, voffset);
  }
}

class HighStressed2 extends ToneMark {
  constructor() {
    super();
    this.deltaX = 5.0;
    this.deltaY = -22.0;
  }
  draw(context, hoffset, voffset) {
    super.drawCircle(context, hoffset, voffset);
  }
}

class HighStressed3 extends ToneMark {
  constructor() {
    super();
    this.deltaX = 0.0;
    this.deltaY = -25.0;
  }
  draw(context, hoffset, voffset) {
    super.drawDescendingBar(context, hoffset, voffset);
    super.drawDescendingArrowHead(context, hoffset, voffset);
  }
}

class LowStressed1 extends ToneMark {
  constructor() {
    super();
    this.deltaX = 7.0;
    this.deltaY = -5.0;
  }
  draw(context, hoffset, voffset) {
    super.drawVerticalLine(context, hoffset, voffset);
  }
}

class LowStressed2 extends ToneMark {
  constructor() {
    super();
    this.deltaX = 5.0;
    this.deltaY = -2.0;
  }
  draw(context, hoffset, voffset) {
    super.drawCircle(context, hoffset, voffset);
  }
}

class LowStressed3 extends ToneMark {
  constructor() {
    super();
    this.deltaX = 0.0;
    this.deltaY = -5.0;
  }
  draw(context, hoffset, voffset) {
    super.drawAscendingBar(context, hoffset, voffset);
    super.drawAscendingArrowHead(context, hoffset, voffset);
  }
}

class HighPrehead extends ToneMark {
  constructor() {
    super();
    this.deltaX = -3.0;
    this.deltaY = -22.0;
  }
  draw(context, hoffset, voffset) {
    super.drawHorizontalLine(context, hoffset, voffset);
  }
}

class LowPrehead extends ToneMark {
  constructor() {
    super();
    this.deltaX = -3.0;
    this.deltaY = 0.0;
  }
  draw(context, hoffset, voffset) {
    super.drawHorizontalLine(context, hoffset, voffset);
  }
}

class IP extends ToneMark {
  constructor() {
    super();
    this.deltaX = 4.0;
    this.deltaY = -28.0;
  }
  draw(context, hoffset, voffset) {
    super.drawLargeVerticalLine(context, hoffset+1, voffset);
  }
}

class FullStop extends ToneMark {
  constructor() {
    super();
    this.deltaX = 4.0;
    this.deltaY = -28.0;
  }
  draw(context, hoffset, voffset) {
    super.drawLargeVerticalLine(context, hoffset-1, voffset);
    super.drawLargeVerticalLine(context, hoffset+3, voffset);
  }
}

class SyllabicConsonant extends ToneMark {
  constructor() {
    super();
  }
  draw(context, hoffset, voffset) {
  }
  size() {
    return 0;
  }
}
