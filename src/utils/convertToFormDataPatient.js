export default function convertToFormDataPatient(obj) {
  const formData = new FormData();
  for (const key in obj) {
    if (
      obj[key] === undefined ||
      obj[key] === null ||
      typeof obj[key] === "object" // skip file-like objects or complex structures
    )
      continue;
    formData.append(key, obj[key]);
  }
  return formData;
}