const EVENT_NAME = "trainer-video-change";

export const emitTrainerVideoChange = (recordId) => {
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { recordId } }));
};

export const onTrainerVideoChange = (callback) => {
  const handler = (event) => callback(event.detail?.recordId);
  window.addEventListener(EVENT_NAME, handler);
  return () => window.removeEventListener(EVENT_NAME, handler);
};
