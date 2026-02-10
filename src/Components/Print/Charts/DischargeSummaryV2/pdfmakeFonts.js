import pdfMakeImport from "pdfmake/build/pdfmake";
import HelveticaNeueMedium from "../../../../assets/fonts/Helvetica-Neue-Medium.ttf";
import HelveticaNeueBold from "../../../../assets/fonts/Helvetica-Neue-Bold.ttf";
import RobotoBold from "../../../../assets/fonts/Roboto-Bold.ttf";
import TiroDevanagariHindi from "../../../../assets/fonts/TiroDevanagariHindi-Regular.ttf";
import TiroDevanagariMarathi from "../../../../assets/fonts/TiroDevanagariMarathi-Regular.ttf";

const getPdfMake = () => {
  if (pdfMakeImport?.createPdf) return pdfMakeImport;
  if (pdfMakeImport?.default?.createPdf) return pdfMakeImport.default;
  if (typeof window !== "undefined" && window.pdfMake) return window.pdfMake;
  return null;
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
  const buffer = await res.arrayBuffer();
  return toBase64(buffer);
};

export const ensurePdfMakeFonts = async () => {
  const pdfMake = getPdfMake();
  if (!pdfMake) {
    throw new Error("pdfMake not available");
  }

  if (!pdfMake.vfs) {
    pdfMake.vfs = {};
  }

  const hasHelveticaMed = pdfMake.vfs["Helvetica-Neue-Medium.ttf"];
  const hasHelveticaBold = pdfMake.vfs["Helvetica-Neue-Bold.ttf"];
  const hasRobotoBold = pdfMake.vfs["Roboto-Bold.ttf"];
  const hasHindi = pdfMake.vfs["TiroDevanagariHindi-Regular.ttf"];
  const hasMarathi = pdfMake.vfs["TiroDevanagariMarathi-Regular.ttf"];

  if (
    !hasHelveticaMed ||
    !hasHelveticaBold ||
    !hasRobotoBold ||
    !hasHindi ||
    !hasMarathi
  ) {
    const [helvMed, helvBold, robotoBold, hindi, marathi] = await Promise.all([
      hasHelveticaMed ? null : fetchFont(HelveticaNeueMedium),
      hasHelveticaBold ? null : fetchFont(HelveticaNeueBold),
      hasRobotoBold ? null : fetchFont(RobotoBold),
      hasHindi ? null : fetchFont(TiroDevanagariHindi),
      hasMarathi ? null : fetchFont(TiroDevanagariMarathi),
    ]);
    if (helvMed) {
      pdfMake.vfs["Helvetica-Neue-Medium.ttf"] = helvMed;
    }
    if (helvBold) {
      pdfMake.vfs["Helvetica-Neue-Bold.ttf"] = helvBold;
    }
    if (robotoBold) {
      pdfMake.vfs["Roboto-Bold.ttf"] = robotoBold;
    }
    if (hindi) {
      pdfMake.vfs["TiroDevanagariHindi-Regular.ttf"] = hindi;
    }
    if (marathi) {
      pdfMake.vfs["TiroDevanagariMarathi-Regular.ttf"] = marathi;
    }
  }

  pdfMake.fonts = {
    ...(pdfMake.fonts || {}),
    HelveticaNeue: {
      normal: "Helvetica-Neue-Medium.ttf",
      bold: "Roboto-Bold.ttf",
      italics: "Helvetica-Neue-Medium.ttf",
      bolditalics: "Roboto-Bold.ttf",
    },
    Hindi: {
      normal: "TiroDevanagariHindi-Regular.ttf",
      bold: "TiroDevanagariHindi-Regular.ttf",
      italics: "TiroDevanagariHindi-Regular.ttf",
      bolditalics: "TiroDevanagariHindi-Regular.ttf",
    },
    Marathi: {
      normal: "TiroDevanagariMarathi-Regular.ttf",
      bold: "TiroDevanagariMarathi-Regular.ttf",
      italics: "TiroDevanagariMarathi-Regular.ttf",
      bolditalics: "TiroDevanagariMarathi-Regular.ttf",
    },
  };

  return pdfMake;
};

export { getPdfMake };
