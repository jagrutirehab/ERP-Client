import { normalizeUnderscores } from "./normalizeUnderscore";
import { pluralizeUnit } from "./pluralizeUnit";
import { formatTwoDecimals } from "./numberFormat";

// Converts a raw stored stock value to its base-unit equivalent for
// LIQUID_FORM medicines (mirrors toBaseUnitStock on the backend); returns the
// value unchanged for every other form, since those already store base units.
export const toBaseUnitStock = (stock, medicine) => {
    const purchaseQty = medicine?.conversion?.purchaseQuantity;
    const baseQty = medicine?.conversion?.baseQuantity;
    const storedStock = Number(stock) || 0;
    if (medicine?.form !== "LIQUID_FORM" || !purchaseQty || !baseQty) {
        return storedStock;
    }
    return (storedStock * baseQty) / purchaseQty;
};

// For LIQUID_FORM medicines, Pharmacy stock is stored in the purchase unit
// (e.g. bottle count, as a running fraction once a bottle has been partially
// dispensed/returned/transferred) rather than the base unit — every other
// form stores stock directly in the base unit, so `stock` must be the raw
// value as stored on the center (see stockBuffer.helper.js on the backend).
//
// Returns the combined "purchase unit: base unit" display string for liquids,
// or null for every other form/missing conversion — callers fall back to
// their own plain-stock rendering in that case.
export const formatDualUnitStock = (stock, medicine) => {
    const purchaseQty = medicine?.conversion?.purchaseQuantity;
    const baseQty = medicine?.conversion?.baseQuantity;
    if (medicine?.form !== "LIQUID_FORM" || !purchaseQty || !baseQty) {
        return null;
    }
    const storedStock = Number(stock) || 0;
    const baseUnitStock = (storedStock * baseQty) / purchaseQty;
    return `${formatTwoDecimals(storedStock)} ${pluralizeUnit(normalizeUnderscores(medicine.purchaseUnit))}: ${formatTwoDecimals(baseUnitStock)} ${normalizeUnderscores(medicine.baseUnit)}`;
};
