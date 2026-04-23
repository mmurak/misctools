class GlobalManager {
	constructor() {
		this.tocSel = document.getElementById("TOCSel");
		this.tocSel.addEventListener("change", (evt) => {tocChange(evt.target.value);});
		this.entryField = document.getElementById("EntryField");
		this.searchButton = document.getElementById("SearchButton");
		this.searchButton.addEventListener("click", (evt) => {search();});
		this.clearButton = document.getElementById("ClearButton");
		this.clearButton.addEventListener("click", (evt) => {clearField();});
	}
}	// end of GlobalManager class
const G = new GlobalManager();
const R = new RegulatorNeo();

G.tocSel.appendChild(document.createElement("option"));
for (let i = 0; i < indexData.length; i++) {
	const baseURL = indexData[i][0];
	for (let entry of indexData[i][1]) {
		const elem = document.createElement("option");
		elem.text = entry[0];
		elem.value = baseURL + entry[1];
		G.tocSel.appendChild(elem);
	}
}
G.entryField.focus();
document.addEventListener("keydown", (evt) => {
	if (evt.key == "Enter" && !evt.isComposing) {
		evt.preventDefault();
		search();
	} else if (evt.key == "Escape") {
		clearField();
	}
}, false);

function windowOpen(url, page) {
	window.open(url + page, "検索結果");
	G.entryField.focus();
}

function search() {
	G.tocSel.selectedIndex = 0;
	let target = G.entryField.value.toLowerCase();
	target = target.replace(/[ァ-ン]/g, function(s) {
		return String.fromCharCode(s.charCodeAt(0) - 0x60);
	});
	target = target.replaceAll(/ー/g, '');
	if (target == "") return;

	for (let i = indexData.length - 1; i >=0; i--) {
		const baseURL = indexData[i][0];
		for (let j = indexData[i][2].length - 1; j > 0; j--) {
			if (R.compare(target, indexData[i][2][j]) >= 0) {
				window.open(baseURL + (indexData[i][2][0] + j), "検索結果");
				G.entryField.focus();
				return;
			}
		}
	}
}

function tocChange(val) {
	window.open(val, "各種情報");
	G.tocSel.selectedIndex = 0;
	G.entryField.value = "";
	G.entryField.focus();
}

function clearField() {
	G.tocSel.selectedIndex = 0;
	G.entryField.value = "";
	G.entryField.focus();
}

function killingTime() {
	const vol = Math.trunc(Math.random() * entryData.length);
	const page = Math.trunc(Math.random() * (entryData[vol].length-1)) + 1 + entryData[vol][0][1];
	windowOpen(entryData[vol][0][0], page);
}
