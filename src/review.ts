import type { Attempt, Fact, Mode, Session, Topic, Variant } from './model.ts';

const day = 86_400_000;
const intervals = [1, 3, 7, 14, 30, 60];

export function reviewState(history: readonly Attempt[]) {
  let streak = 0;
  let due = 0;
  let recovered = 2;
  for (const attempt of history) {
    if (attempt.correct) {
      streak++;
      recovered++;
      due = attempt.at + day * intervals[Math.min(streak, intervals.length) - 1];
    } else {
      streak = 0;
      recovered = 0;
      due = attempt.at + 600_000;
    }
  }
  return { streak, due, weak: recovered < 2, mastered: streak >= 3 };
}

export function indexAttempts(sessions: readonly Session[]) {
  const index = new Map<string, Attempt[]>();
  const attempts = sessions.flatMap(session => session.attempts).sort((a, b) => a.at - b.at);
  for (const attempt of attempts) {
    const history = index.get(attempt.factId) ?? [];
    history.push(attempt);
    index.set(attempt.factId, history);
  }
  return index;
}

export type Card = { fact: Fact; variant: Variant; order: number[] };

export function selectCards(bank: readonly Fact[], sessions: readonly Session[], mode: Mode,
    topic?: Topic, now = Date.now(), random = Math.random): Card[] {
  const index = indexAttempts(sessions);
  return bank.filter(fact => mode !== 'All Topics' || fact.topic === topic).map(fact => {
    const history = index.get(fact.id) ?? [];
    const state = reviewState(history);
    const rank = !history.length ? 2 : state.due <= now ? (state.weak ? 0 : 1) : 3;
    return { fact, history, state, rank, tie: random() };
  }).filter(item => mode !== 'Weak Spots' || item.state.weak)
    .sort((a, b) => a.rank - b.rank || (a.rank === 2 ? 0 : a.state.due - b.state.due) || a.tie - b.tie)
    .slice(0, 10)
    .map(({ fact, history }) => {
      const last = fact.variants.findIndex(variant => variant.id === history.at(-1)?.variantId);
      const variant = fact.variants[(last + 1) % fact.variants.length];
      const order = [0, 1, 2, 3];
      for (let index = order.length - 1; index > 0; index--) {
        const swap = Math.floor(random() * (index + 1));
        [order[index], order[swap]] = [order[swap], order[index]];
      }
      return { fact, variant, order };
    });
}
