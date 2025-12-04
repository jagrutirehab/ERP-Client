export const convertSnakeToTitle = (str) => {
    if (!str) return "";

    if (Array.isArray(str)) {
        return str.map(item => convertSnakeToTitle(item)).join(", ");
    }

    if (typeof str !== "string") return String(str);

    return str
        .split("_")
        .filter(Boolean)
        .map(word => {
            word = word.replace(/-/g, " - ");

            return word
                .split(" ")
                .filter(Boolean)
                .map(w => w.charAt(0).toUpperCase() + w.slice(1))
                .join(" ");
        })
        .join(" ");
}