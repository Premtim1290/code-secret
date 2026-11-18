import { COLORS, createGame } from './game.js';
const $ = selector => document.querySelector(selector);
const symbols = ['●', '◆', '▲', '★', '■', '✚'];
const labels = COLORS.map((color, i) => `${symbols[i]} ${color[0].toUpperCase()}${color.slice(1)}`);
const selects = COLORS.slice(0, 4).map((_, i) => {
  const label = document.createElement('label');
  label.className = 'slot';
  const caption = document.createElement('span');
  caption.textContent = `POSITION ${i + 1}`;
  const select = document.createElement('select');
  select.setAttribute('aria-label', `Couleur en position ${i + 1}`);
  select.innerHTML = '<option value="">—</option>';
  COLORS.forEach((color, index) => select.add(new Option(labels[index], color)));
  select.addEventListener('change', () => { select.dataset.color = select.value; });
  label.append(caption, select); $('#slots').append(label);
  return select;
});
function resetDraft() {
  selects.forEach(select => { select.value = ''; select.dataset.color = ''; });
}
function render(state) {
  const active = state.status === 'playing';
  if (state.attempts === 0 && state.lastError === null) resetDraft();
  $('#counter').textContent = `${state.attempts} / 10`;
  $('#guess-fields').disabled = !active;
  $('#submit').disabled = !active;
  $('#turn-label').textContent = active ? `ESSAI ${state.attempts + 1} SUR 10` : 'À VOUS DE JOUER';
  const rows = Array.from({ length: 10 }, (_, i) => {
    const li = document.createElement('li');
    const entry = state.history[i];
    li.className = `history-row${entry ? ' filled' : ''}${active && i === state.attempts ? ' current' : ''}`;
    const number = document.createElement('span'); number.className = 'row-number'; number.textContent = String(i + 1).padStart(2, '0');
    const pegs = document.createElement('div'); pegs.className = 'pegs';
    for (let j = 0; j < 4; j++) {
      const peg = document.createElement('span'); peg.className = 'peg';
      if (entry) { const index = COLORS.indexOf(entry.guess[j]); peg.dataset.color = entry.guess[j]; peg.textContent = symbols[index]; peg.setAttribute('role', 'img'); peg.setAttribute('aria-label', entry.guess[j]); peg.title = entry.guess[j]; }
      else { peg.textContent = '·'; peg.setAttribute('aria-hidden', 'true'); }
      pegs.append(peg);
    }
    const result = document.createElement('span'); result.className = 'result';
    if (entry) {
      result.innerHTML = `<span class="well">${entry.result.wellPlaced}</span><span class="misplaced">${entry.result.misplaced}</span>`;
      result.setAttribute('role', 'img');
      result.setAttribute('aria-label', `${entry.result.wellPlaced} bien placées, ${entry.result.misplaced} mal placées`);
    } else { result.textContent = '—'; result.setAttribute('aria-label', 'Non joué'); }
    li.append(number, pegs, result); return li;
  });
  $('#history').replaceChildren(...rows);
  let message = 'Le code est prêt. À vous de suivre la piste !';
  if (state.status === 'not-started') message = 'Lancez une nouvelle partie pour commencer.';
  if (active && state.attempts > 0) message = `Essai ${state.attempts} : ${state.lastResult.wellPlaced} bien placées, ${state.lastResult.misplaced} mal placées. Continuez !`;
  if (state.status === 'won') message = `Code percé ! Bravo, vous avez gagné en ${state.attempts} essai${state.attempts > 1 ? 's' : ''}.`;
  if (state.status === 'lost') message = 'Les dix essais sont écoulés. Partie perdue. Une nouvelle enquête vous attend !';
  if (state.lastError) message = state.lastError.message;
  $('#message').textContent = message;
  $('#message').classList.toggle('error', Boolean(state.lastError));
  $('#message').classList.toggle('success', state.status === 'won');
}
const game = createGame(render);
$('#guess-form').addEventListener('submit', async event => {
  event.preventDefault();
  const state = await game.submitGuess(selects.map(select => select.value || null));
  if (state.lastError) selects.find(select => !select.value)?.focus();
  else if (state.status === 'playing') { resetDraft(); selects[0].focus(); }
  else $('#new-game').focus();
});
$('#new-game').addEventListener('click', async () => { await game.startGame(); selects[0].focus(); });
render(game.getState());
if (new URLSearchParams(window.location.search).get('test') === '1') window.codeSecretTest = game;
else await game.startGame();
