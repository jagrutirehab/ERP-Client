function dataURLtoBlob(dataURL) {
  // Split the data URL into two parts: metadata and data
  const parts = dataURL.split(";base64,");
  const contentType = parts[0].split(":")[1];
  const raw = window.atob(parts[1]);
  const rawLength = raw.length;

  // Create a new Uint8Array with the raw binary data
  const uInt8Array = new Uint8Array(rawLength);

  // Populate the Uint8Array with the binary data
  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }

  // Create a Blob with the binary data and specified content type
  return new Blob([uInt8Array], { type: contentType });
}

export default dataURLtoBlob;
