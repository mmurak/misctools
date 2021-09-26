// this module needs margin

class ToneMark {
  constructor() {
  }
  drawCircle(context, hoffset, voffset, magFactor) {
    context.beginPath();
    context.arc(hoffset+this.deltaX * magFactor, voffset+this.deltaY * magFactor, 3 * magFactor, 0, Math.PI*2);
    context.stroke();
  }
  drawVerticalLine(context, hoffset, voffset, magFactor) {
    context.beginPath();
    context.moveTo(hoffset+this.deltaX * magFactor, voffset+this.deltaY * magFactor);
    context.lineTo(hoffset+this.deltaX * magFactor, voffset+(this.deltaY+8.0) * magFactor);
    context.stroke();
  }
  drawLargeVerticalLine(context, hoffset, voffset, magFactor) {
    context.beginPath();
    context.moveTo(hoffset+this.deltaX * magFactor, voffset+this.deltaY * magFactor);
    context.lineTo(hoffset+this.deltaX * magFactor, voffset+(this.deltaY+30.0) * magFactor);
    context.stroke();
  }
  drawHorizontalLine(context, hoffset, voffset, magFactor) {
    context.beginPath();
    context.moveTo(hoffset+this.deltaX * magFactor, voffset+this.deltaY * magFactor);
    context.lineTo(hoffset+(this.deltaX+10.0) * magFactor, voffset+this.deltaY * magFactor);
    context.stroke();
  }
  drawAscendingBar(context, hoffset, voffset, magFactor) {
    context.beginPath();
    context.moveTo(hoffset+this.deltaX * magFactor, voffset+(this.deltaY+8) * magFactor);
    context.lineTo(hoffset+(this.deltaX+8) * magFactor, voffset+this.deltaY * magFactor);
    context.stroke();
  }
  drawAscendingArrowHead(context, hoffset, voffset, magFactor) {
    context.beginPath();
    context.moveTo(hoffset+(this.deltaX+4) * magFactor, voffset+this.deltaY * magFactor);
    context.lineTo(hoffset+(this.deltaX+8) * magFactor, voffset+this.deltaY * magFactor);
    context.lineTo(hoffset+(this.deltaX+8) * magFactor, voffset+(this.deltaY+4) * magFactor);
    context.stroke();
  }
  drawDescendingBar(context, hoffset, voffset, magFactor) {
    context.beginPath();
    context.moveTo(hoffset+this.deltaX * magFactor, voffset+this.deltaY * magFactor);
    context.lineTo(hoffset+(this.deltaX+8) * magFactor, voffset+(this.deltaY+8) * magFactor);
    context.stroke();
  }
  drawDescendingArrowHead(context, hoffset, voffset, magFactor) {
    context.beginPath();
    context.moveTo(hoffset+(this.deltaX+4) * magFactor, voffset+(this.deltaY+8) * magFactor);
    context.lineTo(hoffset+(this.deltaX+8) * magFactor, voffset+(this.deltaY+8) * magFactor);
    context.lineTo(hoffset+(this.deltaX+8) * magFactor, voffset+(this.deltaY+4) * magFactor);
    context.stroke();
  }
  drawMountain(context, hoffset, voffset, magFactor) {
    context.beginPath();
    context.moveTo(hoffset+(this.deltaX - 8.0) * magFactor, voffset+(this.deltaY + 4.0) * magFactor);
    context.lineTo(hoffset+(this.deltaX - 4.0) * magFactor, voffset+this.deltaY * magFactor);
    context.lineTo(hoffset+this.deltaX * magFactor, voffset+(this.deltaY+4.0) * magFactor);
    context.stroke();
  }
  drawValley(context, hoffset, voffset, magFactor) {
    context.beginPath();
    context.moveTo(hoffset+(this.deltaX - 8.0) * magFactor, voffset+this.deltaY * magFactor);
    context.lineTo(hoffset+(this.deltaX - 4.0) * magFactor, voffset+(this.deltaY+4.0) * magFactor);
    context.lineTo(hoffset+this.deltaX * magFactor, voffset+this.deltaY * magFactor);
    context.stroke();
  }
  drawBendedLine(context, hoffset, voffset, magFactor) {
    context.beginPath();
    context.moveTo(hoffset+(this.deltaX - 4.0) * magFactor, voffset+this.deltaY * magFactor);
    context.lineTo(hoffset+this.deltaX * magFactor, voffset+(this.deltaY+4.0) * magFactor);
    context.lineTo(hoffset+(this.deltaX-4.0) * magFactor, voffset+(this.deltaY+8.0) * magFactor);
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
  draw(context, hoffset, voffset, magFactor) {
    super.drawAscendingBar(context, hoffset, voffset, magFactor);
  }
}

class HighRise extends ToneMark {
  constructor() {
    super();
    this.deltaX = 2.0;
    this.deltaY = -22.0;
  }
  draw(context, hoffset, voffset, magFactor) {
    super.drawAscendingBar(context, hoffset, voffset, magFactor);
  }
}

class LowFall extends ToneMark {
  constructor() {
    super();
    this.deltaX = 2.0;
    this.deltaY = -4.0;
  }
  draw(context, hoffset, voffset, magFactor) {
    super.drawDescendingBar(context, hoffset, voffset, magFactor);
  }
}

class HighFall extends ToneMark {
  constructor() {
    super();
    this.deltaX = 2.0;
    this.deltaY = -22.0;
  }
  draw(context, hoffset, voffset, magFactor) {
    super.drawDescendingBar(context, hoffset, voffset, magFactor);
  }
}

class RiseFall extends ToneMark {
  constructor() {
    super();
    this.deltaX =  10.0;
    this.deltaY =  -20.0;
  }
  draw(context, hoffset, voffset, magFactor) {
    super.drawMountain(context, hoffset, voffset, magFactor);
  }
}

class FallRise extends ToneMark {
  constructor() {
    super();
    this.deltaX = 10.0;
    this.deltaY = -20.0;
  }
  draw(context, hoffset, voffset, magFactor) {
    super.drawValley(context, hoffset, voffset, magFactor);
  }
}

class MidLevel extends ToneMark {
  constructor() {
    super();
    this.deltaX = 8.0;
    this.deltaY = -20.0;
  }
  draw(context, hoffset, voffset, magFactor) {
    super.drawBendedLine(context, hoffset, voffset, magFactor);
  }
}

class HighStressed1 extends ToneMark {
  constructor() {
    super();
    this.deltaX = 7.0;
    this.deltaY = -25.0;
  }
  draw(context, hoffset, voffset, magFactor) {
    super.drawVerticalLine(context, hoffset, voffset, magFactor);
  }
}

class HighStressed2 extends ToneMark {
  constructor() {
    super();
    this.deltaX = 5.0;
    this.deltaY = -22.0;
  }
  draw(context, hoffset, voffset, magFactor) {
    super.drawCircle(context, hoffset, voffset, magFactor);
  }
}

class HighStressed3 extends ToneMark {
  constructor() {
    super();
    this.deltaX = 0.0;
    this.deltaY = -25.0;
  }
  draw(context, hoffset, voffset, magFactor) {
    super.drawDescendingBar(context, hoffset, voffset, magFactor);
    super.drawDescendingArrowHead(context, hoffset, voffset, magFactor);
  }
}

class LowStressed1 extends ToneMark {
  constructor() {
    super();
    this.deltaX = 7.0;
    this.deltaY = -5.0;
  }
  draw(context, hoffset, voffset, magFactor) {
    super.drawVerticalLine(context, hoffset, voffset, magFactor);
  }
}

class LowStressed2 extends ToneMark {
  constructor() {
    super();
    this.deltaX = 5.0;
    this.deltaY = -2.0;
  }
  draw(context, hoffset, voffset, magFactor) {
    super.drawCircle(context, hoffset, voffset, magFactor);
  }
}

class LowStressed3 extends ToneMark {
  constructor() {
    super();
    this.deltaX = 0.0;
    this.deltaY = -5.0;
  }
  draw(context, hoffset, voffset, magFactor) {
    super.drawAscendingBar(context, hoffset, voffset, magFactor);
    super.drawAscendingArrowHead(context, hoffset, voffset, magFactor);
  }
}

class HighPrehead extends ToneMark {
  constructor() {
    super();
    this.deltaX = -3.0;
    this.deltaY = -22.0;
  }
  draw(context, hoffset, voffset, magFactor) {
    super.drawHorizontalLine(context, hoffset, voffset, magFactor);
  }
}

class LowPrehead extends ToneMark {
  constructor() {
    super();
    this.deltaX = -3.0;
    this.deltaY = 0.0;
  }
  draw(context, hoffset, voffset, magFactor) {
    super.drawHorizontalLine(context, hoffset, voffset, magFactor);
  }
}

class IP extends ToneMark {
  constructor() {
    super();
    this.deltaX = 4.0;
    this.deltaY = -28.0;
  }
  draw(context, hoffset, voffset, magFactor) {
    super.drawLargeVerticalLine(context, hoffset+1, voffset, magFactor);
  }
}

class FullStop extends ToneMark {
  constructor() {
    super();
    this.deltaX = 4.0;
    this.deltaY = -28.0;
  }
  draw(context, hoffset, voffset, magFactor) {
    super.drawLargeVerticalLine(context, hoffset-1, voffset, magFactor);
    super.drawLargeVerticalLine(context, hoffset+3, voffset, magFactor);
  }
}

class SyllabicConsonant extends ToneMark {
  constructor() {
    super();
  }
  draw(context, hoffset, voffset, magFactor) {
  }
  size() {
    return 0;
  }
}
