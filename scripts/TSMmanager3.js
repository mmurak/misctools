class TSMmanager {
  constructor() {
    // Internal codes are taken from 'Subscripts (2080-2094)
    this.dict = new Map([["lr", [LowRise, "ˏ"]], ["hr", [HighRise, "´"]], ["lf", [LowFall, "ˎ"]], ["hf", [HighFall, "`"]],
                                    ["rf", [RiseFall, "^"]], ["fr", [FallRise, "ˇ"]], ["ml", [MidLevel, "›"]],
                                    ["h1", [HighStressed1, "ˈ"]], ["h2", [HighStressed2, "°"]], ["h3", [HighStressed3, "➘"]],
                                    ["l1", [LowStressed1, "ˌ"]], ["l2", [LowStressed2, "｡"]], ["l3", [LowStressed3, "➚"]],
                                    ["hp", [HighPrehead, "‾"]], ["lp", [LowPrehead, "_"]],
                                    ["aa", [SyllabicConsonant, "ₐ"]],
                                    ["fs", [FullStop, "‖"]], ["ip", [IP, "|"]]]);
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
