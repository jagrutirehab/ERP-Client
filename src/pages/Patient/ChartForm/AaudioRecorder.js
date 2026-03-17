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
  // iOS multi-chunk: each paused session is saved as a separate File
  const [iosCompletedChunks, setIosCompletedChunks] = useState([]); // [{url, mimeType, label}] for UI
  const iosCompletedFilesRef = useRef([]); // File[] accumulated across pause/resume sessions
  const iosChunkUrlsRef = useRef([]); // blob URLs created for each chunk (revoked on unmount)
  // iOS auto-chunk: timer fires every N minutes to save + seamlessly restart
  const streamRef = useRef(null); // active mic stream — reused for auto-chunk restarts
  const iosAutoChunkIntervalRef = useRef(null); // setInterval handle for the auto-chunk timer
  const iosAutoChunkRef = useRef(false); // true when onstop was triggered by auto-chunk timer
  // Handler refs — stored so every recorder instance (initial + auto-chunk restarts) shares the same logic
  const onDataAvailableHandlerRef = useRef(null);
  const onStopHandlerRef = useRef(null);
  // Set to true by stopAndFinalize so any pending onstop skips the iOS "pause" path and goes
  // straight to the "final stop" path — prevents double-onReady and missing-data bugs
  const isFinalizingRef = useRef(false);
  // Caches the last File/File[] delivered by buildAndSendFile so stopAndFinalize's
  // fallback can resolve without rebuilding (prevents double-onReady after auto-stop)
  const lastBuiltFileRef = useRef(null);

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

        // Store stream so auto-chunk restarts can reuse it without a new getUserMedia call
        streamRef.current = stream;

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

        // Named handler stored in ref so every recorder instance (initial + auto-chunk
        // restarts + interrupt restarts) shares exactly the same logic.
        const dataAvailableHandler = async (event) => {
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
        onDataAvailableHandlerRef.current = dataAvailableHandler;
        mediaRecorderRef.current.ondataavailable = dataAvailableHandler;

        // SHARED stop handler — stored in ref so new recorder instances can reuse it
        const stopHandler = async () => {
          if (isIOS) {
            await new Promise((r) => setTimeout(r, 500));
          }
          let retryCount = 0;
          while (pendingWritesRef.current > 0 && retryCount < 20) {
            await new Promise((r) => setTimeout(r, 100));
            retryCount++;
          }

          if (isIOS && iosPauseRef.current && !isFinalizingRef.current) {
            // iOS soft-pause (manual or auto-chunk): save this session as its own chunk
            const result = await buildIosChunkFile();
            iosPauseRef.current = false;
            if (result) {
              const partNumber = iosCompletedFilesRef.current.length + 1;
              iosCompletedFilesRef.current.push(result.file);
              iosChunkUrlsRef.current.push(result.url);
              setIosCompletedChunks((prev) => [
                ...prev,
                { url: result.url, mimeType: result.mimeType, label: `Part ${partNumber}` },
              ]);
            }

            if (iosAutoChunkRef.current) {
              // Auto-chunk: seamlessly restart recording from the same stream
              iosAutoChunkRef.current = false;
              const activeStream = streamRef.current;
              if (activeStream?.active) {
                const mt = mimeTypeRef.current;
                const newRec = mt
                  ? new MediaRecorder(activeStream, { mimeType: mt })
                  : new MediaRecorder(activeStream);
                mediaRecorderRef.current = newRec;
                newRec.ondataavailable = onDataAvailableHandlerRef.current;
                newRec.onstop = onStopHandlerRef.current; // ref is populated below
                newRec.onerror = () => {
                  setError("Recording interrupted. Please try again.");
                  setIsRecording(false);
                };
                newRec.start();
                // setIsRecording stays true — user sees no interruption
              }
            }

            if (stopResolveRef.current) {
              stopResolveRef.current(null);
              stopResolveRef.current = null;
            }
            return; // don't call onReady yet — user can resume to add more parts
          }

          // Final stop
          let fileOrFiles;
          if (isIOS && iosCompletedFilesRef.current.length > 0) {
            // iOS final stop with previously saved chunks — save last chunk too, return whole array
            const result = await buildIosChunkFile();
            if (result) {
              const partNumber = iosCompletedFilesRef.current.length + 1;
              iosCompletedFilesRef.current.push(result.file);
              iosChunkUrlsRef.current.push(result.url);
              setIosCompletedChunks((prev) => [
                ...prev,
                { url: result.url, mimeType: result.mimeType, label: `Part ${partNumber}` },
              ]);
            }
            fileOrFiles = iosCompletedFilesRef.current.slice();
          } else {
            // Normal path: single file (non-iOS, or iOS with no previous paused chunks)
            fileOrFiles = await buildAndSendFile();
          }

          if (stopResolveRef.current) {
            stopResolveRef.current(fileOrFiles);
            stopResolveRef.current = null;
          }
          if (onReady && fileOrFiles) {
            onReady(fileOrFiles, null);
          }
          // Ensure spinner is cleared — buildIosChunkFile (iOS multi-chunk path) doesn't do this
          setIsProcessing(false);
          iosPauseRef.current = false;
          isFinalizingRef.current = false;
        };
        onStopHandlerRef.current = stopHandler;
        mediaRecorderRef.current.onstop = stopHandler;

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
        audioContextRef.current.onstatechange = () => {
          if (audioContextRef.current?.state === "interrupted") {
            handleAutoInterrupt();
          }
        };
        const handleVisibilityChange = () => {
          if (document.visibilityState === "hidden") {
            handleAutoInterrupt();
          } else if (document.visibilityState === "visible") {
            if (audioContextRef.current?.state === "suspended") {
              audioContextRef.current.resume().catch(() => {});
            }
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
    setupDB().then(() => initRecording());

    return () => {
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        mediaRecorderRef.current.stop();
      }
      cancelAnimationFrame(animationRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
      if (requestDataIntervalRef.current) clearInterval(requestDataIntervalRef.current);
      if (iosAutoChunkIntervalRef.current) clearInterval(iosAutoChunkIntervalRef.current);
      if (maxDurationTimerRef.current) clearTimeout(maxDurationTimerRef.current);
      if (previewBuildTimeoutRef.current) clearTimeout(previewBuildTimeoutRef.current);
      if (visibilityHandlerRef.current) {
        document.removeEventListener("visibilitychange", visibilityHandlerRef.current);
      }
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
      iosChunkUrlsRef.current.forEach((u) => URL.revokeObjectURL(u));
      // Release the microphone — stops the OS-level mic indicator
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);
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

  const buildAndSendFile = async () => {
    if (isBuildingFileRef.current) return null;
    isBuildingFileRef.current = true;

    try {
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
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }

      const url = URL.createObjectURL(audioBlob);
      previewUrlRef.current = url;
      setPreviewUrl(url);
      setPreviewMimeType(cleanMimeType);

      lastBuiltFileRef.current = file;
      return file;
    } finally {
      setIsProcessing(false);
      isBuildingFileRef.current = false;
    }
  };

  // iOS-only: build a File from the current DB/memory chunks and clear storage for the next chunk.
  // Unlike buildAndSendFile, this does NOT update previewUrl — each chunk is shown in the
  // iosCompletedChunks UI above the recorder.
  const buildIosChunkFile = async () => {
    if (isBuildingFileRef.current) return null;
    isBuildingFileRef.current = true;
    try {
    let retryCount = 0;
    while (pendingWritesRef.current > 0 && retryCount < 20) {
      await new Promise((r) => setTimeout(r, 100));
      retryCount++;
    }

    let chunks = audioChunksRef.current;
    if (dbRef.current) {
      try {
        const dbChunks = await getAllChunksFromDB(dbRef.current);
        if (dbChunks && dbChunks.length > 0) chunks = dbChunks;
      } catch (e) {
        console.error("buildIosChunkFile: failed to read IndexedDB", e);
      }
    }

    if (chunks.length === 0) return null;

    const usedMimeType =
      mimeTypeRef.current ||
      (() => { try { return localStorage.getItem("audioRecorderMimeType"); } catch (e) { return null; } })() ||
      "audio/mp4";
    const extension = usedMimeType.includes("webm") ? "webm" : "m4a";
    const cleanMimeType = usedMimeType.includes("mp4") ? "audio/mp4" : "audio/webm";

    const audioBlob = new Blob(chunks, { type: cleanMimeType });
    const file = new File([audioBlob], `recording.${extension}`, { type: cleanMimeType });
    const url = URL.createObjectURL(audioBlob);

    // Clear storage so the next recorded chunk starts fresh
    audioChunksRef.current = [];
    if (dbRef.current) {
      try { await clearDB(dbRef.current); } catch (e) {}
    }

    return { file, url, mimeType: cleanMimeType };
    } finally {
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
  const handleAutoInterrupt = () => {
    if (!isRecordingRef.current) return;

    if (mediaRecorderRef.current?.state === "recording") {
      try {
        mediaRecorderRef.current.requestData();
      } catch (e) {}
      if (!isIOS) {
        try {
          mediaRecorderRef.current.pause();
          if (requestDataIntervalRef.current) {
            clearInterval(requestDataIntervalRef.current);
            requestDataIntervalRef.current = null;
          }
        } catch (e) {}
      } else {
        // iOS doesn't support pause(). Treat this like an iOS soft-pause:
        // save the pre-interrupt audio as a chunk so the user can continue after the call.
        // onstop will run the iOS pause path → buildIosChunkFile → no premature onReady.
        iosPauseRef.current = true;
        try { mediaRecorderRef.current.stop(); } catch (e) {}
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
      // Clear any previously accumulated iOS chunks so a fresh recording starts clean
      if (isIOS) {
        if (iosAutoChunkIntervalRef.current) {
          clearInterval(iosAutoChunkIntervalRef.current);
          iosAutoChunkIntervalRef.current = null;
        }
        iosChunkUrlsRef.current.forEach((u) => URL.revokeObjectURL(u));
        iosChunkUrlsRef.current = [];
        iosCompletedFilesRef.current = [];
        setIosCompletedChunks([]);
        isFinalizingRef.current = false;
        iosAutoChunkRef.current = false;
      }
      lastBuiltFileRef.current = null;

      if (isIOS) {
        mediaRecorderRef.current.start();
        // Auto-chunk every 5 minutes: save current audio as Part N and restart seamlessly.
        // Keeps each chunk small (~25 MB) so iOS never runs out of memory on long recordings.
        const AUTO_CHUNK_MS = 5 * 60 * 1000;
        iosAutoChunkIntervalRef.current = setInterval(() => {
          if (mediaRecorderRef.current?.state === "recording") {
            iosPauseRef.current = true;
            iosAutoChunkRef.current = true;
            try { mediaRecorderRef.current.requestData(); } catch (e) {}
            mediaRecorderRef.current.stop();
          }
        }, AUTO_CHUNK_MS);
      } else {
        mediaRecorderRef.current.start(5000);
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
        if (requestDataIntervalRef.current) {
          clearInterval(requestDataIntervalRef.current);
          requestDataIntervalRef.current = null;
        }
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
  const restartRecorderAfterInterrupt = async () => {
    try {
      // Stop old stream tracks to prevent mic leaks across pause/resume cycles
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      // Clear any stale soft-pause state from the interrupted session
      iosPauseRef.current = false;

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
      // Update streamRef so auto-chunk restarts use the new stream
      streamRef.current = stream;

      const mt = mimeTypeRef.current;
      const newRecorder = mt
        ? new MediaRecorder(stream, { mimeType: mt })
        : new MediaRecorder(stream);
      mediaRecorderRef.current = newRecorder;
      // Reuse the same handlers defined in initRecording — no duplication
      newRecorder.ondataavailable = onDataAvailableHandlerRef.current;
      newRecorder.onstop = onStopHandlerRef.current;
      newRecorder.onerror = () => {
        setError("Recording interrupted. Please try again.");
        setIsRecording(false);
      };
      if (isIOS) {
        newRecorder.start();
      } else {
        newRecorder.start(5000);
      }

      setIsRecording(true);
      setWarn(
        isIOS
          ? "Continuing — this session will be saved as a new audio part."
          : "Continuing — new audio will be merged with your previous recording.",
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
        if (audioContextRef.current?.state === "suspended" ||
            audioContextRef.current?.state === "interrupted") {
          await audioContextRef.current.resume();
        }
        mediaRecorderRef.current.resume();
        setIsRecording(true);
      } else if (
        mediaRecorderRef.current?.state === "inactive" ||
        !mediaRecorderRef.current
      ) {
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
      if (previewBuildTimeoutRef.current) {
        clearTimeout(previewBuildTimeoutRef.current);
        previewBuildTimeoutRef.current = null;
      }
      if (requestDataIntervalRef.current) {
        clearInterval(requestDataIntervalRef.current);
        requestDataIntervalRef.current = null;
      }
      if (iosAutoChunkIntervalRef.current) {
        clearInterval(iosAutoChunkIntervalRef.current);
        iosAutoChunkIntervalRef.current = null;
      }
      // Also cancel the 2-hour auto-stop so it can't fire after we've already finalized
      if (maxDurationTimerRef.current) {
        clearTimeout(maxDurationTimerRef.current);
        maxDurationTimerRef.current = null;
      }

      // Signal any pending onstop to skip the iOS "pause" path and go to "final stop".
      // This prevents: (a) double onReady, (b) missing data when auto-chunk fires at save time.
      // NOTE: intentionally do NOT reset iosPauseRef here — onstop reads it to route correctly.
      isFinalizingRef.current = true;
      const wasAutoChunking = iosAutoChunkRef.current;
      iosAutoChunkRef.current = false; // prevent any pending onstop from auto-restarting

      const recState = mediaRecorderRef.current.state;
      if (recState === "recording" || recState === "paused") {
        setIsProcessing(true);
        stopResolveRef.current = resolve;
        try { mediaRecorderRef.current.requestData(); } catch (e) {}
        try { mediaRecorderRef.current.stop(); } catch (e) {}
      } else {
        // Recorder already stopped (iOS soft-pause completed, or auto-chunk just fired)
        if (wasAutoChunking) {
          // Auto-chunk's onstop is still pending in the event queue.
          // isFinalizingRef=true will redirect it to the final-stop path.
          // Let it build the complete file list and resolve the promise.
          setIsProcessing(true);
          stopResolveRef.current = resolve;
        } else if (isIOS && iosPauseRef.current) {
          // iOS soft-pause's onstop is still pending (within the 500ms artificial delay).
          // iosPauseRef=true is the reliable indicator — onstop resets it on line 500 once done.
          // Always wait: isFinalizingRef=true will redirect onstop to the final-stop path,
          // which builds the last chunk, adds it to any prior chunks, and resolves/calls onReady.
          setIsProcessing(true);
          stopResolveRef.current = resolve;
        } else if (isIOS && iosCompletedFilesRef.current.length > 0) {
          // iosPauseRef was already cleared but we have completed chunks — deliver them
          const files = iosCompletedFilesRef.current.slice();
          isFinalizingRef.current = false;
          resolve(files);
          if (onReady && files.length > 0) onReady(files, null);
        } else {
          // Non-iOS inactive (unexpected) or iOS crash-recovery path.
          iosPauseRef.current = false;
          if (isBuildingFileRef.current) {
            // Build in-flight (onstop still running) — wait for it to resolve via stopResolveRef.
            setIsProcessing(true);
            stopResolveRef.current = resolve;
          } else if (lastBuiltFileRef.current) {
            // A file was already built and onReady already called (e.g. auto-stop fired).
            // Resolve with the cached file without a second onReady call.
            isFinalizingRef.current = false;
            resolve(lastBuiltFileRef.current);
          } else {
            buildAndSendFile().then((file) => {
              isFinalizingRef.current = false;
              resolve(file);
              if (onReady && file) onReady(file, null);
            });
          }
        }
      }
    });
  };
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

      {/* iOS only: show each paused chunk above the recorder as individual playable parts */}
      {isIOS && iosCompletedChunks.length > 0 && (
        <div className="mb-3">
          {iosCompletedChunks.map((chunk) => (
            <div key={chunk.url} className="mb-2">
              <small className="text-muted d-block mb-1 fw-semibold">
                {chunk.label}
              </small>
              <audio
                key={chunk.url}
                controls
                preload="metadata"
                style={{ width: "100%" }}
              >
                <source src={chunk.url} type={chunk.mimeType} />
                Your browser does not support the audio element.
              </audio>
            </div>
          ))}
        </div>
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
