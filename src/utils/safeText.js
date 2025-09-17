import { Text } from "@react-pdf/renderer";

export const safeText = (label, styles, ...values) => {
  const validValue = values.find(
    (v) =>
      v !== undefined &&
      v !== null &&
      v !== "" &&
      v.toLowerCase() !== "undefined"
  );
  if (!validValue) return null;
  return (
    <Text style={styles}>
      {label ? `${label} - ` : ""}
      {validValue}
    </Text>
  );
};
