// import React, { useEffect, useState, useRef } from "react";
// import { Button, Alert } from "reactstrap";

// const AudioRecorder = ({ onReady }) => {
//   const [isRecording, setIsRecording] = useState(false);
//   const [error, setError] = useState("");
//   const [previewUrl, setPreviewUrl] = useState("");

//   const mediaRecorderRef = useRef(null);
//   const audioChunksRef = useRef([]);
//   const canvasRef = useRef(null);
//   const analyserRef = useRef(null);
//   const audioContextRef = useRef(null);
//   const animationRef = useRef(null);

//   useEffect(() => {
//     const initRecording = async () => {
//       try {
//         const devices = await navigator.mediaDevices.enumerateDevices();
//         const hasMic = devices.some((d) => d.kind === "audioinput");
//         if (!hasMic) {
//           setError("No microphone detected.");
//           return;
//         }
//         const stream = await navigator.mediaDevices.getUserMedia({
//           audio: {
//             echoCancellation: true,
//             noiseSuppression: true,
//             autoGainControl: true,
//           },
//         });

//         mediaRecorderRef.current = new MediaRecorder(stream);

//         mediaRecorderRef.current.ondataavailable = (event) => {
//           if (event.data.size > 0) audioChunksRef.current.push(event.data);
//         };

//         // create File when stopped
//         mediaRecorderRef.current.onstop = () => {
//           const file = buildAndSendFile();

//           if (onReady && file) {
//             onReady(file, null);
//           }
//         };

//         audioContextRef.current = new (window.AudioContext ||
//           window.webkitAudioContext)();
//         const source = audioContextRef.current.createMediaStreamSource(stream);

//         const highpass = audioContextRef.current.createBiquadFilter();
//         highpass.type = "highpass";
//         highpass.frequency.value = 100;

//         const compressor = audioContextRef.current.createDynamicsCompressor();
//         compressor.threshold.setValueAtTime(
//           -50,
//           audioContextRef.current.currentTime
//         );
//         compressor.knee.setValueAtTime(40, audioContextRef.current.currentTime);
//         compressor.ratio.setValueAtTime(
//           12,
//           audioContextRef.current.currentTime
//         );
//         compressor.attack.setValueAtTime(
//           0,
//           audioContextRef.current.currentTime
//         );
//         compressor.release.setValueAtTime(
//           0.25,
//           audioContextRef.current.currentTime
//         );

//         const gainNode = audioContextRef.current.createGain();
//         gainNode.gain.value = 1.2;

//         analyserRef.current = audioContextRef.current.createAnalyser();
//         analyserRef.current.fftSize = 256;

//         source.connect(highpass);
//         highpass.connect(compressor);
//         compressor.connect(gainNode);
//         gainNode.connect(analyserRef.current);

//         drawVisualizer();
//         handleStart();
//       } catch (err) {
//         console.error(err);
//         setError("Microphone access denied or unavailable.");
//       }
//     };

//     initRecording();

//     return () => {
//       if (
//         mediaRecorderRef.current &&
//         mediaRecorderRef.current.state !== "inactive"
//       ) {
//         mediaRecorderRef.current.stop();
//       }
//       cancelAnimationFrame(animationRef.current);
//       if (audioContextRef.current) audioContextRef.current.close();
//     };
//   }, []);

//   // const buildAndSendFile = () => {
//   //   if (audioChunksRef.current.length === 0) return;

//   //   const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
//   //   const file = new File([audioBlob], "recording.webm", {
//   //     type: "audio/webm",
//   //   });

//   //   // update preview
//   //   const url = URL.createObjectURL(audioBlob);
//   //   setPreviewUrl(url);

//   //   // send file to parent
//   //   if (onReady) onReady(file);
//   // };

//   const buildAndSendFile = () => {
//     if (audioChunksRef.current.length === 0) return null;

//     const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
//     const file = new File([audioBlob], "recording.webm", {
//       type: "audio/webm",
//     });

//     const url = URL.createObjectURL(audioBlob);
//     setPreviewUrl(url);

//     return file;
//   };

//   const drawVisualizer = () => {
//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext("2d");
//     const bufferLength = analyserRef.current.frequencyBinCount;
//     const dataArray = new Uint8Array(bufferLength);

//     const draw = () => {
//       animationRef.current = requestAnimationFrame(draw);
//       analyserRef.current.getByteFrequencyData(dataArray);

//       ctx.clearRect(0, 0, canvas.width, canvas.height);

//       const barWidth = (canvas.width / bufferLength) * 2.5;
//       let x = 0;

//       for (let i = 0; i < bufferLength; i++) {
//         const barHeight = dataArray[i];
//         ctx.fillStyle = `rgba(100, 180, 255, 0.9)`;
//         ctx.fillRect(x, canvas.height - barHeight / 2, barWidth, barHeight / 2);
//         x += barWidth + 1;
//       }
//     };

//     draw();
//   };

//   const handleStart = () => {
//     if (mediaRecorderRef.current) {
//       audioChunksRef.current = [];
//       mediaRecorderRef.current.start(1000);
//       setIsRecording(true);
//     }

//     const MAX_DURATION = 30 * 60 * 1000;
//     // const MAX_DURATION = 20000;

//     setTimeout(() => {
//       if (mediaRecorderRef.current?.state === "recording") {
//         mediaRecorderRef.current.requestData();
//         mediaRecorderRef.current.stop();
//         setIsRecording(false);
//       }
//     }, MAX_DURATION);

//   };

//   const handlePause = () => {
//     if (mediaRecorderRef.current?.state === "recording") {
//       mediaRecorderRef.current.pause();
//       setIsRecording(false);
//       mediaRecorderRef.current.requestData();

//       // immediately build file on pause
//       setTimeout(() => {
//         buildAndSendFile();
//       }, 200);
//     }
//   };

//   const handleResume = async () => {
//     if (mediaRecorderRef.current?.state === "paused") {
//       if (audioContextRef.current?.state === "suspended") {
//         await audioContextRef.current.resume();
//       }
//       mediaRecorderRef.current.resume();
//       setIsRecording(true);
//     }
//   };

//   const stopAndFinalize = () => {
//     return new Promise((resolve) => {
//       if (!mediaRecorderRef.current) return resolve(null);

//       if (mediaRecorderRef.current.state !== "inactive") {

//         mediaRecorderRef.current.requestData(); // VERY IMPORTANT

//         mediaRecorderRef.current.onstop = () => {
//           const file = buildAndSendFile();
//           resolve(file);
//         };

//         mediaRecorderRef.current.stop();
//       } else {
//         resolve(null);
//       }
//     });
//   };
//   // expose it to parent
//   useEffect(() => {
//     if (onReady) {
//       onReady(null, stopAndFinalize);
//     }
//   }, []);

//   return (
//     <div className="my-3">
//       {error && <Alert color="danger">{error}</Alert>}

//       <div className="d-flex gap-2 mb-2">
//         <Button
//           color="warning"
//           onClick={handlePause}
//           disabled={!isRecording || !!error}
//         >
//           Pause & Preview
//         </Button>
//         <Button
//           color="success"
//           onClick={handleResume}
//           disabled={isRecording || !!error}
//         >
//           Resume
//         </Button>
//       </div>

//       <canvas
//         ref={canvasRef}
//         width={400}
//         height={100}
//         style={{
//           background: "transparent",
//           borderRadius: "8px",
//           width: "100%",
//           display: isRecording ? "block" : "none",
//         }}
//       />

//       {previewUrl && !isRecording && (
//         <audio
//           controls
//           autoPlay
//           src={previewUrl}
//           style={{ marginTop: "10px" }}
//         />
//       )}
//     </div>
//   );
// };

// export default AudioRecorder;

// /* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, useRef } from "react";
import { Button, Alert, Spinner } from "reactstrap";

const DB_NAME = "AudioRecordingDB";
const STORE_NAME = "chunks";

const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { autoIncrement: true });
      }
    };
    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject(e.target.error);
  });
};

const saveChunkToDB = async (db, chunk) => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.add(chunk);
    request.onsuccess = () => resolve();
    request.onerror = (e) => reject(e.target.error);
  });
};

const getAllChunksFromDB = async (db) => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject(e.target.error);
  });
};

const clearDB = async (db) => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.clear();
    request.onsuccess = () => resolve();
    request.onerror = (e) => reject(e.target.error);
  });
};

// Detect iOS once at module level (navigator is always available in browser)
const isIOS =
  /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

const AudioRecorder = ({ onReady }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState("");
  // Non-fatal informational messages (e.g. iOS pause not supported)
  const [warn, setWarn] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  // Tracks the actual MIME type of the last built preview so <source> is correct
  const [previewMimeType, setPreviewMimeType] = useState("audio/mp4");
  const [duration, setDuration] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const previewUrlRef = useRef("");

  const mediaRecorderRef = useRef(null);
  const timerRef = useRef(null);
  const audioChunksRef = useRef([]);
  const dbRef = useRef(null);
  const pendingWritesRef = useRef(0);
  const stopResolveRef = useRef(null);
  const canvasRef = useRef(null);
  const analyserRef = useRef(null);
  const audioContextRef = useRef(null);
  const animationRef = useRef(null);
  // Stores the actual MIME type used by the MediaRecorder instance
  const mimeTypeRef = useRef("");
  // Ref-copy of isRecording for use inside event handler closures (avoids stale state)
  const isRecordingRef = useRef(false);
  // Interval that manually calls requestData() on iOS where timeslice is unreliable
  const requestDataIntervalRef = useRef(null);
  // True while iOS soft-pause is active; prevents onstop from calling onReady
  const iosPauseRef = useRef(false);
  // Lock to prevent concurrent buildAndSendFile() calls racing on URL/state
  const isBuildingFileRef = useRef(false);
  // Ref to the non-iOS pause preview-build timeout so it can be cancelled
  const previewBuildTimeoutRef = useRef(null);
  // Ref to the 2-hour auto-stop timeout so it can be cancelled on unmount
  const maxDurationTimerRef = useRef(null);
  // Ref to the visibilitychange handler so it can be removed on unmount
  const visibilityHandlerRef = useRef(null);

  useEffect(() => {
    const initRecording = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const hasMic = devices.some((d) => d.kind === "audioinput");
        if (!hasMic) {
          setError("No microphone detected.");
          return;
        }

        // MediaRecorder is unavailable in very old browsers (Firefox < 25,
        // Samsung Internet < 5, some older Android WebViews).
        if (typeof MediaRecorder === "undefined") {
          setError(
            "Audio recording is not supported in this browser. Please use Chrome, Firefox, or Safari 14.5+.",
          );
          return;
        }

        // Some older Android devices / budget phones reject specific constraints
        // with OverconstrainedError or NotFoundError. Fall back to plain audio.
        let stream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            },
          });
        } catch (constraintErr) {
          if (
            constraintErr.name === "OverconstrainedError" ||
            constraintErr.name === "NotFoundError"
          ) {
            stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          } else {
            throw constraintErr;
          }
        }

        let mimeType = "";

        if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
          mimeType = "audio/webm;codecs=opus";
        } else if (MediaRecorder.isTypeSupported("audio/webm")) {
          mimeType = "audio/webm";
        } else if (
          MediaRecorder.isTypeSupported("audio/mp4;codecs=mp4a.40.2")
        ) {
          mimeType = "audio/mp4;codecs=mp4a.40.2";
        } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
          mimeType = "audio/mp4";
        }

        mediaRecorderRef.current = mimeType
          ? new MediaRecorder(stream, { mimeType })
          : new MediaRecorder(stream);

        // Store the actual MIME type negotiated by the browser (critical for iOS)
        mimeTypeRef.current =
          mediaRecorderRef.current.mimeType || mimeType || "audio/mp4";
        // Persist so crash recovery on next mount uses the correct format
        try { localStorage.setItem("audioRecorderMimeType", mimeTypeRef.current); } catch (e) {}

        mediaRecorderRef.current.ondataavailable = async (event) => {
          if (event.data.size > 0) {
            if (dbRef.current) {
              // Primary storage: IndexedDB only — avoids doubling memory usage
              // on long recordings (critical on iOS where RAM is limited).
              pendingWritesRef.current++;
              try {
                await saveChunkToDB(dbRef.current, event.data);
              } catch (e) {
                console.error(
                  "Failed to save chunk to IndexedDB, keeping in memory",
                  e,
                );
                // Fallback: keep in memory if DB write fails
                audioChunksRef.current.push(event.data);
              } finally {
                pendingWritesRef.current--;
              }
            } else {
              // No DB available (e.g. private browsing on iOS): memory only
              audioChunksRef.current.push(event.data);
            }
          }
        };

        // SHARED stop handler
        mediaRecorderRef.current.onstop = async () => {
          // On iOS, ondataavailable from the final requestData() call fires
          // AFTER onstop. Without this delay the pendingWritesRef counter is
          // still 0 when the loop below runs, so chunks are missed entirely.
          if (isIOS) {
            await new Promise((r) => setTimeout(r, 500));
          }
          // Wait for any pending async writes to complete
          let retryCount = 0;
          while (pendingWritesRef.current > 0 && retryCount < 20) {
            await new Promise((r) => setTimeout(r, 100));
            retryCount++;
          }

          const file = await buildAndSendFile();

          // If there is a pending promise from stopAndFinalize, resolve it
          if (stopResolveRef.current) {
            stopResolveRef.current(file);
            stopResolveRef.current = null;
          }

          // Skip onReady when stop() was triggered by iOS soft-pause —
          // the recording isn't finished yet, just mid-session paused.
          if (!iosPauseRef.current && onReady && file) {
            onReady(file, null);
          }
          iosPauseRef.current = false;
        };

        mediaRecorderRef.current.onerror = (event) => {
          console.error("MediaRecorder error:", event.error);
          setError("Recording interrupted. Please try again.");
          setIsRecording(false);
        };

        audioContextRef.current = new (
          window.AudioContext || window.webkitAudioContext
        )();

        if (audioContextRef.current.state === "suspended") {
          await audioContextRef.current.resume();
        }

        const source = audioContextRef.current.createMediaStreamSource(stream);

        const highpass = audioContextRef.current.createBiquadFilter();
        highpass.type = "highpass";
        highpass.frequency.value = 100;

        const compressor = audioContextRef.current.createDynamicsCompressor();
        compressor.threshold.setValueAtTime(
          -50,
          audioContextRef.current.currentTime,
        );
        compressor.knee.setValueAtTime(40, audioContextRef.current.currentTime);
        compressor.ratio.setValueAtTime(
          12,
          audioContextRef.current.currentTime,
        );
        compressor.attack.setValueAtTime(
          0,
          audioContextRef.current.currentTime,
        );
        compressor.release.setValueAtTime(
          0.25,
          audioContextRef.current.currentTime,
        );

        const gainNode = audioContextRef.current.createGain();
        gainNode.gain.value = 1.2;

        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 256;

        source.connect(highpass);
        highpass.connect(compressor);
        compressor.connect(gainNode);
        gainNode.connect(analyserRef.current);

        drawVisualizer();
        handleStart();

        // ── iOS AudioContext interruption (phone call, Siri, alarm, etc.) ────
        // iOS fires "interrupted" on the AudioContext BEFORE the page is
        // hidden — this is the earliest possible signal to flush and pause.
        audioContextRef.current.onstatechange = () => {
          if (audioContextRef.current?.state === "interrupted") {
            handleAutoInterrupt();
          }
        };

        // ── Visibility change (tab hidden / shown) ────────────────────────────
        const handleVisibilityChange = () => {
          if (document.visibilityState === "hidden") {
            // Phone call / app switch — auto-pause and flush to IndexedDB.
            handleAutoInterrupt();
          } else if (document.visibilityState === "visible") {
            // User returned after call ended.
            // Resume a suspended AudioContext (iOS suspends it during a call).
            if (audioContextRef.current?.state === "suspended") {
              audioContextRef.current.resume().catch(() => {});
            }
            // Safety net: if the recorder died silently (no onstatechange /
            // onerror fired), make sure the UI reflects reality so the user
            // can tap Resume.
            if (
              isRecordingRef.current &&
              mediaRecorderRef.current?.state !== "recording" &&
              mediaRecorderRef.current?.state !== "paused"
            ) {
              setIsRecording(false);
              setWarn(
                "Recording was interrupted. Tap Resume to continue — your audio will be combined.",
              );
            }
          }
        };
        // Store the handler in a ref so the useEffect cleanup can remove it.
        // (The `return` inside an async function is NOT the useEffect cleanup.)
        visibilityHandlerRef.current = handleVisibilityChange;
        document.addEventListener("visibilitychange", handleVisibilityChange);
      } catch (err) {
        console.error(err);
        setError("Microphone access denied or unavailable.");
      }
    };

    const setupDB = async () => {
      try {
        dbRef.current = await initDB();
        const existingChunks = await getAllChunksFromDB(dbRef.current);
        if (existingChunks && existingChunks.length > 0) {
          console.log("Unsaved audio found, recovering...");
          await buildAndSendFile();
        }
      } catch (e) {
        console.error("IndexedDB initialization failed", e);
      }
    };

    // Await DB init before starting the recorder so ondataavailable
    // always has a valid dbRef and chunks go to IndexedDB from the first one.
    setupDB().then(() => initRecording());

    return () => {
      // Stop the recorder if still active
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        mediaRecorderRef.current.stop();
      }
      // Cancel pending timers/intervals
      cancelAnimationFrame(animationRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
      if (requestDataIntervalRef.current) clearInterval(requestDataIntervalRef.current);
      if (maxDurationTimerRef.current) clearTimeout(maxDurationTimerRef.current);
      if (previewBuildTimeoutRef.current) clearTimeout(previewBuildTimeoutRef.current);
      // Remove visibility listener stored by initRecording
      if (visibilityHandlerRef.current) {
        document.removeEventListener("visibilitychange", visibilityHandlerRef.current);
      }
      // Revoke any active preview blob URL to free memory
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
      // Close AudioContext last (after recorder is stopped)
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  // Keep ref in sync so event handler closures always read the current value
  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setDuration((d) => d + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  const formatDuration = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return [h, m, s]
      .map((v) => (v < 10 ? "0" + v : v))
      .filter((v, i) => v !== "00" || i > 0)
      .join(":");
  };

  // const buildAndSendFile = () => {
  //   if (audioChunksRef.current.length === 0) return;

  //   const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
  //   const file = new File([audioBlob], "recording.webm", {
  //     type: "audio/webm",
  //   });

  //   // update preview
  //   const url = URL.createObjectURL(audioBlob);
  //   setPreviewUrl(url);

  //   // send file to parent
  //   if (onReady) onReady(file);
  // };

  const buildAndSendFile = async () => {
    // Prevent two concurrent calls from racing on URL revocation / state updates
    if (isBuildingFileRef.current) return null;
    isBuildingFileRef.current = true;

    try {
      // Wait for any pending async writes to complete (max 2 seconds)
      let retryCount = 0;
      while (pendingWritesRef.current > 0 && retryCount < 20) {
        await new Promise((r) => setTimeout(r, 100));
        retryCount++;
      }

      let chunks = audioChunksRef.current;

      if (dbRef.current) {
        try {
          const dbChunks = await getAllChunksFromDB(dbRef.current);
          if (dbChunks && dbChunks.length > 0) {
            chunks = dbChunks;
          }
        } catch (e) {
          console.error("Failed to get chunks from IndexedDB", e);
        }
      }

      if (chunks.length === 0) return null;

      // Use the MIME type that the MediaRecorder instance actually negotiated.
      // Re-detecting here can produce a different type (e.g. webm on a device
      // that recorded mp4), which corrupts the blob on iOS.
      // Fall back to localStorage for crash recovery when mimeTypeRef is empty.
      const usedMimeType =
        mimeTypeRef.current ||
        (() => { try { return localStorage.getItem("audioRecorderMimeType"); } catch (e) { return null; } })() ||
        "audio/mp4";
      const extension = usedMimeType.includes("webm") ? "webm" : "m4a";
      const cleanMimeType = usedMimeType.includes("mp4") ? "audio/mp4" : "audio/webm";

      const audioBlob = new Blob(chunks, { type: cleanMimeType });

      const file = new File([audioBlob], `recording.${extension}`, {
        type: cleanMimeType,
      });

      // Cleanup old URL
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }

      const url = URL.createObjectURL(audioBlob);
      previewUrlRef.current = url;
      setPreviewUrl(url);
      setPreviewMimeType(cleanMimeType);

      return file;
    } finally {
      // Always clear the processing spinner — covers both the success path and
      // the empty-chunks early-return (where the try block exits before reaching
      // the old setIsProcessing(false) call, leaving the spinner on screen forever).
      setIsProcessing(false);
      isBuildingFileRef.current = false;
    }
  };

  const drawVisualizer = () => {
    const canvas = canvasRef.current;
    if (!canvas || !analyserRef.current) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      if (!analyserRef.current) return;
      analyserRef.current.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = dataArray[i];
        ctx.fillStyle = `rgba(100, 180, 255, 0.9)`;
        ctx.fillRect(x, canvas.height - barHeight / 2, barWidth, barHeight / 2);
        x += barWidth + 1;
      }
    };

    draw();
  };

  // Called automatically when a phone call / Siri / alarm interrupts the session.
  // Flushes buffered audio to IndexedDB, pauses the recorder (non-iOS),
  // and updates the UI so the user knows they can tap Resume to continue.
  const handleAutoInterrupt = () => {
    if (!isRecordingRef.current) return;

    if (mediaRecorderRef.current?.state === "recording") {
      // Flush current buffer so nothing is lost
      try {
        mediaRecorderRef.current.requestData();
      } catch (e) {}

      // Pause where supported (Android / Desktop); iOS will throw but
      // the OS kills the recorder anyway — the flush above is enough.
      if (!isIOS) {
        try {
          mediaRecorderRef.current.pause();
          if (requestDataIntervalRef.current) {
            clearInterval(requestDataIntervalRef.current);
            requestDataIntervalRef.current = null;
          }
        } catch (e) {}
      }
    }

    setIsRecording(false);
    setWarn(
      "Recording paused — phone call detected. Tap Resume to continue recording from where you left off.",
    );
  };

  const handleStart = async () => {
    if (mediaRecorderRef.current) {
      audioChunksRef.current = [];
      if (dbRef.current) await clearDB(dbRef.current);
      setDuration(0);
      setWarn("");
      setError("");

      if (isIOS) {
        // iOS Safari ignores the timeslice argument and may never fire
        // ondataavailable until stop(). We start without a timeslice and
        // manually call requestData() every 5 s to flush chunks periodically.
        mediaRecorderRef.current.start();
        requestDataIntervalRef.current = setInterval(() => {
          if (mediaRecorderRef.current?.state === "recording") {
            try {
              mediaRecorderRef.current.requestData();
            } catch (e) {
              console.warn("requestData failed on iOS", e);
            }
          }
        }, 5000);
      } else {
        mediaRecorderRef.current.start(5000); // 5 s timeslice for periodic saving
      }

      setIsRecording(true);
    }

    const MAX_DURATION = 120 * 60 * 1000;
    // const MAX_DURATION = 10000;

    maxDurationTimerRef.current = setTimeout(() => {
      maxDurationTimerRef.current = null;
      if (mediaRecorderRef.current?.state === "recording") {
        if (requestDataIntervalRef.current) {
          clearInterval(requestDataIntervalRef.current);
          requestDataIntervalRef.current = null;
        }
        mediaRecorderRef.current.requestData();
        mediaRecorderRef.current.stop();
        setIsRecording(false);
      }
    }, MAX_DURATION);
  };

  const handlePause = async () => {
    if (mediaRecorderRef.current?.state === "recording") {
      if (isIOS) {
        // iOS Safari doesn't support pause(). We simulate it by stopping the
        // recorder — all chunks are saved to IndexedDB. On Resume a fresh
        // recorder starts and appends new chunks so buildAndSendFile()
        // combines everything into one seamless file.
        iosPauseRef.current = true;
        if (requestDataIntervalRef.current) {
          clearInterval(requestDataIntervalRef.current);
          requestDataIntervalRef.current = null;
        }
        try {
          mediaRecorderRef.current.requestData();
        } catch (e) {}
        mediaRecorderRef.current.stop();
        setIsRecording(false);
        return;
      }

      try {
        mediaRecorderRef.current.pause();
        setIsRecording(false);
        mediaRecorderRef.current.requestData();

        // Stop the manual requestData interval while paused
        if (requestDataIntervalRef.current) {
          clearInterval(requestDataIntervalRef.current);
          requestDataIntervalRef.current = null;
        }

        // Build preview file shortly after pause so user can play it back.
        // Use a ref so stopAndFinalize can cancel this if Stop is tapped fast.
        if (previewBuildTimeoutRef.current) clearTimeout(previewBuildTimeoutRef.current);
        previewBuildTimeoutRef.current = setTimeout(async () => {
          previewBuildTimeoutRef.current = null;
          await buildAndSendFile();
        }, 200);
      } catch (e) {
        console.error("Pause failed", e);
        setError("Pause is not supported on this device.");
      }
    }
  };

  // Restarts the MediaRecorder after the OS killed it (e.g. iOS during a call).
  // Crucially does NOT clear IndexedDB — new chunks are appended alongside the
  // pre-call chunks, so buildAndSendFile() returns one combined audio file.
  const restartRecorderAfterInterrupt = async () => {
    try {
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
      } catch (e) {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      }

      const mt = mimeTypeRef.current;
      const newRecorder = mt
        ? new MediaRecorder(stream, { mimeType: mt })
        : new MediaRecorder(stream);
      mediaRecorderRef.current = newRecorder;

      // Re-attach the same handlers — DB is NOT cleared, so new chunks
      // are appended to old ones automatically.
      newRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          if (dbRef.current) {
            pendingWritesRef.current++;
            try {
              await saveChunkToDB(dbRef.current, event.data);
            } catch (e) {
              audioChunksRef.current.push(event.data);
            } finally {
              pendingWritesRef.current--;
            }
          } else {
            audioChunksRef.current.push(event.data);
          }
        }
      };

      newRecorder.onstop = async () => {
        // Same iOS timing fix: ondataavailable fires after onstop on iOS.
        if (isIOS) {
          await new Promise((r) => setTimeout(r, 500));
        }
        let retries = 0;
        while (pendingWritesRef.current > 0 && retries < 20) {
          await new Promise((r) => setTimeout(r, 100));
          retries++;
        }
        const file = await buildAndSendFile();
        if (stopResolveRef.current) {
          stopResolveRef.current(file);
          stopResolveRef.current = null;
        }
        if (!iosPauseRef.current && onReady && file) onReady(file, null);
        iosPauseRef.current = false;
      };

      newRecorder.onerror = () => {
        setError("Recording interrupted. Please try again.");
        setIsRecording(false);
      };

      // Start WITHOUT clearing DB
      if (isIOS) {
        newRecorder.start();
        requestDataIntervalRef.current = setInterval(() => {
          if (mediaRecorderRef.current?.state === "recording") {
            try {
              mediaRecorderRef.current.requestData();
            } catch (e) {}
          }
        }, 5000);
      } else {
        newRecorder.start(5000);
      }

      setIsRecording(true);
      setWarn(
        "Continuing — new audio will be merged with your previous recording.",
      );
    } catch (e) {
      console.error("Failed to restart recorder after interrupt", e);
      setError(
        "Could not restart recording after the call. Your saved audio is available below.",
      );
    }
  };

  const handleResume = async () => {
    try {
      if (mediaRecorderRef.current?.state === "paused") {
        if (audioContextRef.current?.state === "suspended") {
          await audioContextRef.current.resume();
        }
        mediaRecorderRef.current.resume();
        setIsRecording(true);

        // Restart periodic requestData interval for iOS after resume
        if (isIOS && !requestDataIntervalRef.current) {
          requestDataIntervalRef.current = setInterval(() => {
            if (mediaRecorderRef.current?.state === "recording") {
              try {
                mediaRecorderRef.current.requestData();
              } catch (e) {
                console.warn("requestData failed on iOS", e);
              }
            }
          }, 5000);
        }
      } else if (
        mediaRecorderRef.current?.state === "inactive" ||
        !mediaRecorderRef.current
      ) {
        // Recorder was killed by the OS (e.g. iOS during a phone call).
        // Restart it WITHOUT clearing IndexedDB so pre-call + post-call
        // audio are combined into one file by buildAndSendFile().
        await restartRecorderAfterInterrupt();
      }
    } catch (e) {
      console.error("Resume failed", e);
      setError("Failed to resume recording after interrupt.");
    }
  };

  const stopAndFinalize = () => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current) return resolve(null);

      // Cancel any pending preview-build timeout from a non-iOS pause
      if (previewBuildTimeoutRef.current) {
        clearTimeout(previewBuildTimeoutRef.current);
        previewBuildTimeoutRef.current = null;
      }

      // Clear the iOS periodic flush interval before stopping
      if (requestDataIntervalRef.current) {
        clearInterval(requestDataIntervalRef.current);
        requestDataIntervalRef.current = null;
      }

      // If the user paused on iOS (soft-pause) and then taps Stop without
      // resuming, iosPauseRef is still true. Clear it so onstop will call
      // onReady() and deliver the final file to the parent.
      iosPauseRef.current = false;

      if (mediaRecorderRef.current.state !== "inactive") {
        setIsProcessing(true);
        stopResolveRef.current = resolve;
        mediaRecorderRef.current.requestData();
        mediaRecorderRef.current.stop();
      } else {
        // Recorder already inactive (e.g. iOS soft-pause left it stopped).
        // Build the file from whatever is in IndexedDB and resolve.
        buildAndSendFile().then((file) => resolve(file));
      }
    });
  };
  // expose it to parent
  useEffect(() => {
    if (onReady) {
      onReady(null, stopAndFinalize);
    }
  }, []);

  return (
    <div className="my-3">
      {error && <Alert color="danger">{error}</Alert>}
      {warn && !error && (
        <Alert color="warning" toggle={() => setWarn("")}>
          {warn}
        </Alert>
      )}

      <div className="d-flex gap-2 mb-2">
        <Button
          color="warning"
          type="button"
          onClick={handlePause}
          disabled={!isRecording || !!error}
        >
          Pause
        </Button>
        <Button
          color="success"
          type="button"
          onClick={handleResume}
          disabled={isRecording || !!error}
        >
          Resume
        </Button>
      </div>

      <canvas
        ref={canvasRef}
        width={400}
        height={100}
        style={{
          background: "transparent",
          borderRadius: "8px",
          width: "100%",
          display: isRecording ? "block" : "none",
        }}
      />

      {isProcessing && (
        <Alert color="info" className="d-flex align-items-center gap-3">
          <Spinner size="sm" color="primary" />
          <span>Finalizing audio recording... Please wait.</span>
        </Alert>
      )}

      {isRecording && (
        <div className="d-flex align-items-center gap-2 mb-2">
          <div
            className="bg-danger rounded-circle pulse"
            style={{ width: "12px", height: "12px" }}
          ></div>
          <span className="fw-bold text-danger">
            Recording: {formatDuration(duration)}
          </span>
        </div>
      )}

      {duration > 1800 && isRecording && (
        <Alert color="warning" className="py-2 small">
          <i className="ri-error-warning-line me-2"></i>
          Large recordings (over 30 mins) consume significant browser memory.
          Consider saving and starting a new note for very long sessions.
        </Alert>
      )}

      {previewUrl && !isRecording && (
        <audio
          key={previewUrl}
          controls
          preload="metadata"
          style={{ marginTop: "10px", width: "100%" }}
        >
          <source src={previewUrl} type={previewMimeType} />
          Your browser does not support the audio element.
        </audio>
      )}
    </div>
  );
};

export default AudioRecorder;
