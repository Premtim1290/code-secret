export const VERSION = '1.0.0';
export const COLORS = Object.freeze(['rouge', 'bleu', 'vert', 'jaune', 'orange', 'violet']);
const CONFIG = Object.freeze({ apiVersion: '0.2', rulesVersion: 'code-couleurs-1.0', secretLength: 4, maxAttempts: 10, allowDuplicates: true });
const copy = value => JSON.parse(JSON.stringify(value));
const messages = {
  'invalid-options': 'Les options doivent être un objet contenant uniquement la clé secret.',
  'invalid-type': 'Choisissez une couleur pour chacune des quatre positions.',
  'invalid-length': 'Une proposition doit contenir exactement quatre couleurs.',
  'invalid-color': 'La couleur proposée n’est pas autorisée.',
  'game-not-started': 'Commencez une nouvelle partie avant de proposer un code.',
  'game-finished': 'La partie est terminée. Lancez une nouvelle partie pour rejouer.'
};
function validateCode(code) {
  if (!Array.isArray(code)) return 'invalid-type';
  for (let i = 0; i < code.length; i++) {
    if (!Object.hasOwn(code, i) || typeof code[i] !== 'string') return 'invalid-type';
  }
  if (code.length !== 4) return 'invalid-length';
  if (code.some(color => !COLORS.includes(color))) return 'invalid-color';
  return null;
}
export function score(secret, guess) {
  let wellPlaced = 0;
  const remainingSecret = [], remainingGuess = [];
  for (let i = 0; i < 4; i++) {
    if (secret[i] === guess[i]) wellPlaced++;
    else { remainingSecret.push(secret[i]); remainingGuess.push(guess[i]); }
  }
  let misplaced = 0;
  for (const color of COLORS) {
    misplaced += Math.min(remainingSecret.filter(c => c === color).length, remainingGuess.filter(c => c === color).length);
  }
  return { wellPlaced, misplaced };
}
export function createGame(onChange = () => {}) {
  let secret = null;
  let state = { status: 'not-started', attempts: 0, history: [], lastGuess: null, lastResult: null, lastError: null };
  const getState = () => copy(state);
  const notify = () => { onChange(getState()); return getState(); };
  return Object.freeze({
    version: '0.2',
    getConfig: () => ({ ...CONFIG, colors: [...COLORS] }),
    getState,
    async startGame(options = {}) {
      let error = null;
      if (options === null || typeof options !== 'object' || Array.isArray(options)
        || ![Object.prototype, null].includes(Object.getPrototypeOf(options))
        || Reflect.ownKeys(options).some(key => key !== 'secret')) error = 'invalid-options';
      else if (Object.hasOwn(options, 'secret')) error = validateCode(options.secret);
      if (error) throw Object.assign(new Error(messages[error]), { code: error });
      secret = Object.hasOwn(options, 'secret') ? [...options.secret] : Array.from({ length: 4 }, () => COLORS[Math.floor(Math.random() * COLORS.length)]);
      state = { status: 'playing', attempts: 0, history: [], lastGuess: null, lastResult: null, lastError: null };
      return notify();
    },
    async submitGuess(guess) {
      const error = state.status === 'not-started' ? 'game-not-started'
        : state.status !== 'playing' ? 'game-finished' : validateCode(guess);
      if (error) { state.lastError = { code: error, message: messages[error] }; return notify(); }
      const result = score(secret, guess);
      state.history.push({ guess: [...guess], result });
      state.attempts++;
      state.lastGuess = [...guess];
      state.lastResult = { ...result };
      state.lastError = null;
      state.status = result.wellPlaced === 4 ? 'won' : state.attempts === 10 ? 'lost' : 'playing';
      return notify();
    }
  });
}
