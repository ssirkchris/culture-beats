export const topics = [
  'Politics', 'Food', 'Sports', 'Geography', 'Literature', 'Science',
  'Current Affairs', 'History', 'Cinema', 'Music', 'Holidays & Traditions',
] as const;
export type Topic = typeof topics[number];
export const modes = ['Daily Practice', 'All Topics', 'Weak Spots'] as const;
export type Mode = typeof modes[number];
export type Variant = {
  id: string;
  prompt: string;
  options: readonly [string, string, string, string];
  correct: number;
};
export type Fact = {
  id: string;
  topic: Topic;
  country: 'UK' | 'USA';
  difficulty: 'Foundation' | 'Challenge';
  explanation: string;
  source: { title: string; url: string };
  eventDate?: string;
  variants: readonly Variant[];
};
export type Attempt = { factId: string; variantId: string; correct: boolean; at: number };
export type Session = { id: string; mode: Mode; topic?: Topic; attempts: Attempt[] };
export type Reminder = { enabled: boolean; time: string };
export type Progress = { version: 1; sessions: Session[]; reminder: Reminder };
export const timeZone = 'Europe/Warsaw';
export const initialProgress: Progress = { version: 1, sessions: [], reminder: { enabled: true, time: '18:00' } };

export function bankErrors(facts: readonly Fact[]): string[] {
  const factIds = new Set<string>();
  const variantIds = new Set<string>();
  const errors: string[] = [];
  for (const fact of facts) {
    if (!fact.id || factIds.has(fact.id) || !topics.includes(fact.topic) ||
        !['UK', 'USA'].includes(fact.country) ||
        !['Foundation', 'Challenge'].includes(fact.difficulty) ||
        !fact.explanation.trim() || !fact.source.title.trim() ||
        !URL.canParse(fact.source.url) || new URL(fact.source.url).protocol !== 'https:' ||
        fact.variants.length < 2 || (fact.topic === 'Current Affairs' && !fact.eventDate)) {
      errors.push(`Invalid fact: ${fact.id}`);
    }
    factIds.add(fact.id);
    const prompts = new Set<string>();
    for (const variant of fact.variants) {
      const prompt = variant.prompt.trim().toLowerCase();
      const options = variant.options.map(option => option.trim().toLowerCase());
      if (!variant.id || variantIds.has(variant.id) || !prompt || prompts.has(prompt) ||
          options.length !== 4 || options.some(option => !option) || new Set(options).size !== 4 ||
          !Number.isInteger(variant.correct) || variant.correct < 0 || variant.correct > 3) {
        errors.push(`Invalid question: ${variant.id}`);
      }
      variantIds.add(variant.id);
      prompts.add(prompt);
    }
  }
  return errors;
}
