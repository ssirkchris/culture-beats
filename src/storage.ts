import { initialProgress, modes, topics, type Progress } from './model.ts';

let connection: Promise<IDBDatabase> | undefined;
function database() {
  return connection ??= new Promise((resolve, reject) => {
    const request = indexedDB.open('culture-beats', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('progress');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => { connection = undefined; reject(request.error); };
  });
}

export async function loadProgress(): Promise<Progress> {
  const db = await database();
  return new Promise((resolve, reject) => {
    const request = db.transaction('progress').objectStore('progress').get('student');
    request.onsuccess = () => resolve(request.result ?? initialProgress);
    request.onerror = () => reject(request.error);
  });
}

export async function updateProgress(change: (previous: Progress) => Progress): Promise<Progress> {
  const db = await database();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('progress', 'readwrite');
    const store = tx.objectStore('progress');
    const request = store.get('student');
    let next: Progress;
    request.onsuccess = () => {
      try {
        next = change(request.result ?? initialProgress);
        store.put(next, 'student');
      } catch (error) {
        tx.abort();
        reject(error);
      }
    };
    tx.oncomplete = () => resolve(next);
    tx.onabort = () => reject(tx.error ?? new Error('Storage transaction interrupted.'));
  });
}

const record = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value);
const identifier = (value: unknown) => typeof value === 'string' && /^[a-z0-9-]{1,120}$/i.test(value);

export function parseBackup(json: string): Progress {
  const data: unknown = JSON.parse(json);
  if (!record(data) || data.version !== 1 || !record(data.reminder) ||
      typeof data.reminder.enabled !== 'boolean' || typeof data.reminder.time !== 'string' ||
      !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(data.reminder.time) || !Array.isArray(data.sessions)) {
    throw new Error('Invalid backup');
  }
  const ids = new Set();
  for (const session of data.sessions) {
    if (!record(session) || !identifier(session.id) || ids.has(session.id) ||
        !modes.some(mode => mode === session.mode) ||
        (session.mode === 'All Topics' ? !topics.some(topic => topic === session.topic) : session.topic !== undefined) ||
        !Array.isArray(session.attempts) || session.attempts.length < 1 || session.attempts.length > 10) {
      throw new Error('Invalid session');
    }
    ids.add(session.id);
    const facts = new Set();
    for (const attempt of session.attempts) {
      if (!record(attempt) || !identifier(attempt.factId) || !identifier(attempt.variantId) ||
          facts.has(attempt.factId) || typeof attempt.correct !== 'boolean' ||
          typeof attempt.at !== 'number' || !Number.isSafeInteger(attempt.at) ||
          attempt.at < 0 || attempt.at > 8.64e15) throw new Error('Invalid answer history');
      facts.add(attempt.factId);
    }
  }
  return data as Progress;
}

export function exportProgress(data: Progress) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'culture-beats-progress.json';
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}
