import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, score, COLORS } from '../js/game.js';
const R = 'rouge', B = 'bleu', V = 'vert', J = 'jaune', O = 'orange', Vi = 'violet';
const reds = [R,R,R,R], blues = [B,B,B,B];
const cases = [
  [[R,B,V,J],[R,V,B,O],1,2], [[R,B,V,J],[O,Vi,R,B],0,2],
  [[R,B,V,J],[B,R,J,V],0,4], [[R,B,V,J],[R,B,J,V],2,2],
  [[R,B,V,J],[R,B,V,J],4,0], [[R,R,B,V],reds,2,0],
  [[R,R,B,V],[R,B,R,V],2,2], [[R,R,B,V],[R,R,B,V],4,0],
  [[R,R,B,V],[R,B,R,R],1,2]
];
for (const [i, [secret, guess, wellPlaced, misplaced]] of cases.entries()) {
  test(`T${String(i+1).padStart(2,'0')} : attendu ${wellPlaced}/${misplaced}`, async () => {
    let screen;
    const game = createGame(s => { screen = s; });
    await game.startGame({secret});
    const state = await game.submitGuess(guess);
    assert.deepEqual(state.lastResult, {wellPlaced,misplaced});
    assert.equal(state.attempts,1); assert.equal(state.history.length,1);
    assert.equal(state.status,wellPlaced === 4 ? 'won' : 'playing');
    assert.equal(state.lastError,null); assert.deepEqual(screen,state);
  });
}
test('configuration et état initial exacts', () => {
  const game = createGame();
  assert.equal(game.version,'0.2');
  assert.deepEqual(game.getConfig(), {apiVersion:'0.2',rulesVersion:'code-couleurs-1.0',secretLength:4,maxAttempts:10,allowDuplicates:true,colors:[...COLORS]});
  assert.deepEqual(game.getState(),{status:'not-started',attempts:0,history:[],lastGuess:null,lastResult:null,lastError:null});
});
test('priorités des refus et absence de consommation', async () => {
  const game = createGame();
  assert.equal((await game.submitGuess(null)).lastError.code,'game-not-started');
  await game.startGame({secret:reds});
  const sparse = new Array(4); sparse[0]=R;
  for (const [guess,code] of [[null,'invalid-type'],[[R,null],'invalid-type'],[sparse,'invalid-type'],[[R],'invalid-length'],[['Violet',R,R,R],'invalid-color'],[['violet ',R,R,R],'invalid-color'],[['purple',R,R,R],'invalid-color']]) {
    const before = game.getState(); const after = await game.submitGuess(guess);
    assert.equal(after.lastError.code,code); assert.ok(after.lastError.message);
    assert.deepEqual({...after,lastError:null},{...before,lastError:null});
  }
  assert.equal((await game.submitGuess(blues)).lastError,null);
});
test('démarrages invalides rejetés sans aucune mutation ni notification', async () => {
  let notifications = 0;
  const game = createGame(() => notifications++);
  await game.startGame({secret:reds}); await game.submitGuess(null);
  const before = game.getState(), count = notifications;
  const invalid = [[null,'invalid-options'],[[],'invalid-options'],[new Date(),'invalid-options'],[{other:1,secret:null},'invalid-options'],[{[Symbol('x')]:1},'invalid-options'],[{secret:undefined},'invalid-type'],[{secret:null},'invalid-type'],[{secret:[R,null]},'invalid-type'],[{secret:[R]},'invalid-length'],[{secret:['Rouge',R,R,R]},'invalid-color']];
  for (const [options,code] of invalid) {
    await assert.rejects(game.startGame(options), e => e instanceof Error && e.code === code && Boolean(e.message));
    assert.deepEqual(game.getState(),before); assert.equal(notifications,count);
  }
});
for (const win of [true,false]) test(win ? 'victoire au dixième après refus à neuf' : 'défaite au dixième', async () => {
  const game = createGame(); await game.startGame({secret:reds});
  for(let i=0;i<9;i++) await game.submitGuess(blues);
  assert.equal((await game.submitGuess([R])).attempts,9);
  const state = await game.submitGuess(win ? reds : blues);
  assert.equal(state.status,win ? 'won' : 'lost'); assert.equal(state.attempts,10);
  const refused = await game.submitGuess(null);
  assert.equal(refused.lastError.code,'game-finished');
  assert.deepEqual({...refused,lastError:null},state);
  const restarted = await game.startGame();
  assert.equal(restarted.status,'playing'); assert.equal(restarted.attempts,0);
  assert.deepEqual(restarted.history,[]); assert.equal(restarted.lastError,null);
});
test('copies indépendantes : entrées, état, configuration, notifications', async () => {
  const secret = [...reds], guess = [...blues]; let screen;
  const game = createGame(s => {screen=s;});
  await game.startGame({secret}); secret.fill(B);
  const state = await game.submitGuess(guess); guess.fill(R);
  assert.deepEqual(state.lastResult,{wellPlaced:0,misplaced:0});
  state.history[0].guess.fill(V); state.lastResult.wellPlaced=4;
  screen.history.length=0;
  const config = game.getConfig(); config.colors.length=0;
  assert.equal(game.getState().history.length,1);
  assert.deepEqual(game.getState().history[0].guess,blues);
  assert.equal(game.getState().lastResult.wellPlaced,0);
  assert.equal(game.getConfig().colors.length,6);
  assert.equal((await game.submitGuess(reds)).status,'won');
  assert.ok(!('secret' in game.getState())); assert.ok(!('solution' in game.getState()));
});
test('tirages aléatoires valides sans options, undefined et objet vide', async () => {
  const game=createGame();
  for (const options of [undefined,{}]) {
    const state=await game.startGame(options); assert.equal(state.status,'playing');
    for(const color of COLORS) {
      const next=await game.submitGuess([color,color,color,color]);
      assert.ok(next.lastResult.wellPlaced >= 0 && next.lastResult.wellPlaced <= 4);
      if(next.status === 'won') break;
    }
    assert.ok(game.getState().attempts >= 1 && game.getState().attempts <= 6);
  }
});
test('régression : les occurrences bien placées ne sont pas recomptées', () => {
  assert.deepEqual(score([R,R,B,V],reds),{wellPlaced:2,misplaced:0});
});
