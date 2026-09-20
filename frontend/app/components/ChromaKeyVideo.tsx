"use client";
import { useEffect, useRef, useState } from "react";

export default function ChromaKeyVideo({ maxHeight = 500 }: { maxHeight?: number }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    function processFrame() {
      if (!video || !canvas || !ctx) return;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const d = frame.data;
      for (let i = 0; i < d.length; i += 4) {
        const r = d[i], g = d[i + 1], b = d[i + 2];
        if (g > 100 && g > r * 1.4 && g > b * 1.4) d[i + 3] = 0;
      }
      ctx.putImageData(frame, 0, 0);
      rafRef.current = requestAnimationFrame(processFrame);
    }

    function onLoaded() {
      if (!video || !canvas) return;
      const vw = video.videoWidth, vh = video.videoHeight;
      const scale = maxHeight / vh;
      canvas.width = vw;
      canvas.height = vh;
      setSize({ w: Math.round(vw * scale), h: maxHeight });
      video.play().catch(() => {});
    }

    function onPlay() {
      cancelAnimationFrame(rafRef.current);
      processFrame();
    }

    video.addEventListener("loadedmetadata", onLoaded);
    video.addEventListener("play", onPlay);

    if (video.readyState >= 1) onLoaded();

    return () => {
      cancelAnimationFrame(rafRef.current);
      video.removeEventListener("loadedmetadata", onLoaded);
      video.removeEventListener("play", onPlay);
    };
  }, [maxHeight]);

  return (
    <>
      <video
        ref={videoRef}
        src="/bg.mp4"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        style={{ display: "none" }}
      />
      <canvas
        ref={canvasRef}
        style={{
          display: "block",
          width: size ? size.w : 0,
          height: size ? size.h : 0,
        }}
      />
    </>
  );
}
