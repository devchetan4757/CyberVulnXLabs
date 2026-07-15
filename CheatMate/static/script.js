const START_POSITION = 'start';

let board = Chessboard('board', {
  position: START_POSITION,
  orientation: 'black',   // board is drawn from the player's (Black's) side
  draggable: false,       // this puzzle is click-to-move only
  pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png'
});

window.addEventListener('resize', () => board.resize());

let sessionId = null;
let yourColor = null;
let awaitingClick = false;

const startBtn = document.getElementById('startBtn');
const claimBtn = document.getElementById('claimBtn');
const resetBtn = document.getElementById('resetBtn');
const statusEl = document.getElementById('status');
const resultEl = document.getElementById('result');
const evalFill = document.getElementById('eval-fill');
const evalReadout = document.getElementById('eval-readout');
const evalNote = document.getElementById('eval-note');
const mateOverlay = document.getElementById('mate-overlay');
const mateMsg = document.getElementById('mate-msg');
const mateCloseBtn = document.getElementById('mateCloseBtn');
const flagInput = document.getElementById('flagInput');
const flagSubmitBtn = document.getElementById('flagSubmitBtn');
const flagCheckMsg = document.getElementById('flagCheckMsg');
const congratsOverlay = document.getElementById('congrats-overlay');
const congratsCloseBtn = document.getElementById('congratsCloseBtn');
const congratsTitle = document.getElementById('congrats-title');
const congratsMsg = document.getElementById('congrats-msg');
const congratsSubtext = document.getElementById('congrats-subtext');
const congratsMeme = document.getElementById('congrats-meme');

function showMatePopup(text) {
  mateMsg.textContent = text;
  mateOverlay.classList.add('show');
}
mateCloseBtn.addEventListener('click', () => mateOverlay.classList.remove('show'));
mateOverlay.addEventListener('click', (e) => {
  if (e.target === mateOverlay) mateOverlay.classList.remove('show');
});

function showCongratsPopup(data) {
  congratsTitle.textContent = data.title || '';
  congratsMsg.textContent = data.message || '';
  congratsSubtext.textContent = data.subtext || '';
  congratsMeme.src = data.meme_url || '';
  congratsOverlay.classList.add('show');
}

function hideCongratsPopup() {
  congratsOverlay.classList.remove('show');
  congratsTitle.textContent = '';
  congratsMsg.textContent = '';
  congratsSubtext.textContent = '';
  congratsMeme.removeAttribute('src');
}

congratsCloseBtn.addEventListener('click', hideCongratsPopup);
congratsOverlay.addEventListener('click', (e) => {
  if (e.target === congratsOverlay) hideCongratsPopup();
});

async function checkFlag() {
  const flag = flagInput.value.trim();
  if (!flag) return;

  flagSubmitBtn.disabled = true;
  flagCheckMsg.className = '';
  flagCheckMsg.textContent = 'Checking…';

  try {
    const res = await fetch('/api/verify_flag', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ flag })
    });
    const data = await res.json();

    if (data.correct) {
      flagCheckMsg.textContent = 'Correct — check the popup.';
      flagCheckMsg.className = 'flag-check-ok';
      showCongratsPopup(data);
    } else {
      flagCheckMsg.textContent = data.message;
      flagCheckMsg.className = 'flag-check-bad';
    }
  } catch (err) {
    flagCheckMsg.textContent = 'Could not reach the server — try again.';
    flagCheckMsg.className = 'flag-check-bad';
  } finally {
    flagSubmitBtn.disabled = false;
  }
}

flagSubmitBtn.addEventListener('click', checkFlag);
flagInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') checkFlag();
});

function setEval(pct, readoutText, noteText) {
  evalFill.style.width = pct + '%';
  evalReadout.textContent = readoutText;
  evalNote.textContent = noteText;
}

function setStatus(text, cls) {
  statusEl.className = cls || '';
  statusEl.textContent = text;
}

function clearHighlights() {
  $('#board .square-55d63').removeClass('legal-square');
}

function highlightSquares(squares) {
  clearHighlights();
  squares.forEach(sq => {
    $('#board .square-55d63[data-square="' + sq + '"]').addClass('legal-square');
  });
}

function wait(ms) {
  return new Promise(res => setTimeout(res, ms));
}

async function armClickHandler(legalSquares) {
  highlightSquares(legalSquares);
  awaitingClick = true;
}

$('#board').on('click', '.square-55d63', async function () {
  if (!awaitingClick) return;
  const square = $(this).data('square');
  if (!square) return;
  if (!$(this).hasClass('legal-square')) return;

  awaitingClick = false;
  clearHighlights();
  await sendMove(square);
});

async function sendMove(square) {
  setStatus('Thinking…', '');
  const res = await fetch('/api/move', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId, square })
  });
  const data = await res.json();

  if (data.error) {
    setStatus(data.error, 'loss');
    return;
  }

  // animate: player's move lands first
  board.position(data.fen_after_player);
  await wait(500);

  // then the bot's reply
  board.position(data.fen_after_bot);

  setEval(data.eval_pct, data.eval_readout, data.eval_note);

  if (data.mate) {
    statusEl.className = 'loss';
    statusEl.textContent = data.message;
    claimBtn.disabled = false;
    showMatePopup(data.message);
  } else {
    setStatus(data.message, 'prompt');
    await wait(400);
    await armClickHandler(data.legal_squares);
  }
}

function resetUI() {
  sessionId = null;
  yourColor = null;
  awaitingClick = false;
  board.orientation('black');
  board.position(START_POSITION);
  clearHighlights();
  startBtn.disabled = false;
  claimBtn.disabled = true;
  statusEl.textContent = '';
  statusEl.className = '';
  resultEl.style.display = 'none';
  resultEl.innerHTML = '';
  resultEl.classList.remove('win-box', 'lose-box');
  mateOverlay.classList.remove('show');
  hideCongratsPopup();
  flagInput.value = '';
  flagCheckMsg.textContent = '';
  flagCheckMsg.className = '';
  setEval(50, '0.0', 'Engine idle — press Start.');
}

startBtn.addEventListener('click', async () => {
  startBtn.disabled = true;
  setStatus('Setting up the position…', '');
  setEval(50, '0.0', 'Bot to move…');

  const res = await fetch('/api/start', { method: 'POST' });
  const data = await res.json();

  sessionId = data.session_id;
  yourColor = data.color;

  board.position(data.start_fen);
  await wait(500);
  board.position(data.fen);

  setStatus(data.message, 'prompt');
  setEval(data.eval_pct, data.eval_readout, data.eval_note);
  await wait(300);
  await armClickHandler(data.legal_squares);
});

claimBtn.addEventListener('click', async () => {
  const res = await fetch('/api/claim', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      session_id: sessionId,
      color: yourColor
    })
  });
  const data = await res.json();

  resultEl.style.display = 'block';
  if (data.result === 'win') {
    resultEl.classList.add('win-box');
    resultEl.innerHTML = `<div class="flag">🏳 ${data.flag}</div>`;
    statusEl.className = 'win';
    statusEl.textContent = 'Result: you win.';
    setEval(data.eval_pct, data.eval_readout, data.eval_note);
  } else {
    resultEl.classList.add('lose-box');
    resultEl.innerHTML = `<div class="lose-msg">${data.message}</div>`;
  }
});

resetBtn.addEventListener('click', resetUI);
