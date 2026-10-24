import React from "react";
import { View, Text } from "@react-pdf/renderer";
import { MSE_FIELDS } from "./MSE_FIELDS";

const clean = (value) => {
  if (value == null) return "";
  let str = String(value)
    .replace(/[\u2010-\u2015\u2212]/g, "-")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/[\u00A0\u2000-\u200A\u202F\u205F\u3000]/g, " ")
    .replace(/[\u200E\u200F\u202A-\u202E\u2066-\u2069]/g, "")
    .replace(/\u00AD/g, "")
    .trim();
  str = str.replace(/\S{40,}/g, (word) => word.replace(/(.{40})/g, "$1\u200B"));
  return str;
};

const toDisplayText = (value) => {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return clean(value);
  if (Array.isArray(value))
    return value.filter(Boolean).map(clean).join(", ").trim();
  if (typeof value === "object") return "";
  return clean(String(value));
};

const MseAtDischarge = ({ data, styles = {} }) => {
  const mse = data?.mseDischarge ?? {};

  if (!Array.isArray(MSE_FIELDS) || !MSE_FIELDS.length) return null;

  const fields = MSE_FIELDS.map(({ key, label }) => ({
    key,
    label,
    value: toDisplayText(mse[key]),
  })).filter((field) => field.value);

  if (!fields.length) return null;

  return (
    <View style={{ ...(styles.marginBottom ?? {}), marginTop: 20 }}>
      <Text style={styles.fontSize13 ?? {}}>
        Patient Condition on Discharge: (MSE at Discharge)
      </Text>
      {fields.map(({ key, label, value }) => (
        <View
          key={key}
          style={{
            ...(styles.checkBlock ?? {}),
            ...(styles.paddingLeft5 ?? {}),
          }}
        >
          <View style={{ ...(styles.w30 ?? {}), ...(styles.row ?? {}) }}>
            <Text style={styles.blackCircle ?? {}}>{""}</Text>
            <Text style={styles.fontSize13 ?? {}}>{`${label}-`}</Text>
          </View>
          <Text style={styles.w70 ?? {}}>{value}</Text>
        </View>
      ))}
    </View>
  );
};

export default MseAtDischarge;
