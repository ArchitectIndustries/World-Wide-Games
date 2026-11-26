import { W, H, RINK, STEP, DIFFICULTIES, makeMatch, advance, drainEvents } from './engine.js';

const $ = (id) => document.getElementById(id);
const canvas = $('rink'), ctx = canvas.getContext('2d'), stage = $('stage'), wrap = $('rink-wrap');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const STORAGE_KEY = 'wwg.aurora-hockey.v1';
const playerSettings = new URLSearchParams(location.search);
const parentMuted = playerSettings.get('muted') === '1';
const suppliedVolume = playerSettings.has('volume') ? Number(playerSettings.get('volume')) : 1;
const parentVolume = Number.isFinite(suppliedVolume) ? Math.max(0, Math.min(1, suppliedVolume)) : 1;
let storageOK = true, record = { wins: 0, bestRally: 0, sound: false };
try {
  const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
  if (stored && typeof stored === 'object') {
    record.wins = Number.isSafeInteger(stored.wins) && stored.wins >= 0 ? Math.min(stored.wins, 1000000) : 0;
    record.bestRally = Number.isSafeInteger(stored.bestRally) && stored.bestRally >= 0 ? Math.min(stored.bestRally, 1000000) : 0;
    record.sound = stored.sound === true;
  }
} catch { storageOK = false; }

let match = makeMatch(), view = 'setup', paused = false, completionSent = false;
let accumulator = 0, lastFrame = null, trail = [], sparks = [], toastRemaining = 0;
let audio = null, audioUnavailable = false;
const keys = new Set(), pointerTargets = [null, null], touches = new Map();

function announce(message) { $('announcement').textContent = message; }
function updateRecord() {
  $('wins').textContent = String(record.wins);
  $('storage-note').textContent = storageOK ? (record.bestRally ? `Best rally: ${record.bestRally} clean strikes.` : 'Make your first mark.') : 'Storage unavailable. Records last this session.';
}
function saveRecord() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(record)); } catch { storageOK = false; }
  updateRecord();
}
function updateSound() {
  const locked = parentMuted || parentVolume === 0;
  $('sound').textContent = audioUnavailable ? 'No audio' : record.sound && !locked ? 'Sound on' : 'Sound off';
  $('sound').setAttribute('aria-pressed', String(record.sound && !audioUnavailable && !locked));
  $('sound').disabled = locked;
  $('sound').title = locked ? 'Sound is muted by the WorldWideGames player settings.' : 'Toggle original game audio';
}
function openAudio() {
  if (!record.sound || audioUnavailable || parentMuted || parentVolume === 0) return;
  try {
    const Audio = window.AudioContext || window.webkitAudioContext;
    if (!Audio) throw new Error('Audio unavailable');
    audio ||= new Audio();
    if (audio.state === 'suspended') audio.resume().catch(() => {});
  } catch { audioUnavailable = true; record.sound = false; updateSound(); }
}
function tone(frequency, length = 0.08, volume = 0.045, delay = 0, endFrequency = null) {
  if (!record.sound || parentMuted || parentVolume === 0 || !audio || audio.state !== 'running') return;
  try {
    const t = audio.currentTime + delay, oscillator = audio.createOscillator(), gain = audio.createGain();
    oscillator.type = 'sine'; oscillator.frequency.setValueAtTime(frequency, t);
    if (endFrequency) oscillator.frequency.exponentialRampToValueAtTime(endFrequency, t + length);
    gain.gain.setValueAtTime(0, t); gain.gain.linearRampToValueAtTime(volume * parentVolume, t + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001 * parentVolume, t + length);
    oscillator.connect(gain); gain.connect(audio.destination); oscillator.start(t); oscillator.stop(t + length + 0.01);
    oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
  } catch { /* Audio is optional; gameplay remains available. */ }
}
$('sound').addEventListener('click', () => { record.sound = !record.sound; openAudio(); updateSound(); saveRecord(); if (record.sound) tone(640); });

function clearInput() {
  keys.clear(); pointerTargets[0] = null; pointerTargets[1] = null;
  for (const id of touches.keys()) { try { canvas.releasePointerCapture(id); } catch { /* Already released. */ } }
  touches.clear();
}
function mode() { return document.querySelector('input[name="mode"]:checked').value; }
function updateSetup() {
  const local = mode() === 'local';
  $('difficulty').disabled = local;
  $('mode-hint').textContent = local ? 'Cyan: arrows. Coral: WASD. Or use one touch in each half.' : 'Pointer / touch / arrows / WASD.';
  if (view === 'setup') { $('player-name').textContent = local ? 'CYAN' : 'YOU'; $('rival-name').textContent = local ? 'CORAL' : DIFFICULTIES[$('difficulty').value].name.toUpperCase(); }
}
document.querySelectorAll('input[name="mode"]').forEach((input) => input.addEventListener('change', updateSetup));
$('difficulty').addEventListener('change', updateSetup);

function setupScreen() {
  clearInput(); view = 'setup'; paused = false; accumulator = 0; lastFrame = null;
  $('overlay').hidden = false; $('setup').hidden = false; $('result-stats').hidden = true; $('new-match').hidden = true;
  $('menu-eyebrow').textContent = 'AN ARCADE ORIGINAL';
  $('menu-title').innerHTML = 'Own the <em>angles.</em>';
  $('menu-description').textContent = 'Bank shots. Quick saves. First to seven wins.';
  $('start').textContent = 'Start match'; $('pause').disabled = true; $('restart').disabled = true;
  $('pause').innerHTML = 'Pause <kbd>P</kbd>';
  match = makeMatch(mode(), $('difficulty').value); trail = []; sparks = []; hideToast();
  updateSetup(); updateHUD();
}
function startMatch() {
  clearInput(); match = makeMatch(mode(), $('difficulty').value); view = 'play'; paused = false;
  completionSent = false; accumulator = 0; lastFrame = null; trail = []; sparks = []; hideToast();
  $('overlay').hidden = true; $('pause').disabled = false; $('restart').disabled = false;
  $('pause').innerHTML = 'Pause <kbd>P</kbd>';
  $('player-name').textContent = match.mode === 'local' ? 'CYAN' : 'YOU';
  $('rival-name').textContent = match.mode === 'local' ? 'CORAL' : DIFFICULTIES[match.difficulty].name.toUpperCase();
  openAudio(); canvas.focus({ preventScroll: true }); updateHUD();
  announce('Match started. Cyan defends the lower goal. First to seven wins.');
}
function pauseMatch(reason = 'Take a breath. Your match will be here.') {
  if (view !== 'play' || match.phase === 'over') return;
  clearInput(); paused = true; view = 'paused'; accumulator = 0; lastFrame = null;
  $('overlay').hidden = false; $('setup').hidden = true; $('result-stats').hidden = true; $('new-match').hidden = false;
  $('menu-eyebrow').textContent = 'MATCH PAUSED'; $('menu-title').innerHTML = 'Hold that<br><em>thought.</em>';
  $('menu-description').textContent = reason; $('start').textContent = 'Resume match'; $('new-match').textContent = 'Change match';
  $('pause').innerHTML = 'Resume <kbd>P</kbd>';
  $('start').focus({ preventScroll: true }); updateHUD(); announce('Match paused. Press P or Resume match to continue.');
}
function resumeMatch() {
  if (view !== 'paused') return;
  clearInput(); paused = false; view = 'play'; accumulator = 0; lastFrame = null;
  $('overlay').hidden = true; $('pause').innerHTML = 'Pause <kbd>P</kbd>';
  openAudio(); canvas.focus({ preventScroll: true }); updateHUD(); announce('Match resumed.');
}
function showResults(winner) {
  clearInput(); view = 'result'; paused = false; accumulator = 0; hideToast();
  const won = winner === 0, local = match.mode === 'local';
  if (won && !local) record.wins++;
  record.bestRally = Math.max(record.bestRally, match.longestRally); saveRecord();
  $('overlay').hidden = false; $('setup').hidden = true; $('result-stats').hidden = false; $('new-match').hidden = false;
  $('menu-eyebrow').textContent = 'MATCH COMPLETE';
  $('menu-title').innerHTML = local ? `${won ? 'Cyan' : 'Coral'} owns<br><em>the rink.</em>` : won ? 'The rink<br><em>is yours.</em>' : 'A rival<br><em>well played.</em>';
  $('menu-description').textContent = local ? `${won ? 'Cyan' : 'Coral'} wins ${match.points[winner]}–${match.points[1 - winner]}. Switch sides for the rematch?` : won ? `You beat ${DIFFICULTIES[match.difficulty].name} ${match.points[0]}–${match.points[1]}. Keep finding those angles.` : `${DIFFICULTIES[match.difficulty].name} wins ${match.points[1]}–${match.points[0]}. Guard the center, then attack the corners.`;
  $('result-stats').replaceChildren();
  for (const [label, value] of [['BEST RALLY', match.longestRally], ['MATCH TIME', `${Math.floor(match.activeTime / 60)}:${String(Math.floor(match.activeTime % 60)).padStart(2, '0')}`]]) {
    const block = document.createElement('div'), strong = document.createElement('strong'); block.textContent = label; strong.textContent = String(value); block.append(strong); $('result-stats').append(block);
  }
  $('start').textContent = 'Play again'; $('new-match').textContent = 'Change match'; $('pause').disabled = true;
  $('start').focus({ preventScroll: true }); updateHUD();
  announce(`${local ? (won ? 'Cyan' : 'Coral') : won ? 'You' : 'Your rival'} won the match. Final score: cyan ${match.points[0]}, coral ${match.points[1]}.`);
  if (!completionSent) {
    completionSent = true;
    const message = local
      ? { type: 'wwg:game-event', game: 'aurora-hockey', event: 'local-match-complete' }
      : { type: 'wwg:game-event', game: 'aurora-hockey', event: 'match-complete', score: match.points[0] * 100 + (won ? 500 : 0) };
    try {
      window.parent.postMessage(message, location.origin);
      // Completion reports the result; only a solo victory can award a clear.
      if (!local && won) window.parent.postMessage({ type: 'wwg:game-event', game: 'aurora-hockey', event: 'match-won' }, location.origin);
    } catch { /* Standalone file previews have no serializable target origin. */ }
  }
}
$('start').addEventListener('click', () => view === 'paused' ? resumeMatch() : startMatch());
$('new-match').addEventListener('click', () => { setupScreen(); $('start').focus({ preventScroll: true }); });
$('pause').addEventListener('click', () => view === 'paused' ? resumeMatch() : pauseMatch());
$('restart').addEventListener('click', startMatch);

function updateHUD() {
  $('player-score').textContent = String(match.points[0]); $('rival-score').textContent = String(match.points[1]);
  $('match-status').textContent = view === 'setup' ? 'READY TO PLAY' : view === 'paused' ? 'PAUSED' : view === 'result' ? 'FINAL SCORE' : match.phase === 'serve' ? 'NEXT SERVE' : 'MATCH IN PLAY';
  $('rally-label').textContent = view === 'setup' ? 'BANK. DEFEND. REPEAT.' : match.rally > 0 ? `RALLY ${match.rally} · BEST ${Math.max(match.rally, match.longestRally)}` : 'FIND YOUR ANGLE';
}

function pointFromEvent(event) {
  const rect = canvas.getBoundingClientRect();
  return { x: (event.clientX - rect.left) / rect.width * W, y: (event.clientY - rect.top) / rect.height * H };
}
canvas.addEventListener('pointerdown', (event) => {
  if (view !== 'play') return;
  event.preventDefault(); canvas.focus({ preventScroll: true });
  const point = pointFromEvent(event), player = match.mode === 'local' && event.pointerType !== 'mouse' && point.y < RINK.middle ? 1 : 0;
  if ([...touches.values()].includes(player)) return;
  touches.set(event.pointerId, player); pointerTargets[player] = point;
  try { canvas.setPointerCapture(event.pointerId); } catch { /* Capture may be unavailable. */ }
});
canvas.addEventListener('pointermove', (event) => {
  if (view !== 'play') return;
  const player = touches.has(event.pointerId) ? touches.get(event.pointerId) : event.pointerType === 'mouse' ? 0 : null;
  if (player === null) return;
  pointerTargets[player] = pointFromEvent(event);
});
function releasePointer(event) {
  const player = touches.get(event.pointerId);
  if (player !== undefined) pointerTargets[player] = null;
  touches.delete(event.pointerId);
}
canvas.addEventListener('pointerup', releasePointer);
canvas.addEventListener('pointercancel', releasePointer);
canvas.addEventListener('lostpointercapture', releasePointer);
canvas.addEventListener('pointerleave', (event) => { if (!touches.has(event.pointerId) && event.pointerType === 'mouse') pointerTargets[0] = null; });
const directional = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyA', 'KeyS', 'KeyD']);
function editing(event) { return event.target instanceof HTMLElement && !!event.target.closest('input,select,textarea,[contenteditable="true"]'); }
window.addEventListener('keydown', (event) => {
  if (event.ctrlKey || event.metaKey || event.altKey || editing(event)) return;
  if (event.code === 'KeyP' && !event.repeat && (view === 'play' || view === 'paused')) { event.preventDefault(); view === 'paused' ? resumeMatch() : pauseMatch(); return; }
  if (event.code === 'KeyR' && !event.repeat && ['play', 'paused', 'result'].includes(view)) { event.preventDefault(); startMatch(); return; }
  if (view !== 'play' || !directional.has(event.code)) return;
  event.preventDefault(); keys.add(event.code);
  pointerTargets[match.mode === 'local' && event.code.startsWith('Key') ? 1 : 0] = null;
});
window.addEventListener('keyup', (event) => { keys.delete(event.code); });
window.addEventListener('blur', () => { clearInput(); pauseMatch('The window lost focus. Resume when you are ready.'); });
document.addEventListener('visibilitychange', () => { if (document.hidden) { clearInput(); pauseMatch('You stepped away. Your match is safely paused.'); } lastFrame = null; });
function getInputs() {
  const arrows = { dx: Number(keys.has('ArrowRight')) - Number(keys.has('ArrowLeft')), dy: Number(keys.has('ArrowDown')) - Number(keys.has('ArrowUp')) };
  const wasd = { dx: Number(keys.has('KeyD')) - Number(keys.has('KeyA')), dy: Number(keys.has('KeyS')) - Number(keys.has('KeyW')) };
  if (match.mode === 'cpu') { arrows.dx += wasd.dx; arrows.dy += wasd.dy; }
  return [arrows.dx || arrows.dy ? arrows : pointerTargets[0], wasd.dx || wasd.dy ? wasd : pointerTargets[1]];
}

function showToast(text, seconds = 0.85) { $('toast').textContent = text; $('toast').classList.add('visible'); toastRemaining = seconds; }
function hideToast() { $('toast').classList.remove('visible'); toastRemaining = 0; }
function burst(x, y, player) {
  if (reducedMotion.matches) return;
  for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; sparks.push({ x, y, vx: Math.cos(a) * (75 + i * 4), vy: Math.sin(a) * (75 + i * 4), life: 0.35, player }); }
  if (sparks.length > 80) sparks.splice(0, sparks.length - 80);
}
function handleEvents() {
  for (const event of drainEvents(match)) {
    if (event.type === 'strike') { burst(event.x, event.y, event.player); tone(event.player === 0 ? 660 : 460, 0.06, 0.025, 0, 200); }
    else if (event.type === 'wall') tone(180, 0.035, 0.012);
    else if (event.type === 'serve') { tone(440, 0.07, 0.025); hideToast(); }
    else if (event.type === 'goal') {
      trail = []; pointerTargets[0] = null; pointerTargets[1] = null;
      showToast(event.scorer === 0 ? 'CYAN SCORES' : 'CORAL SCORES', 1.1);
      const base = event.scorer === 0 ? 392 : 293.66;
      [1, 1.25, 1.5].forEach((factor, index) => tone(base * factor, 0.22, 0.035, index * 0.08));
      announce(`${event.scorer === 0 ? 'Cyan' : 'Coral'} scores. ${match.points[0]} to ${match.points[1]}.`);
    } else if (event.type === 'complete') showResults(event.winner);
  }
  updateHUD();
}

function resize() {
  const bounds = stage.getBoundingClientRect(), height = Math.max(1, Math.min(bounds.height, bounds.width * H / W));
  const width = height * W / H, dpr = Math.min(window.devicePixelRatio || 1, 2);
  wrap.style.width = `${width}px`; wrap.style.height = `${height}px`;
  canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
  draw();
}
new ResizeObserver(resize).observe(stage);
window.addEventListener('resize', resize);

function pathRoundRect(x, y, w, h, r) {
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
function line(x1, y1, x2, y2, color, width = 1) { ctx.beginPath(); ctx.strokeStyle = color; ctx.lineWidth = width; ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); }
function circle(x, y, radius, color, width = 1) { ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.strokeStyle = color; ctx.lineWidth = width; ctx.stroke(); }
function drawPaddle(pad, player) {
  const color = player === 0 ? '#6df4e4' : '#ff8b87';
  ctx.save();
  ctx.shadowColor = color; ctx.shadowBlur = 24;
  ctx.beginPath(); ctx.arc(pad.x, pad.y, pad.r + 4, 0, Math.PI * 2); ctx.fillStyle = '#071320'; ctx.fill();
  ctx.shadowBlur = 0;
  const gradient = ctx.createRadialGradient(pad.x - 10, pad.y - 12, 2, pad.x, pad.y, pad.r);
  gradient.addColorStop(0, player === 0 ? '#d2fff6' : '#ffe2dc'); gradient.addColorStop(0.2, color); gradient.addColorStop(1, player === 0 ? '#147d80' : '#ad4e61');
  ctx.beginPath(); ctx.arc(pad.x, pad.y, pad.r, 0, Math.PI * 2); ctx.fillStyle = gradient; ctx.fill();
  circle(pad.x, pad.y, pad.r - 2, color, 2); circle(pad.x, pad.y, pad.r - 8, '#082a3a99', 2);
  const knob = ctx.createLinearGradient(pad.x, pad.y - 14, pad.x, pad.y + 14);
  knob.addColorStop(0, player === 0 ? '#a2fff0' : '#ffcebe'); knob.addColorStop(1, player === 0 ? '#15979d' : '#c95e72');
  ctx.beginPath(); ctx.arc(pad.x, pad.y - 3, 13, 0, Math.PI * 2); ctx.fillStyle = knob; ctx.shadowColor = '#0007'; ctx.shadowBlur = 7; ctx.shadowOffsetY = 5; ctx.fill();
  ctx.restore();
}
function draw() {
  if (!ctx) return;
  ctx.setTransform(canvas.width / W, 0, 0, canvas.height / H, 0, 0); ctx.clearRect(0, 0, W, H);
  const bed = ctx.createLinearGradient(0, 0, W, H); bed.addColorStop(0, '#162c3d'); bed.addColorStop(0.45, '#0a2231'); bed.addColorStop(1, '#123242');
  ctx.fillStyle = bed; pathRoundRect(0, 0, W, H, 26); ctx.fill();
  const glow = ctx.createRadialGradient(140, 610, 0, 140, 610, 500); glow.addColorStop(0, '#53d7b214'); glow.addColorStop(1, '#53d7b200'); ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);
  // A lightly etched air bed and long north-light ribbons form the original rink artwork.
  ctx.fillStyle = '#9ee9ed15';
  for (let y = 59; y < H - 55; y += 18) for (let x = 59; x < W - 50; x += 18) { ctx.beginPath(); ctx.arc(x, y, 0.8, 0, Math.PI * 2); ctx.fill(); }
  ctx.save(); pathRoundRect(40, 40, 520, 780, 18); ctx.clip();
  for (let i = 0; i < 4; i++) {
    ctx.beginPath(); ctx.moveTo(-80, 220 + i * 70);
    ctx.bezierCurveTo(120, 80 + i * 70, 310, 540 + i * 50, 680, 230 + i * 70);
    ctx.strokeStyle = i % 2 ? '#86a6f509' : '#82ffe109'; ctx.lineWidth = 22 - i * 3; ctx.stroke();
  }
  ctx.restore();
  circle(300, 430, 88, '#8ccbd529', 2); circle(300, 430, 9, '#83c6d34d', 2);
  ctx.setLineDash([12, 13]); line(48, 430, 552, 430, '#7ec2d34d', 2); ctx.setLineDash([]);
  ctx.save(); ctx.beginPath(); ctx.rect(42, 42, 516, 776); ctx.clip(); circle(300, 44, 136, '#ff9c8a22', 2); circle(300, 816, 136, '#75f6d928', 2); ctx.restore();
  // Recessed goals have a visible net behind the scoring line.
  for (const top of [true, false]) {
    const y = top ? 0 : 824, color = top ? '#ff8b87' : '#6df4e4';
    ctx.fillStyle = '#030c15'; ctx.fillRect(RINK.goalLeft, y, RINK.goalRight - RINK.goalLeft, 36);
    for (let x = RINK.goalLeft + 6; x < RINK.goalRight; x += 12) line(x, y + 3, x, y + 33, `${color}30`, 1);
    for (let ny = y + 8; ny < y + 35; ny += 9) line(RINK.goalLeft, ny, RINK.goalRight, ny, `${color}30`, 1);
    line(RINK.goalLeft + 5, top ? 11 : 849, RINK.goalRight - 5, top ? 11 : 849, color, 3);
  }
  ctx.lineCap = 'round';
  for (const x of [RINK.left, RINK.right]) {
    line(x, 45, x, 815, '#2a4d60', 14); line(x, 48, x, 812, '#7ac6d74a', 4);
    for (let y = 65; y < 810; y += 42) line(x, y, x, y + 20, y < 430 ? '#ff8b8790' : '#6df4e490', 3);
  }
  for (const y of [RINK.top, RINK.bottom]) for (const ends of [[44, RINK.goalLeft], [RINK.goalRight, 556]]) {
    line(ends[0], y, ends[1], y, '#2e5061', 14); line(ends[0], y, ends[1], y, y < 430 ? '#ff8b87' : '#6df4e4', 3);
  }
  for (const x of [RINK.goalLeft, RINK.goalRight]) for (const y of [RINK.top, RINK.bottom]) {
    ctx.beginPath(); ctx.arc(x, y, 7, 0, Math.PI * 2); ctx.fillStyle = '#e7f7ff'; ctx.fill();
  }
  ctx.font = '600 12px ui-sans-serif, system-ui'; ctx.fillStyle = '#afd3e245'; ctx.textAlign = 'center';
  ctx.fillText('A U R O R A   /   W W G', 300, 555);
  ctx.save(); ctx.translate(300, 305); ctx.rotate(Math.PI); ctx.fillText('F I N D   Y O U R   A N G L E', 0, 0); ctx.restore();
  if (!reducedMotion.matches) {
    trail.forEach((point, index) => { ctx.beginPath(); ctx.arc(point.x, point.y, 3 + index / trail.length * 8, 0, Math.PI * 2); ctx.fillStyle = `rgba(217,247,255,${index / trail.length * 0.16})`; ctx.fill(); });
    sparks.forEach((s) => { ctx.beginPath(); ctx.arc(s.x, s.y, 2, 0, Math.PI * 2); ctx.fillStyle = s.player === 0 ? `rgba(109,244,228,${s.life / 0.35})` : `rgba(255,139,135,${s.life / 0.35})`; ctx.fill(); });
  }
  drawPaddle(match.paddles[1], 1); drawPaddle(match.paddles[0], 0);
  const p = match.puck;
  ctx.save(); ctx.shadowColor = '#bff9ff'; ctx.shadowBlur = 16; ctx.shadowOffsetY = 0;
  ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fillStyle = '#ecfcff'; ctx.fill(); ctx.shadowBlur = 0;
  circle(p.x, p.y, 8, '#73a0b3', 2); ctx.restore();
  if (view === 'play' && match.phase === 'serve' && toastRemaining <= 0) {
    ctx.fillStyle = '#e9f9ff'; ctx.font = '750 40px ui-sans-serif, system-ui'; ctx.textAlign = 'center'; ctx.fillText(String(Math.max(1, Math.ceil(match.serveLeft))), 300, 382);
    ctx.font = '600 16px ui-sans-serif, system-ui'; ctx.fillStyle = '#b1d0dd'; ctx.fillText('GET INTO POSITION', 300, 490);
  }
}

function frame(timestamp) {
  const elapsed = lastFrame === null ? 0 : Math.min(0.05, Math.max(0, (timestamp - lastFrame) / 1000)); lastFrame = timestamp;
  if (view === 'play' && !paused && !document.hidden) {
    accumulator = Math.min(accumulator + elapsed, STEP * 6);
    while (accumulator >= STEP && view === 'play') { advance(match, getInputs(), STEP); accumulator -= STEP; handleEvents(); }
    if (match.phase === 'playing' && !reducedMotion.matches) { trail.push({ x: match.puck.x, y: match.puck.y }); if (trail.length > 15) trail.shift(); }
    sparks = sparks.filter((s) => { s.x += s.vx * elapsed; s.y += s.vy * elapsed; s.life -= elapsed; return s.life > 0; });
    if (toastRemaining > 0) { toastRemaining -= elapsed; if (toastRemaining <= 0) hideToast(); }
  }
  draw(); requestAnimationFrame(frame);
}
updateRecord(); updateSound(); updateSetup();
if (!ctx) {
  $('menu-title').textContent = 'Rink unavailable'; $('menu-description').textContent = 'Canvas rendering is unavailable in this browser. Try another browser to play.';
  $('setup').hidden = true; $('start').disabled = true;
} else { resize(); requestAnimationFrame(frame); }
