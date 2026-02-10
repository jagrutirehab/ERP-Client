
let cachedPdfMake = null;


export const getPdfMake = async () => {
  if (cachedPdfMake) return cachedPdfMake;

  const pdfMakeModule = await import("pdfmake/build/pdfmake");
  const pdfMake = pdfMakeModule.default || pdfMakeModule;

  cachedPdfMake = pdfMake;
  return pdfMake;
};

const toBase64 = (buffer) => {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;

  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode.apply(
      null,
      bytes.subarray(i, i + chunkSize)
    );
  }

  return btoa(binary);
};

const fetchFont = async (url) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to load font: ${url}`);
  }
  return toBase64(await res.arrayBuffer());
};

export const ensurePdfMakeFonts = async () => {
  const pdfMake = await getPdfMake();

  if (!pdfMake.vfs) {
    pdfMake.vfs = {};
  }

  const fonts = [
    ["Roboto-Bold.ttf", "/fonts/Roboto-Bold.ttf"],
    ["Roboto-Regular.ttf", "/fonts/Roboto-Regular.ttf"],
  ];

  await Promise.all(
    fonts.map(async ([name, path]) => {
      if (!pdfMake.vfs[name]) {
        pdfMake.vfs[name] = await fetchFont(path);
      }
    })
  );

  pdfMake.fonts = {
    ...(pdfMake.fonts || {}),
    HelveticaNeue: {
      normal: "Roboto-Regular.ttf",
      bold: "Roboto-Bold.ttf",
      italics: "Roboto-Regular.ttf",
      bolditalics: "Roboto-Bold.ttf",
    },
    Roboto: {
      normal: "Roboto-Bold.ttf",
      bold: "Roboto-Bold.ttf",
      italics: "Roboto-Bold.ttf",
      bolditalics: "Roboto-Bold.ttf",
    },
  };


  return pdfMake;
};
