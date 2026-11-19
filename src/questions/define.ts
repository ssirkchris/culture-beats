import type { Fact, Topic, Variant } from '../model.ts';

type Source = readonly [title: string, url: string];

// Each pair uses different clues. The quiz shuffles the four choices independently.
export function forTopic(topic: Topic) {
  return (
    id: string, country: Fact['country'], difficulty: Fact['difficulty'], source: Source,
    explanation: string, options: Variant['options'], prompts: readonly [string, string], eventDate?: string,
  ): Fact => ({
    id, country, topic, difficulty, eventDate, explanation,
    source: { title: source[0], url: source[1] },
    variants: prompts.map((prompt, index) => ({ id: id + '-' + (index + 1), prompt, options, correct: 0 })),
  });
}
