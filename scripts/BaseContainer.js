/*
 * class BaseContainer
 *
 *   addLayer(element, styleParameter, z-index)
 *   getBase()
 */
class BaseContainer {
  constructor() {
    this.wholeLayer = document.createElement("div");
    this.style = "position:relative;";
  }
  addLayer(elem, parm, level) {
    let div = document.createElement("div");
    div.style = "position:absolute;" + parm + "display:block;z-index:" + level + ";";
    div.appendChild(elem);
    this.wholeLayer.appendChild(div);
    return div;
  }
  getBase() {
    return this.wholeLayer;
  }
}
