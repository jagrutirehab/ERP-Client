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
import { Button, Alert } from "reactstrap";

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

const AudioRecorder = ({ onReady }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [duration, setDuration] = useState(0);

  const mediaRecorderRef = useRef(null);
  const timerRef = useRef(null);
  const audioChunksRef = useRef([]); // Fallback
  const dbRef = useRef(null);
  const canvasRef = useRef(null);
  const analyserRef = useRef(null);
  const audioContextRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const initRecording = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const hasMic = devices.some((d) => d.kind === "audioinput");
        if (!hasMic) {
          setError("No microphone detected.");
          return;
        }
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });

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

        mediaRecorderRef.current.ondataavailable = async (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
            if (dbRef.current) {
              try {
                await saveChunkToDB(dbRef.current, event.data);
              } catch (e) {
                console.error("Failed to save chunk to IndexedDB", e);
              }
            }
          }
        };

        // create File when stopped
        mediaRecorderRef.current.onstop = async () => {
          const file = await buildAndSendFile();

          if (onReady && file) {
            onReady(file, null);
          }
          if (dbRef.current) {
            await clearDB(dbRef.current);
          }
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

    setupDB();
    initRecording();

    return () => {
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        mediaRecorderRef.current.stop();
      }
      cancelAnimationFrame(animationRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

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

    let mimeType = "";

    if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
      mimeType = "audio/webm;codecs=opus";
    } else if (MediaRecorder.isTypeSupported("audio/webm")) {
      mimeType = "audio/webm";
    } else if (MediaRecorder.isTypeSupported("audio/mp4;codecs=mp4a.40.2")) {
      mimeType = "audio/mp4;codecs=mp4a.40.2";
    } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
      mimeType = "audio/mp4";
    } else {
      mimeType = "audio/mp4";
    }

    const extension = mimeType.includes("webm") ? "webm" : "m4a";

    const audioBlob = new Blob(chunks, { type: mimeType });

    const file = new File([audioBlob], `recording.${extension}`, {
      type: mimeType,
    });

    const url = URL.createObjectURL(audioBlob);
    setPreviewUrl(url);

    return file;
  };

  const drawVisualizer = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
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

  const handleStart = async () => {
    if (mediaRecorderRef.current) {
      audioChunksRef.current = [];
      if (dbRef.current) await clearDB(dbRef.current);
      setDuration(0);
      mediaRecorderRef.current.start();
      setIsRecording(true);
    }

    const MAX_DURATION = 120 * 60 * 1000;
    // const MAX_DURATION = 10000;

    setTimeout(() => {
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.requestData();
        mediaRecorderRef.current.stop();
        setIsRecording(false);
      }
    }, MAX_DURATION);
  };

  const handlePause = async () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.pause();
      setIsRecording(false);
      mediaRecorderRef.current.requestData();

      // immediately build file on pause
      setTimeout(async () => {
        await buildAndSendFile();
      }, 200);
    }
  };

  const handleResume = async () => {
    if (mediaRecorderRef.current?.state === "paused") {
      if (audioContextRef.current?.state === "suspended") {
        await audioContextRef.current.resume();
      }
      mediaRecorderRef.current.resume();
      setIsRecording(true);
    }
  };

  const stopAndFinalize = () => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current) return resolve(null);

      if (mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.requestData(); // VERY IMPORTANT

        mediaRecorderRef.current.onstop = async () => {
          const file = await buildAndSendFile();
          resolve(file);
        };

        mediaRecorderRef.current.stop();
      } else {
        resolve(null);
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

      <div className="d-flex gap-2 mb-2">
        <Button
          color="warning"
          onClick={handlePause}
          disabled={!isRecording || !!error}
        >
          Pause
        </Button>
        <Button
          color="success"
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
          controls
          // autoPlay
          src={previewUrl}
          style={{ marginTop: "10px" }}
        />
      )}
    </div>
  );
};

export default AudioRecorder;
