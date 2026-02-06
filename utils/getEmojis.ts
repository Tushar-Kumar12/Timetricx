// 🔹 1. Priority emojis (smile / laugh / emotions FIRST)
const PRIORITY_EMOJIS = [
  '😀','😁','😂','🤣','😃','😄','😅','😆','😉','😊',
  '😋','😎','😍','😘','🥰','😗','😙','😚','🙂','🤗',
  '🤩','🤔','🤨','😐','😑','😶','🙄','😏','😣','😥',
  '😮','🤐','😯','😪','😫','🥱','😴','😌','😛','😜',
  '😝','🤤','😒','😓','😔','😕','🙃','🫠','🫢','🤯',
  '😲','☹️','🙁','😖','😞','😟','😤','😢','😭','😦',
  '😧','😨','😩','😬','😰','😱','🥵','🥶','😳','🤪',
  '😵','😡','😠','🤬','😷','🤒','🤕','🤢','🤮','🤧',
  '😇','🥳','🥸','😈'
];

// 🔹 2. Unicode ranges (ALL emojis)
const RANGES: [number, number][] = [
  [0x1F300, 0x1F5FF],
  [0x1F600, 0x1F64F],
  [0x1F680, 0x1F6FF],
  [0x1F700, 0x1F77F],
  [0x1F780, 0x1F7FF],
  [0x1F800, 0x1F8FF],
  [0x1F900, 0x1F9FF],
  [0x1FA00, 0x1FAFF],
  [0x2600, 0x26FF],
  [0x2700, 0x27BF],
];

// 🔹 3. Generator (NO DUPLICATES)
const generateAllEmojis = (limit = 3000): string[] => {
  const set = new Set<string>();

  // First add priority emojis
  PRIORITY_EMOJIS.forEach(e => set.add(e));

  // Then add rest from Unicode
  for (const [start, end] of RANGES) {
    for (let code = start; code <= end; code++) {
      const ch = String.fromCodePoint(code);
      if (/\p{Emoji}/u.test(ch)) {
        set.add(ch);
        if (set.size >= limit) {
          return Array.from(set);
        }
      }
    }
  }

  return Array.from(set);
};

// 🔹 4. FINAL EXPORT (≈3000 emojis)
const emojis = generateAllEmojis(3000);

export default emojis;
export { emojis };
