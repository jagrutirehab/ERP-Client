
export const pluralizeUnit = (unit) => {
    if (!unit) return "";
    const u = String(unit).trim();
    if (u.toLowerCase().endsWith("(s)")) return u;
    return `${u} (s)`;
};
