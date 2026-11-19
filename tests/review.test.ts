import test from 'node:test';
import assert from 'node:assert/strict';
import { bank } from '../src/bank.ts';
import { bankErrors, initialProgress, topics, type Attempt, type Fact, type Session } from '../src/model.ts';
import { indexAttempts, reviewState, selectCards } from '../src/review.ts';
import { parseBackup } from '../src/storage.ts';

const first = bank[0];
const day = 86_400_000;
const attempt = (correct: boolean, at: number): Attempt => ({
  factId: first.id, variantId: first.variants[0].id, correct, at,
});
const session = (...attempts: Attempt[]): Session => ({ id: 'session-1', mode: 'Daily Practice', attempts });

test('starter bank covers all topics and both countries with valid variants', () => {
  assert.deepEqual(bankErrors(bank), []);
  assert.deepEqual(new Set(bank.map(fact => fact.topic)), new Set(topics));
  assert.deepEqual(new Set(bank.map(fact => fact.country)), new Set(['UK', 'USA']));
});

test('validation rejects duplicate answers, missing variants, and invalid keys', () => {
  const variant = { ...first.variants[0], options: ['Yes', ' yes ', 'No', 'Maybe'], correct: 4 } as const;
  const invalid: Fact = { ...first, variants: [variant] };
  assert.equal(bankErrors([invalid]).length, 2);
});

test('validation rejects duplicate IDs and unverified source URLs', () => {
  assert.ok(bankErrors([first, first]).some(error => error.startsWith('Invalid question')));
  assert.ok(bankErrors([{ ...first, source: { title: 'Bad URL', url: 'http://example.org' } }]).length);
});

test('correct answers expand intervals and three correct answers mark mastery', () => {
  const firstHit = attempt(true, 10);
  const secondHit = attempt(true, 10 + day);
  const thirdHit = attempt(true, 10 + 4 * day);
  assert.equal(reviewState([firstHit]).due, 10 + day);
  assert.equal(reviewState([firstHit, secondHit]).due, 10 + 4 * day);
  assert.deepEqual(reviewState([firstHit, secondHit, thirdHit]),
    { streak: 3, due: 10 + 11 * day, weak: false, mastered: true });
});

test('a miss resets mastery and takes two correct answers to repair', () => {
  const miss = attempt(false, 5);
  assert.deepEqual(reviewState([miss]), { streak: 0, due: 600_005, weak: true, mastered: false });
  assert.equal(reviewState([miss, attempt(true, 6)]).weak, true);
  assert.equal(reviewState([miss, attempt(true, 6), attempt(true, 7)]).weak, false);
});

test('daily selects ten distinct facts, prioritises due misses and rotates variants', () => {
  const cards = selectCards(bank, [session(attempt(false, 0))], 'Daily Practice', undefined, day, () => .4);
  assert.equal(cards.length, 10);
  assert.equal(new Set(cards.map(card => card.fact.id)).size, 10);
  assert.equal(cards[0].fact.id, first.id);
  assert.equal(cards[0].variant.id, first.variants[1].id);
  assert.deepEqual([...cards[0].order].sort(), [0, 1, 2, 3]);
});

test('topic and weak spot selection constrain the fact pool', () => {
  const food = selectCards(bank, [], 'All Topics', 'Food');
  assert.ok(food.length && food.every(card => card.fact.topic === 'Food'));
  assert.deepEqual(selectCards(bank, [], 'Weak Spots'), []);
  const weak = selectCards(bank, [session(attempt(false, 0))], 'Weak Spots');
  assert.deepEqual(weak.map(card => card.fact.id), [first.id]);
});

test('history sorts attempts chronologically across sessions', () => {
  const earlier = attempt(false, 2);
  const later = attempt(true, 5);
  assert.deepEqual(indexAttempts([session(later), session(earlier)]).get(first.id), [earlier, later]);
});

test('backup structure round-trips and rejects invalid dates and session duplicates', () => {
  const backup = { ...initialProgress, sessions: [session(attempt(true, 9))] };
  assert.deepEqual(parseBackup(JSON.stringify(backup)), backup);
  assert.throws(() => parseBackup(JSON.stringify({ ...backup, sessions: [session(attempt(true, -1))] })));
  assert.throws(() => parseBackup(JSON.stringify({ ...backup, sessions: [...backup.sessions, ...backup.sessions] })));
});
