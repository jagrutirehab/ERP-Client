export const formatCurrency = (
    value,
    {
        locale = "en-IN",
        currency = "INR",
        minimumFractionDigits = 2,
        maximumFractionDigits = 2,
    } = {}
) => {
    if (value === null || value === undefined || isNaN(value)) {
        return "₹0.00";
    }

    return Number(value).toLocaleString(locale, {
        style: "currency",
        currency,
        minimumFractionDigits,
        maximumFractionDigits,
    });
};
