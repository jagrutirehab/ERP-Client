export const parseSubmodule = (name, prefix = "") => {
  let key = prefix ? name.replace(prefix, "") : name;
  return key.charAt(0) + key.slice(1).toLowerCase();
};