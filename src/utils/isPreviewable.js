export const isPreviewable = (file, documentDate) => {
    if (!file?.url) return false;

    const url = file.url.toLowerCase();
    const ext = url.split(".").pop();

    const IMAGE_EXTS = ["png", "jpg", "jpeg", "webp"];
    if (IMAGE_EXTS.includes(ext)) return true;

    if (ext === "pdf") {
        if (!documentDate) return false;

        const CUTOFF = new Date("2025-12-30");
        return new Date(documentDate) >= CUTOFF;
    }

    return false;
};
