const strokes = {
  practice: 'M3 12h3l3-7 5 14 3-7h4',
  topics: 'M3 4h7v7H3z M14 4h7v7h-7z M3 15h7v5H3z M14 15h7v5h-7z',
  review: 'M3 5v5h5 M3.5 10a8.5 8.5 0 1 1 1.8 8',
  progress: 'M3 3v17h18 M7 15l4-4 3 2 6-7 M15 6h5v5',
  settings: 'M4 6h6m4 0h6 M4 12h11m4 0h1 M4 18h2m4 0h10 M10 4v4 M15 10v4 M6 16v4',
  quote: 'M10 5C6 6 4 9 4 13v5h6v-6H5 M20 5c-4 1-6 4-6 8v5h6v-6h-5',
} as const;

export function Icon({ name }: { name: keyof typeof strokes }) {
  return <svg className="section-icon" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"
    aria-hidden="true" focusable="false">
    <path d={strokes[name]} />
  </svg>;
}
