// export default function convertToFormDataPatient(obj) {
//   const formData = new FormData();
//   for (const key in obj) {
//     if (
//       obj[key] === undefined ||
//       obj[key] === null ||
//       typeof obj[key] === "object" // skip file-like objects or complex structures
//     )
//       continue;
//     formData.append(key, obj[key]);
//   }
//   return formData;
// }

export default function convertToFormDataPatient(obj) {
  const formData = new FormData();
  for (const key in obj) {
    const value = obj[key];

    if (value === undefined || value === null) continue;

    if (Array.isArray(value)) {
      formData.append(key, JSON.stringify(value));
      continue;
    }

    if (typeof value === "object") continue;

    formData.append(key, value);
  }
  return formData;
}
