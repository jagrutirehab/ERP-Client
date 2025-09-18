/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, useRef } from "react";
import { Button, Alert } from "reactstrap";

const AudioRecorder = ({ onReady }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
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

        mediaRecorderRef.current = new MediaRecorder(stream);

        mediaRecorderRef.current.ondataavailable = (event) => {
          if (event.data.size > 0) audioChunksRef.current.push(event.data);
        };

        // create File when stopped
        mediaRecorderRef.current.onstop = () => {
          buildAndSendFile();
        };

        audioContextRef.current = new (window.AudioContext ||
          window.webkitAudioContext)();
        const source = audioContextRef.current.createMediaStreamSource(stream);

        const highpass = audioContextRef.current.createBiquadFilter();
        highpass.type = "highpass";
        highpass.frequency.value = 100;

        const compressor = audioContextRef.current.createDynamicsCompressor();
        compressor.threshold.setValueAtTime(
          -50,
          audioContextRef.current.currentTime
        );
        compressor.knee.setValueAtTime(40, audioContextRef.current.currentTime);
        compressor.ratio.setValueAtTime(
          12,
          audioContextRef.current.currentTime
        );
        compressor.attack.setValueAtTime(
          0,
          audioContextRef.current.currentTime
        );
        compressor.release.setValueAtTime(
          0.25,
          audioContextRef.current.currentTime
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
    };
  }, []);

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

  const buildAndSendFile = () => {
    if (audioChunksRef.current.length === 0) return null;

    const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
    const file = new File([audioBlob], "recording.webm", {
      type: "audio/webm",
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

  const handleStart = () => {
    if (mediaRecorderRef.current) {
      audioChunksRef.current = [];
      mediaRecorderRef.current.start();
      setIsRecording(true);
    }
  };

  const handlePause = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.pause();
      setIsRecording(false);
      mediaRecorderRef.current.requestData();

      // immediately build file on pause
      setTimeout(() => {
        buildAndSendFile();
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
        mediaRecorderRef.current.onstop = () => {
          const file = buildAndSendFile();
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
          Pause & Preview
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

      {previewUrl && !isRecording && (
        <audio
          controls
          autoPlay
          src={previewUrl}
          style={{ marginTop: "10px" }}
        />
      )}
    </div>
  );
};

export default AudioRecorder;
