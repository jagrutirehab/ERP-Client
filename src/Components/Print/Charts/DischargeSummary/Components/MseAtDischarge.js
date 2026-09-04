import React from "react";
import { View, Text } from "@react-pdf/renderer";
import { MSE_FIELDS } from "./MSE_FIELDS";

const safeStyles = (styles) =>
  new Proxy(styles ?? {}, {
    get(target, key) {
      return target[key] ?? {};
    },
  });

const toDisplayText = (value) => {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value.trim();
  if (Array.isArray(value)) return value.filter(Boolean).join(", ").trim();
  if (typeof value === "object") return "";
  return String(value).trim();
};

const MseAtDischarge = ({ data, styles }) => {
  const s = safeStyles(styles);
  const mse = data?.mseDischarge ?? {};

  if (!Array.isArray(MSE_FIELDS) || !MSE_FIELDS.length) return null;

  const fields = MSE_FIELDS.map(({ key, label }) => ({
    key,
    label,
    value: toDisplayText(mse[key]),
  })).filter((field) => field.value);

  if (!fields.length) return null;

  return (
    <View style={{ ...s.marginBottom, marginTop: 20 }}>
      <Text style={s.fontSize13}>
        Patient Condition on Discharge: (MSE at Discharge)
      </Text>
      {fields.map(({ key, label, value }) => (
        <View key={key} style={{ ...s.checkBlock, ...s.paddingLeft5 }}>
          <View style={{ ...s.w30, ...s.row }}>
            <Text style={s.blackCircle}>{""}</Text>
            <Text style={s.fontSize11}>{`${label}-`}</Text>
          </View>
          <Text style={{ ...s.w70, ...s.fontSize11 }}>{value}</Text>
        </View>
      ))}
    </View>
  );
};

export default MseAtDischarge;
