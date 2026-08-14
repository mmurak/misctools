import { SwiftF0model } from './SwiftF0model.js';

// ---------------------------------------------------------------------
// Constants matching SwiftF0's Python reference implementation
// ---------------------------------------------------------------------
const TARGET_SR = 16000;
const HOP_LENGTH = 256;
const FRAME_LENGTH = 1024;
const CENTER_OFFSET = (FRAME_LENGTH - 1) / 2 - (FRAME_LENGTH - HOP_LENGTH) / 2; // 127.5
const MIN_AUDIO_LENGTH = 256;
const MODEL_FMIN = 46.875;
const MODEL_FMAX = 2093.75;

const RANGE_PRESETS = {
	full: { fmin: MODEL_FMIN, fmax: MODEL_FMAX },
	speech: { fmin: 65, fmax: 400 },
	music: { fmin: 80, fmax: 1000 },
};

// ---------------------------------------------------------------------
// DOM refs
// ---------------------------------------------------------------------
const $ = (id) => document.getElementById(id);

const statusBadge = $('statusBadge');
const statusText = $('statusText');
const statusMsg = $('statusMsg');

const micBtn = $('micBtn');
const micBtnLabel = $('micBtnLabel');
const fileBtn = $('fileBtn');
const fileInput = $('fileInput');
const stopBtn = $('stopBtn');

const confSlider = $('confSlider');
const confVal = $('confVal');
const confDefault = $('ConfDefault');
const defaultConfidence = '0.90';

const canvas = $('chart');

const progressWrap = $('progressWrap');
const progressBar = $('progressBar');

const ctx2d = canvas.getContext('2d');

// fmin, fmaxの設定（デフォルトはspeech、オプショナルの選択肢はrange=full, range=music）
let { fmin, fmax } = RANGE_PRESETS.speech;
const paramObj = Object.fromEntries(new URLSearchParams(window.location.search));
if ('range' in paramObj) {
	({fmin, fmax } = RANGE_PRESETS[paramObj['range']]);
}

/* ********************************************************************************
 * プログレスバー関連
 * ******************************************************************************** */
function setBadge(state, label) {
	statusBadge.className = 'badge ' + state;
	statusText.textContent = label;
}
function setMsg(msg) {
	statusMsg.textContent = msg;
}
function showProgress(pct) {
	progressWrap.classList.add('show');
	progressBar.style.width = Math.max(0, Math.min(100, pct)) + '%';
}
function hideProgress() {
	progressWrap.classList.remove('show');
	progressBar.style.width='0%';
}

/* ********************************************************************************
 * イベントリスナー - confidenceスライドバー関連
 * ******************************************************************************** */
let confidenceThreshold = parseFloat(confSlider.value);
confSlider.addEventListener('input', () => {
	confidenceThreshold = parseFloat(confSlider.value);
	confVal.textContent = confidenceThreshold.toFixed(2);
	redraw();
});
if ('confidence' in paramObj) {
	confVal.innerHTML = paramObj['confidence'];
	confidenceThreshold = parseFloat(paramObj['confidence']);
	confSlider.value = confidenceThreshold;
}
confDefault.addEventListener('click', () => {
	confVal.innerHTML = defaultConfidence;
	confidenceThreshold = parseFloat(defaultConfidence);
	confSlider.value = confidenceThreshold;
});

/* ********************************************************************************
 * ONNX Runtime Web (ort) の環境設定およびBase64を介して埋め込んだ
 * モデルを初期化（セッション作成）する。
 * ******************************************************************************** */
let session = null;
async function initModel() {
	try {
		ort.env.wasm.numThreads = 1; // avoid needing cross-origin isolation for SharedArrayBuffer
		ort.env.wasm.simd = true;
		const modelBytes = SwiftF0model();
		session = await ort.InferenceSession.create(modelBytes, { executionProviders: ['wasm'] });
		setBadge('ready', 'モデル準備完了');
		setMsg('マイクまたはファイルを選択して計測を開始してください。');
		micBtn.disabled = false; fileBtn.disabled = false;
	}catch(err) {
		console.error(err);
		setBadge('err', 'モデル読込エラー');
		setMsg('ONNXモデルの読み込みに失敗しました: ' + (err && err.message ? err.message : err));
	}
}
// ort推論セッションが生成されるまでボタンを無効化する。
micBtn.disabled = true;
fileBtn.disabled = true;

/* ********************************************************************************
 * 16kHzに調整されたモノラル音声データをONNXのテンソルに変換し、
 * 初期化したSwiftF0モデルに流し込んで推論を実行する。
 * 　モデルから「各フレームのピッチ（周波数: pitch_hz）」と
 * 「その確信度（confidence）」を取得する。結果はFloat32Array
 * ******************************************************************************** */
async function runModel(audio16k) {
	if (audio16k.length < MIN_AUDIO_LENGTH) {
		const padded = new Float32Array(MIN_AUDIO_LENGTH);
		padded.set(audio16k);
		audio16k = padded;
	}
	const tensor = new ort.Tensor('float32', audio16k, [1, audio16k.length]);
	const out = await session.run({ input_audio: tensor });
	return {
		pitch: out.pitch_hz.data,
		confidence: out.confidence.data
	};
}

/* ********************************************************************************
 * 推論した各フレームが、音声全体の「何秒目のデータにあたるのか」
 * というタイムスタンプ（時間軸上の位置）を計算する。
 * ******************************************************************************** */
function timestampsFor(nFrames, startOffsetSec) {
	const ts = new Float32Array(nFrames);
	for (let i = 0; i < nFrames; i++) {
		ts[i] = startOffsetSec + (i * HOP_LENGTH + CENTER_OFFSET) / TARGET_SR;
	}
	return ts;
}

// ---------------------------------------------------------------------
// Chart state & rendering (frequency = Y, log scale; time = X)
// ---------------------------------------------------------------------
// points: {t: seconds, hz: number, conf: number}
let points = [];						// 描画情報の配列
let mode = 'idle';					// 'idle' | 'mic' | 'file'
let windowSec = 12;			// micモード時の窓の保持期間（秒）
let fileDuration = 0;


  // Drop points older than (current position - windowSec - margin) to bound memory
  // during long sessions. "Current position" is playheadT while a file is
  // playing back, or the timestamp of the most recently inferred point in
  // mic mode. Only called when it's actually worth the O(n) cost (see call sites).
function pruneOldPoints(){
	if (points.length <= 4000) return;
	const cursor = (mode === 'file' && playheadT !== null)
							? playheadT
							: (points.length ? points[points.length - 1].t : 0);
	const cutoff = cursor - windowSec - 5;
	points = points.filter(p => p.t >= cutoff);
}


/* ********************************************************************************
 * ブラウザの画面サイズや、Retinaディスプレイ（高解像度画面）の
 * ピクセル比（DPR）に合わせ、Canvasの描画サイズとCSSサイズを
 * 適切に調整する。
 * ******************************************************************************** */
function resizeCanvas() {
	const wrap = canvas.parentElement;
	const cssW = wrap.clientWidth;
	const cssH = 360;
	const dpr = window.devicePixelRatio || 1;
	canvas.width = Math.round(cssW * dpr);
	canvas.height = Math.round(cssH * dpr);
	canvas.style.height = cssH + 'px';
	ctx2d.setTransform(dpr,0,0,dpr,0,0);
	redraw();
}
/* ********************************************************************************
 * イベントリスナー - ウィンドウのリサイズ時にキャンバス設定を再実行する。
 * ******************************************************************************** */
window.addEventListener('resize', resizeCanvas);

/* ********************************************************************************
 * 周波数をY座標のピクセルに変換する。
 * ******************************************************************************** */
const PAD = { l: 56, r: 18, t: 14, b: 30 };	// チャートの余白スペース
const CHART_FMIN = 46.875;					// チャート（Y軸）の下限周波数（SR / FFTsize）
const CHART_FMAX = 800; 					// チャート（Y軸）の上限周波数Y（800 Hz）
function freqToY(hz, h) {
	const lo = Math.log2(CHART_FMIN), hi = Math.log2(CHART_FMAX);
	const v = Math.log2(hz);
	const frac = (v - lo) / (hi - lo);
	return PAD.t + (1 - frac) * (h - PAD.t - PAD.b);
}
/* ********************************************************************************
 * 周波数がチャートの範囲に収まっているかどうかを返す。
 * ******************************************************************************** */
function freqInChartRange(hz) {
	return hz >= CHART_FMIN && hz <= CHART_FMAX;
}

/* ********************************************************************************
 * グラフの背景やグリッドを描画する
 * ******************************************************************************** */
function drawGrid(w, h, tMin, tMax) {
	ctx2d.clearRect(0,0,w,h);
	// background
	ctx2d.fillStyle = '#0d1420';
	ctx2d.fillRect(0,0,w,h);

	// horizontal freq gridlines at musically meaningful marks
	const marks = [50,75,100,150,200,300,400,600,800];
	ctx2d.font = '11px "JetBrains Mono", monospace';
	ctx2d.fillStyle = '#5c6c80';			// rgb(92,108,128)	graysh for text
	ctx2d.strokeStyle = '#182230';		// rgb(24,34,48)	blackish for horizontal lines
	ctx2d.lineWidth = 1;
	marks.forEach(hz => {
		if (hz < CHART_FMIN || hz > CHART_FMAX)  return;
		const y = freqToY(hz, h);
		ctx2d.beginPath();
		ctx2d.moveTo(PAD.l, y);
		ctx2d.lineTo(w - PAD.r, y);
		ctx2d.stroke();
		ctx2d.fillText(hz + ' Hz', 8, y + 4);
	});

	// fmin/fmax band (currently selected voiced range) — subtle highlight, clamped to the visible axis
	const bandFmax = Math.min(fmax, CHART_FMAX);
	const bandFmin = Math.max(fmin, CHART_FMIN);
	if (bandFmax > bandFmin) {
		const yTop = freqToY(bandFmax, h);
		const yBot = freqToY(bandFmin, h);
		ctx2d.fillStyle = '#202428';
		ctx2d.fillRect(PAD.l, yTop, w - PAD.l - PAD.r, yBot - yTop);
	}

	// vertical time gridlines
	if (tMax > tMin) {
		const span = tMax - tMin;
		let step = 1;
		if (span > 60)  step = 10;
		else if (span > 20)  step = 5;
		else if (span > 8)  step = 2;
		else if (span < 2)  step = 0.25;
		const start = Math.ceil(tMin / step) * step;
		for (let t = start; t <= tMax; t += step) {
			const x = PAD.l + ((t - tMin) / span) * (w - PAD.l - PAD.r);
			ctx2d.strokeStyle = '#141c26';		// 20, 28. 38  grayish blue for vertical timelines
			ctx2d.beginPath();
			ctx2d.moveTo(x, PAD.t);
			ctx2d.lineTo(x, h - PAD.b);
			ctx2d.stroke();
			ctx2d.fillStyle = '#5c6c80';		// 92,108,128 grayish for seconds
			ctx2d.fillText(t.toFixed(step < 1 ? 2 : 0) + 's', x - 10, h - 10);
		}
	}
	// axis border
	ctx2d.strokeStyle = '#233040';		// 35.48.64	 grayish for border
	ctx2d.strokeRect(PAD.l, PAD.t, w - PAD.l - PAD.r, h - PAD.t - PAD.b);
}

let playheadT = null; // current playback position in file mode (seconds), null when not playing

/* ********************************************************************************
 * ピッチデータを描画する
 * ******************************************************************************** */
function redraw() {
	const w = canvas.clientWidth;
	const h = 360;
	if (w === 0)  return;

	let tMin = 0
	let tMax = 1;
	const cursor = (mode === 'file' && playheadT !== null)
							? playheadT
							: (points.length ? points[points.length-1].t : 0);
	tMax = Math.max(windowSec, cursor);
	tMin = tMax - windowSec;

	drawGrid(w, h, tMin, tMax);
	if (!points.length)  return;

	const span = (tMax - tMin) || 1;
	const xOf = (t) => PAD.l + ((t - tMin) / span) * (w - PAD.l - PAD.r);
	const DOT_R = 2.5;

	// F0 (voiced) points only, plotted as filled dots — no connecting lines
	ctx2d.fillStyle = 'rgba(255, 204, 51, 0.95)';		// Mustard yellow
	for (const p of points) {
		if (p.t < tMin || p.t > tMax)  continue;
		if (mode === 'file' && playheadT !== null && p.t > playheadT)  continue; // don't reveal future points
		const voiced = p.conf > confidenceThreshold && p.hz >= fmin && p.hz <= fmax;
		if (!voiced)  continue;
		if (!freqInChartRange(p.hz))  continue;
		const x = xOf(p.t);
		const y = freqToY(p.hz, h);
		ctx2d.beginPath();
		ctx2d.arc(x, y, DOT_R, 0, Math.PI * 2);
		ctx2d.fill();
	}

	// live cursor: mic (last inferred point) or file (actual playback position)
	const cursorT = (mode === 'file' && playheadT !== null)
							? playheadT
							: (points.length ? points[points.length-1].t : null);
	if (cursorT !== null) {
		const x = xOf(cursorT);
		ctx2d.strokeStyle = 'rgba(242,193,78,0.6)';			// Yellowish
		ctx2d.lineWidth = 1;
		ctx2d.beginPath();
		ctx2d.moveTo(x, PAD.t);
		ctx2d.lineTo(x, h-PAD.b);
		ctx2d.stroke();
	}
}

// ---------------------------------------------------------------------
// Mic mode
// ---------------------------------------------------------------------
let micState = null; // {audioCtx, source, workletNode, stream, nativeRate, pending[], elapsed}
const MIC_CHUNK_SEC = 0.3;
const WORKLET_INTERNAL_CHUNK = 4096; // samples the worklet buffers before posting to the main thread

// AudioWorkletProcessor source, loaded via a Blob URL so the whole app
// stays a single self-contained HTML file (no separate .js to host).
const WORKLET_SOURCE = `
	class PCMCaptureProcessor extends AudioWorkletProcessor {
		constructor(options) {
			super();
			this.chunkSize = (options && options.processorOptions && options.processorOptions.chunkSize) || ${WORKLET_INTERNAL_CHUNK};
			this.buffer = new Float32Array(this.chunkSize);
			this.writeIndex = 0;
		}
		process(inputs) {
			const input = inputs[0];
			if (input && input.length && input[0] && input[0].length) {
				const channel = input[0];
				let i = 0;
				while (i < channel.length) {
					const remaining = this.chunkSize - this.writeIndex;
					const toCopy = Math.min(remaining, channel.length - i);
					this.buffer.set(channel.subarray(i, i + toCopy), this.writeIndex);
					this.writeIndex += toCopy;
					i += toCopy;
					if (this.writeIndex >= this.chunkSize) {
						this.port.postMessage(this.buffer.slice(0, this.writeIndex));
						this.writeIndex = 0;
					}
				}
			}
			return true; // keep the processor alive for the life of the node
		}
	}
	registerProcessor('pcm-capture-processor', PCMCaptureProcessor);
`;
let workletModuleUrl = null;
function getWorkletModuleUrl() {
	if (!workletModuleUrl) {
		const blob = new Blob([WORKLET_SOURCE], { type: 'application/javascript' });
		workletModuleUrl = URL.createObjectURL(blob);
	}
	return workletModuleUrl;
}

function linearResample(f32, fromRate, toRate) {
	if (fromRate === toRate)  return f32;
	const ratio = fromRate / toRate;
	const outLen = Math.max(1, Math.round(f32.length / ratio));
	const out = new Float32Array(outLen);
	for (let i = 0; i < outLen; i++) {
		const srcPos = i * ratio;
		const i0 = Math.floor(srcPos);
		const i1 = Math.min(f32.length - 1, i0 + 1);
		const frac = srcPos - i0;
		out[i] = f32[i0] * (1 - frac) + f32[i1] * frac;
	}
	return out;
}

async function startMic(){
	try{
		if (!(window.AudioWorkletNode)) {
			throw new Error('このブラウザは AudioWorkletNode に対応していません。');
		}
		const stream = await navigator.mediaDevices.getUserMedia({
			audio: { channelCount: 1, echoCancellation: false, noiseSuppression: false, autoGainControl: false }
		});
		let audioCtx;
		try {
			audioCtx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: TARGET_SR });
		} catch(e) {
			audioCtx = new (window.AudioContext || window.webkitAudioContext)();
		}
		const nativeRate = audioCtx.sampleRate;

		await audioCtx.audioWorklet.addModule(getWorkletModuleUrl());

		const source = audioCtx.createMediaStreamSource(stream);
		const workletNode = new AudioWorkletNode(audioCtx, 'pcm-capture-processor', {
			numberOfInputs: 1,
			numberOfOutputs: 1,
			outputChannelCount: [1],
			processorOptions: { chunkSize: WORKLET_INTERNAL_CHUNK }
		});
		const silentGain = audioCtx.createGain();
		silentGain.gain.value = 0;

		micState = {
			audioCtx,
			source,
			workletNode,
			stream,
			nativeRate,
			pending: [],
			pendingLen: 0,
			elapsed: 0,
			chunkTarget: Math.round(MIC_CHUNK_SEC * nativeRate),
			busy: false
		};

		workletNode.port.onmessage = (ev) => {
			if (!micState)  return;
			const chunk = ev.data; // Float32Array, length WORKLET_INTERNAL_CHUNK
			micState.pending.push(chunk);
			micState.pendingLen += chunk.length;
			if (micState.pendingLen >= micState.chunkTarget && !micState.busy) {
				const merged = new Float32Array(micState.pendingLen);
				let off = 0;
				for (const c of micState.pending) {
					merged.set(c, off);
					off += c.length;
				}
				micState.pending = [];
				micState.pendingLen = 0;
				const startOffset = micState.elapsed;
				const durSec = merged.length / nativeRate;
				micState.elapsed += durSec;
				processMicChunk(merged, nativeRate, startOffset);
			}
		};

		source.connect(workletNode);
		workletNode.connect(silentGain);
		silentGain.connect(audioCtx.destination);

		mode = 'mic';
		points = [];
		setBadge('busy', '計測中 (マイク)');
		setMsg('マイク入力からリアルタイムでピッチを推定しています。');
		micBtn.disabled = true;
		fileBtn.disabled = true;
		stopBtn.disabled = false;
		micBtnLabel.textContent = 'マイクで計測';
	} catch(err) {
		console.error(err);
		setBadge('err', 'マイクエラー');
		setMsg('マイクにアクセスできませんでした: ' + (err && err.message ? err.message : err));
	}
}

async function processMicChunk(chunkNative, nativeRate, startOffset) {
	if (!micState) return;
	micState.busy = true;
	try {
		const audio16k = linearResample(chunkNative, nativeRate, TARGET_SR);
		const { pitch, confidence } = await runModel(audio16k);
		const ts = timestampsFor(pitch.length, startOffset);
		for (let i = 0; i < pitch.length; i++) {
			points.push({ t: ts[i], hz: pitch[i], conf: confidence[i] });
		}
		// trim old points beyond a generous history to bound memory
		pruneOldPoints();
		redraw();
	} catch(err) {
		console.error('inference error', err);
	} finally {
		if (micState) micState.busy = false;
	}
}

function stopMic() {
	if (!micState)  return;
	try {
		micState.workletNode.port.onmessage = null;
		micState.workletNode.disconnect();
		micState.source.disconnect();
		micState.stream.getTracks().forEach(t => t.stop());
		micState.audioCtx.close();
	} catch(e) {}
	micState = null;
}

// ---------------------------------------------------------------------
// File mode
// ---------------------------------------------------------------------
// Decode the uploaded file into two forms:
//  - originalBuffer: full-quality AudioBuffer at its native sample rate, used for playback
//  - audio16k: mono Float32Array resampled to 16kHz, used for SwiftF0 inference
async function decodeFileForProcessing(file) {
	const arrayBuf = await file.arrayBuffer();
	const tmpCtx = new (window.AudioContext || window.webkitAudioContext)();
	const originalBuffer = await tmpCtx.decodeAudioData(arrayBuf.slice(0));
	await tmpCtx.close();

	// downmix to mono for inference only (playback uses the original multi-channel buffer)
	const nCh = originalBuffer.numberOfChannels;
	const len = originalBuffer.length;
	const mono = new Float32Array(len);
	for (let ch = 0; ch < nCh; ch++) {
		const data = originalBuffer.getChannelData(ch);
		for (let i = 0; i < len; i++) {
			mono[i] += data[i] / nCh;
		}
	}

	const srcRate = originalBuffer.sampleRate;
	const outLen = Math.max(1, Math.ceil(len * TARGET_SR / srcRate));
	const offlineCtx = new OfflineAudioContext(1, outLen, TARGET_SR);
	const bufSource = offlineCtx.createBufferSource();
	const monoBuffer = offlineCtx.createBuffer(1, len, srcRate);
	monoBuffer.copyToChannel(mono, 0);
	bufSource.buffer = monoBuffer;
	bufSource.connect(offlineCtx.destination);
	bufSource.start(0);
	const rendered = await offlineCtx.startRendering();
	return {
		originalBuffer,
		audio16k: rendered.getChannelData(0),
		duration: rendered.length / TARGET_SR
	};
}

let filePlayback = null; // { ctx, source, raf } — active only while a file is playing

function stopFilePlayback() {
	if (!filePlayback)  return;
	if (filePlayback.raf)  cancelAnimationFrame(filePlayback.raf);
	try {
		filePlayback.source.onended = null;
		filePlayback.source.stop();
	} catch(e) {}
	try {
		filePlayback.ctx.close();
	} catch(e) {}
	filePlayback = null;
	playheadT = null;
}

// Play the decoded file through the output device (speakers) while the
// already-computed F0 points are revealed in sync with playback position.
function startFilePlayback(originalBuffer, duration) {
	const ctx = new (window.AudioContext || window.webkitAudioContext)();
	const source = ctx.createBufferSource();
	source.buffer = originalBuffer;
	source.connect(ctx.destination);

	mode = 'file';
	filePlayback = { ctx, source, raf: null };
	const t0 = ctx.currentTime;
	source.start(0);

	setBadge('busy', '再生中');
	setMsg('ファイルを再生しながらF0を描画しています。');
	stopBtn.disabled = false;

	let lastPruneSecond = -1;
	function tick() {
		if (!filePlayback)  return;
		playheadT = ctx.currentTime - t0;
		const sec = Math.floor(playheadT);
		if (sec !== lastPruneSecond) {
			lastPruneSecond = sec;
			pruneOldPoints();
		}
		redraw();
		if (playheadT < duration) {
			filePlayback.raf = requestAnimationFrame(tick);
		}
	}
	source.onended = () => {
		filePlayback = null;
		playheadT = null;
		mode = 'idle';
		try {
			ctx.close();
		} catch(e) {}
		setBadge('ready', '再生完了');
		setMsg('再生が終了しました。グラフ上をホバーすると詳細を表示します。');
		stopBtn.disabled = true;
		micBtn.disabled = false;
		fileBtn.disabled = false;
	};
	tick();
}

async function processFile(file) {
	try {
		mode = 'file';
		points = [];
		playheadT = null;
		setBadge('busy', '解析中');
		setMsg(`"${file.name}" を読み込み中…`);
		micBtn.disabled = true;
		fileBtn.disabled = true;
		stopBtn.disabled = false;
		showProgress(5);

		const { originalBuffer, audio16k, duration } = await decodeFileForProcessing(file);
		fileDuration = duration;
		showProgress(15);

		// Compute the full F0 curve ahead of playback, in chunks so the UI
		// (and progress bar) stays responsive for long files.
		const CHUNK_SEC = 20;
		const chunkSamples = CHUNK_SEC * TARGET_SR;
		const total = audio16k.length;
		let processed = 0;

		for (let start = 0; start < total; start += chunkSamples) {
			const end = Math.min(total, start + chunkSamples);
			const chunk = audio16k.subarray(start, end);
			const startOffset = start / TARGET_SR;
			const { pitch, confidence } = await runModel(chunk);
			const ts = timestampsFor(pitch.length, startOffset);
			for (let i = 0; i < pitch.length; i++) {
				points.push({ t: ts[i], hz: pitch[i], conf: confidence[i] });
			}
			processed = end;
			showProgress(15 + (processed/total) * 80);
			setMsg(`解析中… ${(processed/TARGET_SR).toFixed(1)}s / ${duration.toFixed(1)}s`);
			await new Promise(r => setTimeout(r, 0)); // yield to UI
		}

		hideProgress();
		setMsg(`"${file.name}" (${duration.toFixed(1)}s) の解析が完了。再生を開始します…`);
		fileBtn.disabled = true;
		micBtn.disabled = true;

		// Connect to the output device and reveal points in real time as it plays.
		startFilePlayback(originalBuffer, duration);
	} catch(err) {
		console.error(err);
		hideProgress();
		setBadge('err', '解析エラー');
		setMsg('ファイルの解析に失敗しました: ' + (err && err.message ? err.message : err));
		stopBtn.disabled = true;
		micBtn.disabled = false;
		fileBtn.disabled = false;
		mode = 'idle';
	}
}

// ---------------------------------------------------------------------
// Wire up controls
// ---------------------------------------------------------------------
micBtn.addEventListener('click', () => {
	if (mode !== 'mic')  startMic();
});
fileBtn.addEventListener('click', () => {
	fileInput.click()
});
fileInput.addEventListener('change', () => {
	const f = fileInput.files[0];
	if (f)  processFile(f);
	fileInput.value = '';
});
stopBtn.addEventListener('click', () => {
	if (mode === 'mic')  stopMic();
	if (mode === 'file')  stopFilePlayback();
	mode = 'idle';
	setBadge('ready', '待機中');
	setMsg('停止しました。マイクまたはファイルを選択して再開できます。');
	micBtn.disabled = false;
	fileBtn.disabled = false;
	stopBtn.disabled = true;
});

resizeCanvas();
await initModel();
