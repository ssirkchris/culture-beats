import type { Attempt, Fact, Session } from './model.ts';
import { reviewState } from './review.ts';

const week = 7 * 86_400_000;

export function welcomeMessage(sessions: readonly Session[], now = Date.now()) {
  if (!sessions.length) return "Every legend starts somewhere. Let's go.";

  const lastAnswer = sessions.reduce(
    (latest, session) => Math.max(latest, session.attempts.at(-1)?.at ?? 0), 0,
  );
  if (now - lastAnswer >= week) return 'Welcome back. Pick up where you left off.';
}

export function answerNotes(attempts: readonly Attempt[], topicFacts: readonly Fact[],
    history: ReadonlyMap<string, readonly Attempt[]>) {
  const last = attempts.at(-1);
  if (!last) return [];

  if (!last.correct) {
    const thirdMiss = attempts.length >= 3 && attempts.slice(-3).every(attempt => !attempt.correct)
      && attempts.at(-4)?.correct !== false;
    return thirdMiss ? ["Tough round. You've got this."] : [];
  }

  const notes: string[] = [];
  const earlier = history.get(last.factId) ?? [];
  if (earlier.at(-1)?.correct === false) notes.push('You missed it before. Nailed it now.');
  if (attempts.length >= 5 && attempts.slice(-5).every(attempt => attempt.correct) && !attempts.at(-6)?.correct) {
    notes.push("Five in a row. You're locked in.");
  }

  // With a correct answer, a fact can become mastered only on its third hit.
  if (reviewState(earlier).streak === 2 &&
      topicFacts.every(fact => fact.id === last.factId || reviewState(history.get(fact.id) ?? []).mastered)) {
    notes.push("This one's in the bag.");
  }
  return notes;
}

const artistQuotes = [
  {
    words: 'You’re not going to hit it every single time',
    artist: 'Eminem',
    source: 'Interview, 2017',
    url: 'https://www.interviewmagazine.com/music/eminem-elton-john-december-2017-interview',
  },
  {
    words: 'I’ve always had an imagination and I listen to a lot of different writers.',
    artist: 'Missy Elliott',
    source: 'Interview, 1999',
    url: 'https://www.interviewmagazine.com/music/new-again-missy-elliott',
  },
] as const;

export function sessionQuote(sessions: readonly Session[], sessionId: string) {
  const qualifying = sessions.filter(session => session.mode === 'Daily Practice' &&
    session.attempts.length === 10 && session.attempts.filter(attempt => attempt.correct).length >= 8)
    .sort((a, b) => a.attempts[9].at - b.attempts[9].at || a.id.localeCompare(b.id));
  const milestone = qualifying.findIndex(session => session.id === sessionId) + 1;
  if (milestone > 0 && milestone % 5 === 0) {
    return artistQuotes[(milestone / 5 - 1) % artistQuotes.length];
  }
}
