class TSMmanager {
  constructor() {
    // Internal codes are taken from 'Subscripts (2080-2094)
    this.dict = new Map([["lr", [LowRise, "₀"]], ["hr", [HighRise, "₁"]], ["lf", [LowFall, "₂"]], ["hf", [HighFall, "₃"]],
                                    ["rf", [RiseFall, "₄"]], ["fr", [FallRise, "₅"]], ["ml", [MidLevel, "₆"]],
                                    ["h1", [HighStressed1, "₇"]], ["h2", [HighStressed2, "₈"]], ["h3", [HighStressed3, "₉"]],
                                    ["l1", [LowStressed1, "₊"]], ["l2", [LowStressed2, "₋"]], ["l3", [LowStressed3, "₌"]],
                                    ["hp", [HighPrehead, "₍"]], ["lp", [LowPrehead, "₎"]],
                                    ["aa", [SyllabicConsonant, "ₐ"]],
                                    ["fs", [FullStop, "ₑ"]], ["ip", [IP, "ₒ"]]]);
    this.objDict = new Map();
    this.keys = "[";
    this.dict.forEach((val, key) => {
      this.objDict.set(val[1], new val[0]());
      this.keys += val[1];
    });
    this.keys += "]";
    this.regexp = new RegExp(this.keys);
    this.regexpG = new RegExp(this.keys, "g");
  }

  getInternalChar(mkStr) {
    mkStr = mkStr.toLowerCase();
    if (this.dict.has(mkStr)) {
      return this.dict.get(mkStr)[1];
    } else {
      return null;
    }
  }

  drawObject(intCh, ctx, hoffset, voffset, magFactor) {
    if (this.objDict.has(intCh)) {
      let obj = this.objDict.get(intCh);
      obj.draw(ctx, hoffset, voffset, magFactor);
    } else {
      return null;
    }
  }
}
