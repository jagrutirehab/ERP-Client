const READ_TIMEOUT_MS = 15000;

export const readMediaDuration = (file, kind) =>
  new Promise((resolve, reject) => {
    const element = document.createElement(kind === "video" ? "video" : "audio");
    const objectUrl = URL.createObjectURL(file);
    let settled = false;

    const finish = (callback) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      element.removeAttribute("src");
      element.load();
      URL.revokeObjectURL(objectUrl);
      callback();
    };

    const timer = setTimeout(
      () => finish(() => reject(new Error("timeout"))),
      READ_TIMEOUT_MS,
    );

    element.preload = "metadata";
    element.onloadedmetadata = () => {
      const duration = element.duration;
      finish(() =>
        Number.isFinite(duration) && duration > 0
          ? resolve(duration)
          : reject(new Error("invalid duration")),
      );
    };
    element.onerror = () => finish(() => reject(new Error("unreadable")));
    element.src = objectUrl;
  });
