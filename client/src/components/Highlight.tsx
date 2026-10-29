import { highlightPattern } from '../utils/format';

/** Zeigt Text an und markiert darin die Suchwörter mit <mark>. */
export default function Highlight({ text, words }: { text: string; words: string[] }) {
  const pattern = highlightPattern(words);
  if (!pattern) return <>{text}</>;
  // split() mit Klammergruppe: ungerade Indizes sind die Treffer.
  return <>{text.split(pattern).map((part, i) => (i % 2 === 1 ? <mark key={i}>{part}</mark> : part))}</>;
}
