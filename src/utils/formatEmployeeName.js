import { salutationOptions } from "../Components/constants/HR";

export const formatEmployeeName = (name, salutation) => {
  const label = salutationOptions.find((opt) => opt.value === salutation)?.label;
  return label ? `${label}. ${name || ""}` : name || "";
};
