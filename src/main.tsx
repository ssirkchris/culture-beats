import { StrictMode, useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { createRoot } from 'react-dom/client';
import { bank } from './bank.ts';
import { Icon } from './icon.tsx';
import { answerNotes, resultMessage, sessionQuote, welcomeMessage } from './voice.ts';
import { regionalTopics, stages, topics, timeZone, type Attempt, type Country, type Mode, type Progress, type Reminder, type Session, type Topic } from './model.ts';
import { indexAttempts, reviewState, selectCards, type Card } from './review.ts';
import { exportProgress, loadProgress, parseBackup, updateProgress } from './storage.ts';
import { pushConfigured, pushSupported, syncPush } from './push.ts';
import './style.css';

type Screen = 'home' | 'topics' | 'quiz' | 'result' | 'progress' | 'settings';
type Run = { session: Session; cards: Card[]; position: number; selected?: number; notes?: string[] };

const worker = import.meta.env.PROD && 'serviceWorker' in navigator
  ? navigator.serviceWorker.register(new URL('./sw.js', document.baseURI)).catch(() => undefined)
  : Promise.resolve(undefined);
const sessionDate = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeZone });

function App() {
  const [data, setData] = useState<Progress>();
  const [screen, setScreen] = useState<Screen>('home');
  const [run, setRun] = useState<Run>();
  const [notice, setNotice] = useState('');
  const [offlineReady, setOfflineReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [topicCountry, setTopicCountry] = useState<Country | 'Both'>('Both');
  const [imported, setImported] = useState<Progress>();

  useEffect(() => {
    loadProgress().then(setData, () => setNotice('Could not open your saved progress. Reload to try again.'));
    let mounted = true;
    worker.then(registration => {
      if (registration) void navigator.serviceWorker.ready.then(() => { if (mounted) setOfflineReady(true); });
    });
    return () => { mounted = false; };
  }, []);

  function go(next: Screen) {
    setScreen(next);
    setNotice('');
    setImported(undefined);
  }

  if (!data) return <main><h1>CULTURE//BEATS</h1><p role="status">{notice || 'Opening your practice…'}</p></main>;

  const history = indexAttempts(data.sessions);
  const stats = bank.map(fact => ({ fact, ...reviewState(history.get(fact.id) ?? []) }));
  const weak = stats.filter(stat => stat.weak).length;
  const mastered = stats.filter(stat => stat.mastered).length;
  const card = run?.cards[run.position];
  const welcome = screen === 'home' ? welcomeMessage(data.sessions) : undefined;
  const topicBank = topicCountry === 'Both' ? bank : bank.filter(fact => fact.country === topicCountry);
  const regionalCount = bank.filter(fact => regionalTopics.includes(fact.topic)).length;
  const quote = screen === 'result' && run ? sessionQuote(data.sessions, run.session.id) : undefined;

  function start(mode: Mode, topic?: Topic) {
    const country = mode === 'All Topics' && topicCountry !== 'Both' ? topicCountry : undefined;
    const cards = selectCards(mode === 'All Topics' ? topicBank : bank, data!.sessions, mode, topic);
    if (!cards.length) {
      setNotice('No weak spots yet. A missed answer will show up here.');
      return;
    }
    setRun({ cards, position: 0, session: { id: crypto.randomUUID(), mode, topic, country, attempts: [] } });
    go('quiz');
  }

  async function answer(selected: number) {
    if (!run || !card || run.selected !== undefined || busy) return;
    setBusy(true);
    setNotice('');
    const attempt: Attempt = {
      factId: card.fact.id, variantId: card.variant.id, correct: selected === card.variant.correct, at: Date.now(),
    };
    const session = { ...run.session, attempts: [...run.session.attempts, attempt] };
    try {
      let notes: string[] = [];
      setData(await updateProgress(previous => {
        const topicFacts = bank.filter(fact => fact.topic === card.fact.topic);
        notes = answerNotes(session.attempts, topicFacts, indexAttempts(previous.sessions));
        return {
          ...previous,
          sessions: [...previous.sessions.filter(item => item.id !== session.id), session],
        };
      }));
      setRun({ ...run, session, selected, notes });
    } catch {
      setNotice('Your answer could not be saved. Try again.');
    } finally {
      setBusy(false);
    }
  }

  async function saveName(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const displayName = String(new FormData(event.currentTarget).get('displayName') ?? '').trim();
    setBusy(true);
    try {
      setData(await updateProgress(previous => ({ ...previous, displayName: displayName || undefined })));
      setNotice('Name saved on this device.');
    } catch {
      setNotice('Could not save your name. Try again.');
    } finally {
      setBusy(false);
    }
  }

  async function saveReminder(reminder: Reminder) {
    setBusy(true);
    try {
      setData(await updateProgress(previous => ({ ...previous, reminder })));
      const registration = await worker;
      if (registration && pushConfigured) await syncPush(registration, reminder);
      setNotice('Reminder preference saved.');
    } catch {
      setNotice('Could not finish updating the reminder. Check the connection and try again.');
    } finally {
      setBusy(false);
    }
  }

  async function enablePush() {
    setBusy(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setNotice('Notifications need permission in your device settings.');
        return;
      }
      const registration = await worker;
      if (!registration?.active) {
        setNotice('Wait until offline setup finishes, then try again.');
        return;
      }
      const enabled = await syncPush(registration, data!.reminder, true);
      setNotice(enabled ? 'Daily notifications are connected.' : 'Notifications are unavailable on this device.');
    } catch {
      setNotice('Could not connect notifications. Try again when you are online.');
    } finally {
      setBusy(false);
    }
  }

  async function readBackup(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      setImported(parseBackup(await file.text()));
      setNotice('');
    } catch {
      setImported(undefined);
      setNotice('This file is not a valid CULTURE//BEATS backup.');
    }
  }

  async function mergeBackup() {
    if (!imported) return;
    setBusy(true);
    try {
      setData(await updateProgress(previous => {
        const sessions = new Map(previous.sessions.map(session => [session.id, session]));
        for (const session of imported.sessions) {
          if ((sessions.get(session.id)?.attempts.length ?? 0) < session.attempts.length) sessions.set(session.id, session);
        }
        return { ...previous, sessions: [...sessions.values()] };
      }));
      setImported(undefined);
      setNotice('Practice history imported.');
    } catch {
      setNotice('Could not import practice history. Try again.');
    } finally {
      setBusy(false);
    }
  }

  return <main>
    <header className="masthead">
      <button className="wordmark" disabled={busy} onClick={() => go('home')}>CULTURE<span>//</span>BEATS</button>
      <button className="icon" disabled={busy} onClick={() => go('settings')} aria-label="Settings" aria-current={screen === 'settings' ? 'page' : undefined}><Icon name="settings" /></button>
    </header>
    <section key={screen} className="content" aria-label={screen === 'home' ? 'Practice' : screen}>
      {screen === 'home' && <>
        <p className="eyebrow">UK + USA CULTURE</p>
        <h1>{data.displayName ? `Ready, ${data.displayName}?` : 'Ready to practise?'}</h1>
        {welcome && <p className="welcome">{welcome}</p>}
        <button className="feature tile" onClick={() => start('Daily Practice')}>
          <strong><Icon name="practice" />Daily Practice</strong><span>10 questions picked for you</span>
        </button>
        <button className="tile regional" onClick={() => start('Regional Practice')}>
          <strong><Icon name="topics" />Regional Practice</strong>
          <span>10 questions across Stage II · {regionalCount} facts</span>
        </button>
        <div className="grid">
          <button className="tile" onClick={() => go('topics')}><strong><Icon name="topics" />All Topics</strong><span>{topics.length} topics · {bank.length} facts</span></button>
          <button className="tile" onClick={() => start('Weak Spots')}><strong><Icon name="review" />Weak Spots</strong><span>{weak} to revisit</span></button>
        </div>
        <button className="tile progress-link" onClick={() => go('progress')}><strong><Icon name="progress" />My Progress</strong><span>{mastered} of {bank.length} facts mastered</span></button>
        {offlineReady && <p className="muted offline">Available offline</p>}
      </>}
      {screen === 'topics' && <>
        <h1>All Topics</h1>
        <label className="topic-filter">
          Country
          <select value={topicCountry} onChange={event => setTopicCountry(event.target.value as Country | 'Both')}>
            <option value="Both">UK + USA</option>
            <option value="UK">United Kingdom</option>
            <option value="USA">United States</option>
          </select>
        </label>
        {stages.map(stage => <section key={stage.title}>
          <h2>{stage.title}</h2>
          <div className="topic-list">{stage.topics.map(topic => {
            const count = topicBank.filter(fact => fact.topic === topic).length;
            return <button className="tile row" key={topic} disabled={!count} onClick={() => start('All Topics', topic)}>
              <strong>{topic}</strong><span>{count} {count === 1 ? 'fact' : 'facts'}</span>
            </button>;
          })}</div>
        </section>)}
      </>}
      {screen === 'quiz' && run && card && <>
        <p className="eyebrow">{run.session.topic ?? run.session.mode} · {run.position + 1} / {run.cards.length}</p>
        <progress value={run.position + 1} max={run.cards.length} aria-label="Quiz progress" />
        <p className="muted">{card.fact.topic} · {card.fact.country} · {card.fact.difficulty}</p>
        <h1 className="question">{card.variant.prompt}</h1>
        <div className="answers">{card.order.map(index => {
          const answered = run.selected !== undefined;
          const verdict = answered && index === card.variant.correct ? ' correct' : answered && index === run.selected ? ' incorrect' : '';
          return <button className={'option' + verdict} key={index} disabled={answered || busy} onClick={() => void answer(index)}>
            {card.variant.options[index]}{verdict === ' correct' ? ' ✓' : verdict === ' incorrect' ? ' ✕' : ''}
          </button>;
        })}</div>
        {run.selected !== undefined && <>
          <div className="feedback" role="status">
            <strong>{run.selected === card.variant.correct ? 'Correct.' : 'Good one to revisit.'}</strong>
            <p>{card.fact.explanation}</p>
            <a href={card.fact.source.url} target="_blank" rel="noreferrer">{card.fact.source.title} ↗</a>
            {run.notes?.map(note => <p className="answer-note" key={note}>{note}</p>)}
          </div>
          <button className="primary" onClick={() => {
            if (run.position + 1 === run.cards.length) go('result');
            else setRun({ ...run, position: run.position + 1, selected: undefined, notes: undefined });
            window.scrollTo(0, 0);
          }}>{run.position + 1 === run.cards.length ? 'See results' : 'Next question'} →</button>
        </>}
      </>}
      {screen === 'result' && run && <>
        <p className="eyebrow">{run.session.topic ?? run.session.mode}</p>
        <h1>Set complete.</h1>
        <p className="score">{run.session.attempts.filter(item => item.correct).length} / {run.cards.length}</p>
        <p className="result-line">{resultMessage(run.session.attempts)}</p>
        {quote && <figure className="artist-quote">
          <Icon name="quote" />
          <blockquote>“{quote.words}”</blockquote>
          <figcaption>{quote.artist} · {quote.source}</figcaption>
        </figure>}
        <button className="primary" onClick={() => go('home')}>Back to practice</button>
      </>}
      {screen === 'progress' && <>
        <h1>My Progress</h1>
        <p className="score">{mastered} / {bank.length}</p>
        <p>Facts mastered · three correct answers in a row</p>
        <h2>By topic</h2>
        <ul>{topics.map(topic => {
          const subset = stats.filter(stat => stat.fact.topic === topic);
          return <li className="row" key={topic}><span>{topic}</span><strong>{subset.filter(stat => stat.mastered).length} / {subset.length}</strong></li>;
        })}</ul>
        <h2>Session history</h2>
        {!data.sessions.length && <p className="muted">Your first session will appear here.</p>}
        <ul>{[...data.sessions].sort((a, b) => b.attempts.at(-1)!.at - a.attempts.at(-1)!.at).map(session =>
          <li className="row" key={session.id}><span>{session.topic ?? session.mode}{session.country ? ` · ${session.country}` : ''}<small>{sessionDate.format(session.attempts[0].at)}</small></span>
            <strong>{session.attempts.filter(attempt => attempt.correct).length} / {session.attempts.length}</strong></li>)}</ul>
      </>}
      {screen === 'settings' && <>
        <h1>Settings</h1>
        <h2>Profile</h2>
        <form className="profile-form" onSubmit={event => void saveName(event)}>
          <label htmlFor="display-name">What should we call you?</label>
          <div>
            <input id="display-name" name="displayName" defaultValue={data.displayName ?? ''}
              maxLength={30} autoComplete="given-name" disabled={busy} />
            <button className="secondary" disabled={busy}>Save name</button>
          </div>
        </form>
        <h2>Reminders</h2>
        <label className="row"><span>Daily reminder</span><input type="checkbox" checked={data.reminder.enabled} disabled={busy} onChange={event => void saveReminder({ ...data.reminder, enabled: event.target.checked })} /></label>
        <label className="row"><span>Reminder time</span><input type="time" required value={data.reminder.time} disabled={busy} onChange={event => { if (event.target.value) void saveReminder({ ...data.reminder, time: event.target.value }); }} /></label>
        <p className="muted">Warsaw time · every day, including weekends</p>
        {pushConfigured && pushSupported() ?
          <button className="secondary" disabled={busy || !data.reminder.enabled || !offlineReady} onClick={() => void enablePush()}>Connect notifications</button> :
          <p className="muted">{pushConfigured ? 'Open the installed app on your Home Screen to connect notifications.' : 'Notification delivery is unavailable in this build.'}</p>}
        <h2>Practice history</h2>
        <div className="grid">
          <button className="secondary" disabled={busy} onClick={() => exportProgress(data)}>Export backup</button>
          <label className="secondary upload">Import backup<input type="file" accept=".json,application/json" disabled={busy} onChange={event => void readBackup(event)} /></label>
        </div>
        {imported && <p><button className="secondary" disabled={busy} onClick={() => void mergeBackup()}>Merge {imported.sessions.length} sessions</button></p>}
      </>}
      {notice && <p className="notice" role="status">{notice}</p>}
    </section>
    <nav aria-label="Main navigation">
      <button disabled={busy} aria-current={screen === 'home' ? 'page' : undefined} onClick={() => go('home')}>Practice</button>
      <button disabled={busy} aria-current={screen === 'topics' ? 'page' : undefined} onClick={() => go('topics')}>Topics</button>
      <button disabled={busy} aria-current={screen === 'progress' ? 'page' : undefined} onClick={() => go('progress')}>Progress</button>
    </nav>
  </main>;
}

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
