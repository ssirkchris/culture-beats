import test from 'node:test';
import assert from 'node:assert/strict';
import { bank } from '../src/bank.ts';
import { initialProgress, regionalTopics, stages, topics, type Session } from '../src/model.ts';
import { selectCards } from '../src/review.ts';
import { parseBackup } from '../src/storage.ts';

test('the syllabus groups all topics and every regional pool is substantial in both countries', () => {
  assert.deepEqual(stages.flatMap(stage => [...stage.topics]), [...topics]);
  for (const topic of regionalTopics) {
    for (const country of ['UK', 'USA']) {
      assert.ok(bank.filter(fact => fact.topic === topic && fact.country === country).length >= 8);
    }
  }
  const prompts = bank.flatMap(fact => fact.variants.map(variant => variant.prompt));
  assert.equal(new Set(prompts).size, prompts.length);
});

test('regional sets contain ten distinct facts including UK and USA in each syllabus area', () => {
  const cards = selectCards(bank, [], 'Regional Practice', undefined, 0, () => .5);
  assert.equal(cards.length, 10);
  assert.equal(new Set(cards.map(card => card.fact.id)).size, 10);
  for (const topic of regionalTopics) {
    assert.deepEqual(new Set(cards.filter(card => card.fact.topic === topic).map(card => card.fact.country)), new Set(['UK', 'USA']));
  }
});

test('backups accept regional practice and the optional country on a topic session', () => {
  const fact = bank.find(item => item.topic === 'Geography' && item.country === 'UK')!;
  const attempts = [{ factId: fact.id, variantId: fact.variants[0].id, correct: true, at: 1 }];
  const sessions: Session[] = [
    { id: 'one', mode: 'Regional Practice', attempts },
    { id: 'two', mode: 'All Topics', topic: 'Geography', country: 'UK', attempts },
  ];
  assert.deepEqual(parseBackup(JSON.stringify({ ...initialProgress, sessions })).sessions, sessions);
});
