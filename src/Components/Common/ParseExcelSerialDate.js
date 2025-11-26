export const parseExcelSerialDate = (serial) => {
    if (typeof serial !== "number") return serial;
    const date = new Date(Math.round((serial - 25569) * 86400 * 1000));
    return date.toISOString().split("T")[0];
};