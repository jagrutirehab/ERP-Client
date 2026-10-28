// Shrinks a photo in the browser before it is uploaded: the longest side is at most 1600 pixels and
// it is saved again as a JPEG (quality 0.8). Drawing it on a canvas also drops the hidden EXIF data
// (location, device). Nothing is sent anywhere here.

export const MAX_SIDE = 1600;
export const JPEG_QUALITY = 0.8;
export const MAX_BYTES = 5 * 1024 * 1024;

const decode = async (file) => {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file, { imageOrientation: "from-image" });
    } catch {
      /* try the next way */
    }
    try {
      return await createImageBitmap(file);
    } catch {
      /* try the next way */
    }
  }
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("decode"));
    };
    img.src = url;
  });
};

// Resolves to a JPEG Blob, or rejects with an Error whose message can be shown to the user
export const compressImage = async (file) => {
  if (!file) throw new Error("Choose a photo");
  const looksLikeImage = /^image\//i.test(file.type || "") || /\.(jpe?g|png|webp|heic|heif)$/i.test(file.name || "");
  if (!looksLikeImage) throw new Error("This file is not a photo. Choose a picture from your camera or gallery.");

  let img;
  try {
    img = await decode(file);
  } catch {
    throw new Error("This photo could not be read. Try another photo.");
  }
  const width = img.width || img.naturalWidth;
  const height = img.height || img.naturalHeight;
  if (!width || !height) throw new Error("This photo could not be read. Try another photo.");

  const scale = Math.min(1, MAX_SIDE / Math.max(width, height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("This photo could not be processed. Try another photo.");
  ctx.fillStyle = "#ffffff"; // JPEG has no transparency
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  if (typeof img.close === "function") img.close();

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY));
  if (!blob) throw new Error("This photo could not be processed. Try another photo.");
  if (blob.size > MAX_BYTES) throw new Error("This photo is still bigger than 5 MB after shrinking. Try a smaller picture.");
  return blob;
};
