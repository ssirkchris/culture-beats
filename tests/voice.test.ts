import assert from 'node:assert/strict';
import test from 'node:test';
import { bank } from '../src/bank.ts';
import type { Attempt, Session } from '../src/model.ts';
import { answerNotes, sessionQuote, welcomeMessage } from '../src/voice.ts';

const politics = bank.filter(fact => fact.topic === 'Politics');
const [first, second] = politics;
const answer = (correct: boolean, at = 0, fact = first): Attempt => ({
  correct, at, factId: fact.id, variantId: fact.variants[0].id,
});
const notes = (results: boolean[]) => answerNotes(results.map(result => answer(result)), politics, new Map());
const session = (number: number, score = 8): Session => ({
  id: 'daily-' + number,
  mode: 'Daily Practice',
  attempts: bank.slice(0, 10).map((fact, index) => answer(index < score, number * 100 + index, fact)),
});

test('welcome recognises first practice and seven days since the latest answer', () => {
  const week = 7 * 86_400_000;
  assert.equal(welcomeMessage([], 0), "Every legend starts somewhere. Let's go.");
  const sessions = [session(3), session(1)];
  assert.equal(welcomeMessage(sessions, 309 + week - 1), undefined);
  assert.equal(welcomeMessage(sessions, 309 + week), 'Welcome back. Pick up where you left off.');
});

test('streak feedback fires at exactly five successive correct answers', () => {
  const five = [true, true, true, true, true];
  assert.deepEqual(notes(five.slice(1)), []);
  assert.deepEqual(notes(five.slice(2)), ['Three clean hits. Keep the rhythm.']);
  assert.deepEqual(notes([false, ...five]), ["Five in a row. You're locked in."]);
  assert.deepEqual(notes([...five, true]), []);
  assert.deepEqual(notes([true, true, true, false, true, true]), []);
});

test('tough-round feedback fires at the third consecutive miss', () => {
  assert.deepEqual(notes([true, false, false]), []);
  assert.deepEqual(notes([true, false, false, false]), ["Tough round. You've got this."]);
  assert.deepEqual(notes([false, false, false, false]), []);
});

test('recovery notes recognise a prior mistake on the same fact across variants', () => {
  const history = new Map([[first.id, [answer(false)]]]);
  const correct = { ...answer(true), variantId: first.variants[1].id };
  assert.deepEqual(answerNotes([correct], politics, history), ['You missed it before. Nailed it now.']);
  history.get(first.id)?.push(correct);
  assert.deepEqual(answerNotes([correct], politics, history), []);
});

test('mastery feedback needs the final unmastered fact to reach its third hit', () => {
  const history = new Map([[first.id, [answer(true), answer(true)]]]);
  assert.deepEqual(answerNotes([answer(true)], politics, history), []);
  history.set(second.id, [answer(true), answer(true), answer(true)]);
  assert.deepEqual(answerNotes([answer(true)], politics, history), ["This one's in the bag."]);
  history.get(first.id)?.push(answer(true));
  assert.deepEqual(answerNotes([answer(true)], politics, history), []);
});

test('quotes rotate from the first strong set and every third qualifying set after that', () => {
  const sessions = Array.from({ length: 10 }, (_, index) => session(index + 1));
  sessions[3].mode = 'Regional Practice';
  sessions.push({ ...session(0), attempts: session(0).attempts.slice(0, 9) }, session(11, 7));
  assert.equal(sessionQuote(sessions, 'daily-1')?.artist, 'Eminem');
  assert.equal(sessionQuote(sessions, 'daily-2'), undefined);
  assert.equal(sessionQuote(sessions, 'daily-4')?.artist, 'Missy Elliott');
  assert.equal(sessionQuote([...sessions].reverse(), 'daily-7')?.artist, 'Pharrell Williams');
  assert.equal(sessionQuote(sessions, 'daily-11'), undefined);
});
