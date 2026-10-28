// The filtering used by the searchable category picker (kept free of React so it can be tested on its own).
// "chair off" finds "Office Chair": every typed word must appear somewhere in the name, in any order,
// ignoring capital letters and extra spaces. Names that START with the typed text come first.

export const normalise = (text) =>
  String(text ?? "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

// options: [{ value, label }]. Returns { shown, total } where shown is at most `limit` matches.
export const filterOptions = (options, query, limit = 100) => {
  const words = normalise(query).split(" ").filter(Boolean);
  if (words.length === 0) return { shown: options.slice(0, limit), total: options.length };

  const matches = [];
  for (const opt of options) {
    const name = normalise(opt.label);
    if (words.every((w) => name.includes(w))) {
      matches.push({ opt, starts: name.startsWith(words[0]) ? 0 : 1 });
    }
  }
  matches.sort((a, b) => a.starts - b.starts || String(a.opt.label).localeCompare(String(b.opt.label)));
  return { shown: matches.slice(0, limit).map((m) => m.opt), total: matches.length };
};
