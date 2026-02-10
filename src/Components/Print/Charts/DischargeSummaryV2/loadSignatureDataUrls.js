const isDataUrl = (value) =>
  typeof value === "string" && value.startsWith("data:image");

const toDataUrl = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

const fetchAsDataUrl = async (url) => {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    return await toDataUrl(blob);
  } catch {
    return null;
  }
};

export const loadSignatureDataUrls = async (patient) => {
  const doctorSig = patient?.doctorData?.signature;
  const psychologistSig = patient?.psychologistData?.signature;

  const doctor = isDataUrl(doctorSig)
    ? doctorSig
    : doctorSig
    ? await fetchAsDataUrl(doctorSig)
    : null;

  const psychologist = isDataUrl(psychologistSig)
    ? psychologistSig
    : psychologistSig
    ? await fetchAsDataUrl(psychologistSig)
    : null;

  return { doctor, psychologist };
};
